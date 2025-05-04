use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use tauri::Manager;
use tauri::Runtime;

pub async fn cache_file<R: Runtime>(
    path: String,
    app_handle: tauri::AppHandle<R>,
) -> Result<String, String> {
    // Get the app cache directory
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .unwrap() // Changed from unwrap_err() to unwrap() to get the cache directory correctly
    ;

    let cache_dir = cache_dir.join("cached_wallpaper_images");

    // Create the cache directory if it doesn't exist
    fs::create_dir_all(&cache_dir)
        .map_err(|e| format!("Failed to create cache directory: {}", e))?;

    // Generate a unique filename based on the original path
    let filename = generate_unique_filename(&path);
    let cache_path = cache_dir.join(filename);

    // Check if the path is a URL or a file path
    if path.starts_with("http://") || path.starts_with("https://") {
        // It's a URL, download it
        download_file(&path, &cache_path)
            .await
            .map_err(|e| format!("Failed to download file: {}", e))?;
    } else {
        // It's a file path, copy it
        let source_path = PathBuf::from(&path);
        if !source_path.exists() {
            return Err(format!("Source file does not exist: {}", path));
        }

        fs::copy(&source_path, &cache_path).map_err(|e| format!("Failed to copy file: {}", e))?;
    }

    // Return the path to the cached file
    Ok(cache_path.to_string_lossy().to_string())
}

// Generate a unique filename based on the original path
fn generate_unique_filename(path: &str) -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    // Extract the original filename if possible
    let original_filename = Path::new(path)
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("file");

    // Add a timestamp to ensure uniqueness
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();

    format!("{}_{}", timestamp, original_filename)
}

// Clean cache directory by removing all cached wallpaper images
#[tauri::command]
pub async fn clean_cache<R: Runtime>(app_handle: tauri::AppHandle<R>) -> Result<String, String> {
    // Get the app cache directory
    let cache_dir = app_handle.path().app_cache_dir().unwrap();

    let wallpaper_cache_dir = cache_dir.join("cached_wallpaper_images");

    // Check if the directory exists
    if !wallpaper_cache_dir.exists() {
        return Ok("Cache directory doesn't exist. Nothing to clean.".to_string());
    }

    // Get cache size before cleaning
    let cache_size = get_directory_size(&wallpaper_cache_dir).unwrap_or(0);

    // Remove all files in the cache directory
    match fs::remove_dir_all(&wallpaper_cache_dir) {
        Ok(_) => {
            // Recreate the empty directory
            fs::create_dir_all(&wallpaper_cache_dir)
                .map_err(|e| format!("Failed to recreate cache directory: {}", e))?;
            Ok(format!(
                "Cache cleaned successfully. Freed {} bytes.",
                cache_size
            ))
        }
        Err(e) => Err(format!("Failed to clean cache: {}", e)),
    }
}

// Get cache size and stats
#[tauri::command]
pub fn get_cache_info<R: Runtime>(app_handle: tauri::AppHandle<R>) -> Result<CacheInfo, String> {
    // Get the app cache directory
    let cache_dir = app_handle.path().app_cache_dir().unwrap();

    let wallpaper_cache_dir = cache_dir.join("cached_wallpaper_images");

    // Check if the directory exists
    if !wallpaper_cache_dir.exists() {
        return Ok(CacheInfo {
            size_bytes: 0,
            file_count: 0,
        });
    }

    // Count files
    let mut file_count = 0;
    if let Ok(entries) = fs::read_dir(&wallpaper_cache_dir) {
        for _ in entries.flatten() {
            file_count += 1;
        }
    }

    // Get total size
    let size_bytes = get_directory_size(&wallpaper_cache_dir).unwrap_or(0);

    Ok(CacheInfo {
        size_bytes,
        file_count,
    })
}

// Helper function to get directory size in bytes
fn get_directory_size(path: &Path) -> io::Result<u64> {
    let mut total_size = 0;

    if path.is_dir() {
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let entry_path = entry.path();

            if entry_path.is_file() {
                total_size += entry.metadata()?.len();
            } else if entry_path.is_dir() {
                total_size += get_directory_size(&entry_path)?;
            }
        }
    }

    Ok(total_size)
}

// Structure to return cache information
#[derive(serde::Serialize)]
pub struct CacheInfo {
    size_bytes: u64,
    file_count: u32,
}

// Download a file from a URL
async fn download_file(url: &str, destination: &Path) -> Result<(), io::Error> {
    // Create a reqwest client
    let client = reqwest::Client::new();

    // Perform the request
    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;

    // Check if the request was successful
    if !response.status().is_success() {
        return Err(io::Error::new(
            io::ErrorKind::Other,
            format!("Failed to download file: HTTP {}", response.status()),
        ));
    }

    // Get the response bytes
    let bytes = response
        .bytes()
        .await
        .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;

    // Write the bytes to a file
    fs::write(destination, bytes)?;

    Ok(())
}
