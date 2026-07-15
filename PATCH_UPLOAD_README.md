# TokenFence Studio v1.6.1 — Release Ready 完整覆盖补丁

本补丁同时包含：

- v1.6.1 macOS 桌面端代码；
- Apple Silicon、Intel 和可选 Universal 构建；
- 中英文 README；
- README 中的 GitHub Release 直接下载链接；
- 中英文故障排查；
- v1.6.1 Release Notes；
- 支持手动“一次完成构建与发布”的 GitHub Actions 工作流。

它是针对现有仓库的覆盖补丁，不包含仓库中所有历史文件。上传时不要删除补丁未包含的原文件。

## 上传方式

1. 解压 ZIP。
2. 打开 GitHub 仓库 `Chrisbetheking/tokenfence-studio` 的 `main` 分支。
3. 点击 **Add file → Upload files**。
4. 把解压后目录内部的全部文件拖到仓库根目录。
5. 必须保留以下目录层级：

```text
.github/workflows/
apps/desktop/
docs/
scripts/
```

6. 特别确认 `.github/workflows/tokenfence-macos.yml` 已出现在 GitHub 网页中。
7. 提交信息填写：

```text
feat: publish TokenFence Studio v1.6.1 for macOS
```

## 一次完成构建和 Release 更新

1. 打开 **Actions**。
2. 选择 **TokenFence macOS Builds and Release**。
3. 点击 **Run workflow**。
4. Branch 选择 `main`。
5. `version` 填写 `v1.6.1`。
6. 保持 `create_release` 和 `make_latest` 开启。
7. `build_universal` 可以开启；Universal 失败不会阻止 Apple Silicon 和 Intel 正式包发布。
8. 点击绿色 **Run workflow**。

成功后，Release 页面会出现 `TokenFence Studio v1.6.1`，并附带 `.dmg`、`.app.zip` 和 SHA-256 文件。README 中的 `releases/latest/download/...` 直接下载链接随后才会生效。

## 重要说明

只上传源码不会更新 Release；只在 Actions 中生成 Artifact 也不会更新 Release。必须让工作流中的 **Create or update GitHub Release** 任务成功完成。

完整操作见：`PUBLISH_RELEASE_GUIDE.md`。
