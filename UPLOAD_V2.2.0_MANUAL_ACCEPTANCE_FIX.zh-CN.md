# 上传与运行说明

1. 解压本 ZIP。
2. 将解压目录内部的 `apps` 拖到 GitHub 仓库根目录覆盖。
3. 本批不包含完整仓库、`node_modules`、`dist` 或 `target`。
4. 提交信息：

```text
fix: harden streaming rename and model computer use
```

5. 新建 GitHub Actions 工作流，不要对旧任务点 Re-run jobs：

```text
version: v2.2.0
create_release: true
make_latest: true
```

## 新安装包复测

### 流式结束

发送约 2000 字的长回答。正文生成完成后不得再追加：

```text
The provider stream ended before the response could be read.
```

### 会话重命名

- 鼠标移动到最近对话，点击铅笔图标；或双击会话标题。
- 输入新名称并按 Enter。
- 切换会话、重启应用后名称仍保留。

### 权限

Computer Use 需要两个独立权限：

1. 隐私与安全性 → 辅助功能
2. 隐私与安全性 → 屏幕与系统音频录制

修改权限后必须完全退出并重新打开 Chris Studio。

### TextEdit

目标：

```text
打开 TextEdit，新建空白文档，输入：Chris Studio Computer Use Test。完成后停止，不保存。
```

预期：直接出现空白文档，文字进入 TextEdit，而不是进入文件选择器或 Chris Studio 输入框；失败动作不能被模型标为完成。
