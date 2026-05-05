import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Loader2, Sparkles, Music, Play, Pause, SkipBack, SkipForward, ChevronUp, Disc } from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { useMusic } from '../../context/MusicContext';
import { getImageUrl } from '../../utils/imageUtils';

interface Message {
  id: number;
  content: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

const MAX_HISTORY = 6; // 最多保留6轮对话上下文

export const FloatingAIChatbot = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'music'>('ai');
  const [isOpen, setIsOpen] = useState(false);

  // AI Chat State
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, content: '你好！我是小智，你的智能助手。我可以帮你解答问题、介绍网站内容。有什么可以帮助你的吗？', sender: 'ai', timestamp: new Date() },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Music State
  const {
    currentMusic,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
  } = useMusic();

  const progressRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    if (Number.isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (progressRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      seekTo(percentage * duration);
    }
  }, [duration, seekTo]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 打开时自动聚焦输入框
  useEffect(() => {
    if (isOpen && activeTab === 'ai') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, activeTab]);

  // 限制消息历史长度
  const trimMessages = (msgs: Message[]): Message[] => {
    if (msgs.length <= MAX_HISTORY + 1) return msgs;
    const keep = msgs.slice(-MAX_HISTORY);
    return [msgs[0], ...keep]; // 保留第一条欢迎消息
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);

    const newUserMsg: Message = {
      id: Date.now(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => trimMessages([...prev, newUserMsg]));
    setIsLoading(true);

    try {
      // 限制发送的上下文数量以减小payload
      const chatMessages = messages
        .filter(m => m.id !== 1)
        .slice(-MAX_HISTORY)
        .map(m => ({
          role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: m.content
        }));

      chatMessages.push({
        role: 'user',
        content: userMessage
      });

      const response = await axios.post('/api/ai/chat', {
        messages: chatMessages
      });

      if (response.data.success) {
        const aiMsg: Message = {
          id: Date.now() + 1,
          content: response.data.message,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => trimMessages([...prev, aiMsg]));
      } else {
        setError(response.data.error || '获取AI回复失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        drag
        dragConstraints={{ left: 10, right: window.innerWidth - 60, top: 10, bottom: window.innerHeight - 60 }}
        dragMomentum={false}
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
        style={{ touchAction: 'none' }}
      >
        {/* Chat Window / Music Player */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden mb-4"
              style={{
                maxHeight: '70vh',
                width: '85vw',
                maxWidth: '360px'
              }}
            >
              {/* Header Tabs */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-600/20 dark:to-purple-600/20 border-b border-gray-200 dark:border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex bg-white/50 dark:bg-black/20 rounded-xl p-1 backdrop-blur-md">
                    <button
                      onClick={() => setActiveTab('ai')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'ai'
                          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Sparkles size={16} />
                      AI助手
                    </button>
                    <button
                      onClick={() => setActiveTab('music')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'music'
                          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Music size={16} />
                      音乐
                    </button>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              {activeTab === 'ai' ? (
                <>
                  <div className="overflow-y-auto p-3 space-y-2" style={{ maxHeight: '50vh' }}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.sender === 'user'
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-white/10'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md border border-gray-200 dark:border-white/10 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">正在思考...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center"
                      >
                        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-4 py-2 rounded-lg border border-red-200 dark:border-red-500/20">
                          {error}
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-gray-200 dark:border-white/10 p-2 bg-white/50 dark:bg-gray-900/50">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="输入消息..."
                        disabled={isLoading}
                        className="flex-1 px-3 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-white/10 text-gray-900 dark:text-white placeholder-gray-400 text-sm disabled:opacity-50 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-colors"
                      >
                        发送
                      </button>
                    </form>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
                      AI 可能会产生错误信息，请核对重要事实
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-2" style={{ maxHeight: '50vh' }}>
                  {currentMusic ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                          {currentMusic.coverUrl ? (
                            <img src={getImageUrl(currentMusic.coverUrl)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                              <Disc className="w-7 h-7 text-white/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">{currentMusic.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentMusic.artist || '未知艺术家'}</p>
                        </div>
                      </div>

                      <div>
                        <div
                          ref={progressRef}
                          className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
                          onMouseDown={handleProgressClick}
                          onTouchStart={handleProgressClick}
                        >
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <button onClick={playPrev} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                          <SkipBack className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button onClick={togglePlay} className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-lg">
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                        </button>
                        <button onClick={playNext} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                          <SkipForward className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setIsOpen(false);
                          window.location.href = '/interests#music';
                        }}
                        className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center justify-center gap-1"
                      >
                        <ChevronUp className="w-3 h-3" />
                        去音乐播放器
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                      <Music className="w-10 h-10 mb-2 opacity-50" />
                      <p className="text-sm">暂无播放的音乐</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-white dark:bg-gray-900/90 backdrop-blur-xl text-gray-700 dark:text-white rounded-full shadow-lg shadow-blue-500/10 flex items-center justify-center border border-gray-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500/50 transition-colors relative z-50"
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative"
              >
                {isPlaying ? (
                  <Music size={22} className="text-blue-500" />
                ) : (
                  <MessageCircle size={22} />
                )}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </>
  );
};
