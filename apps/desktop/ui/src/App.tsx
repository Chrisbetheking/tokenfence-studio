import { useState, useEffect, useCallback } from "react";
import { tk, onLangChange } from "@tokenfence/shared/src/i18n";
import { Dashboard } from "./screens/Dashboard";
import { ChatWorkspace } from "./screens/ChatWorkspace";
import { GuardScreen } from "./screens/GuardScreen";
import { DocumentsScreen } from "./screens/DocumentsScreen";
import { MatrixScreen } from "./screens/MatrixScreen";
import { ProvidersScreen } from "./screens/ProvidersScreen";
import { ArchiveScreen } from "./screens/ArchiveScreen";
import { StorageScreen } from "./screens/StorageScreen";
import { AboutScreen } from "./screens/AboutScreen";
import { AgentLabScreen } from "./screens/AgentLabScreen";
import { PluginStoreScreen } from "./screens/PluginStoreScreen";
import { OutputScreen } from "./screens/OutputScreen";
import { MindMapScreen } from "./screens/MindMapScreen";
import { ComputerControlScreen } from "./screens/ComputerControlScreen";
import { RoutingScreen } from "./screens/RoutingScreen";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import type { SupportedLanguage } from "@tokenfence/shared/src/i18n";

type Screen = "chat" | "projects" | "models" | "toolbox" | "settings" | "about"
  | "dashboard" | "guard" | "documents" | "matrix" | "providers"
  | "archive" | "storage" | "agent-lab" | "plugins" | "output"
  | "mindmap" | "computer" | "routing" | "export";

const primaryNav: { id: Screen; icon: string }[] = [
  { id: "chat", icon: "\u{1F4AC}" },
  { id: "projects", icon: "\u{1F4C1}" },
  { id: "models", icon: "\u{1F916}" },
  { id: "toolbox", icon: "\u{1F9F0}" },
  { id: "settings", icon: "\u2699\uFE0F" },
  { id: "about", icon: "\u2139\uFE0F" },
];

type ToolGroup = {
  labelKey: string;
  items: { id: Screen; labelKey: string }[];
};

const toolGroups: ToolGroup[] = [
  {
    labelKey: "common.security",
    items: [
      { id: "guard", labelKey: "nav.guard" },
      { id: "routing", labelKey: "nav.routing" },
    ],
  },
  {
    labelKey: "common.documents",
    items: [
      { id: "documents", labelKey: "nav.documents" },
      { id: "output", labelKey: "nav.outputs" },
    ],
  },
  {
    labelKey: "common.knowledge",
    items: [
      { id: "storage", labelKey: "nav.storage" },
      { id: "archive", labelKey: "nav.archive" },
    ],
  },
  {
    labelKey: "common.agent",
    items: [
      { id: "agent-lab", labelKey: "nav.agentLab" },
      { id: "computer", labelKey: "nav.computerUse" },
      { id: "plugins", labelKey: "nav.plugins" },
    ],
  },
  {
    labelKey: "common.creative",
    items: [
      { id: "mindmap", labelKey: "nav.mindMap" },
      { id: "dashboard", labelKey: "nav.dashboard" },
      { id: "matrix", labelKey: "nav.matrix" },
    ],
  },
];

const screenLabels: Record<Screen, string> = {
  chat: "nav.chat",
  projects: "common.projects",
  models: "common.models",
  toolbox: "common.toolbox",
  settings: "nav.settings",
  about: "nav.about",
  dashboard: "nav.dashboard",
  guard: "nav.guard",
  documents: "nav.documents",
  matrix: "nav.matrix",
  providers: "nav.providers",
  archive: "nav.archive",
  storage: "nav.storage",
  "agent-lab": "nav.agentLab",
  plugins: "nav.plugins",
  output: "nav.outputs",
  mindmap: "nav.mindMap",
  computer: "nav.computerUse",
  routing: "nav.routing",
  export: "nav.export",
};

const screens: Record<string, React.ReactNode> = {
  chat: <ChatWorkspace />,
  projects: <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}><div style={{ fontSize: 48, marginBottom: 16 }}>{String.fromCodePoint(0x1F4C1)}</div><h2 style={{ color: "var(--text-secondary)", marginBottom: 8 }}>{tk("common.projects")}</h2><p>{tk("common.comingSoon")}</p></div>,
  models: <ProvidersScreen />,
  toolbox: <ToolboxScreen />,
  settings: <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}><div style={{ fontSize: 48, marginBottom: 16 }}>{String.fromCodePoint(0x2699)}</div><h2 style={{ color: "var(--text-secondary)", marginBottom: 8 }}>{tk("nav.settings")}</h2><p>{tk("common.comingSoon")}</p></div>,
  about: <AboutScreen />,
  dashboard: <Dashboard />,
  guard: <GuardScreen />,
  documents: <DocumentsScreen />,
  matrix: <MatrixScreen />,
  providers: <ProvidersScreen />,
  archive: <ArchiveScreen />,
  storage: <StorageScreen />,
  "agent-lab": <AgentLabScreen />,
  plugins: <PluginStoreScreen />,
  output: <OutputScreen />,
  mindmap: <MindMapScreen />,
  computer: <ComputerControlScreen />,
  routing: <RoutingScreen />,
  export: <div style={{ padding: 40, textAlign: "center" }}>Export</div>,
};

function ToolboxScreen() {
  const [activeTool, setActiveTool] = useState<Screen | null>(null);

  if (activeTool && screens[activeTool]) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setActiveTool(null)} className="btn btn-ghost" style={{ fontSize: 12 }}>{String.fromCodePoint(0x2190)} {tk("actions.back")}</button>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{tk(screenLabels[activeTool])}</span>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>{screens[activeTool]}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px" }}>
      <h2 className="page-title">{tk("common.toolbox")}</h2>
      <p className="page-subtitle">{tk("common.toolGroups")}</p>
      {toolGroups.map((group) => (
        <div key={group.labelKey} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>{tk(group.labelKey)}</h3>
          <div className="stats-grid">
            {group.items.map((item) => (
              <div key={item.id} className="stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTool(item.id)}>
                <div className="stat-label">{tk(item.labelKey)}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{tk("common.stub")}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function App() {
  const [screen, setScreen] = useState<Screen>("chat");
  const [activeTool, setActiveTool] = useState<Screen | null>(null);
  const [, forceRender] = useState(0);

  useEffect(() => {
    return onLangChange(() => forceRender((n) => n + 1));
  }, []);

  const handleNavClick = (id: Screen) => {
    setScreen(id);
    setActiveTool(null);
  };

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">TF</span>
          <span className="sidebar-brand-text">TokenFence</span>
        </div>
        <div className="sidebar-nav">
          {primaryNav.map(({ id, icon }) => (
            <button
              key={id}
              className={`sidebar-item ${screen === id ? "active" : ""}`}
              onClick={() => handleNavClick(id)}
            >
              <span className="sidebar-item-icon">{icon}</span>
              <span className="sidebar-item-label">{tk(screenLabels[id])}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-footer">
          <LanguageSwitcher />
          <div className="status-indicator" style={{ marginTop: 8 }}>
            <span className="status-dot green"></span>
            <span>{tk("status.localFirst")}</span>
          </div>
          <div className="version-text">v1.0.4</div>
        </div>
      </nav>
      <main className="main-content" style={{ padding: 0 }}>
        {screens[screen] ?? <ChatWorkspace />}
      </main>
    </div>
  );
}