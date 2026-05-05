import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface DockItem {
  name: string;
  to: string;
  type: 'scroll' | 'route';
  icon: string;
}

export const Dock = () => {
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const dockItems: DockItem[] = [
    { name: '首页', to: '/', type: 'route', icon: '🏠' },
    { name: '项目', to: '/projects', type: 'route', icon: '💼' },
    { name: '技能', to: '/skills', type: 'route', icon: '🎯' },
    { name: '经历', to: '/about', type: 'route', icon: '👤' },
    { name: '摄影', to: '/photos', type: 'route', icon: '📷' },
    { name: '兴趣', to: '/interests', type: 'route', icon: '🎨' },
    { name: '联系', to: '/contact', type: 'route', icon: '📧' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      {/* Dock 背景 */}
      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl rounded-full p-2 shadow-lg border border-white/30">
        {dockItems.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const isActive = location.pathname === item.to || location.pathname + '#' === item.to.split('#')[0] + '#';
          
          return (
            <Link
              key={index}
              to={item.to}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative flex flex-col items-center justify-center px-4 py-3 rounded-full transition-all duration-300 ease-out transform ${isHovered ? 'scale-125 -translate-y-4' : 'scale-100'}`}
              style={{
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                padding: isHovered ? '12px 16px' : '10px 14px',
              }}
            >
              {/* Icon */}
              <span className="text-2xl mb-1">{item.icon}</span>
              
              {/* Label */}
              <span className={`text-xs font-medium transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};


