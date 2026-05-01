import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Database } from 'bun:sqlite';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { initTestSessionDb, closeSessionDb, getInboundDb, getOutboundDb } from './db/connection.js';
import { getPendingMessages, markCompleted } from './db/messages-in.js';
import { getUndeliveredMessages } from './db/messages-out.js';
import { formatMessages, extractRouting } from './formatter.js';
import { MockProvider } from './providers/mock.js';
import { processQuery } from './poll-loop.js';

beforeEach(() => {
  initTestSessionDb();
});

afterEach(() => {
  closeSessionDb();
});

function insertMessage(id: string, kind: string, content: object, opts?: { processAfter?: string; trigger?: 0 | 1 }) {
  getInboundDb()
    .prepare(
      `INSERT INTO messages_in (id, kind, timestamp, status, process_after, trigger, content)
     VALUES (?, ?, datetime('now'), 'pending', ?, ?, ?)`,
    )
    .run(id, kind, opts?.processAfter ?? null, opts?.trigger ?? 1, JSON.stringify(content));
}

function createInboundDb(filePath: string, messages: Array<{ id: string; text: string }> = []) {
  const db = new Database(filePath);
  db.exec(`
    PRAGMA journal_mode = DELETE;
    CREATE TABLE messages_in (
      id             TEXT PRIMARY KEY,
      seq            INTEGER UNIQUE,
      kind           TEXT NOT NULL,
      timestamp      TEXT NOT NULL,
      status         TEXT DEFAULT 'pending',
      process_after  TEXT,
      recurrence     TEXT,
      series_id      TEXT,
      tries          INTEGER DEFAULT 0,
      trigger        INTEGER NOT NULL DEFAULT 1,
      platform_id    TEXT,
      channel_type   TEXT,
      thread_id      TEXT,
      content        TEXT NOT NULL
    );
  `);
  const stmt = db.prepare(
    `INSERT INTO messages_in (id, seq, kind, timestamp, status, trigger, content)
     VALUES (?, ?, 'chat', datetime('now'), 'pending', 1, ?)`,
  );
  messages.forEach((msg, index) => stmt.run(msg.id, index + 1, JSON.stringify({ text: msg.text })));
  db.close();
}

function createOutboundDb(filePath: string) {
  const db = new Database(filePath);
  db.exec(`
    PRAGMA journal_mode = DELETE;
    CREATE TABLE processing_ack (
      message_id     TEXT PRIMARY KEY,
      status         TEXT NOT NULL,
      status_changed TEXT NOT NULL
    );
  `);
  db.close();
}

describe('inbound DB visibility', () => {
  it('refreshes the read-only inbound handle before polling so warm containers see host-updated files', () => {
    closeSessionDb();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nanoclaw-inbound-refresh-'));
    const inboundPath = path.join(dir, 'inbound.db');
    const replacementPath = path.join(dir, 'inbound-replacement.db');
    const outboundPath = path.join(dir, 'outbound.db');
    const previousInbound = process.env.NANOCLAW_INBOUND_DB_PATH;
    const previousOutbound = process.env.NANOCLAW_OUTBOUND_DB_PATH;

    try {
      createInboundDb(inboundPath);
      createOutboundDb(outboundPath);
      process.env.NANOCLAW_INBOUND_DB_PATH = inboundPath;
      process.env.NANOCLAW_OUTBOUND_DB_PATH = outboundPath;

      expect(getPendingMessages()).toHaveLength(0);

      createInboundDb(replacementPath, [{ id: 'm-after-empty-poll', text: 'host wrote this after the warm reader was open' }]);
      fs.renameSync(replacementPath, inboundPath);

      const messages = getPendingMessages();
      expect(messages.map((m) => m.id)).toEqual(['m-after-empty-poll']);
    } finally {
      closeSessionDb();
      if (previousInbound === undefined) delete process.env.NANOCLAW_INBOUND_DB_PATH;
      else process.env.NANOCLAW_INBOUND_DB_PATH = previousInbound;
      if (previousOutbound === undefined) delete process.env.NANOCLAW_OUTBOUND_DB_PATH;
      else process.env.NANOCLAW_OUTBOUND_DB_PATH = previousOutbound;
      fs.rmSync(dir, { recursive: true, force: true });
      initTestSessionDb();
    }
  });
});

describe('formatter', () => {
  it('should format a single chat message', () => {
    insertMessage('m1', 'chat', { sender: 'John', text: 'Hello world' });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('sender="John"');
    expect(prompt).toContain('Hello world');
  });

  it('should format multiple chat messages as XML block', () => {
    insertMessage('m1', 'chat', { sender: 'John', text: 'Hello' });
    insertMessage('m2', 'chat', { sender: 'Jane', text: 'Hi there' });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('<messages>');
    expect(prompt).toContain('</messages>');
    expect(prompt).toContain('sender="John"');
    expect(prompt).toContain('sender="Jane"');
  });

  it('should format task messages', () => {
    insertMessage('m1', 'task', { prompt: 'Review open PRs' });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('[SCHEDULED TASK]');
    expect(prompt).toContain('Review open PRs');
  });

  it('should format webhook messages', () => {
    insertMessage('m1', 'webhook', { source: 'github', event: 'push', payload: { ref: 'main' } });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('[WEBHOOK: github/push]');
  });

  it('should format system messages', () => {
    insertMessage('m1', 'system', { action: 'register_group', status: 'success', result: { id: 'ag-1' } });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('[SYSTEM RESPONSE]');
    expect(prompt).toContain('register_group');
  });

  it('should handle mixed kinds', () => {
    insertMessage('m1', 'chat', { sender: 'John', text: 'Hello' });
    insertMessage('m2', 'system', { action: 'test', status: 'ok', result: null });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('sender="John"');
    expect(prompt).toContain('[SYSTEM RESPONSE]');
  });

  it('should escape XML in content', () => {
    insertMessage('m1', 'chat', { sender: 'A<B', text: 'x > y && z' });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('A&lt;B');
    expect(prompt).toContain('x &gt; y &amp;&amp; z');
  });
});

describe('accumulate gate (trigger column)', () => {
  it('getPendingMessages returns both trigger=0 and trigger=1 rows', () => {
    // trigger=0 rides along as context, trigger=1 is the wake-eligible row.
    // The poll loop's gate depends on this data contract.
    insertMessage('m1', 'chat', { sender: 'A', text: 'chit chat' }, { trigger: 0 });
    insertMessage('m2', 'chat', { sender: 'B', text: 'actual mention' }, { trigger: 1 });
    const messages = getPendingMessages();
    expect(messages).toHaveLength(2);
    const byId = Object.fromEntries(messages.map((m) => [m.id, m]));
    expect(byId.m1.trigger).toBe(0);
    expect(byId.m2.trigger).toBe(1);
  });

  it('trigger=0-only batch: gate predicate `some(trigger===1)` is false', () => {
    insertMessage('m1', 'chat', { sender: 'A', text: 'noise' }, { trigger: 0 });
    insertMessage('m2', 'chat', { sender: 'B', text: 'more noise' }, { trigger: 0 });
    const messages = getPendingMessages();
    // This is the exact predicate the poll loop uses to skip accumulate-only
    // batches — gate should be false, so the loop sleeps without waking the agent.
    expect(messages.some((m) => m.trigger === 1)).toBe(false);
  });

  it('mixed batch: gate is true → loop proceeds, accumulated rows ride along', () => {
    insertMessage('m1', 'chat', { sender: 'A', text: 'earlier chatter' }, { trigger: 0 });
    insertMessage('m2', 'chat', { sender: 'B', text: 'the real mention' }, { trigger: 1 });
    const messages = getPendingMessages();
    expect(messages.some((m) => m.trigger === 1)).toBe(true);
    // Both messages are present for the formatter → agent sees the prior context.
    expect(messages.map((m) => m.id).sort()).toEqual(['m1', 'm2']);
  });

  it('trigger column defaults to 1 for legacy inserts without explicit value', () => {
    // The schema default is 1 (see src/db/schema.ts INBOUND_SCHEMA) — existing
    // rows / tests without the column set are effectively wake-eligible.
    getInboundDb()
      .prepare(
        `INSERT INTO messages_in (id, kind, timestamp, status, content)
         VALUES ('m1', 'chat', datetime('now'), 'pending', '{"text":"hi"}')`,
      )
      .run();
    const [msg] = getPendingMessages();
    expect(msg.trigger).toBe(1);
  });
});

describe('routing', () => {
  it('should extract routing from messages', () => {
    getInboundDb()
      .prepare(
        `INSERT INTO messages_in (id, kind, timestamp, status, platform_id, channel_type, thread_id, content)
       VALUES ('m1', 'chat', datetime('now'), 'pending', 'chan-123', 'discord', 'thread-456', '{"text":"hi"}')`,
      )
      .run();

    const messages = getPendingMessages();
    const routing = extractRouting(messages);
    expect(routing.platformId).toBe('chan-123');
    expect(routing.channelType).toBe('discord');
    expect(routing.threadId).toBe('thread-456');
    expect(routing.inReplyTo).toBe('m1');
  });
});

describe('mock provider', () => {
  it('should produce init + result events', async () => {
    const provider = new MockProvider({}, (prompt) => `Echo: ${prompt}`);
    const query = provider.query({
      prompt: 'Hello',
      cwd: '/tmp',
    });

    const events: Array<{ type: string }> = [];
    setTimeout(() => query.end(), 50);

    for await (const event of query.events) {
      events.push(event);
    }

    const typed = events.filter((e) => e.type !== 'activity');
    expect(typed.length).toBeGreaterThanOrEqual(2);
    expect(typed[0].type).toBe('init');
    expect(typed[1].type).toBe('result');
    expect((typed[1] as { text: string }).text).toBe('Echo: Hello');
  });

  it('should handle push() during active query', async () => {
    const provider = new MockProvider({}, (prompt) => `Re: ${prompt}`);
    const query = provider.query({
      prompt: 'First',
      cwd: '/tmp',
    });

    const events: Array<{ type: string; text?: string }> = [];

    setTimeout(() => query.push('Second'), 30);
    setTimeout(() => query.end(), 60);

    for await (const event of query.events) {
      events.push(event);
    }

    const results = events.filter((e) => e.type === 'result');
    expect(results).toHaveLength(2);
    expect(results[0].text).toBe('Re: First');
    expect(results[1].text).toBe('Re: Second');
  });
});

describe('processQuery', () => {
  it('ends the provider query after a result so the outer DB poll loop can resume', async () => {
    insertMessage('m1', 'chat', { sender: 'User', text: 'Hello' });
    const messages = getPendingMessages();
    const routing = extractRouting(messages);
    const provider = new MockProvider({}, () => 'Done');
    const query = provider.query({ prompt: formatMessages(messages), cwd: '/tmp' });

    const outcome = await Promise.race([
      processQuery(query, routing, ['m1']).then(() => 'resolved'),
      new Promise<'timed-out'>((resolve) => setTimeout(() => resolve('timed-out'), 100)),
    ]);

    expect(outcome).toBe('resolved');
  });
});

describe('end-to-end with mock provider', () => {
  it('should read messages_in, process with mock provider, write messages_out', async () => {
    // Insert a chat message into inbound DB
    insertMessage('m1', 'chat', { sender: 'User', text: 'What is 2+2?' });

    // Read and process
    const messages = getPendingMessages();
    expect(messages).toHaveLength(1);

    const routing = extractRouting(messages);
    const prompt = formatMessages(messages);

    // Create mock provider and run query
    const provider = new MockProvider({}, () => 'The answer is 4');
    const query = provider.query({
      prompt,
      cwd: '/tmp',
    });

    // Process events — simulate what poll-loop does
    const { markProcessing } = await import('./db/messages-in.js');
    const { writeMessageOut } = await import('./db/messages-out.js');

    markProcessing(['m1']);

    setTimeout(() => query.end(), 50);

    for await (const event of query.events) {
      if (event.type === 'result' && event.text) {
        writeMessageOut({
          id: `out-${Date.now()}`,
          in_reply_to: routing.inReplyTo,
          kind: 'chat',
          platform_id: routing.platformId,
          channel_type: routing.channelType,
          thread_id: routing.threadId,
          content: JSON.stringify({ text: event.text }),
        });
      }
    }

    markCompleted(['m1']);

    // Verify: message was processed (not pending, acked in processing_ack)
    const processed = getPendingMessages();
    expect(processed).toHaveLength(0);

    // Verify: response was written to outbound DB
    const outMessages = getUndeliveredMessages();
    expect(outMessages).toHaveLength(1);
    expect(JSON.parse(outMessages[0].content).text).toBe('The answer is 4');
    expect(outMessages[0].in_reply_to).toBe('m1');
  });
});
