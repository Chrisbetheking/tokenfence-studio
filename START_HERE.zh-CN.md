# Chris Studio v2.0.0：一次上传说明

## 先改 GitHub 仓库名

建议先进入 `Settings → General → Repository name`，把仓库从 `tokenfence-studio` 改成 `chris-studio`。旧仓库链接会由 GitHub 重定向，但本地 clone 仍建议更新 remote。详见 `RENAME_TO_CHRIS_STUDIO.zh-CN.md`。

这是完整仓库覆盖包，不需要逐个进入文件夹上传。

1. 解压 ZIP。
2. 在 Finder 按 `Command + Shift + .`，确认 `.github` 文件夹可见。
3. 打开解压后的 `Chris_Studio_v2.0.0_COMPLETE_ONE_UPLOAD` 文件夹。
4. `Command + A` 全选文件夹内部的全部内容，一次拖到 GitHub 仓库根目录的 **Add file → Upload files**。
5. 不要只上传 ZIP，也不要把外层目录本身嵌套进仓库。
6. 提交后新建一次工作流，不要 Re-run 旧任务：

```text
Actions → Chris Studio macOS Builds and Release → Run workflow
version: v2.0.0
create_release: true
make_latest: true
```

没有 Apple Developer ID 凭证时会生成社区包和安装助手；要彻底消除浏览器下载后的“已损坏/无法验证”提示，需要在仓库 Secrets 中配置 README 所列 Apple 签名与公证凭证。
