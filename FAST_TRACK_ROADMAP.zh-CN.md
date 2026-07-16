# Chris Studio 快节奏推进表

目标不是继续堆展示页面，而是把每一项能力推进到可以真实验收。

## v2.0.0：本次已合并

- 品牌从 TokenFence Studio 改为 Chris Studio；
- 多 Provider 与系统凭证库；
- 安全扫描、脱敏、Token 预算；
- PDF、扫描 PDF OCR、中文 OCR、DOCX、XLSX、图片与本地知识检索；
- 文件到模型路由；
- 受限 Coding Agent、Diff 审查、备份、白名单测试；
- GitHub PAT、Issue、分支、提交、推送、Pull Request；
- macOS 截图、点击、输入和白名单按键；
- 20 个内置 Skills、自定义 Skill、MCP JSON-RPC；
- Apple Silicon / Intel 构建、签名与公证工作流。

## P0：下一轮只做可靠性，不再扩散功能

1. Agent 运行状态、断点和最大循环次数；
2. 测试失败结果回传模型，最多自动修复 3 轮；
3. Patch 一键回滚和每次运行收据；
4. Provider 真实用量、价格和错误码统一；
5. Computer Use 紧急停止、硬超时和坐标可视化；
6. GitHub Actions 结果读取与失败后继续修复。

## P1：文档与电脑操作增强

1. PDF 坐标级引用、页缩略图和表格版式；
2. 本地 Embedding 可选适配器；
3. 窗口级截图、滚动、拖拽和可访问性树定位；
4. Skill 权限差异、签名和版本锁定；
5. 常用社区 MCP 连接模板。

## P2：正式发布

1. Apple Developer ID 签名和 notarization 实测；
2. 应用内安全更新；
3. Windows 原生能力对齐；
4. 加密备份与迁移；
5. 崩溃诊断和匿名可选日志。

## 固定安全边界

- 不向模型暴露任意 Shell；
- 不允许静默写文件、推送或创建 PR；
- 不允许无人值守 Computer Use；
- 不保存明文凭证；
- 不通过关闭 Gatekeeper 解决安装问题。
