use crate::cache::cache_file;

#[tauri::command]
pub async fn set_wallpapar_from_path<R: tauri::Runtime>(image_path: String, app_handle: tauri::AppHandle<R>) {
    match wallpaper::get() {
        Ok(wallpaper) => println!("{:?}", wallpaper),
        Err(e) => println!("Error getting wallpaper: {:?}", e),
    };

    let image_path = match cache_file(image_path.clone(), app_handle).await {
        Ok(path) => path,
        Err(e) => {
            println!("Error caching file: {:?}", e);
            return;
        }
    };

    match wallpaper::set_from_path(image_path.as_str()) {
        Ok(_) => println!("Wallpaper set successfully."),
        Err(e) => println!("Error setting wallpaper: {:?}", e),
    }

    match wallpaper::get() {
        Ok(wallpaper) => println!("{:?}", wallpaper),
        Err(e) => println!("Error getting wallpaper: {:?}", e),
    }
}
