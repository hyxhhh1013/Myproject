import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface GearItem {
  id: number;
  name: string;
  image: string;
  description: string;
}

export const GearComponent: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  // 示例装备数据
  const gearItems: GearItem[] = [
    {
      id: 1,
      name: 'MacBook Pro',
      image: 'https://via.placeholder.com/150',
      description: 'M3 Pro, 16GB RAM, 512GB SSD - 主力开发机器'
    },
    {
      id: 2,
      name: '机械键盘',
      image: 'https://via.placeholder.com/150',
      description: 'Cherry MX Brown 轴 - 打字手感无敌'
    },
    {
      id: 3,
      name: '鼠标',
      image: 'https://via.placeholder.com/150',
      description: 'Logitech MX Master 3S - 无线办公神器'
    },
    {
      id: 4,
      name: '显示器',
      image: 'https://via.placeholder.com/150',
      description: '27英寸 4K IPS - 色彩准确，适合设计'
    },
    {
      id: 5,
      name: '耳机',
      image: 'https://via.placeholder.com/150',
      description: 'Sony WH-1000XM5 - 主动降噪，音质出色'
    },
    {
      id: 6,
      name: '麦克风',
      image: 'https://via.placeholder.com/150',
      description: 'Blue Yeti - 高保真录音，适合播客'
    }
  ];

  return (
    <div className="glass-card p-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
      <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Gear / 装备清单</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {gearItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            transition={{ duration: 0.3 }}
            className="relative group"
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* 悬停时显示的设备信息 */}
            {hoveredItem === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute -bottom-4 -left-4 right-4 bg-gray-800/90 backdrop-blur-md p-3 rounded-lg border border-gray-700/50 shadow-xl z-20"
              >
                <h4 className="text-sm font-bold text-white mb-1">{item.name}</h4>
                <p className="text-xs text-gray-300">{item.description}</p>
              </motion.div>
            )}
            
            {/* 设备名称 */}
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-300 hover:text-white transition-colors">{item.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
