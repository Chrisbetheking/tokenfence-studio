# TokenFence Studio

<p align="center">
  <img src="./docs/images/banner.png" alt="TokenFence Studio" width="100%">
</p>

<p align="center">
  <strong>面向大语言模型的本地优先 Prompt 安全、文档智能处理与多模型编排工作台</strong>
</p>

<p align="center">
  Prompt Guard · Document Pipeline · Model Matrix · 文件级路由 · Agent-ready 工作流
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./docs/changelog/README.md">更新日志</a> ·
  <a href="https://github.com/Chrisbetheking/tokenfence-studio">GitHub</a>
</p>

---

## 项目简介

**TokenFence Studio** 是一个本地优先的 AI 工作台，定位在用户与大语言模型之间。

在 Prompt 或文件内容被发送给模型之前，TokenFence Studio 会先进行本地预处理：扫描敏感信息、清洗文档噪声、检测意图、压缩上下文，然后根据风险和文件类型选择合适的模型路由。

项目目标：让 LLM 使用过程更安全、更干净、更容易调试。

---

## 为什么做 TokenFence？

大多数 AI 工具关注的是"怎么调用模型"。TokenFence Studio 更关注的是：**内容到达模型之前应该发生什么**。

它尝试回答这些问题：
- 这个 Prompt 能不能安全发送？
- PDF、DOCX、日志或 Markdown 能不能先清洗？
- 页眉、页脚、页码、重复段落这些噪声能不能去掉？
- 文件能不能切成 RAG-ready chunks？
- 这个任务更适合哪个模型？
- 敏感文件应该给本地模型，还是脱敏后的安全流程？

所以它更像是一个 **Pre-LLM Safety & Orchestration Layer**，而不是普通聊天界面。

---

## 预览

UI 截图将在下一个稳定版本后补充。

---

## 核心功能

- **Prompt Guard** — 在 Prompt 发送给模型之前进行本地安全扫描
- **Redaction Engine** — 将敏感内容替换成结构化占位符
- **Document Intelligence Pipeline** — PDF/DOCX/图片解析、噪声清洗、敏感扫描、RAG Chunk 生成
- **Model Matrix** — 一键使用多个模型，对比回答
- **文件级模型路由** — 不同文件自动选择不同模型
- **多 Provider 支持** — 支持海外、国内和本地模型，自带 API Key
- **上下文压缩** — 压缩长 Prompt，保留关键信息
- **本地归档** — 脱敏后的运行记录保存在本地
- **Agent Context Packs** — 为 AI 编程和 Agent 工作流准备可复用的上下文包
- **公用 TypeScript 包** — `packages/shared` 跨平台共享逻辑

---

## 平台支持

| 平台 | 状态 | 说明 |
|---|---|---|
| Web | 已可用 | 完整 Next.js 工作台 |
| Android | 已可用 / 发布自动化修复中 | Expo React Native 轻量版 |
| Windows 桌面 | 实验中 | Tauri 壳子，发布打包进行中 |
| macOS 桌面 | 实验中 | Tauri 壳子，发布打包进行中 |
| iOS | 仅自助构建 | 用户使用自己的 Apple Developer 账号签名 |

---

## 快速开始

### Web 工作台

```bash
git clone https://github.com/Chrisbetheking/tokenfence-studio.git
cd tokenfence-studio
npm install --legacy-peer-deps
npm run dev
```

打开 http://localhost:3000。

### 安卓轻量版

```bash
cd apps/android
npm install
npm run start
```

使用 Expo Go 扫描 QR 码。

### 桌面应用

```bash
cd apps/desktop
npm install
npm run dev
```

需要 Rust 和 Tauri CLI。

---

## 项目结构

```
tokenfence-studio/
  apps/
    web/          Next.js 完整 Web 工作台
    android/      Expo React Native 安卓轻量版
    desktop/      Tauri 桌面壳子 (Windows + macOS)
  packages/
    shared/       跨平台公用 TypeScript 逻辑
  docs/
    changelog/    每次更新的开发日志
    images/       Banner 和截图
  examples/       测试用示例文档
  cli/            CLI 工具 (规划中)
  mcp/            MCP 集成 (规划中)
  .github/
    workflows/    CI/CD 流程
```

---

## 项目状态

### 已可用

- 响应式 Web 工作台 (Chat、Guard、Document Pipeline、Model Matrix、Provider 设置、Archive、Agent Packs)
- 安卓轻量版应用 (Prompt 扫描、模型路由、脱敏本地归档)
- Tauri 桌面壳子 (Windows + macOS)
- 多 Provider 支持 (海外、国内、聚合、本地模型)
- Prompt Guard 敏感信息扫描
- Redaction Engine 结构化脱敏
- Document Intelligence Pipeline (PDF/DOCX/OCR/清洗/切片)
- Model Matrix 多模型对比
- 文件级模型路由
- 本地脱敏归档
- Agent Context Pack 原型
- 公用 TypeScript 逻辑包
- GitHub Releases CI/CD 流程

### 实验中

- Provider 备用链 (Fallback Chains)
- 成本/延迟预算路由器 (Budget Router)
- 来源引用面板原型 (Citation Panel)
- 桌面存储路径选择

### 规划中

- 扫描版 PDF OCR
- 复杂 PDF 布局解析
- Search Grounding 路由器
- Judge 模型
- MCP 市场
- VS Code 插件
- 浏览器插件
- 本地向量检索
- 团队工作区

---

## 发布

- v0.3.6 发布页面已存在
- 桌面二进制文件仍在修复中
- Android APK 自动化仍在修复中
- 稳定公开版本将在修复完成后的下一个 tag 发布

---

## 更新日志

参见 [更新日志](./docs/changelog/README.md)。

---

## 贡献方式

欢迎提交 Issue 和 Pull Request。

---

## Author

Created by **ChrisWang**.

---

## License

MIT License
