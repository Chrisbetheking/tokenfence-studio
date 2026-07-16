# Chris Studio roadmap — v2.0+

## North star

Chris Studio is a local-first AI operating workspace where disclosure, model routing, token cost and native actions remain visible and reviewable.

## v2.0.0 shipped foundation

- multi-provider profiles with OS credential storage;
- pre-send safety review and token budgets;
- OCR, scanned-PDF fallback, spreadsheets, DOCX and real vision attachments;
- local document chunking and retrieval;
- file-to-model routing;
- scoped repository browser/editor with backups;
- AI-generated review-only unified diffs;
- fixed Git/npm/Cargo checks and safe patch application;
- GitHub repository/issues/branch/commit/push/PR flow;
- approval-gated macOS screenshot, click, type and allowlisted key actions;
- built-in/custom Skills and MCP JSON-RPC connectors;
- dual-architecture macOS releases with signing/notarization support.

## Next quality milestones

### Agent reliability

- multi-step plan state with resumable checkpoints;
- structured action schema instead of free-form patch parsing;
- repository map summarization and dependency graph;
- test-result feedback loop with a strict maximum iteration count;
- patch rollback UI and per-run receipts;
- provider usage/cost values from API responses when available.

### Computer Use reliability

- user-selected display/window capture;
- screenshot redaction before optional vision transfer;
- structured action proposals with visible coordinates;
- emergency stop overlay and hard execution timeout;
- accessibility-tree targeting where macOS APIs permit it;
- optional scroll and drag actions with per-action approval.

### Document intelligence

- local embedding adapter as an optional upgrade to lexical retrieval;
- PDF coordinate anchors and page thumbnails;
- table/layout extraction and citation highlighting;
- encrypted local index migration and deduplication.

### Skill ecosystem

- signed Skill manifest and integrity hash;
- permission diff before install/update;
- version pinning and local registry;
- adapters for selected community MCP servers and OAuth flows;
- curated packs for coding, research, accessibility and office documents.

### Distribution and teams

- automatic update installer after a signed/notarized release is available;
- Windows parity for v2.0 native capabilities;
- encrypted backup and migration;
- optional team policy bundles without uploading local content;
- license/third-party notice automation.

## Permanent safety constraints

- no model-accessible unrestricted shell;
- no silent file writes, pushes, pull requests, tool calls or Computer Use;
- no plaintext secret persistence;
- no global Gatekeeper disabling;
- no background control without an always-visible stop and explicit scope.
