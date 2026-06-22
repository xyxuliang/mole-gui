# Mole GUI

基于 [Tauri](https://tauri.app/) 开发的 Mac 系统优化工具，封装 [Mole CLI](https://github.com/tw93/mole) 提供图形界面。

![Mole GUI](image/home.jpg)

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
- **应用更新** - 更新 Mole 到最新版本
- **应用移除** - 从系统中移除 Mole
- **Shell 补全** - 设置 Shell 自动补全

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

## 项目结构

```
mole-gui/
├── image/
│   └── home.jpg          # 应用截图
├── src/
│   ├── index.html        # 主页面（侧边栏导航布局）
│   ├── main.js           # 前端逻辑（流式输出 + 事件监听）
│   └── styles.css        # 样式文件（支持亮色/暗色主题）
── src-tauri/
│   ├── resources/        # 内置 Mole CLI
│   ├── src/
│   │   ├── main.rs       # 入口
│   │   └── lib.rs        # Rust 后端（Mole CLI 封装）
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## 特性

- **内置 Mole** - 应用自带 Mole CLI，无需用户额外安装
- **流式输出** - 实时显示命令执行进度，避免 UI 卡住
- **双主题** - 支持亮色和暗色主题切换
- **并发读取** - 使用双线程同时读取 stdout/stderr，避免死锁
- **ANSI 清理** - 自动移除终端颜色转义序列
- **结构化列表** - 将 CLI 输出解析为分组列表展示

## 关于 Mole CLI

本项目内置了 [Mole](https://github.com/tw93/mole) CLI 作为核心引擎。Mole 是一个开源的 Mac 系统优化工具，由 [@tw93](https://github.com/tw93) 开发。

**Mole 特性：**
- 单一二进制文件，集成 CleanMyMac、AppCleaner、DaisyDisk 等功能
- 深度清理缓存、日志、残留文件
- 智能卸载应用及其隐藏残留
- 磁盘使用可视化和分析
- 实时系统监控（CPU、GPU、内存、磁盘、网络）

**Mole 许可证：** [GPL v3](https://www.gnu.org/licenses/gpl-3.0.html)

根据 GPL v3 许可证要求，本项目作为 Mole 的衍生作品，同样采用 GPL v3 许可证。

## 许可证

本项目采用 [GPL v3](https://www.gnu.org/licenses/gpl-3.0.html) 许可证。

Copyright (c) 2024

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
