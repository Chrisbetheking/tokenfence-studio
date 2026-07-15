# TokenFence Studio v1.6.1 macOS 验证报告

## 已在当前环境完成

- 桌面 UI 全量 TypeScript strict 检查：通过。
- 桌面 UI Vite production build：通过，44 modules。
- 构建输出：JS 248.67 KB（gzip 78.41 KB），CSS 21.53 KB（gzip 4.69 KB）。
- Core privacy tests：通过。
- 全部 TS/TSX 文件语法转换检查：通过。
- JSON、TOML、GitHub Actions YAML 结构检查：通过。
- 覆盖补丁静态不变量与凭证扫描：通过。
- ZIP 完整性和 SHA-256 清单：打包阶段生成并复验。

## 需要 GitHub macOS Runner 完成

当前执行环境不是 macOS，且没有 Rust 工具链，因此没有在本地伪造或声称生成 `.dmg`。以下验证由 `.github/workflows/tokenfence-macos.yml` 完成：

- Rust/Tauri 原生编译；
- Apple Silicon `.app` 与 `.dmg`；
- Intel `.app` 与 `.dmg`；
- 可选 Universal `.app` 与 `.dmg`；
- 每种架构产物的 SHA-256。

## 主要安全变化

- API Key 通过 Rust 后端写入 macOS Keychain/Windows Credential Manager。
- Provider 元数据写入 localStorage 时强制将 `apiKey` 清空。
- 旧版本明文凭证迁移无论成功与否都会从 localStorage 清除。
- Provider 请求只能通过 Tauri 后端发送。
- 提示词和附件在模型请求构造前统一扫描。
- 内容变更后旧安全批准失效。
- 历史保存前再次进行防御性脱敏。
