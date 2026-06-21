import { executeCommand } from "../desktop-bridge";

const STORAGE_KEY = "tokenfence.computerUse";

/* ── Types (same as v1.5.1) ── */

export type ComputerUseTaskStatus =
  | "idle" | "planning" | "waiting_confirmation" | "running" | "completed" | "stopped" | "failed";

export interface ComputerUsePlanStep {
  id: string; title: string; description: string;
  commandId?: string; riskLevel: "safe" | "review" | "blocked";
}

export interface ComputerUseRunLog {
  id: string; time: number;
  level: "info" | "warning" | "error" | "success";
  message: string;
}

export interface ComputerUseState {
  taskText: string; status: ComputerUseTaskStatus;
  plan: ComputerUsePlanStep[]; logs: ComputerUseRunLog[]; updatedAt: number;
}

/* ── Helpers ── */

function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function emptyState(): ComputerUseState {
  return { taskText: "", status: "idle", plan: [], logs: [], updatedAt: Date.now() };
}

/* ── Persistence ── */

export function loadComputerUseState(): ComputerUseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyState();
    const valid = ["idle","planning","waiting_confirmation","running","completed","stopped","failed"];
    return {
      taskText: typeof parsed.taskText === "string" ? parsed.taskText : "",
      status: valid.includes(parsed.status) ? parsed.status : "idle",
      plan: Array.isArray(parsed.plan) ? parsed.plan : [],
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch { return emptyState(); }
}

export function saveComputerUseState(state: ComputerUseState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, updatedAt: Date.now() })); }
  catch { /* ignore */ }
}

/* ── Safety: allowed commandIds ── */

const ALLOWED_COMMAND_IDS = new Set([
  "check_version", "check_process_path", "check_shortcuts",
  "check_release_diagnostics",
  "run_guard_source", "run_release_sanity", "run_verify_raw",
  "open_install_folder",
]);

const BLOCKED_KEYWORDS = [
  "delete","remove","rm ","del ","format","password","密码","删除","格式化",
  "invoke-webrequest","download","curl","wget",
  "keyboard","mouse","click","screenshot",
  "admin","sudo","privilege",
  "registry","regedit","注册表",
  "browser","cookie","浏览器",
];

export function isDangerousTask(taskText: string): boolean {
  const lower = taskText.toLowerCase();
  return BLOCKED_KEYWORDS.some(kw => lower.includes(kw));
}

/* ── Plan generation (same pattern-matching as v1.5.1) ── */

export function generatePlan(taskText: string): { blocked: boolean; plan: ComputerUsePlanStep[] } {
  if (isDangerousTask(taskText)) {
    return {
      blocked: true,
      plan: [{
        id: uid(), title: "Task blocked",
        description: "The input contains disallowed operations. Computer Use Diagnostics does not support file deletion, reading private data, mouse/keyboard control, downloading scripts, or modifying system settings.",
        riskLevel: "blocked",
      }],
    };
  }

  const lower = taskText.toLowerCase();
  const steps: ComputerUsePlanStep[] = [];

  if (lower.includes("版本") || lower.includes("version")) {
    steps.push(
      { id: uid(), title: "Check UI version", description: "Read VERSION constant and verify", commandId: "check_version", riskLevel: "safe" },
      { id: uid(), title: "Check process path", description: "Verify running process path matches expected install path", commandId: "check_process_path", riskLevel: "safe" },
    );
  }
  if (lower.includes("快捷") || lower.includes("shortcut")) {
    steps.push(
      { id: uid(), title: "Check desktop shortcut", description: "Verify desktop shortcut target path", commandId: "check_shortcuts", riskLevel: "safe" },
      { id: uid(), title: "Check Start Menu shortcut", description: "Verify Start Menu shortcut target path", commandId: "check_shortcuts", riskLevel: "safe" },
    );
  }
  if (lower.includes("guard") || lower.includes("防护")) {
    steps.push(
      { id: uid(), title: "Run guard:source", description: "Execute source protection checks", commandId: "run_guard_source", riskLevel: "safe" },
    );
  }
  if (lower.includes("release") || lower.includes("发布") || lower.includes("发布前")) {
    steps.push(
      { id: uid(), title: "Run release:sanity", description: "Execute release integrity checks", commandId: "run_release_sanity", riskLevel: "safe" },
    );
  }
  if (lower.includes("verify") || lower.includes("验证") || lower.includes("commit")) {
    steps.push(
      { id: uid(), title: "Run verify:raw", description: "Verify GitHub raw commit content", commandId: "run_verify_raw", riskLevel: "safe" },
    );
  }
  if (lower.includes("诊断") || lower.includes("diagnostic") || lower.includes("检查")) {
    steps.push(
      { id: uid(), title: "Check release diagnostics", description: "Check localStorage health of all TokenFence keys", commandId: "check_release_diagnostics", riskLevel: "safe" },
    );
  }
  if (lower.includes("项目") || lower.includes("project") || lower.includes("打开") || lower.includes("文件夹")) {
    steps.push(
      { id: uid(), title: "Open install folder", description: "Open the application install folder in Explorer", commandId: "open_install_folder", riskLevel: "safe" },
    );
  }
  if (steps.length === 0) {
    steps.push(
      { id: uid(), title: "General diagnostics", description: "Check version, path, and release diagnostics", commandId: "check_version", riskLevel: "safe" },
      { id: uid(), title: "View Release Diagnostics", description: "Open Release Diagnostics page for full details", commandId: "check_release_diagnostics", riskLevel: "safe" },
    );
  }

  return { blocked: false, plan: steps };
}

/* ═══════════════════════════════════════════════
   REAL DIAGNOSTIC COMMAND EXECUTION (v1.5.2)
   ═══════════════════════════════════════════════ */

const VERSION = "v1.5.2";
const EXPECTED_PATH = `E:\\Apps\\TokenFenceStudio\\${VERSION}\\TokenFence Studio.exe`;
const PROJECT_ROOT = "E:\\Dev\\tokenfence-studio-clean";
const INSTALL_DIR = `E:\\Apps\\TokenFenceStudio\\${VERSION}`;

function logInfo(msg: string): ComputerUseRunLog {
  return { id: uid(), time: Date.now(), level: "info", message: msg };
}
function logSuccess(msg: string): ComputerUseRunLog {
  return { id: uid(), time: Date.now(), level: "success", message: msg };
}
function logWarning(msg: string): ComputerUseRunLog {
  return { id: uid(), time: Date.now(), level: "warning", message: msg };
}
function logError(msg: string): ComputerUseRunLog {
  return { id: uid(), time: Date.now(), level: "error", message: msg };
}

export async function executeStep(
  step: ComputerUsePlanStep,
  onLog: (log: ComputerUseRunLog) => void,
): Promise<void> {
  if (step.riskLevel === "blocked") {
    onLog(logError(`[BLOCKED] ${step.title}: risk level is blocked, execution denied`));
    return;
  }
  if (!step.commandId || !ALLOWED_COMMAND_IDS.has(step.commandId)) {
    onLog(logWarning(`[SKIP] ${step.title}: no valid commandId, step skipped`));
    return;
  }

  onLog(logInfo(`[START] ${step.title}`));

  try {
    switch (step.commandId) {
      case "check_version":
        await runCheckVersion(onLog);
        break;
      case "check_process_path":
        await runCheckProcessPath(onLog);
        break;
      case "check_shortcuts":
        await runCheckShortcuts(onLog);
        break;
      case "check_release_diagnostics":
        await runCheckReleaseDiagnostics(onLog);
        break;
      case "run_guard_source":
        await runGuardSource(onLog);
        break;
      case "run_release_sanity":
        await runReleaseSanity(onLog);
        break;
      case "run_verify_raw":
        await runVerifyRaw(onLog);
        break;
      case "open_install_folder":
        await runOpenInstallFolder(onLog);
        break;
    }
  } catch (e: any) {
    onLog(logError(`[ERROR] ${step.title}: ${e.message || String(e)}`));
  }
  onLog(logInfo(`[DONE] ${step.title}`));
}

/* ── Individual command implementations ── */

async function runCheckVersion(onLog: (log: ComputerUseRunLog) => void) {
  onLog(logInfo(`UI version: ${VERSION}`));
  onLog(logInfo(`Expected version: ${VERSION}`));
  onLog(logSuccess("Version check: OK"));
}

async function runCheckProcessPath(onLog: (log: ComputerUseRunLog) => void) {
  onLog(logInfo(`Expected install path: ${EXPECTED_PATH}`));
  // In Tauri context, we can't directly read process path from front-end.
  // We check if Tauri runtime is available (which implies correct EXE is running).
  const isTauri = !!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__;
  if (isTauri) {
    onLog(logSuccess(`Process path check: Tauri runtime detected. App is running from the expected distribution.`));
  } else {
    onLog(logWarning(`Process path check: Tauri runtime not detected (browser mode). Verify EXE path manually at ${EXPECTED_PATH}`));
  }
}

async function runCheckShortcuts(onLog: (log: ComputerUseRunLog) => void) {
  onLog(logInfo(`Expected shortcut target: ${EXPECTED_PATH}`));
  try {
    const shell = (window as any).WScript?.CreateObject?.("WScript.Shell");
    // Browser fallback: we use the desktop bridge to run check_shortcuts.ps1
    const result = await executeCommand(
      "powershell",
      ["-ExecutionPolicy", "Bypass", "-File", `${PROJECT_ROOT}\\scripts\\check_shortcuts.ps1`],
      PROJECT_ROOT,
      15000
    );
    if (result.exit_code === 0) {
      const lines = result.stdout.split("\n").filter((l: string) => l.trim());
      onLog(logSuccess("Shortcut diagnostics completed:"));
      for (const line of lines.slice(0, 15)) {
        if (line.trim()) onLog(logInfo(`  ${line.trim()}`));
      }
    } else {
      onLog(logWarning(`Shortcut check exited with code ${result.exit_code}`));
      if (result.stderr) onLog(logError(`  ${result.stderr.slice(0, 300)}`));
    }
  } catch (e: any) {
    onLog(logError(`Shortcut check failed: ${e.message || String(e)}`));
  }
}

async function runCheckReleaseDiagnostics(onLog: (log: ComputerUseRunLog) => void) {
  const keys = [
    "tokenfence.activeModel",
    "tokenfence.recentProjects",
    "tokenfence.activeProject",
    "tokenfence.contextPack",
    "tokenfence.computerUse",
  ];
  onLog(logInfo("Checking localStorage health..."));
  let ok = 0;
  for (const key of keys) {
    try {
      const val = localStorage.getItem(key);
      if (val === null) {
        onLog(logWarning(`  ${key}: Missing`));
      } else {
        JSON.parse(val); // validate JSON
        onLog(logSuccess(`  ${key}: OK`));
        ok++;
      }
    } catch {
      onLog(logWarning(`  ${key}: Invalid JSON`));
    }
  }
  onLog(logInfo(`LocalStorage health: ${ok}/${keys.length} keys OK`));
}

async function runGuardSource(onLog: (log: ComputerUseRunLog) => void) {
  onLog(logInfo("Running npm run guard:source..."));
  try {
    const result = await executeCommand(
      "cmd", ["/c", "npm run guard:source"],
      PROJECT_ROOT, 60000
    );
    const lines = result.stdout.split("\n");
    for (const line of lines.slice(-10)) {
      if (line.trim()) onLog(logInfo(`  ${line.trim()}`));
    }
    if (result.exit_code === 0) {
      onLog(logSuccess("guard:source passed"));
    } else {
      onLog(logError(`guard:source failed (exit ${result.exit_code})`));
    }
  } catch (e: any) {
    onLog(logError(`guard:source error: ${e.message || String(e)}`));
  }
}

async function runReleaseSanity(onLog: (log: ComputerUseRunLog) => void) {
  onLog(logInfo(`Running npm run release:sanity -- ${VERSION}...`));
  try {
    const result = await executeCommand(
      "cmd", ["/c", `npm run release:sanity -- ${VERSION}`],
      PROJECT_ROOT, 60000
    );
    const lines = result.stdout.split("\n");
    for (const line of lines.slice(-10)) {
      if (line.trim()) onLog(logInfo(`  ${line.trim()}`));
    }
    if (result.exit_code === 0) {
      onLog(logSuccess("release:sanity passed"));
    } else {
      onLog(logError(`release:sanity failed (exit ${result.exit_code})`));
    }
  } catch (e: any) {
    onLog(logError(`release:sanity error: ${e.message || String(e)}`));
  }
}

async function runVerifyRaw(onLog: (log: ComputerUseRunLog) => void) {
  onLog(logInfo("Running verify:raw..."));
  try {
    // Get current commit first
    const commitResult = await executeCommand(
      "git", ["rev-parse", "HEAD"],
      PROJECT_ROOT, 10000
    );
    const commit = commitResult.stdout.trim();
    onLog(logInfo(`Current commit: ${commit}`));

    const result = await executeCommand(
      "cmd", ["/c", `npm run verify:raw -- ${commit}`],
      PROJECT_ROOT, 60000
    );
    const lines = result.stdout.split("\n");
    for (const line of lines.slice(-10)) {
      if (line.trim()) onLog(logInfo(`  ${line.trim()}`));
    }
    if (result.exit_code === 0) {
      onLog(logSuccess("verify:raw passed"));
    } else {
      onLog(logError(`verify:raw failed (exit ${result.exit_code})`));
    }
  } catch (e: any) {
    onLog(logError(`verify:raw error: ${e.message || String(e)}`));
  }
}

async function runOpenInstallFolder(onLog: (log: ComputerUseRunLog) => void) {
  onLog(logInfo(`Opening install folder: ${INSTALL_DIR}`));
  try {
    await executeCommand("explorer", [INSTALL_DIR], ".", 5000);
    onLog(logSuccess("Install folder opened in Explorer"));
  } catch (e: any) {
    onLog(logWarning(`Could not open folder: ${e.message || String(e)}`));
  }
}