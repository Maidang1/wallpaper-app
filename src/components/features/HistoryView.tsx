import { motion } from 'motion/react';
import { useWallpaper } from '../../contexts/WallpaperContext';

export function HistoryView() {
  const { wallpaperHistory, setWallpaper } = useWallpaper();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-medium text-white mb-4">历史记录</h2>
      {wallpaperHistory.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallpaperHistory.map((path, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="relative aspect-video overflow-hidden rounded-lg cursor-pointer"
              onClick={() => setWallpaper(path)}
            >
              {path.startsWith('http') ? (
                <img 
                  src={`${path}?auto=format&fit=crop&w=400&h=225`} 
                  alt={`History wallpaper ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-black/40">
                  <p className="text-white text-sm p-2 text-center truncate max-w-full">
                    {path.split('/').pop()}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-white/70">暂无历史记录</p>
      )}
    </div>
  );
}