import { useState, useCallback, useMemo } from "react";
import { tk } from "@tokenfence/shared/src/i18n";
import {
  PROVIDERS,
  PROVIDER_ENDPOINTS,
  loadProviderConfigs,
  saveProviderConfigs,
  healthCheckProvider,
} from "@tokenfence/shared/src/providers";
import type { ProviderConfig } from "@tokenfence/shared/src/providers";
import { getModelsForProvider, getProviderIds } from "@tokenfence/shared/src/model-registry";
import { ProviderModelSelect } from "../components/ProviderModelSelect";

interface EditState {
  provider: string;
  model: string;
  customModelId?: string;
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
}

const PROVIDER_ICONS: Record<string, string> = {
  OpenAI: "\u{1F916}", Claude: "\u{1F9E0}", Gemini: "\u{1F4CE}",
  DeepSeek: "\u{1F30A}", Qwen: "\u2601\uFE0F", Kimi: "\u{1F31F}",
  Doubao: "\u{1FADB}", Zhipu: "\u{1F3EE}",
  xAI: "\u{1F31F}", Mistral: "\u{1F4A8}", Cohere: "\u{1F91D}",
  Perplexity: "\u{1F50D}", Groq: "\u26A1", Together: "\u{1F91D}",
  Ollama: "\u{1F42B}", "LM Studio": "\u{1F4BB}", Custom: "\u2699\uFE0F",
};

export function ProvidersScreen() {
  const [configs, setConfigs] = useState<ProviderConfig[]>(loadProviderConfigs());
  const [testingId, setTestingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const providerIds = useMemo(() => getProviderIds(), []);

  const save = useCallback((next: ProviderConfig[]) => {
    setConfigs(next);
    saveProviderConfigs(next);
  }, []);

  const toggleEnabled = useCallback((provider: string) => {
    setConfigs((prev) => {
      const next = prev.map((c) => (c.provider === provider ? { ...c, enabled: !c.enabled } : c));
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

  const openEdit = useCallback((c: ProviderConfig) => {
    setEditing({
      provider: c.provider,
      model: c.model,
      customModelId: c.customModelId,
      baseUrl: c.baseUrl,
      apiKey: c.apiKey,
      enabled: c.enabled,
    });
  }, []);

  const saveEdit = useCallback(() => {
    if (!editing) return;
    setConfigs((prev) => {
      const next = prev.map((c) =>
        c.provider === editing.provider
          ? { ...c, model: editing.model, customModelId: editing.customModelId, baseUrl: editing.baseUrl, apiKey: editing.apiKey, enabled: editing.enabled }
          : c
      );
      saveProviderConfigs(next);
      return next;
    });
    setEditing(null);
  }, [editing]);

  const getProviderDisplayName = (pid: string) => {
    const key = "providers." + pid.toLowerCase().replace(/\s+/g, "");
    const translated = tk(key);
    if (translated === key || translated === pid) return pid;
    return translated;
  };

  return (
    <div>
      <h1 className="page-title">{tk("nav.providers")}</h1>
      <p className="page-subtitle">{tk("providers.configure")}</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn btn-primary" onClick={runAllHealthChecks}>{tk("providers.runAllHealth")}</button>
        <span className="badge badge-green">{configs.filter((c) => c.enabled).length} {tk("status.enabled")}</span>
        <span className="badge badge-blue">{configs.filter((c) => c.lastHealthStatus === "ok").length} {tk("providers.healthy")}</span>
      </div>

      {/* Summary Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {configs.map((config) => {
          const icon = PROVIDER_ICONS[config.provider] ?? "\u{1F310}";
          const modelCount = getModelsForProvider(config.provider).length;
          const isCustom = config.provider === "Custom";
          const testing = testingId === config.provider;
          const statusColor =
            config.lastHealthStatus === "ok" ? "var(--green)" :
            config.lastHealthStatus === "degraded" ? "var(--amber)" :
            config.lastHealthStatus === "error" ? "var(--red)" : "var(--text-muted)";

          return (
            <div
              key={config.provider}
              className="card"
              style={{ padding: 14, cursor: "pointer" }}
              onClick={() => openEdit(config)}
            >
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>
                      {getProviderDisplayName(config.provider)}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {isCustom ? tk("common.customModel") : (config.deployment === "local" ? tk("providers.local") + " · " : tk("providers.cloud") + " · ") + modelCount + " " + tk("providers.modelsAvailable")}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor }}></span>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                    onClick={(e) => { e.stopPropagation(); toggleEnabled(config.provider); }}
                  >
                    {config.enabled ? tk("actions.disable") : tk("actions.enable")}
                  </button>
                </div>
              </div>

              {/* Model info */}
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                {config.customModelId || config.model || tk("providers.noModel")}
              </div>

              {/* Health status */}
              {config.lastHealthCheck && (
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4 }}>
                  {tk("providers.lastCheck")}: {new Date(config.lastHealthCheck).toLocaleString()}
                </div>
              )}
              {config.lastHealthError && (
                <div style={{ fontSize: "0.65rem", color: "var(--red)", marginBottom: 4 }}>{config.lastHealthError.slice(0, 80)}</div>
              )}

              {/* Quick health check button */}
              <button
                className="btn btn-secondary"
                style={{ marginTop: 6, fontSize: "0.72rem", padding: "3px 10px", width: "100%" }}
                disabled={testing}
                onClick={(e) => { e.stopPropagation(); runHealthCheck(config.provider); }}
              >
                {testing ? tk("providers.testing") : tk("providers.healthCheck")}
              </button>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: 16,
          }}
          onClick={() => setEditing(null)}
        >
          <div
            className="card"
            style={{
              background: "var(--surface)", maxWidth: 480, width: "100%",
              padding: 24, borderRadius: 16, maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "var(--text)" }}>
                {tk("providers.editProvider")}: {getProviderDisplayName(editing.provider)}
              </h3>
              <button
                onClick={() => setEditing(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem", padding: "2px 6px" }}
              >{"\u2715"}</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Model select */}
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: 4, fontWeight: 500 }}>
                  {tk("providers.model")}
                </label>
                <ProviderModelSelect
                  providerId={editing.provider}
                  selectedModelId={editing.model}
                  customModelId={editing.customModelId}
                  onChange={(mid, cid) => setEditing({ ...editing, model: mid, customModelId: cid })}
                  allowCustom={editing.provider === "Custom"}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: 4, fontWeight: 500 }}>
                  {tk("providers.baseUrl")}
                </label>
                <input className="input" style={{ width: "100%", padding: "7px 10px", fontSize: "0.75rem", fontFamily: "monospace", borderRadius: 8 }}
                  value={editing.baseUrl}
                  onChange={(e) => setEditing({ ...editing, baseUrl: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: 4, fontWeight: 500 }}>
                  {tk("providers.apiKey")}
                </label>
                <input className="input" type="password" style={{ width: "100%", padding: "7px 10px", fontSize: "0.75rem", fontFamily: "monospace", borderRadius: 8 }}
                  value={editing.apiKey}
                  onChange={(e) => setEditing({ ...editing, apiKey: e.target.value })}
                  placeholder="sk-..." />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label className="toggle">
                  <input type="checkbox" checked={editing.enabled}
                    onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} />
                  <span>{editing.enabled ? tk("status.enabled") : tk("status.disabled")}</span>
                </label>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button className="btn btn-primary" style={{ flex: 1, borderRadius: 10 }} onClick={saveEdit}>{tk("actions.save")}</button>
                <button className="btn btn-secondary" style={{ flex: 1, borderRadius: 10 }} onClick={() => setEditing(null)}>{tk("actions.cancel")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
