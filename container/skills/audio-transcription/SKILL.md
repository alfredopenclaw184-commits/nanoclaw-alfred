---
name: audio-transcription
description: Handle voice notes and audio files; transcribe or extract audio before answering.
---
# Audio / Voice Handling

When a user attaches a voice note or audio file:
1. Look for the saved attachment path in the message context.
2. If text transcript is already included, use it and mention uncertainty only if audio quality matters.
3. If no transcript is included, save/read the attachment path and use available tools:
   - `ffmpeg` for conversion/metadata.
   - local Whisper/whisper-cli if present in the container or host bridge.
   - otherwise ask for permission to use an external STT provider or ask the user to resend text.
4. Never pretend you heard audio if no transcript or STT output exists.

Preferred output: concise transcript first, then answer the request.
