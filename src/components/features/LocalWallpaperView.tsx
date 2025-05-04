import { motion } from 'motion/react';
import { open } from '@tauri-apps/plugin-dialog';
import { useWallpaper } from '../../contexts/WallpaperContext';
import { UploadIcon, X, Check } from 'lucide-react';
import { useState } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';

export function LocalWallpaperView() {
  const { setWallpaper } = useWallpaper();
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedImagePath, setSelectedImagePath] = useState<string | null>(null);

  // Handle selecting local image
  const handleSelectLocalImage = async () => {
    const file = await open({
      multiple: false,
      filters: [
        {
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'gif'],
        },
      ],
    });
    
    if (file) {
      // Store the file path for later use
      setSelectedImagePath(file as string);
      
      // Convert the file path to a URL that can be used in an img tag
      const imageUrl = convertFileSrc(file as string);
      setPreviewImage(imageUrl);
    }
  };

  // Handle confirming the wallpaper change
  const handleConfirmWallpaper = async () => {
    if (selectedImagePath) {
      await setWallpaper(selectedImagePath);
      // Reset the preview after setting the wallpaper
      resetPreview();
    }
  };

  // Handle canceling the wallpaper change
  const resetPreview = () => {
    setPreviewImage(null);
    setSelectedImagePath(null);
  };

  if (previewImage) {
    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto">
        <div className="relative w-full">
          <h2 className="text-xl font-medium mb-4">预览壁纸</h2>
          
          {/* Preview image container */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4">
            <img 
              src={previewImage} 
              alt="Wallpaper preview" 
              className="w-full h-full object-contain bg-gray-800/30 backdrop-blur-sm"
            />
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center gap-2 backdrop-blur-sm"
              onClick={resetPreview}
            >
              <X size={18} /> 取消
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-full bg-green-500/20 text-green-500 border border-green-500/30 flex items-center gap-2 backdrop-blur-sm"
              onClick={handleConfirmWallpaper}
            >
              <Check size={18} /> 确认设置
            </motion.button>
          </div>

          {/* File name indicator */}
          <p className="text-center text-sm mt-4 opacity-70">
            {selectedImagePath?.split('/').pop()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-2xl mx-auto">
      <motion.div 
        className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer p-6 transition-colors ${
          isDragging ? 'border-white/60 bg-white/10' : 'border-white/30'
        } hover:border-white/60 hover:bg-white/5`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setIsDragging(true)}
        onMouseLeave={() => setIsDragging(false)}
        onClick={handleSelectLocalImage}
      >
        <div className="bg-white/10 p-4 rounded-full mb-4">
          <UploadIcon size={40} className="text-white/80" />
        </div>
        <p className="text-white font-medium text-lg mb-2">选取本地图片</p>
        <p className="text-white/70 text-sm text-center max-w-md">
          点击此区域选择您电脑中的图像文件作为壁纸
        </p>
        <p className="text-white/50 text-xs mt-4">
          支持 PNG, JPG, JPEG, GIF 格式
        </p>
      </motion.div>
    </div>
  );
}