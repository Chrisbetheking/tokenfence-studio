import type { ProviderModel } from './types';
import { storeGet, storeSet } from "./agent-runtime/safeStorage";

export interface ProviderConfig {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  endpoint: string;
  deployment: 'cloud' | 'local';
  enabled: boolean;
  lastHealthCheck?: number;
  lastHealthStatus?: 'ok' | 'degraded' | 'failed' | 'unknown';
  lastHealthError?: string;
}

export const PROVIDERS: ProviderModel[] = [
  { provider: 'OpenAI', model: 'gpt-4o', deployment: 'cloud', bestFor: 'General purpose, coding, reasoning', riskPolicy: 'Standard cloud policy' },
  { provider: 'Claude', model: 'claude-sonnet-4-20250514', deployment: 'cloud', bestFor: 'Long documents, nuanced analysis', riskPolicy: 'Standard cloud policy' },
  { provider: 'Gemini', model: 'gemini-2.5-pro', deployment: 'cloud', bestFor: 'Multimodal, large context', riskPolicy: 'Standard cloud policy' },
  { provider: 'DeepSeek', model: 'deepseek-chat', deployment: 'cloud', bestFor: 'Cost-efficient reasoning, Chinese', riskPolicy: 'Cloud, hosted in China' },
  { provider: 'Qwen', model: 'qwen-max', deployment: 'cloud', bestFor: 'Chinese language, multilingual', riskPolicy: 'Cloud, hosted in China' },
  { provider: 'Kimi', model: 'moonshot-v1-128k', deployment: 'cloud', bestFor: 'Chinese web search, long context', riskPolicy: 'Cloud, hosted in China' },
  { provider: 'Doubao', model: 'doubao-pro-256k', deployment: 'cloud', bestFor: 'Chinese contexts, long text', riskPolicy: 'Cloud, hosted in China' },
  { provider: 'Zhipu', model: 'glm-4-plus', deployment: 'cloud', bestFor: 'Chinese enterprise AI, GLM series', riskPolicy: 'Cloud, hosted in China' },
  { provider: 'Ollama', model: 'llama3.2', deployment: 'local', bestFor: 'Fully offline, privacy-first', riskPolicy: 'Local only, no data leaves device' },
  { provider: 'LM Studio', model: 'local-model', deployment: 'local', bestFor: 'Local inference, zero telemetry', riskPolicy: 'Local only, no data leaves device' },
  { provider: 'Custom', model: 'custom', deployment: 'cloud', bestFor: 'OpenAI-compatible endpoints', riskPolicy: 'Depends on endpoint configuration' },
];

export const PROVIDER_ENDPOINTS: Record<string, { baseUrl: string; chatEndpoint: string; modelsEndpoint: string }> = {
  OpenAI:     { baseUrl: 'https://api.openai.com', chatEndpoint: '/v1/chat/completions', modelsEndpoint: '/v1/models' },
  Claude:     { baseUrl: 'https://api.anthropic.com', chatEndpoint: '/v1/messages', modelsEndpoint: '/v1/models' },
  Gemini:     { baseUrl: 'https://generativelanguage.googleapis.com', chatEndpoint: '/v1beta/models/{model}:generateContent', modelsEndpoint: '/v1beta/models' },
  DeepSeek:   { baseUrl: 'https://api.deepseek.com', chatEndpoint: '/v1/chat/completions', modelsEndpoint: '/v1/models' },
  Qwen:       { baseUrl: 'https://dashscope.aliyuncs.com', chatEndpoint: '/compatible-mode/v1/chat/completions', modelsEndpoint: '/compatible-mode/v1/models' },
  Kimi:       { baseUrl: 'https://api.moonshot.cn', chatEndpoint: '/v1/chat/completions', modelsEndpoint: '/v1/models' },
  Doubao:     { baseUrl: 'https://ark.cn-beijing.volces.com', chatEndpoint: '/api/v3/chat/completions', modelsEndpoint: '/api/v3/models' },
  Zhipu:      { baseUrl: 'https://open.bigmodel.cn', chatEndpoint: '/api/paas/v4/chat/completions', modelsEndpoint: '/api/paas/v4/models' },
  Ollama:     { baseUrl: 'http://localhost:11434', chatEndpoint: '/api/chat', modelsEndpoint: '/api/tags' },
  'LM Studio':{ baseUrl: 'http://localhost:1234', chatEndpoint: '/v1/chat/completions', modelsEndpoint: '/v1/models' },
  Custom:     { baseUrl: 'http://localhost:8080', chatEndpoint: '/v1/chat/completions', modelsEndpoint: '/v1/models' },
};

export function recommendModel(riskLevel: string): ProviderModel[] {
  if (riskLevel === 'high') {
    return PROVIDERS.filter((p) => p.deployment === 'local');
  }
  return PROVIDERS;
}

const STORAGE_KEY = 'tokenfence-provider-configs';

export function loadProviderConfigs(): ProviderConfig[] {
  try {
    const raw = storeGet(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return PROVIDERS.map((p) => ({
    provider: p.provider,
    model: p.model,
    apiKey: '',
    baseUrl: PROVIDER_ENDPOINTS[p.provider]?.baseUrl ?? '',
    endpoint: PROVIDER_ENDPOINTS[p.provider]?.chatEndpoint ?? '/v1/chat/completions',
    deployment: p.deployment,
    enabled: false,
    lastHealthStatus: 'unknown' as const,
  }));
}

export function saveProviderConfigs(configs: ProviderConfig[]): void {
  storeSet(STORAGE_KEY, JSON.stringify(configs));
}

export async function healthCheckProvider(config: ProviderConfig): Promise<ProviderConfig> {
  const start = Date.now();
  if (!config.apiKey && config.deployment === 'cloud') {
    return { ...config, lastHealthCheck: start, lastHealthStatus: 'failed', lastHealthError: 'No API key configured' };
  }

  const endpoint = PROVIDER_ENDPOINTS[config.provider];
  if (!endpoint) {
    return { ...config, lastHealthCheck: start, lastHealthStatus: 'failed', lastHealthError: 'Unknown provider endpoint' };
  }

  try {
    const url = `${config.baseUrl || endpoint.baseUrl}${endpoint.modelsEndpoint}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey) {
      if (config.provider === 'Claude') {
        headers['x-api-key'] = config.apiKey;
        headers['anthropic-version'] = '2023-06-01';
      } else if (config.provider === 'Gemini') {
        headers['x-goog-api-key'] = config.apiKey;
      } else {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (resp.ok) {
      return { ...config, lastHealthCheck: Date.now(), lastHealthStatus: 'ok', lastHealthError: undefined };
    }
    if (resp.status === 401 || resp.status === 403) {
      return { ...config, lastHealthCheck: Date.now(), lastHealthStatus: 'failed', lastHealthError: `Auth failed (${resp.status})` };
    }
    return { ...config, lastHealthCheck: Date.now(), lastHealthStatus: 'degraded', lastHealthError: `HTTP ${resp.status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('abort') || msg.includes('timeout')) {
      return { ...config, lastHealthCheck: Date.now(), lastHealthStatus: 'degraded', lastHealthError: 'Connection timeout' };
    }
    return { ...config, lastHealthCheck: Date.now(), lastHealthStatus: 'failed', lastHealthError: msg };
  }
}

export function getProviderByModel(modelId: string): ProviderModel | undefined {
  return PROVIDERS.find((p) => p.model === modelId);
}

export function getProviderByName(name: string): ProviderModel | undefined {
  return PROVIDERS.find((p) => p.provider.toLowerCase() === name.toLowerCase());
}
