import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

const MusicPlayer: React.FC = () => {
  const { moodMode, isPlaying, setIsPlaying } = useAppStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Lo-Fi music URL (using a free public domain track from Pixabay)
  const lofiMusicUrl = 'https://cdn.pixabay.com/download/audio/2022/03/12/audio_d7c8f986a7.mp3?filename=lofi-113942.mp3';

  // 自动播放/暂停音乐基于心情模式
  useEffect(() => {
    if (!audioRef.current) return;

    if (moodMode === 'chill' && !isPlaying) {
      audioRef.current.play().catch(error => {
        console.error('Failed to play music:', error);
        // 自动播放可能被浏览器阻止，需要用户交互才能播放
      });
      setIsPlaying(true);
    } else if (moodMode === 'coding' && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [moodMode, isPlaying, setIsPlaying]);

  // 手动切换播放状态
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Failed to play music:', error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-20 right-6 z-40">
      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={lofiMusicUrl}
        loop
        className="hidden"
      />

      {/* 圆形浮动音乐播放器按钮 */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlay}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-md border border-white/10 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg flex items-center justify-center"
        aria-label={isPlaying ? 'Pause Music' : 'Play Music'}
      >
        {/* 唱片封面 */}
        <div className={`w-12 h-12 rounded-full relative overflow-hidden border-2 border-white/20 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
          {/* 唱片中心 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white/80"></div>
          </div>
          {/* 唱片纹路 */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-blue-400/30 to-purple-400/30 opacity-70"></div>
        </div>
      </motion.button>
    </div>
  );
};

export default MusicPlayer;