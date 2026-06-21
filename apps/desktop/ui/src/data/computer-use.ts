const STORAGE_KEY = "tokenfence.computerUse";

export type ComputerUseTaskStatus =
  | "idle"
  | "planning"
  | "waiting_confirmation"
  | "running"
  | "completed"
  | "stopped"
  | "failed";

export interface ComputerUsePlanStep {
  id: string;
  title: string;
  description: string;
  commandId?: string;
  riskLevel: "safe" | "review" | "blocked";
}

export interface ComputerUseRunLog {
  id: string;
  time: number;
  level: "info" | "warning" | "error" | "success";
  message: string;
}

export interface ComputerUseState {
  taskText: string;
  status: ComputerUseTaskStatus;
  plan: ComputerUsePlanStep[];
  logs: ComputerUseRunLog[];
  updatedAt: number;
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function emptyState(): ComputerUseState {
  return { taskText: "", status: "idle", plan: [], logs: [], updatedAt: Date.now() };
}

export function loadComputerUseState(): ComputerUseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyState();
    return {
      taskText: typeof parsed.taskText === "string" ? parsed.taskText : "",
      status: isValidStatus(parsed.status) ? parsed.status : "idle",
      plan: Array.isArray(parsed.plan) ? parsed.plan : [],
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return emptyState();
  }
}

function isValidStatus(s: unknown): s is ComputerUseTaskStatus {
  const valid = ["idle", "planning", "waiting_confirmation", "running", "completed", "stopped", "failed"];
  return typeof s === "string" && valid.includes(s);
}

export function saveComputerUseState(state: ComputerUseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, updatedAt: Date.now() }));
  } catch { /* localStorage full or unavailable */ }
}

// SAFE command IDs - only these are allowed
const ALLOWED_COMMAND_IDS = new Set([
  "check_version",
  "check_shortcuts",
  "check_process_path",
  "run_guard_source",
  "run_release_sanity",
  "run_verify_raw",
  "open_project_folder",
]);

// BLOCKED keywords - tasks containing these are blocked
const BLOCKED_KEYWORDS = [
  "delete", "remove", "rm ", "del ", "format",
  "password", "密码", "删除", "格式化",
  "invoke-webrequest", "download", "curl", "wget",
  "keyboard", "mouse", "click", "screenshot",
  "admin", "sudo", "privilege",
  "registry", "regedit", "注册表",
  "browser", "cookie", "浏览器",
];

export function isDangerousTask(taskText: string): boolean {
  const lower = taskText.toLowerCase();
  return BLOCKED_KEYWORDS.some(kw => lower.includes(kw));
}

export function generatePlan(taskText: string): { blocked: boolean; plan: ComputerUsePlanStep[] } {
  if (isDangerousTask(taskText)) {
    return {
      blocked: true,
      plan: [{
        id: uid(),
        title: "任务已被阻止",
        description: "输入的任务包含不允许的操作。Computer Use Preview 不支持删除文件、读取隐私数据、控制鼠标键盘、下载执行脚本、修改系统设置等操作。",
        riskLevel: "blocked",
      }],
    };
  }

  const lower = taskText.toLowerCase();
  const steps: ComputerUsePlanStep[] = [];

  // Pattern-based plan generation
  if (lower.includes("版本") || lower.includes("version")) {
    steps.push(
      { id: uid(), title: "检查当前 UI 版本", description: "读取 VERSION 常量并显示", commandId: "check_version", riskLevel: "safe" },
      { id: uid(), title: "检查当前进程路径", description: "获取正在运行的 TokenFence Studio 进程路径", commandId: "check_process_path", riskLevel: "safe" },
      { id: uid(), title: "对比预期安装路径", description: "将进程路径与 E:\\Apps\\TokenFenceStudio\\v1.5.1 对比", commandId: "check_version", riskLevel: "safe" },
    );
  }

  if (lower.includes("快捷") || lower.includes("shortcut")) {
    steps.push(
      { id: uid(), title: "检查桌面快捷方式", description: "验证桌面快捷方式路径是否正确", commandId: "check_shortcuts", riskLevel: "safe" },
      { id: uid(), title: "检查开始菜单快捷方式", description: "验证开始菜单快捷方式路径是否正确", commandId: "check_shortcuts", riskLevel: "safe" },
    );
  }

  if (lower.includes("guard") || lower.includes("防护")) {
    steps.push(
      { id: uid(), title: "运行 guard:source", description: "执行源代码保护检查", commandId: "run_guard_source", riskLevel: "safe" },
    );
  }

  if (lower.includes("release") || lower.includes("发布")) {
    steps.push(
      { id: uid(), title: "运行 release:sanity", description: "执行发布完整性检查", commandId: "run_release_sanity", riskLevel: "safe" },
    );
  }

  if (lower.includes("verify") || lower.includes("验证") || lower.includes("commit")) {
    steps.push(
      { id: uid(), title: "运行 verify:raw", description: "验证 GitHub 原始提交内容", commandId: "run_verify_raw", riskLevel: "safe" },
    );
  }

  if (lower.includes("项目") || lower.includes("project") || lower.includes("打开")) {
    steps.push(
      { id: uid(), title: "打开项目文件夹", description: "在文件资源管理器中打开项目目录", commandId: "open_project_folder", riskLevel: "safe" },
    );
  }

  if (lower.includes("诊断") || lower.includes("diagnostic") || lower.includes("检查")) {
    steps.push(
      { id: uid(), title: "检查 Release Diagnostics", description: "打开 Release Diagnostics 页面查看完整诊断信息", commandId: "check_version", riskLevel: "safe" },
    );
  }

  // Fallback: generic diagnostic check
  if (steps.length === 0) {
    steps.push(
      { id: uid(), title: "通用诊断检查", description: "检查当前版本和快捷方式状态", commandId: "check_version", riskLevel: "safe" },
      { id: uid(), title: "查看 Release Diagnostics", description: "建议打开 Release Diagnostics 页面获取完整信息", commandId: "check_version", riskLevel: "safe" },
    );
  }

  return { blocked: false, plan: steps };
}

export function simulateStepExecution(
  step: ComputerUsePlanStep,
  onLog: (log: ComputerUseRunLog) => void,
): Promise<void> {
  return new Promise((resolve) => {
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      onLog({
        id: uid(),
        time: Date.now(),
        level: "info",
        message: `[PLAN] ${step.title}: ${step.description}`,
      });
      setTimeout(() => {
        if (step.riskLevel === "blocked") {
          onLog({
            id: uid(),
            time: Date.now(),
            level: "error",
            message: `[BLOCKED] ${step.title}: 任务风险等级为 blocked，已阻止执行`,
          });
        } else if (step.commandId) {
          onLog({
            id: uid(),
            time: Date.now(),
            level: "success",
            message: `[OK] ${step.title}: ${step.commandId} 诊断完成 (simulated)`,
          });
        }
        resolve();
      }, 400);
    }, delay);
  });
}