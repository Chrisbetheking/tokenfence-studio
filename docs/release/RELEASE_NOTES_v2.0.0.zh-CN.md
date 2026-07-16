# Chris Studio v2.0.0 发布说明

v2.0.0 把 Chris Studio 从“多模型安全聊天基础版”推进为带受限仓库、GitHub、Computer Use、MCP、Skills、本地知识库和 Token 预算的桌面 Agent 工作台。

## 主要更新

- 新增受限仓库工作区，支持安全浏览、编辑、备份和补丁归档。
- 新增 AI Patch Assistant：使用活跃模型生成计划和统一 Diff，发送前先脱敏，应用前必须人工审查。
- 新增固定命令白名单和 `git apply --check`。
- 新增 GitHub PAT 凭证存储、仓库/Issue 读取、分支、提交、推送和 Pull Request。
- 新增 macOS 屏幕截图、批准式坐标点击、文本输入和白名单按键。
- 新增 20 个内置 Skills、自定义 Skill 编辑与导入/导出。
- 新增 MCP/JSON-RPC 工具连接器 Beta，工具调用逐次确认。
- 新增扫描 PDF OCR、简体中文 OCR、中英混合 OCR。
- 新增本地知识分块和检索增强上下文。
- 新增真实视觉图片附件开关。
- 新增单次 Token 上限、每日预算和用量统计。
- 新增 Apple Developer ID 签名/公证工作流和社区安装助手。
- 修复嵌套桌面 UI 锁文件、TypeScript 图、Provider 凭证回退和 PDF.js 5 渲染类型问题。

## 安全边界

- 不提供任意 Shell。
- 模型生成的补丁不会自动落盘。
- Computer Use 每个动作单独确认。
- MCP `tools/call` 每次单独确认。
- 不把系统凭证库中的秘密返回给 WebView。
- 不静默安装更新。

## 安装

下载与 Mac 处理器匹配的 DMG。正式无警告安装需要发布者在 GitHub Actions 配置 Apple Developer ID 和公证凭证；否则使用 Release 中的社区安装助手。

## 验证

```bash
npm ci --prefix apps/desktop/ui --legacy-peer-deps --no-audit --no-fund
npm --prefix apps/desktop/ui run typecheck
npm --prefix apps/desktop/ui run test:core
npm --prefix apps/desktop/ui run build
python3 scripts/verify_tokenfence_patch.py
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```
