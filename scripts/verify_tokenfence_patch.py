from __future__ import annotations

import json
import re
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "1.7.0"
REQUIRED = [
    "apps/desktop/package.json",
    "apps/desktop/ui/package.json",
    "apps/desktop/ui/package-lock.json",
    "apps/desktop/ui/index.html",
    "apps/desktop/ui/vite.config.ts",
    "apps/desktop/ui/tsconfig.json",
    "apps/desktop/ui/src/vite-env.d.ts",
    "apps/desktop/ui/src/App.tsx",
    "apps/desktop/ui/src/screens/WorkspaceScreen.tsx",
    "apps/desktop/ui/src/screens/ProvidersScreen.tsx",
    "apps/desktop/ui/src/screens/AgentsScreen.tsx",
    "apps/desktop/ui/src/screens/FilesScreen.tsx",
    "apps/desktop/ui/src/screens/RoutingScreen.tsx",
    "apps/desktop/ui/src/screens/UpdatesScreen.tsx",
    "apps/desktop/ui/src/app/providerRegistry.ts",
    "apps/desktop/ui/src/app/skills.ts",
    "apps/desktop/ui/src/features/files/fileProcessor.ts",
    "apps/desktop/ui/src/features/tokens/optimizer.ts",
    "apps/desktop/ui/src/features/updates/updateClient.ts",
    "apps/desktop/ui/src/features/safety/scanner.ts",
    "apps/desktop/ui/src/features/providers/providerClient.ts",
    "apps/desktop/ui/src/features/platform/desktopClient.ts",
    "apps/desktop/src-tauri/src/main.rs",
    "apps/desktop/src-tauri/Cargo.toml",
    "apps/desktop/src-tauri/tauri.conf.json",
    ".github/workflows/tokenfence-macos.yml",
    "README.md",
    "README.zh-CN.md",
    "docs/architecture/ROADMAP_v1.7.md",
    "docs/architecture/OPEN_SOURCE_INSPIRATION.md",
]

for relative in REQUIRED:
    path = ROOT / relative
    assert path.is_file(), f"missing required file: {relative}"
    assert path.stat().st_size > 40, f"unexpectedly small file: {relative}"

main_rs = (ROOT / "apps/desktop/src-tauri/src/main.rs").read_text(encoding="utf-8")
workspace = (ROOT / "apps/desktop/ui/src/screens/WorkspaceScreen.tsx").read_text(encoding="utf-8")
scanner = (ROOT / "apps/desktop/ui/src/features/safety/scanner.ts").read_text(encoding="utf-8")
store = (ROOT / "apps/desktop/ui/src/app/store.ts").read_text(encoding="utf-8")
registry = (ROOT / "apps/desktop/ui/src/app/providerRegistry.ts").read_text(encoding="utf-8")
skills = (ROOT / "apps/desktop/ui/src/app/skills.ts").read_text(encoding="utf-8")
processor = (ROOT / "apps/desktop/ui/src/features/files/fileProcessor.ts").read_text(encoding="utf-8")
provider_client = (ROOT / "apps/desktop/ui/src/features/providers/providerClient.ts").read_text(encoding="utf-8")
workflow = (ROOT / ".github/workflows/tokenfence-macos.yml").read_text(encoding="utf-8")
tsconfig = json.loads((ROOT / "apps/desktop/ui/tsconfig.json").read_text(encoding="utf-8"))

assert "execute_command" not in main_rs, "unsafe generic command execution remains"
assert "trusted_host" in main_rs and "UNTRUSTED_ENDPOINT" in main_rs, "provider endpoint boundary missing"
assert "provider_id" in main_rs and "api_style" in main_rs, "generic provider backend missing"
assert "provider_connection_test" in main_rs and "provider_chat" in main_rs
assert "provider_secret_save" in main_rs and "profile_id" in main_rs, "per-profile secure storage missing"
assert "hydrate_provider_secret" in main_rs, "native backend does not hydrate provider secrets"
assert "loadProviderSecret" not in provider_client, "provider secret is being returned to the webview"
assert "github_release_check" in main_rs and "open_external_url" in main_rs, "in-app update bridge missing"
assert "computer_capabilities" in main_rs, "Computer Use capability boundary missing"
assert "formatSafePayload(scan)" in workspace, "safe payload is not used"
assert "reviewedHash === scan.hash" in workspace, "edit invalidation guard missing"
assert "attachments.map" in scanner and "scanText(attachment.content" in scanner, "attachments are not scanned"
assert "apiKey: ''" in store, "provider metadata write does not strip raw keys"
assert "local-sandbox" in store and "deepseek-primary" in store, "provider migration defaults missing"
assert registry.count("apiStyle:") >= 12, "multi-provider catalog is incomplete"
assert skills.count("builtIn: true") >= 10, "built-in skill library is too small"
assert "pdfjs-dist" in processor and "tesseract.js" in processor and "mammoth" in processor and "exceljs" in processor
assert "xlsx" not in json.loads((ROOT / "apps/desktop/ui/package.json").read_text())["dependencies"], "vulnerable npm xlsx dependency remains"
assert "macos-15" in workflow and "macos-15-intel" in workflow
assert "Check native Rust backend" in workflow
assert "npm ci --prefix apps/desktop/ui" in workflow, "deterministic nested UI install missing"
assert tsconfig.get("include") == ["src/main.tsx", "src/vite-env.d.ts"], "desktop typecheck scope is unsafe"

with (ROOT / "apps/desktop/src-tauri/Cargo.toml").open("rb") as handle:
    cargo = tomllib.load(handle)
assert cargo["package"]["version"] == VERSION
assert cargo["dependencies"]["url"] == "2"
assert cargo["target"]["cfg(target_os = \"macos\")"]["dependencies"]["keyring"]["features"] == ["apple-native"]
assert cargo["target"]["cfg(target_os = \"windows\")"]["dependencies"]["keyring"]["features"] == ["windows-native"]

config = json.loads((ROOT / "apps/desktop/src-tauri/tauri.conf.json").read_text(encoding="utf-8"))
assert config["package"]["version"] == VERSION
assert config["tauri"]["bundle"]["identifier"] == "com.tokenfence.studio"
assert config["tauri"]["windows"][0]["title"] == "", "legacy title text remains in native titlebar"
assert config["tauri"]["windows"][0]["titleBarStyle"] == "Overlay"

for rel in ["apps/desktop/package.json", "apps/desktop/ui/package.json"]:
    pkg = json.loads((ROOT / rel).read_text(encoding="utf-8"))
    assert pkg["version"] == VERSION, f"version mismatch: {rel}"

secret_pattern = re.compile(r"(?:sk|ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{24,}|sk-[A-Za-z0-9_-]{24,}")
ignored_parts = {"node_modules", "dist", "target", ".git"}
for path in ROOT.rglob("*"):
    if not path.is_file() or ignored_parts.intersection(path.parts) or path.suffix.lower() in {".png", ".ico", ".icns", ".zip"}:
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    matches = [value for value in secret_pattern.findall(text) if "A-Za-z" not in value]
    assert not matches, f"possible committed credential in {path.relative_to(ROOT)}"

print("TOKENFENCE_V170_COMPLETE_UPLOAD_VERIFIED")
print(f"files={sum(1 for path in ROOT.rglob('*') if path.is_file() and not ignored_parts.intersection(path.parts))}")
