#[tauri::command]
pub fn set_wallpapar_from_path(image_path: String) {
    println!("Setting wallpaper from path: {}", image_path);
    match wallpaper::get() {
        Ok(wallpaper) => println!("{:?}", wallpaper),
        Err(e) => println!("Error getting wallpaper: {:?}", e),
    };
    wallpaper::set_from_path(image_path.as_str()).unwrap();

    match wallpaper::get() {
        Ok(wallpaper) => println!("{:?}", wallpaper),
        Err(e) => println!("Error getting wallpaper: {:?}", e),
    }
}

#[tauri::command]
pub fn set_wallpapar_from_url(image_url: String) {
    println!("set_wallpapar_from_url image_url: {:?}", image_url);
    match wallpaper::get() {
        Ok(wallpaper) => println!("{:?}", wallpaper),
        Err(e) => println!("Error getting wallpaper: {:?}", e),
    };
    wallpaper::set_from_url(image_url.as_str()).unwrap();

    match wallpaper::get() {
        Ok(wallpaper) => println!("{:?}", wallpaper),
        Err(e) => println!("Error getting wallpaper: {:?}", e),
    }
}
