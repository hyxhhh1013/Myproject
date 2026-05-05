import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  bordered?: boolean;
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  rounded = 'lg',
  bordered = true,
  hoverable = false,
}) => {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const { mousePosition, moodMode } = useAppStore();

  // 监听鼠标位置，更新卡片的光斑效果
  useEffect(() => {
    const updateSpotlight = () => {
      if (!cardRef.current) return;

      const cardRect = cardRef.current.getBoundingClientRect();
      const x = mousePosition.x - cardRect.left;
      const y = mousePosition.y - cardRect.top;

      cardRef.current.style.setProperty('--mouse-x', `${x}px`);
      cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    updateSpotlight();
  }, [mousePosition]);

  // 定义浮动动画变体
  const floatAnimation = {
    animate: {
      y: [0, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // 处理卡片内鼠标移动，更新局部鼠标位置
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--local-mouse-x', `${e.clientX - left}px`);
    e.currentTarget.style.setProperty('--local-mouse-y', `${e.clientY - top}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`
        bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300
        ${roundedClasses[rounded]}
        ${className}
        relative overflow-hidden group
      `}
      onMouseMove={handleMouseMove}
      // 只有在 chill 模式下才应用浮动动画
      animate={moodMode === 'chill' ? floatAnimation.animate : {}}
    >
      {/* 1. 全局鼠标光斑效果 - 从外部传入的鼠标位置 */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1), transparent 40%)`
        }}
      />
      
      {/* 2. 卡片内鼠标移动光斑效果 - 更精确的跟随 */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(300px circle at var(--local-mouse-x, 50%) var(--local-mouse-y, 50%), rgba(255,255,255,0.15), transparent 60%)`
        }}
      />
      
      {/* 内容层 */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
