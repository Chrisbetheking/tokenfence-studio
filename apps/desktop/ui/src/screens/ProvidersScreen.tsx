import { useState, useCallback } from "react";
import { tk } from "@tokenfence/shared/src/i18n";
import {
  PROVIDERS,
  PROVIDER_ENDPOINTS,
  loadProviderConfigs,
  saveProviderConfigs,
  healthCheckProvider,
} from "@tokenfence/shared/src/providers";
import type { ProviderConfig } from "@tokenfence/shared/src/providers";

async function fetchProviderModels(provider: string, apiKey: string, baseUrl?: string): Promise<{ id: string }[]> {
  try {
    const ep = PROVIDER_ENDPOINTS[provider];
    if (!ep) return [];
    const modelsUrl = baseUrl ? `${baseUrl}/models` : `${ep.baseUrl}/models`;
    const resp = await fetch(modelsUrl, {
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    const models = data?.data ?? data?.models ?? data ?? [];
    return Array.isArray(models) ? models.map((m: any) => ({ id: m.id ?? m.name ?? m.model })) : [];
  } catch {
    return [];
  }
}

export function ProvidersScreen() {
  const [configs, setConfigs] = useState<ProviderConfig[]>(loadProviderConfigs());
  const [testingId, setTestingId] = useState<string | null>(null);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  const updateConfig = useCallback((provider: string, updates: Partial<ProviderConfig>) => {
    setConfigs((prev) => {
      const next = prev.map((c) => (c.provider === provider ? { ...c, ...updates } : c));
      saveProviderConfigs(next);
      return next;
    });
  }, []);

  const runHealthCheck = useCallback(async (provider: string) => {
    setTestingId(provider);
    const config = configs.find((c) => c.provider === provider);
    if (!config) return;
    const result = await healthCheckProvider(config);
    setConfigs((prev) => {
      const next = prev.map((c) => (c.provider === provider ? result : c));
      saveProviderConfigs(next);
      return next;
    });
    setTestingId(null);
  }, [configs]);

  const runAllHealthChecks = useCallback(async () => {
    for (const c of configs.filter((c) => c.enabled)) {
      setTestingId(c.provider);
      const result = await healthCheckProvider(c);
      setConfigs((prev) => {
        const next = prev.map((p) => (p.provider === c.provider ? result : p));
        saveProviderConfigs(next);
        return next;
      });
    }
    setTestingId(null);
  }, [configs]);

  const refreshModelsFromProvider = useCallback(async (provider: string) => {
    const cfg = configs.find((c) => c.provider === provider);
    if (!cfg || !cfg.apiKey) {
      setRefreshMsg(tk("providersPage.noKeyForRefresh"));
      return;
    }
    setTestingId(provider);
    const models = await fetchProviderModels(provider, cfg.apiKey, cfg.baseUrl);
    if (models.length > 0) {
      setRefreshMsg(tk("providersPage.refreshedModels").replace("{count}", String(models.length)).replace("{provider}", provider));
    } else {
      setRefreshMsg(tk("providersPage.noModelsFound"));
    }
    setTestingId(null);
  }, [configs]);

  return (
    <div>
      <h1 className="page-title">{tk("providersPage.title")}</h1>
      <p className="page-subtitle">{tk("providersPage.subtitle")}</p>

      {refreshMsg && (
        <div className="card" style={{ padding: 8, marginBottom: 12, background: "var(--surface-alt)", fontSize: "0.8rem", color: "var(--text)" }}>
          {refreshMsg}
          <button style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setRefreshMsg(null)}>x</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={runAllHealthChecks}>{tk("providersPage.runAllHC")}</button>
        <button className="btn btn-secondary" onClick={() => { for (const c of configs.filter((c) => c.enabled && c.apiKey)) refreshModelsFromProvider(c.provider); }}>{tk("providersPage.refreshModels")}</button>
        <span className="badge badge-green" style={{ alignSelf: "center" }}>{configs.filter((c) => c.enabled).length} {tk("providersPage.enabledCount")}</span>
        <span className="badge badge-blue" style={{ alignSelf: "center" }}>{configs.filter((c) => c.lastHealthStatus === "ok").length} {tk("providersPage.healthyCount")}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
        {configs.map((config) => {
          const testing = testingId === config.provider;
          return (
            <div key={config.provider} className="card" style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <strong>{config.provider}</strong>
                  <span className={`badge ${config.deployment === "local" ? "badge-green" : "badge-blue"}`} style={{ marginLeft: 8 }}>{config.deployment}</span>
                  {config.lastHealthStatus && (
                    <span className={`badge ${config.lastHealthStatus === "ok" ? "badge-green" : config.lastHealthStatus === "degraded" ? "badge-amber" : "badge-red"}`} style={{ marginLeft: 4 }}>
                      {config.lastHealthStatus}
                    </span>
                  )}
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={config.enabled} onChange={(e) => updateConfig(config.provider, { enabled: e.target.checked })} />
                  <span>{config.enabled ? tk("status.enabled") : tk("status.disabled")}</span>
                </label>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.82rem" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--text-secondary)", minWidth: 60 }}>{tk("providers.model")}:</span>
                  <input className="input" style={{ flex: 1, padding: "4px 8px" }} value={config.model} onChange={(e) => updateConfig(config.provider, { model: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--text-secondary)", minWidth: 60 }}>{tk("providers.baseUrl")}:</span>
                  <input className="input" style={{ flex: 1, padding: "4px 8px", fontFamily: "monospace", fontSize: "0.75rem" }} value={config.baseUrl} onChange={(e) => updateConfig(config.provider, { baseUrl: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--text-secondary)", minWidth: 60 }}>{tk("providers.apiKey")}:</span>
                  <input className="input" type="password" style={{ flex: 1, padding: "4px 8px", fontFamily: "monospace" }} value={config.apiKey} onChange={(e) => updateConfig(config.provider, { apiKey: e.target.value })} placeholder={config.deployment === "local" ? tk("common.none") : "sk-..."} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--text-secondary)", minWidth: 60, fontSize: "0.7rem" }}>{tk("providersPage.customModelHint")}:</span>
                  <input className="input" style={{ flex: 1, padding: "4px 8px", fontSize: "0.7rem" }} value={config.customModelId ?? ""} onChange={(e) => updateConfig(config.provider, { customModelId: e.target.value || undefined })} placeholder={tk("common.none")} />
                </div>
                {config.lastHealthError && (
                  <div style={{ color: "var(--red)", fontSize: "0.75rem", marginTop: 4 }}>{tk("common.error")}: {config.lastHealthError}</div>
                )}
                {config.lastHealthCheck && (
                  <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>{tk("providers.healthCheck")}: {new Date(config.lastHealthCheck).toLocaleString()}</div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "4px 12px" }} disabled={testing} onClick={() => runHealthCheck(config.provider)}>
                    {testing ? tk("common.loading") : tk("providers.healthCheck")}
                  </button>
                  {config.apiKey && (
                    <button className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "4px 12px" }} disabled={testing} onClick={() => refreshModelsFromProvider(config.provider)}>
                      {testing ? tk("common.loading") : tk("providersPage.refreshModels")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
