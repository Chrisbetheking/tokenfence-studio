# Chris Studio v2.0.0 故障排查

## 1. macOS 提示“已损坏”或无法验证开发者

这通常是 Gatekeeper 拦截未公证社区包，不一定是 DMG 数据损坏。

正式解决：配置 Apple Developer ID 签名与公证，见 [签名与公证说明](../macos/SIGNING_NOTARIZATION.zh-CN.md)。

社区包临时安装：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Chris Studio.app"
open "/Applications/Chris Studio.app"
```

或下载 Release 中与架构匹配的 `Install-Chris-Studio-*.command`，右键选择“打开”。不要关闭全局 Gatekeeper。

## 2. 应该下载 Apple Silicon 还是 Intel

终端执行：

```bash
uname -m
```

- `arm64`：Apple Silicon；
- `x86_64`：Intel。

## 3. App 打开后白屏

先退出应用，再在终端启动以查看日志：

```bash
open -a "Chris Studio"
```

开发环境执行：

```bash
npm ci --prefix apps/desktop/ui --legacy-peer-deps --no-audit --no-fund
npm --prefix apps/desktop/ui run build
cd apps/desktop && tauri dev
```

确认 `apps/desktop/ui/dist/index.html` 已生成，且 Tauri 配置中的 `distDir` 指向正确目录。

## 4. Provider 保存后仍显示 Local Sandbox

1. 在 Providers 页面点击“安全保存”；
2. 点击“测试连接”；
3. 点击“设为当前”；
4. 返回工作台检查顶部 Provider。

v2.0.0 会优先使用当前已连接 Profile，不会静默回退。如果 Keychain 保存被拒绝，请在“钥匙串访问”中搜索 `com.tokenfence.studio.provider`，删除旧条目后重新保存。

## 5. Provider 返回 401 / 403 / 404 / 429

- 401：Key 无效、过期或未从系统凭证库读取；
- 403：账号、地区、权限或接口策略限制；
- 404：Base URL、模型名或 API 风格不匹配；
- 429：速率或余额限制。

先使用 Provider 页面“测试连接”，并核对官方接口地址和模型名称。自定义接口必须是 HTTPS 或本机 localhost 地址。

## 6. 图片没有发送给视觉模型

默认行为是本地 OCR，只把文字发给模型。需要原图视觉能力时：

1. 选择支持 Vision 的 Provider Profile；
2. 在发送前开启真实图片附件；
3. 确认安全审查和最终目标。

不开启时，原始图片不会离开设备。

## 7. OCR 首次运行慢或失败

Tesseract.js 首次使用某种语言时可能需要准备语言资源。建议先用清晰、正向、小尺寸图片验证。

可选语言：

```text
eng
chi_sim
eng+chi_sim
```

OCR 结果必须人工复核。极大图片、手写体、低对比度或复杂表格可能识别不准。

## 8. 扫描 PDF 没有文字

v2.0.0 会对无文本层页面进行 OCR，但默认限制 OCR 页数，避免一次任务占用过多内存。请：

- 在文件处理设置中提高最大 OCR 页数；
- 先拆分超大 PDF；
- 选择正确 OCR 语言；
- 检查页面是否加密或损坏。

## 9. 本地知识库搜不到内容

知识库是本地词法/多语言词元检索，不是远程向量数据库。请确保：

- 文件已经成功处理并加入索引；
- 查询包含文档中的实体或关键词；
- 中文查询尽量包含完整短语；
- 没有清除本地知识库。

## 10. Coding Agent 没生成 Diff

AI Patch Assistant 只使用：仓库树、Git 状态、当前 Diff、任务和当前选中文件。复杂任务可能缺少上下文。

处理：

1. 选择最相关文件；
2. 把任务缩小为一个可审查修改；
3. 检查当前 Provider 已连接；
4. 查看 Agent 返回的 Plan；
5. 不要要求它凭空修改未提供内容的文件。

模型输出必须包含从 `diff --git` 开始的统一 Diff，否则不会进入应用按钮。

## 11. Patch 无法应用

Chris Studio 会先运行 `git apply --check`。失败通常表示：

- Diff 基于旧文件版本；
- 路径不在当前受限目录；
- 已有本地修改与补丁冲突；
- Diff 格式不完整。

先运行 Git diff，重新生成补丁，或手动编辑并保存。不要绕过检查。

## 12. npm / cargo 检查按钮失败

命令只能从固定白名单中运行，并且工作目录固定为已批准项目目录。请确认项目确实存在对应文件：

- npm：`package.json`；
- Cargo：`Cargo.toml`；
- Git：`.git`。

Chris Studio 不提供任意 Shell 输入框。

## 13. GitHub 连接或 PR 创建失败

- PAT 需要访问目标仓库的最小必要权限；
- 私有仓库必须允许读取和写入；
- 当前分支必须已经推送到 origin；
- `head` 和 `base` 分支必须存在；
- 仓库 URL 使用 `https://github.com/owner/repo`。

PAT 保存在系统凭证库。删除连接后需要重新输入。

## 14. Computer Use 截图、点击或输入失败

进入：

```text
系统设置 → 隐私与安全性 → 屏幕录制
系统设置 → 隐私与安全性 → 辅助功能
```

为 Chris Studio 开启权限，然后完全退出并重开应用。

坐标点击使用当前屏幕坐标；多显示器和缩放可能造成偏差。先截图确认，再执行一次动作。所有动作都需要确认，并记录到本地审计日志。

## 15. MCP 连接失败

- 远程 URL 必须使用 HTTPS；
- 本机开发服务器可使用 `http://localhost` 或 `http://127.0.0.1`；
- 当前 Beta 面向一次请求/JSON 响应；
- 依赖长期 SSE、复杂 OAuth 或专有传输的服务器可能不兼容；
- `tools/call` 需要在界面中逐次确认。

## 16. GitHub Actions 在 npm ci 失败

确认 `apps/desktop/ui/package.json` 与 `package-lock.json` 同步：

```bash
cd apps/desktop/ui
npm install --package-lock-only --legacy-peer-deps --no-audit --no-fund
npm ci --legacy-peer-deps --no-audit --no-fund
```

锁文件不得包含私有 Registry、内部网关或区域镜像地址。

## 17. TypeScript 构建失败

执行：

```bash
npm --prefix apps/desktop/ui run typecheck
npm --prefix apps/desktop/ui run build
```

`tsconfig.json` 应从 `src/main.tsx` 和 `src/vite-env.d.ts` 开始检查正式依赖图。

## 18. Rust / Tauri 构建失败

执行：

```bash
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

macOS 还需要：

```bash
xcode-select --install
```

GitHub Actions 中先看 `Check native Rust backend`，再看 `Build Tauri application`。

## 19. Release 没更新或下载 404

仅上传源码不会自动发布安装包。需要新建工作流运行：

```text
version: v2.0.0
create_release: true
make_latest: true
```

不要在旧失败记录上 Re-run，因为旧任务仍绑定旧提交。Release 成功后 README 的 `releases/latest/download/...` 链接才会生效。

## 20. 重置本地数据

优先使用设置页的清理按钮。需要完全重置时，退出应用并清理 Chris Studio 的 WebView 数据、Keychain 中的 Chris Studio 凭证以及项目目录内 `.tokenfence` 备份。操作前先导出非敏感设置和需要保留的历史记录。
