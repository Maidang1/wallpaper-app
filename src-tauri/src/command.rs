use wallpaper::Mode;

#[tauri::command]
pub fn set_wallpapar_from_path(image_path: String) {
    println!("I was invoked from JavaScript!");
    match wallpaper::get() {
        Ok(wallpaper) => println!("{:?}", wallpaper),
        Err(e) => println!("Error getting wallpaper: {:?}", e),
    };
    wallpaper::set_from_path(image_path.as_str()).unwrap();
    match wallpaper::set_mode(Mode::Crop) {
        Ok(wallpaper) => println!("{:?}", wallpaper),
        Err(e) => println!("Error setting mode for wallpaper: {:?}", e),
    }

    match wallpaper::get() {
        Ok(wallpaper) => println!("{:?}", wallpaper),
        Err(e) => println!("Error getting wallpaper: {:?}", e),
    }
}
