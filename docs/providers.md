# Providers

TokenFence uses a registry in `src/lib/providers/registry.ts`.

Most cloud vendors only need an API key in the UI because the base URL and default models are already set. The Custom provider exists for OpenAI-compatible services that are not in the registry yet.

Local providers:

- Ollama: `http://localhost:11434`
- LM Studio: `http://localhost:1234/v1`

When a model list changes, update the registry. The app lets users override the model name manually in the Chat page.
