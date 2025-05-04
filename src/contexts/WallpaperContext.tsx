import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import { uniqBy } from "lodash-es"


export interface CacheImageInfo {
  originalPath: string;
  assetsPath: string;
}

interface WallpaperContextType {
  wallpaperHistory: CacheImageInfo[];
  setWallpaper: (imagePath: string) => Promise<void>;
  saveToHistory: (imagePath: CacheImageInfo) => void;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

export function WallpaperProvider({ children }: { children: ReactNode }) {
  const [wallpaperHistory, setWallpaperHistory] = useState<CacheImageInfo[]>([]);

  // Load wallpaper history from storage when component mounts
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = localStorage.getItem('wallpaper-history');
        if (savedHistory) {
          setWallpaperHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Failed to load wallpaper history:', error);
      }
    };

    loadHistory();
  }, []);

  // Save wallpaper to history
  const saveToHistory = (imagePath: CacheImageInfo) => {
    setWallpaperHistory((prevHistory) => {
      const updatedHistory = uniqBy([...prevHistory, imagePath], 'originalPath');
      localStorage.setItem('wallpaper-history', JSON.stringify(updatedHistory));
      return updatedHistory;
    });

  };

  // Handle setting wallpaper from any source
  const setWallpaper = async (imagePath: string) => {
    try {
      await invoke('set_wallpapar_from_path', { imagePath });
      if (imagePath.startsWith('http') || imagePath.startsWith("https")) {
        saveToHistory({
          originalPath: imagePath,
          assetsPath: imagePath
        });
      } else {
        saveToHistory({
          originalPath: imagePath,
          assetsPath: convertFileSrc(imagePath)
        });
      }

    } catch (error) {
      console.error('Failed to set wallpaper:', error);
    }
  };

  return (
    <WallpaperContext.Provider value={{ wallpaperHistory, setWallpaper, saveToHistory }}>
      {children}
    </WallpaperContext.Provider>
  );
}

export const useWallpaper = () => {
  const context = useContext(WallpaperContext);
  if (context === undefined) {
    throw new Error('useWallpaper must be used within a WallpaperProvider');
  }
  return context;
};