# TokenFence Studio v1.6.1 README 独立覆盖包

这个 ZIP 只包含 README 和故障排查文档，不包含应用代码。

## 包内文件

```text
README.md
README.zh-CN.md
docs/troubleshooting/TROUBLESHOOTING.md
docs/troubleshooting/TROUBLESHOOTING.zh-CN.md
```

## 上传方式

1. 解压本 ZIP。
2. 打开 `Chrisbetheking/tokenfence-studio` 仓库的 `main` 分支。
3. 点击 **Add file → Upload files**。
4. 将以下内容拖到仓库根目录：
   - `README.md`
   - `README.zh-CN.md`
   - `docs` 文件夹
5. 保留 `docs/troubleshooting/` 目录结构。
6. GitHub 提示同名文件时，确认覆盖旧 README。
7. 建议提交信息：

```text
docs: update bilingual README and troubleshooting guides for v1.6.1
```

## 建议上传顺序

先上传 `TokenFence_Studio_v1.6.1_macOS_Complete_Overwrite.zip` 中的代码补丁并完成一次构建，再上传本 README 包。这样 README 中描述的 macOS workflow、Keychain 和 v1.6.1 功能会与仓库代码一致。

## 上传后检查

- 仓库首页默认显示英文 README。
- 点击“简体中文”可以打开 `README.zh-CN.md`。
- 两份 README 都可以进入对应的故障排查文档。
- `docs/images/banner.png` 仍存在，否则 README 顶部横幅会无法显示。
- GitHub Actions 页面存在 `TokenFence macOS Builds`。
