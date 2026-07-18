# v2.2.0 Intel DMG 修复验证报告

## 已通过

- Bash 语法检查
- GitHub Actions YAML 解析
- macOS 打包工作流契约测试
- Tauri 只生成 `.app` 的静态检查
- 删除对 `target/release/bundle/dmg` 的依赖
- 自定义 `hdiutil` DMG 生成路径检查
- `arm64` / `x86_64` 架构门禁检查
- DMG 失败诊断和单次重试检查
- DMG 失败后 APP ZIP 回退检查
- ZIP 解压回环与逐文件 SHA-256

## 需要 Actions 验证

- Intel Runner 真实生成 `x86_64` APP
- Intel Runner 的 `hdiutil` 真实创建 DMG
- Apple Silicon Runner 真实生成 `arm64` APP
- Release 资源上传

当前环境不是 macOS，无法真实执行 Tauri macOS 打包、`hdiutil`、`codesign` 和 `notarytool`，因此没有将这些项目写成已通过。
