import { useState, useEffect, useCallback } from "react";
import { tk, onLangChange } from "@tokenfence/shared/src/i18n";
import {
  loadComputerUseState,
  saveComputerUseState,
  generatePlan,
  simulateStepExecution,
  type ComputerUseState,
  type ComputerUsePlanStep,
  type ComputerUseRunLog,
} from "../data/computer-use";

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

function logLevelColor(level: string): string {
  switch (level) {
    case "success": return "var(--green)";
    case "error": return "var(--red)";
    case "warning": return "var(--amber)";
    default: return "var(--text-muted)";
  }
}

function riskColor(risk: string): string {
  switch (risk) {
    case "safe": return "var(--green)";
    case "review": return "var(--amber)";
    case "blocked": return "var(--red)";
    default: return "var(--text-muted)";
  }
}

function riskLabel(risk: string, isZh: boolean): string {
  switch (risk) {
    case "safe": return isZh ? "安全" : "Safe";
    case "review": return isZh ? "需审核" : "Review";
    case "blocked": return isZh ? "已阻止" : "Blocked";
    default: return risk;
  }
}

export function ComputerControlScreen() {
  const [, forceRender] = useState(0);
  useEffect(() => { return onLangChange(() => forceRender((n) => n + 1)); }, []);

  const isZh = tk("common.yes") !== "Yes";
  const [state, setState] = useState<ComputerUseState>(loadComputerUseState);
  const [taskInput, setTaskInput] = useState(state.taskText || "");
  const [stopRequested, setStopRequested] = useState(false);

  const persist = useCallback((s: ComputerUseState) => {
    saveComputerUseState(s);
    setState(s);
  }, []);

  // Generate Plan
  const handleGeneratePlan = useCallback(() => {
    if (!taskInput.trim()) return;
    const newState: ComputerUseState = {
      ...state,
      taskText: taskInput.trim(),
      status: "planning",
      plan: [],
      logs: [],
    };
    persist(newState);

    // Small delay for "planning" feel
    setTimeout(() => {
      const result = generatePlan(taskInput.trim());
      const planned: ComputerUseState = {
        ...newState,
        status: result.blocked ? "failed" : "waiting_confirmation",
        plan: result.plan,
        logs: [{
          id: uid(),
          time: Date.now(),
          level: result.blocked ? "error" : "info",
          message: result.blocked
            ? (isZh ? "任务被阻止：输入包含不允许的操作。" : "Task blocked: input contains disallowed operations.")
            : (isZh
              ? `已生成 ${result.plan.length} 个计划步骤。请审核后确认执行。`
              : `Generated ${result.plan.length} plan step(s). Review and confirm to execute.`),
        }],
      };
      persist(planned);
    }, 600);
  }, [taskInput, state, persist, isZh]);

  // Confirm Run
  const handleConfirmRun = useCallback(async () => {
    if (state.status !== "waiting_confirmation") return;
    const runningState: ComputerUseState = {
      ...state,
      status: "running",
      logs: [...state.logs, {
        id: uid(),
        time: Date.now(),
        level: "info",
        message: isZh ? "开始执行计划..." : "Starting plan execution...",
      }],
    };
    persist(runningState);
    setStopRequested(false);

    let currentLogs = [...runningState.logs];
    let allDone = true;

    for (const step of state.plan) {
      if (stopRequested) { allDone = false; break; }
      await simulateStepExecution(step, (log) => {
        currentLogs = [...currentLogs, log];
        setState(prev => ({ ...prev, logs: currentLogs }));
      });
    }

    const finalState: ComputerUseState = {
      ...state,
      status: allDone ? "completed" : "stopped",
      logs: [...currentLogs, {
        id: uid(),
        time: Date.now(),
        level: allDone ? "success" : "warning",
        message: allDone
          ? (isZh ? "所有步骤执行完成。" : "All steps completed.")
          : (isZh ? "执行已停止。" : "Execution stopped."),
      }],
    };
    persist(finalState);
  }, [state, persist, isZh, stopRequested]);

  // Stop
  const handleStop = useCallback(() => {
    setStopRequested(true);
    const stoppedState: ComputerUseState = {
      ...state,
      status: "stopped",
      logs: [...state.logs, {
        id: uid(),
        time: Date.now(),
        level: "warning",
        message: isZh ? "用户请求停止。" : "Stop requested by user.",
      }],
    };
    persist(stoppedState);
  }, [state, persist, isZh]);

  // Clear
  const handleClear = useCallback(() => {
    setTaskInput("");
    persist({
      taskText: "",
      status: "idle",
      plan: [],
      logs: [],
      updatedAt: Date.now(),
    });
  }, [persist]);

  const canGenerate = taskInput.trim().length > 0 && (state.status === "idle" || state.status === "completed" || state.status === "failed" || state.status === "stopped");
  const canConfirm = state.status === "waiting_confirmation";
  const canStop = state.status === "running";
  const isBusy = state.status === "planning" || state.status === "running";

  return (
    <div style={{ padding: "28px 32px", height: "100%", overflowY: "auto" }}>
      <h1 className="page-title">{tk("computerUse.title")}</h1>
      <p className="page-subtitle">{tk("computerUse.subtitle")}</p>

      {/* Safety Notice */}
      <div className="card" style={{
        marginBottom: 16,
        padding: 12,
        background: "var(--surface-alt)",
        border: "1px solid var(--amber)",
        fontSize: "0.75rem",
        color: "var(--text-secondary)",
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          {isZh ? "Computer Use 预览版" : "Computer Use Preview"}
        </div>
        <div>
          {isZh
            ? "当前版本只支持安全命令计划与用户确认执行，不支持自动看屏幕、鼠标点击或键盘控制。"
            : "This version only supports safe command planning and user-confirmed execution. Screen reading, mouse control, and keyboard control are not enabled."}
        </div>
      </div>

      {/* Task Input */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
          {isZh ? "任务描述" : "Task Description"}
        </div>
        <textarea
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (canGenerate) handleGeneratePlan(); } }}
          placeholder={isZh
            ? "输入诊断任务，例如：帮我检查当前版本、帮我检查快捷方式..."
            : "Enter a diagnostic task, e.g.: Check current version, Check shortcuts..."}
          style={{
            width: "100%",
            minHeight: 60,
            background: "var(--bg)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: 8,
            fontSize: "0.8rem",
            resize: "vertical",
            fontFamily: "inherit",
          }}
          disabled={isBusy}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            className="btn btn-primary"
            onClick={handleGeneratePlan}
            disabled={!canGenerate}
            style={{ fontSize: "0.75rem" }}
          >
            {isZh ? "生成计划" : "Generate Plan"}
          </button>
          <button
            className="btn btn-ghost"
            onClick={handleClear}
            disabled={isBusy || state.status === "idle"}
            style={{ fontSize: "0.75rem" }}
          >
            {isZh ? "清空" : "Clear"}
          </button>
        </div>
      </div>

      {/* Status */}
      {state.status !== "idle" && (
        <div style={{ marginBottom: 8, fontSize: "0.7rem", color: "var(--text-muted)" }}>
          {isZh ? "状态" : "Status"}: <strong>{state.status}</strong>
        </div>
      )}

      {/* Plan Preview */}
      {state.plan.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
            {isZh ? "执行计划" : "Execution Plan"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {state.plan.map((step: ComputerUsePlanStep, idx: number) => (
              <div key={step.id} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: "8px 10px",
                background: "var(--surface-alt)",
                borderRadius: 4,
                borderLeft: `3px solid ${riskColor(step.riskLevel)}`,
              }}>
                <span style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  flexShrink: 0,
                }}>{idx + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text)" }}>{step.title}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 2 }}>{step.description}</div>
                </div>
                <span style={{
                  fontSize: "0.6rem",
                  color: riskColor(step.riskLevel),
                  fontWeight: 600,
                  flexShrink: 0,
                  padding: "2px 6px",
                  borderRadius: 3,
                  border: `1px solid ${riskColor(step.riskLevel)}`,
                }}>{riskLabel(step.riskLevel, isZh)}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          {state.plan.some(s => s.riskLevel !== "blocked") && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                className="btn btn-primary"
                onClick={handleConfirmRun}
                disabled={!canConfirm}
                style={{
                  fontSize: "0.75rem",
                  background: canConfirm ? "var(--green)" : undefined,
                  borderColor: canConfirm ? "var(--green)" : undefined,
                }}
              >
                {isZh ? "确认执行" : "Confirm Run"}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleStop}
                disabled={!canStop}
                style={{ fontSize: "0.75rem" }}
              >
                {isZh ? "停止" : "Stop"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Execution Log */}
      {state.logs.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>
              {isZh ? "执行日志" : "Execution Log"}
            </div>
            <button
              onClick={handleClear}
              disabled={isBusy}
              className="btn btn-ghost"
              style={{ fontSize: "0.65rem", padding: "2px 8px" }}
            >
              {isZh ? "清空日志" : "Clear Log"}
            </button>
          </div>
          <div style={{
            maxHeight: 300,
            overflowY: "auto",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: 8,
            fontFamily: "monospace",
            fontSize: "0.7rem",
          }}>
            {state.logs.map((log: ComputerUseRunLog) => (
              <div key={log.id} style={{
                padding: "2px 0",
                color: logLevelColor(log.level),
                display: "flex",
                gap: 8,
              }}>
                <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>{formatTime(log.time)}</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Allowed Tasks Reference */}
      <div className="card" style={{ padding: 16, background: "var(--surface-alt)", fontSize: "0.7rem", color: "var(--text-muted)" }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--text-secondary)" }}>
          {isZh ? "允许的安全任务" : "Allowed Safe Tasks"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
          <span>&#10003; {isZh ? "检查当前运行版本" : "Check current version"}</span>
          <span>&#10003; {isZh ? "检查安装路径" : "Check install path"}</span>
          <span>&#10003; {isZh ? "检查桌面快捷方式" : "Check desktop shortcut"}</span>
          <span>&#10003; {isZh ? "检查开始菜单快捷方式" : "Check Start Menu shortcut"}</span>
          <span>&#10003; {isZh ? "检查 Git commit" : "Check Git commit"}</span>
          <span>&#10003; {isZh ? "运行 guard:source" : "Run guard:source"}</span>
          <span>&#10003; {isZh ? "运行 release:sanity" : "Run release:sanity"}</span>
          <span>&#10003; {isZh ? "运行 verify:raw" : "Run verify:raw"}</span>
          <span>&#10003; {isZh ? "打开项目文件夹" : "Open project folder"}</span>
          <span>&#10003; {isZh ? "显示 Release Diagnostics" : "Show Release Diagnostics"}</span>
        </div>
        <div style={{ fontWeight: 600, marginTop: 12, marginBottom: 4, color: "var(--red)" }}>
          {isZh ? "禁止操作" : "Blocked Operations"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
          <span>&#10007; {isZh ? "删除文件" : "Delete files"}</span>
          <span>&#10007; {isZh ? "读取隐私数据" : "Read private data"}</span>
          <span>&#10007; {isZh ? "控制鼠标键盘" : "Mouse/keyboard control"}</span>
          <span>&#10007; {isZh ? "下载执行脚本" : "Download scripts"}</span>
          <span>&#10007; {isZh ? "修改系统设置" : "Modify system settings"}</span>
        </div>
      </div>
    </div>
  );
}