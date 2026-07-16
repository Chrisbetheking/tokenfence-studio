# TokenFence Studio v1.7.0

[中文](README.zh-CN.md) · [Latest Release](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest) · [Troubleshooting](docs/troubleshooting/TROUBLESHOOTING.md)

**TokenFence Studio** is a local-first Safe AI Workspace that combines multi-provider access, pre-send privacy review, token optimization, local file processing, model routing, and composable Agent Skills in one macOS desktop application.

> v1.7.0 no longer falls back to Local Sandbox after a real provider is saved. DeepSeek, OpenAI, Anthropic and other profiles remain active when selected; Local Sandbox is used only through an explicit user choice.

## Download

### macOS Apple Silicon (M1/M2/M3/M4)

- [DMG](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest/download/TokenFence-Studio-macOS-Apple-Silicon.dmg)
- [APP ZIP](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest/download/TokenFence-Studio-macOS-Apple-Silicon.app.zip)
- [SHA-256](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest/download/SHA256SUMS-Apple-Silicon.txt)

### macOS Intel

- [DMG](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest/download/TokenFence-Studio-macOS-Intel.dmg)
- [APP ZIP](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest/download/TokenFence-Studio-macOS-Intel.app.zip)
- [SHA-256](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest/download/SHA256SUMS-Intel.txt)

> Direct asset links work only after the v1.7.0 Release has been built and uploaded. Community packages are currently unsigned. On first launch, macOS may require Control-click → Open or the app-specific quarantine fix in the troubleshooting guide. Do not disable Gatekeeper globally.

## What v1.7.0 adds

### Multi-provider workspace

Built-in templates are included for DeepSeek, OpenAI, Anthropic, Gemini, Qwen, Kimi, Doubao/Ark, Zhipu GLM, OpenRouter, Ollama, LM Studio, custom OpenAI-compatible HTTPS endpoints, and an explicit offline Local Sandbox.

Each provider uses an independent profile, model, endpoint, connection state and operating-system credential entry. Keys are not written to browser localStorage. Model fields remain editable because availability can differ by account, region and provider.

### Safety before every send

```text
Prompt and attachments
→ local extraction
→ local sensitive-data scan
→ risk and redaction review
→ user approval
→ token optimization
→ model routing
→ provider request
→ safety receipt
```

The first message is reviewed, attachments participate in the same scan, edits invalidate prior approval, high-risk data defaults to a redacted payload, and local history is scanned again before persistence.

### Token optimization

Conservative and Balanced local compaction modes estimate original and optimized token use, show the expected saving, and list the applied changes. Optimization can be disabled and is performed before provider billing begins.

### Local file pipeline

| Input | Processor | Status |
|---|---|---|
| Text, Markdown, JSON, CSV, logs and code | Text & Code Reader | Implemented |
| PDF | PDF.js text extraction with page markers | Implemented |
| DOCX | Mammoth raw-text extraction | Implemented |
| XLSX / XLS | ExcelJS worksheet-to-CSV context | Implemented |
| PNG / JPG / WEBP and more | Tesseract.js local OCR | Implemented; English pack by default |
| Full-page OCR for scanned PDFs | PDF rendering + OCR | Roadmap |

The original file is not sent directly. Only extracted text that is visible and reviewed in TokenFence can enter provider context.

### File-to-model routing

Separate local rules can route code, PDF, images/OCR, spreadsheets, office documents and general tasks to a provider profile and optional model override. The final destination remains visible in the inspector.

### Agent Studio and built-in Skills

Twelve built-in Skills cover secure coding, repository onboarding, release diagnosis, prompt compression, privacy review, PDF research, OCR cleanup, spreadsheet analysis, GitHub triage, research briefs, Computer Use guarding and product critique.

Default Agent profiles include TokenFence Coder, Document Analyst and Desktop Operator Beta. Skills declare network, file, GitHub and computer permissions.

### GitHub update visibility

The Updates screen checks the latest GitHub Release, shows version metadata and assets, and opens reviewed external links through the native backend.

### Modern macOS shell

The native title bar uses an overlay style with no duplicated legacy product title. The compact drag region contains a quick-command entry, provider switcher and connection status, while all product sections share a consistent modern panel system.

## Honest Computer Use scope

v1.7.0 delivers the permission model, capability reporting, UI and Computer Use Guard Skill. It does **not** enable unrestricted mouse, keyboard or shell control. Screen capture, controlled actions, scoped project writes and terminal tasks remain planned until per-action approval, stop controls, restricted scopes and audit receipts are implemented.

See [the v1.7 roadmap](docs/architecture/ROADMAP_v1.7.md).

## Open-source inspiration

TokenFence studies public product and architecture patterns from OpenHands, Open WebUI, AnythingLLM, LibreChat, MCP Servers and LobeChat. The project does not copy their application code. See [Open-source inspiration and boundaries](docs/architecture/OPEN_SOURCE_INSPIRATION.md).

## Development

Requirements: Node.js 22, npm, stable Rust, and Xcode Command Line Tools on macOS.

```bash
cd apps/desktop/ui
npm ci --legacy-peer-deps
npm run dev
```

Open `http://localhost:1420` for UI preview. Native credentials, provider requests, updates and desktop capabilities require Tauri:

```bash
npm ci --legacy-peer-deps
npm ci --prefix apps/desktop/ui --legacy-peer-deps
npm --workspace apps/desktop run dev
```

Validation:

```bash
npm --prefix apps/desktop/ui run typecheck
npm --prefix apps/desktop/ui run test:core
npm --prefix apps/desktop/ui run build
npm --prefix apps/desktop/ui audit --audit-level=moderate
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
python scripts/verify_tokenfence_patch.py
```

## Publish macOS v1.7.0

Open GitHub Actions → **TokenFence macOS Builds and Release** → **Run workflow**, then use:

```text
version: v1.7.0
create_release: true
make_latest: true
```

The workflow verifies TypeScript, privacy tests, the UI build, Rust, Apple Silicon and Intel Tauri packages, checksums and the GitHub Release.

## Security notes

TokenFence reduces accidental disclosure risk but cannot detect every secret. Built-in providers are restricted to matching hosts; custom remote APIs require HTTPS, while plain HTTP is allowed only for localhost. Third-party parsing dependencies must be continuously audited. Never paste real credentials into Issues or test fixtures. Public friction-free distribution still requires Apple Developer ID signing and notarization.

## License

MIT
