# Security notes

TokenFence is local-first, not magic.

What it does:

- scans obvious secrets and PII
- redacts matched values before sending prompts
- saves API keys and archives under `.tokenfence`
- keeps redaction mappings local

What it does not promise:

- perfect DLP
- perfect token counting for every tokenizer
- cloud privacy when the user chooses a cloud provider

Use Ollama or LM Studio when you want the model call to stay local.
