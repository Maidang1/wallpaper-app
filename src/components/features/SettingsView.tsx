import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { confirm } from "@tauri-apps/plugin-dialog"

// Interface for cache information
interface CacheInfo {
  size_bytes: number;
  file_count: number;
}

export function SettingsView() {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Format bytes to a readable string (KB, MB, etc.)
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load cache information
  const loadCacheInfo = async () => {
    try {
      const info = await invoke<CacheInfo>('get_cache_info');
      setCacheInfo(info);
    } catch (error) {
      setMessage({
        text: `获取缓存信息失败: ${error}`,
        type: 'error'
      });
    }
  };

  // Clean cache
  const handleCleanCache = async () => {

    const isConfirm = await confirm("确定要清理缓存吗？这将删除所有缓存的壁纸图片。", {
      kind: "warning",
      title: "清理缓存",
    })

    if (isConfirm) {
      setIsLoading(true);
      setMessage(null);

      try {
        const result = await invoke<string>('clean_cache');
        setMessage({
          text: result,
          type: 'success'
        });

        // Refresh cache info after cleaning
        loadCacheInfo();
      } catch (error) {
        setMessage({
          text: `清理缓存失败: ${error}`,
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Load cache info when component mounts
  useEffect(() => {
    loadCacheInfo();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-medium text-gray-800 dark:text-white mb-6">设置</h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">缓存管理</h3>

        {/* Cache Information */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">缓存信息</h4>

          {cacheInfo ? (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">文件数量:</span> {cacheInfo.file_count} 个文件
              </p>
              <p className="text-sm">
                <span className="font-medium">占用空间:</span> {formatBytes(cacheInfo.size_bytes)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">正在加载缓存信息...</p>
          )}
        </div>

        {/* Clean Cache Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCleanCache}
          disabled={isLoading || (!!cacheInfo && cacheInfo.file_count === 0)}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isLoading || (cacheInfo && cacheInfo.file_count === 0)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'}`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
              清理中...
            </>
          ) : (
            <>
              <Trash2 className="-ml-1 mr-2 h-4 w-4" />
              清理缓存图片
            </>
          )}
        </motion.button>

        {/* Refresh Cache Info Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={loadCacheInfo}
          className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw className="-ml-0.5 mr-2 h-4 w-4" />
          刷新信息
        </motion.button>

        {/* Status Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
            message.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
              'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}