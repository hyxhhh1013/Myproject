import { useState } from 'react';
import { motion } from 'framer-motion';

export const Sidebar = () => {
  const [activeCategory, setActiveCategory] = useState('music');

  const categories = [
    { id: 'music', name: '听', icon: '🎵' },
    { id: 'movies', name: '看', icon: '🎬' },
    { id: 'games', name: '玩', icon: '🎮' },
    { id: 'books', name: '读', icon: '📚' },
  ];

  return (
    <div className="w-64 flex flex-col items-start py-6 px-4 border-r border-white/10 bg-white/[0.03] backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <span className="text-white font-bold">MC</span>
        </div>
        <h1 className="text-xl font-bold text-white">Media Center</h1>
      </div>

      {/* Categories */}
      <div className="w-full space-y-2 mb-8">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeCategory === category.id ? 'bg-white/[0.06] border border-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/[0.03]'}`}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">{category.icon}</span>
            <span className="font-medium">{category.name}</span>
            {activeCategory === category.id && (
              <motion.div
                layoutId="activeIndicator"
                className="ml-auto w-2 h-2 rounded-full bg-blue-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Library Stats */}
      <div className="w-full border-t border-white/10 pt-6">
        <h3 className="text-sm text-white/40 uppercase mb-4">Library Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Total Items</span>
            <span className="text-white font-medium">128</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Recently Added</span>
            <span className="text-white font-medium">24</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Favorites</span>
            <span className="text-white font-medium">36</span>
          </div>
        </div>
      </div>
    </div>
  );
};



