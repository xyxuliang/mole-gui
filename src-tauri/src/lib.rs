// Mole CLI 封装层
// 提供对 Mole 命令行工具的调用接口，支持流式输出

use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{Emitter, Manager, menu::{Menu, MenuItem}, tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState}};
use wait_timeout::ChildExt;

// 全局存储正在运行的进程ID
lazy_static::lazy_static! {
    static ref RUNNING_PIDS: Arc<Mutex<std::collections::HashMap<String, u32>>> = 
        Arc::new(Mutex::new(std::collections::HashMap::new()));
    static ref LOGS: Arc<Mutex<Vec<LogEntry>>> = Arc::new(Mutex::new(Vec::new()));
}

/// 日志条目
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: String,
    pub module: String,
    pub message: String,
}

/// 记录日志
fn log(level: &str, module: &str, message: &str) {
    let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    // 同时输出到控制台
    println!("[{}] [{}] [{}] {}", timestamp, level, module, message);
    
    let entry = LogEntry {
        timestamp,
        level: level.to_string(),
        module: module.to_string(),
        message: message.to_string(),
    };
    
    if let Ok(mut logs) = LOGS.lock() {
        logs.push(entry);
        // 只保留最近 1000 条日志
        if logs.len() > 1000 {
            logs.remove(0);
        }
    }
}

/// 获取日志列表
#[tauri::command]
fn get_logs() -> Result<Vec<LogEntry>, String> {
    LOGS.lock()
        .map(|logs| logs.clone())
        .map_err(|e| format!("获取日志失败: {}", e))
}

/// 清空日志
#[tauri::command]
fn clear_logs() -> Result<(), String> {
    LOGS.lock()
        .map(|mut logs| logs.clear())
        .map_err(|e| format!("清空日志失败: {}", e))
}

/// 移除 ANSI 转义序列
fn strip_ansi_codes(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    
    while let Some(c) = chars.next() {
        if c == '\x1b' {
            // 跳过 ESC [
            if chars.peek() == Some(&'[') {
                chars.next();
                // 跳过所有数字和分号
                while let Some(&next) = chars.peek() {
                    if next.is_ascii_digit() || next == ';' {
                        chars.next();
                    } else {
                        break;
                    }
                }
                // 跳过结尾的 m
                if chars.peek() == Some(&'m') {
                    chars.next();
                }
            }
        } else {
            result.push(c);
        }
    }
    
    result
}

/// Mole 命令执行结果
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MoleResult {
    /// 退出码，0 表示成功
    pub exit_code: i32,
    /// 标准输出内容
    pub stdout: String,
    /// 标准错误内容
    pub stderr: String,
}

impl MoleResult {
    /// 是否执行成功
    pub fn is_success(&self) -> bool {
        self.exit_code == 0
    }
}

/// 流式输出事件数据
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StreamEvent {
    /// 事件类型：stdout, stderr, done
    pub event_type: String,
    /// 输出内容
    pub data: String,
    /// 退出码（仅 done 事件）
    pub exit_code: Option<i32>,
}

/// 使用 which 命令查找可执行文件路径
fn which_binary(name: &str) -> Option<std::path::PathBuf> {
    std::process::Command::new("which")
        .arg(name)
        .output()
        .ok()
        .and_then(|output| {
            if output.status.success() {
                let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if !path.is_empty() {
                    return Some(std::path::PathBuf::from(path));
                }
            }
            None
        })
}

/// 获取 Mole 可执行文件路径
/// 按优先级检测：
/// 1. 应用内置 mole（打包模式）
/// 2. 系统 PATH 中的 mo（通过 which 查找）
/// 3. 常见安装路径（Homebrew Intel/Apple Silicon）
/// 4. 用户自定义路径（环境变量 MOLE_PATH）
fn get_mole_path(app: &tauri::AppHandle) -> std::path::PathBuf {
    use tauri::Manager;
    
    // 1. 检查用户自定义路径（最高优先级）
    if let Ok(custom_path) = std::env::var("MOLE_PATH") {
        let path = std::path::PathBuf::from(&custom_path);
        if path.exists() {
            return path;
        }
    }
    
    // 2. 检查应用内置 mole（打包模式）
    if let Some(resource_dir) = app.path().resource_dir().ok() {
        // 尝试多种可能的内置路径
        let builtin_paths = [
            resource_dir.join("bin").join("mole"),
            resource_dir.join("bin").join("mo"),
            resource_dir.join("mole"),
            resource_dir.join("mo"),
        ];
        for mole_path in &builtin_paths {
            if mole_path.exists() {
                return mole_path.clone();
            }
        }
    }
    
    // 3. 通过 which 命令查找系统中的 mo
    if let Some(which_path) = which_binary("mo") {
        return which_path;
    }
    
    // 4. 检查常见安装路径
    let common_paths = [
        // Apple Silicon Homebrew
        "/opt/homebrew/bin/mo",
        // Intel Homebrew
        "/usr/local/bin/mo",
        // 用户本地安装
        "/usr/local/bin/mole",
        // MacPorts
        "/opt/local/bin/mo",
    ];
    
    for path in &common_paths {
        let path_buf = std::path::PathBuf::from(path);
        if path_buf.exists() {
            return path_buf;
        }
    }
    
    // 5. 回退到默认路径（即使不存在，让错误信息更明确）
    std::path::PathBuf::from("/opt/homebrew/bin/mo")
}

/// 执行 Mole 命令（流式输出版本）
/// # Arguments
/// * `app` - Tauri 应用句柄，用于发送事件
/// * `args` - 命令参数列表
/// * `event_name` - 事件名称
fn execute_mole_streaming(
    app: &tauri::AppHandle,
    args: Vec<String>,
    event_name: &str,
) -> MoleResult {
    let mole_path = get_mole_path(app);
    let args_refs: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    
    // 记录命令执行日志
    let command = args_refs.join(" ");
    log("INFO", "command", &format!("执行命令: {} {}", mole_path.display(), command));

    // 启动命令，使用 piped stdin/stdout/stderr
    let mut child = match Command::new(&mole_path)
        .args(&args_refs)
        .env("MOLE_LIBEXEC", mole_path.parent().unwrap().parent().unwrap().join("libexec"))
        .env("PYTHONUNBUFFERED", "1")  // 强制 Python 无缓冲输出
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
    {
        Ok(child) => {
            log("INFO", "command", &format!("命令启动成功，PID: {}", child.id()));
            child
        },
        Err(e) => {
            let error_msg = format!("启动命令失败: {}", e);
            log("ERROR", "command", &error_msg);
            
            let _ = app.emit(
                event_name,
                StreamEvent {
                    event_type: "stderr".to_string(),
                    data: error_msg.clone(),
                    exit_code: None,
                },
            );
            let _ = app.emit(
                event_name,
                StreamEvent {
                    event_type: "done".to_string(),
                    data: String::new(),
                    exit_code: Some(-1),
                },
            );
            return MoleResult {
                exit_code: -1,
                stdout: String::new(),
                stderr: error_msg,
            };
        }
    };

    // 存储进程PID到全局HashMap
    let command_key = event_name.replace("-output", "");
    let pid = child.id();
    {
        let mut pids = RUNNING_PIDS.lock().unwrap();
        pids.insert(command_key.clone(), pid);
    }

    let stdout = child.stdout.take();
    let stderr = child.stderr.take();

    let full_stdout = Arc::new(Mutex::new(String::new()));
    let full_stderr = Arc::new(Mutex::new(String::new()));

    // 使用两个线程并发读取 stdout 和 stderr，避免死锁
    let stdout_thread = if let Some(stdout) = stdout {
        let app_clone = app.clone();
        let event_name = event_name.to_string();
        let full_stdout_clone = Arc::clone(&full_stdout);

        Some(thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                if let Ok(line) = line {
                    // 清理 ANSI 转义序列
                    let clean_line = strip_ansi_codes(&line);
                    let output_line = format!("{}\n", clean_line);
                    {
                        let mut stdout_lock = full_stdout_clone.lock().unwrap();
                        stdout_lock.push_str(&output_line);
                    }
                    let _ = app_clone.emit(
                        &event_name,
                        StreamEvent {
                            event_type: "stdout".to_string(),
                            data: output_line,
                            exit_code: None,
                        },
                    );
                }
            }
        }))
    } else {
        None
    };

    let stderr_thread = if let Some(stderr) = stderr {
        let app_clone = app.clone();
        let event_name = event_name.to_string();
        let full_stderr_clone = Arc::clone(&full_stderr);

        Some(thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                if let Ok(line) = line {
                    // 清理 ANSI 转义序列
                    let clean_line = strip_ansi_codes(&line);
                    let output_line = format!("{}\n", clean_line);
                    {
                        let mut stderr_lock = full_stderr_clone.lock().unwrap();
                        stderr_lock.push_str(&output_line);
                    }
                    let _ = app_clone.emit(
                        &event_name,
                        StreamEvent {
                            event_type: "stderr".to_string(),
                            data: output_line,
                            exit_code: None,
                        },
                    );
                }
            }
        }))
    } else {
        None
    };

    // 等待两个读取线程完成，设置超时机制（5分钟）
    let timeout_duration = std::time::Duration::from_secs(300);
    let start_time = std::time::Instant::now();

    if let Some(thread) = stdout_thread {
        // 等待线程完成或超时
        let mut timeout_triggered = false;
        loop {
            if thread.is_finished() {
                break;
            }
            if start_time.elapsed() > timeout_duration {
                // 超时，发送SIGTERM
                let _ = std::process::Command::new("kill")
                    .arg("-15")
                    .arg(pid.to_string())
                    .output();
                timeout_triggered = true;
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(100));
        }
        let _ = thread.join();
    }

    if let Some(thread) = stderr_thread {
        let mut timeout_triggered = false;
        loop {
            if thread.is_finished() {
                break;
            }
            if start_time.elapsed() > timeout_duration {
                let _ = std::process::Command::new("kill")
                    .arg("-15")
                    .arg(pid.to_string())
                    .output();
                timeout_triggered = true;
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(100));
        }
        let _ = thread.join();
    }

    // 等待进程完成，设置超时（最多再等5秒）
    let exit_code = match child.wait_timeout(std::time::Duration::from_secs(5)) {
        Ok(Some(status)) => status.code().unwrap_or(-1),
        Ok(None) => {
            log("WARN", "command", &format!("命令执行超时，强制终止 PID: {}", pid));
            // 超时，强制终止
            let _ = std::process::Command::new("kill")
                .arg("-9")
                .arg(pid.to_string())
                .output();
            -1
        }
        Err(_) => {
            log("ERROR", "command", "等待进程完成时出错");
            // 等待出错
            -1
        }
    };

    // 从RUNNING_PIDS中移除已完成的进程（修复内存泄漏）
    if let Ok(mut pids) = RUNNING_PIDS.lock() {
        pids.remove(&command_key);
    }

    // 记录命令执行结果
    let result_level = if exit_code == 0 { "INFO" } else { "WARN" };
    log(result_level, "command", &format!("命令执行完成，退出码: {}", exit_code));

    // 发送完成事件
    let _ = app.emit(
        event_name,
        StreamEvent {
            event_type: "done".to_string(),
            data: String::new(),
            exit_code: Some(exit_code),
        },
    );

    // 安全地获取输出结果，避免panic
    let stdout_result = full_stdout
        .lock()
        .map(|guard| guard.clone())
        .unwrap_or_default();
    let stderr_result = full_stderr
        .lock()
        .map(|guard| guard.clone())
        .unwrap_or_default();

    MoleResult {
        exit_code,
        stdout: stdout_result,
        stderr: stderr_result,
    }
}

/// 执行 Mole 命令（流式输出版本，带输入）
/// # Arguments
/// * `app` - Tauri 应用句柄，用于发送事件
/// * `args` - 命令参数列表
/// * `event_name` - 事件名称
/// * `input` - 要通过 stdin 传递的输入内容
fn execute_mole_streaming_with_input(
    app: &tauri::AppHandle,
    args: Vec<String>,
    event_name: &str,
    input: &str,
) -> MoleResult {
    let mole_path = get_mole_path(app);
    let args_refs: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    
    // 记录命令执行日志
    let command = args_refs.join(" ");
    log("INFO", "command", &format!("执行命令（带输入）: {} {}", mole_path.display(), command));

    // 启动命令，使用 piped stdin/stdout/stderr
    let mut child = match Command::new(&mole_path)
        .args(&args_refs)
        .env("MOLE_LIBEXEC", mole_path.parent().unwrap().parent().unwrap().join("libexec"))
        .env("PYTHONUNBUFFERED", "1")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
    {
        Ok(child) => {
            log("INFO", "command", &format!("命令启动成功，PID: {}", child.id()));
            child
        },
        Err(e) => {
            let error_msg = format!("启动命令失败: {}", e);
            log("ERROR", "command", &error_msg);
            
            let _ = app.emit(
                event_name,
                StreamEvent {
                    event_type: "stderr".to_string(),
                    data: error_msg.clone(),
                    exit_code: None,
                },
            );
            let _ = app.emit(
                event_name,
                StreamEvent {
                    event_type: "done".to_string(),
                    data: String::new(),
                    exit_code: Some(-1),
                },
            );
            return MoleResult {
                exit_code: -1,
                stdout: String::new(),
                stderr: error_msg,
            };
        }
    };

    // 写入输入内容到 stdin
    if let Some(mut stdin) = child.stdin.take() {
        use std::io::Write;
        if let Err(e) = stdin.write_all(input.as_bytes()) {
            log("WARN", "command", &format!("写入 stdin 失败: {}", e));
        }
        // 关闭 stdin
        drop(stdin);
    }

    // 存储进程PID到全局HashMap
    let command_key = event_name.replace("-output", "");
    let pid = child.id();
    {
        let mut pids = RUNNING_PIDS.lock().unwrap();
        pids.insert(command_key.clone(), pid);
    }

    let stdout = child.stdout.take();
    let stderr = child.stderr.take();

    let full_stdout = Arc::new(Mutex::new(String::new()));
    let full_stderr = Arc::new(Mutex::new(String::new()));

    // 使用两个线程并发读取 stdout 和 stderr，避免死锁
    let stdout_thread = if let Some(stdout) = stdout {
        let app_clone = app.clone();
        let event_name = event_name.to_string();
        let full_stdout_clone = Arc::clone(&full_stdout);

        Some(thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                if let Ok(line) = line {
                    let clean_line = strip_ansi_codes(&line);
                    let output_line = format!("{}\n", clean_line);
                    {
                        let mut stdout_lock = full_stdout_clone.lock().unwrap();
                        stdout_lock.push_str(&output_line);
                    }
                    let _ = app_clone.emit(
                        &event_name,
                        StreamEvent {
                            event_type: "stdout".to_string(),
                            data: output_line,
                            exit_code: None,
                        },
                    );
                }
            }
        }))
    } else {
        None
    };

    let stderr_thread = if let Some(stderr) = stderr {
        let app_clone = app.clone();
        let event_name = event_name.to_string();
        let full_stderr_clone = Arc::clone(&full_stderr);

        Some(thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                if let Ok(line) = line {
                    let clean_line = strip_ansi_codes(&line);
                    let output_line = format!("{}\n", clean_line);
                    {
                        let mut stderr_lock = full_stderr_clone.lock().unwrap();
                        stderr_lock.push_str(&output_line);
                    }
                    let _ = app_clone.emit(
                        &event_name,
                        StreamEvent {
                            event_type: "stderr".to_string(),
                            data: output_line,
                            exit_code: None,
                        },
                    );
                }
            }
        }))
    } else {
        None
    };

    // 等待两个读取线程完成，设置超时机制（5分钟）
    let timeout_duration = std::time::Duration::from_secs(300);
    let start_time = std::time::Instant::now();

    if let Some(thread) = stdout_thread {
        let mut timeout_triggered = false;
        loop {
            if thread.is_finished() {
                break;
            }
            if start_time.elapsed() > timeout_duration {
                let _ = std::process::Command::new("kill")
                    .arg("-15")
                    .arg(pid.to_string())
                    .output();
                timeout_triggered = true;
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(100));
        }
        let _ = thread.join();
    }

    if let Some(thread) = stderr_thread {
        let mut timeout_triggered = false;
        loop {
            if thread.is_finished() {
                break;
            }
            if start_time.elapsed() > timeout_duration {
                let _ = std::process::Command::new("kill")
                    .arg("-15")
                    .arg(pid.to_string())
                    .output();
                timeout_triggered = true;
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(100));
        }
        let _ = thread.join();
    }

    // 等待进程完成，设置超时（最多再等5秒）
    let exit_code = match child.wait_timeout(std::time::Duration::from_secs(5)) {
        Ok(Some(status)) => status.code().unwrap_or(-1),
        Ok(None) => {
            log("WARN", "command", &format!("命令执行超时，强制终止 PID: {}", pid));
            let _ = std::process::Command::new("kill")
                .arg("-9")
                .arg(pid.to_string())
                .output();
            -1
        }
        Err(_) => {
            log("ERROR", "command", "等待进程完成时出错");
            -1
        }
    };

    // 从RUNNING_PIDS中移除已完成的进程
    if let Ok(mut pids) = RUNNING_PIDS.lock() {
        pids.remove(&command_key);
    }

    // 记录命令执行结果
    let result_level = if exit_code == 0 { "INFO" } else { "WARN" };
    log(result_level, "command", &format!("命令执行完成，退出码: {}", exit_code));

    // 发送完成事件
    let _ = app.emit(
        event_name,
        StreamEvent {
            event_type: "done".to_string(),
            data: String::new(),
            exit_code: Some(exit_code),
        },
    );

    // 安全地获取输出结果
    let stdout_result = full_stdout
        .lock()
        .map(|guard| guard.clone())
        .unwrap_or_default();
    let stderr_result = full_stderr
        .lock()
        .map(|guard| guard.clone())
        .unwrap_or_default();

    MoleResult {
        exit_code,
        stdout: stdout_result,
        stderr: stderr_result,
    }
}

/// 停止正在运行的命令
/// 先尝试 SIGTERM 优雅终止，等待 2 秒后若进程仍在运行则使用 SIGKILL 强制终止
#[tauri::command]
fn stop_command(command: String) -> Result<String, String> {
    let pid = {
        let pids = RUNNING_PIDS.lock().map_err(|e| format!("锁获取失败: {}", e))?;
        pids.get(&command).copied()
    };
    
    if let Some(pid) = pid {
        // 先尝试 SIGTERM 优雅终止
        let _ = std::process::Command::new("kill")
            .arg("-15") // SIGTERM
            .arg(pid.to_string())
            .output();
        
        // 等待进程退出（最多 2 秒）
        for _ in 0..20 {
            std::thread::sleep(std::time::Duration::from_millis(100));
            // 检查进程是否还在运行
            let check = std::process::Command::new("kill")
                .arg("-0") // 仅检查进程是否存在
                .arg(pid.to_string())
                .output();
            
            if check.is_err() || !check.unwrap().status.success() {
                // 进程已退出，从 HashMap 中移除
                if let Ok(mut pids) = RUNNING_PIDS.lock() {
                    pids.remove(&command);
                }
                return Ok(format!("已停止命令: {}", command));
            }
        }
        
        // 进程仍在运行，使用 SIGKILL 强制终止
        let output = std::process::Command::new("kill")
            .arg("-9") // SIGKILL
            .arg(pid.to_string())
            .output()
            .map_err(|e| format!("强制终止失败: {}", e))?;
        
        // 从 HashMap 中移除 PID
        if let Ok(mut pids) = RUNNING_PIDS.lock() {
            pids.remove(&command);
        }
        
        if output.status.success() {
            Ok(format!("已强制停止命令: {}", command))
        } else {
            Err(format!("停止命令失败: {}", String::from_utf8_lossy(&output.stderr)))
        }
    } else {
        Err(format!("未找到正在运行的命令: {}", command))
    }
}

/// 获取 Mole 版本信息
#[tauri::command]
async fn get_version(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["--version".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "version-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 扫描可清理项目（dry-run 模式）- 流式输出
#[tauri::command]
async fn scan_cleanable(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["clean".to_string(), "--dry-run".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "scan-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 执行系统清理 - 流式输出
#[tauri::command]
async fn clean(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["clean".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "scan-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 扫描可卸载的应用 - 流式输出（使用 --list 获取 JSON 列表）
#[tauri::command]
async fn scan_apps(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["uninstall".to_string(), "--list".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "uninstall-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 卸载指定应用 - 流式输出（自动确认）
#[tauri::command]
async fn uninstall(app: tauri::AppHandle, app_name: String) -> MoleResult {
    let args = vec!["uninstall".to_string(), app_name];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming_with_input(&app, args, "uninstall-output", "y\n")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 分析磁盘使用情况 - 流式输出（使用 --json 非交互式）
#[tauri::command]
async fn analyze(app: tauri::AppHandle, path: Option<String>) -> MoleResult {
    let args = if let Some(p) = path {
        vec!["analyze".to_string(), "--json".to_string(), p]
    } else {
        vec!["analyze".to_string(), "--json".to_string()]
    };
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "analyze-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 查看系统状态 - 流式输出
#[tauri::command]
async fn status(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["status".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "status-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 优化系统（预览模式） - 流式输出
#[tauri::command]
async fn optimize(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["optimize".to_string(), "--dry-run".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "optimize-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 执行系统优化 - 流式输出
#[tauri::command]
async fn optimize_run(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["optimize".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "optimize-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 清理项目构建产物 - 流式输出
#[tauri::command]
async fn purge(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["purge".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "purge-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 查看操作历史 - 流式输出
#[tauri::command]
async fn history(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["history".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "history-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 安装包文件信息
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstallerFile {
    /// 文件路径
    pub path: String,
    /// 文件名
    pub name: String,
    /// 文件大小（字节）
    pub size: u64,
    /// 文件类型（dmg, pkg, iso, xip, zip）
    pub file_type: String,
    /// 最后修改时间
    pub modified: String,
}

/// 扫描安装包文件
#[tauri::command]
async fn scan_installers() -> Result<String, String> {
    let home = std::env::var("HOME").map_err(|e| format!("获取HOME失败: {}", e))?;
    
    // 扫描目录列表
    let scan_dirs = vec![
        format!("{}/Downloads", home),
        format!("{}/Desktop", home),
        format!("{}/Documents", home),
        "/tmp".to_string(),
        format!("{}/Library/Caches", home),
    ];
    
    // 安装包文件扩展名
    let extensions = vec!["dmg", "pkg", "iso", "xip", "zip"];
    
    let mut installers: Vec<InstallerFile> = Vec::new();
    
    for dir in scan_dirs {
        let path = std::path::Path::new(&dir);
        if !path.exists() {
            continue;
        }
        
        if let Ok(entries) = std::fs::read_dir(path) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() {
                    if let Some(ext) = path.extension() {
                        let ext_str = ext.to_string_lossy().to_lowercase();
                        if extensions.contains(&ext_str.as_str()) {
                            if let Ok(metadata) = entry.metadata() {
                                let modified = metadata.modified()
                                    .ok()
                                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                                    .map(|d| d.as_secs())
                                    .unwrap_or(0);
                                
                                let modified_str = chrono::DateTime::from_timestamp(modified as i64, 0)
                                    .map(|dt| dt.format("%Y-%m-%d %H:%M").to_string())
                                    .unwrap_or_else(|| "未知".to_string());
                                
                                installers.push(InstallerFile {
                                    path: path.to_string_lossy().to_string(),
                                    name: path.file_name()
                                        .map(|n| n.to_string_lossy().to_string())
                                        .unwrap_or_default(),
                                    size: metadata.len(),
                                    file_type: ext_str,
                                    modified: modified_str,
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    
    // 按大小降序排序
    installers.sort_by(|a, b| b.size.cmp(&a.size));
    
    serde_json::to_string(&installers).map_err(|e| format!("序列化失败: {}", e))
}

/// 删除单个安装包文件
#[tauri::command]
async fn delete_installer(path: String) -> Result<String, String> {
    let file_path = std::path::Path::new(&path);
    
    if !file_path.exists() {
        return Err(format!("文件不存在: {}", path));
    }
    
    std::fs::remove_file(file_path)
        .map(|_| format!("已删除: {}", path))
        .map_err(|e| format!("删除失败: {}", e))
}

/// 清理安装包文件 - 流式输出
#[tauri::command]
async fn installer_clean(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["installer".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "installer-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 配置 Touch ID 用于 sudo - 流式输出
#[tauri::command]
async fn touchid(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["touchid".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "touchid-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 更新 Mole - 流式输出
#[tauri::command]
async fn update(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["update".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "update-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 从系统中移除 Mole - 流式输出
#[tauri::command]
async fn remove(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["remove".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "remove-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 设置 Shell 自动补全 - 流式输出
#[tauri::command]
async fn completion(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["completion".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "completion-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 预览项目清理（dry-run）- 流式输出
#[tauri::command]
async fn purge_dry_run(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["purge".to_string(), "--dry-run".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "purge-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 管理优化白名单 - 流式输出
#[tauri::command]
async fn optimize_whitelist(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["optimize".to_string(), "--whitelist".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "optimize-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 管理清理白名单 - 流式输出
#[tauri::command]
async fn clean_whitelist(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["clean".to_string(), "--whitelist".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "scan-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 获取清理白名单列表
#[tauri::command]
async fn get_clean_whitelist() -> Result<Vec<String>, String> {
    let home = std::env::var("HOME").map_err(|e| format!("获取HOME失败: {}", e))?;
    let whitelist_path = format!("{}/.config/mole/clean_whitelist.txt", home);
    
    if std::path::Path::new(&whitelist_path).exists() {
        let content = std::fs::read_to_string(&whitelist_path)
            .map_err(|e| format!("读取白名单失败: {}", e))?;
        let items: Vec<String> = content
            .lines()
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();
        Ok(items)
    } else {
        Ok(Vec::new())
    }
}

/// 添加清理白名单项
#[tauri::command]
async fn add_clean_whitelist(item: String) -> Result<String, String> {
    let home = std::env::var("HOME").map_err(|e| format!("获取HOME失败: {}", e))?;
    let config_dir = format!("{}/.config/mole", home);
    let whitelist_path = format!("{}/clean_whitelist.txt", config_dir);
    
    // 创建目录
    std::fs::create_dir_all(&config_dir)
        .map_err(|e| format!("创建目录失败: {}", e))?;
    
    // 读取现有内容
    let mut content = if std::path::Path::new(&whitelist_path).exists() {
        std::fs::read_to_string(&whitelist_path)
            .map_err(|e| format!("读取白名单失败: {}", e))?
    } else {
        String::new()
    };
    
    // 检查是否已存在
    if content.lines().any(|line| line.trim() == item) {
        return Ok("项目已在白名单中".to_string());
    }
    
    // 添加新项
    if !content.is_empty() && !content.ends_with('\n') {
        content.push('\n');
    }
    content.push_str(&item);
    content.push('\n');
    
    std::fs::write(&whitelist_path, content)
        .map_err(|e| format!("写入白名单失败: {}", e))?;
    
    Ok(format!("已添加: {}", item))
}

/// 删除清理白名单项
#[tauri::command]
async fn remove_clean_whitelist(item: String) -> Result<String, String> {
    let home = std::env::var("HOME").map_err(|e| format!("获取HOME失败: {}", e))?;
    let whitelist_path = format!("{}/.config/mole/clean_whitelist.txt", home);
    
    if !std::path::Path::new(&whitelist_path).exists() {
        return Ok("白名单为空".to_string());
    }
    
    let content = std::fs::read_to_string(&whitelist_path)
        .map_err(|e| format!("读取白名单失败: {}", e))?;
    
    let new_content: Vec<&str> = content
        .lines()
        .filter(|line| line.trim() != item)
        .collect();
    
    std::fs::write(&whitelist_path, new_content.join("\n"))
        .map_err(|e| format!("写入白名单失败: {}", e))?;
    
    Ok(format!("已删除: {}", item))
}

/// 配置项目扫描目录 - 流式输出
#[tauri::command]
async fn purge_paths(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["purge".to_string(), "--paths".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "purge-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 查看 JSON 格式历史 - 流式输出
#[tauri::command]
async fn history_json(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["history".to_string(), "--json".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "history-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 启用 Touch ID - 流式输出
#[tauri::command]
async fn touchid_enable(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["touchid".to_string(), "enable".to_string()];
    tauri::async_runtime::spawn_blocking(move || {
        execute_mole_streaming(&app, args, "touchid-output")
    })
    .await
    .unwrap_or(MoleResult {
        exit_code: -1,
        stdout: String::new(),
        stderr: "任务执行失败".to_string(),
    })
}

/// 打开开发者工具
#[tauri::command]
async fn open_devtools(app: tauri::AppHandle) -> Result<(), String> {
    use tauri::Manager;
    if let Some(window) = app.get_webview_window("main") {
        #[cfg(debug_assertions)]
        window.open_devtools();
        #[cfg(not(debug_assertions))]
        let _ = window; // 避免未使用警告
        Ok(())
    } else {
        Err("无法找到主窗口".to_string())
    }
}

/// 检查 Mole 是否已安装（内置或系统）
#[tauri::command]
async fn is_installed(app: tauri::AppHandle) -> bool {
    // 检查内置的 mole
    use tauri::Manager;
    if let Some(resource_dir) = app.path().resource_dir().ok() {
        let mole_path = resource_dir.join("bin").join("mole");
        if mole_path.exists() {
            return true;
        }
    }
    // 检查系统安装的 mole/mo
    let paths = [
        "/opt/homebrew/bin/mo",
        "/usr/local/bin/mo",
        "/opt/homebrew/bin/mole",
        "/usr/local/bin/mole",
    ];
    for path in &paths {
        if std::path::Path::new(path).exists() {
            return true;
        }
    }
    // 使用 which 命令查找
    std::process::Command::new("which")
        .arg("mo")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

/// 环境变量信息结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnvVar {
    /// 变量名
    pub name: String,
    /// 变量值
    pub value: String,
}

/// 列出所有环境变量
#[tauri::command]
async fn list_envs() -> Result<Vec<EnvVar>, String> {
    let mut envs: Vec<EnvVar> = std::env::vars()
        .map(|(name, value)| EnvVar { name, value })
        .collect();
    // 按变量名排序
    envs.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(envs)
}

/// 获取单个环境变量
#[tauri::command]
async fn get_env(name: String) -> Result<Option<String>, String> {
    Ok(std::env::var(&name).ok())
}

/// 设置环境变量（仅当前进程生效）
#[tauri::command]
async fn set_env(name: String, value: String) -> Result<(), String> {
    // Rust 1.80+ 中 set_var 是 unsafe，因为多线程环境下修改环境变量可能导致数据竞争
    unsafe {
        std::env::set_var(&name, &value);
    }
    Ok(())
}

/// 删除环境变量（仅当前进程生效）
#[tauri::command]
async fn delete_env(name: String) -> Result<(), String> {
    // Rust 1.80+ 中 remove_var 是 unsafe，因为多线程环境下修改环境变量可能导致数据竞争
    unsafe {
        std::env::remove_var(&name);
    }
    Ok(())
}

/// Shell 配置文件环境变量结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ShellEnvVar {
    /// 变量名
    pub name: String,
    /// 变量值
    pub value: String,
    /// 来源文件
    pub source: String,
}

/// 获取 shell 配置文件路径
fn get_shell_config_paths() -> Vec<std::path::PathBuf> {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/Users/os".to_string());
    vec![
        std::path::PathBuf::from(&home).join(".zshrc"),
        std::path::PathBuf::from(&home).join(".bash_profile"),
        std::path::PathBuf::from(&home).join(".bashrc"),
    ]
}

/// 从 shell 配置文件中读取环境变量
#[tauri::command]
async fn list_shell_envs() -> Result<Vec<ShellEnvVar>, String> {
    let mut envs = Vec::new();
    let export_pattern = regex::Regex::new(r"^export\s+([A-Za-z_][A-Za-z0-9_]*)=(.+)$")
        .map_err(|e| e.to_string())?;

    for path in get_shell_config_paths() {
        if path.exists() {
            if let Ok(content) = std::fs::read_to_string(&path) {
                for line in content.lines() {
                    let line = line.trim();
                    if let Some(caps) = export_pattern.captures(line) {
                        let name = caps.get(1).unwrap().as_str().to_string();
                        let value = caps.get(2).unwrap().as_str().to_string();
                        // 移除引号
                        let value = value.trim_matches(|c| c == '"' || c == '\'').to_string();
                        envs.push(ShellEnvVar {
                            name,
                            value,
                            source: path.file_name().unwrap().to_string_lossy().to_string(),
                        });
                    }
                }
            }
        }
    }

    // 按变量名排序
    envs.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(envs)
}

/// 添加环境变量到 shell 配置文件
#[tauri::command]
async fn add_shell_env(name: String, value: String, source: String) -> Result<(), String> {
    let home = std::env::var("HOME").map_err(|_| "无法获取 HOME 目录")?;
    let path = std::path::PathBuf::from(&home).join(&source);

    // 检查文件是否存在，不存在则创建
    if !path.exists() {
        std::fs::write(&path, "").map_err(|e| e.to_string())?;
    }

    // 读取现有内容
    let mut content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;

    // 检查是否已存在该变量
    let export_pattern = regex::Regex::new(&format!(r"^export\s+{}=", regex::escape(&name)))
        .map_err(|e| e.to_string())?;

    let mut found = false;
    let mut new_lines: Vec<String> = Vec::new();

    for line in content.lines() {
        if export_pattern.is_match(line.trim()) {
            // 替换已存在的变量
            new_lines.push(format!("export {}=\"{}\"", name, value));
            found = true;
        } else {
            new_lines.push(line.to_string());
        }
    }

    // 如果是新变量，添加到末尾
    if !found {
        new_lines.push(format!("export {}=\"{}\"", name, value));
    }

    // 写回文件
    content = new_lines.join("\n");
    if !content.ends_with('\n') {
        content.push('\n');
    }
    std::fs::write(&path, content).map_err(|e| e.to_string())?;

    // 同时更新当前进程的环境变量
    unsafe {
        std::env::set_var(&name, &value);
    }

    Ok(())
}

/// 从 shell 配置文件中删除环境变量
#[tauri::command]
async fn remove_shell_env(name: String, source: String) -> Result<(), String> {
    let home = std::env::var("HOME").map_err(|_| "无法获取 HOME 目录")?;
    let path = std::path::PathBuf::from(&home).join(&source);

    if !path.exists() {
        return Ok(());
    }

    // 读取现有内容
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let export_pattern = regex::Regex::new(&format!(r"^export\s+{}=", regex::escape(&name)))
        .map_err(|e| e.to_string())?;

    // 过滤掉该变量的行
    let new_lines: Vec<String> = content
        .lines()
        .filter(|line| !export_pattern.is_match(line.trim()))
        .map(|s| s.to_string())
        .collect();

    // 写回文件
    let mut new_content = new_lines.join("\n");
    if !new_content.ends_with('\n') && !new_content.is_empty() {
        new_content.push('\n');
    }
    std::fs::write(&path, new_content).map_err(|e| e.to_string())?;

    // 同时从当前进程中删除
    unsafe {
        std::env::remove_var(&name);
    }

    Ok(())
}

/// 定时清理任务配置
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ScheduledCleanConfig {
    pub enabled: bool,
    pub interval: String, // "daily", "weekly", "monthly"
}

/// 获取定时清理任务配置
#[tauri::command]
async fn get_scheduled_clean_config() -> Result<ScheduledCleanConfig, String> {
    let home = std::env::var("HOME").map_err(|_| "无法获取 HOME 目录")?;
    let plist_path = std::path::PathBuf::from(&home)
        .join("Library")
        .join("LaunchAgents")
        .join("com.mole-gui.scheduled-clean.plist");
    
    if !plist_path.exists() {
        return Ok(ScheduledCleanConfig {
            enabled: false,
            interval: "weekly".to_string(),
        });
    }
    
    // 读取 plist 文件获取配置
    let content = std::fs::read_to_string(&plist_path).map_err(|e| e.to_string())?;
    
    // 简单解析 interval
    let interval = if content.contains("<string>daily</string>") {
        "daily".to_string()
    } else if content.contains("<string>monthly</string>") {
        "monthly".to_string()
    } else {
        "weekly".to_string()
    };
    
    Ok(ScheduledCleanConfig {
        enabled: true,
        interval,
    })
}

/// 设置定时清理任务
#[tauri::command]
async fn set_scheduled_clean(enabled: bool, interval: String) -> Result<(), String> {
    let home = std::env::var("HOME").map_err(|_| "无法获取 HOME 目录")?;
    let launch_agents_dir = std::path::PathBuf::from(&home)
        .join("Library")
        .join("LaunchAgents");
    let plist_path = launch_agents_dir.join("com.mole-gui.scheduled-clean.plist");
    
    if !enabled {
        // 禁用定时任务
        if plist_path.exists() {
            // 卸载任务
            let _ = Command::new("launchctl")
                .arg("unload")
                .arg(&plist_path)
                .output();
            
            // 删除 plist 文件
            std::fs::remove_file(&plist_path).map_err(|e| e.to_string())?;
        }
        return Ok(());
    }
    
    // 确保 LaunchAgents 目录存在
    if !launch_agents_dir.exists() {
        std::fs::create_dir_all(&launch_agents_dir).map_err(|e| e.to_string())?;
    }
    
    // 根据 interval 计算执行时间
    let start_calendar_interval = match interval.as_str() {
        "daily" => {
            r#"
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>3</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>"#
        }
        "weekly" => {
            r#"
    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>0</integer>
        <key>Hour</key>
        <integer>3</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>"#
        }
        "monthly" => {
            r#"
    <key>StartCalendarInterval</key>
    <dict>
        <key>Day</key>
        <integer>1</integer>
        <key>Hour</key>
        <integer>3</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>"#
        }
        _ => {
            return Err("无效的清理频率".to_string());
        }
    };
    
    // 获取当前可执行文件路径
    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    
    // 创建 plist 内容
    let plist_content = format!(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.mole-gui.scheduled-clean</string>
    <key>ProgramArguments</key>
    <array>
        <string>{}</string>
        <string>--auto-clean</string>
    </array>
    {}
    <key>StandardOutPath</key>
    <string>{}/Library/Logs/mole-gui-scheduled-clean.log</string>
    <key>StandardErrorPath</key>
    <string>{}/Library/Logs/mole-gui-scheduled-clean.log</string>
</dict>
</plist>"#,
        exe_path.display(),
        start_calendar_interval,
        home,
        home
    );
    
    // 写入 plist 文件
    std::fs::write(&plist_path, plist_content).map_err(|e| e.to_string())?;
    
    // 加载任务
    Command::new("launchctl")
        .arg("load")
        .arg(&plist_path)
        .output()
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

/// 初始化 Tauri 应用
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // 创建系统托盘菜单
            let show_item = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
            let clean_item = MenuItem::with_id(app, "clean", "快速清理", true, None::<&str>)?;
            let status_item = MenuItem::with_id(app, "status", "系统状态", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            
            let menu = Menu::with_items(app, &[
                &show_item,
                &clean_item,
                &status_item,
                &quit_item,
            ])?;
            
            // 创建系统托盘图标
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "clean" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.emit("tray-action", "clean");
                            }
                        }
                        "status" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.emit("tray-action", "status");
                            }
                        }
                        "quit" => {
                            std::process::exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_version,
            scan_cleanable,
            clean,
            clean_whitelist,
            scan_apps,
            uninstall,
            analyze,
            status,
            optimize,
            optimize_whitelist,
            purge,
            purge_dry_run,
            purge_paths,
            history,
            history_json,
            installer_clean,
            optimize_run,
            touchid,
            touchid_enable,
            completion,
            update,
            remove,
            is_installed,
            stop_command,
            list_envs,
            get_env,
            set_env,
            delete_env,
            list_shell_envs,
            add_shell_env,
            remove_shell_env,
            get_clean_whitelist,
            add_clean_whitelist,
            remove_clean_whitelist,
            scan_installers,
            delete_installer,
            get_logs,
            clear_logs,
            get_scheduled_clean_config,
            set_scheduled_clean,
            open_devtools,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
