import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Adapter } from 'chat';

import { createChatSdkBridge, enrichAttachmentsForInbound, splitForLimit } from './chat-sdk-bridge.js';

function stubAdapter(partial: Partial<Adapter>): Adapter {
  return { name: 'stub', ...partial } as unknown as Adapter;
}

describe('splitForLimit', () => {
  it('returns a single chunk when text fits', () => {
    expect(splitForLimit('short text', 100)).toEqual(['short text']);
  });

  it('splits on paragraph boundaries when available', () => {
    const text = 'para one line one\npara one line two\n\npara two line one\npara two line two';
    const chunks = splitForLimit(text, 40);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(40);
  });

  it('falls back to line boundaries when no paragraph fits', () => {
    const text = 'alpha\nbravo\ncharlie\ndelta\necho\nfoxtrot';
    const chunks = splitForLimit(text, 15);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(15);
  });

  it('hard-cuts when no whitespace is available', () => {
    const text = 'a'.repeat(100);
    const chunks = splitForLimit(text, 30);
    expect(chunks.length).toBe(Math.ceil(100 / 30));
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(30);
    expect(chunks.join('')).toBe(text);
  });
});

describe('enrichAttachmentsForInbound', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('downloads attachments from a URL when fetchData is absent', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('attachment body', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      }),
    );

    const enriched = await enrichAttachmentsForInbound({
      attachments: [
        {
          type: 'file',
          url: 'https://cdn.example.test/smoke.txt',
          name: 'smoke.txt',
          mimeType: 'text/plain',
          size: 15,
        },
      ],
    } as any);

    expect(fetchSpy).toHaveBeenCalledWith('https://cdn.example.test/smoke.txt');
    expect(enriched).toEqual([
      expect.objectContaining({
        type: 'file',
        url: 'https://cdn.example.test/smoke.txt',
        name: 'smoke.txt',
        mimeType: 'text/plain',
        size: 15,
        data: Buffer.from('attachment body').toString('base64'),
      }),
    ]);
  });

  it('keeps the existing fetchData path for adapters that provide it', async () => {
    const enriched = await enrichAttachmentsForInbound({
      attachments: [
        {
          type: 'file',
          name: 'fetch-data.txt',
          mimeType: 'text/plain',
          size: 10,
          fetchData: async () => Buffer.from('via helper'),
        },
      ],
    } as any);

    expect(enriched[0]).toEqual(
      expect.objectContaining({
        name: 'fetch-data.txt',
        data: Buffer.from('via helper').toString('base64'),
      }),
    );
  });
});

describe('createChatSdkBridge', () => {
  // The bridge is now transport-only: forward inbound events, relay outbound
  // ops. All per-wiring engage / accumulate / drop / subscribe decisions live
  // in the router (src/router.ts routeInbound / evaluateEngage) and are
  // exercised by host-core.test.ts end-to-end. These tests only cover the
  // bridge's narrow, platform-adjacent surface.

  it('omits openDM when the underlying Chat SDK adapter has none', () => {
    const bridge = createChatSdkBridge({
      adapter: stubAdapter({}),
      supportsThreads: false,
    });
    expect(bridge.openDM).toBeUndefined();
  });

  it('exposes openDM when the underlying adapter has one, and delegates directly', async () => {
    const openDMCalls: string[] = [];
    const bridge = createChatSdkBridge({
      adapter: stubAdapter({
        openDM: async (userId: string) => {
          openDMCalls.push(userId);
          return `thread::${userId}`;
        },
        channelIdFromThreadId: (threadId: string) => `stub:${threadId.replace(/^thread::/, '')}`,
      }),
      supportsThreads: false,
    });
    expect(bridge.openDM).toBeDefined();
    const platformId = await bridge.openDM!('user-42');
    // Delegation: adapter.openDM → adapter.channelIdFromThreadId, no chat.openDM in between.
    expect(openDMCalls).toEqual(['user-42']);
    expect(platformId).toBe('stub:user-42');
  });

  it('exposes subscribe (lets the router initiate thread subscription on mention-sticky engage)', () => {
    const bridge = createChatSdkBridge({
      adapter: stubAdapter({}),
      supportsThreads: true,
    });
    expect(typeof bridge.subscribe).toBe('function');
  });
});
