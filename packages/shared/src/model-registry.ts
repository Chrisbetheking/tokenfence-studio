/* ============================================================
   TokenFence Studio — Model Registry v1.0.4
   ============================================================ */

export type ModelCapability =
  | "chat"
  | "reasoning"
  | "coding"
  | "vision"
  | "long-context"
  | "embedding"
  | "audio"
  | "image"
  | "fast"
  | "cheap"
  | "local"
  | "privacy";

export type ModelStatus = "configured" | "not_configured" | "needs_test" | "failed" | "local_unavailable";

export interface ModelRegistryItem {
  providerId: string;
  providerName: string;
  modelId: string;
  displayName: string;
  alias?: string;
  capabilities: ModelCapability[];
  contextWindow?: number;
  maxOutputTokens?: number;
  status: ModelStatus;
  isDefault?: boolean;
  isRecommended?: boolean;
  isCustom?: boolean;
  notes?: string;
}

export interface RoutingRule {
  id: string;
  name: string;
  fileExtensions: string[];
  contentHints?: string[];
  preferredCapability: ModelCapability;
  preferredProviderId?: string;
  preferredModelId?: string;
  fallbackProviderId?: string;
  fallbackModelId?: string;
  autoSwitch: boolean;
  askBeforeSwitch: boolean;
}

/* ============================================================
   Model Registry
   ============================================================ */

export const MODEL_REGISTRY: ModelRegistryItem[] = [
  // === OpenAI ===
  { providerId: "OpenAI", providerName: "OpenAI", modelId: "gpt-5", displayName: "GPT-5", capabilities: ["chat","reasoning","coding","long-context"], contextWindow: 256000, status: "not_configured", isRecommended: true },
  { providerId: "OpenAI", providerName: "OpenAI", modelId: "gpt-5-mini", displayName: "GPT-5 Mini", capabilities: ["chat","fast","cheap"], contextWindow: 256000, status: "not_configured" },
  { providerId: "OpenAI", providerName: "OpenAI", modelId: "gpt-5.1", displayName: "GPT-5.1", capabilities: ["chat","reasoning","coding"], contextWindow: 256000, status: "not_configured" },
  { providerId: "OpenAI", providerName: "OpenAI", modelId: "gpt-5.1-mini", displayName: "GPT-5.1 Mini", capabilities: ["chat","fast","cheap"], contextWindow: 256000, status: "not_configured" },
  { providerId: "OpenAI", providerName: "OpenAI", modelId: "gpt-4.1", displayName: "GPT-4.1", capabilities: ["chat","reasoning","coding"], contextWindow: 1000000, status: "not_configured" },
  { providerId: "OpenAI", providerName: "OpenAI", modelId: "gpt-4.1-mini", displayName: "GPT-4.1 Mini", capabilities: ["chat","fast","cheap"], contextWindow: 1000000, status: "not_configured" },
  { providerId: "OpenAI", providerName: "OpenAI", modelId: "gpt-4o", displayName: "GPT-4o", capabilities: ["chat","reasoning","coding","vision"], contextWindow: 128000, status: "not_configured", isDefault: true },
  { providerId: "OpenAI", providerName: "OpenAI", modelId: "gpt-4o-mini", displayName: "GPT-4o Mini", capabilities: ["chat","fast","cheap"], contextWindow: 128000, status: "not_configured" },
  { providerId: "OpenAI", providerName: "OpenAI", modelId: "o4-mini", displayName: "o4-mini", capabilities: ["reasoning","coding"], contextWindow: 200000, status: "not_configured" },
  { providerId: "OpenAI", providerName: "OpenAI", modelId: "o3", displayName: "o3", capabilities: ["reasoning","coding"], contextWindow: 200000, status: "not_configured" },

  // === Claude / Anthropic ===
  { providerId: "Claude", providerName: "Anthropic", modelId: "claude-opus-4.5", displayName: "Claude Opus 4.5", capabilities: ["chat","reasoning","coding","long-context"], contextWindow: 200000, status: "not_configured", isRecommended: true },
  { providerId: "Claude", providerName: "Anthropic", modelId: "claude-sonnet-4.5", displayName: "Claude Sonnet 4.5", capabilities: ["chat","reasoning","coding"], contextWindow: 200000, status: "not_configured", isDefault: true },
  { providerId: "Claude", providerName: "Anthropic", modelId: "claude-haiku-4.5", displayName: "Claude Haiku 4.5", capabilities: ["chat","fast","cheap"], contextWindow: 200000, status: "not_configured" },
  { providerId: "Claude", providerName: "Anthropic", modelId: "claude-opus-4", displayName: "Claude Opus 4", capabilities: ["chat","reasoning","long-context"], contextWindow: 200000, status: "not_configured" },
  { providerId: "Claude", providerName: "Anthropic", modelId: "claude-sonnet-4", displayName: "Claude Sonnet 4", capabilities: ["chat","reasoning","coding"], contextWindow: 200000, status: "not_configured" },
  { providerId: "Claude", providerName: "Anthropic", modelId: "claude-3-7-sonnet-latest", displayName: "Claude 3.7 Sonnet", capabilities: ["chat","reasoning"], contextWindow: 200000, status: "not_configured" },
  { providerId: "Claude", providerName: "Anthropic", modelId: "claude-3-5-sonnet-latest", displayName: "Claude 3.5 Sonnet", capabilities: ["chat","fast"], contextWindow: 200000, status: "not_configured" },
  { providerId: "Claude", providerName: "Anthropic", modelId: "claude-3-5-haiku-latest", displayName: "Claude 3.5 Haiku", capabilities: ["chat","fast","cheap"], contextWindow: 200000, status: "not_configured" },

  // === Gemini ===
  { providerId: "Gemini", providerName: "Google", modelId: "gemini-2.5-pro", displayName: "Gemini 2.5 Pro", capabilities: ["chat","reasoning","vision","long-context","image"], contextWindow: 1048576, status: "not_configured", isRecommended: true, isDefault: true },
  { providerId: "Gemini", providerName: "Google", modelId: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash", capabilities: ["chat","fast","vision"], contextWindow: 1048576, status: "not_configured" },
  { providerId: "Gemini", providerName: "Google", modelId: "gemini-2.5-flash-lite", displayName: "Gemini 2.5 Flash Lite", capabilities: ["chat","fast","cheap"], contextWindow: 1048576, status: "not_configured" },
  { providerId: "Gemini", providerName: "Google", modelId: "gemini-2.0-flash", displayName: "Gemini 2.0 Flash", capabilities: ["chat","fast","vision"], contextWindow: 1048576, status: "not_configured" },
  { providerId: "Gemini", providerName: "Google", modelId: "gemini-2.0-flash-lite", displayName: "Gemini 2.0 Flash Lite", capabilities: ["chat","fast","cheap"], contextWindow: 1048576, status: "not_configured" },
  { providerId: "Gemini", providerName: "Google", modelId: "gemini-1.5-pro", displayName: "Gemini 1.5 Pro", capabilities: ["chat","reasoning","vision","long-context"], contextWindow: 2097152, status: "not_configured" },
  { providerId: "Gemini", providerName: "Google", modelId: "gemini-1.5-flash", displayName: "Gemini 1.5 Flash", capabilities: ["chat","fast"], contextWindow: 1048576, status: "not_configured" },

  // === DeepSeek ===
  { providerId: "DeepSeek", providerName: "DeepSeek", modelId: "deepseek-v4-flash", displayName: "DeepSeek V4 Flash", capabilities: ["chat","reasoning","fast"], contextWindow: 128000, status: "not_configured", alias: "DeepSeek 4.0 Flash" },
  { providerId: "DeepSeek", providerName: "DeepSeek", modelId: "deepseek-chat", displayName: "DeepSeek Chat", capabilities: ["chat","reasoning"], contextWindow: 128000, status: "not_configured", isDefault: true, notes: "Legacy; may migrate to V4" },
  { providerId: "DeepSeek", providerName: "DeepSeek", modelId: "deepseek-reasoner", displayName: "DeepSeek Reasoner", capabilities: ["reasoning","coding"], contextWindow: 128000, status: "not_configured", notes: "R1 series reasoning" },
  { providerId: "DeepSeek", providerName: "DeepSeek", modelId: "deepseek-v3", displayName: "DeepSeek V3", capabilities: ["chat","reasoning","coding"], contextWindow: 128000, status: "not_configured" },
  { providerId: "DeepSeek", providerName: "DeepSeek", modelId: "deepseek-r1", displayName: "DeepSeek R1", capabilities: ["reasoning","coding","long-context"], contextWindow: 128000, status: "not_configured" },

  // === Qwen / DashScope ===
  { providerId: "Qwen", providerName: "Alibaba", modelId: "qwen-max", displayName: "Qwen Max", capabilities: ["chat","reasoning"], contextWindow: 32768, status: "not_configured", isDefault: true },
  { providerId: "Qwen", providerName: "Alibaba", modelId: "qwen-plus", displayName: "Qwen Plus", capabilities: ["chat","fast"], contextWindow: 131072, status: "not_configured" },
  { providerId: "Qwen", providerName: "Alibaba", modelId: "qwen-flash", displayName: "Qwen Flash", capabilities: ["chat","fast","cheap"], contextWindow: 1000000, status: "not_configured" },
  { providerId: "Qwen", providerName: "Alibaba", modelId: "qwen-turbo", displayName: "Qwen Turbo", capabilities: ["chat","fast","cheap"], contextWindow: 1000000, status: "not_configured" },
  { providerId: "Qwen", providerName: "Alibaba", modelId: "qwen-long", displayName: "Qwen Long", capabilities: ["chat","long-context"], contextWindow: 10000000, status: "not_configured" },
  { providerId: "Qwen", providerName: "Alibaba", modelId: "qwen3-max", displayName: "Qwen3 Max", capabilities: ["chat","reasoning","coding"], contextWindow: 131072, status: "not_configured", isRecommended: true },
  { providerId: "Qwen", providerName: "Alibaba", modelId: "qwen3-plus", displayName: "Qwen3 Plus", capabilities: ["chat","reasoning"], contextWindow: 131072, status: "not_configured" },
  { providerId: "Qwen", providerName: "Alibaba", modelId: "qwen3-flash", displayName: "Qwen3 Flash", capabilities: ["chat","fast","cheap"], contextWindow: 1000000, status: "not_configured" },
  { providerId: "Qwen", providerName: "Alibaba", modelId: "qwen2.5-vl", displayName: "Qwen2.5 VL", capabilities: ["vision","image"], contextWindow: 32768, status: "not_configured" },
  { providerId: "Qwen", providerName: "Alibaba", modelId: "qwen-vl-plus", displayName: "Qwen VL Plus", capabilities: ["vision","image"], contextWindow: 32768, status: "not_configured" },
  { providerId: "Qwen", providerName: "Alibaba", modelId: "qwen-coder", displayName: "Qwen Coder", capabilities: ["coding","reasoning"], contextWindow: 131072, status: "not_configured" },

  // === Kimi / Moonshot ===
  { providerId: "Kimi", providerName: "Moonshot", modelId: "kimi-k2", displayName: "Kimi K2", capabilities: ["chat","reasoning","long-context"], contextWindow: 128000, status: "not_configured", isRecommended: true },
  { providerId: "Kimi", providerName: "Moonshot", modelId: "kimi-k2.6", displayName: "Kimi K2.6", capabilities: ["chat","reasoning"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Kimi", providerName: "Moonshot", modelId: "kimi-latest", displayName: "Kimi Latest", capabilities: ["chat","fast"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Kimi", providerName: "Moonshot", modelId: "moonshot-v1-8k", displayName: "Moonshot v1 8K", capabilities: ["chat","fast"], contextWindow: 8000, status: "not_configured" },
  { providerId: "Kimi", providerName: "Moonshot", modelId: "moonshot-v1-32k", displayName: "Moonshot v1 32K", capabilities: ["chat","long-context"], contextWindow: 32000, status: "not_configured", isDefault: true },
  { providerId: "Kimi", providerName: "Moonshot", modelId: "moonshot-v1-128k", displayName: "Moonshot v1 128K", capabilities: ["chat","long-context"], contextWindow: 128000, status: "not_configured" },

  // === Doubao / Volcengine ===
  { providerId: "Doubao", providerName: "ByteDance", modelId: "doubao-seed-2.0-pro", displayName: "Doubao Seed 2.0 Pro", capabilities: ["chat","reasoning"], contextWindow: 256000, status: "not_configured", isRecommended: true },
  { providerId: "Doubao", providerName: "ByteDance", modelId: "doubao-seed-2.0-flash", displayName: "Doubao Seed 2.0 Flash", capabilities: ["chat","fast"], contextWindow: 256000, status: "not_configured" },
  { providerId: "Doubao", providerName: "ByteDance", modelId: "doubao-pro", displayName: "Doubao Pro", capabilities: ["chat","reasoning"], contextWindow: 256000, status: "not_configured", isDefault: true },
  { providerId: "Doubao", providerName: "ByteDance", modelId: "doubao-lite", displayName: "Doubao Lite", capabilities: ["chat","fast","cheap"], contextWindow: 256000, status: "not_configured" },
  { providerId: "Doubao", providerName: "ByteDance", modelId: "doubao-vision", displayName: "Doubao Vision", capabilities: ["vision","image"], contextWindow: 16384, status: "not_configured" },
  { providerId: "Doubao", providerName: "ByteDance", modelId: "doubao-1.5-pro", displayName: "Doubao 1.5 Pro", capabilities: ["chat","reasoning"], contextWindow: 256000, status: "not_configured" },
  { providerId: "Doubao", providerName: "ByteDance", modelId: "doubao-1.5-lite", displayName: "Doubao 1.5 Lite", capabilities: ["chat","fast"], contextWindow: 256000, status: "not_configured" },

  // === Zhipu / GLM ===
  { providerId: "Zhipu", providerName: "Zhipu AI", modelId: "glm-5", displayName: "GLM-5", capabilities: ["chat","reasoning","coding"], contextWindow: 128000, status: "not_configured", isRecommended: true },
  { providerId: "Zhipu", providerName: "Zhipu AI", modelId: "glm-4.5", displayName: "GLM-4.5", capabilities: ["chat","reasoning"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Zhipu", providerName: "Zhipu AI", modelId: "glm-4-plus", displayName: "GLM-4 Plus", capabilities: ["chat","reasoning","coding"], contextWindow: 128000, status: "not_configured", isDefault: true },
  { providerId: "Zhipu", providerName: "Zhipu AI", modelId: "glm-4-air", displayName: "GLM-4 Air", capabilities: ["chat","fast","cheap"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Zhipu", providerName: "Zhipu AI", modelId: "glm-4-flash", displayName: "GLM-4 Flash", capabilities: ["chat","fast","cheap"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Zhipu", providerName: "Zhipu AI", modelId: "glm-z1-air", displayName: "GLM-Z1 Air", capabilities: ["chat","reasoning","fast"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Zhipu", providerName: "Zhipu AI", modelId: "glm-z1-flash", displayName: "GLM-Z1 Flash", capabilities: ["chat","fast","cheap"], contextWindow: 128000, status: "not_configured" },

  // === xAI ===
  { providerId: "xAI", providerName: "xAI", modelId: "grok-4", displayName: "Grok 4", capabilities: ["chat","reasoning","coding"], contextWindow: 131072, status: "not_configured", isRecommended: true, isDefault: true },
  { providerId: "xAI", providerName: "xAI", modelId: "grok-4-fast", displayName: "Grok 4 Fast", capabilities: ["chat","fast"], contextWindow: 131072, status: "not_configured" },
  { providerId: "xAI", providerName: "xAI", modelId: "grok-3", displayName: "Grok 3", capabilities: ["chat","reasoning"], contextWindow: 131072, status: "not_configured" },
  { providerId: "xAI", providerName: "xAI", modelId: "grok-3-mini", displayName: "Grok 3 Mini", capabilities: ["chat","fast","cheap"], contextWindow: 131072, status: "not_configured" },

  // === Mistral ===
  { providerId: "Mistral", providerName: "Mistral AI", modelId: "mistral-large-latest", displayName: "Mistral Large", capabilities: ["chat","reasoning","coding"], contextWindow: 128000, status: "not_configured", isRecommended: true, isDefault: true },
  { providerId: "Mistral", providerName: "Mistral AI", modelId: "mistral-small-latest", displayName: "Mistral Small", capabilities: ["chat","fast","cheap"], contextWindow: 32000, status: "not_configured" },
  { providerId: "Mistral", providerName: "Mistral AI", modelId: "ministral-8b-latest", displayName: "Ministral 8B", capabilities: ["chat","fast","cheap","local"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Mistral", providerName: "Mistral AI", modelId: "codestral-latest", displayName: "Codestral", capabilities: ["coding","reasoning"], contextWindow: 256000, status: "not_configured" },
  { providerId: "Mistral", providerName: "Mistral AI", modelId: "pixtral-large-latest", displayName: "Pixtral Large", capabilities: ["vision","image","chat"], contextWindow: 128000, status: "not_configured" },

  // === Cohere ===
  { providerId: "Cohere", providerName: "Cohere", modelId: "command-a", displayName: "Command A", capabilities: ["chat","reasoning"], contextWindow: 256000, status: "not_configured", isRecommended: true, isDefault: true },
  { providerId: "Cohere", providerName: "Cohere", modelId: "command-r-plus", displayName: "Command R+", capabilities: ["chat","reasoning","long-context"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Cohere", providerName: "Cohere", modelId: "command-r", displayName: "Command R", capabilities: ["chat"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Cohere", providerName: "Cohere", modelId: "embed-v4.0", displayName: "Embed v4.0", capabilities: ["embedding"], contextWindow: 512, status: "not_configured" },
  { providerId: "Cohere", providerName: "Cohere", modelId: "rerank-v3.5", displayName: "Rerank v3.5", capabilities: ["embedding"], status: "not_configured" },

  // === Perplexity ===
  { providerId: "Perplexity", providerName: "Perplexity", modelId: "sonar", displayName: "Sonar", capabilities: ["chat","fast"], contextWindow: 127000, status: "not_configured", isDefault: true },
  { providerId: "Perplexity", providerName: "Perplexity", modelId: "sonar-pro", displayName: "Sonar Pro", capabilities: ["chat","reasoning","long-context"], contextWindow: 200000, status: "not_configured", isRecommended: true },
  { providerId: "Perplexity", providerName: "Perplexity", modelId: "sonar-reasoning", displayName: "Sonar Reasoning", capabilities: ["reasoning","coding"], contextWindow: 127000, status: "not_configured" },
  { providerId: "Perplexity", providerName: "Perplexity", modelId: "sonar-reasoning-pro", displayName: "Sonar Reasoning Pro", capabilities: ["reasoning","coding"], contextWindow: 200000, status: "not_configured" },
  { providerId: "Perplexity", providerName: "Perplexity", modelId: "sonar-deep-research", displayName: "Sonar Deep Research", capabilities: ["reasoning","long-context"], contextWindow: 200000, status: "not_configured" },

  // === Groq ===
  { providerId: "Groq", providerName: "Groq", modelId: "llama-3.3-70b-versatile", displayName: "Llama 3.3 70B", capabilities: ["chat","reasoning","fast"], contextWindow: 128000, status: "not_configured", isDefault: true },
  { providerId: "Groq", providerName: "Groq", modelId: "llama-3.1-8b-instant", displayName: "Llama 3.1 8B", capabilities: ["chat","fast","cheap"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Groq", providerName: "Groq", modelId: "openai/gpt-oss-120b", displayName: "GPT-OSS 120B", capabilities: ["chat","reasoning","coding"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Groq", providerName: "Groq", modelId: "openai/gpt-oss-20b", displayName: "GPT-OSS 20B", capabilities: ["chat","fast"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Groq", providerName: "Groq", modelId: "deepseek-r1-distill-llama-70b", displayName: "DeepSeek R1 Distill 70B", capabilities: ["reasoning","coding"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Groq", providerName: "Groq", modelId: "mixtral-8x7b-32768", displayName: "Mixtral 8x7B", capabilities: ["chat","reasoning"], contextWindow: 32768, status: "not_configured" },

  // === Together ===
  { providerId: "Together", providerName: "Together AI", modelId: "meta-llama/Llama-3.3-70B-Instruct-Turbo", displayName: "Llama 3.3 70B Turbo", capabilities: ["chat","reasoning","fast"], contextWindow: 128000, status: "not_configured", isDefault: true },
  { providerId: "Together", providerName: "Together AI", modelId: "meta-llama/Llama-3.1-8B-Instruct-Turbo", displayName: "Llama 3.1 8B Turbo", capabilities: ["chat","fast","cheap"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Together", providerName: "Together AI", modelId: "Qwen/Qwen2.5-Coder-32B-Instruct", displayName: "Qwen2.5 Coder 32B", capabilities: ["coding","reasoning"], contextWindow: 32768, status: "not_configured" },
  { providerId: "Together", providerName: "Together AI", modelId: "deepseek-ai/DeepSeek-R1", displayName: "DeepSeek R1", capabilities: ["reasoning","coding"], contextWindow: 128000, status: "not_configured" },
  { providerId: "Together", providerName: "Together AI", modelId: "mistralai/Mixtral-8x7B-Instruct-v0.1", displayName: "Mixtral 8x7B", capabilities: ["chat"], contextWindow: 32768, status: "not_configured" },

  // === Ollama ===
  { providerId: "Ollama", providerName: "Ollama", modelId: "llama3.1", displayName: "Llama 3.1", capabilities: ["chat","reasoning","local","privacy"], contextWindow: 128000, status: "local_unavailable", isDefault: true },
  { providerId: "Ollama", providerName: "Ollama", modelId: "llama3.2", displayName: "Llama 3.2", capabilities: ["chat","local","privacy","fast"], contextWindow: 128000, status: "local_unavailable" },
  { providerId: "Ollama", providerName: "Ollama", modelId: "qwen2.5", displayName: "Qwen 2.5", capabilities: ["chat","reasoning","local","privacy"], contextWindow: 32768, status: "local_unavailable" },
  { providerId: "Ollama", providerName: "Ollama", modelId: "qwen2.5-coder", displayName: "Qwen 2.5 Coder", capabilities: ["coding","local","privacy"], contextWindow: 32768, status: "local_unavailable" },
  { providerId: "Ollama", providerName: "Ollama", modelId: "deepseek-r1", displayName: "DeepSeek R1 (local)", capabilities: ["reasoning","local","privacy"], contextWindow: 128000, status: "local_unavailable" },
  { providerId: "Ollama", providerName: "Ollama", modelId: "mistral", displayName: "Mistral (local)", capabilities: ["chat","local","privacy"], contextWindow: 32768, status: "local_unavailable" },
  { providerId: "Ollama", providerName: "Ollama", modelId: "gemma2", displayName: "Gemma 2", capabilities: ["chat","local","privacy"], contextWindow: 8192, status: "local_unavailable" },
  { providerId: "Ollama", providerName: "Ollama", modelId: "phi4", displayName: "Phi-4", capabilities: ["chat","reasoning","local","privacy"], contextWindow: 16384, status: "local_unavailable" },

  // === LM Studio ===
  { providerId: "LM Studio", providerName: "LM Studio", modelId: "local-model", displayName: "Local Model", capabilities: ["chat","local","privacy"], contextWindow: 128000, status: "local_unavailable", isDefault: true },
  { providerId: "LM Studio", providerName: "LM Studio", modelId: "custom-openai-compatible", displayName: "Custom Compatible", capabilities: ["chat","local","privacy"], contextWindow: 128000, status: "local_unavailable" },

  // === Custom ===
  { providerId: "Custom", providerName: "Custom", modelId: "custom", displayName: "Custom Model", capabilities: ["chat"], contextWindow: 128000, status: "not_configured", isDefault: true, isCustom: true, notes: "OpenAI-compatible custom endpoint" },
];

/* ============================================================
   Routing Rules (Smart File Routing)
   ============================================================ */

export const ROUTING_RULES: RoutingRule[] = [
  // Code files -> coding model
  { id: "route-code", name: "Code files", fileExtensions: [".py",".js",".ts",".tsx",".jsx",".rs",".go",".java",".c",".cpp",".h",".cs",".rb",".php",".swift",".kt",".scala",".r"], preferredCapability: "coding", preferredProviderId: "OpenAI", preferredModelId: "gpt-4o", fallbackProviderId: "Claude", fallbackModelId: "claude-sonnet-4.5", autoSwitch: true, askBeforeSwitch: false },
  // PDF / Image -> vision model
  { id: "route-vision", name: "Vision files", fileExtensions: [".pdf",".png",".jpg",".jpeg",".gif",".webp",".svg",".bmp"], preferredCapability: "vision", preferredProviderId: "Gemini", preferredModelId: "gemini-2.5-pro", fallbackProviderId: "OpenAI", fallbackModelId: "gpt-4o", autoSwitch: true, askBeforeSwitch: false },
  // Long documents -> long context
  { id: "route-long-doc", name: "Long documents", fileExtensions: [".md",".txt",".rst",".tex"], preferredCapability: "long-context", preferredProviderId: "Claude", preferredModelId: "claude-sonnet-4.5", fallbackProviderId: "Gemini", fallbackModelId: "gemini-2.5-pro", autoSwitch: true, askBeforeSwitch: false },
  // Data files -> reasoning
  { id: "route-data", name: "Data files", fileExtensions: [".json",".csv",".xml",".yaml",".yml",".toml"], preferredCapability: "reasoning", preferredProviderId: "OpenAI", preferredModelId: "gpt-4o", fallbackProviderId: "Claude", fallbackModelId: "claude-sonnet-4.5", autoSwitch: true, askBeforeSwitch: false },
  // Sensitive -> local
  { id: "route-sensitive", name: "Sensitive files", fileExtensions: [".env",".key",".pem",".secret",".p12",".pfx"], preferredCapability: "privacy", preferredProviderId: "Ollama", preferredModelId: "llama3.1", fallbackProviderId: "LM Studio", fallbackModelId: "local-model", autoSwitch: true, askBeforeSwitch: true },
  // Audio -> audio capable
  { id: "route-audio", name: "Audio files", fileExtensions: [".mp3",".wav",".m4a",".ogg",".flac"], preferredCapability: "audio", preferredProviderId: "Gemini", preferredModelId: "gemini-2.5-pro", fallbackProviderId: "OpenAI", fallbackModelId: "gpt-4o", autoSwitch: true, askBeforeSwitch: false },
  // General large -> fast cheap
  { id: "route-fast", name: "Quick/cheap routing", fileExtensions: [".log",".diff",".patch"], preferredCapability: "fast", preferredProviderId: "OpenAI", preferredModelId: "gpt-4o-mini", fallbackProviderId: "Groq", fallbackModelId: "llama-3.1-8b-instant", autoSwitch: true, askBeforeSwitch: false },
];

/* ============================================================
   Registry Helpers
   ============================================================ */

export function getModelsForProvider(providerId: string): ModelRegistryItem[] {
  return MODEL_REGISTRY.filter((m) => m.providerId === providerId);
}

export function getModelById(providerId: string, modelId: string): ModelRegistryItem | undefined {
  return MODEL_REGISTRY.find((m) => m.providerId === providerId && m.modelId === modelId);
}

export function getDefaultModelForProvider(providerId: string): ModelRegistryItem | undefined {
  const models = getModelsForProvider(providerId);
  return models.find((m) => m.isDefault) ?? models[0];
}

export function getRecommendedModelForProvider(providerId: string): ModelRegistryItem | undefined {
  const models = getModelsForProvider(providerId);
  return models.find((m) => m.isRecommended) ?? models.find((m) => m.isDefault) ?? models[0];
}

export function findRoutingRule(filename: string): RoutingRule | undefined {
  const ext = "." + (filename.split(".").pop()?.toLowerCase() ?? "");
  return ROUTING_RULES.find((r) => r.fileExtensions.includes(ext));
}

export function findBestModelForCapability(
  capability: ModelCapability,
  providerId?: string,
): ModelRegistryItem | undefined {
  let candidates = MODEL_REGISTRY.filter((m) => m.capabilities.includes(capability));
  if (providerId) {
    candidates = candidates.filter((m) => m.providerId === providerId);
  }
  // Prefer configured > not_configured > rest
  const configured = candidates.filter((m) => m.status === "configured");
  if (configured.length > 0) return configured[0];
  return candidates[0];
}

export function searchModels(query: string): ModelRegistryItem[] {
  const q = query.toLowerCase();
  return MODEL_REGISTRY.filter(
    (m) =>
      m.displayName.toLowerCase().includes(q) ||
      m.modelId.toLowerCase().includes(q) ||
      m.providerName.toLowerCase().includes(q) ||
      (m.alias && m.alias.toLowerCase().includes(q)),
  );
}

export function getProviderIds(): string[] {
  return [...new Set(MODEL_REGISTRY.map((m) => m.providerId))];
}

export function updateModelStatus(
  providerId: string,
  modelId: string,
  status: ModelStatus,
): void {
  const model = MODEL_REGISTRY.find((m) => m.providerId === providerId && m.modelId === modelId);
  if (model) model.status = status;
}

export function getStatusColor(status: ModelStatus): string {
  switch (status) {
    case "configured": return "var(--green)";
    case "not_configured": return "var(--text-muted)";
    case "needs_test": return "var(--amber)";
    case "failed": return "var(--red)";
    case "local_unavailable": return "var(--text-muted)";
    default: return "var(--text-muted)";
  }
}

export function getStatusLabel(status: ModelStatus): string {
  switch (status) {
    case "configured": return "Configured";
    case "not_configured": return "Not configured";
    case "needs_test": return "Needs test";
    case "failed": return "Failed";
    case "local_unavailable": return "Local unavailable";
    default: return "Unknown";
  }
}
