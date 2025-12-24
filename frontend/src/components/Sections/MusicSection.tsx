import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Music {
  id: number;
  title: string;
  artist: string;
  coverUrl: string;
  url: string;
}

export const MusicSection = () => {
  // 非实名交互功能：我也喜欢
  const [likes, setLikes] = useState(128);
  const [isLiked, setIsLiked] = useState(false);
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [popularMusic, setPopularMusic] = useState<Music[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // 从 localStorage 加载点赞状态
  useEffect(() => {
    const savedLikes = localStorage.getItem('musicLikes');
    const savedIsLiked = localStorage.getItem('musicIsLiked');
    
    if (savedLikes) {
      setLikes(parseInt(savedLikes));
    }
    
    if (savedIsLiked) {
      setIsLiked(savedIsLiked === 'true');
    }
  }, []);
  
  // 处理点赞
  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => prev - 1);
      localStorage.setItem('musicLikes', (likes - 1).toString());
      localStorage.setItem('musicIsLiked', 'false');
      setIsLiked(false);
    } else {
      setLikes(prev => prev + 1);
      localStorage.setItem('musicLikes', (likes + 1).toString());
      localStorage.setItem('musicIsLiked', 'true');
      setIsLiked(true);
    }
  };
  
  // 处理左滚动
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 200; // 卡片宽度 + 间隙
      const newPosition = Math.min(scrollPosition + cardWidth * 2, 0);
      setScrollPosition(newPosition);
      scrollContainerRef.current.scrollLeft += cardWidth * 2;
    }
  };
  
  // 处理右滚动
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 200; // 卡片宽度 + 间隙
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      const newPosition = Math.max(scrollPosition - cardWidth * 2, -maxScroll);
      setScrollPosition(newPosition);
      scrollContainerRef.current.scrollLeft -= cardWidth * 2;
    }
  };
  
  // 模拟数据 - 实际应该从API获取
  useEffect(() => {
    // 模拟音乐数据
    const mockMusic = [
      {
        id: 1,
        title: '晴天',
        artist: '周杰伦',
        coverUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
        url: 'https://music.163.com/song?id=186016'
      },
      {
        id: 2,
        title: '稻香',
        artist: '周杰伦',
        coverUrl: 'https://p2.music.126.net/8SQn3b8U4KcVb2x4JgS1uw==/109951165087313309.jpg',
        url: 'https://music.163.com/song?id=186085'
      },
      {
        id: 3,
        title: '青花瓷',
        artist: '周杰伦',
        coverUrl: 'https://p2.music.126.net/4G8Wjmj7DlT24LbJx8nZJw==/109951163076649060.jpg',
        url: 'https://music.163.com/song?id=28616530'
      },
      {
        id: 4,
        title: '七里香',
        artist: '周杰伦',
        coverUrl: 'https://p2.music.126.net/3mC1kYxTtU0VqTfK0y9ZgA==/109951165087313310.jpg',
        url: 'https://music.163.com/song?id=186124'
      },
      {
        id: 5,
        title: '夜曲',
        artist: '周杰伦',
        coverUrl: 'https://p2.music.126.net/1a0oK2jGx7pN5v3Z5x5l5g==/109951165087313311.jpg',
        url: 'https://music.163.com/song?id=186154'
      },
      {
        id: 6,
        title: '告白气球',
        artist: '周杰伦',
        coverUrl: 'https://p2.music.126.net/2Zg1q1q5Z1q1q5Z1q1q5Z1q==/109951165087313312.jpg',
        url: 'https://music.163.com/song?id=418603085'
      }
    ];
    
    setMusicList(mockMusic);
    setPopularMusic(mockMusic.slice(0, 3));
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="interest-card music-widget"
    >
      <div className="text-center mb-8">
        <h2 className="widget-title">最近在循环</h2>
        <p className="widget-desc">私人歌单，华语治愈系</p>
      </div>
      
      {/* 最近在循环 - 带左右切换的堆叠效果列表 */}
      <div className="mb-10">
        <div className="flex flex-col items-center">
          {/* 当前音乐卡片 */}
          <div className="relative mb-8 max-w-sm mx-auto">
            {/* 背景堆叠卡片 */}
            {musicList.slice(1, 4).map((music, index) => (
              <motion.div
                key={`music-stack-${music.id}`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 0.2 - (index * 0.05),
                  y: 15 * (index + 1),
                  scale: 0.95 - (index * 0.03),
                  zIndex: 3 - index
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full"
              >
                <div className="music-card relative w-full bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl">
                  <div className="relative overflow-hidden">
                    <img 
                      src={music.coverUrl} 
                      alt={`${music.title} - ${music.artist}`} 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* 当前卡片 */}
            <motion.div
              key={`music-current-${musicList[0]?.id}`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
              className="relative z-10 music-card group relative w-full bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={musicList[0]?.coverUrl || ''} 
                  alt={`${musicList[0]?.title || ''} - ${musicList[0]?.artist || ''}`} 
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <motion.div
                    className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-black"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    ▶
                  </motion.div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white truncate">{musicList[0]?.title || ''}</h3>
                <p className="text-gray-300 text-sm truncate">{musicList[0]?.artist || ''}</p>
              </div>
            </motion.div>
          </div>
          
          {/* 左右切换按钮 - 调整位置到卡片下方 */}
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleScrollLeft}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white shadow-lg transition-all duration-300 hover:bg-white/30"
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="15 18 9 12 15 6"></polygon>
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleScrollRight}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white shadow-lg transition-all duration-300 hover:bg-white/30"
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="9 18 15 12 9 6"></polygon>
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* 最受欢迎榜单 */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-4">最受欢迎</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {popularMusic.map((music, index) => (
            <motion.div
              key={music.id}
              whileHover={{ x: 5 }}
              className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg transition-all duration-300 hover:bg-white/10"
            >
              <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}</div>
              <img 
                src={music.coverUrl} 
                alt={`${music.title} - ${music.artist}`} 
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{music.title}</h4>
                <p className="text-gray-400 text-xs truncate">{music.artist}</p>
              </div>
              <div className="text-gray-400 hover:text-white cursor-pointer">▶</div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* 非实名交互功能 */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className={`flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:text-blue-400 transform hover:scale-110 group ${isLiked ? 'text-red-500' : ''}`}
          >
            <span className={`text-xl transition-transform duration-300 ${isLiked ? 'transform scale-110' : ''}`}>❤️</span>
            <span>{likes} 人喜欢</span>
          </motion.button>
        </div>
        
        <div className="text-white text-sm text-center">
          华语流行 · 周杰伦 · 私人收藏
        </div>
      </div>
    </motion.div>
  );
};