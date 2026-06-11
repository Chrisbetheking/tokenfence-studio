# 2026-06-11 ? Android Mobile Lite and Responsive Web Update

## Summary

This update adds the first Android Mobile Lite version of TokenFence Studio and reorganizes the project into a clean cross-platform monorepo.

## Added

- Added clean monorepo structure with `apps/web`, `apps/android`, `packages/shared`.
- Added Next.js web app under `apps/web` with responsive layout improvements.
- Added Expo Android app under `apps/android`.
- Added shared TypeScript package under `packages/shared` for reusable guard and provider logic.
- Added Android bottom tabs: Home, Guard, Models, Archive, Settings.
- Added mobile prompt scanning workflow.
- Added mobile Guard result screen with risk level, findings, redacted prompt, copy/share/save actions.
- Added mobile provider/model cards for multi-provider routing.
- Added local sanitized archive using AsyncStorage.
- Added settings screen for local-only mode, default provider, risk policy, archive control, and about section.

## Changed

- Improved project structure for cross-platform development.
- Moved web app into `apps/web` as part of clean monorepo.
- Reused shared guard/provider logic across web and Android.
- Kept iOS support deferred.

## Notes

- Android is supported first.
- iOS is intentionally not included.
- Node.js 18?22 LTS is recommended for Expo and workspace compatibility.
