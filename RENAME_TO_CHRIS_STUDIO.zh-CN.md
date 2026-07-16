# 将项目正式改名为 Chris Studio

本版本已经把应用显示名称、macOS 安装包、Release 资源、菜单、README、更新页面和 GitHub 元数据改为 **Chris Studio**。

## 推荐的 GitHub 仓库名称

```text
chris-studio
```

操作路径：

```text
GitHub 仓库 → Settings → General → Repository name → chris-studio → Rename
```

GitHub 会把旧仓库网页、Issue、Wiki 以及旧的 clone/fetch/push 地址重定向到新名称；本地仓库仍建议更新 remote：

```bash
git remote set-url origin https://github.com/Chrisbetheking/chris-studio.git
```

## 为什么内部仍保留少量 tokenfence 标识

为了让现有用户升级后继续读取已经保存的 API Key、历史记录、权限和项目备份，v2.0.0 暂时保留以下兼容标识：

- macOS bundle identifier：`com.tokenfence.studio`
- Keychain service：`com.tokenfence.studio.provider`
- localStorage 迁移键：`tokenfence.*`
- 项目备份目录：`.tokenfence`
- Tauri 内部事件命名空间：`tokenfence://`

这些标识不会出现在主要产品界面中。现在直接修改它们会导致原有 Keychain 凭证、WebView 数据和 macOS 权限无法自动继承，因此本版本以“用户无感迁移”为优先。

## 发布顺序

1. 先把 GitHub 仓库改名为 `chris-studio`；
2. 上传本完整包中的全部内容；
3. 提交；
4. 运行 `Chris Studio macOS Builds and Release`；
5. 发布版本填写 `v2.0.0`；
6. 下载并安装新的 `Chris-Studio-macOS-*` 安装包。
