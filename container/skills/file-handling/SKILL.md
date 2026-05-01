---
name: file-handling
description: General handling for chat attachments and arbitrary files.
---
# File Handling

For any attachment:
1. Identify filename, MIME type, size if available, and saved path.
2. Prefer non-destructive reads/previews.
3. Cap large outputs and preserve the local path for follow-up.
4. For images, use vision if available.
5. For audio, use audio-transcription rules.
6. For documents, use document-reading rules.
7. For archives, list before extracting.
8. Never claim a file was read unless you actually inspected its contents or a host-supplied extraction.
