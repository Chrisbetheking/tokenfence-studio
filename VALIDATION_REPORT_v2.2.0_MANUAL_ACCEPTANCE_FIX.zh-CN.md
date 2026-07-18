# Chris Studio v2.2.0 人工验收修复验证报告

## 验收输入

根据用户在真实 macOS 安装包中的截图，确认以下问题：

- 流式正文已经完整显示，但最终仍追加 `The provider stream ended before the response could be read.`。
- 停止生成可用，但旧失败记录仍在可靠执行中心显示。
- 左侧会话没有稳定、明显的重命名操作。
- macOS “辅助功能”已经打开，但截图仍提示权限不足；实际还缺少独立的“屏幕与系统音频录制”权限。
- Computer Use 打开 TextEdit 后进入文档选择器，模型仍可能错误报告任务完成。

## 已执行命令

```bash
npm ci --prefix apps/desktop/ui --legacy-peer-deps --no-audit --no-fund
npm --prefix apps/desktop/ui run typecheck
npm --prefix apps/desktop/ui run test:core
npm --prefix apps/desktop/ui run build
npm ci --prefix apps/desktop/ui --legacy-peer-deps --no-audit --no-fund --dry-run
```

## 结果

### PASS

- UI 干净依赖安装
- TypeScript strict typecheck
- Core privacy tests
- Reliable Agent tests
- Provider telemetry and safety runtime tests
- Runtime store tests
- Codex layout / streaming / Computer Use protocol tests
- Progressive stream session test
- Late `STREAM_READ_ERROR` salvage test
- Conversation rename persistence test
- Tauri command static contract test
- Product metadata idempotency test
- Workspace adapter integration test
- Vite production build
- 476 modules transformed
- UI lockfile dry-run install

核心测试最终标志：

```text
CHRIS_STUDIO_V2_2_CORE_TEST_SUITE_PASSED
```

### BLOCKED

```bash
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked
```

当前执行容器没有 Cargo/Rust 工具链，且 DNS 无法访问 rustup 下载地址，因此没有虚报 Rust 编译通过。Rust/Tauri 的真实编译仍由新 GitHub Actions 任务验证。

## 新增回归门禁

- 已出现正文后收到 `STREAM_READ_ERROR` 必须按成功结果收口。
- 非视觉模型请求 `capture` 必须被拒绝。
- 最近对话和历史页不得使用 `window.prompt` 重命名。
- 会话重命名必须写回本地存储。
- Rust 必须区分 Accessibility 和 Screen Recording。
- TextEdit 必须创建新空白文档。
- 输入和按键必须支持聚焦白名单目标应用。
- Computer Use 完成前必须满足目标动作证据。

## 仍需 GitHub Actions 验证

- `cargo check --locked`
- Apple Silicon Tauri build
- Intel Tauri build
- DMG/APP ZIP 生成
- Release 资源上传及校验
