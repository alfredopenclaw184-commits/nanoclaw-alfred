---
name: document-reading
description: Read PDFs, Office files, spreadsheets, text files, and archives from chat attachments.
---
# Document Reading

When a user attaches a file:
1. Use the saved attachment path from the message context.
2. For PDFs, prefer extracted text already supplied by the host; otherwise use `pdftotext`/`pdf-parse` if available.
3. For DOCX, use `mammoth` or another docx parser.
4. For XLSX, use `xlsx` and summarize sheets, headers, row counts, and relevant rows.
5. For TXT/MD/CSV/JSON/YAML/XML, read directly with line/size awareness.
6. For ZIPs, list contents first; extract only specific needed files.
7. State clearly when a file is scanned/OCR-only and no OCR result is available.

Do not ask “what should I do with it” if the user's intent is obvious; read/summarize/analyze it.
