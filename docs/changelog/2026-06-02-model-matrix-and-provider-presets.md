# 2026-06-02 — Model Matrix and Provider Presets

## Summary

This update adds the first Model Matrix workflow to TokenFence Studio.

Model Matrix is designed for two use cases:

1. Run the same prompt across multiple models for comparison.
2. Assign different files to different models and process them through the same TokenFence safety pipeline.

This update also expands provider presets for global, China-based, router, and local model platforms.

## Added

- Added **Model Matrix** as an upgraded multi-model workspace.
- Added prompt-level multi-model comparison.
- Added file-level model routing prototype.
- Added per-file path, content, privacy level, provider, and model selection.
- Added per-run result cards showing:
  - Model/provider
  - Scope: prompt or file
  - Duration
  - Intent
  - Risk level
  - Effective safety mode
  - Token usage
  - Routing reason
- Added automatic file routing recommendations for:
  - Code files
  - Markdown/document files
  - Log files
  - Config or secret-like files
- Added local-model preference for high-risk or secret files.
- Added additional provider presets:
  - Volcengine Ark / Doubao
  - Baidu Qianfan
  - MiniMax
  - SiliconFlow
  - Groq
  - Together AI
  - 302.AI
  - ModelScope

## Changed

- Renamed the Compare tab conceptually toward **Model Matrix**.
- Improved the README positioning from a general AI workspace to a pre-LLM safety and orchestration layer.
- Updated the README roadmap to distinguish current prototype features from planned features.
- Added Search Grounding as a planned future module instead of claiming it as completed.

## Security Notes

- Every Model Matrix run still passes through the TokenFence pre-flight safety pipeline.
- Secret-like files and high-risk content are routed toward local models by default.
- File-level privacy settings are currently advisory and will be strengthened in future updates.

## Files Updated

- `src/app/api/compare/route.ts`
- `src/components/compare-desk.tsx`
- `src/components/studio.tsx`
- `src/lib/providers/registry.ts`
- `README.md`
- `README.zh-CN.md`
- `CHANGELOG.md`
- `docs/changelog/README.md`
- `docs/changelog/2026-06-01-initial-preflight-workflow.md`
- `docs/changelog/2026-06-02-model-matrix-and-provider-presets.md`

## Notes

This is still an early-stage implementation.

Future improvements may include real file upload parsing, a judge model for merging multi-model outputs, provider fallback chains, cost/latency budgets, and Search Grounding with source citations.
