import type { ProjectFileNode } from './data/project-file-tree';
// Desktop bridge: invokes Tauri commands for file I/O and command execution
// Uses official @tauri-apps/api/core invoke (Tauri v1 compatible)

import { invoke } from "@tauri-apps/api/core";

let _invokeAvailable: boolean | null = null;

async function _getInvoke(): Promise<typeof invoke | null> {
  if (_invokeAvailable !== null) return _invokeAvailable ? invoke : null;
  try {
    // Quick test: check if we can actually call a harmless command or just check window.__TAURI__
    const w = window as any;
    const hasGlobal = typeof w?.__TAURI__?.invoke === "function";
    if (hasGlobal) { _invokeAvailable = true; return invoke; }
    _invokeAvailable = false;
    return null;
  } catch {
    _invokeAvailable = false;
    return null;
  }
}

export interface CommandResult {
  exit_code: number;
  stdout: string;
  stderr: string;
  killed: boolean;
  duration_ms: number;
}

export interface FileInfo {
  path: string;
  exists: boolean;
  size: number;
  is_dir: boolean;
}

export async function executeCommand(command: string, args?: string[], cwd?: string, timeoutMs?: number): Promise<CommandResult> {
  const inv = await _getInvoke();
  if (!inv) {
    return { exit_code: -1, stdout: "", stderr: "Desktop command bridge failed: runtime unavailable or invoke command not registered.", killed: false, duration_ms: 0 };
  }
  return inv("execute_command", { command, args: args ?? [], cwd: cwd ?? ".", timeoutMs: timeoutMs ?? 30000 }) as Promise<CommandResult>;
}

export async function writeFile(path: string, content: string): Promise<string> {
  const inv = await _getInvoke();
  if (!inv) { console.warn("[desktop-bridge] writeFile not available outside Tauri"); return path; }
  return inv("write_file", { path, content }) as Promise<string>;
}

export async function readFile(path: string): Promise<string> {
  const inv = await _getInvoke();
  if (!inv) return "";
  return inv("read_file", { path }) as Promise<string>;
}

export async function fileExists(path: string): Promise<FileInfo> {
  const inv = await _getInvoke();
  if (!inv) return { path, exists: false, size: 0, is_dir: false };
  return inv("file_exists", { path }) as Promise<FileInfo>;
}

export async function createDirectory(path: string): Promise<string> {
  const inv = await _getInvoke();
  if (!inv) return path;
  return inv("create_directory", { path }) as Promise<string>;
}

export async function listDirectory(path: string): Promise<FileInfo[]> {
  const inv = await _getInvoke();
  if (!inv) return [];
  return inv("list_directory", { path }) as Promise<FileInfo[]>;
}

export async function initTokenfenceDirs(basePath: string): Promise<string> {
  const inv = await _getInvoke();
  if (!inv) return basePath;
  return inv("init_tokenfence_dirs", { basePath }) as Promise<string>;
}

export async function isTauri(): Promise<boolean> {
  const inv = await _getInvoke();
  return inv !== null;
}
export interface PatchResult {
  file_path: string;
  success: boolean;
  error?: string;
  backup_path?: string;
}
export interface BackupResult {
  original_path: string;
  backup_path: string;
  timestamp?: number;
}
export async function createBackup(filePath: string): Promise<BackupResult> {
  const inv = await _getInvoke();
  if (!inv) return { original_path: filePath, backup_path: "", timestamp: 0 };
  return inv("create_backup", { filePath }) as Promise<BackupResult>;
}
export async function applyPatch(filePath: string, newContent: string, createBackupBefore?: boolean): Promise<PatchResult> {
  const inv = await _getInvoke();
  if (!inv) return { file_path: filePath, success: false, error: "Desktop bridge unavailable" };
  return inv("apply_patch", { filePath, newContent, createBackupBefore }) as Promise<PatchResult>;
}

export async function undoLastPatch(filePath: string): Promise<PatchResult> {
  const inv = await _getInvoke();
  if (!inv) return { file_path: filePath, success: false, error: "Desktop bridge unavailable" };
  return inv("undo_last_patch", { filePath }) as Promise<PatchResult>;
}

export async function appendOperationLog(operation: string, files: string[], success: boolean, error?: string): Promise<string> {
  const inv = await _getInvoke();
  if (!inv) return "";
  return inv("append_operation_log", { operation, files, success, error }) as Promise<string>;
}

// ── Project Scan ──────────────────────────────────────────────────────

export interface ProjectScanDebug {
  path: string;
  exists: boolean;
  isDir: boolean;
  readDirCount: number;
  returnedTopNodes: number;
  returnedFlatNodes: number;
  returnedFiles: number;
  returnedDirs: number;
  firstEntries: string[];
  firstNodes: string[];
  error: string | null;
}

export interface ProjectScanResult {
  nodes: ProjectFileNode[];
  debug: ProjectScanDebug;
}

function emptyScanDebug(path: string, error: string): ProjectScanDebug {
  return { path, exists: false, isDir: false, readDirCount: 0, returnedTopNodes: 0, returnedFlatNodes: 0, returnedFiles: 0, returnedDirs: 0, firstEntries: [], firstNodes: [], error };
}

/**
 * Scan a project directory via the Tauri backend.
 * Uses @tauri-apps/api/core invoke (one canonical path).
 */
export async function scanProjectDirectory(projectPath: string): Promise<ProjectScanResult> {
  const normalizedPath = projectPath.trim();

  if (!normalizedPath) {
    return { nodes: [], debug: emptyScanDebug(normalizedPath, "Project path is empty.") };
  }

  const inv = await _getInvoke();
  if (!inv) {
    return { nodes: [], debug: emptyScanDebug(normalizedPath, "No Tauri invoke available. Is the app running as a desktop window?") };
  }

  try {
    const result = await inv("scan_project_directory", { projectPath: normalizedPath }) as ProjectScanResult;

    if (!result || !Array.isArray(result.nodes)) {
      return { nodes: [], debug: emptyScanDebug(normalizedPath, "scan_project_directory returned an invalid result shape.") };
    }

    // Validate result structure
    const dbg = result.debug || {};
    return {
      nodes: result.nodes,
      debug: {
        path: dbg.path || normalizedPath,
        exists: !!dbg.exists,
        isDir: !!dbg.isDir,
        readDirCount: dbg.readDirCount ?? 0,
        returnedTopNodes: dbg.returnedTopNodes ?? result.nodes.length,
        returnedFlatNodes: dbg.returnedFlatNodes ?? 0,
        returnedFiles: dbg.returnedFiles ?? 0,
        returnedDirs: dbg.returnedDirs ?? 0,
        firstEntries: dbg.firstEntries || [],
        firstNodes: dbg.firstNodes || [],
        error: dbg.error || null,
      },
    };
  } catch (e: any) {
    const message = e instanceof Error ? e.message : String(e);
    return { nodes: [], debug: emptyScanDebug(normalizedPath, "Tauri invoke failed: " + message) };
  }
}

/**
 * Return the actual scan bridge status.
 * Only returns "tauri" if invoke is confirmed available.
 */
export async function getScanBridgeStatus(): Promise<{ available: boolean; source: "tauri" | "browser" }> {
  const inv = await _getInvoke();
  if (inv) return { available: true, source: "tauri" };
  return { available: false, source: "browser" };
}

export async function openLogsFolder(): Promise<void> {
  const inv = await _getInvoke();
  if (!inv) return;
  const logsDir = "E:\\Dev\\tokenfence-studio-final\\.tokenfence\\logs";
  await inv("execute_command", { command: "explorer", args: [logsDir], cwd: ".", timeoutMs: 5000 });
}