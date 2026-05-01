---
name: excalidraw
description: Read and create Excalidraw .excalidraw JSON diagrams.
---
# Excalidraw

Use this for `.excalidraw` files or when the user asks for a hand-drawn diagram.

Reading:
- `.excalidraw` is JSON. Parse `elements`.
- Summarize element counts by type, text elements, arrows/bindings, and likely flow.
- If the file is `.excalidraw.png`, plain JSON parsing may not work; say it needs embedded scene extraction or image vision.

Creating:
- Save a `.excalidraw` JSON envelope with `type: "excalidraw"`, `version: 2`, `source`, `elements`, and `appState`.
- Use actual text elements bound to shapes; do not use fake `label` fields.
