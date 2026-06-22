// Mole CLI 封装层
// 提供对 Mole 命令行工具的调用接口，支持流式输出

use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::Emitter;

// 全局存储正在运行的进程ID
lazy_static::lazy_static! {
    static ref RUNNING_PIDS: Arc<Mutex<std::collections::HashMap<String, u32>>> = 
        Arc::new(Mutex::new(std::collections::HashMap::new()));
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

/// 获取内置 Mole 可执行文件路径
fn get_mole_path(app: &tauri::AppHandle) -> std::path::PathBuf {
    use tauri::Manager;
    // 优先使用应用资源目录中的内置 mole
    if let Some(resource_dir) = app.path().resource_dir().ok() {
        let mole_path = resource_dir.join("bin").join("mole");
        if mole_path.exists() {
            return mole_path;
        }
    }
    // 回退到系统安装路径
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
        Ok(child) => child,
        Err(e) => {
            let _ = app.emit(
                event_name,
                StreamEvent {
                    event_type: "stderr".to_string(),
                    data: format!("启动命令失败: {}", e),
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
                stderr: format!("启动命令失败: {}", e),
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

    // 等待两个读取线程完成
    if let Some(thread) = stdout_thread {
        let _ = thread.join();
    }
    if let Some(thread) = stderr_thread {
        let _ = thread.join();
    }

    // 等待进程完成
    let exit_code = child.wait().map(|s| s.code().unwrap_or(-1)).unwrap_or(-1);

    // 发送完成事件
    let _ = app.emit(
        event_name,
        StreamEvent {
            event_type: "done".to_string(),
            data: String::new(),
            exit_code: Some(exit_code),
        },
    );

    let stdout_result = full_stdout.lock().unwrap().clone();
    let stderr_result = full_stderr.lock().unwrap().clone();

    MoleResult {
        exit_code,
        stdout: stdout_result,
        stderr: stderr_result,
    }
}

/// 停止正在运行的命令
#[tauri::command]
fn stop_command(command: String) -> Result<String, String> {
    if let Some(pid) = RUNNING_PIDS.lock().unwrap().get(&command) {
        let pid = *pid;
        // 使用 kill 命令终止进程
        let output = std::process::Command::new("kill")
            .arg("-9")
            .arg(pid.to_string())
            .output()
            .map_err(|e| format!("Failed to kill process: {}", e))?;
        
        if output.status.success() {
            // 从 HashMap 中移除 PID
            RUNNING_PIDS.lock().unwrap().remove(&command);
            Ok(format!("Stopped command: {}", command))
        } else {
            Err(format!("Failed to stop command: {}", String::from_utf8_lossy(&output.stderr)))
        }
    } else {
        Err(format!("No running command found for: {}", command))
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

/// 卸载指定应用 - 流式输出
#[tauri::command]
async fn uninstall(app: tauri::AppHandle, app_name: String) -> MoleResult {
    let args = vec!["uninstall".to_string(), app_name];
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

/// 查找安装包文件（预览模式） - 流式输出
#[tauri::command]
async fn installer(app: tauri::AppHandle) -> MoleResult {
    let args = vec!["installer".to_string(), "--dry-run".to_string()];
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
    // 检查系统安装的 mole
    std::path::Path::new("/opt/homebrew/bin/mo").exists()
}

/// 初始化 Tauri 应用
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
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
            installer,
            installer_clean,
            optimize_run,
            touchid,
            touchid_enable,
            completion,
            update,
            remove,
            is_installed,
            stop_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
