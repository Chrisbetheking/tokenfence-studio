# TokenFence Studio Release Checklist

Use this checklist before every release to prevent source/release mismatches.

## 1. Before Build

- [ ] `npm run guard:source` passes with 0 errors
- [ ] `git ls-files *.zip` returns empty (no ZIPs tracked in git)
- [ ] `README.md` and `README.zh-CN.md` are UTF-8, LF-only, CR=0, >=80 lines
- [ ] All version strings match across App.tsx, tauri.conf.json, Cargo.toml, READMEs
- [ ] No raw API keys, tokens, or secrets in committed files
- [ ] Core source files pass line count thresholds:
  - AgentPatchPanel.tsx >= 180
  - ToolboxScreen.tsx >= 180
  - desktop-bridge.ts >= 100
  - main.rs >= 100

## 2. Build

- [ ] `npm run build` passes clean
- [ ] `cd apps/desktop/src-tauri && cargo check` passes
- [ ] `npm run desktop:build` passes
- [ ] Portable ZIP created: `TokenFence-Studio-Windows-vX.Y.Z-portable.zip`
- [ ] ZIP contains exactly: `TokenFence Studio.exe` + `WebView2Loader.dll`

## 3. Verify Public Source (raw.githubusercontent.com)

### 3a. Raw main branch

- [ ] `curl` each file from `raw.githubusercontent.com/.../main/...` and confirm line counts:
  - AgentPatchPanel.tsx >= 180 lines
  - ToolboxScreen.tsx >= 180 lines
  - desktop-bridge.ts >= 100 lines
  - main.rs >= 100 lines
  - source_guard.js >= 120 lines
  - release_sanity.js >= 80 lines
  - ci.yml >= 40 lines
  - RELEASE_CHECKLIST.md >= 60 lines

### 3b. Raw commit hash

- [ ] Same 8 files verified against HEAD commit hash on raw.githubusercontent.com

### 3c. Raw tag commit

- [ ] Same 8 files verified against tag commit hash on raw.githubusercontent.com

## 4. Release

- [ ] `npm run release:sanity -- vX.Y.Z` passes with 0 errors
- [ ] `gh release create` tag matches version, not prerelease, not draft
- [ ] Asset name matches: `TokenFence-Studio-Windows-vX.Y.Z-portable.zip`
- [ ] Release notes are clean, no typos, no leaked keys

## 5. Install & Run

- [ ] Install ZIP contents to `E:\Apps\TokenFenceStudio\vX.Y.Z`
- [ ] Desktop shortcut Target is `E:\Apps\TokenFenceStudio\vX.Y.Z\TokenFence Studio.exe`
- [ ] Kill any old TokenFence processes before launching
- [ ] Launch from shortcut, verify process path is `E:\Apps\TokenFenceStudio\vX.Y.Z\...`
- [ ] Bottom-left corner shows correct version `vX.Y.Z`
- [ ] No `raw key` visible in Computer Use page
- [ ] No `invoke undefined` errors in console

## 6. Post-Release

- [ ] GitHub Actions CI workflow passes on main (source-guard + frontend-build)
- [ ] Release sanity CI job triggered by tag passes
- [ ] `gh release view vX.Y.Z` confirms assets and metadata
