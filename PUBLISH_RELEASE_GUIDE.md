# TokenFence Studio v1.6.1 发布操作说明

## 为什么之前 Release 没更新

旧版 `tokenfence-macos.yml` 的手动运行只构建并上传 GitHub Actions Artifacts。发布任务带有“仅在 `refs/tags/` 触发时运行”的条件，因此直接点击 **Run workflow** 不会创建新 Release。

新版工作流已经修复：手动运行时可以填写版本号，并选择是否自动创建 Release。

## 必须上传的内容

请上传本包内全部文件，特别是：

```text
.github/workflows/tokenfence-macos.yml
README.md
README.zh-CN.md
docs/release/RELEASE_NOTES_v1.6.1.md
apps/desktop/
scripts/
```

注意：`.github` 是隐藏目录，不能漏传。

## 一次完成构建与发布

1. 打开仓库并确认文件已经提交到 `main`。
2. 打开 **Actions**。
3. 选择 **TokenFence macOS Builds and Release**。
4. 点击 **Run workflow**。
5. 设置：
   - Branch：`main`
   - version：`v1.6.1`
   - create_release：开启
   - make_latest：开启
   - build_universal：开启；如果只想先确保正式包发布，也可以关闭
6. 点击绿色 **Run workflow**。
7. 等待以下任务：
   - Prepare release metadata
   - Verify desktop UI and privacy boundary
   - macOS Apple-Silicon
   - macOS Intel
   - Create or update GitHub Release
8. 打开仓库 **Releases**，确认出现 `TokenFence Studio v1.6.1`。

## 发布成功后应包含

```text
TokenFence-Studio-macOS-Apple-Silicon.dmg
TokenFence-Studio-macOS-Apple-Silicon.app.zip
SHA256SUMS-Apple-Silicon.txt
TokenFence-Studio-macOS-Intel.dmg
TokenFence-Studio-macOS-Intel.app.zip
SHA256SUMS-Intel.txt
```

Universal 构建成功时还会出现：

```text
TokenFence-Studio-macOS-Universal.dmg
TokenFence-Studio-macOS-Universal.app.zip
SHA256SUMS-Universal.txt
```

## README 下载链接何时生效

README 使用 `releases/latest/download/...` 固定下载地址。只有在 v1.6.1 被标记为 Latest 且安装包成功附加后，链接才会生效。发布前显示 404 是正常的。

## 常见问题

### Actions 中找不到新工作流

通常是 `.github/workflows/tokenfence-macos.yml` 没有成功上传到默认分支。检查 GitHub 网页中的完整路径。

### 构建成功但 Release 任务被跳过

重新运行并确保 `create_release` 为开启状态。

### Release 已出现但下载链接 404

检查 Release 的 Assets 中是否存在与 README 完全相同的文件名，并确认该 Release 标记为 Latest。

### 已存在 v1.6.1

工作流会尝试更新同名 Release。若标签指向了错误提交，可先在 GitHub 的 Tags/Releases 页面删除错误的 v1.6.1 标签与 Release，再从 `main` 重新运行。
