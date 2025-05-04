use crate::cache::cache_file;
use fastrand;

#[tauri::command]
pub async fn get_random_image_path(app_handle: tauri::AppHandle) -> String {
    let random_image_urls = vec![
        "https://cdn.seovx.com/?mom=302",
        "https://cdn.seovx.com/d/?mom=302",
        "https://cdn.seovx.com/ha/?mom=302",
        "https://api.paugram.com/wallpaper/?source=sm",
        "https://api.mtyqx.cn/xjjapi/random.php",
        "https://api.mtyqx.cn/tapi/random.php",
        "https://api.mtyqx.cn/api/random.php",
        "https://www.dmoe.cc/random.php",
    ];
    
    let random_index = fastrand::usize(..random_image_urls.len());
    let random_image_url = random_image_urls[random_index];
    let image_path = match cache_file(random_image_url.to_string().clone(), app_handle).await {
        Ok(path) => path,
        Err(_) => "".to_string(),
    };

    image_path
}

#[tauri::command]
pub fn remove_image_from_cache(file_path: String) -> Result<String, String> {
    let file_path = std::path::PathBuf::from(file_path);
    if file_path.exists() {
        std::fs::remove_file(file_path).map_err(|e| format!("Failed to remove file: {}", e))?;
        Ok(format!("File removed successfully."))
    } else {
        Err(format!("File does not exist."))
    }
}
