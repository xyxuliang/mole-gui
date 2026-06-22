# Mole GUI

基于 [Mole](https://github.com/tw93/mole) CLI 的 macOS 桌面版图形界面，使用 Tauri 框架构建。

## 技术栈

- **后端**: Rust + Tauri 2.x
- **前端**: Vanilla HTML/CSS/JavaScript（无框架依赖）
- **CLI 引擎**: [Mole](https://github.com/tw93/mole)（Go 编写的 macOS 系统优化工具）
- **构建工具**: npm + Cargo

## 功能特性

### 已实现功能

| 功能 | 说明 | 对应 Mole 命令 |
|------|------|----------------|
| 系统清理 | 清理缓存、日志、临时文件，释放磁盘空间 | `mo clean` / `mo clean --dry-run` |
| 应用卸载 | 卸载应用及其残留文件 | `mo uninstall` / `mo uninstall --dry-run` |
| 磁盘分析 | 可视化磁盘使用情况，识别大文件 | `mo analyze` |
| 系统状态 | 实时系统健康监控（CPU/内存/存储） | `mo status` |
| 系统优化 | 刷新缓存和系统服务 | `mo optimize` |
| 操作历史 | 查看历史操作记录 | `mo history` |
| 项目清理 | 清理项目构建产物（node_modules、target 等） | `mo purge` / `mo purge --dry-run` |
| 安装包清理 | 查找并移除安装包文件（.dmg/.pkg 等） | `mo installer` |
| Touch ID 配置 | 配置 Touch ID 用于 sudo 认证 | `mo touchid` |
| 应用更新 | 更新 Mole 到最新版本 | `mo update` |
| 应用移除 | 从系统中移除 Mole | `mo remove` |

### 界面特性

- **现代化 UI 设计**: 采用 cc-switch 风格的侧边栏导航布局
- **卡片式信息展示**: 统计卡片和结果列表清晰展示数据
- **流畅动画效果**: 过渡动画和加载动画提升用户体验
- **双主题支持**: 支持亮色主题和暗色主题切换
- **实时流式输出**: 命令执行过程实时显示，避免 UI 卡顿
- **响应式设计**: 适配不同屏幕尺寸

## 项目结构

```
mole-gui/
├── src/                      # 前端资源
│   ├── index.html            # 主页面（侧边栏导航布局）
│   ├── styles.css            # 样式文件（支持亮色/暗色主题）
│   └── main.js               # 前端逻辑（功能切换、流式输出）
├── src-tauri/                # Rust 后端
│   ├── src/
│   │   ├── lib.rs            # 核心逻辑（Mole CLI 封装，11 个命令）
│   │   └── main.rs           # 入口文件
│   ├── Cargo.toml            # Rust 依赖配置
│   ├── tauri.conf.json       # Tauri 应用配置
│   └── icons/                # 应用图标
├── package.json              # npm 配置
└── CLAUDE.md                 # 项目文档
```

## 架构设计

### 后端架构

Rust 后端通过 `Command` 调用 Mole CLI，使用双线程并发读取 stdout/stderr，避免管道缓冲区死锁。

核心组件：
- `execute_mole_streaming()` - 流式命令执行引擎
- `strip_ansi_codes()` - ANSI 转义序列清理
- `spawn_blocking` - 将阻塞操作移至专用线程池，避免 UI 卡顿

事件机制：
- 使用 Tauri 的 `emit` 向前端发送实时输出事件
- 事件类型：`stdout`（标准输出）、`stderr`（标准错误）、`done`（执行完成）

已实现命令：
```rust
- get_version()       // 获取版本信息
- scan_cleanable()    // 扫描可清理项目（dry-run）
- clean()             // 执行系统清理
- scan_apps()         // 扫描可卸载应用（dry-run）
- uninstall()         // 卸载指定应用
- analyze()           // 分析磁盘使用情况
- status()            // 查看系统状态
- optimize()          // 优化系统
- purge()             // 清理项目构建产物
- history()           // 查看操作历史
- installer()         // 查找并移除安装包文件
- touchid()           // 配置 Touch ID
- update()            // 更新 Mole
- remove()            // 移除 Mole
- is_installed()      // 检查 Mole 是否已安装
```

### 前端架构

纯 Vanilla JS，无框架依赖，通过 `window.__TAURI__.core.invoke` 调用 Rust 命令。

核心组件：
- 侧边栏导航系统 - 功能切换（11 个功能面板）
- 流式输出处理 - 实时显示命令执行进度
- 加载状态管理 - 占位符/加载动画/结果展示
- 主题切换 - 支持亮色/暗色主题，自动保存偏好

功能配置：
```javascript
const features = {
  clean:      { title: '系统清理',   event: 'scan-output' },
  uninstall:  { title: '应用卸载',   event: 'uninstall-output' },
  analyze:    { title: '磁盘分析',   event: 'analyze-output' },
  status:     { title: '系统状态',   event: 'status-output' },
  optimize:   { title: '系统优化',   event: 'optimize-output' },
  history:    { title: '操作历史',   event: 'history-output' },
  purge:      { title: '项目清理',   event: 'purge-output' },
  installer:  { title: '安装包清理', event: 'installer-output' },
  touchid:    { title: 'Touch ID',   event: 'touchid-output' },
  update:     { title: '应用更新',   event: 'update-output' },
  remove:     { title: '应用移除',   event: 'remove-output' },
};
```

## 开发指南

### 环境要求

- macOS 10.15+
- Rust 1.70+
- Node.js 18+
- Mole CLI (`brew install tw93/tap/mole`)

### 开发模式

```bash
# 安装前端依赖
npm install

# 启动开发服务器（热重载）
npm run tauri dev
```

### 构建发布版

```bash
# 构建 macOS 应用包
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/`。

### 代码结构说明

**Rust 后端 (`src-tauri/src/lib.rs`)**:
- 所有命令函数使用 `#[tauri::command]` 注解
- 异步函数内部使用 `spawn_blocking` 执行阻塞操作
- 通过 `tauri::Emitter` 发送流式事件到前端
- 使用双线程并发读取 stdout/stderr，避免死锁

**前端 (`src/main.js`)**:
- `features` 对象定义所有功能配置（11 个功能）
- `executeWithStreaming()` 统一处理命令执行和流式输出
- `switchFeature()` 管理侧边栏导航和面板显示
- `toggleTheme()` 实现主题切换，自动保存偏好到 localStorage

**样式 (`src/styles.css`)**:
- 使用 CSS 变量定义主题颜色
- `:root` 定义暗色主题（默认）
- `[data-theme="light"]` 定义亮色主题
- 响应式设计适配移动端

## UI 设计规范

### 暗色主题（默认）

- **背景色**: 纯黑 (#0a0a0a)
- **侧边栏**: 深灰 (#0f0f0f)
- **卡片背景**: 深灰 (#1f1f1f)
- **主文字**: 白色 (#ffffff)
- **次要文字**: 浅灰 (#a0a0a0)
- **强调色**: 橙色 (#ff9500)

### 亮色主题

- **背景色**: 米白 (#f5f5f7)
- **侧边栏**: 浅灰 (#ffffff)
- **卡片背景**: 白色 (#ffffff)
- **主文字**: 深灰 (#1d1d1f)
- **次要文字**: 中灰 (#86868b)
- **强调色**: 橙色 (#ff9500)

### 通用设计

- **字体**: SF Pro Display / SF Mono
- **圆角**: 6px-16px 分级使用
- **动画**: 流畅的过渡效果（0.15s-0.4s）
- **阴影**: 多层阴影营造深度感

## 已知问题

- Mole CLI 路径硬编码为 `/opt/homebrew/bin/mo`，需适配其他安装路径
- 磁盘分析结果以纯文本展示，未实现可视化树形图
- 应用卸载未实现选择性操作（勾选要卸载的应用）

## 后续计划

1. 适配 Mole CLI 的多种安装路径（Homebrew、源码编译等）
2. 添加磁盘分析可视化（树形图/矩形树图）
3. 实现应用卸载的选择性操作（勾选要卸载的应用）
4. 添加系统托盘快捷操作
5. 支持自定义主题颜色
6. 添加操作确认对话框（清理、卸载等危险操作）
7. 实现操作进度条和预计时间显示

## 故障排查

### 命令执行卡住

- 检查 mole CLI 是否安装：`which mo`
- 确认命令是否需要交互式输入
- 查看控制台错误日志

### UI 无响应

- 检查是否在异步上下文中执行阻塞操作
- 确认使用了 `spawn_blocking`
- 查看是否有管道缓冲区满导致的死锁

### 主题切换无效

- 清除浏览器缓存
- 检查 localStorage 是否可写
- 重启应用

## 许可证

MIT License

## 相关链接

- [Mole CLI](https://github.com/tw93/mole)
- [Tauri 文档](https://tauri.app/)
- [Rust 文档](https://doc.rust-lang.org/)
