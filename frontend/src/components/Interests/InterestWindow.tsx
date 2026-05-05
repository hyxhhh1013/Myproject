import { Sidebar } from './Sidebar';
import { ContentArea } from './ContentArea';
import Draggable from 'react-draggable';
import { useState, useEffect } from 'react';

export const InterestWindow = () => {
  // 状态管理：鼠标位置
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // 处理鼠标移动
  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };
  
  // 监听鼠标移动事件
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    // 背景容器：深色暖光背�?+ 动态流体背�?    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4 sm:p-10 overflow-hidden relative" 
         style={{
           '--mouse-x': `${mousePosition.x}px`,
           '--mouse-y': `${mousePosition.y}px`
         } as React.CSSProperties}>
      {/* 动态流体背�?*/}
      <div className="absolute inset-0 overflow-hidden">
        {/* 彩色光晕 */}
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        
        {/* 光标跟随聚光灯效�?*/}
        <div className="cursor-spotlight"></div>
      </div>
      
      {/* 核心毛玻璃窗�?- 使用 Draggable 包裹 */}
      <Draggable handle=".window-header" disabled={window.innerWidth < 768}>
        <div className="w-full max-w-[1200px] h-[800px] md:h-[800px] lg:h-[850px] glass-panel rounded-3xl overflow-hidden flex flex-col relative z-10 cursor-follow">
          
          {/* 窗口顶部模拟工具�?(红绿�?+ 地址�? - 添加 handle 类名 */}
          <div className="h-12 flex items-center px-4 space-x-4 border-b border-white/10 window-header cursor-move">
            <div className="flex space-x-2">
               <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            {/* 模拟地址�?*/}
            <div className="hidden md:flex flex-1 max-w-lg mx-auto bg-black/20 rounded-md h-7 flex items-center justify-center text-xs text-white/40">
              steary.com
            </div>
            <div className="flex space-x-3 text-white/60">
               {/* 放入一些顶部图标，如分享、刷�?*/}
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </div>
          </div>

          {/* 窗口主体内容 */}
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <ContentArea />
          </div>
        </div>
      </Draggable>
    </div>
  );
};



