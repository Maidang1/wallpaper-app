mod cache;
mod image;
mod wallpaper;

use tauri::{WebviewUrl, WebviewWindowBuilder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("Wallpaper")
                .inner_size(1200.0, 800.0);

            // 仅在 macOS 时设置透明标题栏
            #[cfg(target_os = "macos")]
            {
                use cocoa::appkit::{NSColor, NSWindow};
                use cocoa::base::{id, nil};
                use tauri::TitleBarStyle;
                let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);

                let window = win_builder.build().unwrap();
                let ns_window = window.ns_window().unwrap() as id;
                unsafe {
                    let bg_color = NSColor::colorWithRed_green_blue_alpha_(
                        nil,
                        50.0 / 255.0,
                        158.0 / 255.0,
                        163.5 / 255.0,
                        1.0,
                    );
                    ns_window.setBackgroundColor_(bg_color);
                }
            }


            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            wallpaper::set_wallpapar_from_path,
            cache::clean_cache,
            cache::get_cache_info,
            cache::remove_path,
            image::get_random_image_path,
            image::remove_image_from_cache,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
