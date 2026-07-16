# Chris Studio macOS signing and notarization

Browser-downloaded applications receive a quarantine attribute. A desktop app without a valid Developer ID signature and Apple notarization may be blocked as “unverified” or “damaged.” A production release therefore needs publisher-owned Apple Developer credentials; a source archive cannot manufacture those credentials.

## GitHub Actions secrets

Create repository Actions secrets:

```text
APPLE_CERTIFICATE
APPLE_CERTIFICATE_PASSWORD
APPLE_ID
APPLE_PASSWORD
APPLE_TEAM_ID
```

- `APPLE_CERTIFICATE`: Base64 text of the Developer ID Application `.p12` file.
- `APPLE_CERTIFICATE_PASSWORD`: the `.p12` export password.
- `APPLE_ID`: Apple Developer account email.
- `APPLE_PASSWORD`: an Apple ID app-specific password.
- `APPLE_TEAM_ID`: the Apple Developer Team ID.

Convert the certificate on macOS:

```bash
base64 -i DeveloperIDApplication.p12 | pbcopy
```

Run `Chris Studio macOS Builds and Release` with `version=v2.0.0`, `create_release=true` and `make_latest=true`. The workflow imports a temporary keychain, builds Apple Silicon and Intel packages, and uses the Apple environment variables for signing/notarization when all publisher credentials are present.

## Validate a release

```bash
codesign --verify --deep --strict --verbose=2 "/Applications/Chris Studio.app"
spctl --assess --type execute --verbose=4 "/Applications/Chris Studio.app"
stapler validate "/Applications/Chris Studio.app"
```

## Community build fallback

Without Apple credentials the workflow produces an ad-hoc signed community package and an architecture-specific `Install-Chris-Studio-*.command` helper. The helper copies only Chris Studio to `/Applications`, clears quarantine only for that application and opens it. It does not disable Gatekeeper globally.

Manual equivalent:

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Chris Studio.app"
open "/Applications/Chris Studio.app"
```

This fallback is not a substitute for Developer ID signing and notarization.
