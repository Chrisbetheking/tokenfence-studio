import { useState, useCallback } from "react";
import { getBuiltinPlugins } from "@tokenfence/shared/src/plugins/builtin";
import { PROVIDERS } from "@tokenfence/shared/src/providers";
import { isTauri } from "../desktop-bridge";

export function Dashboard() {
  const [tauriAvailable, setTauriAvailable] = useState<boolean | null>(null);
  const plugins = getBuiltinPlugins();
  const installedPlugins = plugins.filter((p) => p.installed);
  const localProviders = PROVIDERS.filter((p) => p.deployment === "local");
  const cloudProviders = PROVIDERS.filter((p) => p.deployment === "cloud");

  const init = useCallback(async () => {
    setTauriAvailable(await isTauri());
  }, []);
  useState(() => { init(); });

  return (
    <div>
      <h1 className="page-title">TokenFence Studio</h1>
      <p className="page-subtitle">Local-first AI Agent Workspace — v1.0.0-rc1 Product Candidate</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Providers</div>
          <div className="stat-value">{PROVIDERS.length}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>{cloudProviders.length} cloud + {localProviders.length} local</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Plugins</div>
          <div className="stat-value">{plugins.length}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>{installedPlugins.length} installed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Desktop</div>
          <div className="stat-value" style={{ fontSize: "1.2rem" }}>{tauriAvailable === null ? "..." : tauriAvailable ? "Connected" : "Browser"}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>{tauriAvailable ? "Local runtime active" : "Web mode"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Version</div>
          <div className="stat-value" style={{ fontSize: "1rem" }}>v1.0.0-rc1</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>Product candidate</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {/* Runtime Status */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Local Runtime</div>
            <span className={`badge ${tauriAvailable ? "badge-green" : "badge-amber"}`}>{tauriAvailable ? "Active" : "Browser"}</span>
          </div>
          <div style={{ fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>Command Execution</span>
              <span style={{ color: tauriAvailable ? "var(--green)" : "var(--text-tertiary)" }}>{tauriAvailable ? "Ready" : "Browser-only"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>File I/O</span>
              <span style={{ color: tauriAvailable ? "var(--green)" : "var(--text-tertiary)" }}>{tauriAvailable ? "Ready" : "Browser-only"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>Output Generation</span>
              <span style={{ color: "var(--green)" }}>MD, HTML, JSON, PDF, DOCX</span>
            </div>
          </div>
        </div>

        {/* Provider Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">AI Providers</div>
            <span className="badge badge-blue">{PROVIDERS.length} total</span>
          </div>
          <div style={{ fontSize: "0.82rem" }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Cloud Providers</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {cloudProviders.map((p) => (
                <span key={p.provider} className="badge badge-blue">{p.provider}</span>
              ))}
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Local Providers</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {localProviders.map((p) => (
                <span key={p.provider} className="badge badge-green">{p.provider}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Plugin Status */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Plugins</div>
            <span className="badge badge-gray">{plugins.length} built-in</span>
          </div>
          <div style={{ fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: 4 }}>
            {plugins.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{p.name}</span>
                <span style={{ color: p.installed ? "var(--green)" : "var(--text-tertiary)", fontSize: "0.75rem" }}>{p.installed ? "Installed" : "Available"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="card">
          <div className="card-header"><div className="card-title">Quick Start</div></div>
          <div style={{ fontSize: "0.85rem" }}>
            <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              <li>Go to <strong>Providers</strong> — configure your AI model keys</li>
              <li>Go to <strong>Plugin Store</strong> — install plugins</li>
              <li>Go to <strong>Agent Lab</strong> — run local tasks</li>
              <li>Go to <strong>Output</strong> — generate files</li>
              <li>Go to <strong>Routing</strong> — test fallback chains</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

