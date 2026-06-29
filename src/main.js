// Mole GUI 主逻辑
// 调用 Rust 后端命令实现功能，支持流式输出

// 全局错误捕获 - 用于调试
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
  console.error('文件:', event.filename, '行:', event.lineno, '列:', event.colno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason);
});

const { invoke } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;

// ========== 错误处理模块 ==========

// 错误类型映射
const ERROR_TYPES = {
  NOT_FOUND: 'not_found',
  PERMISSION_DENIED: 'permission_denied',
  TIMEOUT: 'timeout',
  NETWORK: 'network',
  COMMAND_FAILED: 'command_failed',
  UNKNOWN: 'unknown'
};

// 错误消息国际化
const ERROR_MESSAGES = {
  zh: {
    [ERROR_TYPES.NOT_FOUND]: '未找到',
    [ERROR_TYPES.PERMISSION_DENIED]: '权限不足',
    [ERROR_TYPES.TIMEOUT]: '操作超时',
    [ERROR_TYPES.NETWORK]: '网络错误',
    [ERROR_TYPES.COMMAND_FAILED]: '命令执行失败',
    [ERROR_TYPES.UNKNOWN]: '未知错误',
    'mole_not_installed': 'Mole CLI 未安装或路径配置错误',
    'operation_failed': '操作失败',
    'retry_suggestion': '请重试或检查系统权限',
    'check_permissions': '请检查文件权限',
    'check_network': '请检查网络连接'
  },
  en: {
    [ERROR_TYPES.NOT_FOUND]: 'Not Found',
    [ERROR_TYPES.PERMISSION_DENIED]: 'Permission Denied',
    [ERROR_TYPES.TIMEOUT]: 'Timeout',
    [ERROR_TYPES.NETWORK]: 'Network Error',
    [ERROR_TYPES.COMMAND_FAILED]: 'Command Failed',
    [ERROR_TYPES.UNKNOWN]: 'Unknown Error',
    'mole_not_installed': 'Mole CLI not installed or path misconfigured',
    'operation_failed': 'Operation Failed',
    'retry_suggestion': 'Please retry or check system permissions',
    'check_permissions': 'Please check file permissions',
    'check_network': 'Please check network connection'
  }
};

// 分类错误类型
function classifyError(error) {
  const errorMsg = String(error).toLowerCase();
  
  if (errorMsg.includes('not found') || errorMsg.includes('no such file')) {
    return ERROR_TYPES.NOT_FOUND;
  }
  if (errorMsg.includes('permission') || errorMsg.includes('access denied')) {
    return ERROR_TYPES.PERMISSION_DENIED;
  }
  if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
    return ERROR_TYPES.TIMEOUT;
  }
  if (errorMsg.includes('network') || errorMsg.includes('connection')) {
    return ERROR_TYPES.NETWORK;
  }
  if (errorMsg.includes('command') || errorMsg.includes('exit code')) {
    return ERROR_TYPES.COMMAND_FAILED;
  }
  return ERROR_TYPES.UNKNOWN;
}

// 获取友好的错误消息
function getFriendlyErrorMessage(error, context = '') {
  const errorType = classifyError(error);
  const lang = window.i18n?.currentLang || 'zh';
  const messages = ERROR_MESSAGES[lang] || ERROR_MESSAGES.zh;
  
  let message = messages[errorType] || messages[ERROR_TYPES.UNKNOWN];
  
  // 添加上下文信息
  if (context) {
    message = `${context}: ${message}`;
  }
  
  // 添加建议
  const suggestions = [];
  if (errorType === ERROR_TYPES.NOT_FOUND) {
    suggestions.push(messages['mole_not_installed']);
  } else if (errorType === ERROR_TYPES.PERMISSION_DENIED) {
    suggestions.push(messages['check_permissions']);
  } else if (errorType === ERROR_TYPES.NETWORK) {
    suggestions.push(messages['check_network']);
  } else {
    suggestions.push(messages['retry_suggestion']);
  }
  
  return {
    message,
    type: errorType,
    suggestions,
    originalError: error
  };
}

// Toast 通知系统
function toast(message, type = 'info', duration = 3000) {
  // 移除已存在的 toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }
  
  // 创建 toast 元素
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  
  // 图标
  const icons = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  // 添加到页面
  document.body.appendChild(toast);
  
  // 自动移除
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('toast-hiding');
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

// 统一的错误处理函数
function handleError(error, context = '', showToast = true) {
  const errorInfo = getFriendlyErrorMessage(error, context);
  
  // 控制台输出详细错误
  console.error(`[Error] ${context}:`, error);
  
  // 显示 toast 通知
  if (showToast) {
    toast(errorInfo.message, 'error');
  }
  
  // 返回错误信息供调用者使用
  return errorInfo;
}

// 安全执行异步操作
async function safeInvoke(command, params = {}, context = '') {
  try {
    return await invoke(command, params);
  } catch (error) {
    handleError(error, context || command);
    throw error;
  }
}

// ========== 对话框函数 ==========

// 自定义 prompt 对话框（替代浏览器原生 prompt）
function showPrompt(title, defaultValue = '') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal-dialog';
    modal.innerHTML = `
      <div class="modal-header">
        <h3>${escapeHtml(title)}</h3>
      </div>
      <div class="modal-body">
        <input type="text" class="modal-input" value="${escapeHtml(defaultValue)}" />
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">取消</button>
        <button class="btn btn-primary modal-confirm">确定</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const input = modal.querySelector('.modal-input');
    const cancelBtn = modal.querySelector('.modal-cancel');
    const confirmBtn = modal.querySelector('.modal-confirm');

    input.focus();
    input.select();

    const close = (value) => {
      overlay.remove();
      resolve(value);
    };

    cancelBtn.addEventListener('click', () => close(null));
    confirmBtn.addEventListener('click', () => close(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') close(input.value);
      if (e.key === 'Escape') close(null);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(null);
    });
  });
}

// 自定义 confirm 对话框
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal-dialog';
    modal.innerHTML = `
      <div class="modal-header">
        <h3>${escapeHtml(title)}</h3>
      </div>
      <div class="modal-body">
        <p>${escapeHtml(message)}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">取消</button>
        <button class="btn btn-danger modal-confirm">确定</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const cancelBtn = modal.querySelector('.modal-cancel');
    const confirmBtn = modal.querySelector('.modal-confirm');

    const close = (value) => {
      overlay.remove();
      resolve(value);
    };

    cancelBtn.addEventListener('click', () => close(false));
    confirmBtn.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
  });
}

// 自定义 alert 对话框
function showAlert(title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal-dialog';
    modal.innerHTML = `
      <div class="modal-header">
        <h3>${escapeHtml(title)}</h3>
      </div>
      <div class="modal-body">
        <p style="white-space: pre-line;">${escapeHtml(message)}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary modal-confirm">确定</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const confirmBtn = modal.querySelector('.modal-confirm');

    const close = () => {
      overlay.remove();
      resolve();
    };

    confirmBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  });
}

// ========== 功能配置 ==========
const features = {
  clean: {
    title: window.i18n ? window.i18n.t('clean') : '系统清理',
    subtitle: window.i18n ? window.i18n.t('cleanDesc') : '清理缓存、日志和临时文件',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 6h18M3 12h18M3 18h18"/>
    </svg>`,
    event: 'scan-output',
  },
  uninstall: {
    title: window.i18n ? window.i18n.t('uninstall') : '应用卸载',
    subtitle: window.i18n ? window.i18n.t('uninstallDesc') : '卸载应用及其残留文件',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    </svg>`,
    event: 'uninstall-output',
  },
  analyze: {
    title: window.i18n ? window.i18n.t('analyze') : '磁盘分析',
    subtitle: window.i18n ? window.i18n.t('analyzeDesc') : '可视化磁盘使用情况',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 21H4.6c-.56 0-.84 0-1.054-.109a1 1 0 01-.437-.437C3 20.24 3 19.96 3 19.4V3m4 14l4-4 4 4 6-6"/>
    </svg>`,
    event: 'analyze-output',
  },
  status: {
    title: window.i18n ? window.i18n.t('status') : '系统状态',
    subtitle: window.i18n ? window.i18n.t('statusDesc') : '实时系统健康监控',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>`,
    event: 'status-output',
  },
  optimize: {
    title: window.i18n ? window.i18n.t('optimize') : '系统优化',
    subtitle: window.i18n ? window.i18n.t('optimizeDesc') : '刷新缓存和系统服务',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>`,
    event: 'optimize-output',
  },
  history: {
    title: window.i18n ? window.i18n.t('history') : '操作历史',
    subtitle: window.i18n ? window.i18n.t('historyDesc') : '查看历史操作记录',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`,
    event: 'history-output',
  },
  purge: {
    title: window.i18n ? window.i18n.t('purge') : '项目清理',
    subtitle: window.i18n ? window.i18n.t('purgeDesc') : '清理项目构建产物',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    </svg>`,
    event: 'purge-output',
  },
  installer: {
    title: window.i18n ? window.i18n.t('installer') : '安装包清理',
    subtitle: window.i18n ? window.i18n.t('installerDesc') : '查找并移除安装包文件',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>`,
    event: 'installer-output',
  },
  touchid: {
    title: window.i18n ? window.i18n.t('touchid') : 'Touch ID',
    subtitle: window.i18n ? window.i18n.t('touchidDesc') : '配置 Touch ID 用于 sudo',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 12h20M12 2v20"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>`,
    event: 'touchid-output',
  },
  update: {
    title: window.i18n ? window.i18n.t('update') : '应用更新',
    subtitle: window.i18n ? window.i18n.t('updateDesc') : '更新 Mole 到最新版本',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
    </svg>`,
    event: 'update-output',
  },
  remove: {
    title: window.i18n ? window.i18n.t('remove') : '应用移除',
    subtitle: window.i18n ? window.i18n.t('removeDesc') : '从系统中移除 Mole',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>`,
    event: 'remove-output',
  },
  completion: {
    title: window.i18n ? window.i18n.t('completion') : 'Shell 补全',
    subtitle: window.i18n ? window.i18n.t('completionDesc') : '设置 Shell 自动补全',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="4 17 10 11 4 5"/>
      <line x1="12" y1="19" x2="20" y2="19"/>
    </svg>`,
    event: 'completion-output',
  },
  envs: {
    title: window.i18n ? window.i18n.t('envs') : '环境变量',
    subtitle: window.i18n ? window.i18n.t('envsDesc') : '管理系统环境变量',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 6h16M4 12h16M4 18h16"/>
      <circle cx="8" cy="6" r="1" fill="currentColor"/>
      <circle cx="8" cy="12" r="1" fill="currentColor"/>
      <circle cx="8" cy="18" r="1" fill="currentColor"/>
    </svg>`,
    event: 'envs-output',
  },
  settings: {
    title: window.i18n ? window.i18n.t('settings') : '设置',
    subtitle: window.i18n ? window.i18n.t('settingsDesc') : '应用设置和偏好',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>`,
    event: '',
  },
};

// 当前选中的功能
let currentFeature = 'clean';

// 按钮加载状态管理
const buttonLoadingStates = new Map();

// 设置按钮加载状态
function setButtonLoading(buttonId, loading, loadingText = null) {
  loadingText = loadingText || (window.i18n ? window.i18n.t('processing') : '处理中...');
  const btn = document.querySelector(buttonId);
  if (!btn) return;
  
  if (loading) {
    // 保存原始内容
    if (!buttonLoadingStates.has(buttonId)) {
      buttonLoadingStates.set(buttonId, {
        html: btn.innerHTML,
        disabled: btn.disabled
      });
    }
    
    // 设置加载状态
    btn.disabled = true;
    btn.classList.add('btn-loading');
    btn.innerHTML = `
      <span class="btn-spinner"></span>
      <span>${loadingText}</span>
    `;
  } else {
    // 恢复原始状态
    const original = buttonLoadingStates.get(buttonId);
    if (original) {
      btn.innerHTML = original.html;
      btn.disabled = original.disabled;
      buttonLoadingStates.delete(buttonId);
    }
    btn.classList.remove('btn-loading');
  }
}

// 获取功能对应的主按钮 ID
function getFeatureButtonId(feature) {
  const buttonMap = {
    clean: '#btn-scan',
    uninstall: '#btn-scan-apps',
    analyze: '#btn-analyze',
    status: '#btn-status',
    optimize: '#btn-optimize-scan',
    history: '#btn-history',
    purge: '#btn-purge',
    installer: '#btn-installer',
    touchid: '#btn-touchid',
    update: '#btn-update',
    remove: '#btn-remove',
    completion: '#btn-completion',
    envs: '#btn-envs-refresh'
  };
  return buttonMap[feature];
}

// 显示结果状态
function showResultState(feature) {
  const placeholder = document.querySelector(`#${feature}-placeholder`);
  const loading = document.querySelector(`#${feature}-loading`);
  const result = document.querySelector(`#${feature}-result`);
  
  if (placeholder) placeholder.style.display = 'none';
  if (loading) loading.style.display = 'none';
  if (result) {
    result.style.display = 'block';
    // 强制重绘
    void result.offsetHeight;
  }
}

// 追加输出内容
function appendOutput(feature, text) {
  const result = document.querySelector(`#${feature}-result`);
  if (result) {
    result.textContent += text;
    // 自动滚动到底部
    result.scrollTop = result.scrollHeight;
  }
}

// 解析 mole 输出为结构化数据（文本模式）
function parseMoleOutput(text) {
  const lines = text.split('\n');
  const groups = [];
  let currentGroup = null;
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // 检测分组标题（以 ➤ 或 ◎ 开头的行）
    if (line.startsWith('➤') || line.startsWith('◎')) {
      currentGroup = {
        title: line.replace(/^[➤◎]\s*/, ''),
        items: []
      };
      groups.push(currentGroup);
    }
    // 检测列表项（以 → 或 ✓ 开头的行）
    else if ((line.startsWith('→') || line.startsWith('✓')) && currentGroup) {
      const icon = line.startsWith('✓') ? 'success' : 'info';
      const content = line.replace(/^[→✓]\s*/, '');
      
      // 尝试提取大小信息（如 "95 items, 368.7MB dry"）
      const sizeMatch = content.match(/([\d.]+\s*(?:KB|MB|GB|TB))\s*(?:dry)?$/i);
      const size = sizeMatch ? sizeMatch[1] : null;
      const text = size ? content.replace(sizeMatch[0], '').trim() : content;
      
      currentGroup.items.push({
        icon,
        text,
        size
      });
    }
    // 其他行作为普通文本
    else {
      if (!currentGroup) {
        currentGroup = { title: window.i18n ? window.i18n.t('statusOther') : '其他', items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push({
        icon: 'info',
        text: line,
        size: null
      });
    }
  }
  
  return groups;
}

// 解析 analyze JSON 输出
function parseAnalyzeJson(text) {
  try {
    // 移除 ANSI 转义序列
    const clean = text.replace(/\x1b\[[0-9;]*m/g, '');
    const json = JSON.parse(clean);
    if (json.entries) {
      return json.entries.map(e => ({
        name: e.name,
        path: e.path,
        size: e.size,
        is_dir: e.is_dir,
        cleanable: e.cleanable || false,
        insight: e.insight || false,
      }));
    }
  } catch (e) {
    // JSON 解析失败，返回 null
  }
  return null;
}

// 解析 uninstall --list JSON 输出
function parseUninstallJson(text) {
  try {
    // 移除 ANSI 转义序列
    const clean = text.replace(/\x1b\[[0-9;]*m/g, '');
    const arr = JSON.parse(clean);
    if (Array.isArray(arr)) {
      return arr.map(e => ({
        name: e.name || e.uninstall_name,
        uninstall_name: e.uninstall_name,
        bundle_id: e.bundle_id,
        source: e.source,
        path: e.path,
        size: e.size,
      }));
    }
  } catch (e) {
    // JSON 解析失败，返回 null
  }
  return null;
}

// 解析状态 JSON 输出
function parseStatusJson(text) {
  try {
    const clean = text.replace(/\x1b\[[0-9;]*m/g, '');
    return JSON.parse(clean);
  } catch (e) {
    return null;
  }
}

// 格式化字节数
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 获取健康分数颜色
function getHealthColor(score) {
  if (score >= 80) return 'var(--success)';
  if (score >= 60) return 'var(--warning)';
  return 'var(--error)';
}

// 获取健康分数标签
function getHealthLabel(score) {
  const t = window.i18n ? window.i18n.t.bind(window.i18n) : (k => k);
  if (score >= 80) return t('healthExcellent');
  if (score >= 60) return t('healthGood');
  if (score >= 40) return t('healthFair');
  return t('healthPoor');
}

// 渲染系统状态仪表盘
function renderStatusDashboard(text) {
  const result = document.querySelector('#status-result');
  if (!result) return;
  
  const data = parseStatusJson(text);
  if (!data) {
    result.innerHTML = `<div class="list-item"><div class="list-item-content"><div class="list-item-text">${window.i18n ? window.i18n.t('statusCannotParse') : '无法解析状态数据'}</div></div></div>`;
    result.style.display = 'block';
    void result.offsetHeight;
    return;
  }
  
  let html = '';
  
  // 健康分数卡片
  const healthColor = getHealthColor(data.health_score);
  html += '<div class="status-hero">';
  html += '<div class="status-hero-score" style="color: ' + healthColor + '">';
  html += '<div class="status-hero-value">' + data.health_score + '</div>';
  html += `<div class="status-hero-label">${window.i18n ? window.i18n.t('statusHealthScore') : '健康评分'}</div>`;
  html += '<div class="status-hero-msg" style="color: ' + healthColor + '">' + (data.health_score_msg || getHealthLabel(data.health_score)) + '</div>';
  html += '</div>';
  html += '<div class="status-hero-info">';
  html += `<div class="status-hero-row"><span class="status-hero-key">${window.i18n ? window.i18n.t('statusHost') : '主机'}</span><span class="status-hero-val">${escapeHtml(data.host || '')}</span></div>`;
  html += `<div class="status-hero-row"><span class="status-hero-key">${window.i18n ? window.i18n.t('statusSystem') : '系统'}</span><span class="status-hero-val">${escapeHtml(data.platform || '')}</span></div>`;
  html += `<div class="status-hero-row"><span class="status-hero-key">${window.i18n ? window.i18n.t('statusUptime') : '运行时间'}</span><span class="status-hero-val">${escapeHtml(data.uptime || '')}</span></div>`;
  html += `<div class="status-hero-row"><span class="status-hero-key">${window.i18n ? window.i18n.t('statusProcesses') : '进程数'}</span><span class="status-hero-val">${(data.procs || 0)}</span></div>`;
  html += '</div>';
  html += '</div>';
  
  // 硬件信息
  const hw = data.hardware || {};
  html += '<div class="status-section">';
  html += `<div class="status-section-title">${window.i18n ? window.i18n.t('statusHardwareInfo') : '硬件信息'}</div>`;
  html += '<div class="status-grid">';
  html += `<div class="status-card"><div class="status-card-label">${window.i18n ? window.i18n.t('statusModel') : '机型'}</div><div class="status-card-value">${escapeHtml(hw.model || '-')}</div></div>`;
  html += `<div class="status-card"><div class="status-card-label">${window.i18n ? window.i18n.t('statusProcessor') : '处理器'}</div><div class="status-card-value">${escapeHtml(hw.cpu_model || '-')}</div></div>`;
  html += `<div class="status-card"><div class="status-card-label">${window.i18n ? window.i18n.t('statusMemory') : '内存'}</div><div class="status-card-value">${escapeHtml(hw.total_ram || '-')}</div></div>`;
  html += `<div class="status-card"><div class="status-card-label">${window.i18n ? window.i18n.t('statusDisk') : '磁盘'}</div><div class="status-card-value">${escapeHtml(hw.disk_size || '-')}</div></div>`;
  html += `<div class="status-card"><div class="status-card-label">${window.i18n ? window.i18n.t('statusOSVersion') : '系统版本'}</div><div class="status-card-value">${escapeHtml(hw.os_version || '-')}</div></div>`;
  html += `<div class="status-card"><div class="status-card-label">${window.i18n ? window.i18n.t('statusRefreshRate') : '刷新率'}</div><div class="status-card-value">${escapeHtml(hw.refresh_rate || '-')}</div></div>`;
  html += '</div>';
  html += '</div>';
  
  // CPU 使用率
  const cpu = data.cpu || {};
  const cpuUsage = Math.round(cpu.usage || 0);
  const cpuColor = cpuUsage > 80 ? 'var(--error)' : cpuUsage > 60 ? 'var(--warning)' : 'var(--success)';
  html += '<div class="status-section">';
  html += `<div class="status-section-title">${window.i18n ? window.i18n.t('statusCPUUsage') : 'CPU 使用率'}</div>`;
  html += '<div class="status-meter">';
  html += `<div class="status-meter-header"><span class="status-meter-label">${window.i18n ? window.i18n.t('statusTotalUsage') : '总使用率'}</span><span class="status-meter-value" style="color:${cpuColor}">${cpuUsage}%</span></div>`;
  html += '<div class="status-meter-bar"><div class="status-meter-fill" style="width:' + cpuUsage + '%;background:' + cpuColor + '"></div></div>';
  html += '</div>';
  
  // 每核心使用率
  if (cpu.per_core && cpu.per_core.length > 0) {
    html += '<div class="status-cores">';
    for (let i = 0; i < cpu.per_core.length; i++) {
      const coreUsage = Math.round(cpu.per_core[i]);
      const coreColor = coreUsage > 80 ? 'var(--error)' : coreUsage > 60 ? 'var(--warning)' : 'var(--success)';
      html += '<div class="status-core">';
      html += '<div class="status-core-label">C' + i + '</div>';
      html += '<div class="status-core-bar"><div class="status-core-fill" style="width:' + coreUsage + '%;background:' + coreColor + '"></div></div>';
      html += '<div class="status-core-value">' + coreUsage + '%</div>';
      html += '</div>';
    }
    html += '</div>';
  }
  
  // 负载
  html += '<div class="status-load">';
  html += `<div class="status-load-item"><span class="status-load-label">${window.i18n ? window.i18n.t('statusLoad1Min') : '1分钟'}</span><span class="status-load-value">${(cpu.load1 || 0).toFixed(2)}</span></div>`;
  html += `<div class="status-load-item"><span class="status-load-label">${window.i18n ? window.i18n.t('statusLoad5Min') : '5分钟'}</span><span class="status-load-value">${(cpu.load5 || 0).toFixed(2)}</span></div>`;
  html += `<div class="status-load-item"><span class="status-load-label">${window.i18n ? window.i18n.t('statusLoad15Min') : '15分钟'}</span><span class="status-load-value">${(cpu.load15 || 0).toFixed(2)}</span></div>`;
  html += '</div>';
  html += '</div>';
  
  // 内存使用率
  const mem = data.memory || {};
  const memUsed = mem.used || 0;
  const memTotal = mem.total || 1;
  const memPercent = Math.round((memUsed / memTotal) * 100);
  const memColor = memPercent > 80 ? 'var(--error)' : memPercent > 60 ? 'var(--warning)' : 'var(--success)';
  html += '<div class="status-section">';
  html += `<div class="status-section-title">${window.i18n ? window.i18n.t('statusMemoryUsage') : '内存使用'}</div>`;
  html += '<div class="status-meter">';
  html += `<div class="status-meter-header"><span class="status-meter-label">${window.i18n ? window.i18n.t('statusUsedTotal') : '已用 / 总计'}</span><span class="status-meter-value" style="color:${memColor}">${memPercent}%</span></div>`;
  html += '<div class="status-meter-bar"><div class="status-meter-fill" style="width:' + memPercent + '%;background:' + memColor + '"></div></div>';
  html += `<div class="status-meter-detail"><span>${formatBytes(memUsed)} / ${formatBytes(memTotal)}</span><span>${window.i18n ? window.i18n.t('statusAvailable') : '可用'}: ${formatBytes(mem.available || 0)}</span></div>`;
  html += '</div>';
  if (mem.swap_total > 0) {
    html += '<div class="status-meter" style="margin-top:12px">';
    html += '<div class="status-meter-header"><span class="status-meter-label">Swap</span><span class="status-meter-value">' + formatBytes(mem.swap_used || 0) + ' / ' + formatBytes(mem.swap_total) + '</span></div>';
    html += '<div class="status-meter-bar"><div class="status-meter-fill" style="width:' + Math.round((mem.swap_used / mem.swap_total) * 100) + '%;background:var(--info)"></div></div>';
    html += '</div>';
  }
  html += '</div>';
  
  // 磁盘使用率
  const disks = data.disks || [];
  if (disks.length > 0) {
    html += '<div class="status-section">';
    html += `<div class="status-section-title">${window.i18n ? window.i18n.t('statusDiskUsage') : '磁盘使用'}</div>`;
    for (const disk of disks) {
      const diskPercent = Math.round(disk.used_percent || 0);
      const diskColor = diskPercent > 80 ? 'var(--error)' : diskPercent > 60 ? 'var(--warning)' : 'var(--success)';
      html += '<div class="status-meter">';
      html += '<div class="status-meter-header"><span class="status-meter-label">' + escapeHtml(disk.mount || '/') + ' (' + escapeHtml(disk.fstype || '') + ')</span><span class="status-meter-value" style="color:' + diskColor + '">' + diskPercent + '%</span></div>';
      html += '<div class="status-meter-bar"><div class="status-meter-fill" style="width:' + diskPercent + '%;background:' + diskColor + '"></div></div>';
      html += '<div class="status-meter-detail"><span>' + formatBytes(disk.used) + ' / ' + formatBytes(disk.total) + '</span></div>';
      html += '</div>';
    }
    html += '</div>';
  }
  
  // GPU 信息
  const gpus = data.gpu || [];
  if (gpus.length > 0) {
    html += '<div class="status-section">';
    html += '<div class="status-section-title">GPU</div>';
    html += '<div class="status-grid">';
    for (const gpu of gpus) {
      html += `<div class="status-card"><div class="status-card-label">${window.i18n ? window.i18n.t('statusName') : '名称'}</div><div class="status-card-value">${escapeHtml(gpu.name || '-')}</div></div>`;
      html += `<div class="status-card"><div class="status-card-label">${window.i18n ? window.i18n.t('statusCoreCount') : '核心数'}</div><div class="status-card-value">${(gpu.core_count || '-')}</div></div>`;
    }
    html += '</div>';
    html += '</div>';
  }
  
  // 网络信息
  const networks = data.network || [];
  if (networks.length > 0) {
    html += '<div class="status-section">';
    html += `<div class="status-section-title">${window.i18n ? window.i18n.t('statusNetwork') : '网络'}</div>`;
    html += '<div class="status-grid">';
    for (const net of networks) {
      html += '<div class="status-card"><div class="status-card-label">' + escapeHtml(net.name || '-') + '</div><div class="status-card-value">↓ ' + (net.rx_rate_mbs || 0).toFixed(1) + ' MB/s ↑ ' + (net.tx_rate_mbs || 0).toFixed(1) + ' MB/s</div></div>';
    }
    html += '</div>';
    html += '</div>';
  }
  
  result.innerHTML = html;
  result.style.display = 'block';
  void result.offsetHeight;
}

// 渲染磁盘分析结果
function renderAnalyzeList(text) {
  const result = document.querySelector('#analyze-result');
  if (!result) return;
  
  const entries = parseAnalyzeJson(text);
  
  if (!entries || entries.length === 0) {
    result.innerHTML = `<div class="list-item"><div class="list-item-content"><div class="list-item-text">${window.i18n ? window.i18n.t('statusNoData') : '无数据'}</div></div></div>`;
    result.style.display = 'block';
    void result.offsetHeight;
    return;
  }
  
  // 按大小排序
  entries.sort((a, b) => b.size - a.size);
  
  let html = '<div class="list-group">';
  html += `<div class="list-group-title">${window.i18n ? window.i18n.t('statusDiskSpace') : '磁盘空间占用'}</div>`;
  
  for (const entry of entries) {
    const iconSvg = entry.cleanable
      ? '<svg class="list-item-icon warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
      : entry.insight
        ? '<svg class="list-item-icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
        : '<svg class="list-item-icon default" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>';
    
    const cleanableTag = entry.cleanable ? `<span class="tag tag-cleanable">${window.i18n ? window.i18n.t('statusCleanable') : '可清理'}</span>` : '';
    
    html += '<div class="list-item">';
    html += '<div class="list-item-content">';
    html += iconSvg;
    html += `<div class="list-item-text">${escapeHtml(entry.name)}${cleanableTag}</div>`;
    html += '</div>';
    html += `<div class="list-item-size">${formatBytes(entry.size)}</div>`;
    html += '</div>';
  }
  
  html += '</div>';
  
  result.innerHTML = html;
  result.style.display = 'block';
  void result.offsetHeight;
}

// 渲染应用卸载列表
function renderUninstallList(text) {
  const result = document.querySelector('#uninstall-result');
  if (!result) return;
  
  const apps = parseUninstallJson(text);
  
  if (!apps || apps.length === 0) {
    result.innerHTML = `<div class="list-item"><div class="list-item-content"><div class="list-item-text">${window.i18n ? window.i18n.t('statusNoData') : '无数据'}</div></div></div>`;
    result.style.display = 'block';
    void result.offsetHeight;
    return;
  }
  
  // 按大小排序
  apps.sort((a, b) => {
    const sizeA = parseSizeToBytes(a.size);
    const sizeB = parseSizeToBytes(b.size);
    return sizeB - sizeA;
  });
  
  // 显示批量操作按钮
  document.querySelector('#btn-select-all-apps').style.display = 'inline-flex';
  document.querySelector('#btn-batch-uninstall').style.display = 'inline-flex';
  
  let html = '<div class="list-group">';
  html += `<div class="list-group-title">${window.i18n ? window.i18n.t('installedApps') : '已安装应用'} (${apps.length})</div>`;
  
  for (const app of apps) {
    html += '<div class="list-item list-item-app">';
    html += '<input type="checkbox" class="app-checkbox" data-app="' + escapeHtml(app.uninstall_name) + '" data-name="' + escapeHtml(app.name) + '">';
    html += '<div class="list-item-content">';
    html += '<svg class="list-item-icon default" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>';
    html += `<div class="list-item-text">${escapeHtml(app.name)}</div>`;
    html += '</div>';
    html += `<div class="list-item-size">${escapeHtml(app.size)}</div>`;
    html += `<button class="btn-uninstall" data-app="${escapeHtml(app.uninstall_name)}" title="${window.i18n ? window.i18n.t('uninstall') : '卸载'} ${escapeHtml(app.name)}">${window.i18n ? window.i18n.t('uninstall') : '卸载'}</button>`;
    html += '</div>';
  }
  
  html += '</div>';
  
  result.innerHTML = html;
  result.style.display = 'block';
  void result.offsetHeight;
  
  // 绑定单个卸载按钮事件
  result.querySelectorAll('.btn-uninstall').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const appName = btn.dataset.app;
      const confirmed = await showConfirm(window.i18n ? window.i18n.t('uninstallConfirmTitle') : '确认卸载', `${window.i18n ? window.i18n.t('uninstallConfirmMessage') : '确定要卸载'} ${btn.title.replace(window.i18n ? window.i18n.t('uninstall') + ' ' : '卸载 ', '')} ${window.i18n ? window.i18n.t('confirmDelete') : '吗？'}`);
      if (!confirmed) return;
      
      btn.textContent = window.i18n ? window.i18n.t('uninstalling') : '卸载中...';
      btn.disabled = true;
      
      try {
        const res = await invoke('uninstall', { appName: appName });
        if (res.exit_code === 0) {
          btn.textContent = window.i18n ? window.i18n.t('uninstalled') : '已卸载';
          btn.classList.add('uninstalled');
          // 移除对应的列表项
          const listItem = btn.closest('.list-item');
          if (listItem) {
            listItem.style.opacity = '0.4';
            const checkbox = listItem.querySelector('.app-checkbox');
            if (checkbox) checkbox.disabled = true;
          }
        } else {
          btn.textContent = window.i18n ? window.i18n.t('failed') : '失败';
          btn.disabled = false;
          const errorMsg = res.stderr || res.stdout || `Exit code: ${res.exit_code}`;
          console.error('Uninstall failed:', { exitCode: res.exit_code, stdout: res.stdout, stderr: res.stderr });
          await showAlert(window.i18n ? window.i18n.t('uninstallFailed') : '卸载失败', errorMsg);
        }
      } catch (err) {
        btn.textContent = window.i18n ? window.i18n.t('failed') : '失败';
        btn.disabled = false;
        await showAlert(window.i18n ? window.i18n.t('uninstallError') : '卸载出错', err);
      }
    });
  });
  
  // 更新批量卸载按钮状态
  updateBatchUninstallButton();
}

// 更新批量卸载按钮状态
function updateBatchUninstallButton() {
  const checkboxes = document.querySelectorAll('#uninstall-result .app-checkbox:not(:disabled)');
  const checkedBoxes = document.querySelectorAll('#uninstall-result .app-checkbox:checked:not(:disabled)');
  const batchBtn = document.querySelector('#btn-batch-uninstall');
  const selectAllBtn = document.querySelector('#btn-select-all-apps');
  
  if (batchBtn) {
    batchBtn.disabled = checkedBoxes.length === 0;
    batchBtn.querySelector('span').textContent = checkedBoxes.length > 0 
      ? `${window.i18n ? window.i18n.t('batchUninstall') : '批量卸载'} (${checkedBoxes.length})` 
      : (window.i18n ? window.i18n.t('batchUninstall') : '批量卸载');
  }
  
  // 更新全选按钮文本
  if (selectAllBtn) {
    const isAllSelected = checkboxes.length > 0 && checkedBoxes.length === checkboxes.length;
    selectAllBtn.querySelector('span').textContent = isAllSelected ? (window.i18n ? window.i18n.t('cancelSelectAll') : '取消全选') : (window.i18n ? window.i18n.t('selectAll') : '全选');
  }
}

// 渲染安装包列表
function renderInstallerList(installers) {
  const result = document.querySelector('#installer-result');
  if (!result) return;

  if (!installers || installers.length === 0) {
    result.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <p>${window.i18n ? window.i18n.t('installerNotFound') : '未找到安装包文件'}</p>
      </div>
    `;
    result.style.display = 'block';
    return;
  }

  // 计算总大小
  const totalSize = installers.reduce((sum, item) => sum + (item.size || 0), 0);
  const totalSizeStr = formatBytes(totalSize);

  let html = `
    <div class="installer-summary">
      <div class="summary-item">
        <span class="summary-label">${window.i18n ? window.i18n.t('installerFound') : '找到安装包'}</span>
        <span class="summary-value">${installers.length} ${window.i18n ? window.i18n.t('installerCount') : '个'}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">${window.i18n ? window.i18n.t('installerTotalSize') : '总大小'}</span>
        <span class="summary-value">${totalSizeStr}</span>
      </div>
    </div>
    <div class="installer-list">
  `;

  installers.forEach((item, index) => {
    const sizeStr = formatBytes(item.size);
    const icon = getFileIcon(item.file_type);

    html += `
      <div class="installer-item">
        <input type="checkbox" class="installer-checkbox" data-path="${escapeHtml(item.path)}" id="installer-${index}">
        <label for="installer-${index}" class="installer-info">
          <div class="installer-icon">${icon}</div>
          <div class="installer-details">
            <div class="installer-name">${escapeHtml(item.name)}</div>
            <div class="installer-meta">
              <span class="installer-path" title="${escapeHtml(item.path)}">${escapeHtml(item.path)}</span>
              <span class="installer-date">${escapeHtml(item.modified)}</span>
            </div>
          </div>
          <div class="installer-size">${sizeStr}</div>
        </label>
      </div>
    `;
  });

  html += '</div>';
  result.innerHTML = html;
  result.style.display = 'block';
}

// 获取文件类型图标
function getFileIcon(fileType) {
  const icons = {
    'dmg': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>',
    'pkg': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#50C878" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    'iso': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9B59B6" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
    'zip': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F39C12" stroke-width="2"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg>',
    'xip': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>'
  };
  return icons[fileType] || icons['zip'];
}

// 解析大小字符串为字节数（用于排序）
function parseSizeToBytes(sizeStr) {
  const match = sizeStr.match(/([\d.]+)\s*(KB|MB|GB|TB)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const multipliers = { 'KB': 1024, 'MB': 1024*1024, 'GB': 1024*1024*1024, 'TB': 1024*1024*1024*1024 };
  return val * (multipliers[unit] || 1);
}

// 渲染结构化列表（通用文本模式）
function renderList(feature, text) {
  // 特殊处理：analyze、uninstall 和 status 使用 JSON 解析
  if (feature === 'analyze') {
    renderAnalyzeList(text);
    return;
  }
  if (feature === 'uninstall') {
    renderUninstallList(text);
    return;
  }
  if (feature === 'status') {
    renderStatusDashboard(text);
    return;
  }
  
  const result = document.querySelector(`#${feature}-result`);
  if (!result) return;
  
  const groups = parseMoleOutput(text);
  
  if (groups.length === 0) {
    result.innerHTML = `<div class="list-item"><div class="list-item-content"><div class="list-item-text">${window.i18n ? window.i18n.t('statusNoData') : '无数据'}</div></div></div>`;
  } else {
    let html = '';
    for (const group of groups) {
      html += '<div class="list-group">';
      html += `<div class="list-group-title">${escapeHtml(group.title)}</div>`;
      
      for (const item of group.items) {
        const iconSvg = item.icon === 'success' 
          ? '<svg class="list-item-icon success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'
          : '<svg class="list-item-icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
        
        html += '<div class="list-item">';
        html += '<div class="list-item-content">';
        html += iconSvg;
        html += `<div class="list-item-text">${escapeHtml(item.text)}</div>`;
        html += '</div>';
        
        if (item.size) {
          html += `<div class="list-item-size">${escapeHtml(item.size)}</div>`;
        }
        
        html += '</div>';
      }
      
      html += '</div>';
    }
    
    result.innerHTML = html;
  }
  
  // 确保结果区域可见
  result.style.display = 'block';
  // 强制重排，确保界面刷新
  void result.offsetHeight;
  
  // 确保对应的结果面板处于激活状态
  const panel = document.querySelector(`#panel-${feature}`);
  if (panel && !panel.classList.contains('active')) {
    panel.classList.add('active');
  }
}

// HTML 转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 显示结果
function showResult(feature, text) {
  const placeholder = document.querySelector(`#${feature}-placeholder`);
  const loading = document.querySelector(`#${feature}-loading`);
  const result = document.querySelector(`#${feature}-result`);
  
  if (placeholder) placeholder.style.display = 'none';
  if (loading) loading.style.display = 'none';
  if (result) {
    result.style.display = 'block';
    result.textContent = text;
  }
}

// 显示占位符
function showPlaceholder(feature) {
  const placeholder = document.querySelector(`#${feature}-placeholder`);
  const loading = document.querySelector(`#${feature}-loading`);
  const result = document.querySelector(`#${feature}-result`);
  
  if (placeholder) placeholder.style.display = 'flex';
  if (loading) loading.style.display = 'none';
  if (result) result.style.display = 'none';
}

// 切换功能面板
function switchFeature(feature) {
  if (!features[feature]) return;
  
  currentFeature = feature;
  
  // 更新导航状态
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.feature === feature);
  });
  
  // 更新面板状态
  document.querySelectorAll('.result-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `panel-${feature}`);
  });
  
  // 更新操作组状态
  document.querySelectorAll('.action-group').forEach((group) => {
    group.classList.toggle('active', group.dataset.feature === feature);
  });
  
  // 更新头部
  const config = features[feature];
  document.querySelector('#hero-icon').innerHTML = config.icon;
  document.querySelector('#hero-title').textContent = config.title;
  document.querySelector('#hero-subtitle').textContent = config.subtitle;
}

// 执行命令并监听流式输出
async function executeWithStreaming(feature, commandFn) {
  const config = features[feature];
  const eventName = config.event;
  const buttonId = getFeatureButtonId(feature);
  
  // 设置按钮加载状态
  const loadingText = window.i18n ? window.i18n.t('scanning') : '扫描中...';
  setButtonLoading(buttonId, true, loadingText);
  
  // 激活结果面板并显示实时输出
  const panel = document.querySelector(`#panel-${feature}`);
  const placeholder = document.querySelector(`#${feature}-placeholder`);
  const result = document.querySelector(`#${feature}-result`);
  
  if (panel && !panel.classList.contains('active')) {
    panel.classList.add('active');
  }
  if (placeholder) placeholder.style.display = 'none';
  if (result) {
    result.style.display = 'block';
    result.innerHTML = '<div class="realtime-output"></div>';
  }
  
  let unlisten = null;
  let fullOutput = '';
  
  try {
    // 先设置事件监听
    unlisten = await listen(eventName, (event) => {
      const { event_type, data, exit_code } = event.payload;
      
      if (event_type === 'stdout' || event_type === 'stderr') {
        // 累积输出内容
        fullOutput += data;
        
        // 实时更新显示
        const result = document.querySelector(`#${feature}-result`);
        if (result) {
          result.style.display = 'block';
          result.innerHTML = `<div class="realtime-output">${escapeHtml(fullOutput)}</div>`;
          // 自动滚动到底部
          result.scrollTop = result.scrollHeight;
        }
      } else if (event_type === 'done') {
        // 更新统计卡片（如果是清理功能）
        if (feature === 'clean') {
          updateCleanStats(fullOutput);
        }
        
        // 如果是优化功能，解析并渲染优化项列表
        if (feature === 'optimize') {
          const items = parseOptimizeItems(fullOutput);
          renderOptimizeList(items);
          // 存储优化项列表供后续使用
          window.optimizeItems = items;
        } else {
          // 渲染结构化列表
          renderList(feature, fullOutput);
        }
      }
    });
    
    // 执行命令
    await commandFn();
  } catch (e) {
    handleError(e, features[feature]?.title || feature);
    appendOutput(feature, `\n${window.i18n ? window.i18n.t('errorCommandFailed') : '错误'}: ${e}`);
  } finally {
    // 取消监听
    if (unlisten) {
      unlisten();
    }
    // 恢复按钮状态
    setButtonLoading(buttonId, false);
  }
}

// 更新清理统计卡片
function updateCleanStats(output) {
  // 匹配格式: "Potential space: 209.0MB | Items: 239 | Categories: 15"
  const summaryMatch = output.match(/Potential space:\s*([\d.]+\s*(?:KB|MB|GB|TB))\s*\|\s*Items:\s*(\d+)\s*\|\s*Categories:\s*(\d+)/i);
  
  const itemsEl = document.querySelector('#stat-clean-items');
  const sizeEl = document.querySelector('#stat-clean-size');
  const catsEl = document.querySelector('#stat-clean-cats');
  
  if (summaryMatch) {
    if (sizeEl) sizeEl.textContent = summaryMatch[1];
    if (itemsEl) itemsEl.textContent = summaryMatch[2];
    if (catsEl) catsEl.textContent = summaryMatch[3];
  } else {
    // 回退：按 ➤ 计数分类
    const lines = output.split('\n');
    let categories = 0;
    for (const line of lines) {
      if (line.trim().startsWith('➤')) categories++;
    }
    if (itemsEl) itemsEl.textContent = categories > 0 ? '--' : '--';
    if (sizeEl) sizeEl.textContent = categories > 0 ? '--' : '--';
    if (catsEl) catsEl.textContent = categories > 0 ? categories.toString() : '--';
  }
}

// 解析优化项输出
function parseOptimizeItems(output) {
  const items = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    // 匹配格式: ➤ 优化项名称
    const match = line.match(/^\s*➤\s*(.+)$/);
    if (match) {
      items.push({
        name: match[1].trim(),
        checked: true
      });
    }
  }
  
  return items;
}

// 渲染优化项列表
function renderOptimizeList(items) {
  const result = document.querySelector('#optimize-result');
  if (!result) return;
  
  if (items.length === 0) {
    result.innerHTML = `<div class="list-item"><div class="list-item-content"><div class="list-item-text">${window.i18n ? window.i18n.t('noOptimizeItems') : '无可优化项'}</div></div></div>`;
    result.style.display = 'block';
    void result.offsetHeight;
    return;
  }
  
  let html = '<div class="optimize-list">';
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    html += `
      <label class="optimize-item">
        <input type="checkbox" class="optimize-checkbox" data-index="${i}" ${item.checked ? 'checked' : ''}>
        <span class="optimize-checkmark"></span>
        <span class="optimize-label">${escapeHtml(item.name)}</span>
      </label>
    `;
  }
  
  html += '</div>';
  
  result.innerHTML = html;
  result.style.display = 'block';
  void result.offsetHeight;
  
  // 绑定复选框事件
  result.querySelectorAll('.optimize-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      items[index].checked = e.target.checked;
    });
  });
}

// 更新主题图标
function updateThemeIcon(theme) {
  const lightIcon = document.querySelector('.theme-icon-light');
  const darkIcon = document.querySelector('.theme-icon-dark');
  
  if (theme === 'light') {
    lightIcon.style.display = 'none';
    darkIcon.style.display = 'block';
  } else {
    lightIcon.style.display = 'block';
    darkIcon.style.display = 'none';
  }
}

// 更新设置页面的主题选择器
function updateThemeSelector(theme) {
  const themeButtons = document.querySelectorAll('.theme-option');
  themeButtons.forEach(btn => {
    const btnTheme = btn.getAttribute('data-theme-value');
    if (btnTheme === theme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// 初始化设置页面
function initSettings() {
  // 加载保存的设置
  const savedSettings = JSON.parse(localStorage.getItem('mole-settings') || '{}');
  
  // Mole 路径
  const molePathInput = document.querySelector('#settings-mole-path');
  if (molePathInput) {
    molePathInput.value = savedSettings.molePath || '';
    molePathInput.addEventListener('change', () => {
      saveSetting('molePath', molePathInput.value);
    });
  }
  
  // 操作确认
  const confirmAction = document.querySelector('#settings-confirm-action');
  if (confirmAction) {
    confirmAction.checked = savedSettings.confirmAction !== false; // 默认开启
    confirmAction.addEventListener('change', () => {
      saveSetting('confirmAction', confirmAction.checked);
    });
  }
  
  // 自动刷新
  const autoRefresh = document.querySelector('#settings-auto-refresh');
  if (autoRefresh) {
    autoRefresh.checked = savedSettings.autoRefresh !== false; // 默认开启
    autoRefresh.addEventListener('change', () => {
      saveSetting('autoRefresh', autoRefresh.checked);
    });
  }
}

// 保存设置
function saveSetting(key, value) {
  const savedSettings = JSON.parse(localStorage.getItem('mole-settings') || '{}');
  savedSettings[key] = value;
  localStorage.setItem('mole-settings', JSON.stringify(savedSettings));
}

// 获取设置
function getSetting(key, defaultValue = null) {
  const savedSettings = JSON.parse(localStorage.getItem('mole-settings') || '{}');
  return savedSettings[key] !== undefined ? savedSettings[key] : defaultValue;
}

// 初始化
async function init() {
  console.log('[DEBUG] init() 开始执行');
  
  try {
    // 初始化国际化系统
    if (window.i18n) {
      console.log('[DEBUG] i18n 已加载');
      window.i18n.loadLanguage();
      window.i18n.updateUI();
      
      // 更新设置页面的语言选择器
      const langSelect = document.querySelector('#settings-language');
      if (langSelect) {
        langSelect.value = window.i18n.currentLang;
      }
    } else {
      console.log('[DEBUG] i18n 未加载');
    }
    
    // 初始化主题
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // 更新设置页面的主题选择器
    updateThemeSelector(savedTheme);
    console.log('[DEBUG] 主题初始化完成');
  
  // 绑定开发者工具按钮
    document.querySelector('#btn-devtools')?.addEventListener('click', async () => {
      try {
        await invoke('open_devtools');
        toast(window.i18n ? window.i18n.t('devtoolsOpened') : '开发者工具已打开', 'success');
      } catch (err) {
        handleError(err, window.i18n ? window.i18n.t('devtoolsOpenFailed') : '打开开发者工具');
      }
    });
    console.log('[DEBUG] 开发者工具按钮绑定完成');
    
    // 绑定主题切换按钮
    document.querySelector('#theme-toggle')?.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
      updateThemeSelector(newTheme);
    });
    console.log('[DEBUG] 主题切换按钮绑定完成');
  
  // 绑定设置页面的语言切换
  const settingsLangSelect = document.querySelector('#settings-language');
  if (settingsLangSelect) {
    settingsLangSelect.addEventListener('change', (e) => {
      const newLang = e.target.value;
      if (window.i18n) {
        window.i18n.setLanguage(newLang);
        // 更新当前页面的标题和描述
        const config = features[currentFeature];
        document.querySelector('#hero-title').textContent = config.title;
        document.querySelector('#hero-subtitle').textContent = config.subtitle;
      }
    });
  }
  
  // 绑定设置页面的主题切换按钮
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const newTheme = btn.dataset.themeValue;
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
      updateThemeSelector(newTheme);
    });
  });
  
  // 初始化设置页面
  initSettings();
  
  // 检查 Mole 是否安装（异步，不阻塞 UI 初始化）
  (async () => {
    try {
      const installed = await invoke('is_installed');
      if (!installed) {
        document.querySelector('#version-info').textContent = window.i18n ? window.i18n.t('moleNotInstalled') : 'Mole 未安装';
        toast('Mole CLI 未安装，部分功能可能无法使用', 'warning');
      } else {
        try {
          const result = await invoke('get_version');
          if (result.is_success) {
            const lines = result.stdout.trim().split('\n');
            document.querySelector('#version-info').textContent = lines[0] || 'Mole';
            document.querySelector('#settings-version').textContent = lines[0] || '1.0.0';
          } else {
            document.querySelector('#version-info').textContent = 'Mole';
            document.querySelector('#settings-version').textContent = '1.0.0';
          }
        } catch (e) {
          document.querySelector('#version-info').textContent = 'Mole';
          document.querySelector('#settings-version').textContent = '1.0.0';
        }
      }
    } catch (err) {
      console.error((window.i18n ? window.i18n.t('moleCheckFailed') : '检查 Mole 安装状态失败') + ':', err);
      document.querySelector('#version-info').textContent = 'Mole';
    }
  })();
  
  // 初始化头部图标
  const config = features[currentFeature];
  document.querySelector('#hero-icon').innerHTML = config.icon;
  
  // 绑定导航事件
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      switchFeature(item.dataset.feature);
    });
  });
  
  // 绑定清理按钮 - 扫描
  document.querySelector('#btn-scan')?.addEventListener('click', async () => {
    await executeWithStreaming('clean', () => invoke('scan_cleanable'));
  });
  
  // 绑定清理按钮 - 立即清理
  document.querySelector('#btn-clean')?.addEventListener('click', async () => {
    await executeWithStreaming('clean', () => invoke('clean'));
  });
  
  // 绑定卸载按钮
  document.querySelector('#btn-scan-apps')?.addEventListener('click', async () => {
    await executeWithStreaming('uninstall', () => invoke('scan_apps'));
  });
  
  // 绑定全选按钮
  document.querySelector('#btn-select-all-apps')?.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#uninstall-result .app-checkbox:not(:disabled)');
    const checkedBoxes = document.querySelectorAll('#uninstall-result .app-checkbox:checked:not(:disabled)');
    const isAllSelected = checkboxes.length > 0 && checkedBoxes.length === checkboxes.length;
    
    checkboxes.forEach(cb => {
      cb.checked = !isAllSelected;
    });
    
    updateBatchUninstallButton();
  });
  
  // 绑定批量卸载按钮
  document.querySelector('#btn-batch-uninstall')?.addEventListener('click', async () => {
    const checkedBoxes = document.querySelectorAll('#uninstall-result .app-checkbox:checked:not(:disabled)');
    if (checkedBoxes.length === 0) return;
    
    const appNames = Array.from(checkedBoxes).map(cb => cb.dataset.name);
    const confirmed = await showConfirm(window.i18n ? window.i18n.t('batchUninstallConfirm') : '批量卸载确认', `${window.i18n ? window.i18n.t('batchUninstallConfirm') : '确定要卸载选中的'} ${appNames.length} ${window.i18n ? window.i18n.t('appsCount') : '个应用吗？'}\n\n${appNames.slice(0, 5).join(', ')}${appNames.length > 5 ? '...' : ''}`);
    if (!confirmed) return;
    
    const batchBtn = document.querySelector('#btn-batch-uninstall');
    batchBtn.disabled = true;
    batchBtn.querySelector('span').textContent = window.i18n ? window.i18n.t('uninstalling') : '卸载中...';
    
    let successCount = 0;
    let failCount = 0;
    
    for (const checkbox of checkedBoxes) {
      const appName = checkbox.dataset.app;
      const displayName = checkbox.dataset.name;
      
      try {
        const res = await invoke('uninstall', { appName: appName });
        if (res.exit_code === 0) {
          successCount++;
          checkbox.disabled = true;
          checkbox.checked = false;
          const listItem = checkbox.closest('.list-item');
          if (listItem) {
            listItem.style.opacity = '0.4';
            const uninstallBtn = listItem.querySelector('.btn-uninstall');
            if (uninstallBtn) {
              uninstallBtn.textContent = window.i18n ? window.i18n.t('uninstalled') : '已卸载';
              uninstallBtn.classList.add('uninstalled');
              uninstallBtn.disabled = true;
            }
          }
        } else {
          failCount++;
          console.error(`卸载 ${displayName} 失败:`, res.stderr);
        }
      } catch (err) {
        failCount++;
        console.error(`卸载 ${displayName} 出错:`, err);
      }
    }
    
    batchBtn.disabled = false;
    updateBatchUninstallButton();
    
    await showAlert(window.i18n ? window.i18n.t('batchUninstallComplete') : '批量卸载完成', `${window.i18n ? window.i18n.t('batchUninstallSuccess') : '成功'}: ${successCount} ${window.i18n ? window.i18n.t('count') : '个'}\n${window.i18n ? window.i18n.t('batchUninstallFail') : '失败'}: ${failCount} ${window.i18n ? window.i18n.t('count') : '个'}`);
  });
  
  // 绑定分析按钮
  document.querySelector('#btn-analyze')?.addEventListener('click', async () => {
    await executeWithStreaming('analyze', () => invoke('analyze', { path: null }));
  });
  
  // 绑定状态按钮
  document.querySelector('#btn-status')?.addEventListener('click', async () => {
    await executeWithStreaming('status', () => invoke('status'));
  });
  
  // 绑定优化扫描按钮
  document.querySelector('#btn-optimize-scan')?.addEventListener('click', async () => {
    await executeWithStreaming('optimize', () => invoke('optimize'));
    // 扫描完成后启用执行优化按钮
    const runBtn = document.querySelector('#btn-optimize-run');
    const stopBtn = document.querySelector('#btn-optimize-stop');
    if (runBtn) runBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = false;
  });
  
  // 绑定执行优化按钮
  document.querySelector('#btn-optimize-run')?.addEventListener('click', async () => {
    const confirmed = await showConfirm(window.i18n ? window.i18n.t('optimizeConfirm') : '确定要执行选中的优化项吗？', '');
    if (confirmed) {
      await executeWithStreaming('optimize', () => invoke('optimize_run'));
      // 执行完成后禁用按钮
      const runBtn = document.querySelector('#btn-optimize-run');
      const stopBtn = document.querySelector('#btn-optimize-stop');
      if (runBtn) runBtn.disabled = true;
      if (stopBtn) stopBtn.disabled = true;
    }
  });
  
  // 绑定停止优化按钮
  document.querySelector('#btn-optimize-stop')?.addEventListener('click', async () => {
    await invoke('stop_command', { command: 'optimize' });
    const runBtn = document.querySelector('#btn-optimize-run');
    const stopBtn = document.querySelector('#btn-optimize-stop');
    if (runBtn) runBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
  });
  
  // 绑定历史按钮
  document.querySelector('#btn-history')?.addEventListener('click', async () => {
    await executeWithStreaming('history', () => invoke('history'));
  });
  
  // 绑定历史 JSON 按钮
  document.querySelector('#btn-history-json')?.addEventListener('click', async () => {
    await executeWithStreaming('history', () => invoke('history_json'));
  });
  
  // 绑定导出 CSV 按钮
  document.querySelector('#btn-export-csv')?.addEventListener('click', async () => {
    await exportHistory('csv');
  });
  
  // 绑定导出 JSON 按钮
  document.querySelector('#btn-export-json')?.addEventListener('click', async () => {
    await exportHistory('json');
  });
  
  // 绑定项目清理按钮 - 扫描
  document.querySelector('#btn-purge')?.addEventListener('click', async () => {
    await executeWithStreaming('purge', () => invoke('purge_dry_run'));
  });
  
  // 绑定项目清理按钮 - 预览清理
  document.querySelector('#btn-purge-dry-run')?.addEventListener('click', async () => {
    await executeWithStreaming('purge', () => invoke('purge_dry_run'));
  });
  
  // 绑定项目清理按钮 - 清理项目
  document.querySelector('#btn-purge-clean')?.addEventListener('click', async () => {
    await executeWithStreaming('purge', () => invoke('purge'));
  });
  
  // 绑定项目清理按钮 - 扫描目录
  document.querySelector('#btn-purge-paths')?.addEventListener('click', async () => {
    await executeWithStreaming('purge', () => invoke('purge_paths'));
  });
  
  // 绑定安装包扫描按钮
  document.querySelector('#btn-installer')?.addEventListener('click', async () => {
    const placeholder = document.querySelector('#installer-placeholder');
    const loading = document.querySelector('#installer-loading');
    const result = document.querySelector('#installer-result');
    const selectAllBtn = document.querySelector('#btn-select-all-installers');

    if (placeholder) placeholder.style.display = 'none';
    if (loading) loading.style.display = 'flex';
    if (result) result.style.display = 'none';
    if (selectAllBtn) selectAllBtn.style.display = 'none';

    try {
      const jsonStr = await invoke('scan_installers');
      const installers = JSON.parse(jsonStr);

      if (loading) loading.style.display = 'none';
      if (result) {
        result.style.display = 'block';
        renderInstallerList(installers);
        // 扫描完成后显示全选按钮
        if (installers.length > 0 && selectAllBtn) {
          selectAllBtn.style.display = 'inline-flex';
        }
      }
    } catch (err) {
      handleError(err, window.i18n ? window.i18n.t('installerScan') : '安装包扫描');
      if (placeholder) {
        placeholder.style.display = 'block';
        placeholder.querySelector('.placeholder-title').textContent = window.i18n ? window.i18n.t('installerScanFailed') : '扫描失败';
      }
    }
  });

  // 绑定安装包全选按钮
  document.querySelector('#btn-select-all-installers')?.addEventListener('click', async () => {
    const result = document.querySelector('#installer-result');
    if (!result || result.style.display === 'none') return;

    const checkboxes = result.querySelectorAll('.installer-checkbox');
    const selectAllBtn = document.querySelector('#btn-select-all-installers');
    const span = selectAllBtn.querySelector('span');

    // 判断当前是否已全选
    const checkedBoxes = result.querySelectorAll('.installer-checkbox:checked');
    const isAllSelected = checkboxes.length > 0 && checkedBoxes.length === checkboxes.length;

    // 切换全选状态
    checkboxes.forEach(cb => {
      cb.checked = !isAllSelected;
    });

    // 更新按钮文本
    span.textContent = isAllSelected ? window.i18n.t('selectAll') : window.i18n.t('cancelSelectAll');
  });
  
  // 绑定安装包清理按钮（批量删除）
  document.querySelector('#btn-installer-clean')?.addEventListener('click', async () => {
    const result = document.querySelector('#installer-result');
    if (!result || result.style.display === 'none') {
      toast(window.i18n ? window.i18n.t('installerScanFirst') : '请先扫描安装包', 'warning');
      return;
    }
    
    const checkboxes = result.querySelectorAll('.installer-checkbox:checked');
    if (checkboxes.length === 0) {
      toast(window.i18n ? window.i18n.t('installerSelectFirst') : '请选择要删除的安装包', 'warning');
      return;
    }
    
    const confirmed = await showConfirm(
      window.i18n.t('confirmDelete'),
      `确定要删除选中的 ${checkboxes.length} 个安装包吗？`
    );
    
    if (!confirmed) return;
    
    let successCount = 0;
    let failCount = 0;
    
    for (const checkbox of checkboxes) {
      const path = checkbox.dataset.path;
      try {
        await invoke('delete_installer', { path });
        successCount++;
      } catch (err) {
        failCount++;
        console.error((window.i18n ? window.i18n.t('installerDeleteFailed') : '删除失败') + ':', path, err);
      }
    }
    
    if (successCount > 0) {
      toast(`成功删除 ${successCount} 个安装包`, 'success');
    }
    if (failCount > 0) {
      toast(`${failCount} 个文件删除失败`, 'error');
    }
    
    // 重新扫描
    document.querySelector('#btn-installer').click();
  });
  
  // 绑定 Touch ID 按钮
  document.querySelector('#btn-touchid')?.addEventListener('click', async () => {
    await executeWithStreaming('touchid', () => invoke('touchid'));
  });
  
  // 绑定 Touch ID 启用按钮
  document.querySelector('#btn-touchid-enable')?.addEventListener('click', async () => {
    await executeWithStreaming('touchid', () => invoke('touchid_enable'));
  });
  
  // 绑定应用更新按钮
  document.querySelector('#btn-update')?.addEventListener('click', async () => {
    await executeWithStreaming('update', () => invoke('update'));
  });
  
  // 绑定应用移除按钮
  document.querySelector('#btn-remove')?.addEventListener('click', async () => {
    await executeWithStreaming('remove', () => invoke('remove'));
  });
  
  // 绑定清理白名单按钮
  document.querySelector('#btn-clean-whitelist')?.addEventListener('click', async () => {
    await showWhitelistManager('clean');
  });
  
  // 绑定优化白名单按钮
  document.querySelector('#btn-optimize-whitelist')?.addEventListener('click', async () => {
    await showWhitelistManager('optimize');
  });
  
  // 绑定 Shell 补全按钮
  document.querySelector('#btn-completion')?.addEventListener('click', async () => {
    await executeWithStreaming('completion', () => invoke('completion'));
  });

  // 导出历史记录
  async function exportHistory(format) {
    try {
      // 获取历史记录JSON数据
      const result = await invoke('history_json');
      
      if (result.exit_code !== 0) {
        toast((window.i18n ? window.i18n.t('historyLoadFailed') : '获取历史记录失败') + ': ' + result.stderr, 'error');
        return;
      }
      
      // 解析JSON数据
      let historyData;
      try {
        historyData = JSON.parse(result.stdout);
      } catch (e) {
        toast(window.i18n ? window.i18n.t('historyParseFailed') : '解析历史记录失败', 'error');
        return;
      }
      
      // 准备导出数据
      let content, filename, mimeType;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      if (format === 'csv') {
        // 转换为CSV格式
        const rows = [[window.i18n ? window.i18n.t('historyTime') : '时间', window.i18n ? window.i18n.t('historyOperation') : '操作', window.i18n ? window.i18n.t('historyDetails') : '详情', window.i18n ? window.i18n.t('historyResult') : '结果']];
        
        if (Array.isArray(historyData)) {
          historyData.forEach(item => {
            rows.push([
              item.timestamp || item.time || '',
              item.action || item.operation || '',
              item.details || item.description || '',
              item.result || item.status || ''
            ]);
          });
        }
        
        // 转换为CSV字符串
        content = rows.map(row => 
          row.map(cell => {
            const str = String(cell).replace(/"/g, '""');
            return str.includes(',') || str.includes('"') || str.includes('\n') 
              ? `"${str}"` 
              : str;
          }).join(',')
        ).join('\n');
        
        filename = `mole-history-${timestamp}.csv`;
        mimeType = 'text/csv;charset=utf-8';
      } else {
        // JSON格式
        content = JSON.stringify(historyData, null, 2);
        filename = `mole-history-${timestamp}.json`;
        mimeType = 'application/json;charset=utf-8';
      }
      
      // 使用Tauri保存文件对话框
      const { save } = window.__TAURI__.dialog;
      const { writeTextFile } = window.__TAURI__.fs;
      
      const filePath = await save({
        filters: [{
          name: format.toUpperCase(),
          extensions: [format]
        }],
        defaultPath: filename
      });
      
      if (filePath) {
        await writeTextFile(filePath, content);
        toast((window.i18n ? window.i18n.t('historyExportSuccess') : '导出成功') + ': ' + filePath, 'success');
      }
    } catch (err) {
      toast((window.i18n ? window.i18n.t('historyExportFailed') : '导出失败') + ': ' + err, 'error');
    }
  }

  // 白名单管理对话框
  async function showWhitelistManager(type) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal-dialog';
    modal.style.minWidth = '500px';
    
    const title = type === 'clean' ? window.i18n.t('cleanWhitelist') : window.i18n.t('optimizeWhitelist');
    
    modal.innerHTML = `
      <div class="modal-header">
        <h3>${escapeHtml(title)}</h3>
      </div>
      <div class="modal-body">
        <div style="margin-bottom: 12px;">
          <button class="btn btn-primary" id="btn-add-whitelist" style="width: 100%;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            ${window.i18n.t('addItem')}
          </button>
        </div>
        <div id="whitelist-items" style="max-height: 300px; overflow-y: auto;">
          <div style="text-align: center; color: var(--text-secondary); padding: 20px;">${window.i18n.t('loading')}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-close">${window.i18n.t('close')}</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const closeBtn = modal.querySelector('.modal-close');
    const addBtn = modal.querySelector('#btn-add-whitelist');
    const itemsContainer = modal.querySelector('#whitelist-items');
    
    const close = () => {
      overlay.remove();
    };
    
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    
    // 加载白名单
    async function loadWhitelist() {
      try {
        const items = await invoke('get_clean_whitelist');
        renderWhitelistItems(items);
      } catch (err) {
        itemsContainer.innerHTML = `<div style="text-align: center; color: var(--error); padding: 20px;">${window.i18n.t('loadFailed')}: ${escapeHtml(err)}</div>`;
      }
    }
    
    // 渲染白名单项目
    function renderWhitelistItems(items) {
      if (!items || items.length === 0) {
        itemsContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 20px;">${window.i18n.t('whitelistEmpty')}</div>`;
        return;
      }
      
      let html = '';
      items.forEach((item, index) => {
        html += `
          <div class="list-item" style="margin-bottom: 8px;">
            <div class="list-item-content">
              <svg class="list-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              <div class="list-item-text">${escapeHtml(item)}</div>
            </div>
            <button class="btn-icon btn-delete-whitelist" data-item="${escapeHtml(item)}" title="${window.i18n ? window.i18n.t('delete') : '删除'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
            </button>
          </div>
        `;
      });
      
      itemsContainer.innerHTML = html;
      
      // 绑定删除按钮事件
      itemsContainer.querySelectorAll('.btn-delete-whitelist').forEach(btn => {
        btn.addEventListener('click', async () => {
          const item = btn.dataset.item;
          const confirmed = await showConfirm(window.i18n.t('confirmDelete'), `${window.i18n.t('confirmDeleteItem')} "${item}"?`);
          if (confirmed) {
            try {
              await invoke('remove_clean_whitelist', { item });
              toast(window.i18n.t('deleted'), 'success');
              loadWhitelist();
            } catch (err) {
              toast(window.i18n.t('deleteFailed') + ': ' + err, 'error');
            }
          }
        });
      });
    }
    
    // 添加按钮事件
    addBtn.addEventListener('click', async () => {
      const item = await showPrompt(window.i18n.t('addWhitelistItem'), window.i18n.t('inputWhitelistPath'));
      if (item && item.trim()) {
        try {
          await invoke('add_clean_whitelist', { item: item.trim() });
          toast(window.i18n.t('added'), 'success');
          loadWhitelist();
        } catch (err) {
          toast(window.i18n.t('addFailed') + ': ' + err, 'error');
        }
      }
    });
    
    // 初始加载
    loadWhitelist();
  }

  // 环境变量管理
  let allEnvs = []; // 存储所有环境变量

  // 渲染环境变量列表
  function renderEnvs(envs) {
    const result = document.querySelector('#envs-result');
    const placeholder = document.querySelector('#envs-placeholder');
    if (!result) return;

    // 隐藏占位提示
    if (placeholder) placeholder.style.display = 'none';
    result.style.display = 'block';

    if (!envs || envs.length === 0) {
      result.innerHTML = `<div class="list-item"><div class="list-item-content"><div class="list-item-text">${window.i18n ? window.i18n.t('envsNoData') : '无环境变量'}</div></div></div>`;
      void result.offsetHeight;
      return;
    }

    let html = '<div class="list-group">';
    html += `<div class="list-group-title">${window.i18n ? window.i18n.t('envs') : '环境变量'} (${envs.length})</div>`;

    for (const env of envs) {
      html += '<div class="list-item env-item" data-name="' + escapeHtml(env.name) + '">';
      html += '<div class="list-item-content">';
      html += '<svg class="list-item-icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
      html += '<div class="list-item-text">';
      html += '<div class="env-name">' + escapeHtml(env.name) + '</div>';
      html += '<div class="env-value">' + escapeHtml(env.value) + '</div>';
      if (env.source) {
        html += '<div class="env-source">' + escapeHtml(env.source) + '</div>';
      }
      html += '</div>';
      html += '</div>';
      html += '<div class="env-actions">';
      html += '<button class="btn-icon btn-edit-env" data-name="' + escapeHtml(env.name) + '" data-value="' + escapeHtml(env.value) + '" data-source="' + escapeHtml(env.source || '') + '" title="' + (window.i18n ? window.i18n.t('edit') : '编辑') + '">';
      html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
      html += '</button>';
      html += '<button class="btn-icon btn-delete-env" data-name="' + escapeHtml(env.name) + '" data-source="' + escapeHtml(env.source || '') + '" title="' + (window.i18n ? window.i18n.t('delete') : '删除') + '">';
      html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>';
      html += '</button>';
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';

    result.innerHTML = html;
    result.style.display = 'block';
    void result.offsetHeight;

    // 绑定编辑按钮事件
    result.querySelectorAll('.btn-edit-env').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const name = e.currentTarget.dataset.name;
        const oldValue = e.currentTarget.dataset.value;
        const source = e.currentTarget.dataset.source;
        const newValue = await showPrompt((window.i18n ? window.i18n.t('envsEdit') : '编辑环境变量') + ' ' + name, oldValue);
        if (newValue !== null && newValue !== oldValue) {
          try {
            if (source) {
              // 持久化到 shell 配置文件
              await invoke('add_shell_env', { name, value: newValue, source });
            } else {
              // 仅当前进程生效
              await invoke('set_env', { name, value: newValue });
            }
            toast((window.i18n ? window.i18n.t('envsUpdated') : '已更新') + ': ' + name, 'success');
            await loadEnvs();
          } catch (err) {
            toast((window.i18n ? window.i18n.t('envsUpdateFailed') : '更新失败') + ': ' + err, 'error');
          }
        }
      });
    });

    // 绑定删除按钮事件
    result.querySelectorAll('.btn-delete-env').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const name = e.currentTarget.dataset.name;
        const source = e.currentTarget.dataset.source;
        const confirmed = await showConfirm(window.i18n ? window.i18n.t('envsDeleteConfirm') : '确认删除', (window.i18n ? window.i18n.t('envsDeleteMessage') : '确定要删除环境变量') + ' ' + name + ' ' + (window.i18n ? window.i18n.t('confirmDelete') : '吗？'));
        if (confirmed) {
          try {
            if (source) {
              // 从 shell 配置文件中删除
              await invoke('remove_shell_env', { name, source });
            } else {
              // 仅从当前进程删除
              await invoke('delete_env', { name });
            }
            toast((window.i18n ? window.i18n.t('envsDeleted') : '已删除') + ': ' + name, 'success');
            await loadEnvs();
          } catch (err) {
            toast((window.i18n ? window.i18n.t('envsDeleteFailed') : '删除失败') + ': ' + err, 'error');
          }
        }
      });
    });
  }

  // 加载环境变量
  async function loadEnvs() {
    setButtonLoading('#btn-envs-refresh', true, window.i18n ? window.i18n.t('envsLoading') : '正在加载...');
    try {
      // 加载 shell 配置文件中的环境变量
      const shellEnvs = await invoke('list_shell_envs');
      allEnvs = shellEnvs;
      renderEnvs(allEnvs);
    } catch (err) {
      toast((window.i18n ? window.i18n.t('envsLoadFailed') : '加载失败') + ': ' + err, 'error');
    } finally {
      setButtonLoading('#btn-envs-refresh', false);
    }
  }

  // 搜索过滤
  function filterEnvs(keyword) {
    if (!keyword) {
      renderEnvs(allEnvs);
      return;
    }
    const lower = keyword.toLowerCase();
    const filtered = allEnvs.filter(env =>
      env.name.toLowerCase().includes(lower) ||
      env.value.toLowerCase().includes(lower)
    );
    renderEnvs(filtered);
  }

  // 绑定刷新按钮
  document.querySelector('#btn-envs-refresh').addEventListener('click', async () => {
    await loadEnvs();
  });

  // 绑定新增按钮
  document.querySelector('#btn-envs-add').addEventListener('click', async () => {
    const name = await showPrompt(window.i18n ? window.i18n.t('envsInputName') : '请输入变量名:');
    if (!name) return;
    const value = await showPrompt(window.i18n ? window.i18n.t('envsInputValue') : '请输入变量值:');
    if (value === null) return;

    // 选择要写入的配置文件
    const source = await showPrompt(window.i18n ? window.i18n.t('selectConfigFile') : '选择配置文件 (.zshrc / .bash_profile / .bashrc):', '.zshrc');
    if (!source) return;

    try {
      // 持久化到 shell 配置文件
      await invoke('add_shell_env', { name, value, source });
      toast((window.i18n ? window.i18n.t('envsAdded') : '已添加') + ': ' + name, 'success');
      await loadEnvs();
    } catch (err) {
      toast((window.i18n ? window.i18n.t('envsAddFailed') : '添加失败') + ': ' + err, 'error');
    }
  });

  // 绑定搜索框
  document.querySelector('#envs-search').addEventListener('input', (e) => {
    filterEnvs(e.target.value);
  });

  // 切换到环境变量页面时自动加载
  const originalSwitchFeature = switchFeature;
  switchFeature = function(feature) {
    originalSwitchFeature(feature);
    if (feature === 'envs' && allEnvs.length === 0) {
      loadEnvs();
    }
  };

  // 监听系统托盘事件
  listen('tray-action', (event) => {
    const action = event.payload;
    if (action === 'clean') {
      switchFeature('clean');
      // 自动触发扫描
      setTimeout(() => {
        document.querySelector('#btn-scan')?.click();
      }, 100);
    } else if (action === 'status') {
      switchFeature('status');
      // 自动触发状态刷新
      setTimeout(() => {
        document.querySelector('#btn-status')?.click();
      }, 100);
    }
  });

  // 检查更新按钮
  document.querySelector('#btn-check-update')?.addEventListener('click', async () => {
    try {
      const { check } = window.__TAURI__.updater;
      setButtonLoading('#btn-check-update', true, window.i18n ? window.i18n.t('updateChecking') : '检查中...');
      
      const update = await check();
      
      if (update?.available) {
        const confirmed = await showConfirm(
          window.i18n ? window.i18n.t('updateNewVersion') : '发现新版本',
          `${window.i18n ? window.i18n.t('updateNewVersion') : '发现新版本'} ${update.version}，${window.i18n ? window.i18n.t('updateDownloadConfirm') : '是否立即下载安装？'}\n\n${window.i18n ? window.i18n.t('updateContent') : '更新内容：'}\n${update.body || (window.i18n ? window.i18n.t('none') : '无')}`
        );
        
        if (confirmed) {
          toast(window.i18n ? window.i18n.t('updateDownloading') : '开始下载更新...', 'info');
          await update.downloadAndInstall();
          toast(window.i18n ? window.i18n.t('updateComplete') : '更新安装完成，即将重启', 'success');
        }
      } else {
        toast(window.i18n ? window.i18n.t('updateLatest') : '当前已是最新版本', 'success');
      }
    } catch (err) {
      handleError(err, window.i18n ? window.i18n.t('checkUpdate') : '检查更新');
    } finally {
      setButtonLoading('#btn-check-update', false);
    }
  });

  // ========== 日志页面逻辑 ==========
  let allLogs = [];
  let currentLogFilter = 'all';

  // 渲染日志列表
  function renderLogs(logs) {
    const result = document.querySelector('#logs-result');
    const placeholder = document.querySelector('#logs-placeholder');
    const loading = document.querySelector('#logs-loading');
    
    if (loading) loading.style.display = 'none';
    
    if (!logs || logs.length === 0) {
      result.style.display = 'none';
      if (placeholder) {
        placeholder.style.display = 'flex';
        placeholder.querySelector('.placeholder-title').textContent = window.i18n ? window.i18n.t('logsNoData') : '暂无日志';
      }
      return;
    }
    
    if (placeholder) placeholder.style.display = 'none';
    result.style.display = 'block';
    
    // 反转日志顺序，最新的在上面
    const reversedLogs = [...logs].reverse();
    
    result.innerHTML = reversedLogs.map(log => {
      const levelClass = `log-${log.level.toLowerCase()}`;
      return `
        <div class="log-item ${levelClass}">
          <div class="log-header">
            <span class="log-level">${log.level}</span>
            <span class="log-module">${log.module}</span>
            <span class="log-time">${log.timestamp}</span>
          </div>
          <div class="log-message">${log.message}</div>
        </div>
      `;
    }).join('');
  }

  // 过滤日志
  function filterLogs(keyword) {
    let filtered = allLogs;
    
    // 按级别过滤
    if (currentLogFilter !== 'all') {
      filtered = filtered.filter(log => log.level === currentLogFilter);
    }
    
    // 按关键词过滤
    if (keyword) {
      const lower = keyword.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(lower) ||
        log.module.toLowerCase().includes(lower) ||
        log.level.toLowerCase().includes(lower)
      );
    }
    
    renderLogs(filtered);
  }

  // 加载日志
  async function loadLogs() {
    const loading = document.querySelector('#logs-loading');
    const placeholder = document.querySelector('#logs-placeholder');
    
    if (loading) loading.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
    
    try {
      allLogs = await invoke('get_logs');
      const searchInput = document.querySelector('#logs-search');
      filterLogs(searchInput ? searchInput.value : '');
    } catch (err) {
      handleError(err, window.i18n ? window.i18n.t('logsLoadFailed') : '加载日志');
      if (placeholder) {
        placeholder.style.display = 'flex';
        placeholder.querySelector('.placeholder-title').textContent = window.i18n ? window.i18n.t('logsLoadFailed') : '加载失败';
      }
    }
  }

  // 绑定刷新按钮
  document.querySelector('#btn-logs-refresh')?.addEventListener('click', async () => {
    await loadLogs();
  });

  // 绑定清空按钮
  document.querySelector('#btn-logs-clear')?.addEventListener('click', async () => {
    const confirmed = await showConfirm(window.i18n ? window.i18n.t('logsClearConfirm') : '确认清空', window.i18n ? window.i18n.t('logsClearMessage') : '确定要清空所有日志吗？此操作不可恢复。');
    if (!confirmed) return;
    
    try {
      await invoke('clear_logs');
      allLogs = [];
      renderLogs([]);
      toast(window.i18n ? window.i18n.t('logsCleared') : '日志已清空', 'success');
    } catch (err) {
      handleError(err, window.i18n ? window.i18n.t('logsClearConfirm') : '清空日志');
    }
  });

  // 绑定搜索框
  document.querySelector('#logs-search')?.addEventListener('input', (e) => {
    filterLogs(e.target.value);
  });

  // 绑定级别过滤按钮
  document.querySelectorAll('.log-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.log-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLogFilter = btn.dataset.level;
      const searchInput = document.querySelector('#logs-search');
      filterLogs(searchInput ? searchInput.value : '');
    });
  });

  // 切换到日志页面时自动加载
  const originalSwitchFeatureForLogs = switchFeature;
  switchFeature = function(feature) {
    originalSwitchFeatureForLogs(feature);
    if (feature === 'logs' && allLogs.length === 0) {
      loadLogs();
    }
  };

  // ========== 定时清理任务设置 ==========
  const scheduledCleanCheckbox = document.querySelector('#settings-scheduled-clean');
  const scheduledCleanInterval = document.querySelector('#scheduled-clean-interval');
  const cleanIntervalSelect = document.querySelector('#settings-clean-interval');

  // 加载定时清理配置
  async function loadScheduledCleanConfig() {
    try {
      const config = await invoke('get_scheduled_clean_config');
      if (scheduledCleanCheckbox) {
        scheduledCleanCheckbox.checked = config.enabled;
      }
      if (scheduledCleanInterval) {
        scheduledCleanInterval.style.display = config.enabled ? 'flex' : 'none';
      }
      if (cleanIntervalSelect) {
        cleanIntervalSelect.value = config.interval;
      }
    } catch (err) {
      console.error((window.i18n ? window.i18n.t('scheduledCleanLoadFailed') : '加载定时清理配置失败') + ':', err);
    }
  }

  // 定时清理开关事件
  if (scheduledCleanCheckbox) {
    scheduledCleanCheckbox.addEventListener('change', async (e) => {
      const enabled = e.target.checked;
      if (scheduledCleanInterval) {
        scheduledCleanInterval.style.display = enabled ? 'flex' : 'none';
      }
      
      try {
        const interval = cleanIntervalSelect ? cleanIntervalSelect.value : 'weekly';
        await invoke('set_scheduled_clean', { enabled, interval });
        toast(enabled ? (window.i18n ? window.i18n.t('scheduledCleanEnabled') : '定时清理已开启') : (window.i18n ? window.i18n.t('scheduledCleanDisabled') : '定时清理已关闭'), 'success');
      } catch (err) {
        handleError(err, window.i18n ? window.i18n.t('scheduledCleanSetFailed') : '设置定时清理');
        e.target.checked = !enabled; // 恢复原状态
      }
    });
  }

  // 清理频率选择事件
  if (cleanIntervalSelect) {
    cleanIntervalSelect.addEventListener('change', async (e) => {
      const interval = e.target.value;
      const enabled = scheduledCleanCheckbox ? scheduledCleanCheckbox.checked : false;
      
      try {
        await invoke('set_scheduled_clean', { enabled, interval });
        toast(window.i18n ? window.i18n.t('scheduledCleanIntervalUpdated') : '清理频率已更新', 'success');
      } catch (err) {
        handleError(err, '设置清理频率');
      }
    });
  }

  // 切换到设置页面时加载定时清理配置
  const originalSwitchFeatureForSettings = switchFeature;
  switchFeature = function(feature) {
    originalSwitchFeatureForSettings(feature);
    if (feature === 'settings') {
      loadScheduledCleanConfig();
    }
  };
  
  console.log('[DEBUG] init() 初始化完成');
  } catch (error) {
    console.error('[DEBUG] init() 初始化失败:', error);
    alert('初始化失败: ' + error.message);
  }
}

// 启动
window.addEventListener('DOMContentLoaded', init);
