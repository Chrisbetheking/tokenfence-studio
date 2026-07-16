# Chris Studio v2.0.0 troubleshooting

## macOS reports the app as damaged

This normally indicates Gatekeeper blocking an unnotarized community package, not necessarily corrupted DMG bytes. For a production release configure Developer ID signing and notarization as described in [SIGNING_NOTARIZATION.md](../macos/SIGNING_NOTARIZATION.md).

Community fallback:

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Chris Studio.app"
open "/Applications/Chris Studio.app"
```

Or right-click the architecture-specific `Install-Chris-Studio-*.command` helper and choose Open. Do not disable Gatekeeper globally.

## Choose the correct Mac build

```bash
uname -m
```

`arm64` uses Apple Silicon; `x86_64` uses Intel.

## Provider falls back to Local Sandbox

Secure-save the profile, test it, and explicitly set it active. If Keychain access fails, remove the stale `com.tokenfence.studio.provider` item in Keychain Access and save again.

HTTP 401 usually indicates credentials, 403 access policy, 404 an endpoint/model mismatch and 429 rate or balance limits.

## OCR or scanned PDF issues

Use `eng`, `chi_sim` or `eng+chi_sim`, start with a small clear image, and review OCR output. Large scanned PDFs are page-limited to protect memory; split the PDF or raise the configured OCR page limit.

## Coding Agent produces no patch

Select the most relevant file, narrow the task, confirm the active provider, and review the Plan. The assistant only accepts a unified diff beginning with `diff --git`. It never applies model output automatically.

If `git apply --check` fails, the patch may be stale, outside the scoped root, conflicting with local edits or malformed.

## Approved checks fail

The project must contain the expected manifest (`package.json`, `Cargo.toml` or `.git`). Chris Studio intentionally has no arbitrary shell field.

## GitHub or Pull Request failure

Use the minimum PAT permissions required for the repository, push the head branch before creating a PR, verify head/base branches, and use `https://github.com/owner/repo`.

## Computer Use failure

Grant Screen Recording and Accessibility permissions in macOS Privacy & Security, then completely restart Chris Studio. Confirm the screenshot before a coordinate click, especially with multiple displays or scaling.

## MCP failure

Remote endpoints require HTTPS; localhost HTTP is allowed. The Beta targets request/JSON-response servers. Long-lived SSE, custom OAuth and proprietary transports may need an adapter. Every `tools/call` requires explicit approval.

## npm ci failure

```bash
cd apps/desktop/ui
npm install --package-lock-only --legacy-peer-deps --no-audit --no-fund
npm ci --legacy-peer-deps --no-audit --no-fund
```

The lockfile must not contain private or internal registry URLs.

## TypeScript and Rust checks

```bash
npm --prefix apps/desktop/ui run typecheck
npm --prefix apps/desktop/ui run build
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Install Xcode Command Line Tools on macOS with `xcode-select --install`.

## Release links return 404

Run a new `Chris Studio macOS Builds and Release` workflow on the new commit with `version=v2.0.0`, `create_release=true`, and `make_latest=true`. Uploading source alone does not create Release assets.
