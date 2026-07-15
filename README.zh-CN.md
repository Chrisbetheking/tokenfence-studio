# TokenFence Studio

**语言：** [English](README.md) | [简体中文](README.zh-CN.md)  
**帮助：** [中文故障排查](docs/troubleshooting/TROUBLESHOOTING.zh-CN.md) | [English troubleshooting](docs/troubleshooting/TROUBLESHOOTING.md)

![TokenFence Studio Banner](docs/images/banner.png)

> 位于提示词、文件与 AI Provider 之间的一道本地优先安全防线。

TokenFence Studio 是一款桌面 AI 安全工作台。它会在请求发送给 AI Provider **之前**，统一审查提示词和支持的文本附件，识别潜在敏感信息，生成脱敏后的待发送内容，明确展示发送目标，并尽可能降低敏感信息被意外提交和落盘的风险。

**安全工作区** · **Prompt Guard** · **附件审查** · **DeepSeek Provider** · **本地历史** · **macOS 钥匙串**

## 当前版本

当前桌面端版本线为 **v1.6.1**。

- 支持 Apple Silicon 与 Intel Mac 的原生 macOS 构建
- 提供可选 Universal 通用安装包
- DeepSeek 凭证保存到操作系统凭证库
- 中英文界面
- 跟随系统、浅色和深色主题
- 无需 API Key 的 Demo Mode
- 仅保存脱敏内容的本地会话与安全回执

> v1.6.1 社区 macOS 构建目前未配置 Apple Developer 签名与公证。第一次启动时，可能需要在 Finder 中按住 Control 点击应用并选择 **打开**。不要全局关闭 Gatekeeper。

## 为什么需要 TokenFence Studio

使用 AI 处理真实工作时，提示词里经常会混入终端日志、源代码、配置文件、账号标识、邮箱、接口地址和 API Key。普通聊天界面在用户点击发送后就会直接提交内容，而 TokenFence Studio 会在用户与 Provider 之间增加一次明确的安全审查：

```text
提示词 + 支持的文本附件
             ↓
        本地安全扫描
             ↓
      风险分类与结果展示
             ↓
      生成经过审查的脱敏内容
             ↓
         用户确认发送
             ↓
       明确的 Provider 请求
```

TokenFence Studio 不承诺百分之百识别所有敏感信息。它的目标是让意外泄露更难发生、风险更加可见、发送过程可以审查。

## 核心功能

### 发送前 Prompt Guard

- 在发送前扫描当前提示词
- 检测常见密钥、凭证与个人标识
- 支持用户自定义敏感词
- 展示风险等级和问题类型，不直接暴露完整敏感值
- 提示词发生变化后，旧的安全批准自动失效

### 提示词与附件统一审查

- 将提示词和支持的文本附件放入同一套安全流程
- 增加、删除或替换附件后，旧批准自动失效
- 开启阻断策略后，严重风险原文不能绕过已审查的脱敏版本
- 可配置文本和附件的最大扫描大小

### 系统级凭证保护

- macOS：将 Provider 凭证保存到 **钥匙串 Keychain**
- Windows：保存到操作系统凭证库
- 新版本不会把完整 Provider Key 写入浏览器 `localStorage`
- 检测到旧版本遗留的本地明文凭证时，会尽可能迁移并清理

### 更安全的本地历史

- 启用本地历史后，仅保存经过脱敏处理的会话内容
- 安全回执保存扫描元数据，不保存完整敏感原文
- 会话落盘前会再次经过防御性扫描
- 支持分别清空会话、回执、Provider 凭证或整个应用数据

### DeepSeek Provider 工作区

- 可配置 DeepSeek 模型和官方基础地址
- 连接测试会显示更明确的错误类别
- Provider 请求通过 Tauri 桌面端 Rust 后端发出
- Demo Mode 无需 API Key，也不会发送网络请求

### 桌面端体验

- Workspace、History、Providers、Settings、About 五个主要页面
- macOS 原生应用菜单
- macOS 使用 `Command + N` 新建安全会话
- About 页面展示应用版本、操作系统、CPU 架构和安全存储类型
- 简体中文与英文界面
- 跟随系统、浅色和深色主题

## 下载与构建产物

正式发布的安装文件位于仓库 **Releases** 页面。v1.6.1 的 macOS 测试产物也可以从以下位置下载：

```text
GitHub → Actions → TokenFence macOS Builds
```

根据 Mac 芯片选择正确产物：

| Artifact | 适用设备 |
|---|---|
| `TokenFence-Studio-macOS-Apple-Silicon` | M1、M2、M3、M4 以及后续 Apple 芯片 |
| `TokenFence-Studio-macOS-Intel` | Intel 芯片 Mac |
| `TokenFence-Studio-macOS-Universal` | 同时支持两类架构，可选任务成功时提供 |

在 Mac 终端中查看架构：

```bash
uname -m
```

- 输出 `arm64`：下载 Apple Silicon 版。
- 输出 `x86_64`：下载 Intel 版。

## 普通用户快速使用

### macOS 安装

1. 从 Releases 或 GitHub Actions 下载正确的 `.dmg`。
2. 打开 DMG，把 **TokenFence Studio** 拖入 **Applications/应用程序**。
3. 未签名版本第一次运行时，在 Finder 中按住 Control 点击应用并选择 **打开**。
4. 进入 **Providers**。公开演示可开启 Demo Mode；真实调用则把 DeepSeek API Key 保存到钥匙串。
5. 返回 **Workspace**，输入测试内容，查看扫描结果并确认安全版本。

公开演示不要使用真实密钥、真实密码或真实个人信息，应使用明确的虚构测试数据。

### Windows 安装

1. 从 Releases 下载 Windows Portable ZIP。
2. 完整解压 ZIP。
3. 在解压后的文件夹中运行 `tokenfence-studio.exe`。

不要直接在压缩包预览界面中运行 EXE。

## 开发环境

### 环境要求

- Node.js `18`–`22`
- npm `9` 或更高版本
- 原生桌面开发需要 Rust stable
- macOS 桌面构建需要 Xcode Command Line Tools

### 克隆与安装

```bash
git clone https://github.com/Chrisbetheking/tokenfence-studio.git
cd tokenfence-studio
npm ci --legacy-peer-deps
```

### 运行网页工作区

```bash
npm run dev
```

打开 Vite 输出的本地地址，通常为 `http://localhost:3000`。

### 仅运行桌面 UI

```bash
npm --workspace apps/desktop run ui:dev
```

这个模式适合修改界面和截图，但原生 Provider 请求、钥匙串等功能必须在 Tauri 桌面运行环境中使用。

### 运行原生桌面应用

```bash
npm run desktop:dev
```

### 构建桌面应用

```bash
npm run desktop:build
```

### 在 Mac 本机生成安装包

```bash
bash scripts/build-macos.sh
```

构建结果位于：

```text
apps/desktop/src-tauri/target/<target>/release/bundle/
```

## 使用 GitHub Actions 构建 Mac 版

即使本地没有第二台 Mac，也可以通过 GitHub 的 macOS Runner 生成测试安装包。

1. 打开 GitHub 仓库的 **Actions**。
2. 选择 **TokenFence macOS Builds**。
3. 点击 **Run workflow**，分支选择 `main`。
4. 等待 `Verify desktop UI`、`macOS Apple-Silicon` 和 `macOS Intel` 完成。
5. 在该次运行页面底部下载 Artifacts。

工作流会分别在 arm64 与 Intel macOS Runner 上构建，并打包 `.dmg`、`.app.zip` 和 SHA-256 校验文件。

创建 `v1.6.1` 这类版本标签后，工作流还会尝试把成功生成的 macOS 文件添加到对应 GitHub Release。

## 配置 DeepSeek

1. 打开 **Providers**。
2. 除非正在进行明确的开发测试，否则保留应用提供的官方基础地址。
3. 选择界面中支持的模型。
4. 输入 API Key，并保存到系统凭证库。
5. 点击 **Test connection/测试连接**。
6. Provider 状态显示连接成功后，返回 Workspace 使用。

界面会在本地保存 Provider 的非敏感配置，但原始 API Key 会通过桌面端原生凭证库保存。

## Demo Mode

Demo Mode 适合比赛截图、产品演示、评审体验和离线测试。

- 不需要 Provider API Key。
- 不会发送网络请求。
- 保留完整的扫描、脱敏、确认和安全回执流程。
- 只能使用虚构的邮箱、Token 和密码示例。

Demo Mode 成功不代表真实 Provider 已经连接。真实 DeepSeek 配置必须通过 **测试连接** 验证。

## 隐私与安全设计

TokenFence Studio 遵循以下原则：

1. 提示词和支持的文本附件在发送前先审查。
2. 始终明确展示当前 Provider 和模型。
3. 内容发生相关变化后必须重新批准。
4. Provider 密钥保存到操作系统凭证库。
5. 本地历史保存脱敏内容，而不是检测到的敏感原文。
6. 调试输出中不打印完整 Provider 密钥和未脱敏请求。

### 重要限制

- 基于规则和模式的扫描可能漏掉未知或非常规格式的敏感信息。
- 自动脱敏后的内容仍然需要用户人工检查。
- 二进制文件、图片、加密压缩包和不支持的格式可能无法被检查。
- 用户批准发送后，第三方 Provider 如何处理数据不受本应用控制。
- 当前社区版 macOS 安装包未经过 Apple 签名和公证。
- TokenFence Studio 不能替代企业 DLP、终端安全、权限控制以及法律或合规审查。

## 验证命令

在仓库根目录执行：

```bash
npm ci --legacy-peer-deps
npm --workspace apps/desktop run typecheck
npm --workspace apps/desktop run test:core
npm --workspace apps/desktop run ui:build
python3 scripts/verify_tokenfence_patch.py
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Windows 环境如果没有 `python3` 命令，可以使用 `python`。

## 项目结构

```text
apps/
├── web/                     浏览器工作区
├── desktop/
│   ├── ui/                  React + TypeScript 桌面界面
│   └── src-tauri/           Rust + Tauri 原生后端
└── android/                 移动端应用
packages/
└── shared/                  公共包
scripts/
├── build-macos.sh           macOS 本地构建脚本
└── verify_tokenfence_patch.py
docs/
└── troubleshooting/        中英文故障排查
.github/workflows/
├── tokenfence-macos.yml     Apple Silicon、Intel 与可选 Universal 构建
└── tokenfence-v1.6-verify.yml
```

## 遇到问题

完整排查文档：

- [中文故障排查](docs/troubleshooting/TROUBLESHOOTING.zh-CN.md)
- [Troubleshooting in English](docs/troubleshooting/TROUBLESHOOTING.md)

文档覆盖 Mac 安装拦截、芯片版本选错、白屏、DeepSeek 连接、钥匙串、依赖安装和 GitHub Actions 构建失败等问题。

## 后续规划

- Apple Developer 签名与公证
- 在同一安全边界中增加更多 Provider
- 扩展附件解析能力，并明确显示文件支持状态
- 用户自定义规则包与安全策略
- 扫描准确率评估和误报控制
- 更完整的 Release 自动化与更新校验
- 无障碍与键盘操作优化

## 参与贡献

1. Fork 仓库。
2. 创建目标明确的分支。
3. 不要把真实密钥和测试凭证提交到 Git。
4. 提交 Pull Request 前执行全部验证命令。
5. 涉及扫描、脱敏、存储或 Provider 请求的改动，需要明确说明安全影响。

## 安全问题反馈

不要在公开 Issue 中粘贴真实 API Key、密码、私人文档或可被直接利用的敏感信息。请提供最小化、经过脱敏的复现内容，并遵循仓库的安全反馈说明。

## 开源协议

MIT License。
