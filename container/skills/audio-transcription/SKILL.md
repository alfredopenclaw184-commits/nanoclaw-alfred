---
name: audio-transcription
description: Handle voice notes and audio files; transcribe or extract audio before answering.
---
# Audio / Voice Handling

When a user attaches a voice note or audio file:
1. Look for the saved attachment path in the message context.
2. If text transcript is already included, use it and mention uncertainty only if audio quality matters.
3. If no transcript is included, use the in-container transcription wrapper first:
   - Run `transcribe-audio <saved-attachment-path>`.
   - The command uses `ffmpeg` to decode audio and Transformers.js Whisper (`Xenova/whisper-tiny.en` by default) to produce JSON with a `text` field.
   - If you need metadata or conversion debugging, use `ffmpeg` directly.
   - If `transcribe-audio` fails, report the exact error and do not pretend you heard the audio.
4. Never pretend you heard audio if no transcript or STT output exists.

Preferred output: concise transcript first, then answer the request.
