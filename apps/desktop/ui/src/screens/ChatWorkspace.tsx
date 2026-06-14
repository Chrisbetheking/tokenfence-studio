import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { tk, onLangChange } from "@tokenfence/shared/src/i18n";
import {
  PROVIDERS, PROVIDER_ENDPOINTS, type ProviderConfig,
  loadProviderConfigs, saveProviderConfigs,
  FILE_ROUTING_RULES, getRoutingRuleForFile, estimateTokens,
} from "@tokenfence/shared/src/providers";
import { storeGet, storeSet } from "@tokenfence/shared/src/agent-runtime/safeStorage";

/* ============================================================
   Types
   ============================================================ */

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  provider?: string;
  model?: string;
  guardResult?: { flagged: boolean; details: string };
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
}

type TaskStatus = "idle" | "scanning" | "preparing" | "waiting" | "responding" | "done" | "error";

/* ============================================================
   Helpers
   ============================================================ */

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function loadConversations(): Conversation[] {
  try { const raw = storeGet("tokenfence-conversations"); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

function saveConversations(convs: Conversation[]): void {
  storeSet("tokenfence-conversations", JSON.stringify(convs));
}

function scanPrompt(text: string): { flagged: boolean; details: string } {
  const patterns = [
    { regex: /\b\d{16}\b/, label: "Potential credit card number" },
    { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, label: "Email address" },
    { regex: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/, label: "Potential SSN" },
    { regex: /\b(sk-[A-Za-z0-9]{20,})\b/, label: "Potential API key" },
  ];
  const hits: string[] = [];
  for (const p of patterns) { if (p.regex.test(text)) hits.push(p.label); }
  return { flagged: hits.length > 0, details: hits.length ? `Guard flagged: ${hits.join(", ")}` : "No sensitive data detected" };
}

async function callProviderAPI(
  messages: { role: string; content: string }[],
  config: ProviderConfig,
): Promise<string> {
  const ep = PROVIDER_ENDPOINTS[config.provider];
  if (!ep) return `[Error: Unknown provider "${config.provider}"]`;
  if (!config.apiKey && config.deployment === "cloud") {
    return `[Preview] Configure "${config.provider}" API key in Settings to get real AI responses.`;
  }
  try {
    const modelId = config.customModelId || config.model;
    const url = `${config.baseUrl || ep.baseUrl}${ep.chatEndpoint.replace("{model}", modelId)}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (config.apiKey) {
      if (config.provider === "Claude") { headers["x-api-key"] = config.apiKey; headers["anthropic-version"] = "2023-06-01"; }
      else if (config.provider === "Gemini") { headers["x-goog-api-key"] = config.apiKey; }
      else { headers["Authorization"] = `Bearer ${config.apiKey}`; }
    } else {
      return `[Preview] Configure "${config.provider}" API key for real AI responses.`;
    }
    let body: Record<string, unknown>;
    if (config.provider === "Claude") { body = { model: modelId, max_tokens: 2048, messages: messages.map(m => ({ role: m.role, content: m.content })) }; }
    else if (config.provider === "Gemini") { body = { contents: messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })) }; }
    else { body = { model: modelId, messages, max_tokens: 2048 }; }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) { const errText = await resp.text().catch(() => "Unknown error"); return `[Error: ${resp.status} ${resp.statusText}] ${errText.slice(0, 300)}`; }
    const data = await resp.json();
    if (config.provider === "Claude") return data?.content?.[0]?.text ?? JSON.stringify(data).slice(0, 500);
    else if (config.provider === "Gemini") return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? JSON.stringify(data).slice(0, 500);
    else return data?.choices?.[0]?.message?.content ?? JSON.stringify(data).slice(0, 500);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("abort") || msg.includes("timeout")) return "[Error: Request timeout]";
    return `[Error: ${msg.slice(0, 300)}]`;
  }
}

/* ============================================================
   Component
   ============================================================ */

export function ChatWorkspace() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [composerText, setComposerText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("OpenAI");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [guardEnabled, setGuardEnabled] = useState(true);
  const [lastGuardResult, setLastGuardResult] = useState<{ flagged: boolean; details: string } | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("idle");
  const [autoSwitchModel, setAutoSwitchModel] = useState(true);
  const [routingNote, setRoutingNote] = useState<string | null>(null);
  const [textInputMode, setTextInputMode] = useState(false);
  const [manualCalcText, setManualCalcText] = useState("");

  const composerRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  const providerConfigs = useMemo(() => loadProviderConfigs(), []);

  const getConfigFor = useCallback(
    (provider: string) => providerConfigs.find((c) => c.provider === provider),
    [providerConfigs],
  );

  const getModelStatusColor = useCallback(
    (provider: string) => {
      const cfg = getConfigFor(provider);
      if (!cfg) return "var(--text-muted)";
      if (cfg.lastHealthStatus === "ok") return "var(--green)";
      if (cfg.lastHealthStatus === "degraded") return "var(--amber)";
      if (cfg.lastHealthStatus === "failed") return "var(--red)";
      return "var(--text-muted)";
    },
    [getConfigFor],
  );

  const isProviderConfigured = useCallback(
    (provider: string) => {
      const cfg = getConfigFor(provider);
      return !!(cfg && cfg.apiKey);
    },
    [getConfigFor],
  );

  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  /* ---- Token Budget ---- */

  const composerTokens = useMemo(() => estimateTokens(composerText), [composerText]);
  const attachedFilesTokens = useMemo(
    () => attachedFiles.reduce((sum, f) => sum + estimateTokens(f.content), 0),
    [attachedFiles],
  );
  const messageHistoryTokens = useMemo(() => {
    if (!activeConv) return 0;
    return activeConv.messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
  }, [activeConv]);

  const totalTokens = composerTokens + attachedFilesTokens + messageHistoryTokens;

  const selectedProviderInfo = PROVIDERS.find((p) => p.provider === selectedProvider);
  const contextLimit = selectedProviderInfo?.contextWindow ?? 128000;
  const budgetRatio = totalTokens / contextLimit;
  const budgetColor = budgetRatio > 0.9 ? "var(--red)" : budgetRatio > 0.7 ? "var(--amber)" : "var(--text-secondary)";

  /* ---- file attach handlers ---- */

  const TEXT_EXTENSIONS = [".txt", ".md", ".json", ".csv", ".js", ".ts", ".tsx", ".py", ".html", ".css", ".xml", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".log", ".env", ".sh", ".bat", ".ps1"];

  const handleFileAttach = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const readers: Promise<AttachedFile>[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        const isText = TEXT_EXTENSIONS.includes(ext);
        readers.push(
          new Promise<AttachedFile>((resolve) => {
            if (isText) {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  id: uid(),
                  name: file.name,
                  size: file.size,
                  type: file.type || ext,
                  content: reader.result as string,
                });
              };
              reader.onerror = () => {
                resolve({
                  id: uid(),
                  name: file.name,
                  size: file.size,
                  type: file.type || ext,
                  content: `[Error reading file: ${file.name}]`,
                });
              };
              reader.readAsText(file);
            } else {
              resolve({
                id: uid(),
                name: file.name,
                size: file.size,
                type: file.type || ext,
                content: `[Binary file: ${file.name} (${file.size} bytes)]`,
              });
            }
          }),
        );
      }
      Promise.all(readers).then((newFiles) => {
        setAttachedFiles((prev) => {
          const merged = [...prev, ...newFiles];
          if (autoSwitchModel && merged.length > 0) {
            const latestFile = newFiles[newFiles.length - 1];
            if (latestFile) {
              const rule = getRoutingRuleForFile(latestFile.name);
              if (rule && rule.provider !== selectedProvider) {
                setSelectedProvider(rule.provider);
                setSelectedModel(rule.model);
                setRoutingNote(
                  tk("chat.systemCardRouted")
                    .replace("{provider}", rule.provider)
                    .replace("{model}", rule.model)
                    .replace("{reason}", rule.reason),
                );
              }
            }
          }
          return merged;
        });
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [autoSwitchModel, selectedProvider],
  );

  const handleRemoveFile = useCallback((fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const clearAttachedFiles = useCallback(() => {
    setAttachedFiles([]);
    setRoutingNote(null);
  }, []);

  /* ---- conversation handlers ---- */

  const handleNewConversation = useCallback(() => {
    const conv: Conversation = {
      id: uid(),
      title: tk("chat.newConversation"),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [conv, ...conversations];
    setConversations(updated);
    setActiveConvId(conv.id);
    saveConversations(updated);
    setLastGuardResult(null);
    setTaskStatus("idle");
    clearAttachedFiles();
  }, [conversations, clearAttachedFiles]);

  const handleClearConversation = useCallback(() => {
    if (!activeConv) return;
    const updated = conversations.map((c) =>
      c.id === activeConvId ? { ...c, messages: [], updatedAt: Date.now() } : c,
    );
    setConversations(updated);
    saveConversations(updated);
    setLastGuardResult(null);
    setTaskStatus("idle");
    clearAttachedFiles();
  }, [activeConv, activeConvId, conversations, clearAttachedFiles]);

  const handleDeleteConversation = useCallback(
    (convId: string) => {
      const updated = conversations.filter((c) => c.id !== convId);
      setConversations(updated);
      saveConversations(updated);
      if (activeConvId === convId) {
        setActiveConvId(updated.length > 0 ? updated[0].id : "");
      }
    },
    [activeConvId, conversations],
  );

  /* ---- send message ---- */

  const sendMessage = useCallback(async () => {
    const text = composerText.trim();
    if (!text || sending) return;

    setSending(true);
    setTaskStatus("scanning");
    setRoutingNote(null);

    let guardResult: { flagged: boolean; details: string } | undefined;
    if (guardEnabled && activeConv) {
      guardResult = scanPrompt(text);
      setLastGuardResult(guardResult);
      if (guardResult.flagged) {
        setTaskStatus("idle");
        setSending(false);
        return;
      }
    }

    setTaskStatus("preparing");

    let fullContent = text;
    if (attachedFiles.length > 0) {
      const fileContexts = attachedFiles.map((f) => {
        const preview = f.content.slice(0, 4000);
        const truncated = f.content.length > 4000 ? preview + "\n... [truncated]" : preview;
        return `[Attached: ${f.name} (${f.type})]\n${truncated}`;
      });
      fullContent = fileContexts.join("\n\n") + "\n\n---\n\n" + text;
    }

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: fullContent,
      timestamp: Date.now(),
      provider: selectedProvider,
      model: selectedModel,
      guardResult,
    };

    let targetConv = activeConv;
    if (!targetConv) {
      const newConv: Conversation = {
        id: uid(),
        title: text.slice(0, 60),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [newConv, ...conversations];
      setConversations(updated);
      setActiveConvId(newConv.id);
      saveConversations(updated);
      targetConv = newConv;
    }

    const withUserMsg = {
      ...targetConv,
      messages: [...targetConv.messages, userMsg],
      updatedAt: Date.now(),
    };

    const updatedConvs = conversations.map((c) => (c.id === targetConv!.id ? withUserMsg : c));
    if (!conversations.some((c) => c.id === targetConv!.id)) {
      updatedConvs.unshift(withUserMsg);
    }
    setConversations(updatedConvs);
    saveConversations(updatedConvs);
    setComposerText("");

    setTaskStatus("waiting");

    const configs = loadProviderConfigs();
    const config = configs.find((c) => c.provider === selectedProvider) ?? {
      provider: selectedProvider,
      model: selectedModel,
      deployment: "cloud",
    } as ProviderConfig;

    const apiMessages: { role: string; content: string }[] = [];
    if (withUserMsg.messages.length === 1) {
      apiMessages.push({ role: "system", content: "You are an AI assistant in TokenFence Studio, a local-first AI workspace. Be helpful, concise, and direct." });
    }
    for (const m of withUserMsg.messages) {
      apiMessages.push({ role: m.role, content: m.content });
    }

    setTaskStatus("responding");
    const responseText = await callProviderAPI(apiMessages, config);

    setTaskStatus("done");

    const assistantMsg: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: responseText,
      timestamp: Date.now(),
      provider: selectedProvider,
      model: selectedModel,
    };

    const finalConv = {
      ...withUserMsg,
      messages: [...withUserMsg.messages, assistantMsg],
      updatedAt: Date.now(),
    };

    setConversations((prev) => {
      const next = prev.map((c) => (c.id === finalConv.id ? finalConv : c));
      saveConversations(next);
      return next;
    });

    setSending(false);
    setTimeout(() => setTaskStatus("idle"), 2000);
  }, [composerText, sending, guardEnabled, activeConv, selectedProvider, selectedModel, conversations, attachedFiles]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  /* ---- misc ---- */

  const sortedConversations = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  const contextPackTotalChars = attachedFiles.reduce((sum, f) => sum + f.content.length, 0);

  const taskStatusLabel: Record<TaskStatus, string> = {
    idle: tk("chat.idle"),
    scanning: tk("chat.scanning"),
    preparing: tk("chat.preparing"),
    waiting: tk("chat.waiting"),
    responding: tk("chat.responding"),
    done: tk("chat.done"),
    error: tk("chat.taskError"),
  };

  const taskStatusColor: Record<TaskStatus, string> = {
    idle: "var(--text-muted)",
    scanning: "var(--amber)",
    preparing: "var(--amber)",
    waiting: "#2196f3",
    responding: "#9c27b0",
    done: "var(--green)",
    error: "var(--red)",
  };

  const isRunning = taskStatus !== "idle" && taskStatus !== "done" && taskStatus !== "error";
  const manualCalcTokens = useMemo(() => estimateTokens(manualCalcText), [manualCalcText]);

  /* ============================================================
     Render
     ============================================================ */

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--bg)" }}>
      {/* Left: Conversations sidebar */}
      <div style={{ width: 220, minWidth: 220, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "var(--surface)" }}>
        <div style={{ padding: "12px", borderBottom: "1px solid var(--border)" }}>
          <button
            onClick={handleNewConversation}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "10px 12px", fontSize: "0.85rem" }}
          >
            + {tk("chat.newConversation")}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {sortedConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              style={{
                padding: "10px 12px", marginBottom: 2, borderRadius: "var(--radius)", cursor: "pointer",
                background: conv.id === activeConvId ? "var(--surface-alt)" : "transparent",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {conv.title || tk("chat.newConversation")}
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2 }}>
                  {conv.messages.length} {tk("chat.messageCount")}
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem", padding: "2px 6px", opacity: 0.5 }}>
                x
              </button>
            </div>
          ))}
          {sortedConversations.length === 0 && (
            <div style={{ padding: "32px 16px", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {tk("chat.newConversation")}
            </div>
          )}
        </div>
        <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", fontSize: "0.65rem", color: "var(--text-muted)" }}>
          v1.0.3
        </div>
      </div>

      {/* Center: Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>
              {activeConv?.title || tk("chat.newConversation")}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "var(--surface-alt)", padding: "2px 8px", borderRadius: 10 }}>
              {selectedProvider} / {selectedModel}
            </span>
            {attachedFiles.length > 0 && (
              <span style={{ fontSize: "0.7rem", color: "var(--primary)" }}>
                {attachedFiles.length} files
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {activeConv && activeConv.messages.length > 0 && (
              <button onClick={handleClearConversation} className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
                {tk("chat.clearConversation")}
              </button>
            )}
            <button onClick={() => setShowRightPanel(!showRightPanel)} className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
              {showRightPanel ? tk("chat.hideInspector") : tk("chat.showInspector")}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: "var(--bg)" }}>
          {(!activeConv || activeConv.messages.length === 0) && (
            <div style={{ padding: "60px 40px", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, background: "var(--primary)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28, color: "white" }}>TF</div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>TokenFence Studio</h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
                {tk("chat.welcome")}
              </p>
              <div style={{ marginTop: 24, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {PROVIDERS.slice(0, 6).map((p) => (
                  <span key={p.provider} style={{
                    fontSize: "0.7rem", color: "var(--text-muted)", background: "var(--surface-alt)",
                    padding: "4px 10px", borderRadius: 12, cursor: "pointer",
                    border: selectedProvider === p.provider ? "1px solid var(--primary)" : "1px solid var(--border)",
                  }}
                    onClick={() => { setSelectedProvider(p.provider); setSelectedModel(p.model); }}
                  >
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: getModelStatusColor(p.provider), marginRight: 4, verticalAlign: "middle" }}></span>
                    {p.provider}
                  </span>
                ))}
              </div>
            </div>
          )}
          {routingNote && (
            <div style={{ padding: "10px 16px", background: "var(--surface-alt)", borderRadius: "var(--radius)", marginBottom: 16, fontSize: "0.8rem", color: "var(--text-secondary)", borderLeft: "3px solid var(--primary)" }}>
              {routingNote}
            </div>
          )}
          {activeConv?.messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, color: msg.role === "user" ? "var(--text-secondary)" : "var(--primary)" }}>
                  {msg.role === "user" ? "You" : (msg.provider ?? "AI")}
                </span>
                <span>{msg.role === "assistant" ? (msg.model ?? "") : ""}</span>
                <span style={{ marginLeft: "auto" }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div
                style={{
                  padding: "12px 16px", borderRadius: "var(--radius-lg)",
                  background: msg.role === "user" ? "var(--surface)" : "var(--surface-alt)",
                  border: "1px solid var(--border)", color: "var(--text)",
                  fontSize: "0.85rem", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}
              >
                {msg.content}
              </div>
              {msg.guardResult && (
                <div style={{ fontSize: "0.7rem", color: msg.guardResult.flagged ? "var(--amber)" : "var(--green)", marginTop: 4 }}>
                  {msg.guardResult.details}
                </div>
              )}
            </div>
          ))}
          {sending && (
            <div style={{ padding: "16px 20px", color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }}></span>
              {isRunning ? taskStatusLabel[taskStatus] : "..."}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", background: "var(--surface)" }}>
          {attachedFiles.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {attachedFiles.map((f) => (
                <span key={f.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 6, fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                  📎 {f.name}
                  <button onClick={() => handleRemoveFile(f.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem", padding: 0, lineHeight: 1 }}>x</button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
            <select value={selectedProvider} onChange={(e) => { setSelectedProvider(e.target.value); const p = PROVIDERS.find((x) => x.provider === e.target.value); if (p) setSelectedModel(p.model); }}
              style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 10px", fontSize: "0.8rem", outline: "none" }}>
              {PROVIDERS.map((p) => (
                <option key={p.provider} value={p.provider} style={{ color: isProviderConfigured(p.provider) ? "var(--green)" : "var(--text-muted)" }}>
                  {isProviderConfigured(p.provider) ? "✓ " : ""}{p.provider}
                </option>
              ))}
            </select>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}
              style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 10px", fontSize: "0.8rem", outline: "none" }}>
              {PROVIDERS.filter((p) => p.provider === selectedProvider).map((p) => (
                <option key={p.model} value={p.model}>{p.model}</option>
              ))}
              {!PROVIDERS.some((p) => p.provider === selectedProvider) && <option value={selectedModel}>{selectedModel}</option>}
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "var(--text-secondary)", cursor: "pointer" }}>
              <input type="checkbox" checked={guardEnabled} onChange={(e) => setGuardEnabled(e.target.checked)} /> {tk("nav.guard")}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: autoSwitchModel ? "var(--primary)" : "var(--text-muted)", cursor: "pointer" }}>
              <input type="checkbox" checked={autoSwitchModel} onChange={(e) => setAutoSwitchModel(e.target.checked)} /> {tk("chat.autoSwitch")}
            </label>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileAttach} style={{ display: "none" }} accept=".txt,.md,.json,.csv,.js,.ts,.tsx,.py,.html,.css,.xml,.yaml,.yml,.toml,.ini,.cfg,.log,.env,.sh,.bat,.ps1,.pdf,.png,.jpg,.jpeg,.gif,.webp" />
            <button onClick={() => fileInputRef.current?.click()} title={tk("chat.attachFile")} className="btn btn-ghost" style={{ fontSize: "0.8rem", padding: "7px 12px" }}>
              📎 {tk("chat.attachFile")}
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea ref={composerRef} value={composerText} onChange={(e) => setComposerText(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={tk("chat.typeMessage")} disabled={sending} rows={3}
              style={{ flex: 1, background: "var(--surface-alt)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", fontSize: "0.9rem", resize: "none", outline: "none", lineHeight: 1.5, fontFamily: "inherit" }} />
            <button onClick={sendMessage} disabled={sending || !composerText.trim()}
              className="btn btn-primary"
              style={{ padding: "12px 24px", fontSize: "0.9rem", fontWeight: 600, minWidth: 80, opacity: (sending || !composerText.trim()) ? 0.5 : 1 }}>
              {sending ? "..." : tk("chat.send")}
            </button>
          </div>
        </div>
      </div>

      {/* Right: Inspector */}
      {showRightPanel && (
        <div style={{ width: 260, minWidth: 260, borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "var(--surface)", padding: "16px", overflowY: "auto" }}>
          {/* Token Budget */}
          <div onClick={() => setCollapsedSections((prev) => { const next = new Set(prev); if (next.has("budget")) next.delete("budget"); else next.add("budget"); return next; })}
            style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h4 style={{ margin: 0, color: "var(--text)", fontSize: "0.8rem", fontWeight: 600 }}>{tk("chat.tokenBudget")}</h4>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{collapsedSections.has("budget") ? "▶" : "▼"}</span>
          </div>
          {!collapsedSections.has("budget") && (
            <div className="card" style={{ padding: 12, marginBottom: 12, background: "var(--surface-alt)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 6 }}>
                <span style={{ color: "var(--text-muted)" }}>{tk("chat.inputTokens")}</span>
                <span style={{ color: "var(--text-secondary)" }}>{composerTokens.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 6 }}>
                <span style={{ color: "var(--text-muted)" }}>{tk("chat.fileTokens")}</span>
                <span style={{ color: "var(--text-secondary)" }}>{attachedFilesTokens.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 8 }}>
                <span style={{ color: "var(--text-muted)" }}>{tk("chat.messageTokens")}</span>
                <span style={{ color: "var(--text-secondary)" }}>{messageHistoryTokens.toLocaleString()}</span>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600 }}>
                <span style={{ color: budgetColor }}>{tk("chat.totalTokens")}</span>
                <span style={{ color: budgetColor }}>{totalTokens.toLocaleString()} / {contextLimit.toLocaleString()}</span>
              </div>
              {budgetRatio > 0.7 && (
                <div style={{ marginTop: 6, fontSize: "0.7rem", color: budgetColor, fontWeight: 500 }}>
                  ⚠ {tk("chat.budgetWarning")}
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <button onClick={(e) => { e.stopPropagation(); setTextInputMode(!textInputMode); }}
                  style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.7rem", padding: 0 }}>
                  {textInputMode ? tk("chat.collapseDetails") : tk("common.working") + "..."}
                </button>
                {textInputMode && (
                  <div style={{ marginTop: 6 }}>
                    <textarea value={manualCalcText} onChange={(e) => setManualCalcText(e.target.value)}
                      placeholder="Paste text to count tokens..." rows={3}
                      style={{ width: "100%", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px", fontSize: "0.7rem", resize: "vertical", outline: "none" }}
                      onClick={(e) => e.stopPropagation()} />
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4 }}>~{manualCalcTokens} tokens</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Agent Tasks */}
          <h4 style={{ margin: "12px 0 8px", color: "var(--text)", fontSize: "0.8rem", fontWeight: 600 }}>{tk("chat.agentTasks")}</h4>
          <div className="card" style={{ padding: 12, marginBottom: 12, background: "var(--surface-alt)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: taskStatusColor[taskStatus], display: "inline-block", flexShrink: 0 }}></span>
            <span style={{ fontSize: "0.8rem", color: taskStatusColor[taskStatus], fontWeight: 600 }}>{taskStatusLabel[taskStatus]}</span>
            {isRunning && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "auto" }}>⏳</span>}
          </div>

          {/* Inspector collapsible */}
          <div onClick={() => setCollapsedSections((prev) => { const next = new Set(prev); if (next.has("inspector")) next.delete("inspector"); else next.add("inspector"); return next; })}
            style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h4 style={{ margin: 0, color: "var(--text)", fontSize: "0.8rem", fontWeight: 600 }}>{tk("chat.inspector")}</h4>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{collapsedSections.has("inspector") ? "▶" : "▼"}</span>
          </div>
          {!collapsedSections.has("inspector") && (
            <>
              <div className="card" style={{ padding: 12, marginBottom: 12, background: "var(--surface-alt)" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4 }}>{tk("chat.activeProvider")}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text)", fontWeight: 500 }}>{selectedProvider} / {selectedModel}</div>
                <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: getModelStatusColor(selectedProvider) }}></span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {isProviderConfigured(selectedProvider) ? tk("chat.modelConfigured") : tk("chat.modelNotConfigured")}
                  </span>
                </div>
              </div>
              <div className="card" style={{ padding: 12, marginBottom: 12, background: "var(--surface-alt)" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4 }}>{tk("chat.promptGuard")}</div>
                {lastGuardResult ? (
                  <div style={{ fontSize: "0.75rem", color: lastGuardResult.flagged ? "var(--amber)" : "var(--green)" }}>
                    {lastGuardResult.flagged ? lastGuardResult.details : "No issues"}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Send a message</div>
                )}
              </div>
              <div className="card" style={{ padding: 12, marginBottom: 12, background: "var(--surface-alt)" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4 }}>{tk("chat.conversation")}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text)" }}>{activeConv?.messages.length ?? 0} {tk("chat.messageCount")}</div>
              </div>
            </>
          )}

          {/* Context Pack */}
          <h4 style={{ margin: "12px 0 8px", color: "var(--text)", fontSize: "0.8rem", fontWeight: 600 }}>{tk("chat.contextPack")}</h4>
          <div className="card" style={{ padding: 12, marginBottom: 12, background: "var(--surface-alt)" }}>
            {attachedFiles.length === 0 ? (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{tk("chat.noFilesAttached")}</div>
            ) : (
              <>
                {attachedFiles.map((f) => (
                  <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid var(--border)", fontSize: "0.7rem" }}>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>{f.type} · {(f.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button onClick={() => handleRemoveFile(f.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.7rem", padding: "2px 4px" }}>x</button>
                  </div>
                ))}
                <div style={{ marginTop: 8, fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 2 }}>
                  <div>{tk("chat.totalFiles")}: {attachedFiles.length}</div>
                  <div>{tk("chat.totalChars")}: {contextPackTotalChars.toLocaleString()}</div>
                  <div>{tk("chat.estimatedTokens")}: ~{attachedFilesTokens.toLocaleString()}</div>
                </div>
              </>
            )}
          </div>

          {attachedFiles.length > 0 && (
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", padding: "4px 0" }}>
              {autoSwitchModel ? tk("chat.fileRoutingOn") : tk("chat.fileRoutingOff")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
