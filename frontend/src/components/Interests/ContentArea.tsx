import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// 模拟数据
const musicData = [
  { id: 1, title: 'Midnight City', artist: 'M83', coverUrl: 'https://via.placeholder.com/300x300', previewUrl: '#' },
  { id: 2, title: 'Blinding Lights', artist: 'The Weeknd', coverUrl: 'https://via.placeholder.com/300x300', previewUrl: '#' },
  { id: 3, title: 'Levitating', artist: 'Dua Lipa', coverUrl: 'https://via.placeholder.com/300x300', previewUrl: '#' },
  { id: 4, title: 'Save Your Tears', artist: 'The Weeknd', coverUrl: 'https://via.placeholder.com/300x300', previewUrl: '#' },
  { id: 5, title: 'Montero', artist: 'Lil Nas X', coverUrl: 'https://via.placeholder.com/300x300', previewUrl: '#' },
  { id: 6, title: 'Good 4 U', artist: 'Olivia Rodrigo', coverUrl: 'https://via.placeholder.com/300x300', previewUrl: '#' },
];

const moviesData = [
  { id: 1, title: 'Spider-Man: No Way Home', genre: 'Action', coverUrl: 'https://via.placeholder.com/400x600', description: 'A friendly neighborhood Spider-Man fights to save his city from villains.' },
  { id: 2, title: 'The Batman', genre: 'Crime', coverUrl: 'https://via.placeholder.com/400x600', description: 'The Batman ventures into Gotham City\'s underworld when a sadistic killer leaves behind a trail of cryptic clues.' },
  { id: 3, title: 'Dune', genre: 'Sci-Fi', coverUrl: 'https://via.placeholder.com/400x600', description: 'A noble family becomes embroiled in a war for control over the galaxy\'s most valuable asset while its heir becomes troubled by visions of a dark future.' },
  { id: 4, title: 'The Matrix Resurrections', genre: 'Sci-Fi', coverUrl: 'https://via.placeholder.com/400x600', description: 'Return to a world of two realities: one, everyday life; the other, what lies behind it.' },
  { id: 5, title: 'Everything Everywhere All at Once', genre: 'Comedy', coverUrl: 'https://via.placeholder.com/400x600', description: 'An aging Chinese immigrant is swept up in an insane adventure where she alone can save the world by exploring other universes and connecting with the lives she could have led.' },
  { id: 6, title: 'Top Gun: Maverick', genre: 'Action', coverUrl: 'https://via.placeholder.com/400x600', description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN\'s elite graduates on a mission that demands the ultimate sacrifice from those chosen to fly it.' },
];

const gamesData = [
  { id: 1, title: 'Elden Ring', platform: 'PC, PS5, Xbox', coverUrl: 'https://via.placeholder.com/300x400', playtime: '120h', achievements: '95%' },
  { id: 2, title: 'God of War Ragnarök', platform: 'PS5', coverUrl: 'https://via.placeholder.com/300x400', playtime: '80h', achievements: '100%' },
  { id: 3, title: 'Cyberpunk 2077', platform: 'PC, PS5, Xbox', coverUrl: 'https://via.placeholder.com/300x400', playtime: '60h', achievements: '75%' },
  { id: 4, title: 'The Legend of Zelda: Tears of the Kingdom', platform: 'Switch', coverUrl: 'https://via.placeholder.com/300x400', playtime: '150h', achievements: '85%' },
  { id: 5, title: 'Starfield', platform: 'PC, Xbox', coverUrl: 'https://via.placeholder.com/300x400', playtime: '90h', achievements: '80%' },
  { id: 6, title: 'Hogwarts Legacy', platform: 'PC, PS5, Xbox', coverUrl: 'https://via.placeholder.com/300x400', playtime: '50h', achievements: '70%' },
];

const booksData = [
  { id: 1, title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://via.placeholder.com/200x300', quote: 'You do not rise to the level of your goals. You fall to the level of your systems.' },
  { id: 2, title: 'The Power of Now', author: 'Eckhart Tolle', coverUrl: 'https://via.placeholder.com/200x300', quote: 'Realize deeply that the present moment is all you ever have.' },
  { id: 3, title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', coverUrl: 'https://via.placeholder.com/200x300', quote: 'The real difference between us and chimpanzees is the mythical glue that binds together large numbers of individuals, families and groups.' },
  { id: 4, title: 'The 48 Laws of Power', author: 'Robert Greene', coverUrl: 'https://via.placeholder.com/200x300', quote: 'Never outshine the master.' },
  { id: 5, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', coverUrl: 'https://via.placeholder.com/200x300', quote: 'A reliable way to make people believe in falsehoods is frequent repetition, because familiarity is not easily distinguished from truth.' },
  { id: 6, title: 'Man\'s Search for Meaning', author: 'Viktor E. Frankl', coverUrl: 'https://via.placeholder.com/200x300', quote: 'Everything can be taken from a man but one thing: the last of the human freedoms—to choose one\'s attitude in any given set of circumstances, to choose one\'s own way.' },
];

// Hero Section 组件 - Netflix 风格全屏背景
const HeroSection = () => {
  // 使用模拟的当前电影数据
  const currentMovie = moviesData[0];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-[400px] rounded-3xl overflow-hidden group"
    >
      {/* 1. 背景大图 (模糊处理) */}
      <img 
        src={currentMovie.coverUrl} 
        alt={currentMovie.title} 
        className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-110"
      />
      
      {/* 2. 渐变遮罩 (保证文字清晰) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent"></div>

      {/* 3. 内容层 */}
      <div className="relative z-10 p-10 flex flex-col justify-center h-full max-w-lg">
         <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">{currentMovie.title}</h1>
         <p className="text-white/80 line-clamp-3 mb-6">{currentMovie.description}</p>
         <div className="flex gap-4"> 
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-600/40">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 22v-20l18 10-18 10z" />
              </svg>
              播放
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 shadow-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z" />
              </svg>
              加入列表
            </button>
         </div>
      </div>
    </motion.div>
  );
};

// 横向滚动的 Cover Flow 组件
const CoverFlow = ({ title, data, type }: { title: string; data: any[]; type: string }) => {
  return (
    <div className="mb-10">
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {data.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-shrink-0 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${type === 'books' ? 'w-32' : 'w-48'}`}
          >
            <img 
              src={item.coverUrl} 
              alt={item.title} 
              className={`w-full ${type === 'books' ? 'h-48 object-cover' : 'aspect-[3/4] object-cover'}`}
            />
            <div className="p-3 bg-white/[0.03] backdrop-blur-xl">
              <h4 className="text-white font-semibold text-sm line-clamp-1">{item.title}</h4>
              <p className="text-white/60 text-xs line-clamp-1">{type === 'music' ? item.artist : type === 'movies' ? item.genre : type === 'games' ? item.platform : item.author}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Now Playing 悬浮胶囊组件
const NowPlaying = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="fixed bottom-6 right-6 bg-white/[0.06] backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl"
    >
      <img 
        src="https://via.placeholder.com/50x50" 
        alt="Now Playing" 
        className="w-12 h-12 rounded-full object-cover" 
      />
      <div>
        <h4 className="text-white font-semibold">Blinding Lights</h4>
        <p className="text-white/60 text-xs">The Weeknd</p>
      </div>
      <button className="text-white hover:text-red-400 transition-colors">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm4 11a4 4 0 1 1-4-4 4.009 4.009 0 0 1 4 4z" />
        </svg>
      </button>
    </motion.div>
  );
};

// 音乐播放组件
const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-10"
    >
      <h3 className="text-2xl font-bold text-white mb-6">黑胶唱片机</h3>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* 黑胶唱片 */}
        <div className="relative">
          <div className={`w-48 h-48 rounded-full bg-black/80 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white"></div>
            </div>
          </div>
          <img 
            src="https://via.placeholder.com/200x200" 
            alt="Album Cover" 
            className="absolute inset-0 w-full h-full rounded-full object-cover opacity-50"
          />
          {/* 唱针 */}
          <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-b-2 border-white/30 rounded-br-full transform rotate-45 origin-top-right transition-transform duration-500" style={{ transform: isPlaying ? 'rotate(60deg)' : 'rotate(45deg)' }}></div>
        </div>
        {/* 播放控制 */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-white">Midnight City</h4>
            <p className="text-white/60">M83</p>
          </div>
          {/* 音频波形 */}
          <div className="flex items-end gap-1 h-16">
            {[...Array(32)].map((_, i) => (
              <div 
                key={i} 
                className="flex-1 rounded-t-full bg-gradient-to-t from-blue-500 to-purple-500 transition-all duration-200"
                style={{ 
                  height: `${Math.random() * 100}%`,
                  animation: isPlaying ? 'pulse 1s infinite' : 'none'
                }}
              ></div>
            ))}
          </div>
          {/* 控制按钮 */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isPlaying ? (
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                ) : (
                  <path d="M8 5v14l11-7z" />
                )}
              </svg>
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm transition-all duration-300">
              把歌偷走
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ContentArea = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 overflow-hidden">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Music Section */}
      <MusicPlayer />
      
      {/* Cover Flow Sections */}
      <CoverFlow title="热门音乐" data={musicData} type="music" />
      <CoverFlow title="热门影片" data={moviesData} type="movies" />
      <CoverFlow title="热门游戏" data={gamesData} type="games" />
      <CoverFlow title="推荐书籍" data={booksData} type="books" />
      
      {/* Now Playing */}
      <NowPlaying />
    </div>
  );
};


