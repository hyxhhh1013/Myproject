import { useState, useCallback, useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

// Command Palette组件
export const CommandPalette = () => {
  const navigate = useNavigate();
  const { toggleMoodMode, isSearchOpen, toggleSearch, setSearchQuery, searchQuery } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // 命令列表
  const commands = [
    { id: 'home', name: 'Go to Home', action: () => navigate('/') },
    { id: 'resume', name: 'View Resume', action: () => navigate('/about') },
    { id: 'contact', name: 'Contact Me', action: () => navigate('/contact') },
    { id: 'toggle-theme', name: 'Toggle Theme', action: toggleMoodMode },
    { id: 'copy-email', name: 'Copy Email', action: () => {
        navigator.clipboard.writeText('your-email@example.com');
        // 可以添加一个提示
      }},
    { id: 'projects', name: 'View Projects', action: () => navigate('/projects') },
    { id: 'skills', name: 'View Skills', action: () => navigate('/skills') },
    { id: 'media', name: 'Open Media Center', action: () => navigate('/interests') },
  ];
  
  // 键盘快捷键处理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
      e.preventDefault();
      setIsOpen(!isOpen);
      setSearchQuery('');
    }
    
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [isOpen, setSearchQuery]);
  
  // 监听键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // 执行命令
  const executeCommand = (commandId: string) => {
    const command = commands.find(cmd => cmd.id === commandId);
    if (command) {
      command.action();
      setIsOpen(false);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-md rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              value={searchQuery}
              onValueChange={setSearchQuery}
              onSelect={executeCommand}
            >
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-white/60">
                  <span className="text-lg">🔍</span>
                  <Command.Input
                    placeholder="Type a command or search..."
                    className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/40"
                  />
                </div>
              </div>
              
              <Command.List className="max-h-[300px] overflow-y-auto">
                <Command.Empty className="p-4 text-white/40">
                  No commands found.
                </Command.Empty>
                
                <Command.Group>
                  <Command.Item
                    className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-3"
                    value="home"
                  >
                    <span className="text-xl">🏠</span>
                    <span>Go to Home</span>
                  </Command.Item>
                  
                  <Command.Item
                    className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-3"
                    value="resume"
                  >
                    <span className="text-xl">📄</span>
                    <span>View Resume</span>
                  </Command.Item>
                  
                  <Command.Item
                    className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-3"
                    value="projects"
                  >
                    <span className="text-xl">📁</span>
                    <span>View Projects</span>
                  </Command.Item>
                  
                  <Command.Item
                    className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-3"
                    value="skills"
                  >
                    <span className="text-xl">⚙️</span>
                    <span>View Skills</span>
                  </Command.Item>
                  
                  <Command.Item
                    className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-3"
                    value="media"
                  >
                    <span className="text-xl">🎮</span>
                    <span>Open Media Center</span>
                  </Command.Item>
                  
                  <Command.Item
                    className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-3"
                    value="contact"
                  >
                    <span className="text-xl">✉️</span>
                    <span>Contact Me</span>
                  </Command.Item>
                  
                  <Command.Item
                    className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-3"
                    value="toggle-theme"
                  >
                    <span className="text-xl">🌓</span>
                    <span>Toggle Theme</span>
                  </Command.Item>
                  
                  <Command.Item
                    className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-3"
                    value="copy-email"
                  >
                    <span className="text-xl">📋</span>
                    <span>Copy Email</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>
              
              <div className="px-4 py-2 border-t border-white/10 text-xs text-white/40">
                Press Ctrl+P or Cmd+P to open, Esc to close
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
