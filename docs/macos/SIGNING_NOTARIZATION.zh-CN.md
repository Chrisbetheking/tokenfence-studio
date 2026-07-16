# Chris Studio macOS 签名、公证与“已损坏”处理

## 为什么 macOS 会显示“应用已损坏”

从浏览器下载的应用会带有 quarantine 标记。未使用有效 Developer ID 签名并通过 Apple 公证的桌面应用可能被 Gatekeeper 阻止，并显示“无法验证开发者”或“已损坏”。这通常不代表 DMG 数据损坏，而是发布身份和公证票据不完整。

真正面向普通用户发布时，应使用发布者自己的 Apple Developer Program 账号、Developer ID Application 证书和 Apple 公证凭证。源码包不能代替发布者创建这些身份材料。

## v2.0.0 工作流支持的 Secrets

在 GitHub 仓库进入：

```text
Settings → Secrets and variables → Actions → New repository secret
```

配置：

```text
APPLE_CERTIFICATE
APPLE_CERTIFICATE_PASSWORD
APPLE_ID
APPLE_PASSWORD
APPLE_TEAM_ID
```

含义：

- `APPLE_CERTIFICATE`：Developer ID Application `.p12` 文件的 Base64 文本；
- `APPLE_CERTIFICATE_PASSWORD`：导出 `.p12` 时设置的密码；
- `APPLE_ID`：Apple Developer 账号邮箱；
- `APPLE_PASSWORD`：Apple ID 的 App 专用密码，不是日常登录密码；
- `APPLE_TEAM_ID`：Apple Developer Team ID。

### 将 p12 转成 Base64

macOS 终端：

```bash
base64 -i DeveloperIDApplication.p12 | pbcopy
```

把剪贴板内容保存为 `APPLE_CERTIFICATE`。

## 发布流程

运行：

```text
Actions → Chris Studio macOS Builds and Release → Run workflow
```

参数：

```text
version: v2.0.0
create_release: true
make_latest: true
```

工作流会：

1. 导入临时 Keychain；
2. 查找 Developer ID 签名身份；
3. 设置 Tauri 所需的 Apple 环境变量；
4. 构建 Apple Silicon 和 Intel 应用；
5. 在凭证完整时执行签名与公证流程；
6. 生成 DMG、APP ZIP、SHA-256 和签名状态说明；
7. 发布 GitHub Release。

## 验证发布产物

下载 DMG 后执行：

```bash
codesign --verify --deep --strict --verbose=2 "/Applications/Chris Studio.app"
spctl --assess --type execute --verbose=4 "/Applications/Chris Studio.app"
stapler validate "/Applications/Chris Studio.app"
```

预期：

- `codesign` 验证成功；
- `spctl` 显示 accepted；
- `stapler` 能验证公证票据。

如果公证失败，请展开 GitHub Actions 的 `Build Tauri application` 日志，重点检查 Team ID、App 专用密码、证书类型和 Bundle Identifier。

## 没有 Apple Developer 账号时

工作流会生成 ad-hoc 签名社区包，并额外发布：

```text
Install-Chris-Studio-Apple-Silicon.command
Install-Chris-Studio-Intel.command
```

社区安装助手只会：

1. 把 Chris Studio 复制到 `/Applications`；
2. 清除该应用自身的 quarantine 属性；
3. 打开该应用。

它不会关闭全局 Gatekeeper，也不会修改其他应用。

使用步骤：

1. 打开 DMG；
2. 将 App 拖入 Applications；
3. 下载对应架构的 `.command`；
4. 在 Finder 中右键 `.command` → 打开；
5. 按终端提示完成安装。

也可以手动执行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Chris Studio.app"
open "/Applications/Chris Studio.app"
```

这只是社区构建的临时使用方式，不等同于正式签名和公证。

## 不要使用的做法

不要执行关闭整个 Gatekeeper 的命令，例如全局禁用安全检查。Chris Studio 的社区安装助手只处理自身应用路径。
