#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use serde::{Deserialize, Serialize};
use std::process::Command;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
struct CommandResult {
    exit_code: i32,
    stdout: String,
    stderr: String,
    killed: bool,
    duration_ms: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct FileInfo {
    path: String,
    exists: bool,
    size: u64,
    is_dir: bool,
}
#[derive(Debug, Serialize, Deserialize)]
struct PatchResult {
    file_path: String,
    success: bool,
    error: Option<String>,
    backup_path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct BackupResult {
    original_path: String,
    backup_path: String,
    timestamp: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct OperationLogEntry {
    timestamp: u64,
    operation: String,
    files: Vec<String>,
    success: bool,
    error: Option<String>,
}


const BLOCKED_COMMANDS: &[&str] = &[
    "rm -rf /",
    "del /f /s c:\\",
    "format",
    "shutdown",
    "reboot",
    "diskpart",
    "reg delete",
    "rd /s c:\\",
];


const BLOCKED_PATHS: &[&str] = &[
    ".git",
    "node_modules",
    "target",
    "dist",
    "build",
    ".env",
    ".secret",
    ".key",
    ".pem",
    ".p12",
    ".pfx",
];

fn is_path_safe(path: &str) -> bool {
    let lower = path.to_lowercase();
    for blocked in BLOCKED_PATHS {
        if lower.contains(&blocked.to_lowercase()) {
            return false;
        }
    }
    true
}

fn get_backup_dir() -> PathBuf {
    PathBuf::from(r"E:\Dev\tokenfence-studio-final\.tokenfence\backups")
}

fn get_logs_dir() -> PathBuf {
    PathBuf::from(r"E:\Dev\tokenfence-studio-final\.tokenfence\logs")
}

fn is_command_safe(command: &str) -> bool {
    let lower = command.to_lowercase();
    for blocked in BLOCKED_COMMANDS {
        if lower.contains(&blocked.to_lowercase()) {
            return false;
        }
    }
    true
}

#[tauri::command]
fn get_storage_path(app_handle: tauri::AppHandle) -> String {
    tauri::api::path::app_data_dir(&app_handle.config())
        .unwrap_or_default()
        .to_string_lossy()
        .to_string()
}

#[tauri::command]
fn execute_command(command: String, args: Vec<String>, cwd: Option<String>, timeout_ms: Option<u64>) -> CommandResult {
    use std::time::Instant;

    if !is_command_safe(&command) {
        return CommandResult {
            exit_code: -1,
            stdout: String::new(),
            stderr: format!("[Security] Blocked unsafe command: {}", command),
            killed: false,
            duration_ms: 0,
        };
    }

    let start = Instant::now();
    let work_dir = cwd.unwrap_or_else(|| ".".to_string());

    let mut cmd = if cfg!(target_os = "windows") {
        let mut c = Command::new("cmd");
        c.arg("/C").arg(&command);
        c
    } else {
        let mut c = Command::new("sh");
        c.arg("-c").arg(&command);
        c
    };

    if !args.is_empty() {
        cmd.args(&args);
    }
    cmd.current_dir(&work_dir);

    let _timeout = timeout_ms.unwrap_or(30000);
    let output = cmd.output();

    let duration_ms = start.elapsed().as_millis() as u64;

    match output {
        Ok(out) => CommandResult {
            exit_code: out.status.code().unwrap_or(-1),
            stdout: String::from_utf8_lossy(&out.stdout).to_string(),
            stderr: String::from_utf8_lossy(&out.stderr).to_string(),
            killed: false,
            duration_ms,
        },
        Err(e) => CommandResult {
            exit_code: -1,
            stdout: String::new(),
            stderr: format!("Failed to execute: {}", e),
            killed: false,
            duration_ms,
        },
    }
}

#[tauri::command]
fn create_directory(path: String) -> Result<String, String> {
    let p = PathBuf::from(&path);
    std::fs::create_dir_all(&p).map_err(|e| format!("Failed to create directory {}: {}", path, e))?;
    Ok(path)
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<String, String> {
    let p = PathBuf::from(&path);
    if let Some(parent) = p.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create parent dir: {}", e))?;
    }
    std::fs::write(&p, &content).map_err(|e| format!("Failed to write {}: {}", path, e))?;
    Ok(path)
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path, e))
}

#[tauri::command]
fn file_exists(path: String) -> FileInfo {
    let p = PathBuf::from(&path);
    let exists = p.exists();
    let is_dir = p.is_dir();
    let size = if exists && !is_dir {
        std::fs::metadata(&p).map(|m| m.len()).unwrap_or(0)
    } else {
        0
    };
    FileInfo { path, exists, size, is_dir }
}

#[tauri::command]
fn list_directory(path: String) -> Result<Vec<FileInfo>, String> {
    let p = PathBuf::from(&path);
    let entries = std::fs::read_dir(&p).map_err(|e| format!("Failed to list {}: {}", path, e))?;
    let mut files = Vec::new();
    for entry in entries {
        if let Ok(e) = entry {
            let ep = e.path();
            let exists = ep.exists();
            let is_dir = ep.is_dir();
            let size = if exists && !is_dir {
                std::fs::metadata(&ep).map(|m| m.len()).unwrap_or(0)
            } else {
                0
            };
            files.push(FileInfo {
                path: ep.to_string_lossy().to_string(),
                exists,
                size,
                is_dir,
            });
        }
    }
    Ok(files)
}

#[tauri::command]

fn init_tokenfence_dirs(base_path: String) -> Result<String, String> {
    let dirs = vec![
        "runtimes",
        "outputs",
        "logs",
        "config",
        "test-vault",
    ];
    for d in &dirs {
        let full = PathBuf::from(&base_path).join(d);
        std::fs::create_dir_all(&full)
            .map_err(|e| format!("Failed to create {}: {}", full.display(), e))?;
    }
    Ok(base_path)
}


#[tauri::command]
fn create_backup(file_path: String) -> Result<BackupResult, String> {
    if !is_path_safe(&file_path) {
        return Err(format!("Path is blocked for safety: {}", file_path));
    }
    let src = PathBuf::from(&file_path);
    if !src.exists() || src.is_dir() {
        return Err(format!("File not found or is directory: {}", file_path));
    }
    // Check file size limit: 300KB
    let meta = std::fs::metadata(&src).map_err(|e| format!("Cannot read file: {}", e))?;
    if meta.len() > 300 * 1024 {
        return Err(format!("File too large (max 300KB): {} bytes", meta.len()));
    }
    let backup_dir = get_backup_dir();
    std::fs::create_dir_all(&backup_dir).map_err(|e| format!("Cannot create backup dir: {}", e))?;
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let fname = src.file_name().unwrap_or_default().to_string_lossy();
    let backup_name = format!("{}_{}.bak", fname, timestamp);
    let backup_path = backup_dir.join(&backup_name);
    std::fs::copy(&src, &backup_path).map_err(|e| format!("Backup failed: {}", e))?;
    Ok(BackupResult {
        original_path: file_path,
        backup_path: backup_path.to_string_lossy().to_string(),
        timestamp,
    })
}

#[tauri::command]
fn apply_patch(file_path: String, new_content: String, create_backup_before: Option<bool>) -> Result<PatchResult, String> {
    let do_backup = create_backup_before.unwrap_or(true);
    if !is_path_safe(&file_path) {
        return Ok(PatchResult {
            file_path: file_path.clone(),
            success: false,
            error: Some(format!("Path is blocked for safety: {}", file_path)),
            backup_path: None,
        });
    }
    let src = PathBuf::from(&file_path);
    // Check size
    if src.exists() && !src.is_dir() {
        let meta = std::fs::metadata(&src).map_err(|e| format!("Cannot read file: {}", e))?;
        if meta.len() > 300 * 1024 {
            return Ok(PatchResult {
                file_path: file_path.clone(),
                success: false,
                error: Some(format!("File too large (max 300KB): {} bytes", meta.len())),
                backup_path: None,
            });
        }
    }
    let mut backup_path = None;
    if do_backup && src.exists() {
        match create_backup(file_path.clone()) {
            Ok(bk) => backup_path = Some(bk.backup_path),
            Err(e) => {
                return Ok(PatchResult {
                    file_path: file_path.clone(),
                    success: false,
                    error: Some(format!("Backup failed: {}", e)),
                    backup_path: None,
                });
            }
        }
    }
    // Write new content
    if let Some(parent) = src.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Cannot create parent dir: {}", e))?;
    }
    match std::fs::write(&src, &new_content) {
        Ok(()) => Ok(PatchResult {
            file_path,
            success: true,
            error: None,
            backup_path,
        }),
        Err(e) => Ok(PatchResult {
            file_path,
            success: false,
            error: Some(format!("Write failed: {}", e)),
            backup_path,
        }),
    }
}

#[tauri::command]
fn undo_last_patch(file_path: String) -> Result<PatchResult, String> {
    let backup_dir = get_backup_dir();
    if !backup_dir.exists() {
        return Ok(PatchResult {
            file_path: file_path.clone(),
            success: false,
            error: Some("No backup directory found".to_string()),
            backup_path: None,
        });
    }
    let fname = PathBuf::from(&file_path)
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    // Find most recent backup for this file
    let mut best: Option<(PathBuf, u64)> = None;
    if let Ok(entries) = std::fs::read_dir(&backup_dir) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with(&fname) && name.ends_with(".bak") {
                // Extract timestamp
                let parts: Vec<&str> = name.split('_').collect();
                if parts.len() >= 2 {
                    let ts_str = parts.last().unwrap_or(&"").replace(".bak", "");
                    if let Ok(ts) = ts_str.parse::<u64>() {
                        if best.is_none() || ts > best.as_ref().unwrap().1 {
                            best = Some((entry.path(), ts));
                        }
                    }
                }
            }
        }
    }
    match best {
        Some((bak_path, _ts)) => {
            let content = std::fs::read_to_string(&bak_path)
                .map_err(|e| format!("Cannot read backup: {}", e))?;
            std::fs::write(&file_path, &content)
                .map_err(|e| format!("Cannot restore: {}", e))?;
            Ok(PatchResult {
                file_path,
                success: true,
                error: None,
                backup_path: Some(bak_path.to_string_lossy().to_string()),
            })
        }
        None => Ok(PatchResult {
            file_path,
            success: false,
            error: Some("No backup found for this file".to_string()),
            backup_path: None,
        }),
    }
}

#[tauri::command]
fn append_operation_log(operation: String, files: Vec<String>, success: bool, error: Option<String>) -> Result<String, String> {
    let logs_dir = get_logs_dir();
    std::fs::create_dir_all(&logs_dir).map_err(|e| format!("Cannot create logs dir: {}", e))?;
    let log_path = logs_dir.join("agent-operations.jsonl");
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let entry = serde_json::json!({
        "timestamp": timestamp,
        "operation": operation,
        "files": files,
        "success": success,
        "error": error,
    });
    let line = serde_json::to_string(&entry).unwrap_or_default() + "
";
    use std::io::Write;
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .map_err(|e| format!("Cannot open log: {}", e))?;
    file.write_all(line.as_bytes())
        .map_err(|e| format!("Cannot write log: {}", e))?;
    Ok(log_path.to_string_lossy().to_string())
}

fn main() {
    tauri::Builder::default()
        
        .invoke_handler(tauri::generate_handler![
            get_storage_path,
            execute_command,
            create_directory,
            write_file,
            read_file,
            file_exists,
            list_directory,
            init_tokenfence_dirs,
            create_backup,
            apply_patch,
            undo_last_patch,
            append_operation_log,
        ])
        .run(tauri::generate_context!())
        .expect("error while running TokenFence Studio");
}

