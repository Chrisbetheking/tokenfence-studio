# Chris Studio v2.0.0

v2.0 advances Chris Studio from a multi-provider safety workspace into a scoped desktop agent environment.

## Highlights

- Scoped repository workspace with safe reads, reviewed writes, backups and patch archives.
- AI Patch Assistant that sends locally redacted repository context to the active provider and returns a review-only plan and unified diff.
- Fixed build/test/Git command allowlist and `git apply --check` before patch application.
- Credential-store GitHub connection, repository/issues, branch, commit, push and pull-request workflow.
- Approval-gated macOS screenshots, coordinate clicks, text typing and allowlisted keys.
- 20 built-in Skills, custom Skill editor and JSON import/export.
- MCP/JSON-RPC connector Beta with confirmed tool calls.
- Scanned-PDF OCR plus English, Simplified Chinese and mixed OCR modes.
- Local knowledge chunking and retrieval-augmented context.
- Explicit real-image delivery for vision-capable providers.
- Per-request and daily token budgets with usage accounting.
- Developer ID signing/notarization path plus an ad-hoc community installer fallback.

## Safety boundaries

No unrestricted shell, no automatic model-approved writes, no unattended Computer Use, no silent MCP calls, no WebView secret retrieval and no silent self-update.
