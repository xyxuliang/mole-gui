// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::process::Command;

fn main() {
    // 检查是否是自动清理模式
    let args: Vec<String> = env::args().collect();
    if args.contains(&"--auto-clean".to_string()) {
        run_auto_clean();
        return;
    }
    
    mole_gui_lib::run()
}

/// 执行自动清理任务
fn run_auto_clean() {
    println!("[定时清理] 开始执行自动清理任务...");
    
    // 调用 mole 命令执行清理
    let output = Command::new("mo")
        .arg("clean")
        .arg("--yes")
        .output();
    
    match output {
        Ok(output) => {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                println!("[定时清理] 清理成功:\n{}", stdout);
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr);
                eprintln!("[定时清理] 清理失败: {}", stderr);
            }
        }
        Err(e) => {
            eprintln!("[定时清理] 执行命令失败: {}", e);
        }
    }
    
    println!("[定时清理] 自动清理任务完成");
}
