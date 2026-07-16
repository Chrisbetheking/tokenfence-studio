# Chris Studio v2.0.0 Validation Report

Validation date: 2026-07-16

## Passed in the artifact environment

- Desktop UI strict TypeScript check: passed (`tsc --noEmit`).
- Core privacy, storage, Token optimization, and local knowledge tests: passed (`TOKENFENCE_CORE_PRIVACY_TESTS_PASSED`).
- Vite production build: passed; 462 modules transformed.
- npm production dependency audit: passed; 0 known vulnerabilities at the configured audit threshold.
- JSON, TOML, and GitHub Actions YAML parsing: passed.
- Rust source syntax-tree validation: passed (`RUST_SYNTAX_OK`).
- Complete-upload structure and secret-boundary verification: passed (`CHRIS_STUDIO_V200_COMPLETE_UPLOAD_VERIFIED`).
- Package registry validation: lockfile resolves from the public npm registry.

## Native compilation boundary

A semantic `cargo check` and final Apple Silicon / Intel Tauri build were not executed in the artifact container because it does not provide the macOS SDK or a working Rust toolchain. The included GitHub Actions workflow performs `cargo check` before each native build and then builds on `macos-15` and `macos-15-intel` runners.

## macOS signing boundary

The workflow supports Developer ID signing and notarization when the repository owner configures the required Apple secrets. Source code cannot supply or fabricate those account-owned credentials. Without them, the workflow publishes an ad-hoc signed community package and a scoped installation helper; macOS may still require user approval.

## Security boundaries reviewed

- Provider, GitHub, and connector secrets are stored through the operating-system credential store and are not returned to the WebView as plaintext.
- Project access is confined to a user-selected root, with traversal, symlink escape, and `.git` writes blocked.
- Coding-agent writes, patch application, Git push, PR creation, MCP tool calls, and Computer Use actions require explicit approval.
- Project command execution is a fixed allowlist, not arbitrary shell access.
- Computer Use is limited to screenshots, approved coordinates, approved text, and approved shortcut keys on macOS.

## Build notes

The Vite build reports size warnings for PDF and spreadsheet processing chunks. These are warnings rather than build failures; the libraries are split into independent chunks to keep the main application bundle smaller.
