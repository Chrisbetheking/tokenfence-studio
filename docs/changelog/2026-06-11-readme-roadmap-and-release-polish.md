# 2026-06-11 – README Roadmap and Release Polish

## Summary

This update fixes the README project structure and roadmap, adds shared logic for provider fallback chains, cost/latency budget routing, and a source citation panel prototype, and polishes the release workflow documentation.

## Changed

- **README.md**: Replaced flat project structure with real monorepo layout (apps/web, apps/android, apps/desktop, packages/shared)
- **README.md**: Moved completed features (PDF/DOCX/OCR) from Planned to Available Now
- **README.md**: Reorganized roadmap into Available Now / Experimental / Planned categories
- **README.md**: Removed "Screenshots to add" section; replaced with clean Preview section
- **README.md**: Updated Quick Start with per-platform instructions
- **README.zh-CN.md**: Full rewrite with natural Chinese and matching monorepo structure

## Added

- **packages/shared/src/fallback.ts**: Provider fallback chain logic
  - Default fallback chains based on primary provider
  - High-risk content routes to local models first
  - China-region tasks prefer China-based providers before global fallback
- **packages/shared/src/budget.ts**: Cost and latency budget router
  - Per-model cost and latency estimates
  - Three priority modes: cost, speed, balanced
  - Provider ranking and recommendation
- **packages/shared/src/citation.ts**: Source citation panel prototype
  - Citation source model with relevance scoring
  - Citation block formatting for Markdown output
  - Relevance filtering and mock source generator
- **packages/shared/src/fileRouter.ts**: Added reason and workflow fields to file routing rules
  - Each file type now explains why a model is recommended
  - Workflow descriptions for each file category

## Validation

- TypeScript typecheck passes across all packages
- Web build succeeds
- All new modules exported from packages/shared/src/index.ts

## Notes

- Fallback chains, budget router, and citation panel are shared logic only
- UI integration in web and Android apps is deferred to future updates
- Rust/Tauri required for desktop builds; documented in RELEASES.md
