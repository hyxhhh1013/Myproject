import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Dock } from './Dock';

export const Layout = ({ children }: { children: React.ReactNode }) => {
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
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 transition-colors duration-300 font-sans text-gray-900 dark:text-gray-100 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 relative overflow-hidden" 
         style={{
           '--mouse-x': `${mousePosition.x}px`,
           '--mouse-y': `${mousePosition.y}px`
         } as React.CSSProperties}>
      {/* 动态流体背�?*/}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* 彩色光晕 */}
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        
        {/* 光标跟随聚光灯效�?*/}
        <div className="cursor-spotlight"></div>
      </div>
      
      <Header />
      <main className="relative z-10">
        {children}
      </main>
      <Footer />
      <Dock />
    </div>
  );
};



