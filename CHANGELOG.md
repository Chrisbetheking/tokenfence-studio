# Changelog

## v0.5.24-desktop (2026-06-13)
- **Windows desktop package**: Built with Tauri 2 ¡ª MSI (6.2 MB) + NSIS installer (4.2 MB). 32-bit i686 GNU toolchain, unsigned experimental.
- Tauri config: frontendDist points to Vite desktop UI, not Next.js SSR.
- macOS CI build configured in GitHub Actions (unsigned, experimental).

## v0.5.24 (2026-06-13)
- **First stable Android navigation build**: Custom React Native core navigation (Context + View + TouchableOpacity) replacing crash-prone @react-navigation/bottom-tabs.
- 12 Mobile Lite screens tested with zero FATAL / ReactNativeJS crash logs.
- **Recommended download**: `TokenFence-Mobile-Lite-Android-v0.5.24-internal-release.apk` (57.3 MB, standalone, no Metro). Debug APK also available. EAS production build still under investigation.
## v0.5.22 (2026-06-13)
- **Stable Android navigation**: Replaced crash-prone `@react-navigation/bottom-tabs`/`react-native-safe-area-context` with custom type-safe route registry and tab shell. Pure React Native components (Context + View + TouchableOpacity) ¡ª zero crash-prone dependencies at runtime.
- Added ErrorBoundary for per-screen crash isolation.
- 12-screen architecture: Home, Guard, Documents, Models, Archive, Settings, AgentLab, PluginStore, Output, MindMap, ComputerUse, Routing.


## v0.5.1 (2026-06-12)
- **Android startup crash fix**: Replaced deprecated Clipboard from eact-native with expo-clipboard (React Native 0.76 / Expo SDK 52 removed built-in Clipboard). Fixed pps/android/src/screens/GuardScreen.tsx.

## v0.5.0 (2026-06-12)
- **Agent Workspace**: Agent Runtime modules (types, permissions, execution log, runtime installer, command approval, health). Plugin System with 10 built-in plugins across 7 categories. New Web UI pages: Agent Lab, Plugin Store, Output Generation, Computer Use Control, Routing Rules. Updated Desktop UI (6 new screens) and Android HomeScreen (5 experimental cards). 11 new docs.

TokenFence Studio keeps detailed update notes in the project update log.

See: [docs/changelog/README.md](./docs/changelog/README.md)

## Recent Updates
- **2026-06-12 (v0.5.0-dev)**: Agent Workspace foundation â€?Agent Runtime modules (types, permissions, execution log, runtime installer, command approval, health), Plugin System with 10 built-in plugins across 7 categories, Obsidian knowledge connector, API connector builder, MP4 media plugin, Output generators (MD/HTML/JSON/PDF/DOCX), Mind Map generator (Mermaid), Computer Use permission gate, Model Auto Router with fallback chains. New Web UI pages: Agent Lab, Plugin Store, Output Generation, Computer Use Control, Routing Rules. Updated Desktop UI (6 new screens) and Android HomeScreen (5 experimental cards). 11 new docs. On branch feature/agent-workspace-v050.
- **2026-06-12 (v0.4.0-dev)**: Product UI redesign in progress -- new sidebar+inspector web layout, dark mode, shadcn-style cards, Android screen polish, dedicated Vite+React desktop renderer. On branch feature/product-ui-desktop.
- **2026-06-12 (v0.3.11)**: Android APK release asset upload fixed. EAS build with --wait, artifact URL parsing, APK download, and GitHub Release attachment all working.
- **2026-06-12 (v0.3.10)**: Expo SDK 52 dependency fixes. expo-clipboard downgraded from v56 to v7.0.1, eas-cli removed from devDependencies.
- **2026-06-12 (v0.3.8)**: Release workflow fixes -- YAML formatting, Android APK via EAS.

- **2026-06-11 (v0.3.7)**: Fixed README encoding corruption, updated Expo/EAS configuration, bumped versions to 0.3.7, added release troubleshooting docs.
- **2026-06-11 (v0.3.6)**: Release workflow fixes -- desktop builds, Android EAS automation, GitHub Release page.
- **2026-06-11**: README roadmap reorganization, monorepo structure fix, provider fallback chains, budget router, citation panel prototype.
- **2026-06-08**: Document Intelligence Pipeline with PDF/DOCX/OCR support.
- **2026-06-02**: Model Matrix and file-level model routing prototype.
- **2026-06-01**: Initial pre-flight prompt safety workflow.
