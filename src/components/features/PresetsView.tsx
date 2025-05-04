import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useWallpaper } from '../../contexts/WallpaperContext';
import { client } from '../../image/client';
import { Photo } from 'pexels';

export function PresetsView() {
  const { setWallpaper } = useWallpaper();
  const [loading, setLoading] = useState(true);
  const [presetWallpapers, setPresetWallpapers] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [categories] = useState([
    { name: '自然', query: 'nature' },
    { name: '城市', query: 'city' },
    { name: '抽象', query: 'abstract' },
    { name: '风景', query: 'landscape' },
    { name: '极简', query: 'minimal' },
  ]);
  const [activeCategory, setActiveCategory] = useState('nature');

  useEffect(() => {
    const fetchWallpapers = async () => {
      setLoading(true);
      try {
        const response = await client.photos.search({ 
          query: activeCategory,
          per_page: 15,
          page,
          orientation: 'landscape'
        });
        
        if ('photos' in response) {
          setPresetWallpapers(response.photos);
        }
      } catch (error) {
        console.error('Failed to fetch wallpapers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallpapers();
  }, [activeCategory, page]);

  const handleCategoryChange = (query: string) => {
    setActiveCategory(query);
    setPage(1); // Reset to first page when changing category
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-medium text-gray-800 dark:text-white mb-4">精选壁纸</h2>
      
      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.query}
            onClick={() => handleCategoryChange(category.query)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category.query
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presetWallpapers.map((photo) => (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.05 }}
              className="relative aspect-video overflow-hidden rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-800/20"
              onClick={() => setWallpaper(photo.src.original)}
            >
              <img 
                src={photo.src.medium} 
                alt={photo.alt || `Preset wallpaper`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-xs text-white">{photo.photographer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-4">
        <button 
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1 || loading}
          className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
        >
          上一页
        </button>
        <span className="flex items-center text-gray-800 dark:text-white">第 {page} 页</span>
        <button 
          onClick={() => setPage(prev => prev + 1)}
          disabled={loading}
          className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    </div>
  );
}