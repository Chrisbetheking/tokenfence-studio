# Chris Studio v2.0.0 — macOS build and test

## Local prerequisites

- macOS with Xcode Command Line Tools;
- Node.js 20–22 and npm;
- Rust stable and Cargo;
- internet access to the public npm and crates.io registries;
- Apple Developer credentials only when testing signed/notarized distribution.

## UI and safety validation

```bash
npm ci --prefix apps/desktop/ui --legacy-peer-deps --no-audit --no-fund
npm --prefix apps/desktop/ui run typecheck
npm --prefix apps/desktop/ui run test:core
npm --prefix apps/desktop/ui run build
python3 scripts/verify_tokenfence_patch.py
```

## Native validation

```bash
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

## Build the current Mac architecture

```bash
./scripts/build-macos.sh
```

The script detects `arm64` or `x86_64`, validates the UI and backend, then builds the matching Tauri target.

## GitHub Actions release

Run `Chris Studio macOS Builds and Release` with:

```text
version: v2.0.0
create_release: true
make_latest: true
```

The workflow builds Apple Silicon and Intel separately. Configure the Apple Secrets documented in `SIGNING_NOTARIZATION.md` for trusted distribution.

## Smoke-test checklist

1. Launch and switch language/theme.
2. Save a test Provider key to Keychain, test and set active.
3. Run a local safety scan with fictional credentials.
4. Process text, image OCR, a text PDF and a scanned PDF.
5. Add a document to local knowledge and retrieve it from Workspace.
6. Open a disposable Git repository, edit with backup, generate a review-only AI diff and run an approved check.
7. Connect a test GitHub repository and read Issues; only create a PR in a disposable branch.
8. Grant macOS privacy permissions and test one screenshot, one click and one typing action.
9. Connect a disposable local MCP server and confirm one safe tool call.
10. Check the Updates page against the published Release.

Never use production secrets or production repositories during first-run validation.
