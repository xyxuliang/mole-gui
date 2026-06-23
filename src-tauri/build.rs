fn main() {
    // 打包模式：动态复制 mole 到 resources/bin
    // 通过读写方式创建文件，避免继承 com.apple.provenance 扩展属性
    #[cfg(not(debug_assertions))]
    {
        use std::fs;
        use std::io::Write;
        use std::os::unix::fs::PermissionsExt;
        
        let resources_bin = std::path::Path::new("resources/bin");
        if !resources_bin.exists() {
            fs::create_dir_all(resources_bin).expect("创建 resources/bin 目录失败");
        }
        
        // 尝试从 Homebrew 安装路径复制
        let homebrew_mole = std::path::Path::new("/opt/homebrew/bin/mo");
        if homebrew_mole.exists() {
            // externalBin 需要带平台后缀的文件名
            let dest = resources_bin.join("mole-aarch64-apple-darwin");
            // 使用读写方式复制，避免继承扩展属性
            let data = fs::read(homebrew_mole).expect("读取 mole 失败");
            let mut file = fs::File::create(&dest).expect("创建 mole 文件失败");
            file.write_all(&data).expect("写入 mole 文件失败");
            // 设置可执行权限
            let mut perms = file.metadata().expect("获取文件元数据失败").permissions();
            perms.set_mode(0o755);
            fs::set_permissions(&dest, perms).expect("设置权限失败");
            println!("cargo:info=已复制 mole 到 resources/bin");
        } else {
            println!("cargo:warning=未找到 /opt/homebrew/bin/mo，打包将不包含 mole");
        }
    }
    
    tauri_build::build()
}
