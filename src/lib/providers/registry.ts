import type { ProviderSpec } from "../types";

export const providerRegistry: ProviderSpec[] = [
  {
    id: "openai",
    label: "OpenAI",
    group: "global",
    kind: "openai-compatible",
    baseUrl: "https://api.openai.com/v1",
    models: ["gpt-4.1", "gpt-4.1-mini", "gpt-4o", "gpt-4o-mini", "o4-mini"],
    defaultModel: "gpt-4.1-mini",
    needsKey: true,
    keyEnv: "OPENAI_API_KEY"
  },
  {
    id: "anthropic",
    label: "Anthropic / Claude",
    group: "global",
    kind: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    models: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest"],
    defaultModel: "claude-3-5-sonnet-latest",
    needsKey: true,
    keyEnv: "ANTHROPIC_API_KEY"
  },
  {
    id: "gemini",
    label: "Google Gemini",
    group: "global",
    kind: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    defaultModel: "gemini-2.5-flash",
    needsKey: true,
    keyEnv: "GEMINI_API_KEY"
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    group: "china",
    kind: "openai-compatible",
    baseUrl: "https://api.deepseek.com",
    models: ["deepseek-chat", "deepseek-reasoner", "deepseek-v4-flash", "deepseek-v4-pro"],
    defaultModel: "deepseek-chat",
    needsKey: true,
    keyEnv: "DEEPSEEK_API_KEY"
  },
  {
    id: "qwen",
    label: "Qwen / Alibaba Cloud",
    group: "china",
    kind: "openai-compatible",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    models: ["qwen-plus", "qwen-max", "qwen-turbo", "qwen-coder-plus", "qwen-long"],
    defaultModel: "qwen-plus",
    needsKey: true,
    keyEnv: "DASHSCOPE_API_KEY"
  },
  {
    id: "kimi",
    label: "Kimi / Moonshot",
    group: "china",
    kind: "openai-compatible",
    baseUrl: "https://api.moonshot.ai/v1",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k", "kimi-k2-0711-preview"],
    defaultModel: "moonshot-v1-32k",
    needsKey: true,
    keyEnv: "MOONSHOT_API_KEY"
  },
  {
    id: "zhipu",
    label: "Zhipu GLM",
    group: "china",
    kind: "openai-compatible",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    models: ["glm-4-plus", "glm-4-air", "glm-4-flash", "glm-4.5", "glm-4.5-air"],
    defaultModel: "glm-4-flash",
    needsKey: true,
    keyEnv: "ZHIPU_API_KEY"
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    group: "router",
    kind: "openai-compatible",
    baseUrl: "https://openrouter.ai/api/v1",
    models: ["openai/gpt-4.1-mini", "anthropic/claude-3.5-sonnet", "google/gemini-2.5-flash", "deepseek/deepseek-chat", "qwen/qwen3-coder"],
    defaultModel: "openai/gpt-4.1-mini",
    needsKey: true,
    keyEnv: "OPENROUTER_API_KEY"
  },
  {
    id: "ollama",
    label: "Ollama",
    group: "local",
    kind: "ollama",
    baseUrl: "http://localhost:11434",
    models: ["llama3.1", "qwen2.5-coder", "mistral", "gemma2"],
    defaultModel: "llama3.1",
    needsKey: false,
    note: "Start Ollama locally before testing."
  },
  {
    id: "lmstudio",
    label: "LM Studio",
    group: "local",
    kind: "openai-compatible",
    baseUrl: "http://localhost:1234/v1",
    models: ["local-model"],
    defaultModel: "local-model",
    needsKey: false,
    note: "Start the LM Studio local server first."
  },
  {
    id: "custom",
    label: "Custom OpenAI-compatible",
    group: "custom",
    kind: "openai-compatible",
    baseUrl: "http://localhost:8000/v1",
    models: ["custom-model"],
    defaultModel: "custom-model",
    needsKey: false,
    advanced: true
  }
];

export function findProvider(id: string) {
  return providerRegistry.find((provider) => provider.id === id);
}
