import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { GlassCard } from './GlassCard';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Guestbook: React.FC = () => {
  const { guestbookEntries, addGuestbookEntry } = useAppStore();
  const [message, setMessage] = useState('');
  const [color, setColor] = useState('#ffcc00');

  // 可用的便利贴颜色
  const colors = [
    '#ffcc00', // 黄色
    '#ff6b6b', // 红色
    '#4ecdc4', // 青色
    '#95e1d3', // 浅绿色
    '#f38181', // 粉色
    '#a8e6cf', // 薄荷绿
    '#dcedc1', // 淡绿色
    '#ffd3b6', // 橙色
    '#ffeaa7', // 浅黄色
    '#dda0dd', // 紫色
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // 随机位置（在窗口内）
    const randomX = Math.floor(Math.random() * (window.innerWidth - 300));
    const randomY = Math.floor(Math.random() * (window.innerHeight - 200));

    addGuestbookEntry({
      text: message.trim(),
      color,
      position: { x: randomX, y: randomY },
    });

    // 显示成功通知
    toast.success('留言已成功发布！', {
      className: 'bg-black/80 backdrop-blur-md text-white border border-white/20',
    });

    setMessage('');
    setColor('#ffcc00');
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* 便利贴容器 */}
      <div className="fixed inset-0 pointer-events-none z-20">
        {guestbookEntries.map((entry) => (
          <StickyNote
            key={entry.id}
            entry={entry}
            className="pointer-events-auto"
          />
        ))}
      </div>

      {/* 留言表单 */}
      <GlassCard className="max-w-2xl mx-auto p-6 relative z-30">
        <h2 className="text-2xl font-bold mb-6 text-white">访客留言墙</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
              写下你的留言
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="分享你的想法..."
              className="w-full px-4 py-3 bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white resize-y min-h-[120px]"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              选择颜色
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 transform hover:scale-110 ${color === c ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                  aria-label={`选择${c}颜色`}
                />
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            发送留言 ✨
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-white/60">
          提示：点击并拖动便利贴可以改变位置
        </div>
      </GlassCard>
    </div>
  );
};

// 便利贴组件
interface StickyNoteProps {
  entry: {
    id: string;
    text: string;
    color: string;
    position: { x: number; y: number };
    zIndex: number;
  };
  className?: string;
}

const StickyNote: React.FC<StickyNoteProps> = ({ entry, className }) => {
  const { updateGuestbookEntryPosition } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - entry.position.x,
      y: e.clientY - entry.position.y,
    });
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      
      updateGuestbookEntryPosition(entry.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset, entry.id, updateGuestbookEntryPosition]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className={`fixed cursor-move shadow-lg p-4 rounded-lg max-w-xs ${className}`}
      style={{
        left: entry.position.x,
        top: entry.position.y,
        backgroundColor: entry.color,
        zIndex: entry.zIndex,
        transform: 'rotate(-2deg)',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="font-handwriting text-gray-800 whitespace-pre-wrap break-words">
        {entry.text}
      </div>
    </motion.div>
  );
};

export default Guestbook;