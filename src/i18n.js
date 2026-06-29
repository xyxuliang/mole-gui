// 国际化模块
// 支持中文、英文、俄语、日语、韩语

const i18n = {
  // 当前语言
  currentLang: 'zh',
  
  // 翻译字典
  translations: {
    zh: {
      // 应用标题
      appTitle: 'Mole Desktop',
      
      // 侧边栏分组
      groupSystem: '系统工具',
      groupMaintenance: '维护管理',
      groupSettings: '设置',
      
      // 功能名称
      clean: '系统清理',
      uninstall: '应用卸载',
      analyze: '磁盘分析',
      status: '系统状态',
      optimize: '系统优化',
      history: '操作历史',
      purge: '项目清理',
      installer: '安装包清理',
      touchid: 'Touch ID',
      update: '应用更新',
      remove: '应用移除',
      completion: 'Shell 补全',
      envs: '环境变量',
      settings: '设置',
      
      // 功能描述
      cleanDesc: '清理缓存、日志和临时文件',
      uninstallDesc: '卸载应用及其残留文件',
      analyzeDesc: '可视化磁盘使用情况',
      statusDesc: '实时系统健康监控',
      optimizeDesc: '刷新缓存和系统服务',
      historyDesc: '查看历史操作记录',
      purgeDesc: '清理项目构建产物',
      installerDesc: '查找并移除安装包文件',
      touchidDesc: '配置 Touch ID 用于 sudo',
      updateDesc: '更新 Mole 到最新版本',
      removeDesc: '从系统中移除 Mole',
      completionDesc: '设置 Shell 自动补全',
      envsDesc: '管理系统环境变量',
      settingsDesc: '应用设置和偏好',
      
      // 通用按钮
      scan: '扫描',
      clean: '立即清理',
      refresh: '刷新',
      add: '添加',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      close: '关闭',
      loading: '加载中...',
      scanning: '扫描中...',
      
      // 设置页面
      settingsTitle: '设置',
      language: '语言',
      languageDesc: '选择应用显示语言',
      theme: '主题',
      themeDesc: '选择应用主题',
      themeLight: '浅色',
      themeDark: '深色',
      themeAuto: '跟随系统',
      molePath: 'Mole 路径',
      molePathDesc: '自定义 Mole CLI 可执行文件路径（留空自动检测）',
      confirmBeforeAction: '操作前确认',
      confirmBeforeActionDesc: '执行清理、卸载等危险操作前显示确认对话框',
      autoRefresh: '自动刷新',
      autoRefreshDesc: '操作完成后自动刷新结果列表',
      
      // 状态文本
      engineReady: '引擎就绪',
      toggleTheme: '切换主题',
      
      // 系统清理
      cleanableItems: '可清理项目',
      freeableSpace: '可释放空间',
      categories: '分类数',
      whitelist: '白名单',
      cleanPlaceholder: '点击「扫描」查看可清理项目',
      cleanHint: '清理缓存、日志和临时文件，释放磁盘空间',
      
      // 应用卸载
      scanApps: '扫描应用',
      uninstallPlaceholder: '点击「扫描应用」查看已安装应用',
      uninstallHint: '卸载应用及其残留文件',
      
      // 磁盘分析
      startAnalyze: '开始分析',
      analyzePlaceholder: '点击「开始分析」查看磁盘使用情况',
      analyzeHint: '可视化磁盘使用情况，识别大文件',
      
      // 系统状态
      refreshStatus: '刷新状态',
      statusPlaceholder: '点击「刷新状态」查看系统信息',
      statusHint: '实时系统健康监控（CPU/内存/存储）',
      
      // 系统优化
      scanOptimize: '扫描优化项',
      runOptimize: '执行优化',
      stop: '停止',
      optimizePlaceholder: '点击「扫描优化项」查看可优化项目',
      optimizeHint: '刷新缓存和系统服务',
      
      // 操作历史
      refreshHistory: '刷新历史',
      jsonFormat: 'JSON 格式',
      exportCsv: '导出 CSV',
      exportJson: '导出 JSON',
      historyPlaceholder: '点击「刷新历史」查看操作记录',
      historyHint: '查看历史操作记录',
      
      // 项目清理
      scanProjects: '扫描项目',
      previewClean: '预览清理',
      cleanProjects: '清理项目',
      scanDirs: '扫描目录',
      purgePlaceholder: '点击「扫描项目」查看可清理项目',
      purgeHint: '清理项目构建产物（node_modules、target 等）',
      
      // 安装包清理
      scanInstallers: '扫描安装包',
      cleanInstallers: '清理安装包',
      selectAll: '全选',
      cancelSelectAll: '取消全选',
      installerPlaceholder: '点击「扫描安装包」查看可清理文件',
      installerHint: '查找并移除安装包文件（.dmg/.pkg 等）',
      
      // Touch ID
      configTouchid: '配置 Touch ID',
      enableTouchid: '启用 Touch ID',
      touchidPlaceholder: '点击「配置 Touch ID」进行设置',
      touchidHint: '配置 Touch ID 用于 sudo 认证',
      
      // 应用更新
      checkUpdate: '检查更新',
      updatePlaceholder: '点击「检查更新」查看可用更新',
      updateHint: '更新 Mole 到最新版本',
      
      // 应用移除
      removeApp: '移除应用',
      removePlaceholder: '点击「移除应用」进行移除',
      removeHint: '从系统中移除 Mole',
      
      // Shell 补全
      setupCompletion: '设置补全',
      completionPlaceholder: '点击「设置补全」进行配置',
      completionHint: '设置 Shell 自动补全',
      
      // 环境变量
      refreshList: '刷新列表',
      addEnv: '新增变量',
      envPlaceholder: '点击「刷新列表」查看环境变量',
      envHint: '查看、新增、编辑和删除环境变量',
      searchEnv: '搜索变量...',
      envName: '变量名',
      envValue: '变量值',
      envSource: '来源',
      noEnvs: '无环境变量',
      envPlaceholder: '点击「刷新列表」查看环境变量',
      envHint: '查看、新增、编辑和删除环境变量',
      
      // 状态消息
      scanComplete: '扫描完成',
      cleanComplete: '清理完成',
      operationComplete: '操作完成',
      operationFailed: '操作失败',
      
      // 确认对话框
      confirmClean: '确认要清理这些项目吗？',
      confirmUninstall: '确认要卸载此应用吗？',
      confirmDelete: '确认要删除吗？',
      
      // 提示消息
      inputVarName: '请输入变量名:',
      inputVarValue: '请输入变量值:',
      selectConfigFile: '选择配置文件 (.zshrc / .bash_profile / .bashrc):',
      added: '已添加',
      deleted: '已删除',
      addFailed: '添加失败',
      deleteFailed: '删除失败',
      
      // 白名单管理
      cleanWhitelist: '清理白名单',
      optimizeWhitelist: '优化白名单',
      addItem: '添加项目',
      loadFailed: '加载失败',
      whitelistEmpty: '白名单为空',
      confirmDeleteItem: '确定要从白名单中删除',
      addWhitelistItem: '添加白名单项目',
      inputWhitelistPath: '请输入要添加到白名单的路径或模式（如 ~/Library/Caches）',
      
      // 错误消息
      errorNotFound: '未找到',
      errorPermissionDenied: '权限不足',
      errorTimeout: '操作超时',
      errorNetwork: '网络错误',
      errorCommandFailed: '命令执行失败',
      errorUnknown: '未知错误',
      errorMoleNotInstalled: 'Mole CLI 未安装或路径配置错误',
      errorOperationFailed: '操作失败',
      errorRetrySuggestion: '请重试或检查系统权限',
      errorCheckPermissions: '请检查文件权限',
      errorCheckNetwork: '请检查网络连接',
      
      // 系统状态
      statusHealthScore: '健康评分',
      statusHost: '主机',
      statusSystem: '系统',
      statusUptime: '运行时间',
      statusProcesses: '进程数',
      statusHardwareInfo: '硬件信息',
      statusModel: '机型',
      statusProcessor: '处理器',
      statusMemory: '内存',
      statusDisk: '磁盘',
      statusOSVersion: '系统版本',
      statusRefreshRate: '刷新率',
      statusCPUUsage: 'CPU 使用率',
      statusTotalUsage: '总使用率',
      statusLoad1Min: '1分钟',
      statusLoad5Min: '5分钟',
      statusLoad15Min: '15分钟',
      statusMemoryUsage: '内存使用',
      statusUsedTotal: '已用 / 总计',
      statusAvailable: '可用',
      statusDiskUsage: '磁盘使用',
      statusName: '名称',
      statusCoreCount: '核心数',
      statusNetwork: '网络',
      statusNoData: '无数据',
      statusCannotParse: '无法解析状态数据',
      statusDiskSpace: '磁盘空间占用',
      statusCleanable: '可清理',
      statusOther: '其他',
      
      // 健康评分
      healthExcellent: '优秀',
      healthGood: '良好',
      healthFair: '一般',
      healthPoor: '较差',
      
      // 卸载相关
      uninstallConfirmTitle: '确认卸载',
      uninstallConfirmMessage: '确定要卸载',
      uninstalling: '卸载中...',
      uninstalled: '已卸载',
      uninstallFailed: '卸载失败',
      uninstallError: '卸载出错',
      batchUninstall: '批量卸载',
      batchUninstallConfirm: '批量卸载确认',
      batchUninstallComplete: '批量卸载完成',
      batchUninstallSuccess: '成功',
      batchUninstallFail: '失败',
      installedApps: '已安装应用',
      appsCount: '个应用吗？',
      count: '个',
      
      // 优化相关
      optimizeConfirm: '确定要执行选中的优化项吗？',
      noOptimizeItems: '无可优化项',
      
      // 安装包相关
      installerScanFailed: '扫描失败',
      installerScanFirst: '请先扫描安装包',
      installerSelectFirst: '请选择要删除的安装包',
      installerDeleteFailed: '删除失败',
      installerNotFound: '未找到安装包文件',
      installerFound: '找到安装包',
      installerCount: '个',
      installerTotalSize: '总大小',
      installerScan: '安装包扫描',
      
      // 历史记录相关
      historyLoadFailed: '获取历史记录失败',
      historyParseFailed: '解析历史记录失败',
      historyTime: '时间',
      historyOperation: '操作',
      historyDetails: '详情',
      historyResult: '结果',
      historyExportSuccess: '导出成功',
      historyExportFailed: '导出失败',
      
      // 环境变量相关
      envsNoData: '无环境变量',
      envsEdit: '编辑环境变量',
      envsUpdated: '已更新',
      envsUpdateFailed: '更新失败',
      envsDeleteConfirm: '确认删除',
      envsDeleteMessage: '确定要删除环境变量',
      envsDeleted: '已删除',
      envsDeleteFailed: '删除失败',
      envsLoading: '正在加载...',
      envsLoadFailed: '加载失败',
      envsInputName: '请输入变量名',
      envsInputValue: '请输入变量值',
      envsAdded: '已添加',
      envsAddFailed: '添加失败',
      
      // 更新相关
      updateChecking: '检查中...',
      updateNewVersion: '发现新版本',
      updateDownloading: '开始下载更新...',
      updateComplete: '更新安装完成，即将重启',
      updateLatest: '当前已是最新版本',
      updateDownloadConfirm: '是否立即下载安装？',
      updateContent: '更新内容：',
      none: '无',
      
      // 日志
      logsNoData: '暂无日志',
      logsLoadFailed: '加载失败',
      logsClearConfirm: '确认清空',
      logsClearMessage: '确定要清空所有日志吗？此操作不可恢复。',
      logsCleared: '日志已清空',
      logsPlaceholder: '点击「刷新日志」查看系统日志',
      logsHint: '查看应用运行日志，支持按级别筛选和搜索',
      
      // 定时清理相关
      scheduledCleanLoadFailed: '加载定时清理配置失败',
      scheduledCleanEnabled: '定时清理已开启',
      scheduledCleanDisabled: '定时清理已关闭',
      scheduledCleanSetFailed: '设置定时清理',
      scheduledCleanIntervalUpdated: '清理频率已更新',
      
      // 开发者工具
      devtoolsOpened: '开发者工具已打开',
      devtoolsOpenFailed: '打开开发者工具',
      
      // Mole 安装状态
      moleNotInstalled: 'Mole CLI 未安装，部分功能可能无法使用',
      moleCheckFailed: '检查 Mole 安装状态失败',
      
      // 通用提示
      processing: '处理中...',
      success: '成功',
      failed: '失败',
    },
    
    en: {
      // App title
      appTitle: 'Mole Desktop',
      
      // Sidebar groups
      groupSystem: 'System Tools',
      groupMaintenance: 'Maintenance',
      groupSettings: 'Settings',
      
      // Feature names
      clean: 'System Clean',
      uninstall: 'App Uninstall',
      analyze: 'Disk Analysis',
      status: 'System Status',
      optimize: 'System Optimize',
      history: 'Operation History',
      purge: 'Project Clean',
      installer: 'Installer Clean',
      touchid: 'Touch ID',
      update: 'App Update',
      remove: 'App Remove',
      completion: 'Shell Completion',
      envs: 'Environment Variables',
      settings: 'Settings',
      
      // Feature descriptions
      cleanDesc: 'Clean cache, logs and temp files',
      uninstallDesc: 'Uninstall apps and residual files',
      analyzeDesc: 'Visualize disk usage',
      statusDesc: 'Real-time system health monitor',
      optimizeDesc: 'Refresh cache and system services',
      historyDesc: 'View operation history',
      purgeDesc: 'Clean project build artifacts',
      installerDesc: 'Find and remove installer files',
      touchidDesc: 'Configure Touch ID for sudo',
      updateDesc: 'Update Mole to latest version',
      removeDesc: 'Remove Mole from system',
      completionDesc: 'Setup shell auto-completion',
      envsDesc: 'Manage system environment variables',
      settingsDesc: 'App settings and preferences',
      
      // Common buttons
      scan: 'Scan',
      clean: 'Clean Now',
      refresh: 'Refresh',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      loading: 'Loading...',
      scanning: 'Scanning...',
      
      // Settings page
      settingsTitle: 'Settings',
      language: 'Language',
      languageDesc: 'Select display language',
      theme: 'Theme',
      themeDesc: 'Select app theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeAuto: 'System',
      
      // Status text
      engineReady: 'Engine Ready',
      toggleTheme: 'Toggle Theme',
      
      // System clean
      cleanableItems: 'Cleanable Items',
      freeableSpace: 'Freeable Space',
      categories: 'Categories',
      whitelist: 'Whitelist',
      cleanPlaceholder: 'Click "Scan" to view cleanable items',
      cleanHint: 'Clean cache, logs and temp files to free disk space',
      
      // App uninstall
      scanApps: 'Scan Apps',
      uninstallPlaceholder: 'Click "Scan Apps" to view installed apps',
      uninstallHint: 'Uninstall apps and their residual files',
      
      // Disk analysis
      startAnalyze: 'Start Analysis',
      analyzePlaceholder: 'Click "Start Analysis" to view disk usage',
      analyzeHint: 'Visualize disk usage and identify large files',
      
      // System status
      refreshStatus: 'Refresh Status',
      statusPlaceholder: 'Click "Refresh Status" to view system info',
      statusHint: 'Real-time system health monitoring (CPU/Memory/Storage)',
      
      // System optimize
      scanOptimize: 'Scan Items',
      runOptimize: 'Run Optimize',
      stop: 'Stop',
      optimizePlaceholder: 'Click "Scan Items" to view optimizable items',
      optimizeHint: 'Refresh cache and system services',
      
      // Operation history
      refreshHistory: 'Refresh History',
      jsonFormat: 'JSON Format',
      exportCsv: 'Export CSV',
      exportJson: 'Export JSON',
      historyPlaceholder: 'Click "Refresh History" to view operation records',
      historyHint: 'View historical operation records',
      
      // Project clean
      scanProjects: 'Scan Projects',
      previewClean: 'Preview Clean',
      cleanProjects: 'Clean Projects',
      scanDirs: 'Scan Dirs',
      purgePlaceholder: 'Click "Scan Projects" to view cleanable items',
      purgeHint: 'Clean project build artifacts (node_modules, target, etc.)',
      
      // Installer cleanup
      scanInstallers: 'Scan Installers',
      cleanInstallers: 'Clean Installers',
      selectAll: 'Select All',
      cancelSelectAll: 'Cancel Selection',
      installerPlaceholder: 'Click "Scan Installers" to view cleanable files',
      installerHint: 'Find and remove installer files (.dmg/.pkg etc.)',
      
      // Touch ID
      configTouchid: 'Configure Touch ID',
      enableTouchid: 'Enable Touch ID',
      touchidPlaceholder: 'Click "Configure Touch ID" to set up',
      touchidHint: 'Configure Touch ID for sudo authentication',
      
      // App update
      checkUpdate: 'Check Update',
      updatePlaceholder: 'Click "Check Update" to view available updates',
      updateHint: 'Update Mole to the latest version',
      
      // App remove
      removeApp: 'Remove App',
      removePlaceholder: 'Click "Remove App" to remove',
      removeHint: 'Remove Mole from the system',
      
      // Shell completion
      setupCompletion: 'Setup Completion',
      completionPlaceholder: 'Click "Setup Completion" to configure',
      completionHint: 'Set up Shell auto-completion',
      
      // Environment variables
      refreshList: 'Refresh List',
      addEnv: 'Add Variable',
      searchEnv: 'Search variables...',
      envName: 'Name',
      envValue: 'Value',
      envSource: 'Source',
      noEnvs: 'No environment variables',
      envPlaceholder: 'Click "Refresh List" to view variables',
      envHint: 'View, add, edit and delete variables',
      
      // Status messages
      scanComplete: 'Scan Complete',
      cleanComplete: 'Clean Complete',
      operationComplete: 'Operation Complete',
      operationFailed: 'Operation Failed',
      
      // Confirm dialogs
      confirmClean: 'Are you sure to clean these items?',
      confirmUninstall: 'Are you sure to uninstall this app?',
      confirmDelete: 'Are you sure to delete?',
      
      // Prompt messages
      inputVarName: 'Enter variable name:',
      inputVarValue: 'Enter variable value:',
      selectConfigFile: 'Select config file (.zshrc / .bash_profile / .bashrc):',
      added: 'Added',
      deleted: 'Deleted',
      addFailed: 'Add failed',
      deleteFailed: 'Delete failed',
      
      // Whitelist management
      cleanWhitelist: 'Clean Whitelist',
      optimizeWhitelist: 'Optimize Whitelist',
      addItem: 'Add Item',
      loadFailed: 'Load failed',
      whitelistEmpty: 'Whitelist is empty',
      confirmDeleteItem: 'Are you sure to delete from whitelist',
      addWhitelistItem: 'Add Whitelist Item',
      inputWhitelistPath: 'Enter path or pattern to add to whitelist (e.g. ~/Library/Caches)',
      
      // Error messages
      errorNotFound: 'Not found',
      errorPermissionDenied: 'Permission denied',
      errorTimeout: 'Operation timeout',
      errorNetwork: 'Network error',
      errorCommandFailed: 'Command execution failed',
      errorUnknown: 'Unknown error',
      errorMoleNotInstalled: 'Mole CLI is not installed or path is misconfigured',
      errorOperationFailed: 'Operation failed',
      errorRetrySuggestion: 'Please retry or check system permissions',
      errorCheckPermissions: 'Please check file permissions',
      errorCheckNetwork: 'Please check network connection',
      
      // System status
      statusHealthScore: 'Health Score',
      statusHost: 'Host',
      statusSystem: 'System',
      statusUptime: 'Uptime',
      statusProcesses: 'Processes',
      statusHardwareInfo: 'Hardware Info',
      statusModel: 'Model',
      statusProcessor: 'Processor',
      statusMemory: 'Memory',
      statusDisk: 'Disk',
      statusOSVersion: 'OS Version',
      statusRefreshRate: 'Refresh Rate',
      statusCPUUsage: 'CPU Usage',
      statusTotalUsage: 'Total Usage',
      statusLoad1Min: '1 min',
      statusLoad5Min: '5 min',
      statusLoad15Min: '15 min',
      statusMemoryUsage: 'Memory Usage',
      statusUsedTotal: 'Used / Total',
      statusAvailable: 'Available',
      statusDiskUsage: 'Disk Usage',
      statusName: 'Name',
      statusCoreCount: 'Core Count',
      statusNetwork: 'Network',
      statusNoData: 'No data',
      statusCannotParse: 'Cannot parse status data',
      statusDiskSpace: 'Disk Space Usage',
      statusCleanable: 'Cleanable',
      statusOther: 'Other',
      
      // Health score
      healthExcellent: 'Excellent',
      healthGood: 'Good',
      healthFair: 'Fair',
      healthPoor: 'Poor',
      
      // Uninstall related
      uninstallConfirmTitle: 'Confirm Uninstall',
      uninstallConfirmMessage: 'Are you sure to uninstall',
      uninstalling: 'Uninstalling...',
      uninstalled: 'Uninstalled',
      uninstallFailed: 'Uninstall failed',
      uninstallError: 'Uninstall error',
      batchUninstall: 'Batch Uninstall',
      batchUninstallConfirm: 'Batch Uninstall Confirmation',
      batchUninstallComplete: 'Batch Uninstall Complete',
      batchUninstallSuccess: 'Success',
      batchUninstallFail: 'Failed',
      
      // Optimize related
      optimizeConfirm: 'Are you sure to run the selected optimizations?',
      noOptimizeItems: 'No optimizable items',
      
      // Installer related
      installerScanFailed: 'Scan failed',
      installerScanFirst: 'Please scan installers first',
      installerSelectFirst: 'Please select installers to delete',
      installerDeleteFailed: 'Delete failed',
      
      // History related
      historyLoadFailed: 'Failed to get history',
      historyParseFailed: 'Failed to parse history',
      historyTime: 'Time',
      historyOperation: 'Operation',
      historyDetails: 'Details',
      historyResult: 'Result',
      historyExportSuccess: 'Export successful',
      historyExportFailed: 'Export failed',
      
      // Environment variables related
      envsNoData: 'No environment variables',
      envsEdit: 'Edit environment variable',
      envsUpdated: 'Updated',
      envsUpdateFailed: 'Update failed',
      envsDeleteConfirm: 'Confirm Delete',
      envsDeleteMessage: 'Are you sure to delete environment variable',
      envsDeleted: 'Deleted',
      envsDeleteFailed: 'Delete failed',
      envsLoading: 'Loading...',
      envsLoadFailed: 'Load failed',
      envsInputName: 'Enter variable name',
      envsInputValue: 'Enter variable value',
      envsAdded: 'Added',
      envsAddFailed: 'Add failed',
      
      // Update related
      updateChecking: 'Checking...',
      updateNewVersion: 'New version found',
      updateDownloading: 'Starting download...',
      updateComplete: 'Update complete, restarting soon',
      updateLatest: 'Already the latest version',
      
      // Logs related
      logsNoData: 'No logs',
      logsLoadFailed: 'Load failed',
      logsClearConfirm: 'Confirm Clear',
      logsClearMessage: 'Are you sure to clear all logs? This action cannot be undone.',
      logsCleared: 'Logs cleared',
      
      // Scheduled clean related
      scheduledCleanLoadFailed: 'Failed to load scheduled clean config',
      scheduledCleanEnabled: 'Scheduled clean enabled',
      scheduledCleanDisabled: 'Scheduled clean disabled',
      scheduledCleanSetFailed: 'Set scheduled clean',
      scheduledCleanIntervalUpdated: 'Clean interval updated',
      
      // Developer tools
      devtoolsOpened: 'Developer tools opened',
      devtoolsOpenFailed: 'Open developer tools',
      
      // Mole installation status
      moleNotInstalled: 'Mole CLI is not installed, some features may not work',
      moleCheckFailed: 'Failed to check Mole installation',
      
      // Common prompts
      processing: 'Processing...',
      success: 'Success',
      failed: 'Failed',
    },
    
    ru: {
      // Заголовок приложения
      appTitle: 'Mole Desktop',
      
      // Группы боковой панели
      groupSystem: 'Системные инструменты',
      groupMaintenance: 'Обслуживание',
      groupSettings: 'Настройки',
      
      // Названия функций
      clean: 'Очистка системы',
      uninstall: 'Удаление приложений',
      analyze: 'Анализ диска',
      status: 'Состояние системы',
      optimize: 'Оптимизация',
      history: 'История операций',
      purge: 'Очистка проектов',
      installer: 'Очистка установщиков',
      touchid: 'Touch ID',
      update: 'Обновление',
      remove: 'Удаление приложения',
      completion: 'Автодополнение Shell',
      envs: 'Переменные среды',
      settings: 'Настройки',
      
      // Описания функций
      cleanDesc: 'Очистка кэша, логов и временных файлов',
      uninstallDesc: 'Удаление приложений и остаточных файлов',
      analyzeDesc: 'Визуализация использования диска',
      statusDesc: 'Мониторинг состояния системы',
      optimizeDesc: 'Обновление кэша и системных служб',
      historyDesc: 'Просмотр истории операций',
      purgeDesc: 'Очистка артефактов сборки проектов',
      installerDesc: 'Поиск и удаление установочных файлов',
      touchidDesc: 'Настройка Touch ID для sudo',
      updateDesc: 'Обновление Mole до последней версии',
      removeDesc: 'Удаление Mole из системы',
      completionDesc: 'Настройка автодополнения shell',
      envsDesc: 'Управление переменными среды',
      settingsDesc: 'Настройки приложения',
      
      // Общие кнопки
      scan: 'Сканировать',
      clean: 'Очистить',
      refresh: 'Обновить',
      add: 'Добавить',
      edit: 'Изменить',
      delete: 'Удалить',
      save: 'Сохранить',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      close: 'Закрыть',
      loading: 'Загрузка...',
      scanning: 'Сканирование...',
      
      // Страница настроек
      settingsTitle: 'Настройки',
      language: 'Язык',
      languageDesc: 'Выберите язык интерфейса',
      theme: 'Тема',
      themeDesc: 'Выберите тему приложения',
      themeLight: 'Светлая',
      themeDark: 'Тёмная',
      themeAuto: 'Системная',
      
      // Текст состояния
      engineReady: 'Движок готов',
      toggleTheme: 'Переключить тему',
      
      // Очистка системы
      cleanableItems: 'Элементы для очистки',
      freeableSpace: 'Освободить место',
      categories: 'Категории',
      whitelist: 'Белый список',
      cleanPlaceholder: 'Нажмите «Сканировать» для просмотра элементов',
      cleanHint: 'Очистка кэша, логов и временных файлов для освобождения места',
      
      // Удаление приложений
      scanApps: 'Сканировать приложения',
      uninstallPlaceholder: 'Нажмите «Сканировать приложения» для просмотра',
      uninstallHint: 'Удаление приложений и их остаточных файлов',
      
      // Анализ диска
      startAnalyze: 'Начать анализ',
      analyzePlaceholder: 'Нажмите «Начать анализ» для просмотра использования диска',
      analyzeHint: 'Визуализация использования диска и поиск больших файлов',
      
      // Состояние системы
      refreshStatus: 'Обновить состояние',
      statusPlaceholder: 'Нажмите «Обновить состояние» для просмотра информации',
      statusHint: 'Мониторинг состояния системы (CPU/Память/Хранилище)',
      
      // Оптимизация
      scanOptimize: 'Сканировать',
      runOptimize: 'Выполнить',
      stop: 'Стоп',
      optimizePlaceholder: 'Нажмите «Сканировать» для просмотра элементов',
      optimizeHint: 'Обновление кэша и системных служб',
      
      // История операций
      refreshHistory: 'Обновить историю',
      jsonFormat: 'Формат JSON',
      exportCsv: 'Экспорт CSV',
      exportJson: 'Экспорт JSON',
      historyPlaceholder: 'Нажмите «Обновить историю» для просмотра записей',
      historyHint: 'Просмотр истории операций',
      
      // Очистка проектов
      scanProjects: 'Сканировать проекты',
      previewClean: 'Предпросмотр',
      cleanProjects: 'Очистить проекты',
      scanDirs: 'Сканировать папки',
      purgePlaceholder: 'Нажмите «Сканировать проекты» для просмотра элементов',
      purgeHint: 'Очистка артефактов сборки (node_modules, target и т.д.)',
      
      // Очистка установщиков
      scanInstallers: 'Сканировать установщики',
      cleanInstallers: 'Очистить установщики',
      selectAll: 'Выбрать все',
      cancelSelectAll: 'Отменить выбор',
      installerPlaceholder: 'Нажмите «Сканировать установщики» для просмотра файлов',
      installerHint: 'Поиск и удаление установочных файлов (.dmg/.pkg)',
      
      // Touch ID
      configTouchid: 'Настроить Touch ID',
      enableTouchid: 'Включить Touch ID',
      touchidPlaceholder: 'Нажмите «Настроить Touch ID» для настройки',
      touchidHint: 'Настройка Touch ID для аутентификации sudo',
      
      // Обновление
      checkUpdate: 'Проверить обновления',
      updatePlaceholder: 'Нажмите «Проверить обновления» для просмотра',
      updateHint: 'Обновление Mole до последней версии',
      
      // Удаление приложения
      removeApp: 'Удалить приложение',
      removePlaceholder: 'Нажмите «Удалить приложение» для удаления',
      removeHint: 'Удаление Mole из системы',
      
      // Автодополнение Shell
      setupCompletion: 'Настроить автодополнение',
      completionPlaceholder: 'Нажмите «Настроить автодополнение» для настройки',
      completionHint: 'Настройка автодополнения Shell',
      
      // Переменные среды
      refreshList: 'Обновить список',
      addEnv: 'Добавить переменную',
      searchEnv: 'Поиск переменных...',
      envName: 'Имя',
      envValue: 'Значение',
      envSource: 'Источник',
      noEnvs: 'Нет переменных среды',
      envPlaceholder: 'Нажмите «Обновить список» для просмотра',
      envHint: 'Просмотр, добавление, изменение и удаление переменных',
      
      // Сообщения состояния
      scanComplete: 'Сканирование завершено',
      cleanComplete: 'Очистка завершена',
      operationComplete: 'Операция завершена',
      operationFailed: 'Ошибка операции',
      
      // Диалоги подтверждения
      confirmClean: 'Вы уверены, что хотите очистить эти элементы?',
      confirmUninstall: 'Вы уверены, что хотите удалить это приложение?',
      confirmDelete: 'Вы уверены, что хотите удалить?',
      
      // Сообщения подсказок
      inputVarName: 'Введите имя переменной:',
      inputVarValue: 'Введите значение переменной:',
      selectConfigFile: 'Выберите файл конфигурации (.zshrc / .bash_profile / .bashrc):',
      added: 'Добавлено',
      deleted: 'Удалено',
      addFailed: 'Ошибка добавления',
      deleteFailed: 'Ошибка удаления',
      
      // Управление белым списком
      cleanWhitelist: 'Белый список очистки',
      optimizeWhitelist: 'Белый список оптимизации',
      addItem: 'Добавить элемент',
      loadFailed: 'Ошибка загрузки',
      whitelistEmpty: 'Белый список пуст',
      confirmDeleteItem: 'Вы уверены, что хотите удалить из белого списка',
      addWhitelistItem: 'Добавить элемент в белый список',
      inputWhitelistPath: 'Введите путь или шаблон для добавления в белый список (например, ~/Library/Caches)',
      
      // Сообщения об ошибках
      errorNotFound: 'Не найдено',
      errorPermissionDenied: 'Доступ запрещен',
      errorTimeout: 'Превышено время ожидания',
      errorNetwork: 'Ошибка сети',
      errorCommandFailed: 'Ошибка выполнения команды',
      errorUnknown: 'Неизвестная ошибка',
      errorMoleNotInstalled: 'Mole CLI не установлен или путь настроен неправильно',
      errorOperationFailed: 'Операция не удалась',
      errorRetrySuggestion: 'Повторите попытку или проверьте системные разрешения',
      errorCheckPermissions: 'Проверьте разрешения файла',
      errorCheckNetwork: 'Проверьте подключение к сети',
      
      // Состояние системы
      statusHealthScore: 'Оценка здоровья',
      statusHost: 'Хост',
      statusSystem: 'Система',
      statusUptime: 'Время работы',
      statusProcesses: 'Процессы',
      statusHardwareInfo: 'Информация об оборудовании',
      statusModel: 'Модель',
      statusProcessor: 'Процессор',
      statusMemory: 'Память',
      statusDisk: 'Диск',
      statusOSVersion: 'Версия ОС',
      statusRefreshRate: 'Частота обновления',
      statusCPUUsage: 'Использование ЦП',
      statusTotalUsage: 'Общее использование',
      statusLoad1Min: '1 мин',
      statusLoad5Min: '5 мин',
      statusLoad15Min: '15 мин',
      statusMemoryUsage: 'Использование памяти',
      statusUsedTotal: 'Использовано / Всего',
      statusAvailable: 'Доступно',
      statusDiskUsage: 'Использование диска',
      statusName: 'Имя',
      statusCoreCount: 'Количество ядер',
      statusNetwork: 'Сеть',
      statusNoData: 'Нет данных',
      statusCannotParse: 'Невозможно разобрать данные состояния',
      statusDiskSpace: 'Использование дискового пространства',
      statusCleanable: 'Можно очистить',
      statusOther: 'Другое',
      
      // Оценка здоровья
      healthExcellent: 'Отлично',
      healthGood: 'Хорошо',
      healthFair: 'Удовлетворительно',
      healthPoor: 'Плохо',
      
      // Удаление приложений
      uninstallConfirmTitle: 'Подтвердить удаление',
      uninstallConfirmMessage: 'Вы уверены, что хотите удалить',
      uninstalling: 'Удаление...',
      uninstalled: 'Удалено',
      uninstallFailed: 'Ошибка удаления',
      uninstallError: 'Ошибка удаления',
      batchUninstall: 'Массовое удаление',
      batchUninstallConfirm: 'Подтверждение массового удаления',
      batchUninstallComplete: 'Массовое удаление завершено',
      batchUninstallSuccess: 'Успешно',
      batchUninstallFail: 'Не удалось',
      
      // Оптимизация
      optimizeConfirm: 'Вы уверены, что хотите выполнить выбранные оптимизации?',
      noOptimizeItems: 'Нет оптимизируемых элементов',
      
      // Установщики
      installerScanFailed: 'Ошибка сканирования',
      installerScanFirst: 'Сначала просканируйте установщики',
      installerSelectFirst: 'Выберите установщики для удаления',
      installerDeleteFailed: 'Ошибка удаления',
      
      // История
      historyLoadFailed: 'Не удалось получить историю',
      historyParseFailed: 'Не удалось разобрать историю',
      historyTime: 'Время',
      historyOperation: 'Операция',
      historyDetails: 'Детали',
      historyResult: 'Результат',
      historyExportSuccess: 'Экспорт успешен',
      historyExportFailed: 'Ошибка экспорта',
      
      // Переменные среды
      envsNoData: 'Нет переменных среды',
      envsEdit: 'Редактировать переменную среды',
      envsUpdated: 'Обновлено',
      envsUpdateFailed: 'Ошибка обновления',
      envsDeleteConfirm: 'Подтвердить удаление',
      envsDeleteMessage: 'Вы уверены, что хотите удалить переменную среды',
      envsDeleted: 'Удалено',
      envsDeleteFailed: 'Ошибка удаления',
      envsLoading: 'Загрузка...',
      envsLoadFailed: 'Ошибка загрузки',
      envsInputName: 'Введите имя переменной',
      envsInputValue: 'Введите значение переменной',
      envsAdded: 'Добавлено',
      envsAddFailed: 'Ошибка добавления',
      
      // Обновление
      updateChecking: 'Проверка...',
      updateNewVersion: 'Найдена новая версия',
      updateDownloading: 'Начало загрузки...',
      updateComplete: 'Обновление завершено, скоро перезапуск',
      updateLatest: 'Уже последняя версия',
      
      // Логи
      logsNoData: 'Нет логов',
      logsLoadFailed: 'Ошибка загрузки',
      logsClearConfirm: 'Подтвердить очистку',
      logsClearMessage: 'Вы уверены, что хотите очистить все логи? Это действие нельзя отменить.',
      logsCleared: 'Логи очищены',
      
      // Запланированная очистка
      scheduledCleanLoadFailed: 'Не удалось загрузить конфигурацию запланированной очистки',
      scheduledCleanEnabled: 'Запланированная очистка включена',
      scheduledCleanDisabled: 'Запланированная очистка отключена',
      scheduledCleanSetFailed: 'Установить запланированную очистку',
      scheduledCleanIntervalUpdated: 'Интервал очистки обновлен',
      
      // Инструменты разработчика
      devtoolsOpened: 'Инструменты разработчика открыты',
      devtoolsOpenFailed: 'Открыть инструменты разработчика',
      
      // Статус установки Mole
      moleNotInstalled: 'Mole CLI не установлен, некоторые функции могут не работать',
      moleCheckFailed: 'Не удалось проверить установку Mole',
      
      // Общие подсказки
      processing: 'Обработка...',
      success: 'Успешно',
      failed: 'Не удалось',
    },
    
    ja: {
      // アプリタイトル
      appTitle: 'Mole Desktop',
      
      // サイドバーグループ
      groupSystem: 'システムツール',
      groupMaintenance: 'メンテナンス',
      groupSettings: '設定',
      
      // 機能名
      clean: 'システムクリーン',
      uninstall: 'アプリアンインストール',
      analyze: 'ディスク分析',
      status: 'システム状態',
      optimize: 'システム最適化',
      history: '操作履歴',
      purge: 'プロジェクトクリーン',
      installer: 'インストーラークリーン',
      touchid: 'Touch ID',
      update: 'アプリ更新',
      remove: 'アプリ削除',
      completion: 'Shell 補完',
      envs: '環境変数',
      settings: '設定',
      
      // 機能説明
      cleanDesc: 'キャッシュ、ログ、一時ファイルをクリーン',
      uninstallDesc: 'アプリと残存ファイルをアンインストール',
      analyzeDesc: 'ディスク使用状況を可視化',
      statusDesc: 'リアルタイムシステムヘルスモニター',
      optimizeDesc: 'キャッシュとシステムサービスをリフレッシュ',
      historyDesc: '操作履歴を表示',
      purgeDesc: 'プロジェクトビルド成果物をクリーン',
      installerDesc: 'インストーラーファイルを検索・削除',
      touchidDesc: 'sudo 用の Touch ID を設定',
      updateDesc: 'Mole を最新バージョンに更新',
      removeDesc: 'システムから Mole を削除',
      completionDesc: 'シェル自動補完を設定',
      envsDesc: 'システム環境変数を管理',
      settingsDesc: 'アプリ設定と環境設定',
      
      // 共通ボタン
      scan: 'スキャン',
      clean: '今すぐクリーン',
      refresh: '更新',
      add: '追加',
      edit: '編集',
      delete: '削除',
      save: '保存',
      cancel: 'キャンセル',
      confirm: '確認',
      close: '閉じる',
      loading: '読み込み中...',
      scanning: 'スキャン中...',
      
      // 設定ページ
      settingsTitle: '設定',
      language: '言語',
      languageDesc: '表示言語を選択',
      theme: 'テーマ',
      themeDesc: 'アプリテーマを選択',
      themeLight: 'ライト',
      themeDark: 'ダーク',
      themeAuto: 'システム',
      
      // ステータステキスト
      engineReady: 'エンジン準備完了',
      toggleTheme: 'テーマ切替',
      
      // システムクリーン
      cleanableItems: 'クリーン可能な項目',
      freeableSpace: '解放可能な容量',
      categories: 'カテゴリ',
      whitelist: 'ホワイトリスト',
      cleanPlaceholder: '「スキャン」をクリックして項目を表示',
      cleanHint: 'キャッシュ、ログ、一時ファイルをクリーンしてディスク容量を解放',
      
      // アプリアンインストール
      scanApps: 'アプリをスキャン',
      uninstallPlaceholder: '「アプリをスキャン」をクリックしてインストール済みアプリを表示',
      uninstallHint: 'アプリとその残存ファイルをアンインストール',
      
      // ディスク分析
      startAnalyze: '分析開始',
      analyzePlaceholder: '「分析開始」をクリックしてディスク使用状況を表示',
      analyzeHint: 'ディスク使用状況を可視化し、大きなファイルを特定',
      
      // システム状態
      refreshStatus: '状態を更新',
      statusPlaceholder: '「状態を更新」をクリックしてシステム情報を表示',
      statusHint: 'リアルタイムシステムヘルスモニター（CPU/メモリ/ストレージ）',
      
      // システム最適化
      scanOptimize: '項目をスキャン',
      runOptimize: '最適化実行',
      stop: '停止',
      optimizePlaceholder: '「項目をスキャン」をクリックして最適化可能な項目を表示',
      optimizeHint: 'キャッシュとシステムサービスをリフレッシュ',
      
      // 操作履歴
      refreshHistory: '履歴を更新',
      jsonFormat: 'JSON 形式',
      exportCsv: 'CSV エクスポート',
      exportJson: 'JSON エクスポート',
      historyPlaceholder: '「履歴を更新」をクリックして操作記録を表示',
      historyHint: '操作履歴を表示',
      
      // プロジェクトクリーン
      scanProjects: 'プロジェクトをスキャン',
      previewClean: 'プレビュー',
      cleanProjects: 'プロジェクトをクリーン',
      scanDirs: 'ディレクトリをスキャン',
      purgePlaceholder: '「プロジェクトをスキャン」をクリックしてクリーン可能な項目を表示',
      purgeHint: 'プロジェクトビルド成果物をクリーン（node_modules、target など）',
      
      // インストーラークリーン
      scanInstallers: 'インストーラーをスキャン',
      cleanInstallers: 'インストーラーをクリーン',
      selectAll: 'すべて選択',
      cancelSelectAll: '選択を解除',
      installerPlaceholder: '「インストーラーをスキャン」をクリックしてファイルを表示',
      installerHint: 'インストーラーファイルを検索・削除（.dmg/.pkg など）',
      
      // Touch ID
      configTouchid: 'Touch ID を設定',
      enableTouchid: 'Touch ID を有効化',
      touchidPlaceholder: '「Touch ID を設定」をクリックして設定',
      touchidHint: 'sudo 認証用の Touch ID を設定',
      
      // アプリ更新
      checkUpdate: '更新を確認',
      updatePlaceholder: '「更新を確認」をクリックして利用可能な更新を表示',
      updateHint: 'Mole を最新バージョンに更新',
      
      // アプリ削除
      removeApp: 'アプリを削除',
      removePlaceholder: '「アプリを削除」をクリックして削除',
      removeHint: 'システムから Mole を削除',
      
      // Shell 補完
      setupCompletion: '補完を設定',
      completionPlaceholder: '「補完を設定」をクリックして設定',
      completionHint: 'Shell 自動補完を設定',
      
      // 環境変数
      refreshList: 'リストを更新',
      addEnv: '変数を追加',
      searchEnv: '変数を検索...',
      envName: '名前',
      envValue: '値',
      envSource: 'ソース',
      noEnvs: '環境変数なし',
      envPlaceholder: '「リストを更新」をクリックして変数を表示',
      envHint: '変数の表示、追加、編集、削除',
      
      // ステータスメッセージ
      scanComplete: 'スキャン完了',
      cleanComplete: 'クリーン完了',
      operationComplete: '操作完了',
      operationFailed: '操作失敗',
      
      // 確認ダイアログ
      confirmClean: 'これらの項目をクリーンしますか？',
      confirmUninstall: 'このアプリをアンインストールしますか？',
      confirmDelete: '削除しますか？',
      
      // プロンプトメッセージ
      inputVarName: '変数名を入力:',
      inputVarValue: '変数値を入力:',
      selectConfigFile: '設定ファイルを選択 (.zshrc / .bash_profile / .bashrc):',
      added: '追加しました',
      deleted: '削除しました',
      addFailed: '追加に失敗',
      deleteFailed: '削除に失敗',
      
      // ホワイトリスト管理
      cleanWhitelist: 'クリーンホワイトリスト',
      optimizeWhitelist: '最適化ホワイトリスト',
      addItem: '項目を追加',
      loadFailed: '読み込み失敗',
      whitelistEmpty: 'ホワイトリストは空です',
      confirmDeleteItem: 'ホワイトリストから削除しますか',
      addWhitelistItem: 'ホワイトリスト項目を追加',
      inputWhitelistPath: 'ホワイトリストに追加するパスまたはパターンを入力 (例: ~/Library/Caches)',
      
      // エラーメッセージ
      errorNotFound: '見つかりません',
      errorPermissionDenied: '権限がありません',
      errorTimeout: '操作がタイムアウトしました',
      errorNetwork: 'ネットワークエラー',
      errorCommandFailed: 'コマンドの実行に失敗しました',
      errorUnknown: '不明なエラー',
      errorMoleNotInstalled: 'Mole CLI がインストールされていないか、パスが正しく設定されていません',
      errorOperationFailed: '操作に失敗しました',
      errorRetrySuggestion: '再試行するか、システム権限を確認してください',
      errorCheckPermissions: 'ファイル権限を確認してください',
      errorCheckNetwork: 'ネットワーク接続を確認してください',
      
      // システム状態
      statusHealthScore: '健康スコア',
      statusHost: 'ホスト',
      statusSystem: 'システム',
      statusUptime: '稼働時間',
      statusProcesses: 'プロセス数',
      statusHardwareInfo: 'ハードウェア情報',
      statusModel: 'モデル',
      statusProcessor: 'プロセッサ',
      statusMemory: 'メモリ',
      statusDisk: 'ディスク',
      statusOSVersion: 'OS バージョン',
      statusRefreshRate: 'リフレッシュレート',
      statusCPUUsage: 'CPU 使用率',
      statusTotalUsage: '合計使用率',
      statusLoad1Min: '1分',
      statusLoad5Min: '5分',
      statusLoad15Min: '15分',
      statusMemoryUsage: 'メモリ使用',
      statusUsedTotal: '使用済み / 合計',
      statusAvailable: '利用可能',
      statusDiskUsage: 'ディスク使用',
      statusName: '名前',
      statusCoreCount: 'コア数',
      statusNetwork: 'ネットワーク',
      statusNoData: 'データなし',
      statusCannotParse: '状態データを解析できません',
      statusDiskSpace: 'ディスクスペース使用量',
      statusCleanable: 'クリーン可能',
      statusOther: 'その他',
      
      // 健康スコア
      healthExcellent: '優秀',
      healthGood: '良好',
      healthFair: '普通',
      healthPoor: '不良',
      
      // アンインストール関連
      uninstallConfirmTitle: 'アンインストールの確認',
      uninstallConfirmMessage: 'アンインストールしてもよろしいですか',
      uninstalling: 'アンインストール中...',
      uninstalled: 'アンインストール済み',
      uninstallFailed: 'アンインストールに失敗',
      uninstallError: 'アンインストールエラー',
      batchUninstall: '一括アンインストール',
      batchUninstallConfirm: '一括アンインストールの確認',
      batchUninstallComplete: '一括アンインストール完了',
      batchUninstallSuccess: '成功',
      batchUninstallFail: '失敗',
      
      // 最適化関連
      optimizeConfirm: '選択した最適化を実行してもよろしいですか？',
      noOptimizeItems: '最適化可能な項目がありません',
      
      // インストーラー関連
      installerScanFailed: 'スキャンに失敗',
      installerScanFirst: '先にインストーラーをスキャンしてください',
      installerSelectFirst: '削除するインストーラーを選択してください',
      installerDeleteFailed: '削除に失敗',
      
      // 履歴関連
      historyLoadFailed: '履歴の取得に失敗',
      historyParseFailed: '履歴の解析に失敗',
      historyTime: '時間',
      historyOperation: '操作',
      historyDetails: '詳細',
      historyResult: '結果',
      historyExportSuccess: 'エクスポート成功',
      historyExportFailed: 'エクスポート失敗',
      
      // 環境変数関連
      envsNoData: '環境変数なし',
      envsEdit: '環境変数を編集',
      envsUpdated: '更新しました',
      envsUpdateFailed: '更新に失敗',
      envsDeleteConfirm: '削除の確認',
      envsDeleteMessage: '環境変数を削除してもよろしいですか',
      envsDeleted: '削除しました',
      envsDeleteFailed: '削除に失敗',
      envsLoading: '読み込み中...',
      envsLoadFailed: '読み込みに失敗',
      envsInputName: '変数名を入力',
      envsInputValue: '変数値を入力',
      envsAdded: '追加しました',
      envsAddFailed: '追加に失敗',
      
      // アップデート関連
      updateChecking: '確認中...',
      updateNewVersion: '新しいバージョンが見つかりました',
      updateDownloading: 'ダウンロード開始...',
      updateComplete: 'アップデート完了、まもなく再起動します',
      updateLatest: 'すでに最新バージョンです',
      
      // ログ関連
      logsNoData: 'ログなし',
      logsLoadFailed: '読み込みに失敗',
      logsClearConfirm: 'クリアの確認',
      logsClearMessage: 'すべてのログをクリアしてもよろしいですか？この操作は元に戻せません。',
      logsCleared: 'ログをクリアしました',
      
      // 定期クリーン関連
      scheduledCleanLoadFailed: '定期クリーン設定の読み込みに失敗',
      scheduledCleanEnabled: '定期クリーンが有効になりました',
      scheduledCleanDisabled: '定期クリーンが無効になりました',
      scheduledCleanSetFailed: '定期クリーンの設定',
      scheduledCleanIntervalUpdated: 'クリーン間隔が更新されました',
      
      // 開発者ツール
      devtoolsOpened: '開発者ツールが開きました',
      devtoolsOpenFailed: '開発者ツールを開く',
      
      // Mole インストール状態
      moleNotInstalled: 'Mole CLI がインストールされていないため、一部の機能が使用できない場合があります',
      moleCheckFailed: 'Mole インストールの確認に失敗',
      
      // 共通プロンプト
      processing: '処理中...',
      success: '成功',
      failed: '失敗',
    },
    
    ko: {
      // 앱 제목
      appTitle: 'Mole Desktop',
      
      // 사이드바 그룹
      groupSystem: '시스템 도구',
      groupMaintenance: '유지보수',
      groupSettings: '설정',
      
      // 기능 이름
      clean: '시스템 정리',
      uninstall: '앱 제거',
      analyze: '디스크 분석',
      status: '시스템 상태',
      optimize: '시스템 최적화',
      history: '작업 기록',
      purge: '프로젝트 정리',
      installer: '설치 파일 정리',
      touchid: 'Touch ID',
      update: '앱 업데이트',
      remove: '앱 제거',
      completion: 'Shell 자동완성',
      envs: '환경 변수',
      settings: '설정',
      
      // 기능 설명
      cleanDesc: '캐시, 로그 및 임시 파일 정리',
      uninstallDesc: '앱 및 잔여 파일 제거',
      analyzeDesc: '디스크 사용량 시각화',
      statusDesc: '실시간 시스템 상태 모니터링',
      optimizeDesc: '캐시 및 시스템 서비스 새로고침',
      historyDesc: '작업 기록 보기',
      purgeDesc: '프로젝트 빌드 산출물 정리',
      installerDesc: '설치 파일 찾기 및 제거',
      touchidDesc: 'sudo용 Touch ID 구성',
      updateDesc: 'Mole을 최신 버전으로 업데이트',
      removeDesc: '시스템에서 Mole 제거',
      completionDesc: '셸 자동완성 설정',
      envsDesc: '시스템 환경 변수 관리',
      settingsDesc: '앱 설정 및 환경설정',
      
      // 공통 버튼
      scan: '스캔',
      clean: '지금 정리',
      refresh: '새로고침',
      add: '추가',
      edit: '편집',
      delete: '삭제',
      save: '저장',
      cancel: '취소',
      confirm: '확인',
      close: '닫기',
      loading: '로딩 중...',
      scanning: '스캔 중...',
      
      // 설정 페이지
      settingsTitle: '설정',
      language: '언어',
      languageDesc: '표시 언어 선택',
      theme: '테마',
      themeDesc: '앱 테마 선택',
      themeLight: '라이트',
      themeDark: '다크',
      themeAuto: '시스템',
      
      // 상태 텍스트
      engineReady: '엔진 준비됨',
      toggleTheme: '테마 전환',
      
      // 시스템 정리
      cleanableItems: '정리 가능한 항목',
      freeableSpace: '해방 가능한 공간',
      categories: '카테고리',
      whitelist: '화이트리스트',
      cleanPlaceholder: '"스캔"을 클릭하여 정리 가능한 항목 보기',
      cleanHint: '캐시, 로그 및 임시 파일을 정리하여 디스크 공간 확보',
      
      // 앱 제거
      scanApps: '앱 스캔',
      uninstallPlaceholder: '"앱 스캔"을 클릭하여 설치된 앱 보기',
      uninstallHint: '앱 및 잔여 파일 제거',
      
      // 디스크 분석
      startAnalyze: '분석 시작',
      analyzePlaceholder: '"분석 시작"을 클릭하여 디스크 사용량 보기',
      analyzeHint: '디스크 사용량 시각화 및 큰 파일 식별',
      
      // 시스템 상태
      refreshStatus: '상태 새로고침',
      statusPlaceholder: '"상태 새로고침"을 클릭하여 시스템 정보 보기',
      statusHint: '실시간 시스템 상태 모니터링 (CPU/메모리/저장소)',
      
      // 시스템 최적화
      scanOptimize: '항목 스캔',
      runOptimize: '최적화 실행',
      stop: '중지',
      optimizePlaceholder: '"항목 스캔"을 클릭하여 최적화 가능한 항목 보기',
      optimizeHint: '캐시 및 시스템 서비스 새로고침',
      
      // 작업 기록
      refreshHistory: '기록 새로고침',
      jsonFormat: 'JSON 형식',
      exportCsv: 'CSV 내보내기',
      exportJson: 'JSON 내보내기',
      historyPlaceholder: '"기록 새로고침"을 클릭하여 작업 기록 보기',
      historyHint: '작업 기록 보기',
      
      // 프로젝트 정리
      scanProjects: '프로젝트 스캔',
      previewClean: '미리보기',
      cleanProjects: '프로젝트 정리',
      scanDirs: '디렉토리 스캔',
      purgePlaceholder: '"프로젝트 스캔"을 클릭하여 정리 가능한 항목 보기',
      purgeHint: '프로젝트 빌드 산출물 정리 (node_modules, target 등)',
      
      // 설치 파일 정리
      scanInstallers: '설치 파일 스캔',
      cleanInstallers: '설치 파일 정리',
      selectAll: '모두 선택',
      cancelSelectAll: '선택 해제',
      installerPlaceholder: '"설치 파일 스캔"을 클릭하여 파일 보기',
      installerHint: '설치 파일 찾기 및 제거 (.dmg/.pkg 등)',
      
      // Touch ID
      configTouchid: 'Touch ID 구성',
      enableTouchid: 'Touch ID 활성화',
      touchidPlaceholder: '"Touch ID 구성"을 클릭하여 설정',
      touchidHint: 'sudo 인증용 Touch ID 구성',
      
      // 앱 업데이트
      checkUpdate: '업데이트 확인',
      updatePlaceholder: '"업데이트 확인"을 클릭하여 사용 가능한 업데이트 보기',
      updateHint: 'Mole을 최신 버전으로 업데이트',
      
      // 앱 제거
      removeApp: '앱 제거',
      removePlaceholder: '"앱 제거"를 클릭하여 제거',
      removeHint: '시스템에서 Mole 제거',
      
      // Shell 자동완성
      setupCompletion: '자동완성 설정',
      completionPlaceholder: '"자동완성 설정"을 클릭하여 구성',
      completionHint: 'Shell 자동완성 설정',
      
      // 환경 변수
      refreshList: '목록 새로고침',
      addEnv: '변수 추가',
      searchEnv: '변수 검색...',
      envName: '이름',
      envValue: '값',
      envSource: '출처',
      noEnvs: '환경 변수 없음',
      envPlaceholder: '"목록 새로고침"을 클릭하여 변수 보기',
      envHint: '변수 보기, 추가, 편집 및 삭제',
      
      // 상태 메시지
      scanComplete: '스캔 완료',
      cleanComplete: '정리 완료',
      operationComplete: '작업 완료',
      operationFailed: '작업 실패',
      
      // 확인 대화상자
      confirmClean: '이 항목들을 정리하시겠습니까?',
      confirmUninstall: '이 앱을 제거하시겠습니까?',
      confirmDelete: '삭제하시겠습니까?',
      
      // 프롬프트 메시지
      inputVarName: '변수 이름 입력:',
      inputVarValue: '변수 값 입력:',
      selectConfigFile: '설정 파일 선택 (.zshrc / .bash_profile / .bashrc):',
      added: '추가됨',
      deleted: '삭제됨',
      addFailed: '추가 실패',
      deleteFailed: '삭제 실패',
      
      // 화이트리스트 관리
      cleanWhitelist: '정리 화이트리스트',
      optimizeWhitelist: '최적화 화이트리스트',
      addItem: '항목 추가',
      loadFailed: '로드 실패',
      whitelistEmpty: '화이트리스트가 비어 있습니다',
      confirmDeleteItem: '화이트리스트에서 삭제하시겠습니까',
      addWhitelistItem: '화이트리스트 항목 추가',
      inputWhitelistPath: '화이트리스트에 추가할 경로 또는 패턴 입력 (예: ~/Library/Caches)',
      
      // 오류 메시지
      errorNotFound: '찾을 수 없음',
      errorPermissionDenied: '권한 거부됨',
      errorTimeout: '작업 시간 초과',
      errorNetwork: '네트워크 오류',
      errorCommandFailed: '명령 실행 실패',
      errorUnknown: '알 수 없는 오류',
      errorMoleNotInstalled: 'Mole CLI가 설치되지 않았거나 경로가 잘못 설정됨',
      errorOperationFailed: '작업 실패',
      errorRetrySuggestion: '다시 시도하거나 시스템 권한을 확인하세요',
      errorCheckPermissions: '파일 권한을 확인하세요',
      errorCheckNetwork: '네트워크 연결을 확인하세요',
      
      // 시스템 상태
      statusHealthScore: '건강 점수',
      statusHost: '호스트',
      statusSystem: '시스템',
      statusUptime: '가동 시간',
      statusProcesses: '프로세스 수',
      statusHardwareInfo: '하드웨어 정보',
      statusModel: '모델',
      statusProcessor: '프로세서',
      statusMemory: '메모리',
      statusDisk: '디스크',
      statusOSVersion: 'OS 버전',
      statusRefreshRate: '주사율',
      statusCPUUsage: 'CPU 사용률',
      statusTotalUsage: '총 사용률',
      statusLoad1Min: '1분',
      statusLoad5Min: '5분',
      statusLoad15Min: '15분',
      statusMemoryUsage: '메모리 사용',
      statusUsedTotal: '사용됨 / 총계',
      statusAvailable: '사용 가능',
      statusDiskUsage: '디스크 사용',
      statusName: '이름',
      statusCoreCount: '코어 수',
      statusNetwork: '네트워크',
      statusNoData: '데이터 없음',
      statusCannotParse: '상태 데이터를 구문 분석할 수 없음',
      statusDiskSpace: '디스크 공간 사용량',
      statusCleanable: '정리 가능',
      statusOther: '기타',
      
      // 건강 점수
      healthExcellent: '우수',
      healthGood: '양호',
      healthFair: '보통',
      healthPoor: '나쁨',
      
      // 앱 제거 관련
      uninstallConfirmTitle: '제거 확인',
      uninstallConfirmMessage: '제거하시겠습니까',
      uninstalling: '제거 중...',
      uninstalled: '제거됨',
      uninstallFailed: '제거 실패',
      uninstallError: '제거 오류',
      batchUninstall: '일괄 제거',
      batchUninstallConfirm: '일괄 제거 확인',
      batchUninstallComplete: '일괄 제거 완료',
      batchUninstallSuccess: '성공',
      batchUninstallFail: '실패',
      
      // 최적화 관련
      optimizeConfirm: '선택한 최적화를 실행하시겠습니까?',
      noOptimizeItems: '최적화 가능한 항목 없음',
      
      // 설치 파일 관련
      installerScanFailed: '스캔 실패',
      installerScanFirst: '먼저 설치 파일을 스캔하세요',
      installerSelectFirst: '삭제할 설치 파일을 선택하세요',
      installerDeleteFailed: '삭제 실패',
      
      // 기록 관련
      historyLoadFailed: '기록 가져오기 실패',
      historyParseFailed: '기록 구문 분석 실패',
      historyTime: '시간',
      historyOperation: '작업',
      historyDetails: '세부 정보',
      historyResult: '결과',
      historyExportSuccess: '내보내기 성공',
      historyExportFailed: '내보내기 실패',
      
      // 환경 변수 관련
      envsNoData: '환경 변수 없음',
      envsEdit: '환경 변수 편집',
      envsUpdated: '업데이트됨',
      envsUpdateFailed: '업데이트 실패',
      envsDeleteConfirm: '삭제 확인',
      envsDeleteMessage: '환경 변수를 삭제하시겠습니까',
      envsDeleted: '삭제됨',
      envsDeleteFailed: '삭제 실패',
      envsLoading: '로딩 중...',
      envsLoadFailed: '로드 실패',
      envsInputName: '변수 이름 입력',
      envsInputValue: '변수 값 입력',
      envsAdded: '추가됨',
      envsAddFailed: '추가 실패',
      
      // 업데이트 관련
      updateChecking: '확인 중...',
      updateNewVersion: '새 버전 발견',
      updateDownloading: '다운로드 시작...',
      updateComplete: '업데이트 완료, 곧 재시작',
      updateLatest: '이미 최신 버전',
      
      // 로그 관련
      logsNoData: '로그 없음',
      logsLoadFailed: '로드 실패',
      logsClearConfirm: '지우기 확인',
      logsClearMessage: '모든 로그를 지우시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      logsCleared: '로그 지워짐',
      
      // 예약 정리 관련
      scheduledCleanLoadFailed: '예약 정리 구성 로드 실패',
      scheduledCleanEnabled: '예약 정리 활성화됨',
      scheduledCleanDisabled: '예약 정리 비활성화됨',
      scheduledCleanSetFailed: '예약 정리 설정',
      scheduledCleanIntervalUpdated: '정리 간격 업데이트됨',
      
      // 개발자 도구
      devtoolsOpened: '개발자 도구 열림',
      devtoolsOpenFailed: '개발자 도구 열기',
      
      // Mole 설치 상태
      moleNotInstalled: 'Mole CLI가 설치되지 않아 일부 기능이 작동하지 않을 수 있음',
      moleCheckFailed: 'Mole 설치 확인 실패',
      
      // 일반 프롬프트
      processing: '처리 중...',
      success: '성공',
      failed: '실패',
    }
  },
  
  // 获取翻译文本
  t(key) {
    const lang = this.currentLang;
    return this.translations[lang]?.[key] || this.translations.zh[key] || key;
  },
  
  // 设置语言
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('mole-lang', lang);
      this.updateUI();
      return true;
    }
    return false;
  },
  
  // 从 localStorage 加载语言设置
  loadLanguage() {
    const savedLang = localStorage.getItem('mole-lang');
    if (savedLang && this.translations[savedLang]) {
      this.currentLang = savedLang;
    }
  },
  
  // 更新 UI 文本
  updateUI() {
    // 更新所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    
    // 更新所有带 data-i18n-placeholder 属性的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    
    // 更新所有带 data-i18n-title 属性的元素
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });
    
    // 更新 features 对象中的标题和描述
    this.updateFeatures();
  },
  
  // 更新 features 对象
  updateFeatures() {
    const featureKeys = ['clean', 'uninstall', 'analyze', 'status', 'optimize', 
                         'history', 'purge', 'installer', 'touchid', 'update', 
                         'remove', 'completion', 'envs', 'settings'];
    
    featureKeys.forEach(key => {
      if (window.features && window.features[key]) {
        window.features[key].title = this.t(key);
        window.features[key].subtitle = this.t(key + 'Desc');
      }
    });
  },
  
  // 获取可用语言列表
  getLanguages() {
    return [
      { code: 'zh', name: '中文' },
      { code: 'en', name: 'English' },
      { code: 'ru', name: 'Русский' },
      { code: 'ja', name: '日本語' },
      { code: 'ko', name: '한국어' }
    ];
  }
};

// 导出
window.i18n = i18n;
