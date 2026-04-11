import { useEffect, useState } from 'react';
import axios from '../utils/axiosConfig';
import { motion } from 'framer-motion';
import { MusicSection } from '../components/Sections/MusicSection';
import { MovieSection } from '../components/Sections/MovieSection';
import { MomentsSection } from '../components/Sections/MomentsSection';
import { TravelMap } from '../components/Sections/TravelMap';
import WeatherCastMiniDemo from '../components/Demos/WeatherCastMiniDemo';
import { Sparkles, Send, Flame, ChevronDown } from 'lucide-react';
import './Interests.css';

interface DanmakuItem {
  id: number;
  content: string;
  color: string;
  orderIndex: number;
}

const DanmakuSystem = () => {
  const [messages, setMessages] = useState<DanmakuItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState('blue');

  const colorOptions = [
    { value: 'blue', bg: 'bg-blue-500' },
    { value: 'gray', bg: 'bg-gray-500' },
    { value: 'darkblue', bg: 'bg-blue-800' },
    { value: 'slate', bg: 'bg-slate-600' },
    { value: 'primary', bg: 'bg-indigo-500' },
    { value: 'pink', bg: 'bg-pink-500' },
  ];

  useEffect(() => {
    fetchDanmaku();
  }, []);

  const fetchDanmaku = async () => {
    try {
      const response = await axios.get('/api/danmaku/visible');
      if (response.data.status === 'success' && response.data.data) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch danmaku:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || submitting) return;
    
    try {
      setSubmitting(true);
      await axios.post('/api/danmaku', { content: inputValue.trim(), color: selectedColor });
      setInputValue('');
      fetchDanmaku();
    } catch (error) {
      console.error('Failed to send danmaku:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getColorStyle = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'rgba(59, 130, 246, 0.8)',
      'gray': 'rgba(107, 114, 128, 0.8)',
      'darkblue': 'rgba(29, 78, 216, 0.8)',
      'slate': 'rgba(75, 85, 99, 0.8)',
      'primary': 'rgba(37, 99, 235, 0.8)',
      'pink': 'rgba(236, 72, 153, 0.8)',
    };
    return colorMap[color] || 'rgba(59, 130, 246, 0.8)';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="danmaku-system h-full bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-sm dark:shadow-xl border border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Sparkles className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          弹幕留言
        </h3>
      </div>
      
      {/* 弹幕显示区域 */}
      <div className="relative overflow-hidden border border-gray-300/50 dark:border-gray-700/50 rounded-2xl bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm mb-6 h-[280px] shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-500/5" />
        
        {messages.map((msg, index) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, x: '100%', scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              scale: 1,
              transition: {
                duration: 0.5,
                delay: index * 0.1
              }
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
              transition: { duration: 0.2 }
            }}
            className="absolute whitespace-nowrap text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm cursor-pointer"
            style={{
              top: `${(index % 5) * 20 + 10}%`,
              right: '-100%',
              animation: 'danmakuMove 15s linear infinite',
              animationDelay: `${index * 3}s`,
              background: getColorStyle(msg.color),
              color: 'white',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transformOrigin: 'right center'
            }}
          >
            {msg.content}
          </motion.div>
        ))}
        
        <style>{`
          @keyframes danmakuMove {
            from { transform: translateX(0); }
            to { transform: translateX(-150vw); }
          }
        `}</style>
      </div>
      
      {/* 输入区域 */}
      <div className="flex flex-col gap-3">
        {/* 颜色选择器 */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">气泡颜色:</span>
          <div className="flex gap-2">
            {colorOptions.map((c) => (
              <motion.button
                key={c.value}
                type="button"
                onClick={() => setSelectedColor(c.value)}
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  scale: selectedColor === c.value ? 1.25 : 1,
                  boxShadow: selectedColor === c.value ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none'
                }}
                transition={{ duration: 0.2 }}
                className={`w-6 h-6 rounded-full ${c.bg} ring-offset-1 dark:ring-offset-gray-900 ${selectedColor === c.value ? 'ring-2 ring-blue-400' : 'opacity-70'}`}
                aria-label={`Select ${c.value} color`}
              />
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <motion.input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="发送你的弹幕..."
            whileFocus={{ 
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
              scale: 1.01
            }}
            className="flex-1 px-5 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-gray-400 dark:focus:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
            maxLength={50}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            disabled={submitting || !inputValue.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <motion.div
              animate={{
                rotate: submitting ? 360 : 0
              }}
              transition={{
                duration: submitting ? 1 : 0.2,
                repeat: submitting ? Infinity : 0,
                ease: 'linear'
              }}
            >
              <Send className="w-4 h-4" />
            </motion.div>
            {submitting ? '发送中...' : '发送'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

// 每日热点资讯组件 - Apple风格
const HotNews = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初始检查
    checkMobile();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/news');
      if (response.data && response.data.items) {
        const formattedNews = response.data.items.slice(0, 8).map((item: any, index: number) => ({
          id: index,
          title: item.title,
          source: response.data.title || '科技新闻',
          link: item.link,
          hot: index < 3 // 前三条标红
        }));
        setNews(formattedNews);
      } else {
        // Fallback data when items is not available
        setNews([
          { id: 1, title: 'AI技术在前端开发中的应用', source: '技术周刊', hot: true, link: '#' },
          { id: 2, title: 'React 19 新特性预览', source: '前端日报', hot: true, link: '#' },
          { id: 3, title: 'Vite 6.0 发布', source: '技术博客', hot: false, link: '#' },
          { id: 4, title: 'TypeScript 6.0 新特性', source: 'TypeScript 官网', hot: false, link: '#' },
          { id: 5, title: 'Tailwind CSS v4 即将发布', source: 'Tailwind 博客', hot: false, link: '#' }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      // Fallback data
      setNews([
        { id: 1, title: 'AI技术在前端开发中的应用', source: '技术周刊', hot: true, link: '#' },
        { id: 2, title: 'React 19 新特性预览', source: '前端日报', hot: true, link: '#' },
        { id: 3, title: 'Vite 6.0 发布', source: '技术博客', hot: false, link: '#' },
        { id: 4, title: 'TypeScript 6.0 新特性', source: 'TypeScript 官网', hot: false, link: '#' },
        { id: 5, title: 'Tailwind CSS v4 即将发布', source: 'Tailwind 博客', hot: false, link: '#' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const displayNews = isExpanded ? news : news.slice(0, isMobile ? 3 : 5);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="hot-news bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-4 md:p-8 shadow-sm dark:shadow-xl border border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-4 md:mb-8">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Flame className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          每日热点资讯
        </h3>
      </div>
      {loading ? (
        <div className="flex justify-center py-6 md:py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="space-y-2 md:space-y-3 max-h-[300px] md:max-h-[500px] overflow-y-auto scrollbar-hide">
            {displayNews.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative p-3 md:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300/60 dark:hover:border-gray-600/60 transition-all cursor-pointer hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </a>
                      {item.hot && (
                        <span className="flex-shrink-0 mt-0.5 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                          HOT
                        </span>
                      )}
                    </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.source}
                  </span>
                </div>
                <div className="flex-shrink-0 w-1 h-10 bg-gray-300 dark:bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
            ))}
          </div>
          {news.length > (isMobile ? 3 : 5) && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 w-full py-2 md:py-3 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isExpanded ? '收起' : `展开更多 (${news.length - (isMobile ? 3 : 5)})`}
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </motion.button>
          )}
        </>
      )}
    </motion.div>
  );
};



export default function Interests() {
  useEffect(() => {
    // Simple visitor counter
    const visited = sessionStorage.getItem('visited_interests');
    if (!visited) {
        axios.post('/api/site-config/view').catch(() => {});
        sessionStorage.setItem('visited_interests', 'true');
    }
  }, []);

  return (
    <div className="interests-page overflow-x-hidden">
      {/* Background with Texture */}
      <div className="background-texture"></div>
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            日常与兴趣
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            生活碎片：最近在听的歌、看过的电影、去过的地方
          </motion.p>
          <motion.div 
            className="hero-photo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          />
        </div>
      </section>
      
      {/* Main Content */}
      <main className="main-content grid grid-cols-12 gap-4 lg:gap-8 px-4 lg:px-0">
        {/* Music Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="col-span-12 relative z-10"
        >
          <MusicSection />
        </motion.div>
        
        {/* Weather Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="col-span-12 lg:col-span-6"
        >
          <WeatherCastMiniDemo />
        </motion.div>
        
        {/* Movie Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="col-span-12 lg:col-span-6"
        >
          <MovieSection />
        </motion.div>
        
        {/* Hot News Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="col-span-12"
        >
          <HotNews />
        </motion.div>
        
        {/* Moments Section - Full Width */}
        <div className="col-span-12 relative z-50">
          <MomentsSection />
        </div>

        {/* Travel Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="col-span-12"
        >
          <TravelMap />
        </motion.div>
        
        {/* Danmaku Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="col-span-12"
        >
          <DanmakuSystem />
        </motion.div>
      </main>
    </div>
  );
}