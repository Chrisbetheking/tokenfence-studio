# TokenFence Studio

<p align="center">
  <img src="./docs/images/banner.png" alt="TokenFence Studio" width="100%">
</p>

<p align="center">
  <strong>面向大语言模型的本地优先 Prompt 安全、模型路由与多模型编排工作台</strong>
</p>

<p align="center">
  Prompt Guard · Model Matrix · 文件级模型路由 · 上下文压缩 · Agent-ready 工作流
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./docs/changelog/README.md">更新日志</a> ·
  <a href="https://github.com/Chrisbetheking/tokenfence-studio">GitHub</a>
</p>

---

## 项目简介

**TokenFence Studio** 是一个本地优先的 AI 工作台，定位在用户与大语言模型之间。

它不是一个普通的 ChatGPT 风格网页壳子，而是一个 **Prompt 发送前的安全检查层、意图路由层和多模型编排层**。

在 Prompt 或文件内容被发送给模型之前，TokenFence Studio 会先进行本地预处理：

```text
原始 Prompt / 文件
   ↓
Prompt Guard
   ↓
敏感信息检测与脱敏
   ↓
意图识别
   ↓
上下文压缩
   ↓
模型 / 文件路由
   ↓
最终 Prompt 预览
   ↓
云端模型或本地模型
```

项目目标很直接：

- 降低敏感信息外泄风险
- 减少不必要的 token 消耗
- 让多模型调用更可控
- 让不同任务、不同文件使用更合适的模型
- 为 Agent、MCP、Claude Code、Codex 等工作流准备更干净的上下文

---

## 它和普通 AI Chat UI 有什么不同？

大多数 AI 工具关注的是“怎么调用模型”。

TokenFence Studio 更关注的是：**Prompt 到达模型之前应该发生什么**。

它会尝试回答这些问题：

- 这个 Prompt 能不能安全发送？
- 里面有没有 API Key、Token、邮箱、数据库连接等敏感信息？
- 上下文能不能压缩？
- 这个任务更适合哪个模型？
- 某个文件应该给云端模型、本地模型，还是代码模型处理？
- 同一个任务能不能同时跑多个模型做对比？

所以它更像是一个 **Pre-LLM Safety & Orchestration Layer**，而不是普通聊天界面。

---

## 截图

### Chat Workspace

![Chat Workspace](./docs/images/chat.png)

### Provider Management

![Providers](./docs/images/providers.png)

### Prompt Guard

![Prompt Guard](./docs/images/guard.png)

---

## 核心功能

### Prompt Guard

在 Prompt 发送给模型之前，先进行本地安全扫描。

当前可以检测常见敏感信息，例如：

- API Key
- 邮箱地址
- 手机号
- 数据库连接字符串
- Access Token
- Secret 赋值
- 中文个人身份信息
- 常见凭证泄露模式

### Redaction Engine

将敏感内容替换成结构化占位符，在尽量保留语义的同时降低泄露风险。

```text
john@example.com → [EMAIL_1]
sk-xxxxxxx       → [OPENAI_KEY_1]
```

### Policy Profiles

支持不同安全策略：

- **Strict privacy**：更严格，优先本地模型或脱敏内容
- **Balanced**：默认模式，在安全和流畅之间平衡
- **Fast**：低风险内容减少处理步骤
- **Developer**：展示更多中间信息，方便调试

### Model Matrix

支持一次性使用多个模型，或者让不同文件选择不同模型。

当前能力包括：

- 同一个 Prompt 同时发送给多个模型
- 对比不同模型的回答、耗时、token 使用和风险状态
- 粘贴多个文件内容并分别处理
- 每个文件可以手动指定不同模型
- 文件可以标记为 public、private 或 secret
- 高风险或 secret 文件会倾向推荐本地模型

### 文件级模型路由

不同文件可以使用不同模型。

示例：

| 文件 | 推荐路由 |
|---|---|
| `src/app/page.tsx` | 代码能力更强的模型 |
| `README.md` | 文档 / 写作模型 |
| `error.log` | 长上下文模型 |
| `.env` 或私密配置 | 本地模型优先 |

这个功能适合代码项目分析、文档整理、日志排查和多文件任务拆解。

### 多 Provider 支持

TokenFence Studio 支持海外、国内、聚合平台和本地模型运行环境。

当前 Provider 预设包括：

- OpenAI
- Anthropic Claude
- Google Gemini
- DeepSeek
- 字节火山方舟 / Doubao
- 阿里云百炼 / Qwen
- 百度千帆
- Kimi / Moonshot
- 智谱 GLM
- MiniMax
- SiliconFlow
- OpenRouter
- Groq
- Together AI
- 302.AI
- ModelScope
- Ollama
- LM Studio
- 自定义 OpenAI-compatible endpoint

用户自带 API Key，不绑定单一厂商。

### Context Compression

对长 Prompt、长对话或长文件进行压缩，在尽量保留用户真实意图、关键约束和任务背景的同时减少 token 消耗。

### Local Archive

本地保存脱敏后的运行记录，默认不依赖云端数据库。

### Agent Context Packs

将项目背景、关键文件、需求和任务目标整理成更适合 AI 编程工具和 Agent 工作流使用的上下文包。

适合：

- Claude Code
- Codex
- MCP-based agents
- OpenHands-style workflows

---

## 计划中：Search Grounding 联网搜索增强

联网搜索会作为后续模块加入。

设计目标不是简单“让模型上网”，而是让 TokenFence 先判断是否需要实时信息，再安全地准备搜索 query、获取来源，并把搜索结果作为可引用上下文注入模型。

计划支持：

- Brave Search
- Tavily
- Gemini Grounding with Google Search
- Kimi Web Search
- 通过 SERP Provider 接入百度搜索
- 自定义搜索 Provider

搜索模块也会受安全策略控制：

- 禁止把密钥和隐私内容直接拿去搜索
- 对搜索 query 进行脱敏
- 支持 Global / China / Auto 区域选择
- 回答前展示来源信息

---

## 架构概览

```text
用户输入 / 文件内容
        │
        ▼
Intent Engine
        │
        ▼
Prompt Guard
        ├── Scanner
        ├── Redactor
        ├── Risk Engine
        └── Compressor
        │
        ▼
Model Matrix / Router
        ├── Prompt 级多模型执行
        ├── 文件级模型路由
        ├── 敏感文件本地模型优先
        └── 未来支持 Judge Model / Fallback
        │
        ▼
Provider Layer
        ├── 海外模型平台
        ├── 国内模型平台
        ├── 聚合路由平台
        └── 本地模型
        │
        ▼
回答 / 对比 / 存档
```

---

## 快速开始

```bash
git clone https://github.com/Chrisbetheking/tokenfence-studio.git
cd tokenfence-studio
npm install
npm run dev
```

访问：

```text
http://localhost:3000
```

### API Key 配置

可以在 Provider 设置页面保存 API Key，也可以手动创建 `.env.local` 文件。

常见环境变量：

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
DEEPSEEK_API_KEY=
VOLCENGINE_API_KEY=
DASHSCOPE_API_KEY=
QIANFAN_API_KEY=
MOONSHOT_API_KEY=
ZHIPU_API_KEY=
MINIMAX_API_KEY=
SILICONFLOW_API_KEY=
OPENROUTER_API_KEY=
GROQ_API_KEY=
TOGETHER_API_KEY=
THREE_ZERO_TWO_API_KEY=
MODELSCOPE_API_KEY=
```

如果只使用 Ollama 或 LM Studio，本地模型可以不配置云端 API Key。

---

## 项目结构

```text
src/
 ├── app/
 ├── components/
 ├── lib/
 │   ├── core/
 │   ├── providers/
 │   ├── skills/
 │   └── vault/
 └── api/

mcp/
cli/
docs/
examples/
```

---

## 路线图

### 当前原型已包含

- [x] Chat 工作台
- [x] Provider 设置
- [x] Prompt Guard
- [x] Redaction Engine
- [x] Context Compression
- [x] Policy Profiles
- [x] Model Matrix 多模型对比
- [x] 文件级模型路由原型
- [x] 本地 Archive
- [x] Agent Context Pack 原型

### 计划中

- [ ] Search Grounding 联网搜索路由
- [ ] Judge Model 合并多模型输出
- [ ] Provider 自动兜底链路
- [ ] 成本与延迟预算路由
- [ ] Model Matrix 真实文件上传解析
- [ ] 搜索来源引用面板
- [ ] MCP Marketplace
- [ ] VS Code Extension
- [ ] Browser Extension
- [ ] Local Vector Search
- [ ] Team Workspace

---

## 更新日志

最近更新与开发记录见：[Update Log](./docs/changelog/README.md)。

---

## 贡献方式

欢迎提交 issue、建议和 pull request。

目前比较需要的贡献方向：

- 新 Provider 适配
- 更好的敏感信息检测规则
- Search Grounding 集成
- 文件路由策略
- 多模型对比工作流
- Agent / MCP 使用案例

---

## Author

Created by **ChrisWang**.

Building practical AI infrastructure.

---

## License

MIT License
