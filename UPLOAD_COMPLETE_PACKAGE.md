# Chris Studio v2.0.0 — 完整一次上传说明

## 先改 GitHub 仓库名

建议先进入 `Settings → General → Repository name`，把仓库从 `tokenfence-studio` 改成 `chris-studio`。旧仓库链接会由 GitHub 重定向，但本地 clone 仍建议更新 remote。详见 `RENAME_TO_CHRIS_STUDIO.zh-CN.md`。

这个压缩包以 GitHub 仓库根目录为内容根，已经包含 v2.0.0 桌面源码、隐藏的 `.github` 工作流、中英文 README、功能状态、签名/公证说明、故障排查和 Release Notes。

## 一次上传

1. 删除电脑上之前解压的 v1.7 临时目录，避免选错。
2. 解压 `Chris_Studio_v2.0.0_COMPLETE_ONE_UPLOAD.zip`。
3. Finder 按 `Command + Shift + .`，确认 `.github` 可见。
4. 打开 GitHub 仓库根目录。
5. 点击 `Add file → Upload files`。
6. 进入解压后的 `Chris_Studio_v2.0.0_COMPLETE_ONE_UPLOAD` 文件夹，`Command + A` 全选里面所有内容，一次拖入。
7. 不要上传 ZIP 本身，也不要把外层文件夹作为仓库子目录。

提交信息：

```text
feat: ship Chris Studio v2.0.0 safe agent workspace
```

## 发布 Mac 安装包

在新提交完成后，新建工作流运行，不要 Re-run 旧任务：

```text
GitHub → Actions → Chris Studio macOS Builds and Release → Run workflow
```

参数：

```text
version: v2.0.0
create_release: true
make_latest: true
```

## 成功顺序

```text
Verify desktop UI and privacy boundary
→ macOS Apple Silicon
   → Check native Rust backend
   → Build Tauri application
   → Package DMG and APP ZIP
→ macOS Intel
→ Create or update GitHub Release
```

## Apple 签名

未配置 Apple Developer Secrets 时会生成 ad-hoc 社区包和安装助手；要彻底消除普通用户的“已损坏/无法验证”提示，必须使用发布者自己的 Developer ID 与公证凭证。见 `docs/macos/SIGNING_NOTARIZATION.zh-CN.md`。
