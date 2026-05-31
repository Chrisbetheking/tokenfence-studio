# TokenFence Studio

<p align="center">
  <img src="./docs/images/banner.png" alt="TokenFence Studio" width="100%">
</p>

<p align="center">
  <strong>面向大语言模型的本地优先 AI 工作台与意图路由器</strong>
</p>

<p align="center">
  多模型路由 · Prompt 安全 · 上下文压缩 · Agent-ready 工作流
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="mailto:your@email.com">Email</a>
</p>

---

## 项目简介

**TokenFence Studio** 是一个本地优先的 AI 工作台，定位在用户与大语言模型之间。

它不只是一个普通的 ChatGPT 风格网页壳子，而是一个面向多模型、多任务和安全调用场景的 **Intent Router / Prompt Safety Layer**。在用户的 Prompt 被发送给模型之前，TokenFence Studio 会先分析意图、检测敏感信息、压缩上下文，并根据任务类型路由到合适的模型或工作流。

项目目标很直接：

- 减少不必要的 token 消耗
- 降低敏感信息外泄风险
- 让多模型调用更可控
- 让 AI 工作流更适合 Agent、MCP、Claude Code、Codex 等开发工具

---

## 核心特性

### 多模型接入

TokenFence Studio 计划支持多种模型提供方与本地模型运行环境：

- OpenAI
- Claude
- Gemini
- DeepSeek
- OpenRouter
- Ollama
- LM Studio
- Local model providers

用户可以在统一界面中配置、切换和管理不同模型，适合研究、开发、翻译、写作和自动化工作流。

### Prompt Guard

在 Prompt 发送到模型之前，系统会检测潜在敏感内容，例如：

- 邮箱地址
- 手机号
- API Key
- Token / Secret
- 身份证号
- 数据库连接字符串
- 内部路径或私有配置

检测到风险后，可以提示用户确认，或自动进行脱敏处理。

### Redaction Engine

敏感内容可以被替换为结构化占位符，例如：

```txt
my email is user@example.com
```

会被转换为：

```txt
my email is [EMAIL_1]
```

这样可以在尽量保留语义的同时，降低真实隐私数据被发送到外部模型的风险。

### Intent Engine

TokenFence Studio 会尝试理解用户请求的意图，并将任务分类，例如：

- 翻译
- 代码生成
- 代码解释
- 摘要
- 简历优化
- 论文辅助
- 会议纪要
- 天气查询
- 文件处理
- Agent 工具调用

不同意图可以绑定不同模型、不同 prompt 模板、不同工具链和不同安全策略。

### Context Compression

长对话或长文档会消耗大量 token。TokenFence Studio 可以在保留核心信息的前提下压缩上下文，让模型获得更高信噪比的输入。

目标不是简单截断内容，而是尽量保留：

- 用户真实意图
- 关键约束
- 任务背景
- 已完成步骤
- 文件结构
- 重要变量和路径

### Agent-ready Workflow

TokenFence Studio 适合与 Claude Code、Codex、OpenHands、MCP Server 等工具组合使用。它可以把项目上下文整理成更适合 Agent 消化的 Context Pack，减少重复解释项目背景的成本。

---

## 为什么需要 TokenFence Studio？

现在很多 AI 工具都是直接把用户输入发送给模型。

这会带来几个问题：

1. 用户可能不小心泄露 API Key、邮箱、手机号或内部配置。
2. 长上下文会造成大量 token 浪费。
3. 不同任务其实适合不同模型，但用户往往需要手动切换。
4. Agent 工具需要结构化上下文，而不是杂乱的聊天记录。
5. 企业或个人开发者需要更透明、可控、本地优先的 AI 调用入口。

TokenFence Studio 的核心思想是：

> 不要把原始 Prompt 直接交给模型。先理解它、保护它、压缩它，再路由它。

---

## 架构概览

```txt
User Prompt
    │
    ▼
Prompt Guard
    │
    ▼
Redaction Engine
    │
    ▼
Intent Engine
    │
    ├── Translation
    ├── Code
    ├── Research
    ├── Resume
    ├── Meeting
    └── Agent Task
    │
    ▼
Context Compression
    │
    ▼
Model Router
    │
    ├── OpenAI
    ├── Claude
    ├── Gemini
    ├── DeepSeek
    ├── OpenRouter
    ├── Ollama
    └── LM Studio
    │
    ▼
AI Response
```

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Chrisbetheking/tokenfence-studio.git
cd tokenfence-studio
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env.local
```

然后根据需要填写模型 API Key：

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
DEEPSEEK_API_KEY=
OPENROUTER_API_KEY=
```

如果只使用 Ollama 或 LM Studio，本地模型可以不填写云端 API Key。

### 4. 启动开发环境

```bash
npm run dev
```

默认访问：

```txt
http://localhost:3000
```

---

## 项目结构

```txt
tokenfence-studio/
├── cli/                    # 命令行工具
├── docs/                   # 文档与图片资源
│   └── images/
│       └── banner.png       # README 顶部横幅图
├── examples/               # 示例配置与示例工作流
├── mcp/                    # MCP 相关能力
├── src/                    # 核心源码
├── tests/                  # 测试文件
├── .gitignore
├── LICENSE
├── README.md
├── README.zh-CN.md
├── package.json
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## 使用场景

### 个人 AI 工作台

集中管理多个模型，在一个界面里完成翻译、写作、代码、摘要和研究任务。

### 隐私保护入口

在 Prompt 发送给云端模型前进行敏感信息检测和脱敏，降低泄露风险。

### 多模型实验平台

同一个任务可以路由到不同模型，方便比较质量、速度和成本。

### Agent 上下文整理器

把项目结构、需求、任务目标和关键文件整理成 Context Pack，供 Claude Code、Codex 或其他 Agent 工具使用。

---

## 路线图

- [ ] ChatGPT 风格聊天界面
- [ ] 多模型 Provider 配置
- [ ] Prompt Guard 敏感信息检测
- [ ] Redaction Engine 脱敏引擎
- [ ] Intent Engine 意图识别
- [ ] Context Compression 上下文压缩
- [ ] Model Router 模型路由
- [ ] 本地聊天记录管理
- [ ] 文件上传与解析
- [ ] 图片上传与视觉模型调用
- [ ] Context Pack 导出
- [ ] MCP 工具接入
- [ ] CLI 支持
- [ ] 插件 / Skill 系统

---

## 开发状态

该项目仍处于早期开发阶段，当前重点是完成基础界面、模型配置、Prompt 安全层和意图路由能力。

欢迎提交 issue、建议和 pull request。

---

## 贡献方式

你可以通过以下方式参与：

1. 提交 bug report
2. 提出新功能建议
3. 改进 README 或文档
4. 添加新的 Provider 适配
5. 优化 Prompt Guard 规则
6. 提供 Agent / MCP 使用案例

---

## License

本项目基于 MIT License 开源。

---

## Author

Created by **Chrisbetheking**.

