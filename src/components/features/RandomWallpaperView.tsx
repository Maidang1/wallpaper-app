import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useWallpaper } from '../../contexts/WallpaperContext';
import { invoke } from '@tauri-apps/api/core';
import { Loader2, RefreshCw } from 'lucide-react';
import { RippleButton } from "@/components/magicui/ripple-button";

export function RandomWallpaperView() {
  const { setWallpaper } = useWallpaper();
  const [loading, setLoading] = useState(false);
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch a random wallpaper
  const fetchRandomWallpaper = async () => {
    setLoading(true);
    setError(null);

    try {
      // Clear previous image if exists
      if (currentImagePath) {
        try {
          await invoke('remove_image_from_cache', { filePath: currentImagePath });
        } catch (e) {
          console.error('Failed to remove previous image:', e);
        }
      }

      // Get new random image
      const imagePath: string = await invoke('get_random_image_path');

      if (imagePath) {
        setCurrentImagePath(imagePath);
        setWallpaper(imagePath);
      } else {
        setError('无法获取随机壁纸，请稍后再试');
      }
    } catch (err) {
      console.error('Error fetching random wallpaper:', err);
      setError('获取壁纸时出错');
    } finally {
      setLoading(false);
    }
  };


  // Cleanup on component unmount - remove any unconfirmed images
  useEffect(() => {
    return () => {
      if (currentImagePath) {
        invoke('remove_image_from_cache', { filePath: currentImagePath }).catch(e => {
          console.error('Failed to remove image on unmount:', e);
        });
      }
    };
  }, [currentImagePath]);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-medium text-gray-800 dark:text-white mb-4">随机壁纸</h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500 dark:text-gray-400" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">正在获取随机壁纸...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-10">
          <p className="text-red-500">{error}</p>
          <RippleButton onClick={fetchRandomWallpaper} className="mt-4">
            重试
          </RippleButton>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer"
            onClick={fetchRandomWallpaper}
          >
            <div className="bg-gray-200/50 dark:bg-white/10 p-4 rounded-full mb-4">
              <RefreshCw size={40} className="text-gray-600 dark:text-white/80" />
            </div>
            <p className="text-gray-800 dark:text-white font-medium text-lg mb-2">获取随机壁纸</p>
            <p className="text-gray-600 dark:text-white/70 text-sm text-center max-w-md">
              点击获取随机壁纸，您可以预览后选择是否设置为壁纸
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}