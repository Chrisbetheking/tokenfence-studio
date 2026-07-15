# TokenFence Studio v1.6.1 — macOS 完整覆盖补丁

这是基于现有 TokenFence Studio 桌面端制作的覆盖补丁，同时包含 v1.6 安全工作台文件和 v1.6.1 macOS 原生能力。它不是完整仓库；上传时保留仓库中未包含在本补丁里的原文件。

## 上传方式

1. 解压 ZIP。
2. 打开 GitHub 仓库 `Chrisbetheking/tokenfence-studio` 的 `main` 分支。
3. 点击 **Add file → Upload files**。
4. 把解压后的全部文件拖入仓库根目录，保留 `.github/`、`apps/`、`docs/`、`scripts/` 的层级。
5. 提交信息填写：

```text
feat: add native macOS builds and Keychain credential storage
```

6. 打开 **Actions → TokenFence macOS Builds → Run workflow**，选择 `main`。

## 构建产物

工作流会生成：

- `TokenFence-Studio-macOS-Apple-Silicon`：适用于 M1/M2/M3/M4 及后续 Apple 芯片；
- `TokenFence-Studio-macOS-Intel`：适用于 Intel Mac；
- `TokenFence-Studio-macOS-Universal`：可选通用包，构建成功时同时支持两种架构。

每个 Artifact 内包含 `.dmg`、`.app.zip` 和 SHA-256 校验文件。

## macOS 端新增内容

- 独立 macOS 云端构建，不再依赖 Android/Windows Release 是否成功；
- Apple Silicon 与 Intel 双架构；
- 原生应用菜单和 `Command + N` 新建会话；
- DeepSeek API Key 写入 macOS Keychain，不写入浏览器 localStorage；
- 自动清理旧版本可能遗留在 localStorage 的明文 Key；
- About 页面展示实际平台、CPU 架构、应用版本和安全存储类型；
- 保留提示词、附件统一扫描与脱敏发送逻辑。

## 首次打开

当前构建未配置 Apple Developer 签名和公证。首次启动可能需要在 Finder 中按住 Control 点击应用并选择 **打开**。不要全局关闭 Gatekeeper。

更完整的构建与验收说明见：`docs/macos/MACOS_BUILD_AND_TEST.md`。
