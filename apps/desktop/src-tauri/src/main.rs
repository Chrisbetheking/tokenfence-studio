// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[tauri::command]
fn get_storage_path(app_handle: tauri::AppHandle) -> String {
    let path = app_handle
        .path()
        .app_data_dir()
        .unwrap_or_default();
    path.to_string_lossy().to_string()
}

#[tauri::command]
fn select_workspace_path(app_handle: tauri::AppHandle) -> Result<String, String> {
    use tauri::api::dialog::blocking::FileDialogBuilder;
    let path = FileDialogBuilder::new()
        .set_title("Select TokenFence Workspace Folder")
        .pick_folder();
    match path {
        Some(p) => Ok(p.to_string_lossy().to_string()),
        None => Err("No folder selected".into()),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_storage_path,
            select_workspace_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running TokenFence Studio");
}
