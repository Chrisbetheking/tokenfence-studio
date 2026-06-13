#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[tauri::command]
fn get_storage_path(app_handle: tauri::AppHandle) -> String {
    app_handle
        .path()
        .app_data_dir()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_storage_path])
        .run(tauri::generate_context!())
        .expect("error while running TokenFence Studio");
}