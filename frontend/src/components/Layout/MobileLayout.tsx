import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

// 移动端布局组件
export const MobileLayout = () => {
  const location = useLocation();
  const { moodMode } = useAppStore();
  
  // 触觉反馈函数
  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10); // 10ms轻微震动
    }
  };
  
  // 底部导航栏项目
  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/projects', icon: '📁', label: moodMode === 'chill' ? 'Playground' : 'Projects' },
    { path: '/skills', icon: '⚙️', label: 'Skills' },
    { path: '/interests', icon: '🎮', label: 'Media' },
    { path: '/about', icon: '👤', label: 'About' },
  ];
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden flex flex-col font-sans text-white bg-[#0a0a0a]">
      {/* 动态流体背景层 */}
      <div className="fixed inset-0 w-full h-full bg-[#0a0a0a] -z-50 overflow-hidden">
        {moodMode === 'coding' ? (
          // Coding Mode: 深邃的紫色/蓝色调
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/30 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>
          </>
        ) : (
          // Chill Mode: 暖色调（日落橙、浅粉色）
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/30 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-pink-400/30 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>
          </>
        )}
        
        {/* 全局噪点层 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E')] opacity-[0.03]"></div>
      </div>
      
      {/* 内容区域 - 添加底部内边距，防止被Dock栏遮挡 */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <Outlet />
      </div>
      
      {/* 底部导航栏 (TabBar) - iOS 悬浮岛风格 */}
      <div className="fixed bottom-6 left-4 right-4 h-16 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex justify-around items-center z-50 shadow-2xl">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-300 ${location.pathname === item.path ? 'text-blue-400' : 'text-white/60 hover:text-white'}`}
            onClick={triggerHapticFeedback}
          >
            <span className="text-2xl">{item.icon}</span>
            {/* 去掉文字，只保留图标 */}
          </Link>
        ))}
      </div>
    </div>
  );
};
