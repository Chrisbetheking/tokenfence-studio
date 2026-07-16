# Chris Studio v1.7.0

v1.7.0 changes Chris Studio from a DeepSeek-focused safety demo into the foundation of a multi-provider Safe AI Workspace.

## Highlights

- 13 provider templates, including local runtimes and a custom compatible API;
- fixed provider persistence so saving DeepSeek no longer silently selects Local Sandbox;
- per-profile macOS Keychain / Windows Credential Manager entries;
- local token estimation and conservative/balanced optimization;
- PDF, DOCX, Excel, text/code and image OCR processors;
- file-to-model routing rules;
- Agent Studio with 12 built-in Skills and three default agents;
- Computer Use permission/capability Beta without unrestricted control;
- in-app GitHub Release checks and download asset display;
- modern macOS overlay title bar and redesigned navigation;
- provider endpoint host validation and HTTPS/local-only transport policy;
- zero known npm vulnerabilities at audit time;
- Apple Silicon and Intel macOS release workflow.

## Important limitations

- macOS community builds are unsigned until Apple Developer ID signing and notarization are configured;
- Computer Use screen capture, mouse, keyboard, project writes and terminal execution are not active in this release;
- OCR starts with an English language pack;
- scanned PDF page OCR and layout reconstruction remain planned;
- model identifiers are editable and must match the user account/provider documentation.
