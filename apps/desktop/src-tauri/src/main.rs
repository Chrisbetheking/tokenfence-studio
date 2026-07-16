#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::process::Command;
use std::time::{Duration, Instant};
use tauri::{CustomMenuItem, Manager, Menu, MenuItem, Submenu};
use url::Url;

const MAX_TIMEOUT_MS: u64 = 180_000;
const MIN_TIMEOUT_MS: u64 = 5_000;
const CREDENTIAL_SERVICE: &str = "com.tokenfence.studio.provider";
const MAX_MESSAGE_CHARS: usize = 1_000_000;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProviderConfigInput {
    profile_id: String,
    provider_id: String,
    api_style: String,
    api_key: String,
    model: String,
    base_url: String,
    timeout_ms: u64,
    requires_credential: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct ProviderMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProviderChatRequest {
    config: ProviderConfigInput,
    messages: Vec<ProviderMessage>,
    max_tokens: Option<u32>,
    temperature: Option<f64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ProviderReply {
    ok: bool,
    status: u16,
    content: Option<String>,
    model: Option<String>,
    error_code: Option<String>,
    error_message: Option<String>,
    latency_ms: u128,
}

impl ProviderReply {
    fn failure(status: u16, code: &str, message: &str, latency_ms: u128) -> Self {
        Self {
            ok: false,
            status,
            content: None,
            model: None,
            error_code: Some(code.to_string()),
            error_message: Some(message.to_string()),
            latency_ms,
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SecretReply {
    ok: bool,
    has_value: bool,
    value: Option<String>,
    error_message: Option<String>,
}

impl SecretReply {
    fn success(value: Option<String>) -> Self {
        Self {
            ok: true,
            has_value: value.is_some(),
            value,
            error_message: None,
        }
    }

    fn failure(message: &str) -> Self {
        Self {
            ok: false,
            has_value: false,
            value: None,
            error_message: Some(message.to_string()),
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct PlatformInfo {
    app_version: &'static str,
    os: &'static str,
    arch: &'static str,
    secure_store: &'static str,
    desktop_runtime: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ComputerCapability {
    id: &'static str,
    available: bool,
    permission_required: bool,
    status: &'static str,
    message: &'static str,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ReleaseAsset {
    name: String,
    download_url: String,
    size: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct UpdateInfo {
    ok: bool,
    current_version: String,
    latest_version: Option<String>,
    update_available: bool,
    release_url: Option<String>,
    published_at: Option<String>,
    notes: Option<String>,
    assets: Vec<ReleaseAsset>,
    error_message: Option<String>,
}

fn provider_name(provider_id: &str) -> &'static str {
    match provider_id {
        "deepseek" => "DeepSeek",
        "openai" => "OpenAI",
        "anthropic" => "Anthropic",
        "gemini" => "Gemini",
        "qwen" => "Qwen",
        "kimi" => "Kimi",
        "doubao" => "Doubao",
        "zhipu" => "Zhipu",
        "openrouter" => "OpenRouter",
        "ollama" => "Ollama",
        "lmstudio" => "LM Studio",
        "custom" => "custom provider",
        _ => "provider",
    }
}

fn is_local_host(host: &str) -> bool {
    matches!(host, "localhost" | "127.0.0.1" | "::1")
}

fn trusted_host(provider_id: &str, host: &str) -> bool {
    match provider_id {
        "deepseek" => host == "api.deepseek.com",
        "openai" => host == "api.openai.com",
        "anthropic" => host == "api.anthropic.com",
        "gemini" => host == "generativelanguage.googleapis.com",
        "qwen" => host == "dashscope.aliyuncs.com",
        "kimi" => host == "api.moonshot.cn",
        "doubao" => host == "ark.cn-beijing.volces.com",
        "zhipu" => host == "open.bigmodel.cn",
        "openrouter" => host == "openrouter.ai",
        "ollama" | "lmstudio" => is_local_host(host),
        "custom" => true,
        _ => false,
    }
}

fn validate_endpoint(config: &ProviderConfigInput) -> Result<String, ProviderReply> {
    let raw = config.base_url.trim().trim_end_matches('/');
    let parsed = Url::parse(raw).map_err(|_| {
        ProviderReply::failure(0, "INVALID_ENDPOINT", "Enter a valid provider base URL.", 0)
    })?;
    let host = parsed.host_str().unwrap_or_default();
    let local = is_local_host(host);
    if parsed.scheme() != "https" && !(parsed.scheme() == "http" && local) {
        return Err(ProviderReply::failure(
            0,
            "UNSAFE_ENDPOINT",
            "Remote providers require HTTPS. Plain HTTP is allowed only for localhost runtimes.",
            0,
        ));
    }
    if !trusted_host(config.provider_id.as_str(), host) {
        return Err(ProviderReply::failure(
            0,
            "UNTRUSTED_ENDPOINT",
            "The endpoint host does not match the selected provider. Use Custom API for another trusted HTTPS host.",
            0,
        ));
    }
    Ok(raw.to_string())
}

fn validate_config(config: &ProviderConfigInput) -> Result<(String, String, u64), ProviderReply> {
    if config.api_style == "local-demo" || config.provider_id == "local-demo" {
        return Err(ProviderReply::failure(
            0,
            "LOCAL_ONLY",
            "The local sandbox is handled without a network request.",
            0,
        ));
    }

    if config.requires_credential {
        let api_key = config.api_key.trim();
        if api_key.len() < 8 || api_key.len() > 2048 || api_key.contains('\n') || api_key.contains('\r') {
            return Err(ProviderReply::failure(
                0,
                "INVALID_CREDENTIAL",
                "The API credential is missing or malformed.",
                0,
            ));
        }
    }

    let model = config.model.trim();
    if model.is_empty() || model.len() > 256 || model.contains('\n') || model.contains('\r') {
        return Err(ProviderReply::failure(
            0,
            "INVALID_MODEL",
            "Enter the model or endpoint identifier supplied by the provider.",
            0,
        ));
    }

    let base = validate_endpoint(config)?;
    let timeout = config.timeout_ms.clamp(MIN_TIMEOUT_MS, MAX_TIMEOUT_MS);
    Ok((base, model.to_string(), timeout))
}

fn validate_messages(messages: &[ProviderMessage], started: Instant) -> Result<(), ProviderReply> {
    if messages.is_empty()
        || messages.len() > 160
        || messages.iter().any(|message| {
            !matches!(message.role.as_str(), "user" | "assistant" | "system")
                || message.content.len() > MAX_MESSAGE_CHARS
        })
    {
        return Err(ProviderReply::failure(
            0,
            "INVALID_PAYLOAD",
            "The reviewed conversation payload is empty or exceeds safety limits.",
            started.elapsed().as_millis(),
        ));
    }
    Ok(())
}

fn endpoint(base: &str, suffix: &str) -> String {
    if base.ends_with(suffix) {
        base.to_string()
    } else {
        format!("{base}{suffix}")
    }
}

fn status_message(status: u16, provider_id: &str) -> (String, String) {
    let name = provider_name(provider_id);
    let pair = match status {
        400 => ("BAD_REQUEST", "rejected the request. Check the selected model and endpoint."),
        401 => ("UNAUTHORIZED", "rejected the API credential."),
        402 => ("PAYMENT_REQUIRED", "requires billing access or additional balance."),
        403 => ("FORBIDDEN", "did not permit this account to access the resource."),
        404 => ("NOT_FOUND", "could not find the endpoint or selected model."),
        408 => ("REMOTE_TIMEOUT", "timed out while processing the request."),
        429 => ("RATE_LIMITED", "rate-limited the request. Try again later."),
        500..=599 => ("PROVIDER_UNAVAILABLE", "is temporarily unavailable."),
        _ => ("PROVIDER_ERROR", "returned an unexpected response."),
    };
    (pair.0.to_string(), format!("{name} {}", pair.1))
}

fn parse_error_message(payload: &Value) -> Option<String> {
    payload
        .pointer("/error/message")
        .or_else(|| payload.get("message"))
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|message| !message.is_empty())
        .map(|message| message.chars().take(600).collect())
}

fn send_openai_compatible(
    config: &ProviderConfigInput,
    base_url: &str,
    model: &str,
    timeout_ms: u64,
    messages: Vec<ProviderMessage>,
    max_tokens: u32,
    temperature: f64,
    started: Instant,
) -> ProviderReply {
    let url = endpoint(base_url, "/chat/completions");
    let body = json!({
        "model": model,
        "messages": messages,
        "stream": false,
        "max_tokens": max_tokens.clamp(1, 32768),
        "temperature": temperature.clamp(0.0, 2.0)
    });

    let agent = ureq::AgentBuilder::new()
        .timeout(Duration::from_millis(timeout_ms))
        .build();
    let mut request = agent.post(&url).set("Content-Type", "application/json");
    if !config.api_key.trim().is_empty() {
        request = request.set("Authorization", &format!("Bearer {}", config.api_key.trim()));
    }
    if config.provider_id == "openrouter" {
        request = request
            .set("HTTP-Referer", "https://github.com/Chrisbetheking/tokenfence-studio")
            .set("X-Title", "TokenFence Studio");
    }

    match request.send_json(body) {
        Ok(response) => {
            let status = response.status();
            let payload: Value = match response.into_json() {
                Ok(value) => value,
                Err(_) => {
                    return ProviderReply::failure(
                        status,
                        "INVALID_RESPONSE",
                        "The provider returned an unreadable response.",
                        started.elapsed().as_millis(),
                    )
                }
            };
            let content = payload
                .pointer("/choices/0/message/content")
                .and_then(Value::as_str)
                .map(str::trim)
                .filter(|value| !value.is_empty())
                .map(ToOwned::to_owned);
            if content.is_none() {
                return ProviderReply::failure(
                    status,
                    "EMPTY_RESPONSE",
                    "The provider returned no assistant content.",
                    started.elapsed().as_millis(),
                );
            }
            ProviderReply {
                ok: true,
                status,
                content,
                model: payload
                    .get("model")
                    .and_then(Value::as_str)
                    .map(ToOwned::to_owned)
                    .or_else(|| Some(model.to_string())),
                error_code: None,
                error_message: None,
                latency_ms: started.elapsed().as_millis(),
            }
        }
        Err(ureq::Error::Status(status, response)) => {
            let payload: Option<Value> = response.into_json().ok();
            let (code, fallback) = status_message(status, &config.provider_id);
            let message = payload
                .as_ref()
                .and_then(parse_error_message)
                .unwrap_or(fallback);
            ProviderReply::failure(status, &code, &message, started.elapsed().as_millis())
        }
        Err(ureq::Error::Transport(_)) => ProviderReply::failure(
            0,
            "NETWORK_ERROR",
            "Network connection failed. Check internet access, proxy, DNS and system time.",
            started.elapsed().as_millis(),
        ),
    }
}

fn send_anthropic(
    config: &ProviderConfigInput,
    base_url: &str,
    model: &str,
    timeout_ms: u64,
    messages: Vec<ProviderMessage>,
    max_tokens: u32,
    temperature: f64,
    started: Instant,
) -> ProviderReply {
    let url = endpoint(base_url, "/messages");
    let system = messages
        .iter()
        .filter(|message| message.role == "system")
        .map(|message| message.content.as_str())
        .collect::<Vec<_>>()
        .join("\n\n");
    let chat_messages: Vec<Value> = messages
        .into_iter()
        .filter(|message| message.role != "system")
        .map(|message| json!({ "role": message.role, "content": message.content }))
        .collect();
    let mut body = json!({
        "model": model,
        "messages": chat_messages,
        "max_tokens": max_tokens.clamp(1, 32768),
        "temperature": temperature.clamp(0.0, 1.0)
    });
    if !system.is_empty() {
        body["system"] = Value::String(system);
    }

    let agent = ureq::AgentBuilder::new()
        .timeout(Duration::from_millis(timeout_ms))
        .build();
    let response = agent
        .post(&url)
        .set("Content-Type", "application/json")
        .set("x-api-key", config.api_key.trim())
        .set("anthropic-version", "2023-06-01")
        .send_json(body);

    match response {
        Ok(response) => {
            let status = response.status();
            let payload: Value = match response.into_json() {
                Ok(value) => value,
                Err(_) => {
                    return ProviderReply::failure(
                        status,
                        "INVALID_RESPONSE",
                        "Anthropic returned an unreadable response.",
                        started.elapsed().as_millis(),
                    )
                }
            };
            let content = payload
                .get("content")
                .and_then(Value::as_array)
                .map(|items| {
                    items
                        .iter()
                        .filter_map(|item| item.get("text").and_then(Value::as_str))
                        .collect::<Vec<_>>()
                        .join("\n")
                })
                .map(|text| text.trim().to_string())
                .filter(|text| !text.is_empty());
            if content.is_none() {
                return ProviderReply::failure(
                    status,
                    "EMPTY_RESPONSE",
                    "Anthropic returned no assistant content.",
                    started.elapsed().as_millis(),
                );
            }
            ProviderReply {
                ok: true,
                status,
                content,
                model: payload
                    .get("model")
                    .and_then(Value::as_str)
                    .map(ToOwned::to_owned)
                    .or_else(|| Some(model.to_string())),
                error_code: None,
                error_message: None,
                latency_ms: started.elapsed().as_millis(),
            }
        }
        Err(ureq::Error::Status(status, response)) => {
            let payload: Option<Value> = response.into_json().ok();
            let (code, fallback) = status_message(status, &config.provider_id);
            let message = payload
                .as_ref()
                .and_then(parse_error_message)
                .unwrap_or(fallback);
            ProviderReply::failure(status, &code, &message, started.elapsed().as_millis())
        }
        Err(ureq::Error::Transport(_)) => ProviderReply::failure(
            0,
            "NETWORK_ERROR",
            "Network connection failed. Check internet access, proxy, DNS and system time.",
            started.elapsed().as_millis(),
        ),
    }
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
fn hydrate_provider_secret(config: &mut ProviderConfigInput, started: Instant) -> Result<(), ProviderReply> {
    if !config.requires_credential || !config.api_key.trim().is_empty() {
        return Ok(());
    }
    let entry = credential_entry(&config.profile_id).map_err(|message| {
        ProviderReply::failure(0, "SECURE_STORE_ERROR", &message, started.elapsed().as_millis())
    })?;
    match entry.get_password() {
        Ok(value) => {
            config.api_key = value;
            Ok(())
        }
        Err(keyring::Error::NoEntry) => Err(ProviderReply::failure(
            0,
            "INVALID_CREDENTIAL",
            "No API credential is stored for this provider profile.",
            started.elapsed().as_millis(),
        )),
        Err(_) => Err(ProviderReply::failure(
            0,
            "SECURE_STORE_ERROR",
            "The operating-system credential store rejected the read.",
            started.elapsed().as_millis(),
        )),
    }
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
fn hydrate_provider_secret(config: &mut ProviderConfigInput, started: Instant) -> Result<(), ProviderReply> {
    if config.requires_credential && config.api_key.trim().is_empty() {
        return Err(ProviderReply::failure(
            0,
            "SECURE_STORE_UNAVAILABLE",
            "Secure provider credentials are available only in the macOS and Windows desktop builds.",
            started.elapsed().as_millis(),
        ));
    }
    Ok(())
}

fn send_request(
    mut config: ProviderConfigInput,
    messages: Vec<ProviderMessage>,
    max_tokens: u32,
    temperature: f64,
) -> ProviderReply {
    let started = Instant::now();
    if let Err(error) = hydrate_provider_secret(&mut config, started) {
        return error;
    }
    let (base_url, model, timeout_ms) = match validate_config(&config) {
        Ok(value) => value,
        Err(mut error) => {
            error.latency_ms = started.elapsed().as_millis();
            return error;
        }
    };
    if let Err(error) = validate_messages(&messages, started) {
        return error;
    }

    match config.api_style.as_str() {
        "anthropic" => send_anthropic(
            &config,
            &base_url,
            &model,
            timeout_ms,
            messages,
            max_tokens,
            temperature,
            started,
        ),
        "openai-compatible" => send_openai_compatible(
            &config,
            &base_url,
            &model,
            timeout_ms,
            messages,
            max_tokens,
            temperature,
            started,
        ),
        _ => ProviderReply::failure(
            0,
            "UNSUPPORTED_API_STYLE",
            "This provider API style is not supported by the desktop runtime.",
            started.elapsed().as_millis(),
        ),
    }
}

fn credential_user(profile_id: &str) -> Result<String, String> {
    let trimmed = profile_id.trim();
    if trimmed.is_empty() || trimmed.len() > 160 {
        return Err("The provider profile identifier is invalid.".to_string());
    }
    let sanitized: String = trimmed
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || matches!(character, '-' | '_' | '.') {
                character
            } else {
                '_'
            }
        })
        .collect();
    Ok(sanitized)
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
fn credential_entry(profile_id: &str) -> Result<keyring::Entry, String> {
    let user = credential_user(profile_id)?;
    keyring::Entry::new(CREDENTIAL_SERVICE, &user)
        .map_err(|_| "The operating-system credential store could not create an entry.".to_string())
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
fn secret_save(profile_id: String, secret: String) -> SecretReply {
    let trimmed = secret.trim();
    if trimmed.len() < 8 || trimmed.len() > 2048 || trimmed.contains('\n') || trimmed.contains('\r') {
        return SecretReply::failure("The API credential is missing or malformed.");
    }
    match credential_entry(&profile_id).and_then(|entry| {
        entry
            .set_password(trimmed)
            .map_err(|_| "The operating-system credential store rejected the write.".to_string())
    }) {
        Ok(()) => SecretReply::success(None),
        Err(message) => SecretReply::failure(&message),
    }
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
fn secret_save(_profile_id: String, _secret: String) -> SecretReply {
    SecretReply::failure("Secure credential storage is only enabled for macOS and Windows builds.")
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
fn secret_load(profile_id: String) -> SecretReply {
    let entry = match credential_entry(&profile_id) {
        Ok(entry) => entry,
        Err(message) => return SecretReply::failure(&message),
    };
    match entry.get_password() {
        Ok(_) => SecretReply { ok: true, has_value: true, value: None, error_message: None },
        Err(keyring::Error::NoEntry) => SecretReply::success(None),
        Err(_) => SecretReply::failure("The operating-system credential store rejected the read."),
    }
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
fn secret_load(_profile_id: String) -> SecretReply {
    SecretReply::failure("Secure credential storage is only enabled for macOS and Windows builds.")
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
fn secret_delete(profile_id: String) -> SecretReply {
    let entry = match credential_entry(&profile_id) {
        Ok(entry) => entry,
        Err(message) => return SecretReply::failure(&message),
    };
    match entry.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => SecretReply::success(None),
        Err(_) => SecretReply::failure("The operating-system credential store rejected the delete."),
    }
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
fn secret_delete(_profile_id: String) -> SecretReply {
    SecretReply::success(None)
}

#[tauri::command]
fn provider_connection_test(config: ProviderConfigInput) -> ProviderReply {
    send_request(
        config,
        vec![ProviderMessage {
            role: "user".to_string(),
            content: "Reply with exactly: TokenFence connection verified.".to_string(),
        }],
        48,
        0.0,
    )
}

#[tauri::command]
fn provider_chat(request: ProviderChatRequest) -> ProviderReply {
    send_request(
        request.config,
        request.messages,
        request.max_tokens.unwrap_or(3072),
        request.temperature.unwrap_or(0.25),
    )
}

#[tauri::command]
fn provider_secret_save(profile_id: String, secret: String) -> SecretReply {
    secret_save(profile_id, secret)
}

#[tauri::command]
fn provider_secret_load(profile_id: String) -> SecretReply {
    secret_load(profile_id)
}

#[tauri::command]
fn provider_secret_delete(profile_id: String) -> SecretReply {
    secret_delete(profile_id)
}

#[tauri::command]
fn platform_info() -> PlatformInfo {
    PlatformInfo {
        app_version: env!("CARGO_PKG_VERSION"),
        os: std::env::consts::OS,
        arch: std::env::consts::ARCH,
        secure_store: if cfg!(target_os = "macos") {
            "macOS Keychain"
        } else if cfg!(target_os = "windows") {
            "Windows Credential Manager"
        } else {
            "Unavailable"
        },
        desktop_runtime: true,
    }
}

#[tauri::command]
fn computer_capabilities() -> Vec<ComputerCapability> {
    vec![
        ComputerCapability {
            id: "screen-capture",
            available: false,
            permission_required: true,
            status: "planned",
            message: "Permission-gated screen capture is the next native Computer Use milestone.",
        },
        ComputerCapability {
            id: "open-url",
            available: true,
            permission_required: false,
            status: "ready",
            message: "TokenFence can open reviewed HTTPS links through the operating system.",
        },
        ComputerCapability {
            id: "keyboard",
            available: false,
            permission_required: true,
            status: "planned",
            message: "Keyboard control is disabled until per-action approval and audit receipts are implemented.",
        },
        ComputerCapability {
            id: "pointer",
            available: false,
            permission_required: true,
            status: "planned",
            message: "Pointer control is disabled until per-action approval and audit receipts are implemented.",
        },
        ComputerCapability {
            id: "project-files",
            available: false,
            permission_required: true,
            status: "planned",
            message: "Scoped project folders will be introduced with the coding-agent sandbox.",
        },
        ComputerCapability {
            id: "terminal",
            available: false,
            permission_required: true,
            status: "planned",
            message: "There is no unrestricted shell command in this release.",
        },
    ]
}

fn clean_repo_segment(value: &str) -> Option<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() || trimmed.len() > 100 {
        return None;
    }
    if trimmed
        .chars()
        .all(|character| character.is_ascii_alphanumeric() || matches!(character, '-' | '_' | '.'))
    {
        Some(trimmed.to_string())
    } else {
        None
    }
}

fn numeric_version(version: &str) -> Vec<u64> {
    version
        .trim()
        .trim_start_matches('v')
        .split(|character: char| !character.is_ascii_digit())
        .filter(|part| !part.is_empty())
        .take(4)
        .map(|part| part.parse::<u64>().unwrap_or(0))
        .collect()
}

fn is_newer(latest: &str, current: &str) -> bool {
    let mut latest_parts = numeric_version(latest);
    let mut current_parts = numeric_version(current);
    let size = latest_parts.len().max(current_parts.len()).max(3);
    latest_parts.resize(size, 0);
    current_parts.resize(size, 0);
    latest_parts > current_parts
}

#[tauri::command]
fn github_release_check(owner: String, repo: String) -> UpdateInfo {
    let current = env!("CARGO_PKG_VERSION").to_string();
    let owner = match clean_repo_segment(&owner) {
        Some(value) => value,
        None => {
            return UpdateInfo {
                ok: false,
                current_version: current,
                latest_version: None,
                update_available: false,
                release_url: None,
                published_at: None,
                notes: None,
                assets: vec![],
                error_message: Some("The GitHub owner is invalid.".to_string()),
            }
        }
    };
    let repo = match clean_repo_segment(&repo) {
        Some(value) => value,
        None => {
            return UpdateInfo {
                ok: false,
                current_version: current,
                latest_version: None,
                update_available: false,
                release_url: None,
                published_at: None,
                notes: None,
                assets: vec![],
                error_message: Some("The GitHub repository name is invalid.".to_string()),
            }
        }
    };
    let endpoint = format!("https://api.github.com/repos/{owner}/{repo}/releases/latest");
    let agent = ureq::AgentBuilder::new()
        .timeout(Duration::from_secs(20))
        .build();
    let response = agent
        .get(&endpoint)
        .set("Accept", "application/vnd.github+json")
        .set("User-Agent", "TokenFence-Studio")
        .call();

    match response {
        Ok(response) => {
            let payload: Value = match response.into_json() {
                Ok(value) => value,
                Err(_) => {
                    return UpdateInfo {
                        ok: false,
                        current_version: current,
                        latest_version: None,
                        update_available: false,
                        release_url: None,
                        published_at: None,
                        notes: None,
                        assets: vec![],
                        error_message: Some("GitHub returned an unreadable release response.".to_string()),
                    }
                }
            };
            let latest = payload
                .get("tag_name")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string();
            let assets = payload
                .get("assets")
                .and_then(Value::as_array)
                .map(|items| {
                    items
                        .iter()
                        .filter_map(|asset| {
                            Some(ReleaseAsset {
                                name: asset.get("name")?.as_str()?.to_string(),
                                download_url: asset
                                    .get("browser_download_url")?
                                    .as_str()?
                                    .to_string(),
                                size: asset.get("size").and_then(Value::as_u64).unwrap_or(0),
                            })
                        })
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default();
            UpdateInfo {
                ok: true,
                current_version: current.clone(),
                latest_version: Some(latest.clone()),
                update_available: !latest.is_empty() && is_newer(&latest, &current),
                release_url: payload
                    .get("html_url")
                    .and_then(Value::as_str)
                    .map(ToOwned::to_owned),
                published_at: payload
                    .get("published_at")
                    .and_then(Value::as_str)
                    .map(ToOwned::to_owned),
                notes: payload
                    .get("body")
                    .and_then(Value::as_str)
                    .map(|notes| notes.chars().take(8_000).collect()),
                assets,
                error_message: None,
            }
        }
        Err(ureq::Error::Status(status, _)) => UpdateInfo {
            ok: false,
            current_version: current,
            latest_version: None,
            update_available: false,
            release_url: None,
            published_at: None,
            notes: None,
            assets: vec![],
            error_message: Some(format!("GitHub release check failed with HTTP {status}.")),
        },
        Err(ureq::Error::Transport(_)) => UpdateInfo {
            ok: false,
            current_version: current,
            latest_version: None,
            update_available: false,
            release_url: None,
            published_at: None,
            notes: None,
            assets: vec![],
            error_message: Some("Could not reach GitHub. Check internet access or the system proxy.".to_string()),
        },
    }
}

#[tauri::command]
fn open_external_url(url: String) -> Result<(), String> {
    let parsed = Url::parse(url.trim()).map_err(|_| "The external URL is invalid.".to_string())?;
    if parsed.scheme() != "https" && parsed.scheme() != "http" {
        return Err("Only HTTP and HTTPS links can be opened.".to_string());
    }

    #[cfg(target_os = "macos")]
    let result = Command::new("/usr/bin/open").arg(parsed.as_str()).spawn();
    #[cfg(target_os = "windows")]
    let result = Command::new("cmd")
        .args(["/C", "start", "", parsed.as_str()])
        .spawn();
    #[cfg(target_os = "linux")]
    let result = Command::new("xdg-open").arg(parsed.as_str()).spawn();

    result
        .map(|_| ())
        .map_err(|_| "The operating system could not open the link.".to_string())
}

fn application_menu() -> Menu {
    let about = CustomMenuItem::new("about", "About TokenFence Studio");
    let preferences = CustomMenuItem::new("preferences", "Preferences…");
    let updates = CustomMenuItem::new("updates", "Check for Updates…");
    let quit = CustomMenuItem::new("quit", "Quit TokenFence Studio").accelerator("CmdOrCtrl+Q");
    let new_session = CustomMenuItem::new("new_session", "New Session").accelerator("CmdOrCtrl+N");

    let app_menu = Submenu::new(
        "TokenFence Studio",
        Menu::new()
            .add_item(about)
            .add_item(preferences)
            .add_item(updates)
            .add_item(quit),
    );
    let file_menu = Submenu::new("File", Menu::new().add_item(new_session));
    let edit_menu = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll),
    );

    Menu::new()
        .add_submenu(app_menu)
        .add_submenu(file_menu)
        .add_submenu(edit_menu)
}

fn main() {
    tauri::Builder::default()
        .menu(application_menu())
        .on_menu_event(|event| match event.menu_item_id() {
            "new_session" => {
                let _ = event.window().emit("tokenfence://new-session", ());
            }
            "preferences" => {
                let _ = event.window().emit("tokenfence://navigate", "settings");
            }
            "updates" => {
                let _ = event.window().emit("tokenfence://navigate", "updates");
            }
            "about" => {
                let _ = event.window().emit("tokenfence://navigate", "about");
            }
            "quit" => std::process::exit(0),
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            provider_connection_test,
            provider_chat,
            provider_secret_save,
            provider_secret_load,
            provider_secret_delete,
            platform_info,
            computer_capabilities,
            github_release_check,
            open_external_url
        ])
        .run(tauri::generate_context!())
        .expect("failed to run TokenFence Studio");
}
