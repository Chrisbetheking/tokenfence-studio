# Open-source inspiration and implementation boundaries

TokenFence Studio studies public architecture and product patterns from established open-source AI applications. These references guide product decisions; TokenFence does not copy their application code into this repository.

## OpenHands

Project: https://github.com/OpenHands/openhands

What TokenFence learns from it:

- coding agents need an execution environment rather than only prompt templates;
- tools, observations, files and commands should be represented as explicit actions;
- repository changes should be inspectable and testable;
- model selection should not be hard-wired to one provider.

TokenFence difference:

- safety review, token accounting and least-privilege approval are part of the primary UI;
- unrestricted terminal access is not enabled in v1.7.0.

## Open WebUI

Project: https://github.com/open-webui/open-webui

What TokenFence learns from it:

- flexible model and provider management;
- reusable tools/functions attached to models and agents;
- community extensibility without changing the core chat interface.

TokenFence difference:

- desktop-local credential storage and pre-send data review are mandatory boundaries;
- Skills expose declared permissions instead of being treated as opaque prompt additions.

## AnythingLLM

Project: https://github.com/Mintplex-Labs/anything-llm

What TokenFence learns from it:

- documents should have a dedicated ingestion pipeline;
- local and hosted models should coexist;
- workspaces benefit from document-aware agent behavior.

TokenFence difference:

- the extracted text is shown and scanned before it can enter provider context;
- file-to-model routing and token optimization happen before the request.

## LibreChat

Project: https://github.com/danny-avila/LibreChat

What TokenFence learns from it:

- a unified interface can support many providers and agent/tool workflows;
- MCP and artifacts can be presented as first-class capabilities;
- provider configuration needs clear connection and failure states.

TokenFence difference:

- provider endpoint host checks and per-profile OS credentials are handled by the native desktop backend;
- Local Sandbox is explicit and cannot silently replace a configured remote model.

## Model Context Protocol servers

Project: https://github.com/modelcontextprotocol/servers

What TokenFence learns from it:

- tools should have structured schemas and narrow responsibilities;
- tool servers can be composed without bundling all integrations into the core application;
- filesystem, GitHub and other integrations require explicit scopes.

TokenFence planned boundary:

- MCP servers will be disabled by default;
- installation must show requested permissions, command/network access and integrity metadata;
- each server receives a user-approved scope rather than full-machine access.

## LobeChat

Project: https://github.com/lobehub/lobe-chat

What TokenFence learns from it:

- discoverable agents and reusable personas lower the barrier to specialized workflows;
- a visual agent/skill catalog is easier to understand than hidden system prompts.

TokenFence difference:

- built-in Skills are task procedures with declared permissions and safety constraints;
- the catalog is intended to include operational Skills, not only personas.

## Dependency and license policy

- New dependencies must have a compatible license and an active security posture.
- `npm audit --audit-level=moderate` is part of the validation process.
- The vulnerable npm `xlsx` package is not used in v1.7.0; spreadsheet extraction uses ExcelJS with a patched `uuid` override.
- Third-party notices should be added before distributing bundled production binaries at scale.
- Code copied from another project requires explicit license review and attribution; architectural inspiration alone is documented here.
