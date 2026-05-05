import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Download } from 'lucide-react';

interface HolographicIDCardProps {
  className?: string;
}

export const HolographicIDCard: React.FC<HolographicIDCardProps> = ({ className = '' }) => {
  return (
    <motion.div
      className={`relative flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg overflow-hidden group ${className}`}
      whileHover={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)' }}
      style={{ perspective: 1000 }}
    >
      {/* 底层：磨砂玻璃背景，边缘流光 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10"></div>
      <div className="absolute inset-0 border border-white/20 rounded-2xl"></div>
      
      {/* 流光效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        ></motion.div>
        <motion.div
          className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-blue-500 to-transparent"
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
        ></motion.div>
      </div>
      
      {/* 中层：人物照片 - 去底半身像，破格3D感 */}
      <motion.div
        className="relative z-10 mb-6"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative w-48 h-64 overflow-visible">
          {/* 照片容器 */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl blur-sm"></div>
          
          {/* 人物照片 */}
          <img
            src="https://picsum.photos/id/1005/400/600"
            alt="Profile" 
            className="relative z-10 w-full h-full object-cover rounded-xl border-4 border-white/20 shadow-lg"
          />
          
          {/* 3D破格效果增强 */}
          <div className="absolute -bottom-2 -left-2 w-full h-full border-2 border-white/30 rounded-xl -z-0"></div>
          <div className="absolute -top-2 -right-2 w-full h-full border-2 border-white/30 rounded-xl -z-0"></div>
        </div>
      </motion.div>
      
      {/* 顶层：悬浮信息 */}
      <div className="relative z-10 text-center space-y-4">
        <motion.h2 
          className="text-2xl font-bold text-white"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          黄奕轩
        </motion.h2>
        
        <motion.p 
          className="text-purple-300 font-medium"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          AI 时代的新一代创作者
        </motion.p>
        
        {/* 社交按钮 */}
        <motion.div 
          className="flex gap-3 mt-4"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SocialButton icon={<Github />} href="https://github.com" />
          <SocialButton icon={<Linkedin />} href="https://linkedin.com" />
          <SocialButton icon={<Mail />} href="mailto:2090862712@qq.com" />
        </motion.div>
        
        {/* 下载简历按钮 */}
        <motion.button
          className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium hover:from-purple-500 hover:to-blue-500 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Download size={16} className="inline mr-2" />
          下载简历
        </motion.button>
      </div>
      
      {/* 底部装饰条 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500"></div>
    </motion.div>
  );
};

// Social Button Component
const SocialButton: React.FC<{ icon: React.ReactNode; href: string }> = ({ icon, href }) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300"
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
    </motion.a>
  );
};
