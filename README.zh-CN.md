# TokenFence Studio v1.7.0

[English](README.md) · [下载最新版](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest) · [问题排查](docs/troubleshooting/TROUBLESHOOTING.zh-CN.md)

**TokenFence Studio** 是一个本地优先的安全 AI 工作台。它把多模型接入、发送前安全审查、Token 优化、文件处理、模型路由和可组合 Agent Skills 放进同一个 macOS 桌面应用。

> v1.7.0 不再把“本地演示”伪装成已配置模型。保存并启用 DeepSeek、OpenAI、Anthropic 等 Provider 后，工作台会继续使用对应真实配置；Local Sandbox 只在用户明确选择时启用。

## 下载

### macOS Apple Silicon（M1/M2/M3/M4）

- [下载 DMG](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest/download/TokenFence-Studio-macOS-Apple-Silicon.dmg)
- [下载 APP ZIP](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest/download/TokenFence-Studio-macOS-Apple-Silicon.app.zip)
- [SHA-256](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest/download/SHA256SUMS-Apple-Silicon.txt)

### macOS Intel

- [下载 DMG](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest/download/TokenFence-Studio-macOS-Intel.dmg)
- [下载 APP ZIP](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest/download/TokenFence-Studio-macOS-Intel.app.zip)
- [SHA-256](https://github.com/Chrisbetheking/tokenfence-studio/releases/latest/download/SHA256SUMS-Intel.txt)

> 下载链接只有在 v1.7.0 Release 构建并上传成功后才会生效。社区构建目前未签名，首次打开可能需要在 Finder 中按住 Control 点击应用并选择“打开”，或按故障排查文档清除该应用的隔离属性。不要全局关闭 Gatekeeper。

## v1.7.0 核心能力

### 1. 多模型 Provider 工作台

内置配置模板：

- DeepSeek
- OpenAI
- Anthropic
- Google Gemini
- Qwen
- Kimi / Moonshot
- Doubao / Ark
- Zhipu GLM
- OpenRouter
- Ollama
- LM Studio
- 自定义 OpenAI-compatible HTTPS API
- Local Sandbox（显式离线演示）

每个 Provider 都拥有独立 Profile、模型字段、接口地址、连接状态和系统凭证项。API Key 不写入浏览器 localStorage，也不会从系统凭证库返回给 WebView；真实请求由 Rust 后端按 Profile 直接读取密钥。macOS 使用 Keychain，Windows 使用 Credential Manager。模型名称可编辑，因为不同账号、区域和服务商的可用模型可能不同。

### 2. 发送前安全审查

发送顺序固定为：

```text
提示词与附件
→ 本地提取
→ 本地敏感信息扫描
→ 风险展示与脱敏
→ 用户确认
→ Token 优化
→ 模型路由
→ Provider 请求
→ 安全回执
```

- 首条消息也必须审查；
- 提示词与附件统一扫描；
- 编辑提示词、增删附件后旧批准立即失效；
- 高风险内容默认发送脱敏版本；
- 本地历史保存前再次扫描；
- Provider 密钥按 Profile 存入操作系统凭证库。

### 3. Token 优化

工作台提供本地 Token 估算和两种压缩模式：

- **Conservative**：清理重复空白、冗余段落和明显重复内容；
- **Balanced**：在保留任务约束与关键上下文的前提下进一步压缩。

发送前会显示原始 Token、优化后 Token、预计节省数量和具体修改。关闭该功能后不会改写用户内容。

### 4. 文件处理模块

文件先在本地提取为可审查文本，再进入安全扫描和模型上下文：

| 文件类型 | 本地模块 | 当前状态 |
|---|---|---|
| TXT / Markdown / JSON / CSV / 日志 / 代码 | Text & Code Reader | 已实现 |
| PDF | PDF.js 文本提取与页码标记 | 已实现 |
| DOCX | Mammoth 原始文本提取 | 已实现 |
| XLSX / XLS | ExcelJS 工作表转 CSV 上下文 | 已实现 |
| PNG / JPG / WEBP 等 | Tesseract.js 本地 OCR | 已实现，首个版本默认英文语言包 |
| 扫描型 PDF 整页 OCR | PDF 页面渲染 + OCR | 路线图 |

原文件不直接发给 Provider；只有界面中展示并经过审查的提取文本可以进入请求。

### 5. 文件到模型的自动路由

可以分别给代码、PDF、图片/OCR、表格、Office 文档和通用任务配置：

- Provider Profile；
- 可选模型覆盖；
- 启用/停用规则；
- 最终发送目标显示。

路由发生在本地，未连接或未验证的 Provider 不应被静默调用。

### 6. Agent Studio 与内置 Skills

v1.7.0 内置 12 个可组合 Skills：

- Secure Coder
- Repository Onboarding
- Release Doctor
- Token Compressor
- Privacy Review
- PDF Research
- OCR Cleanup
- Spreadsheet Analyst
- GitHub Triage
- Research Brief
- Computer Use Guard
- Product Critic

默认 Agent 包括：

- **TokenFence Coder**：代码、仓库、安全和 Release；
- **Document Analyst**：PDF、OCR、表格和研究总结；
- **Desktop Operator Beta**：Computer Use 权限与安全确认实验入口。

每个 Skill 声明自身需要的网络、文件、GitHub 或 Computer Use 权限。v1.7.0 已完成 Skill 组合、权限模式和能力检测层；没有开放无限制鼠标、键盘或 Shell 控制。

### 7. GitHub 版本检查

Updates 页面直接检查：

```text
Chrisbetheking/tokenfence-studio → Latest GitHub Release
```

应用会展示当前版本、最新版本、发布时间、Release Notes 和安装包列表。外部链接经过桌面后端校验后再交给系统打开。

### 8. 更现代的 macOS 界面

- 使用 Overlay 原生标题栏，移除顶部重复的旧式产品标题；
- 更紧凑的拖拽区、Provider 快速切换和状态入口；
- Workspace、Agent、文件、路由、Provider 和更新页面采用统一面板体系；
- 支持浅色、深色和系统主题；
- 支持中英文界面。

## Computer Use 的真实边界

当前版本提供的是 **Computer Use Beta 基础层**，不是完整的自动控制器：

- 已实现能力状态检测、权限模式、Computer Use Guard Skill 和安全界面；
- 已实现经过检查的 HTTPS 链接打开；
- 屏幕捕获、受控点击、键盘输入、项目文件写入和终端执行仍标记为 Planned；
- 后续操作必须采用逐步授权、作用域限制、可中止执行和审计回执，不能增加一个通用“执行任意命令”后门。

详见 [v1.7 路线图](docs/architecture/ROADMAP_v1.7.md)。

## 开源项目参考

产品架构参考了 OpenHands、Open WebUI、AnythingLLM、LibreChat、MCP Servers 与 LobeChat 等项目的公开设计思想，但没有直接复制它们的业务代码。参考内容包括：Agent 工具分层、多 Provider 管理、文档上下文、Skills/Tools 组合、MCP 扩展和沙箱执行理念。

详见 [开源项目参考与边界](docs/architecture/OPEN_SOURCE_INSPIRATION.md)。

## 本地开发

### 环境

- Node.js 22
- npm
- Rust stable
- Xcode Command Line Tools（macOS）

### 安装与前端预览

```bash
cd apps/desktop/ui
npm ci --legacy-peer-deps
npm run dev
```

浏览器打开：

```text
http://localhost:1420
```

网页预览可查看 UI 和本地处理逻辑，但系统凭证库、真实 Provider 后端请求、版本检查和原生能力需要 Tauri 桌面运行时。

### 桌面开发

```bash
npm ci --legacy-peer-deps
npm ci --prefix apps/desktop/ui --legacy-peer-deps
npm --workspace apps/desktop run dev
```

### 验证

```bash
npm --prefix apps/desktop/ui run typecheck
npm --prefix apps/desktop/ui run test:core
npm --prefix apps/desktop/ui run build
npm --prefix apps/desktop/ui audit --audit-level=moderate
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
python scripts/verify_tokenfence_patch.py
```

## 云端构建 macOS Release

进入 GitHub：

```text
Actions
→ TokenFence macOS Builds and Release
→ Run workflow
```

填写：

```text
version: v1.7.0
create_release: true
make_latest: true
```

工作流会依次执行 TypeScript 检查、隐私测试、前端构建、Rust `cargo check`、Apple Silicon/Intel Tauri 构建、DMG/APP ZIP 打包和 GitHub Release 更新。

## 隐私与安全说明

- TokenFence 只能降低意外泄露风险，不能保证识别全部敏感内容；
- 自定义兼容 API 只允许 HTTPS，HTTP 仅允许 localhost；
- 内置 Provider 会检查接口域名是否与所选服务匹配；
- OCR、PDF 和 Office 解析依赖第三方开源库，应持续跟踪依赖安全；
- 不要在测试或 Issue 中粘贴真实密钥；
- 未签名社区构建需要用户手动确认，正式公开分发仍应配置 Apple Developer ID 签名和 notarization。

## License

MIT
