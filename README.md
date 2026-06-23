# Mole Desktop

基于 [Tauri](https://tauri.app/) 开发的 Mac 系统优化工具，封装 [Mole CLI](https://github.com/tw93/mole) 提供图形界面。

![Mole Desktop](image/home.jpg)

## 功能

- **系统清理** - 清理缓存、日志和临时文件
- **应用卸载** - 卸载应用及其残留文件
- **磁盘分析** - 可视化磁盘使用情况
- **系统状态** - 实时系统健康监控
- **系统优化** - 刷新缓存和系统服务
- **操作历史** - 查看历史操作记录
- **项目清理** - 清理项目构建产物
- **安装包清理** - 查找并移除安装包文件
- **Touch ID** - 配置 Touch ID 用于 sudo
- **Shell 补全** - 设置 Shell 自动补全
- **环境变量** - 查看、新增、编辑、删除环境变量，支持持久化到 shell 配置文件
- **应用更新** - 更新 Mole 到最新版本
- **应用移除** - 从系统中移除 Mole

## 技术栈

- **后端**: Rust + Tauri 2.x
- **前端**: Vanilla HTML / CSS / JavaScript
- **CLI 引擎**: [Mole](https://github.com/tw93/mole)（已内置，无需额外安装）

## 开发

```bash
# 安装依赖
npm install

# 启动开发模式
npm run tauri dev

# 构建生产版本
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/`。

## 项目结构

```
mole-gui/
├── image/                      # 应用截图
├── src/                        # 前端资源
│   ├── index.html              # 主页面（侧边栏导航布局）
│   ├── main.js                 # 前端逻辑（流式输出 + 事件监听）
│   └── styles.css              # 样式文件（支持亮色/暗色主题）
├── src-tauri/                  # Rust 后端
│   ├── resources/bin/          # 内置 Mole CLI（构建时动态复制）
│   ├── src/
│   │   ├── main.rs             # 入口
│   │   ├── lib.rs              # Rust 后端（Mole CLI 封装）
│   │   └── build.rs            # 构建脚本（复制 Mole CLI）
│   ├── Cargo.toml
│   └── tauri.conf.json
├── .github/workflows/          # GitHub Actions 自动构建
├── package.json
└── CLAUDE.md                   # 项目详细文档
```

## 自动构建

项目配置了 GitHub Actions 工作流，支持自动构建和发布：

- **推送标签**（如 `v0.1.0`）时自动构建并发布到 GitHub Release
- **手动触发**时可选择是否创建 Release，安装包按 CPU 平台命名（如 `-aarch64`）

## 特性

- **内置 Mole** - 应用自带 Mole CLI，无需用户额外安装
- **按钮加载状态** - 操作时按钮显示 spinner 和加载文字
- **自定义对话框** - 原生风格的输入框和确认对话框
- **流式输出** - 实时显示命令执行进度，避免 UI 卡住
- **双主题** - 支持亮色和暗色主题切换
- **并发读取** - 使用双线程同时读取 stdout/stderr，避免死锁
- **环境变量持久化** - 支持写入 .zshrc / .bash_profile / .bashrc

## 关于 Mole CLI

本项目内置了 [Mole](https://github.com/tw93/mole) CLI 作为核心引擎。Mole 是一个开源的 Mac 系统优化工具，由 [@tw93](https://github.com/tw93) 开发。

**Mole 特性：**
- 单一二进制文件，集成 CleanMyMac、AppCleaner、DaisyDisk 等功能
- 深度清理缓存、日志、残留文件
- 智能卸载应用及其隐藏残留
- 磁盘使用可视化和分析
- 实时系统监控（CPU、GPU、内存、磁盘、网络）

**Mole 许可证：** [GPL v3](https://www.gnu.org/licenses/gpl-3.0.html)

## 许可证

本项目采用 [GPL v3](https://www.gnu.org/licenses/gpl-3.0.html) 许可证。

Copyright (c) 2024
