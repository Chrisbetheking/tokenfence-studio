import { useState, useCallback } from "react";
import {
  getRouterRules,
  setRouterRules,
  routeTask,
  markProviderHealthy,
  markProviderUnhealthy,
  loadRouterRules,
} from "@tokenfence/shared/src/plugins/model-router";
import type { RouterRule, TaskCategory, RoutingDecision } from "@tokenfence/shared/src/plugins/model-router";

const categories: TaskCategory[] = ["general", "code", "document", "creative", "analysis", "safety", "agent"];

export function RoutingScreen() {
  const [rules, setRules] = useState<RouterRule[]>(getRouterRules());
  const [decisions, setDecisions] = useState<{ category: TaskCategory; decision: RoutingDecision }[]>([]);

  const runAllRoutes = useCallback(() => {
    const results = categories.map((cat) => ({
      category: cat,
      decision: routeTask(cat),
    }));
    setDecisions(results);
  }, []);

  const resetHealth = (provider: string) => {
    markProviderHealthy(provider);
    runAllRoutes();
  };

  const markUnhealthy = (provider: string) => {
    markProviderUnhealthy(provider);
    runAllRoutes();
  };

  return (
    <div>
      <h1 className="page-title">Model Router</h1>
      <p className="page-subtitle">Auto-route tasks to the best model with intelligent fallback chains</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={runAllRoutes}>Run All Routes</button>
        <button className="btn btn-secondary" onClick={() => { loadRouterRules(); setRules(getRouterRules()); }}>Reload Rules</button>
      </div>

      {decisions.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><div className="card-title">Current Routing Decisions</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 8 }}>
            {decisions.map((d) => (
              <div key={d.category} className={`card ${d.decision.isFallback ? "" : ""}`} style={{ padding: 10, borderLeft: `4px solid ${d.decision.isFallback ? "var(--amber)" : "var(--green)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{d.category}</strong>
                  <span className={`badge ${d.decision.isFallback ? "badge-amber" : "badge-green"}`}>{d.decision.isFallback ? `Fallback #${d.decision.fallbackIndex}` : "Primary"}</span>
                </div>
                <div style={{ fontSize: "0.85rem" }}>
                  {d.decision.provider} / {d.decision.model}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{d.decision.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><div className="card-title">Router Rules</div></div>
        {rules.map((rule) => (
          <div key={rule.taskCategory} className="card" style={{ padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <strong>{rule.taskCategory.toUpperCase()}</strong>
              <span className={`badge ${rule.localPreferred ? "badge-green" : "badge-blue"}`}>{rule.localPreferred ? "Local Preferred" : "Cloud"}</span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Primary: {rule.primaryProvider} / {rule.primaryModel}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", marginTop: 2 }}>
              Fallback chain: {rule.fallbackChain.join(" → ")}
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              <button className="btn btn-secondary" style={{ fontSize: "0.7rem", padding: "2px 8px" }} onClick={() => markUnhealthy(rule.primaryProvider)}>Mark {rule.primaryProvider} Unhealthy</button>
              <button className="btn btn-secondary" style={{ fontSize: "0.7rem", padding: "2px 8px" }} onClick={() => resetHealth(rule.primaryProvider)}>Reset {rule.primaryProvider}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

