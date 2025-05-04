import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface WallpaperContextType {
  wallpaperHistory: string[];
  setWallpaper: (imagePath: string) => Promise<void>;
  saveToHistory: (imagePath: string) => void;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

export function WallpaperProvider({ children }: { children: ReactNode }) {
  const [wallpaperHistory, setWallpaperHistory] = useState<string[]>([]);

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
  const saveToHistory = (imagePath: string) => {
    const newHistory = [imagePath, ...wallpaperHistory.filter(path => path !== imagePath)].slice(0, 10); // Keep last 10
    setWallpaperHistory(newHistory);
    localStorage.setItem('wallpaper-history', JSON.stringify(newHistory));
  };

  // Handle setting wallpaper from any source
  const setWallpaper = async (imagePath: string) => {
    try {
      await invoke('set_wallpapar_from_path', { imagePath });
      saveToHistory(imagePath);
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