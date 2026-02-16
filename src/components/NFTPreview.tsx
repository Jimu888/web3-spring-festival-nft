import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Maximize2 } from 'lucide-react';

const NFTPreview: React.FC<{ showCaption?: boolean }> = ({ showCaption = true }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // 预览资源（已接入几木提供的视频/封面）
  const staticImageUrl = "/nft-preview.jpg"; // 静态封面
  const animatedVideoUrl = "/nft-preview.mp4"; // 动态视频（由mov转码）

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const openFullscreen = () => {
    setShowFullscreen(true);
  };

  const closeFullscreen = () => {
    setShowFullscreen(false);
  };

  return (
    <>
      {/* 主预览区域 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative group"
      >
        {/* NFT容器 */}
        <div className="relative w-72 h-72 lg:w-[360px] lg:h-[360px] mx-auto">
          {/* 背景光晕 */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-yellow-500/30 rounded-full blur-2xl scale-110 animate-pulse" />
          
          {/* 主要展示区域 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl backdrop-blur-md"
          >
            {/* 动态内容 */}
            {isPlaying ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster={staticImageUrl}
              >
                <source src={animatedVideoUrl} type="video/mp4" />
                {/* 如果视频无法加载，显示静态图片 */}
                <img 
                  src={staticImageUrl} 
                  alt="Web3春节联欢晚会2026纪念徽章"
                  className="w-full h-full object-cover"
                />
              </video>
            ) : (
              <img 
                src={staticImageUrl} 
                alt="Web3春节联欢晚会2026纪念徽章"
                className="w-full h-full object-cover"
              />
            )}
            
            {/* 悬浮控制按钮 */}
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={openFullscreen}
                className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <Maximize2 size={16} />
              </motion.button>
            </div>
            
            {/* 预览区不再压字遮挡NFT（文案移到卡片外） */}
          </motion.div>

          {/* 卡片外文案（不遮挡NFT） */}
          {showCaption && (
            <div className="mt-4 text-center">
              <h3 className="text-base font-semibold text-white/90">丙午马年徽章</h3>
              <p className="text-sm text-gray-300/80">Web3春节联欢晚会 2026</p>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-green-300/90 font-medium">动态NFT</span>
              </div>
            </div>
          )}
        </div>

        {/* 装饰性元素 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-4 -right-4 w-8 h-8 border-2 border-yellow-400 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-4 -left-4 w-6 h-6 border-2 border-red-400 rounded-full"
        />
      </motion.div>

      {/* 全屏预览模态框 */}
      {showFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative max-w-2xl max-h-2xl w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full bg-slate-800 rounded-2xl overflow-hidden">
              {isPlaying ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                  poster={staticImageUrl}
                >
                  <source src={animatedVideoUrl} type="video/mp4" />
                  <img 
                    src={staticImageUrl} 
                    alt="Web3春节联欢晚会2026纪念徽章"
                    className="w-full h-full object-contain"
                  />
                </video>
              ) : (
                <img 
                  src={staticImageUrl} 
                  alt="Web3春节联欢晚会2026纪念徽章"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            
            {/* 关闭按钮 */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default NFTPreview;