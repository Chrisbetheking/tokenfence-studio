# 2026-06-11 ? Full App Experience Upgrade

## Summary

Upgraded TokenFence Studio from a basic cross-platform monorepo into a complete app experience with desktop support, full Android features, file-type model routing, storage configuration, modern UI, and release workflow.

## Added

- Added Tauri desktop app under `apps/desktop` for Windows and macOS.
- Added desktop storage path configuration with Tauri file dialog support.
- Added Android screens: Document Pipeline, File Router, Model Rules, Storage, Compare.
- Added file-type detection and routing rules (PDF, DOCX, code, images, logs, markdown, data, spreadsheets, presentations).
- Added storage path utilities for workspace, archive, export, and context pack paths.
- Added GitHub Actions release workflow (`.github/workflows/release.yml`).
- Added Expo EAS build configuration (`apps/android/eas.json`).
- Added `docs/RELEASES.md` with platform-specific build and signing instructions.
- Added Research task type to the prompt workflow.
- Enhanced Android navigation with stack screens for nested features.

## Changed

- Upgraded shared package with file routing, storage utilities, and expanded types.
- Enhanced Android app from basic Mobile Lite to full mobile console.
- Modernized web UI with rounded panels, soft shadows, backdrop blur, and refined spacing.
- Updated READMEs with desktop, release, and storage sections.

## Notes

- Android is supported first. iOS is documented in RELEASES.md but not built.
- Node.js 18?22 LTS is recommended for workspace compatibility.
- Rust toolchain is required for local desktop builds.
- Signing is left to users/maintainers. EAS handles Android signing.
