# TokenFence Studio Product Roadmap — v1.7+

## Product north star

TokenFence should become a safe, token-efficient AI operating workspace rather than a single-provider chat client. Every action follows four principles:

1. local review before disclosure;
2. explicit provider and model destination;
3. least-privilege tools and Skills;
4. measurable token and execution cost.

## Phase 1 — v1.7.0 foundation (implemented)

- multi-provider profiles and per-profile credential storage;
- explicit Local Sandbox instead of silent fallback;
- local token estimator and prompt compaction;
- PDF, DOCX, spreadsheet, text/code and image OCR processors;
- local file-to-provider routing rules;
- Agent Studio with 12 built-in Skills;
- Computer Use capability and permission model;
- GitHub Release update page;
- modern overlay title bar and compact workspace shell;
- security tests, dependency audit and macOS dual-architecture release workflow.

## Phase 2 — coding-agent sandbox

- connect a user-selected GitHub repository through OAuth or a narrowly scoped token;
- clone/open a project into a dedicated workspace directory;
- read-only repository map before any write;
- patch-based file edits rather than arbitrary overwrite;
- command allowlist with working-directory confinement;
- diff review, test output and rollback before commit;
- branch creation and pull-request draft workflow;
- token budget per task and context deduplication.

No generic unrestricted command executor should be exposed to the model.

## Phase 3 — controlled Computer Use

- macOS Screen Recording permission detection;
- user-selected window or display capture;
- screenshot redaction before model vision requests;
- action proposals expressed as structured steps;
- per-action approval for click, type, scroll and open;
- always-visible stop control and execution timeout;
- sensitive-field detection before typing;
- complete local audit receipt and replayable action log.

“Trusted” mode must still retain scope limits, protected actions and an emergency stop.

## Phase 4 — Skills and MCP ecosystem

- signed Skill manifest format;
- import/export of local Skills;
- Skill permission diff before installation;
- curated built-in packs for coding, research, office documents, accessibility and release operations;
- MCP client with per-server permissions and disabled-by-default tools;
- compatibility layer for selected community MCP servers;
- local skill registry, version pinning and integrity hashes.

## Phase 5 — document intelligence

- rendered-page OCR for scanned PDFs;
- Chinese and multilingual OCR packs managed locally;
- table detection and layout-preserving extraction;
- citation anchors back to PDF page and bounding box;
- document chunk deduplication and semantic context cache;
- optional local embedding model;
- context quality score before a model request.

## Phase 6 — cost and policy controls

- provider-specific tokenizer adapters;
- actual usage and cost receipts where APIs expose usage;
- daily and per-project budgets;
- policy rules by file type, sensitivity and destination country/region;
- team policy bundles without uploading local content;
- encrypted backup and migration of non-secret configuration.

## Release gates

A feature is not considered complete until it has:

- a visible permission and data-flow description;
- failure and offline states;
- a deterministic test or validation path;
- no plaintext secret persistence;
- an uninstall/reset path;
- bilingual user documentation;
- a clear statement of what remains unsupported.
