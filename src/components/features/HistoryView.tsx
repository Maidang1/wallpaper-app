import { motion } from 'motion/react';
import { useWallpaper } from '../../contexts/WallpaperContext';

export function HistoryView() {
  const { wallpaperHistory, setWallpaper } = useWallpaper();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-medium text-gray-800 dark:text-white mb-4">历史记录</h2>
      {wallpaperHistory.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallpaperHistory.map((path, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="relative aspect-video overflow-hidden rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-800/20"
              onClick={() => setWallpaper(path)}
            >
              {path.startsWith('http') ? (
                <img 
                  src={`${path}?auto=format&fit=crop&w=400&h=225`} 
                  alt={`History wallpaper ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800/40">
                  <p className="text-gray-800 dark:text-white text-sm p-2 text-center truncate max-w-full">
                    {path.split('/').pop()}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-white/70">暂无历史记录</p>
      )}
    </div>
  );
}