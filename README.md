# TokenFence Studio

<p align="center">
  <img src="./docs/images/banner.png" alt="TokenFence Studio" width="100%">
</p>

<p align="center">
  <strong>Local-first prompt safety, document intelligence, and multi-model orchestration workspace for LLMs.</strong>
</p>

<p align="center">
  Prompt Guard · Document Pipeline · Model Matrix · File-level routing · Agent-ready workflows
</p>

<p align="center">
  <a href="./README.zh-CN.md">中文</a> ·
  <a href="./docs/changelog/README.md">Update Log</a> ·
  <a href="https://github.com/Chrisbetheking/tokenfence-studio">GitHub</a>
</p>

---

## Overview

**TokenFence Studio** is an early-stage local-first AI workspace that sits between users and large language models.

It is not trying to be just another chat UI. The main idea is to build a small pre-LLM layer that can inspect, clean, protect, chunk, and route user input before it reaches a model.

```text
Raw prompt / uploaded files
   �?Document Intelligence Pipeline
   �?Prompt Guard + Redaction
   �?Intent detection
   �?Context compression
   �?Model Matrix / file-level routing
   �?Final prompt preview
   �?LLM provider or local model
```

The goal is to make LLM usage a bit safer, cleaner, and easier to debug.

---

## Why TokenFence?

Most AI tools focus on model access.

TokenFence Studio focuses on what happens **before** model access:

- Does this prompt contain secrets or private data?
- Can this PDF, DOCX, log, or Markdown file be cleaned first?
- Can noisy headers, page numbers, and repeated text be removed?
- Can the document be turned into RAG-ready chunks?
- Which model should handle this task or file?
- Should this file go to a cloud model, a local model, or a safer redacted workflow?
- Can several models be compared side by side?

That makes TokenFence closer to a **pre-LLM safety and orchestration layer** than a normal ChatGPT-style interface.

---

## Preview

Screenshots will be added as the UI stabilizes. Suggested capture points:

- Chat workspace with pre-flight safety report
- Prompt Guard and final prompt preview
- Model Matrix with multi-model comparison and file-level routing
- Document Pipeline report and chunks export
- Provider settings with global, China-based, router, and local models

---

## Core Features

### Prompt Guard

Scan prompts locally before they are sent to a model.

Current detection rules cover common sensitive data patterns such as API keys, emails, phone numbers, database URLs, access tokens, secret assignments, Chinese personal identifiers, and credential-like leaks.

### Redaction Engine

Replace detected sensitive values with safe placeholders while keeping the task understandable.

```text
john@example.com �?[EMAIL_1]
sk-xxxxxxx       �?[OPENAI_KEY_1]
```

### Document Intelligence Pipeline

TokenFence now has a first document-processing workflow.

It is designed to turn uploaded or pasted files into clean, safe, model-ready context:

```text
File Upload
  �?PDF / DOCX / Image / Log / Markdown / Code parsing
  �?PDF / DOCX text extraction or image OCR
  �?Noise cleaning
  �?Sensitive data scanning
  �?Redaction-aware risk report
  �?RAG-ready chunk generation
  �?File-level model routing
  �?Export as Markdown / JSON
```

Current prototype capabilities:

- Extract text from text-like files, logs, Markdown, JSON, and code files.
- PDF text extraction through a dedicated server-side parser.
- DOCX text extraction through a dedicated DOCX parser.
- Local image OCR through Tesseract.js before model execution.
- Remove common noise such as blank lines, page numbers, repeated page headers, repeated footers, and duplicated paragraphs.
- Generate `chunks.json` with file name, section, chunk id, risk level, token estimate, and suggested route.
- Export cleaned Markdown for RAG, agent workflows, or manual review.

### Model Matrix

Run one task across multiple models, or assign different files to different models.

Current capabilities include:

- Send the same prompt to multiple selected models.
- Compare responses, latency, token usage, and risk status.
- Paste or process multiple files and route each file separately.
- Choose a model per file.
- Mark files as public, private, or secret.
- Route high-risk or secret-like files toward local models.

### File-level Model Routing

Different files may need different routes.

| File | Recommended route |
|---|---|
| `src/app/page.tsx` | Coding-friendly model |
| `README.md` | Writing / documentation model |
| `error.log` | Long-context model |
| `.env` or secret config | Local model only |
| `report.pdf` | Long-context model after cleaning/chunking |
| `sample-image.png` | Local OCR first, then route extracted text |

### Multi-provider Support

TokenFence Studio supports global, China-based, router, and local providers through native or OpenAI-compatible adapters.

Current presets include:

- OpenAI
- Anthropic Claude
- Google Gemini
- DeepSeek
- Volcengine Ark / Doubao
- Alibaba Cloud Bailian / Qwen
- Baidu Qianfan
- Kimi / Moonshot
- Zhipu GLM
- MiniMax
- SiliconFlow
- OpenRouter
- Groq
- Together AI
- 302.AI
- ModelScope
- Ollama
- LM Studio
- Custom OpenAI-compatible endpoint

Bring your own API key. No vendor lock-in.

### Context Compression

Compress long prompts or document context while keeping the user goal, constraints, file structure, and important details.

### Local Archive

Store sanitized runs locally. No cloud database is required by default.

### Agent Context Packs

Prepare reusable context bundles for AI coding and agent workflows such as Claude Code, Codex, MCP-based agents, and OpenHands-style workflows.

---

## Examples

Example assets are included under:

```text
examples/document-intelligence/
├── README.md
├── sample.pdf
├── sample.docx
├── sample-image.png
├── before-cleaning.txt
├── after-cleaning.md
└── chunks.json
```

These are intentionally small. They are meant to show the expected input/output shape rather than act as benchmark data.

---

## Planned: Search Grounding

Search grounding is planned as a future module.

The idea is to let TokenFence decide whether a request needs live web information, safely prepare the search query, retrieve sources, and inject grounded context before model execution.

Planned search providers / modes:

- Brave Search
- Tavily
- Gemini Grounding with Google Search
- Kimi Web Search
- Baidu search via SERP provider
- Custom search provider

Search will be controlled by the same safety layer:

- Block searching secrets
- Redact private search queries
- Choose Global / China / Auto region
- Show sources before final answer generation

---

## Architecture

```text
User input / uploaded files
        �?        �?Document Intelligence Pipeline
        ├── Parser
        ├── Cleaner
        ├── Chunker
        └── Metadata builder
        �?        �?Prompt Guard
        ├── Scanner
        ├── Redactor
        ├── Risk Engine
        └── Compressor
        �?        �?Model Matrix / Router
        ├── Prompt-level multi-model run
        ├── File-level model routing
        ├── Local model preference for sensitive files
        └── Future judge model / fallback chain
        �?        �?Provider Layer
        ├── Global providers
        ├── China-based providers
        ├── Router providers
        └── Local providers
        �?        �?Response / comparison / archive / exported context
```

---

## Quick Start

### Web Workspace

```bash
git clone https://github.com/Chrisbetheking/tokenfence-studio.git
cd tokenfence-studio
npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:3000`.

### Android Mobile Lite

```bash
cd apps/android
npm install
npm run start
```

Scan the QR code with Expo Go, or connect an Android device / emulator.

### Desktop App

```bash
cd apps/desktop
npm install
npm run dev
```

Requires Rust and Tauri CLI. See [docs/RELEASES.md](./docs/RELEASES.md) for pre-built downloads.### API Keys

Create a `.env.local` file or save keys in the Provider settings page.

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
DEEPSEEK_API_KEY=
VOLCENGINE_API_KEY=
DASHSCOPE_API_KEY=
QIANFAN_API_KEY=
MOONSHOT_API_KEY=
ZHIPU_API_KEY=
MINIMAX_API_KEY=
SILICONFLOW_API_KEY=
OPENROUTER_API_KEY=
GROQ_API_KEY=
TOGETHER_API_KEY=
THREE_ZERO_TWO_API_KEY=
MODELSCOPE_API_KEY=
```

If you only use Ollama or LM Studio, cloud API keys are optional.

---

## Project Structure

This repository is organized as a cross-platform monorepo:

```text
tokenfence-studio/
├── apps/
�?  ├── web/             # Next.js web workspace (full TokenFence Studio)
�?  ├── android/         # Expo React Native Android Mobile Lite
�?  └── desktop/         # Tauri desktop wrapper (Windows + macOS)
├── packages/
�?  └── shared/          # Shared TypeScript logic (guard, providers, routing)
├── docs/
�?  ├── changelog/       # Per-update development notes
�?  └── images/          # Banner and screenshots
├── examples/             # Sample documents for testing
├── cli/                  # CLI tooling (planned)
├── mcp/                  # MCP integrations (planned)
├── .github/
�?  └── workflows/       # CI/CD (release, lint)
├── package.json          # Root workspace config
├── tsconfig.base.json    # Shared TypeScript base config
└── README.md
```

| Package | Description |
|---|---|
| `apps/web` | Full Next.js web workspace with Chat, Guard, Document Pipeline, Model Matrix, Provider Settings, Archive, and Agent Packs |
| `apps/android` | Android Mobile Lite app built with Expo / React Native �� prompt scanning, model routing, sanitized local archive |
| `apps/desktop` | Tauri desktop wrapper for Windows and macOS |
| `packages/shared` | Pure TypeScript logic reused across platforms �� guard scanning, provider presets, file routing, storage helpers |
---

## Project Status

### Available Now

- Responsive Web Workspace (Chat, Guard, Document Pipeline, Model Matrix, Provider Settings, Archive, Agent Packs)
- Android Mobile Lite App (prompt scanning, model routing, sanitized local archive)
- Tauri Desktop Wrapper (Windows + macOS)
- Multi-provider Settings (global, China-based, router, and local models)
- Prompt Guard with sensitive data scanning
- Redaction Engine with structured placeholders
- Policy Profiles for risk-level control
- Context Compression
- Model Matrix for multi-model comparison
- File-level Model Routing
- Document Intelligence Pipeline
  - PDF text extraction (text-based PDFs)
  - DOCX raw text extraction
  - Local image OCR through Tesseract.js
  - Noise cleaning and chunk generation
- Local Sanitized Archive
- Agent Context Pack prototype
- Shared TypeScript Logic Package (`packages/shared`)
- GitHub Releases CI/CD Workflow

### Experimental / In Progress

- Provider Fallback Chains
- Cost and Latency Budget Router
- Source Citation Panel (prototype)
- Desktop Storage Path Selection
- File-type Model Routing Rules
- Android Storage / Export Workflow
- Release Artifact Automation

### Planned

- Scanned-PDF Page OCR with PDF-to-image rendering
- Layout-aware Parsing for Complex PDFs and Tables
- Search Grounding Router
- Judge Model for Merging Multi-model Outputs
- MCP Marketplace
- VS Code Extension
- Browser Extension
- Local Vector Search
- Team Workspace
- Plugin / Skill Marketplace
---

## Update Log

Recent updates and development notes are available in the [Update Log](./docs/changelog/README.md).

---

## Contributing

Issues and pull requests are welcome.

Ideas that are especially helpful:

- Better document parsers
- Scanned-PDF OCR and vision model integrations
- New provider adapters
- Better detection rules
- Search grounding integrations
- File routing heuristics
- Model comparison workflows
- Agent / MCP use cases

---

## Author

Created by **ChrisWang**.

Building practical AI infrastructure.

---

## License

MIT License
