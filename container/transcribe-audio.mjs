#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const usage = `Usage: transcribe-audio <audio-file> [--model Xenova/whisper-tiny.en]

Transcribes a local audio file using ffmpeg for decoding and Transformers.js
for in-container Whisper ASR. Outputs JSON to stdout.`;

function parseArgs(argv) {
  const args = [...argv];
  const result = { file: undefined, model: process.env.NANOCLAW_WHISPER_MODEL || 'Xenova/whisper-tiny.en' };
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === '--help' || arg === '-h') {
      console.log(usage);
      process.exit(0);
    }
    if (arg === '--model') {
      const model = args.shift();
      if (!model) throw new Error('--model requires a value');
      result.model = model;
      continue;
    }
    if (arg?.startsWith('--model=')) {
      result.model = arg.slice('--model='.length);
      continue;
    }
    if (!result.file) {
      result.file = arg;
      continue;
    }
    throw new Error(`Unexpected argument: ${arg}`);
  }
  if (!result.file) throw new Error('Missing audio file path');
  result.file = path.resolve(result.file);
  return result;
}

function decodeAudioToFloat32(file) {
  const ffmpeg = spawnSync(
    'ffmpeg',
    ['-v', 'error', '-i', file, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
    { encoding: 'buffer', maxBuffer: 256 * 1024 * 1024 },
  );
  if (ffmpeg.error) throw ffmpeg.error;
  if (ffmpeg.status !== 0) {
    const stderr = ffmpeg.stderr?.toString('utf8') || '';
    throw new Error(`ffmpeg failed with exit ${ffmpeg.status}: ${stderr.trim()}`);
  }
  const byteLength = ffmpeg.stdout.byteLength - (ffmpeg.stdout.byteLength % 4);
  if (byteLength <= 0) throw new Error('ffmpeg produced no PCM audio');
  const view = new DataView(ffmpeg.stdout.buffer, ffmpeg.stdout.byteOffset, byteLength);
  const audio = new Float32Array(byteLength / 4);
  for (let i = 0; i < audio.length; i += 1) {
    audio[i] = view.getFloat32(i * 4, true);
  }
  return audio;
}

async function loadTransformers() {
  const candidates = [
    '/pnpm/global/5/package.json',
    '/pnpm/global/6/package.json',
    '/usr/local/lib/node_modules/package.json',
  ];
  let lastError;
  for (const candidate of candidates) {
    try {
      const require = createRequire(candidate);
      const resolved = require.resolve('@xenova/transformers');
      return import(resolved);
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Could not resolve @xenova/transformers from global install paths: ${lastError?.message || lastError}`);
}

async function main() {
  const startedAt = Date.now();
  const { file, model } = parseArgs(process.argv.slice(2));
  if (!existsSync(file)) throw new Error(`Audio file not found: ${file}`);

  const audio = decodeAudioToFloat32(file);
  const { pipeline, env } = await loadTransformers();
  env.allowLocalModels = true;
  env.allowRemoteModels = true;
  env.cacheDir = process.env.TRANSFORMERS_CACHE || '/home/node/.cache/transformers';

  const transcriber = await pipeline('automatic-speech-recognition', model);
  const output = await transcriber(audio, { sampling_rate: 16000 });
  const text = typeof output === 'string' ? output : output?.text || '';
  console.log(
    JSON.stringify(
      {
        file,
        model,
        durationSamples: audio.length,
        sampleRate: 16000,
        text: text.trim(),
        elapsedMs: Date.now() - startedAt,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(JSON.stringify({ error: error?.message || String(error) }, null, 2));
  process.exit(1);
});
