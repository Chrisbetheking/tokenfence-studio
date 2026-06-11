# Releases

TokenFence Studio ships via GitHub Releases. Below are the expected release assets per platform.

## Release Assets

| Platform | Asset                          | Format        |
|----------|--------------------------------|---------------|
| Windows  | TokenFence-Studio-Windows      | .exe / .msi   |
| macOS    | TokenFence-Studio-macOS        | .dmg / .app   |
| Android  | TokenFence-Mobile-Lite-Android | .apk          |

## How Releases Are Built

Releases are triggered by pushing a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The `.github/workflows/release.yml` workflow runs automatically and produces:
- Web build artifacts
- Desktop app bundles (Windows + macOS via Tauri)
- Android APK (via Expo EAS)

## Desktop

The desktop app wraps the full TokenFence Studio web workspace using Tauri. Downloads are available from GitHub Releases.

### Prerequisites (local build)

- Rust (for Tauri)
- Node.js 18?22

### Build locally

```bash
cd apps/desktop
npm install
npm run build
```

## Android

The Android app is built using Expo EAS Build.

### Prerequisites (local EAS)

- Expo account
- EAS CLI: `npm install -g eas-cli`
- `EXPO_TOKEN` set as GitHub secret for CI

### Build locally

```bash
cd apps/android
npx eas build --platform android --profile preview-apk
```

### Signing

APK signing is managed through EAS. For production, configure signing credentials in `eas.json` or Expo dashboard.

## iOS

iOS is documented but not actively built. To add iOS support:
1. Configure `eas.json` with `ios-simulator` or production profile
2. Set up Apple Developer account and signing credentials
3. Build via `npx eas build --platform ios --profile production`

No `ios/` directory is included in this repository.

## Versioning

This project follows semantic versioning. Tags are expected in `v*` format.
