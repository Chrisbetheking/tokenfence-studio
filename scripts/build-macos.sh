#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This script must run on macOS. Use GitHub Actions → TokenFence macOS Builds on other systems."
  exit 1
fi

case "$(uname -m)" in
  arm64) TARGET="aarch64-apple-darwin" ;;
  x86_64) TARGET="x86_64-apple-darwin" ;;
  *) echo "Unsupported Mac architecture: $(uname -m)"; exit 1 ;;
esac

command -v node >/dev/null || { echo "Node.js is required."; exit 1; }
command -v npm >/dev/null || { echo "npm is required."; exit 1; }
command -v rustup >/dev/null || { echo "Rust is required: https://rustup.rs"; exit 1; }

rustup target add "$TARGET"
npm ci --legacy-peer-deps
npm --workspace apps/desktop run typecheck
npm --workspace apps/desktop run test:core
npm --workspace apps/desktop run ui:build
(
  cd apps/desktop
  npx tauri build --target "$TARGET"
)

BUNDLE="$ROOT/apps/desktop/src-tauri/target/$TARGET/release/bundle"
echo
echo "Build complete."
find "$BUNDLE" -maxdepth 3 \( -name '*.dmg' -o -name '*.app' \) -print
