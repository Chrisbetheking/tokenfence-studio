import { useState, useMemo } from "react";
import { tk } from "@tokenfence/shared/src/i18n";
import { getModelsForProvider, type ModelRegistryItem } from "@tokenfence/shared/src/model-registry";

interface ProviderModelSelectProps {
  providerId: string;
  selectedModelId: string;
  customModelId?: string;
  onChange: (modelId: string, customModelId?: string) => void;
  allowCustom?: boolean;
}

export function ProviderModelSelect({
  providerId, selectedModelId, customModelId, onChange, allowCustom = true,
}: ProviderModelSelectProps) {
  const [search, setSearch] = useState("");
  const [showCustom, setShowCustom] = useState(!!customModelId);

  const models = useMemo(() => getModelsForProvider(providerId), [providerId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return models;
    const q = search.toLowerCase().trim();
    return models.filter((m) =>
      (m.displayName ?? m.modelId).toLowerCase().includes(q) ||
      m.modelId.toLowerCase().includes(q)
    );
  }, [models, search]);

  const isCustom = !models.some((m) => m.modelId === selectedModelId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Search */}
      {models.length > 6 && (
        <input
          className="input"
          style={{ width: "100%", padding: "5px 10px", fontSize: "0.75rem" }}
          placeholder={tk("providers.searchModels")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {/* Model list */}
      <div style={{
        maxHeight: 200, overflowY: "auto",
        border: "1px solid var(--border)", borderRadius: 8,
        background: "var(--surface-alt)",
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "12px", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
            {tk("common.none")}
          </div>
        ) : (
          filtered.map((m) => {
            const isSelected = m.modelId === selectedModelId && !customModelId;
            const caps = (m as any).capabilities as string[] | undefined;
            const ctxWin = (m as any).contextWindow as number | undefined;
            return (
              <div
                key={m.modelId}
                onClick={() => { onChange(m.modelId); setShowCustom(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px", cursor: "pointer",
                  background: isSelected ? "var(--surface)" : "transparent",
                  borderLeft: isSelected ? "3px solid var(--accent)" : "3px solid transparent",
                  fontSize: "0.78rem",
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--surface)"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "var(--text)", fontWeight: isSelected ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.displayName ?? m.modelId}
                  </div>
                  {caps && caps.length > 0 && (
                    <div style={{ display: "flex", gap: 3, marginTop: 2, flexWrap: "wrap" }}>
                      {caps.slice(0, 3).map((c) => (
                        <span key={c} style={{ fontSize: "0.55rem", padding: "1px 4px", borderRadius: 3, background: "var(--surface-alt)", color: "var(--text-muted)" }}>{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                {ctxWin && (
                  <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", flexShrink: 0 }}>{ctxWin >= 1000 ? `${(ctxWin / 1000).toFixed(0)}k` : ctxWin}</span>
                )}
                {isSelected && <span style={{ color: "var(--accent)", fontSize: "0.7rem", flexShrink: 0 }}>{"\u2713"}</span>}
              </div>
            );
          })
        )}
      </div>

      {/* Custom model toggle */}
      {allowCustom && (
        <div style={{ marginTop: 4 }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: "0.7rem", padding: "3px 8px" }}
            onClick={() => setShowCustom(!showCustom)}
          >
            {showCustom ? tk("actions.cancel") : "+ " + tk("common.customModel")}
          </button>
          {showCustom && (
            <div style={{ marginTop: 6 }}>
              <input
                className="input"
                style={{ width: "100%", padding: "5px 10px", fontSize: "0.75rem", fontFamily: "monospace" }}
                placeholder={tk("common.modelId")}
                value={customModelId ?? ""}
                onChange={(e) => onChange(selectedModelId, e.target.value || undefined)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
