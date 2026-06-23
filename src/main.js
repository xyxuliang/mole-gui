// Mole GUI 主逻辑
// 调用 Rust 后端命令实现功能，支持流式输出

const { invoke } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;

// 功能配置
const features = {
  clean: {
    title: '系统清理',
    subtitle: '清理缓存、日志和临时文件',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 6h18M3 12h18M3 18h18"/>
    </svg>`,
    event: 'scan-output',
  },
  uninstall: {
    title: '应用卸载',
    subtitle: '卸载应用及其残留文件',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    </svg>`,
    event: 'uninstall-output',
  },
  analyze: {
    title: '磁盘分析',
    subtitle: '可视化磁盘使用情况',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 21H4.6c-.56 0-.84 0-1.054-.109a1 1 0 01-.437-.437C3 20.24 3 19.96 3 19.4V3m4 14l4-4 4 4 6-6"/>
    </svg>`,
    event: 'analyze-output',
  },
  status: {
    title: '系统状态',
    subtitle: '实时系统健康监控',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>`,
    event: 'status-output',
  },
  optimize: {
    title: '系统优化',
    subtitle: '刷新缓存和系统服务',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>`,
    event: 'optimize-output',
  },
  history: {
    title: '操作历史',
    subtitle: '查看历史操作记录',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`,
    event: 'history-output',
  },
  purge: {
    title: '项目清理',
    subtitle: '清理项目构建产物',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    </svg>`,
    event: 'purge-output',
  },
  installer: {
    title: '安装包清理',
    subtitle: '查找并移除安装包文件',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>`,
    event: 'installer-output',
  },
  touchid: {
    title: 'Touch ID',
    subtitle: '配置 Touch ID 用于 sudo',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 12h20M12 2v20"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>`,
    event: 'touchid-output',
  },
  update: {
    title: '应用更新',
    subtitle: '更新 Mole 到最新版本',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
    </svg>`,
    event: 'update-output',
  },
  remove: {
    title: '应用移除',
    subtitle: '从系统中移除 Mole',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>`,
    event: 'remove-output',
  },
  completion: {
    title: 'Shell 补全',
    subtitle: '设置 Shell 自动补全',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="4 17 10 11 4 5"/>
      <line x1="12" y1="19" x2="20" y2="19"/>
    </svg>`,
    event: 'completion-output',
  },
  envs: {
    title: '环境变量',
    subtitle: '管理系统环境变量',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 6h16M4 12h16M4 18h16"/>
      <circle cx="8" cy="6" r="1" fill="currentColor"/>
      <circle cx="8" cy="12" r="1" fill="currentColor"/>
      <circle cx="8" cy="18" r="1" fill="currentColor"/>
    </svg>`,
    event: 'envs-output',
  },
};

// 当前选中的功能
let currentFeature = 'clean';

// 按钮加载状态管理
const buttonLoadingStates = new Map();

// 设置按钮加载状态
function setButtonLoading(buttonId, loading, loadingText = '处理中...') {
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
        currentGroup = { title: '其他', items: [] };
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
  if (score >= 80) return '优秀';
  if (score >= 60) return '良好';
  if (score >= 40) return '一般';
  return '较差';
}

// 渲染系统状态仪表盘
function renderStatusDashboard(text) {
  const result = document.querySelector('#status-result');
  if (!result) return;
  
  const data = parseStatusJson(text);
  if (!data) {
    result.innerHTML = '<div class="list-item"><div class="list-item-content"><div class="list-item-text">无法解析状态数据</div></div></div>';
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
  html += '<div class="status-hero-label">健康评分</div>';
  html += '<div class="status-hero-msg" style="color: ' + healthColor + '">' + (data.health_score_msg || getHealthLabel(data.health_score)) + '</div>';
  html += '</div>';
  html += '<div class="status-hero-info">';
  html += '<div class="status-hero-row"><span class="status-hero-key">主机</span><span class="status-hero-val">' + escapeHtml(data.host || '') + '</span></div>';
  html += '<div class="status-hero-row"><span class="status-hero-key">系统</span><span class="status-hero-val">' + escapeHtml(data.platform || '') + '</span></div>';
  html += '<div class="status-hero-row"><span class="status-hero-key">运行时间</span><span class="status-hero-val">' + escapeHtml(data.uptime || '') + '</span></div>';
  html += '<div class="status-hero-row"><span class="status-hero-key">进程数</span><span class="status-hero-val">' + (data.procs || 0) + '</span></div>';
  html += '</div>';
  html += '</div>';
  
  // 硬件信息
  const hw = data.hardware || {};
  html += '<div class="status-section">';
  html += '<div class="status-section-title">硬件信息</div>';
  html += '<div class="status-grid">';
  html += '<div class="status-card"><div class="status-card-label">机型</div><div class="status-card-value">' + escapeHtml(hw.model || '-') + '</div></div>';
  html += '<div class="status-card"><div class="status-card-label">处理器</div><div class="status-card-value">' + escapeHtml(hw.cpu_model || '-') + '</div></div>';
  html += '<div class="status-card"><div class="status-card-label">内存</div><div class="status-card-value">' + escapeHtml(hw.total_ram || '-') + '</div></div>';
  html += '<div class="status-card"><div class="status-card-label">磁盘</div><div class="status-card-value">' + escapeHtml(hw.disk_size || '-') + '</div></div>';
  html += '<div class="status-card"><div class="status-card-label">系统版本</div><div class="status-card-value">' + escapeHtml(hw.os_version || '-') + '</div></div>';
  html += '<div class="status-card"><div class="status-card-label">刷新率</div><div class="status-card-value">' + escapeHtml(hw.refresh_rate || '-') + '</div></div>';
  html += '</div>';
  html += '</div>';
  
  // CPU 使用率
  const cpu = data.cpu || {};
  const cpuUsage = Math.round(cpu.usage || 0);
  const cpuColor = cpuUsage > 80 ? 'var(--error)' : cpuUsage > 60 ? 'var(--warning)' : 'var(--success)';
  html += '<div class="status-section">';
  html += '<div class="status-section-title">CPU 使用率</div>';
  html += '<div class="status-meter">';
  html += '<div class="status-meter-header"><span class="status-meter-label">总使用率</span><span class="status-meter-value" style="color:' + cpuColor + '">' + cpuUsage + '%</span></div>';
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
  html += '<div class="status-load-item"><span class="status-load-label">1分钟</span><span class="status-load-value">' + (cpu.load1 || 0).toFixed(2) + '</span></div>';
  html += '<div class="status-load-item"><span class="status-load-label">5分钟</span><span class="status-load-value">' + (cpu.load5 || 0).toFixed(2) + '</span></div>';
  html += '<div class="status-load-item"><span class="status-load-label">15分钟</span><span class="status-load-value">' + (cpu.load15 || 0).toFixed(2) + '</span></div>';
  html += '</div>';
  html += '</div>';
  
  // 内存使用率
  const mem = data.memory || {};
  const memUsed = mem.used || 0;
  const memTotal = mem.total || 1;
  const memPercent = Math.round((memUsed / memTotal) * 100);
  const memColor = memPercent > 80 ? 'var(--error)' : memPercent > 60 ? 'var(--warning)' : 'var(--success)';
  html += '<div class="status-section">';
  html += '<div class="status-section-title">内存使用</div>';
  html += '<div class="status-meter">';
  html += '<div class="status-meter-header"><span class="status-meter-label">已用 / 总计</span><span class="status-meter-value" style="color:' + memColor + '">' + memPercent + '%</span></div>';
  html += '<div class="status-meter-bar"><div class="status-meter-fill" style="width:' + memPercent + '%;background:' + memColor + '"></div></div>';
  html += '<div class="status-meter-detail"><span>' + formatBytes(memUsed) + ' / ' + formatBytes(memTotal) + '</span><span>可用: ' + formatBytes(mem.available || 0) + '</span></div>';
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
    html += '<div class="status-section-title">磁盘使用</div>';
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
      html += '<div class="status-card"><div class="status-card-label">名称</div><div class="status-card-value">' + escapeHtml(gpu.name || '-') + '</div></div>';
      html += '<div class="status-card"><div class="status-card-label">核心数</div><div class="status-card-value">' + (gpu.core_count || '-') + '</div></div>';
    }
    html += '</div>';
    html += '</div>';
  }
  
  // 网络信息
  const networks = data.network || [];
  if (networks.length > 0) {
    html += '<div class="status-section">';
    html += '<div class="status-section-title">网络</div>';
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
    result.innerHTML = '<div class="list-item"><div class="list-item-content"><div class="list-item-text">无数据</div></div></div>';
    result.style.display = 'block';
    void result.offsetHeight;
    return;
  }
  
  // 按大小排序
  entries.sort((a, b) => b.size - a.size);
  
  let html = '<div class="list-group">';
  html += '<div class="list-group-title">磁盘空间占用</div>';
  
  for (const entry of entries) {
    const iconSvg = entry.cleanable
      ? '<svg class="list-item-icon warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
      : entry.insight
        ? '<svg class="list-item-icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
        : '<svg class="list-item-icon default" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>';
    
    const cleanableTag = entry.cleanable ? '<span class="tag tag-cleanable">可清理</span>' : '';
    
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
    result.innerHTML = '<div class="list-item"><div class="list-item-content"><div class="list-item-text">无数据</div></div></div>';
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
  
  let html = '<div class="list-group">';
  html += `<div class="list-group-title">已安装应用 (${apps.length})</div>`;
  
  for (const app of apps) {
    html += '<div class="list-item list-item-app">';
    html += '<div class="list-item-content">';
    html += '<svg class="list-item-icon default" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>';
    html += `<div class="list-item-text">${escapeHtml(app.name)}</div>`;
    html += '</div>';
    html += `<div class="list-item-size">${escapeHtml(app.size)}</div>`;
    html += `<button class="btn-uninstall" data-app="${escapeHtml(app.uninstall_name)}" title="卸载 ${escapeHtml(app.name)}">卸载</button>`;
    html += '</div>';
  }
  
  html += '</div>';
  
  result.innerHTML = html;
  result.style.display = 'block';
  void result.offsetHeight;
  
  // 绑定卸载按钮事件
  result.querySelectorAll('.btn-uninstall').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const appName = btn.dataset.app;
      btn.textContent = '卸载中...';
      btn.disabled = true;
      
      try {
        const res = await invoke('uninstall', { app_name: appName });
        if (res.exit_code === 0) {
          btn.textContent = '已卸载';
          btn.classList.add('uninstalled');
          // 移除对应的列表项
          const listItem = btn.closest('.list-item');
          if (listItem) {
            listItem.style.opacity = '0.4';
          }
        } else {
          btn.textContent = '失败';
          btn.disabled = false;
          alert(`卸载失败: ${res.stderr}`);
        }
      } catch (err) {
        btn.textContent = '失败';
        btn.disabled = false;
        alert(`卸载出错: ${err}`);
      }
    });
  });
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
    result.innerHTML = '<div class="list-item"><div class="list-item-content"><div class="list-item-text">无数据</div></div></div>';
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
  const loadingText = '扫描中...';
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
    appendOutput(feature, `\n错误: ${e}`);
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
    result.innerHTML = '<div class="list-item"><div class="list-item-content"><div class="list-item-text">无可优化项</div></div></div>';
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

// 初始化
async function init() {
  // 初始化主题
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  // 绑定主题切换按钮
  document.querySelector('#theme-toggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
  
  // 检查 Mole 是否安装
  const installed = await invoke('is_installed');
  if (!installed) {
    document.querySelector('#version-info').textContent = 'Mole 未安装';
    return;
  }
  
  // 获取版本信息
  try {
    const result = await invoke('get_version');
    if (result.is_success) {
      const lines = result.stdout.trim().split('\n');
      document.querySelector('#version-info').textContent = lines[0] || 'Mole';
    } else {
      document.querySelector('#version-info').textContent = 'Mole';
    }
  } catch (e) {
    document.querySelector('#version-info').textContent = 'Mole';
  }
  
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
  document.querySelector('#btn-scan').addEventListener('click', async () => {
    await executeWithStreaming('clean', () => invoke('scan_cleanable'));
  });
  
  // 绑定清理按钮 - 立即清理
  document.querySelector('#btn-clean').addEventListener('click', async () => {
    await executeWithStreaming('clean', () => invoke('clean'));
  });
  
  // 绑定卸载按钮
  document.querySelector('#btn-scan-apps').addEventListener('click', async () => {
    await executeWithStreaming('uninstall', () => invoke('scan_apps'));
  });
  
  // 绑定分析按钮
  document.querySelector('#btn-analyze').addEventListener('click', async () => {
    await executeWithStreaming('analyze', () => invoke('analyze', { path: null }));
  });
  
  // 绑定状态按钮
  document.querySelector('#btn-status').addEventListener('click', async () => {
    await executeWithStreaming('status', () => invoke('status'));
  });
  
  // 绑定优化扫描按钮
  document.querySelector('#btn-optimize-scan').addEventListener('click', async () => {
    await executeWithStreaming('optimize', () => invoke('optimize'));
    // 扫描完成后启用执行优化按钮
    const runBtn = document.querySelector('#btn-optimize-run');
    const stopBtn = document.querySelector('#btn-optimize-stop');
    if (runBtn) runBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = false;
  });
  
  // 绑定执行优化按钮
  document.querySelector('#btn-optimize-run').addEventListener('click', async () => {
    const confirmed = await confirm('确定要执行选中的优化项吗？');
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
  document.querySelector('#btn-optimize-stop').addEventListener('click', async () => {
    await invoke('stop_command', { command: 'optimize' });
    const runBtn = document.querySelector('#btn-optimize-run');
    const stopBtn = document.querySelector('#btn-optimize-stop');
    if (runBtn) runBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
  });
  
  // 绑定历史按钮
  document.querySelector('#btn-history').addEventListener('click', async () => {
    await executeWithStreaming('history', () => invoke('history'));
  });
  
  // 绑定历史 JSON 按钮
  document.querySelector('#btn-history-json').addEventListener('click', async () => {
    await executeWithStreaming('history', () => invoke('history_json'));
  });
  
  // 绑定项目清理按钮 - 扫描
  document.querySelector('#btn-purge').addEventListener('click', async () => {
    await executeWithStreaming('purge', () => invoke('purge_dry_run'));
  });
  
  // 绑定项目清理按钮 - 预览清理
  document.querySelector('#btn-purge-dry-run').addEventListener('click', async () => {
    await executeWithStreaming('purge', () => invoke('purge_dry_run'));
  });
  
  // 绑定项目清理按钮 - 清理项目
  document.querySelector('#btn-purge-clean').addEventListener('click', async () => {
    await executeWithStreaming('purge', () => invoke('purge'));
  });
  
  // 绑定项目清理按钮 - 扫描目录
  document.querySelector('#btn-purge-paths').addEventListener('click', async () => {
    await executeWithStreaming('purge', () => invoke('purge_paths'));
  });
  
  // 绑定安装包清理按钮
  document.querySelector('#btn-installer').addEventListener('click', async () => {
    await executeWithStreaming('installer', () => invoke('installer'));
  });
  
  document.querySelector('#btn-installer-clean').addEventListener('click', async () => {
    await executeWithStreaming('installer', () => invoke('installer'));
  });
  
  // 绑定 Touch ID 按钮
  document.querySelector('#btn-touchid').addEventListener('click', async () => {
    await executeWithStreaming('touchid', () => invoke('touchid'));
  });
  
  // 绑定 Touch ID 启用按钮
  document.querySelector('#btn-touchid-enable').addEventListener('click', async () => {
    await executeWithStreaming('touchid', () => invoke('touchid_enable'));
  });
  
  // 绑定应用更新按钮
  document.querySelector('#btn-update').addEventListener('click', async () => {
    await executeWithStreaming('update', () => invoke('update'));
  });
  
  // 绑定应用移除按钮
  document.querySelector('#btn-remove').addEventListener('click', async () => {
    await executeWithStreaming('remove', () => invoke('remove'));
  });
  
  // 绑定清理白名单按钮
  document.querySelector('#btn-clean-whitelist').addEventListener('click', async () => {
    await executeWithStreaming('clean', () => invoke('clean_whitelist'));
  });
  
  // 绑定优化白名单按钮
  document.querySelector('#btn-optimize-whitelist').addEventListener('click', async () => {
    await executeWithStreaming('optimize', () => invoke('optimize_whitelist'));
  });
  
  // 绑定 Shell 补全按钮
  document.querySelector('#btn-completion').addEventListener('click', async () => {
    await executeWithStreaming('completion', () => invoke('completion'));
  });

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
      result.innerHTML = '<div class="list-item"><div class="list-item-content"><div class="list-item-text">无环境变量</div></div></div>';
      void result.offsetHeight;
      return;
    }

    let html = '<div class="list-group">';
    html += '<div class="list-group-title">环境变量 (' + envs.length + ')</div>';

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
      html += '<button class="btn-icon btn-edit-env" data-name="' + escapeHtml(env.name) + '" data-value="' + escapeHtml(env.value) + '" data-source="' + escapeHtml(env.source || '') + '" title="编辑">';
      html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
      html += '</button>';
      html += '<button class="btn-icon btn-delete-env" data-name="' + escapeHtml(env.name) + '" data-source="' + escapeHtml(env.source || '') + '" title="删除">';
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
        const newValue = await showPrompt('编辑环境变量 ' + name, oldValue);
        if (newValue !== null && newValue !== oldValue) {
          try {
            if (source) {
              // 持久化到 shell 配置文件
              await invoke('add_shell_env', { name, value: newValue, source });
            } else {
              // 仅当前进程生效
              await invoke('set_env', { name, value: newValue });
            }
            toast('已更新: ' + name, 'success');
            await loadEnvs();
          } catch (err) {
            toast('更新失败: ' + err, 'error');
          }
        }
      });
    });

    // 绑定删除按钮事件
    result.querySelectorAll('.btn-delete-env').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const name = e.currentTarget.dataset.name;
        const source = e.currentTarget.dataset.source;
        const confirmed = await showConfirm('确认删除', '确定要删除环境变量 ' + name + ' 吗？');
        if (confirmed) {
          try {
            if (source) {
              // 从 shell 配置文件中删除
              await invoke('remove_shell_env', { name, source });
            } else {
              // 仅从当前进程删除
              await invoke('delete_env', { name });
            }
            toast('已删除: ' + name, 'success');
            await loadEnvs();
          } catch (err) {
            toast('删除失败: ' + err, 'error');
          }
        }
      });
    });
  }

  // 加载环境变量
  async function loadEnvs() {
    setButtonLoading('#btn-envs-refresh', true, '正在加载...');
    try {
      // 加载 shell 配置文件中的环境变量
      const shellEnvs = await invoke('list_shell_envs');
      allEnvs = shellEnvs;
      renderEnvs(allEnvs);
    } catch (err) {
      toast('加载失败: ' + err, 'error');
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
    const name = await showPrompt('请输入变量名:');
    if (!name) return;
    const value = await showPrompt('请输入变量值:');
    if (value === null) return;

    // 选择要写入的配置文件
    const source = await showPrompt('选择配置文件 (.zshrc / .bash_profile / .bashrc):', '.zshrc');
    if (!source) return;

    try {
      // 持久化到 shell 配置文件
      await invoke('add_shell_env', { name, value, source });
      toast('已添加: ' + name, 'success');
      await loadEnvs();
    } catch (err) {
      toast('添加失败: ' + err, 'error');
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
}

// 启动
window.addEventListener('DOMContentLoaded', init);
