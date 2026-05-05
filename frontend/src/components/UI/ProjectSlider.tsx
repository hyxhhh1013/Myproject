import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

interface ProjectSliderProps {
  projects?: Project[];
}

export const ProjectSlider: React.FC<ProjectSliderProps> = ({
  projects = [
    {
      id: 1,
      title: 'AI 个人助手',
      description: '基于 GPT-4 的智能助手，支持多模态交互',
      image: 'https://picsum.photos/id/1/800/600',
      link: '#',
    },
    {
      id: 2,
      title: '数据可视化平台',
      description: '实时数据监控与可视化分析系统',
      image: 'https://picsum.photos/id/2/800/600',
      link: '#',
    },
    {
      id: 3,
      title: '智能聊天机器人',
      description: '基于深度学习的自然语言处理系统',
      image: 'https://picsum.photos/id/3/800/600',
      link: '#',
    },
  ]
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [projects.length]);

  const currentProject = projects[currentIndex];

  return (
    <motion.div 
      className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition cursor-pointer group relative overflow-hidden"
      whileHover={{ scale: 1.01 }}
      onClick={() => window.open(currentProject.link, '_blank')}
    >
      <h3 className="text-white/40 text-xs uppercase tracking-widest mb-4">FEATURED PROJECT</h3>
      
      {/* 项目封面 */}
      <div className="relative aspect-video mb-4 overflow-hidden rounded-xl">
        <motion.img
          src={currentProject.image}
          alt={currentProject.title}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {/* 项目信息 */}
      <div className="text-2xl font-bold text-white mb-2">{currentProject.title}</div>
      <div className="text-white/60 text-sm mb-4">{currentProject.description}</div>
      
      {/* 轮播指示器 */}
      <div className="flex gap-2 mb-4">
        {projects.map((_, index) => (
          <motion.div
            key={index}
            className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white w-8' : 'bg-white/30 w-3'}`}
            animate={{ scale: index === currentIndex ? 1.1 : 1 }}
          />
        ))}
      </div>
      
      {/* 箭头指示器 */}
      <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-40 transition">
        <ArrowRight className="w-10 h-10" />
      </div>
    </motion.div>
  );
};
