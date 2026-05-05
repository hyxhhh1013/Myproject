import { Outlet, useLocation } from 'react-router-dom';
import { Dock } from './Dock';
import { WindowHeader } from './WindowHeader';
import SpotlightSearch from '../ui/SpotlightSearch';
import MusicPlayer from '../ui/MusicPlayer';
import { CommandPalette } from '../ui/CommandPalette';
import { useAppStore } from '../../store/useAppStore';

export const FixedOSLayout = () => {
  const location = useLocation();
  const { moodMode, toggleMoodMode } = useAppStore();
  
  // 映射路由到窗口标题
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Finder - Home';
      case '/projects': return moodMode === 'chill' ? 'My Playground' : 'Project Explorer';
      case '/interests': return 'Steary.com - Media';
      case '/skills': return 'System Settings';
      case '/contact': return 'Mail - Contact';
      case '/about': return 'About Me';
      case '/experience': return 'Time Machine';
      case '/photos': return 'Photos - Gallery';
      case '/demo/ai-assistant': return 'AI Assistant';
      case '/demo/dashboard': return 'Dashboard';
      case '/demo/notes': return 'Notes';
      case '/demo/pomodoro': return 'Pomodoro Timer';
      case '/demo/todo': return 'Todo List';
      case '/demo/weather': return 'WeatherCast';
      default: return 'System';
    }
  };

  // Mood Switch Component
  const MoodSwitch = () => {
    return (
      <button
        onClick={toggleMoodMode}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-md border border-white/10 hover:bg-white/[0.1] transition-all duration-300"
        aria-label="Toggle Mood Mode"
      >
        <div className={`w-3 h-3 rounded-full transition-all duration-500 ${moodMode === 'chill' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-green-500 to-cyan-500'}`}></div>
        <span className="text-sm font-medium">{moodMode === 'chill' ? 'Chill' : 'Coding'}</span>
        <div className={`relative w-12 h-6 rounded-full bg-white/[0.1] p-1 transition-all duration-500 ${moodMode === 'chill' ? 'justify-end' : 'justify-start'} flex`}>
          <div className="w-4 h-4 rounded-full bg-white transition-all duration-500 shadow-lg"></div>
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden flex items-center justify-center font-sans text-white bg-noise">
      {/* 1. 动态流体背景层 (Lava Lamp Effect) */}
      <div className="fixed inset-0 w-full h-full bg-[#0a0a0a] -z-50 overflow-hidden">
        {/* 动态光球根据moodMode变化 */}
        {moodMode === 'coding' ? (
          // Coding Mode: 深邃的紫色/蓝色调
          <>
            {/* 1. 紫色光球 */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
            
            {/* 2. 蓝色光球 */}
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/30 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000"></div>
            
            {/* 3. 粉色光球 (增加一点暖色对比) */}
            <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>
          </>
        ) : (
          // Chill Mode: 暖色调（日落橙、浅粉色）
          <>
            {/* 1. 日落橙光球 */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/30 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
            
            {/* 2. 浅粉色光球 */}
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-pink-400/30 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000"></div>
            
            {/* 3. 黄色光球 */}
            <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>
          </>
        )}
        
        {/* 4. 全局噪点层 (关键！让光晕更有质感) */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E')] opacity-[0.03]"></div>
      </div>
      
      {/* Layer 2: 核心固定窗口 */}
      {/* B. 修改窗口背景：调低不透明度，拉高模糊度 */}
      <div className="relative w-[95vw] h-[90vh] max-w-[1400px] flex flex-col rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-black/40 backdrop-blur-3xl transition-all duration-500 z-10">

        {/* 窗口头部 (固定不动) */}
        <WindowHeader title={getPageTitle()}>
          <MoodSwitch />
        </WindowHeader>

        {/* 3. 内容滚动区 (关键！所有的页面都在这里面渲染) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
           {/* 这里是React Router 渲染子页面的地方 */}
           <Outlet />
        </div>
      </div>

      {/* 底部 Dock (悬浮在窗口之上) */}
      <div className="absolute bottom-6 z-50">
        <Dock />
      </div>
      
      {/* 音乐播放器 */}
      <MusicPlayer />
      
      {/* 全局噪点纹理 */}
      <div className="fixed inset-0 bg-texture opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      {/* 全局搜索 */}
      <SpotlightSearch />
      
      {/* 命令面板 (Command Palette) */}
      <CommandPalette />
    </div>
  );
};
