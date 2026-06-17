import { useState, useCallback } from "react";
import { tk, onLangChange } from "@tokenfence/shared/src/i18n";
import { applyPatch, undoLastPatch, createBackup, appendOperationLog, readFile, fileExists } from "../desktop-bridge";

type AgentStep = "planning" | "reading" | "preparing" | "waiting_approval" | "applying" | "done" | "failed";

interface AgentPatchPanelProps {
  projectPath?: string;
  selectedFiles: { name: string; path: string }[];
  onClose: () => void;
}

export function AgentPatchPanel({ projectPath, selectedFiles, onClose }: AgentPatchPanelProps) {
  const [step, setStep] = useState<AgentStep>("planning");
  const [planText, setPlanText] = useState("");
  const [diffPreview, setDiffPreview] = useState<{ file: string; original: string; modified: string }[]>([]);
  const [error, setError] = useState("");
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<{ file: string; content: string }[]>([]);
  const [, forceRender] = useState(0);

  const isZh = tk("common.yes") !== "Yes";

  const stepLabel = (s: AgentStep): string => {
    switch (s) {
      case "planning": return isZh ? "\u89c4\u5212\u4e2d" : "Planning";
      case "reading": return isZh ? "\u8bfb\u53d6\u6587\u4ef6" : "Reading files";
      case "preparing": return isZh ? "\u51c6\u5907\u8865\u4e01" : "Preparing patch";
      case "waiting_approval": return isZh ? "\u7b49\u5f85\u786e\u8ba4" : "Waiting approval";
      case "applying": return isZh ? "\u5e94\u7528\u8865\u4e01" : "Applying patch";
      case "done": return isZh ? "\u5b8c\u6210" : "Done";
      case "failed": return isZh ? "\u5931\u8d25" : "Failed";
    }
  };

  const addLog = (msg: string) => {
    setOperationLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleGeneratePlan = useCallback(async () => {
    setStep("reading");
    addLog(isZh ? "\u5f00\u59cb\u8bfb\u53d6\u9009\u4e2d\u6587\u4ef6..." : "Reading selected files...");
    
    const diffs: { file: string; original: string; modified: string }[] = [];
    for (const f of selectedFiles) {
      try {
        const content = await readFile(f.path);
        diffs.push({ file: f.name, original: content, modified: content });
        addLog(`${isZh ? "\u5df2\u8bfb\u53d6" : "Read"}: ${f.name}`);
      } catch (e: any) {
        addLog(`${isZh ? "\u8bfb\u53d6\u5931\u8d25" : "Failed to read"}: ${f.name} - ${e.message}`);
      }
    }
    
    setDiffPreview(diffs);
    setStep("preparing");
    addLog(isZh ? "\u6b63\u5728\u751f\u6210\u8865\u4e01..." : "Generating patch...");
    
    // Generate a plan based on file contents
    const fileList = selectedFiles.map((f) => f.name).join(", ");
    const plan = isZh
      ? `\u9879\u76ee: ${projectPath || "\u672a\u77e5"}\n\u6587\u4ef6: ${fileList}\n\u6b65\u9aa4:\n1. \u8bfb\u53d6\u5df2\u9009\u6587\u4ef6\n2. \u51c6\u5907\u4fee\u6539\u5185\u5bb9\n3. \u7b49\u5f85\u7528\u6237\u786e\u8ba4\n4. \u5e94\u7528\u8865\u4e01\n5. \u4fdd\u5b58\u64cd\u4f5c\u65e5\u5fd7`
      : `Project: ${projectPath || "Unknown"}\nFiles: ${fileList}\nSteps:\n1. Read selected files\n2. Prepare modifications\n3. Wait for user confirmation\n4. Apply patch\n5. Save operation log`;
    setPlanText(plan);
    
    setStep("waiting_approval");
    addLog(isZh ? "\u8865\u4e01\u5df2\u51c6\u5907\uff0c\u7b49\u5f85\u786e\u8ba4..." : "Patch ready, waiting for approval...");
  }, [selectedFiles, projectPath, isZh]);

  const handleApplyPatch = useCallback(async () => {
    setStep("applying");
    addLog(isZh ? "\u5f00\u59cb\u5e94\u7528\u8865\u4e01..." : "Applying patch...");
    
    const patched: string[] = [];
    let allSuccess = true;
    let lastError = "";
    
    for (const diff of diffPreview) {
      if (diff.original === diff.modified) continue; // No change
      const filePath = `${projectPath}\\${diff.file}`;
      try {
        const result = await applyPatch(filePath, diff.modified, true);
        if (result.success) {
          patched.push(diff.file);
          addLog(`${isZh ? "\u5df2\u5e94\u7528" : "Applied"}: ${diff.file}`);
        } else {
          allSuccess = false;
          lastError = result.error || "Unknown error";
          addLog(`${isZh ? "\u5931\u8d25" : "Failed"}: ${diff.file} - ${lastError}`);
        }
      } catch (e: any) {
        allSuccess = false;
        lastError = e.message;
        addLog(`${isZh ? "\u5931\u8d25" : "Failed"}: ${diff.file} - ${e.message}`);
      }
    }
    
    // Log operation
    try {
      await appendOperationLog("apply_patch", patched, allSuccess, allSuccess ? undefined : lastError);
    } catch {}
    
    if (allSuccess) {
      setStep("done");
      addLog(isZh ? "\u5168\u90e8\u8865\u4e01\u5df2\u5e94\u7528" : "All patches applied successfully");
    } else {
      setStep("failed");
      setError(lastError);
      addLog(`${isZh ? "\u90e8\u5206\u8865\u4e01\u5931\u8d25" : "Some patches failed"}: ${lastError}`);
    }
  }, [diffPreview, projectPath, isZh]);

  const handleUndo = useCallback(async () => {
    addLog(isZh ? "\u5f00\u59cb\u64a4\u9500\u6700\u540e\u4e00\u6b21\u4fee\u6539..." : "Undoing last patch...");
    for (const diff of diffPreview) {
      const filePath = `${projectPath}\\${diff.file}`;
      try {
        const result = await undoLastPatch(filePath);
        if (result.success) {
          addLog(`${isZh ? "\u5df2\u64a4\u9500" : "Undone"}: ${diff.file}`);
        } else {
          addLog(`${isZh ? "\u64a4\u9500\u5931\u8d25" : "Undo failed"}: ${diff.file}`);
        }
      } catch (e: any) {
        addLog(`${isZh ? "\u64a4\u9500\u5931\u8d25" : "Undo failed"}: ${diff.file} - ${e.message}`);
      }
    }
    setStep("done");
  }, [diffPreview, projectPath, isZh]);

  const updateFileContent = (fileName: string, newContent: string) => {
    setDiffPreview((prev) =>
      prev.map((d) => (d.file === fileName ? { ...d, modified: newContent } : d))
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>
          {isZh ? "Agent \u6587\u4ef6\u7f16\u8f91" : "Agent File Editing"}
        </h3>
        <button onClick={onClose} className="btn btn-ghost" style={{ fontSize: "0.8rem" }}>x</button>
      </div>

      {/* Step indicator */}
      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8, alignItems: "center" }}>
        <span className={`badge ${step === "failed" ? "badge-red" : step === "done" ? "badge-green" : step === "waiting_approval" ? "badge-amber" : "badge-blue"}`} style={{ fontSize: "0.7rem" }}>
          {stepLabel(step)}
        </span>
        {selectedFiles.length > 0 && (
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            {selectedFiles.length} {isZh ? "\u4e2a\u6587\u4ef6" : "files"}
          </span>
        )}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {/* Plan section */}
        {(step === "planning" || step === "reading") && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text)", marginBottom: 12 }}>{stepLabel(step)}...</div>
            {selectedFiles.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                {isZh ? "\u8bf7\u5148\u5728\u9879\u76ee\u4e2d\u9009\u62e9\u6587\u4ef6" : "Select files in the Project tab first"}
              </div>
            ) : (
              <button className="btn btn-primary" onClick={handleGeneratePlan}>
                {isZh ? "\u751f\u6210\u8865\u4e01\u8ba1\u5212" : "Generate Patch Plan"}
              </button>
            )}
          </div>
        )}

        {/* Plan text */}
        {planText && step !== "planning" && step !== "reading" && (
          <div className="card" style={{ padding: 10, marginBottom: 10, background: "var(--surface-alt)", whiteSpace: "pre-wrap", fontSize: "0.75rem", color: "var(--text)", fontFamily: "monospace" }}>
            {planText}
          </div>
        )}

        {/* Diff Preview */}
        {diffPreview.length > 0 && (step === "preparing" || step === "waiting_approval") && (
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              {isZh ? "\u5dee\u5f02\u9884\u89c8" : "Diff Preview"}
            </div>
            {diffPreview.map((diff) => (
              <div key={diff.file} className="card" style={{ padding: 10, marginBottom: 8 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{diff.file}</div>
                {step === "waiting_approval" ? (
                  <textarea
                    className="input"
                    value={diff.modified}
                    onChange={(e) => updateFileContent(diff.file, e.target.value)}
                    style={{ width: "100%", minHeight: 120, fontFamily: "monospace", fontSize: "0.7rem", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 6, padding: 8, resize: "vertical", boxSizing: "border-box" }}
                  />
                ) : (
                  <div style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "var(--text-secondary)", maxHeight: 120, overflow: "auto", whiteSpace: "pre-wrap" }}>
                    {diff.modified.slice(0, 2000)}
                    {diff.modified.length > 2000 && `\n... (${diff.modified.length - 2000} ${isZh ? "\u66f4\u591a\u5b57\u7b26" : "more chars"})`}
                  </div>
                )}
                {diff.original !== diff.modified && (
                  <span className="badge badge-amber" style={{ fontSize: "0.6rem", marginTop: 4 }}>
                    {isZh ? "\u5df2\u4fee\u6539" : "Modified"}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div style={{ color: "var(--red)", fontSize: "0.75rem", padding: 8, background: "rgba(255,0,0,0.05)", borderRadius: 6, marginBottom: 8 }}>
            {error}
          </div>
        )}

        {/* Operation log */}
        {operationLog.length > 0 && (
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
              {isZh ? "\u64cd\u4f5c\u65e5\u5fd7" : "Operation Log"}
            </div>
            <div style={{ maxHeight: 120, overflowY: "auto", background: "var(--surface-alt)", borderRadius: 6, padding: 8, fontSize: "0.65rem", fontFamily: "monospace", color: "var(--text-secondary)" }}>
              {operationLog.map((log, i) => <div key={i}>{log}</div>)}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        {step === "waiting_approval" && (
          <>
            <button className="btn btn-primary" onClick={handleApplyPatch}>
              {isZh ? "\u5e94\u7528\u8865\u4e01" : "Apply Patch"}
            </button>
            <button className="btn btn-secondary" onClick={() => setStep("preparing")}>
              {isZh ? "\u7ee7\u7eed\u7f16\u8f91" : "Continue Editing"}
            </button>
          </>
        )}
        {(step === "done" || step === "failed") && (
          <>
            {step === "failed" && (
              <button className="btn btn-primary" onClick={handleApplyPatch}>
                {isZh ? "\u91cd\u8bd5" : "Retry"}
              </button>
            )}
            <button className="btn btn-secondary" onClick={handleUndo}>
              {isZh ? "\u64a4\u9500\u4e0a\u6b21\u4fee\u6539" : "Undo Last Patch"}
            </button>
          </>
        )}
        <button className="btn btn-ghost" onClick={onClose} style={{ marginLeft: "auto" }}>
          {isZh ? "\u5173\u95ed" : "Close"}
        </button>
      </div>
    </div>
  );
}
