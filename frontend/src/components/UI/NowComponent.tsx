import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NowComponentProps {
  status?: string;
  isBusy?: boolean;
  listeningTo?: string;
}

export const NowComponent: React.FC<NowComponentProps> = ({
  status = '正在重构我的个人网站，探索 Glassmorphism 设计美学...',
  isBusy = false,
  listeningTo = 'Chill Lofi'
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // 打字机效果
  useEffect(() => {
    if (isTyping && currentIndex < status.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + status[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else if (currentIndex >= status.length) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
        setCurrentIndex(0);
        setDisplayedText('');
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setIsTyping(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, isTyping, status]);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span 
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBusy ? 'bg-red-400' : 'bg-green-400'}`}
          ></span>
          <span 
            className={`relative inline-flex rounded-full h-3 w-3 ${isBusy ? 'bg-red-500' : 'bg-green-500'}`}
          ></span>
        </span>
        <div className="text-white font-medium">
          {displayedText}{isTyping ? '|' : ''}
        </div>
      </div>
      
      {listeningTo && (
        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
          🎵 {listeningTo}
        </span>
      )}
    </div>
  );
};
