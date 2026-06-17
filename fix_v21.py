import os

ROOT = r"E:\Dev\tokenfence-studio-final"

# ====== 1. Fix ProvidersScreen edit modal: add ErrorBoundary + null safety ======
prov_path = os.path.join(ROOT, r"apps\desktop\ui\src\screens\ProvidersScreen.tsx")
with open(prov_path, "r", encoding="utf-8") as f:
    prov = f.read()

# Replace the edit modal section with a safer version
old_modal = '''      {/* Edit Modal */}
      {editingProvider && editingConfig && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setEditingProvider(null)}>
          <div className="card" style={{ background: "var(--surface)", borderRadius: 16, padding: 24, width: 440, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 12px 60px rgba(0,0,0,0.3)", animation: "modalIn 0.2s ease" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "var(--text)" }}>{tk("providers.editProvider")}: {editingConfig.provider}</h3>
              <button onClick={() => setEditingProvider(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.3rem", padding: "4px 8px" }}>&times;</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 4 }}>{tk("providers.model")}</label>
                <input className="input" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: "0.85rem" }} value={editingConfig.model} onChange={(e) => updateConfig(editingConfig.provider, { model: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 4 }}>{tk("providers.baseUrl")}</label>
                <input className="input" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: "0.8rem", fontFamily: "monospace" }} value={editingConfig.baseUrl} onChange={(e) => updateConfig(editingConfig.provider, { baseUrl: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 4 }}>{tk("providers.apiKey")}</label>
                <input className="input" type="password" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: "0.8rem", fontFamily: "monospace" }} value={editingConfig.apiKey} onChange={(e) => updateConfig(editingConfig.provider, { apiKey: e.target.value })} placeholder={editingConfig.deployment === "local" ? tk("common.none") : "sk-..."} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 4 }}>{tk("providersPage.customModelHint")}</label>
                <input className="input" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: "0.8rem" }} value={editingConfig.customModelId ?? ""} onChange={(e) => updateConfig(editingConfig.provider, { customModelId: e.target.value || undefined })} placeholder={tk("common.none")} />
              </div>
              {editingConfig.lastHealthError && (
                <div style={{ color: "var(--red)", fontSize: "0.8rem", padding: "8px 12px", background: "rgba(255,0,0,0.05)", borderRadius: 8 }}>{tk("common.error")}: {editingConfig.lastHealthError}</div>
              )}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setEditingProvider(null)}>{tk("actions.close")}</button>
                <button className="btn btn-primary" onClick={() => { runHealthCheck(editingConfig.provider); }} disabled={testing}>{testing ? tk("providers.testing") : tk("providers.healthCheck")}</button>
              </div>
            </div>
          </div>
        </div>
      )}'''

new_modal = '''      {/* Edit Modal with error boundary */}
      {editingProvider && editingConfig && (
        <EditProviderModal
          config={editingConfig}
          testing={!!testingId}
          onClose={() => setEditingProvider(null)}
          onUpdate={(updates) => updateConfig(editingProvider!, updates)}
          onHealthCheck={() => runHealthCheck(editingProvider!)}
        />
      )}'''

prov = prov.replace(old_modal, new_modal)

# Add EditProviderModal component before export function
old_export = '\nexport function ProvidersScreen() {'
edit_modal_comp = '''
function EditProviderModal({ config, testing, onClose, onUpdate, onHealthCheck }: {
  config: ProviderConfig;
  testing: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<ProviderConfig>) => void;
  onHealthCheck: () => void;
}) {
  try {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
        <div className="card" style={{ background: "var(--surface)", borderRadius: 16, padding: 24, width: 440, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 12px 60px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "var(--text)" }}>{tk("providers.editProvider")}: {config.provider ?? "Unknown"}</h3>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.3rem", padding: "4px 8px" }}>&times;</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 4 }}>{tk("providers.model")}</label>
              <input className="input" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: "0.85rem" }} value={config.model ?? ""} onChange={(e) => onUpdate({ model: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 4 }}>{tk("providers.baseUrl")}</label>
              <input className="input" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: "0.8rem", fontFamily: "monospace" }} value={config.baseUrl ?? ""} onChange={(e) => onUpdate({ baseUrl: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 4 }}>{tk("providers.apiKey")}</label>
              <input className="input" type="password" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: "0.8rem", fontFamily: "monospace" }} value={config.apiKey ?? ""} onChange={(e) => onUpdate({ apiKey: e.target.value })} placeholder={config.deployment === "local" ? tk("common.none") : "sk-..."} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 4 }}>{tk("providersPage.customModelHint")}</label>
              <input className="input" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: "0.8rem" }} value={config.customModelId ?? ""} onChange={(e) => onUpdate({ customModelId: e.target.value || undefined })} placeholder={tk("common.none")} />
            </div>
            {config.lastHealthError && (
              <div style={{ color: "var(--red)", fontSize: "0.8rem", padding: "8px 12px", background: "rgba(255,0,0,0.05)", borderRadius: 8 }}>{tk("common.error")}: {config.lastHealthError}</div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <button className="btn btn-ghost" onClick={onClose}>{tk("actions.close")}</button>
              <button className="btn btn-primary" onClick={onHealthCheck} disabled={testing}>{testing ? tk("providers.testing") : tk("providers.healthCheck")}</button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (e: any) {
    console.error("[EditProviderModal] render error:", e);
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
        <div className="card" style={{ background: "var(--surface)", borderRadius: 16, padding: 24, maxWidth: 400, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>&#9888;</div>
          <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Provider editor failed</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16 }}>{e.message}</div>
          <button className="btn btn-primary" onClick={onClose}>{tk("actions.close")}</button>
        </div>
      </div>
    );
  }
}

export function ProvidersScreen() {'''

prov = prov.replace(old_export, edit_modal_comp)

with open(prov_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(prov)
print("1. Fixed ProvidersScreen: EditProviderModal component with error boundary + null safety")

# ====== 2. Add Project panel inside ChatWorkspace ======
chat_path = os.path.join(ROOT, r"apps\desktop\ui\src\screens\ChatWorkspace.tsx")
with open(chat_path, "r", encoding="utf-8") as f:
    chat = f.read()

# Add projectTab state
chat = chat.replace(
    'const [showModelPanel, setShowModelPanel] = useState(false);',
    'const [showModelPanel, setShowModelPanel] = useState(false);\n  const [projectTab, setProjectTab] = useState(false);'
)

# Add project panel JSX before the left sidebar closing div
# Find: {/* Left: Conversations sidebar */}
# Add project tab toggle and project panel

# Insert project tab toggle in the sidebar header area
old_sidebar_btn = '''          <button onClick={handleNewConversation} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px 12px", fontSize: "0.85rem" }}>
            + {tk("chat.newConversation")}
          </button>'''

new_sidebar_btn = '''          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={handleNewConversation} className="btn btn-primary" style={{ flex: 1, justifyContent: "center", padding: "10px 8px", fontSize: "0.8rem" }}>
              + {tk("chat.newConversation")}
            </button>
            <button onClick={() => setProjectTab(!projectTab)} className={`btn ${projectTab ? "btn-primary" : "btn-ghost"}`} style={{ padding: "10px 8px", fontSize: "0.8rem", minWidth: 36 }} title={projectTab ? tk("common.projects") : tk("common.projects")}>
              {String.fromCodePoint(0x1F4C1)}
            </button>
          </div>'''

chat = chat.replace(old_sidebar_btn, new_sidebar_btn)

# Add project panel after the conversations sidebar, before center chat area
# Find the sidebar closing div before center chat
old_sidebar_end = '''      {/* Center: Chat area */}'''

new_project_panel = '''      {/* Project panel */}
      {projectTab && (
        <div style={{ width: 260, minWidth: 260, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "var(--surface)", overflow: "hidden" }}>
          <ProjectFilePanel
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            attachedFiles={attachedFiles}
            setAttachedFiles={setAttachedFiles}
            onClose={() => setProjectTab(false)}
          />
        </div>
      )}

      {/* Center: Chat area */}'''

chat = chat.replace(old_sidebar_end, new_project_panel)

# Add ProjectFilePanel component to the file
# Insert before the "/* ---- Drag & Drop" or "/* ---- misc" section
project_component = '''
/* ============================================================
   ProjectFilePanel Component
   ============================================================ */

interface ProjectFilePanel {
  activeProject: { id: string; name: string; folderPath: string; files: any[] } | null;
  setActiveProject: React.Dispatch<React.SetStateAction<{ id: string; name: string; folderPath: string; files: any[] } | null>>;
  attachedFiles: AttachedFile[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  onClose: () => void;
}

function ProjectFilePanel({ activeProject, setActiveProject, attachedFiles, setAttachedFiles, onClose }: ProjectFilePanel) {
  const [searchQ, setSearchQ] = useState("");
  const [projects, setProjects] = useState<any[]>(() => {
    try { const ps = storeGet("tokenfence-projects"); return ps ? JSON.parse(ps) : []; } catch { return []; }
  });

  const filteredFiles = useMemo(() => {
    if (!activeProject?.files) return [];
    if (!searchQ.trim()) return activeProject.files;
    const q = searchQ.toLowerCase();
    return activeProject.files.filter((f: any) => f.name.toLowerCase().includes(q));
  }, [activeProject?.files, searchQ]);

  const toggleFile = (fileName: string) => {
    if (!activeProject) return;
    const updated = {
      ...activeProject,
      files: activeProject.files.map((f: any) =>
        f.name === fileName ? { ...f, selected: !f.selected } : f
      ),
    };
    setActiveProject(updated);
    try { storeSet("tokenfence-active-project", updated.id); storeSet("tokenfence-projects", JSON.stringify(projects.map((p: any) => p.id === updated.id ? updated : p))); } catch {}

    // Update Context Pack
    const wasSelected = activeProject.files.find((f: any) => f.name === fileName)?.selected;
    if (!wasSelected) {
      // Add to context
      const content = `[Project: ${activeProject.name}]\\n[File: ${fileName}]\\n`;
      setAttachedFiles((prev) => {
        if (prev.find((f) => f.name === fileName && f.type === "project")) return prev;
        return [...prev, { id: `proj-${fileName}`, name: fileName, size: content.length, type: "project", content }];
      });
    } else {
      // Remove from context
      setAttachedFiles((prev) => prev.filter((f) => f.name !== fileName || f.type !== "project"));
    }
  };

  const toggleAllFiles = (select: boolean) => {
    if (!activeProject) return;
    const updated = {
      ...activeProject,
      files: activeProject.files.map((f: any) => ({ ...f, selected: select })),
    };
    setActiveProject(updated);
    try { storeSet("tokenfence-projects", JSON.stringify(projects.map((p: any) => p.id === updated.id ? updated : p))); } catch {}
    if (select) {
      const newFiles = activeProject.files.map((f: any) => ({
        id: `proj-${f.name}`, name: f.name, size: 0, type: "project",
        content: `[Project: ${activeProject.name}]\\n[File: ${f.name}]\\n`,
      }));
      setAttachedFiles((prev) => {
        const existing = new Set(prev.filter((f) => f.type === "project").map((f) => f.name));
        return [...prev.filter((f) => f.type !== "project"), ...newFiles.filter((f) => !existing.has(f.name))];
      });
    } else {
      setAttachedFiles((prev) => prev.filter((f) => f.type !== "project"));
    }
  };

  if (!activeProject) {
    const storedActive = (() => { try { const r = storeGet("tokenfence-active-project"); if (r && projects.length > 0) { const p = projects.find((p: any) => p.id === r); if (p) return p; } } catch {} return null; })();
    if (storedActive) { setActiveProject(storedActive); return null; }

    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text)" }}>{tk("common.projects")}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem" }}>&times;</button>
        </div>
        {projects.length === 0 ? (
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "20px 0", textAlign: "center" }}>
            {tk("common.noProjects")}
          </div>
        ) : (
          projects.map((p: any) => (
            <div key={p.id} onClick={() => setActiveProject(p)} className="card" style={{ padding: "10px 12px", marginBottom: 6, cursor: "pointer", fontSize: "0.8rem" }}>
              <div style={{ fontWeight: 500, color: "var(--text)" }}>{p.name}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 2 }}>{p.files?.length ?? 0} files</div>
            </div>
          ))
        )}
      </div>
    );
  }

  const selectedCount = activeProject.files?.filter((f: any) => f.selected).length ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }}></span>
            <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text)" }}>{activeProject.name}</span>
          </div>
          <button onClick={() => { setActiveProject(null); onClose(); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem" }}>&times;</button>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => toggleAllFiles(true)} className="btn btn-ghost" style={{ fontSize: "0.68rem", padding: "3px 8px" }}>{tk("common.allFiles")}</button>
          <button onClick={() => toggleAllFiles(false)} className="btn btn-ghost" style={{ fontSize: "0.68rem", padding: "3px 8px" }}>{tk("common.noneFiles")}</button>
          <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)", alignSelf: "center" }}>{selectedCount} selected</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)" }}>
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder={tk("chat.searchFiles") || "Search files..."}
          style={{ width: "100%", boxSizing: "border-box", background: "var(--surface-alt)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", fontSize: "0.75rem", outline: "none" }}
        />
      </div>

      {/* File tree */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {filteredFiles.length === 0 ? (
          <div style={{ padding: "20px 16px", fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>
            {searchQ.trim() ? tk("chat.noFilesFound") || "No matching files" : tk("chat.noFiles") || "No files"}
          </div>
        ) : (
          filteredFiles.map((f: any) => {
            const isSelected = f.selected;
            const inContext = attachedFiles.some((af) => af.name === f.name && af.type === "project");
            return (
              <div
                key={f.name}
                onClick={() => toggleFile(f.name)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 16px", cursor: "pointer",
                  background: isSelected ? "var(--accent-faint, rgba(79,140,255,0.08))" : "transparent",
                  fontSize: "0.78rem",
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--surface-alt)"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>{String.fromCodePoint(0x1F4C4)}</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isSelected ? "var(--primary)" : "var(--text)" }}>{f.name}</span>
                {inContext && (
                  <span style={{ fontSize: "0.6rem", background: "var(--primary)", color: "white", padding: "1px 5px", borderRadius: 8, flexShrink: 0 }}>CTX</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

'''

chat = chat.replace("  /* ---- Drag & Drop upload ---- */", project_component + "\n  /* ---- Drag & Drop upload ---- */")

# Add i18n keys for project files
en_path = os.path.join(ROOT, r"packages\shared\src\i18n\en.ts")
with open(en_path, "r", encoding="utf-8") as f:
    en = f.read()
en = en.replace(
    "    tokenBudget: 'Token Budget',",
    "    searchFiles: 'Search files...',\n    noFiles: 'No files',\n    noFilesFound: 'No matching files',\n    tokenBudget: 'Token Budget',"
)
with open(en_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(en)

zh_path = os.path.join(ROOT, r"packages\shared\src\i18n\zh-CN.ts")
with open(zh_path, "r", encoding="utf-8") as f:
    zh = f.read()
zh = zh.replace(
    "    tokenBudget: 'Token Budget',",
    "    searchFiles: '\\u641C\\u7D22\\u6587\\u4EF6...',\n    noFiles: '\\u65E0\\u6587\\u4EF6',\n    noFilesFound: '\\u65E0\\u5339\\u914D\\u6587\\u4EF6',\n    tokenBudget: 'Token Budget',"
)
with open(zh_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(zh)

with open(chat_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(chat)
print("2. Added ProjectFilePanel inside ChatWorkspace + i18n keys")

print("All v1.0.21 fixes applied")