import { loadProviderConfigs, saveProviderConfigs, PROVIDER_ENDPOINTS, type ProviderConfig } from "@tokenfence/shared/src/providers";
import { loadInstalledModels, getEnabledModels, type InstalledModel } from "@tokenfence/shared/src/installed-models";
import {
  MODEL_REGISTRY, getModelsForProvider, getProviderIds,
  getDefaultModelForProvider, type ModelRegistryItem,
} from "@tokenfence/shared/src/model-registry";

/* ============================================================
   active-model.ts — Unified Active Model State v1.2.8
   Storage key: tokenfence.activeModel
   ============================================================ */

export interface ActiveModel {
  providerId: string;
  modelId: string;
  displayName: string;
  source: "installed" | "custom" | "library" | "fallback";
  configured: boolean;
  healthy: boolean;
  lastSetAt: number;
}

const STORAGE_KEY = "tokenfence.activeModel";

/* ---------- Persistence ---------- */

export function loadActiveModel(): ActiveModel | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.providerId || !parsed?.modelId) return null;
    return parsed as ActiveModel;
  } catch {
    return null;
  }
}

export function saveActiveModel(am: ActiveModel): void {
  try {
    am.lastSetAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(am));
  } catch { /* ignore */ }
}

export function clearActiveModel(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

/* ---------- Resolve ---------- */

export interface ResolvedModel {
  providerId: string;
  modelId: string;
  displayName: string;
  source: ActiveModel["source"];
  configured: boolean;
  healthy: boolean;
  providerConfig: ProviderConfig | null;
  registryItem: ModelRegistryItem | null;
}

export function resolveActiveModel(): ResolvedModel | null {
  // 1. Try localStorage activeModel
  const saved = loadActiveModel();
  if (saved) {
    const configs = loadProviderConfigs();
    const cfg = configs.find((c) => c.provider === saved.providerId && c.enabled && c.apiKey);
    if (cfg) {
      const reg = MODEL_REGISTRY.find((m) => m.providerId === saved.providerId && m.modelId === saved.modelId);
      return {
        providerId: saved.providerId,
        modelId: saved.modelId,
        displayName: saved.displayName || reg?.displayName || saved.modelId,
        source: saved.source || "installed",
        configured: true,
        healthy: cfg.lastHealthStatus === "ok",
        providerConfig: cfg,
        registryItem: reg || null,
      };
    }
  }

  // 2. Fallback: find any enabled + configured provider
  const configs = loadProviderConfigs();
  const enabled = configs.filter((c) => c.enabled && c.apiKey);

  // Prefer healthy ones
  const healthy = enabled.filter((c) => c.lastHealthStatus === "ok");
  const pool = healthy.length > 0 ? healthy : enabled;

  if (pool.length > 0) {
    const cfg = pool[0];
    const defModel = getDefaultModelForProvider(cfg.provider) ?? getModelsForProvider(cfg.provider)[0];
    if (defModel) {
      const resolved: ResolvedModel = {
        providerId: cfg.provider,
        modelId: defModel.modelId,
        displayName: defModel.displayName,
        source: "library",
        configured: true,
        healthy: cfg.lastHealthStatus === "ok",
        providerConfig: cfg,
        registryItem: defModel,
      };
      // Auto-save fallback
      saveActiveModel({
        providerId: resolved.providerId,
        modelId: resolved.modelId,
        displayName: resolved.displayName,
        source: "fallback",
        configured: true,
        healthy: resolved.healthy,
        lastSetAt: Date.now(),
      });
      return resolved;
    }
  }

  // 3. No configured provider: return unconfigured fallback
  const fallbackReg = getModelsForProvider("OpenAI")[0];
  if (fallbackReg) {
    return {
      providerId: "OpenAI",
      modelId: fallbackReg.modelId,
      displayName: fallbackReg.displayName,
      source: "fallback",
      configured: false,
      healthy: false,
      providerConfig: null,
      registryItem: fallbackReg,
    };
  }

  return null;
}

/* ---------- Set Active Model ---------- */

export function setActiveModel(
  providerId: string,
  modelId: string,
  displayName?: string,
  source: ActiveModel["source"] = "installed",
): void {
  const configs = loadProviderConfigs();
  const cfg = configs.find((c) => c.provider === providerId && c.enabled && c.apiKey);
  saveActiveModel({
    providerId,
    modelId,
    displayName: displayName || modelId,
    source,
    configured: !!cfg,
    healthy: cfg?.lastHealthStatus === "ok",
    lastSetAt: Date.now(),
  });
}

/* ---------- Pre-send Validation ---------- */

export interface ModelValidationResult {
  valid: boolean;
  errorKey: string;
  errorEn: string;
  errorZh: string;
}

export function validateModelForSend(): ModelValidationResult {
  const resolved = resolveActiveModel();

  if (!resolved) {
    return {
      valid: false,
      errorKey: "model.notConfigured",
      errorEn: "Model not configured. Please configure a provider API key first.",
      errorZh: "\u6A21\u578B\u672A\u914D\u7F6E\uFF0C\u8BF7\u5148\u5728\u6A21\u578B \u2192 \u63D0\u4F9B\u5546\u4E2D\u914D\u7F6E API Key\u3002",
    };
  }

  if (!resolved.configured) {
    return {
      valid: false,
      errorKey: "model.notConfigured",
      errorEn: "Provider \"" + resolved.providerId + "\" is not configured. Please configure the API key first.",
      errorZh: "\u63D0\u4F9B\u5546 \"" + resolved.providerId + "\" \u672A\u914D\u7F6E\uFF0C\u8BF7\u5148\u914D\u7F6E API Key\u3002",
    };
  }

  if (!resolved.providerConfig?.apiKey) {
    return {
      valid: false,
      errorKey: "model.noApiKey",
      errorEn: "No API key configured for " + resolved.providerId + ". Please add your API key in Models > Providers.",
      errorZh: resolved.providerId + " \u672A\u914D\u7F6E API Key\uFF0C\u8BF7\u5728\u6A21\u578B > \u63D0\u4F9B\u5546\u4E2D\u6DFB\u52A0\u3002",
    };
  }

  if (!resolved.providerConfig.baseUrl && !PROVIDER_ENDPOINTS[resolved.providerId]?.baseUrl) {
    return {
      valid: false,
      errorKey: "model.noBaseUrl",
      errorEn: "No base URL configured for " + resolved.providerId + ".",
      errorZh: resolved.providerId + " \u672A\u914D\u7F6E Base URL\u3002",
    };
  }

  if (!resolved.modelId) {
    return {
      valid: false,
      errorKey: "model.noModelId",
      errorEn: "No model selected.",
      errorZh: "\u672A\u9009\u62E9\u6A21\u578B\u3002",
    };
  }

  return { valid: true, errorKey: "", errorEn: "", errorZh: "" };
}

/* ---------- Health Check ---------- */

export interface HealthResult {
  status: "ok" | "degraded" | "failed" | "unknown" | "not_configured";
  latencyMs?: number;
  error?: string;
  testedAt: number;
}

export async function runProviderHealthCheck(config: ProviderConfig): Promise<HealthResult> {
  if (!config.apiKey) {
    return { status: "not_configured", error: "No API key configured", testedAt: Date.now() };
  }

  const ep = PROVIDER_ENDPOINTS[config.provider];
  if (!ep) {
    return { status: "failed", error: "Unknown provider: " + config.provider, testedAt: Date.now() };
  }

  const baseUrl = config.baseUrl || ep.baseUrl;
  const model = config.defaultModel || config.model || getDefaultModelForProvider(config.provider)?.modelId || "gpt-4o";
  const url = baseUrl + ep.chatEndpoint.replace("{model}", model);

  // Claude/Gemini: mark as not implemented for health check
  if (config.provider === "Claude" || config.provider === "Gemini") {
    return { status: "degraded", error: "Health check adapter not implemented yet.", testedAt: Date.now() };
  }

  const start = performance.now();

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + config.apiKey,
    };

    const body = JSON.stringify({
      model,
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 1,
    });

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(15000),
    });

    const latencyMs = Math.round(performance.now() - start);

    if (resp.ok) {
      return { status: "ok", latencyMs, testedAt: Date.now() };
    }

    if (resp.status === 401 || resp.status === 403) {
      return { status: "failed", error: "Auth error (HTTP " + resp.status + ")", latencyMs, testedAt: Date.now() };
    }

    const text = await resp.text().catch(() => "");
    return {
      status: "degraded",
      error: "HTTP " + resp.status + ": " + text.slice(0, 200),
      latencyMs,
      testedAt: Date.now(),
    };
  } catch (e: any) {
    const latencyMs = Math.round(performance.now() - start);
    if (e.name === "TimeoutError" || e.name === "AbortError") {
      return { status: "failed", error: "Connection timeout (15s)", latencyMs, testedAt: Date.now() };
    }
    return { status: "failed", error: "Network error: " + (e.message || "Unknown"), latencyMs, testedAt: Date.now() };
  }
}

/* ---------- Persist health results ---------- */

const HEALTH_KEY = "tokenfence.providerHealth";

export interface SavedHealth {
  [providerId: string]: HealthResult;
}

export function loadHealthResults(): SavedHealth {
  try {
    const raw = localStorage.getItem(HEALTH_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveHealthResult(providerId: string, result: HealthResult): void {
  const all = loadHealthResults();
  all[providerId] = result;
  try { localStorage.setItem(HEALTH_KEY, JSON.stringify(all)); } catch {}
}

/* ---------- Custom Models ---------- */

const CUSTOM_KEY = "tokenfence.customModels";

export interface CustomModelEntry {
  id: string;
  providerId: string;
  providerName: string;
  modelId: string;
  displayName: string;
  baseUrl: string;
  apiKey: string;
  contextLength: number;
  modelType: "chat" | "reasoning" | "coding" | "vision";
  addedAt: number;
}

export function loadCustomModels(): CustomModelEntry[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomModel(entry: CustomModelEntry): void {
  const models = loadCustomModels();
  const idx = models.findIndex((m) => m.id === entry.id);
  if (idx >= 0) models[idx] = entry;
  else models.push(entry);
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(models)); } catch {}
}

export function removeCustomModel(id: string): void {
  const models = loadCustomModels().filter((m) => m.id !== id);
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(models)); } catch {}
}

export function customModelToProviderConfig(entry: CustomModelEntry): ProviderConfig {
  return {
    provider: entry.providerId,
    displayName: entry.providerName,
    deployment: "cloud" as const,
    enabled: true,
    apiKey: entry.apiKey,
    baseUrl: entry.baseUrl,
    defaultModel: entry.modelId,
    model: entry.modelId,
    lastHealthStatus: "unknown" as const,
  };
}
