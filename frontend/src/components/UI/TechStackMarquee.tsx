import React from 'react';
import Marquee from 'react-fast-marquee';

interface TechStackItem {
  name: string;
  icon: string;
}

interface TechStackMarqueeProps {
  items?: TechStackItem[];
}

export const TechStackMarquee: React.FC<TechStackMarqueeProps> = ({
  items = [
    { name: 'VSCode', icon: '💻' },
    { name: 'Figma', icon: '🎨' },
    { name: 'Notion', icon: '📝' },
    { name: 'React', icon: '⚛️' },
    { name: 'TypeScript', icon: '🔷' },
    { name: 'Tailwind', icon: '🎨' },
    { name: 'Git', icon: '🌲' },
    { name: 'GitHub', icon: '🐙' },
    { name: 'Node.js', icon: '🟢' },
    { name: 'PostgreSQL', icon: '🐘' },
    { name: 'Docker', icon: '🐳' },
    { name: 'AWS', icon: '☁️' },
  ]
}) => {
  return (
    <div className="glass-card p-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
      <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Tech Stack / 技术栈</h3>
      <div className="relative overflow-hidden py-2">
        <Marquee
          speed={50}
          pauseOnHover
          pauseOnClick
          gradient
          gradientColor="rgba(0, 0, 0, 0.6)"
          gradientWidth={50}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-4 py-2 mr-4 bg-gray-800/50 hover:bg-gray-700/50 dark:hover:bg-gray-600/50 transition-all duration-300 rounded-full border border-gray-600/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm text-gray-300 hover:text-white transition-colors">{item.name}</span>
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};
