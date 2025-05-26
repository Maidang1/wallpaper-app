use anyhow::{Context, Result};
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use tauri::Manager;
use tauri::Runtime;
use thiserror::Error;
use regress::Regex;

#[derive(Error, Debug)]
pub enum CacheError {
    #[error("I/O error: {0}")]
    Io(#[from] io::Error),

    #[error("HTTP request failed: {0}")]
    HttpRequest(#[from] reqwest::Error),

    #[error("Source file does not exist: {0}")]
    SourceFileNotFound(String),

    #[error("Cache directory error: {0}")]
    CacheDirError(String),

    #[error("File operation failed: {0}")]
    FileOperation(String),
}

pub async fn cache_file<R: Runtime>(
    path: String,
    app_handle: tauri::AppHandle<R>,
) -> Result<String, CacheError> {
    let re = Regex::new(r"^https?://").unwrap();
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| CacheError::CacheDirError(e.to_string()))?;

    let cache_dir = cache_dir.join("cached_wallpaper_images");

    let _ = fs::create_dir_all(&cache_dir).context("Failed to create cache directory");

    let filename = generate_unique_filename();
    let cache_path = cache_dir.join(filename);

    if re.find(&path).is_some() {
        download_file(&path, &cache_path).await?
    } else {
        let source_path = PathBuf::from(&path);
        if !source_path.exists() {
            return Err(CacheError::SourceFileNotFound(path).into());
        }

        fs::copy(&source_path, &cache_path)
            .map_err(|e| CacheError::FileOperation(e.to_string()))?;
    }

    Ok(cache_path.to_string_lossy().to_string())
}

fn generate_unique_filename() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();

    format!("{}_cache_image", timestamp)
}

#[tauri::command]
pub async fn clean_cache<R: Runtime>(app_handle: tauri::AppHandle<R>) -> Result<String, String> {
    let cache_dir = app_handle.path().app_cache_dir().unwrap();

    let wallpaper_cache_dir = cache_dir.join("cached_wallpaper_images");

    if !wallpaper_cache_dir.exists() {
        return Ok("Cache directory doesn't exist. Nothing to clean.".to_string());
    }

    let cache_size = get_directory_size(&wallpaper_cache_dir).unwrap_or(0);

    match fs::remove_dir_all(&wallpaper_cache_dir) {
        Ok(_) => {
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

#[tauri::command]

pub fn remove_path(path: String) -> Result<String, String> {
    let path = PathBuf::from(path);
    if path.exists() {
        fs::remove_file(path).map_err(|e| format!("Failed to remove file: {}", e))?;
        Ok(format!("File removed successfully."))
    } else {
        Err(format!("File does not exist."))
    }
}

#[derive(serde::Serialize)]
pub struct FileInfo {
    path: String,
    size: u64,
}

impl FileInfo {
    fn new(path: String, size: u64) -> Self {
        FileInfo { path, size }
    }
}

#[tauri::command]
pub fn get_cache_info<R: Runtime>(app_handle: tauri::AppHandle<R>) -> Vec<FileInfo> {
    let cache_dir = app_handle.path().app_cache_dir().unwrap();
    let wallpaper_cache_dir = cache_dir.join("cached_wallpaper_images");

    if !wallpaper_cache_dir.exists() {
        return vec![];
    }

    let mut file_info_list = Vec::new();

    if let Ok(entries) = fs::read_dir(&wallpaper_cache_dir) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    let file_path = entry.path();
                    file_info_list.push(FileInfo::new(
                        file_path.to_string_lossy().to_string(),
                        metadata.len(),
                    ));
                }
            }
        }
    }
    file_info_list
}

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

#[derive(serde::Serialize)]
pub struct CacheInfo {
    size_bytes: u64,
    file_count: u32,
}

async fn download_file(url: &str, destination: &Path) -> Result<(), io::Error> {
    let client = reqwest::Client::new();

    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;

    if !response.status().is_success() {
        return Err(io::Error::new(
            io::ErrorKind::Other,
            format!("Failed to download file: HTTP {}", response.status()),
        ));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;

    fs::write(destination, bytes)?;

    Ok(())
}
