import { useState, useCallback } from "react";
import {
  PROVIDERS,
  PROVIDER_ENDPOINTS,
  loadProviderConfigs,
  saveProviderConfigs,
  healthCheckProvider,
} from "@tokenfence/shared/src/providers";
import type { ProviderConfig } from "@tokenfence/shared/src/providers";

export function ProvidersScreen() {
  const [configs, setConfigs] = useState<ProviderConfig[]>(loadProviderConfigs());
  const [testingId, setTestingId] = useState<string | null>(null);

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

  return (
    <div>
      <h1 className="page-title">Model Providers</h1>
      <p className="page-subtitle">Configure AI model providers, set API keys, and run health checks</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={runAllHealthChecks}>Run All Health Checks</button>
        <span className="badge badge-green" style={{ alignSelf: "center" }}>{configs.filter((c) => c.enabled).length} enabled</span>
        <span className="badge badge-blue" style={{ alignSelf: "center" }}>{configs.filter((c) => c.lastHealthStatus === "ok").length} healthy</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
        {configs.map((config) => {
          const endpoint = PROVIDER_ENDPOINTS[config.provider];
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
                  <span>{config.enabled ? "On" : "Off"}</span>
                </label>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.82rem" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--text-secondary)", minWidth: 60 }}>Model:</span>
                  <input className="input" style={{ flex: 1, padding: "4px 8px" }} value={config.model} onChange={(e) => updateConfig(config.provider, { model: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--text-secondary)", minWidth: 60 }}>Base URL:</span>
                  <input className="input" style={{ flex: 1, padding: "4px 8px", fontFamily: "monospace", fontSize: "0.75rem" }} value={config.baseUrl} onChange={(e) => updateConfig(config.provider, { baseUrl: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--text-secondary)", minWidth: 60 }}>API Key:</span>
                  <input className="input" type="password" style={{ flex: 1, padding: "4px 8px", fontFamily: "monospace" }} value={config.apiKey} onChange={(e) => updateConfig(config.provider, { apiKey: e.target.value })} placeholder={config.deployment === "local" ? "Not required" : "sk-..."} />
                </div>
                {config.lastHealthError && (
                  <div style={{ color: "var(--red)", fontSize: "0.75rem", marginTop: 4 }}>Last error: {config.lastHealthError}</div>
                )}
                {config.lastHealthCheck && (
                  <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>Last check: {new Date(config.lastHealthCheck).toLocaleString()}</div>
                )}
                <button className="btn btn-secondary" style={{ marginTop: 4, fontSize: "0.8rem", padding: "4px 12px" }} disabled={testing} onClick={() => runHealthCheck(config.provider)}>
                  {testing ? "Testing..." : "Health Check"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

