# Chris Studio v2.2.0 Intel DMG 修复补丁

Intel Runner 已成功编译 UI、Rust 和 `.app`，失败仅发生在 Tauri v1 自带的 `bundle_dmg.sh`。

本补丁改为：

- `tauri build --bundles app --ci`，只让 Tauri 生成 `.app`
- 使用自定义 `hdiutil` 脚本生成 DMG，不执行 Finder/AppleScript 布局
- Apple Silicon 校验 `arm64`，Intel 校验 `x86_64`
- DMG 创建失败自动诊断并重试一次
- 两次 DMG 失败后仍发布可安装的架构校验 `.app.zip`
- Developer ID、DMG 签名和可选公证流程继续保留

上传补丁中的 `.github` 和 `scripts` 到仓库根目录覆盖。

提交信息：

```text
fix: bypass Tauri DMG bundler for Intel releases
```

新建工作流：

```text
version: v2.2.0
create_release: true
make_latest: true
```
