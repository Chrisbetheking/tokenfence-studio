# Agent bridge

TokenFence is useful before a coding agent sees a repo.

Use the CLI to create a small context file:

```bash
pnpm tokenfence pack . --task "review the auth flow" --out AGENT_CONTEXT.md
```

Then point Codex-style, Claude Code, OpenCode, Cursor, or other local agents at `AGENT_CONTEXT.md` instead of dumping the entire repo into context.

For MCP clients:

```bash
pnpm mcp
```

The MCP server exposes local tools for scanning, redaction, compression, and context pack generation.

For OpenClaw-style tools or your own app, call the local HTTP routes while the Next server is running:

```txt
POST /api/guard
POST /api/chat
POST /api/compare
POST /api/context-pack
GET  /api/archive
```
