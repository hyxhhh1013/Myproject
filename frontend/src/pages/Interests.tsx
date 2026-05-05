import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/Interests/Sidebar';
import { ContentArea } from '../components/Interests/ContentArea';

// import './Interests.css';

export default function Interests() {
  const [isMobile, setIsMobile] = useState(false);
  
  // 检测移动端屏幕尺寸
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // 初始化和窗口大小变化时检测
  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  useEffect(() => {
    // Simple visitor counter
    const visited = sessionStorage.getItem('visited_interests');
    if (!visited) {
        axios.post('/site-config/view').catch(() => {});
        sessionStorage.setItem('visited_interests', 'true');
    }
  }, []);

  // 移动端顶部导航栏 - 胶囊切换器风格
  const MobileNav = () => {
    const [activeTab, setActiveTab] = useState('全部');
    
    return (
      <div className="relative flex gap-2 overflow-x-auto p-4 no-scrollbar">
        {/* 动态背景滑块 */}
        <motion.div
          className="absolute inset-y-4 left-4 bg-white rounded-full shadow-lg shadow-white/20"
          layoutId="activeTab"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        
        {['全部', '听', '看', '玩', '读'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab ? 'text-black z-10' : 'bg-transparent text-white/60 border border-white/5 hover:bg-white/10 z-10'}`}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* 移动端显示顶部导航栏 */}
      {isMobile && <MobileNav />}
      
      <div className="flex-1 flex overflow-hidden">
        {/* 桌面端显示侧边栏 */}
        {!isMobile && <Sidebar />}
        
        {/* 内容区域 - 移动端占满宽度 */}
        <div className={`${isMobile ? 'w-full p-0' : 'flex-1 p-6'} overflow-y-auto custom-scrollbar`}>
          <ContentArea />
        </div>
      </div>
    </div>
  );
}


