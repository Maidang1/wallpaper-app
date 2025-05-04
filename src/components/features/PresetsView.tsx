import { useState } from 'react';
import { motion } from 'motion/react';
import { useWallpaper } from '../../contexts/WallpaperContext';

export function PresetsView() {
  const { setWallpaper } = useWallpaper();
  const [presetWallpapers] = useState<string[]>([
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809', // Example preset 1
    'https://images.unsplash.com/photo-1614102073832-030967418971', // Example preset 2
    'https://images.unsplash.com/photo-1510906594845-bc082582c8cc', // Example preset 3
    'https://images.unsplash.com/photo-1502239608882-93b729c6af43', // Example preset 4
    'https://images.unsplash.com/photo-1604076850742-4c7221f3101b', // Example preset 5
    'https://images.unsplash.com/photo-1513151233558-d860c5398176', // Example preset 6
  ]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-medium text-gray-800 dark:text-white mb-4">精选壁纸</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {presetWallpapers.map((url, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="relative aspect-video overflow-hidden rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-800/20"
            onClick={() => setWallpaper(url)}
          >
            <img 
              src={`${url}?auto=format&fit=crop&w=400&h=225`} 
              alt={`Preset wallpaper ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}