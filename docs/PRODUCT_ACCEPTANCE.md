# TokenFence Studio v1.0.0-rc1 Product Acceptance

## What "Product Candidate" Means

v1.0.0-rc1 is the first build where every core feature has a **real workflow** ¡ª not a stub, not a placeholder, not "should work." Every workflow must produce a verifiable artifact (file, log, UI output).

## Accepted Workflows

### WF-1: Local Plugin Runtime Execution
- [ ] User enters a task ¡ú local.echo plugin executes
- [ ] Markdown result generated
- [ ] Execution log saved to `.tokenfence/logs/`
- [ ] UI shows output and log

### WF-2: Output Generation
- [ ] Markdown file exists on disk
- [ ] HTML file exists on disk
- [ ] JSON file exists on disk
- [ ] PDF file exists on disk (desktop-only)
- [ ] DOCX file exists on disk (desktop-only)

### WF-3: Obsidian Knowledge Memory
- [ ] User configures Obsidian vault path
- [ ] TokenFence writes Markdown note into vault
- [ ] File exists on disk

### WF-4: Provider Hub
- [ ] DeepSeek provider config present
- [ ] Qwen provider config present
- [ ] Kimi provider config present
- [ ] Doubao provider config present
- [ ] Zhipu provider config present
- [ ] Ollama provider config present
- [ ] Health check handles missing API key honestly

### WF-5: Model Router
- [ ] Primary model selected by router
- [ ] Fallback chain visible in UI
- [ ] Failure logged honestly if no key

### WF-6: API Connector
- [ ] GET request executes or local mock works
- [ ] Response converted to JSON/Markdown
- [ ] Optional Obsidian write

### WF-7: Computer Use Permission
- [ ] Safe approved action works (e.g., echo, dir)
- [ ] Dangerous action blocked (rm -rf, format, etc.)
- [ ] Every action logged

### WF-8: Windows Desktop
- [ ] Portable exe opens
- [ ] Local runtime features available
- [ ] Smoke-tested locally

### WF-9: Android Mobile Lite
- [ ] 12 pages clickable
- [ ] Mobile-first layout
- [ ] Clearly marked as Mobile Lite

## Feature Status Table

| Feature | Status | Notes |
|---------|--------|-------|
| Prompt Guard | Working | |
| Local Runtime | Experimental | |
| Output Generation (MD/HTML/JSON) | Working | |
| Output Generation (PDF/DOCX) | Desktop-only | Requires Tauri command |
| Obsidian Connector | Experimental | |
| Provider Hub | Working | Config, no live keys |
| Model Router | Working | |
| API Connector | Experimental | |
| Computer Use | Experimental | Permission gate active |
| Windows Desktop | Experimental | i686 unsigned |
| Android Mobile Lite | Working | Internal release APK |
| macOS Desktop | Blocked | CI only, unverified |
| iOS | Blocked | Self-build only |