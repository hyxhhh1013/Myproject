import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { message } from 'antd';

interface Movie {
  id: number;
  title: string;
  year: string;
  poster: string;
  rating: number;
  likes: number;
  isLiked: boolean;
  director?: string;
  review?: string;
  watchedAt?: string;
}

export const MovieSection = () => {
  // 初始电影数据 - 使用本地海报文件
  const initialMovies: Movie[] = [
    {
      id: 1,
      title: "肖申克的救赎",
      year: "1994",
      poster: "/肖申克的救赎.jpg",
      rating: 9.7,
      likes: 126,
      isLiked: false,
      director: "弗兰克·德拉邦特",
      review: "希望让人自由。",
      watchedAt: "2023-01-15"
    },
    {
      id: 2,
      title: "海上钢琴师",
      year: "1998",
      poster: "/海上钢琴师.jpg",
      rating: 9.2,
      likes: 98,
      isLiked: false,
      director: "朱塞佩·托纳多雷",
      review: "每个人都有自己的世界。",
      watchedAt: "2023-03-20"
    },
    {
      id: 3,
      title: "唐人街探案",
      year: "2015",
      poster: "/唐人街探案.jpg",
      rating: 7.7,
      likes: 65,
      isLiked: false,
      director: "陈思诚",
      review: "喜剧与推理的结合。",
      watchedAt: "2023-05-10"
    },
    {
      id: 4,
      title: "让子弹飞",
      year: "2010",
      poster: "/让子弹飞.jpg",
      rating: 9.0,
      likes: 102,
      isLiked: false,
      director: "姜文",
      review: "荒诞中见真实。",
      watchedAt: "2023-07-05"
    },
    {
      id: 5,
      title: "默杀",
      year: "2024",
      poster: "/默杀.jpg",
      rating: 8.5,
      likes: 78,
      isLiked: false,
      director: "张艺谋",
      review: "沉默的力量。",
      watchedAt: "2024-02-14"
    },
    {
      id: 6,
      title: "你的婚礼",
      year: "2021",
      poster: "/你的婚礼.jpg",
      rating: 5.3,
      likes: 42,
      isLiked: false,
      director: "韩天",
      review: "青春爱情故事。",
      watchedAt: "2023-09-08"
    }
  ];
  
  // 非实名交互功能：电影点赞
  const [movies, setMovies] = useState(initialMovies);
  // 当前显示的电影索引
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 从 localStorage 加载点赞状态
  useEffect(() => {
    const savedLikes = localStorage.getItem('movieLikes');
    if (savedLikes && movies.length > 0) {
      const likesMap = JSON.parse(savedLikes);
      const updatedMovies = movies.map(movie => ({
        ...movie,
        isLiked: likesMap[movie.id]?.isLiked || false,
        likes: likesMap[movie.id]?.likes || movie.likes
      }));
      setMovies(updatedMovies);
    }
  }, [movies.length]);
  
  // 保存点赞状态到 localStorage
  const saveLikes = (updatedMovies: Movie[]) => {
    const likesMap = updatedMovies.reduce((map, movie) => {
      map[movie.id] = { isLiked: movie.isLiked, likes: movie.likes };
      return map;
    }, {} as Record<number, { isLiked: boolean; likes: number }>);
    localStorage.setItem('movieLikes', JSON.stringify(likesMap));
  };
  
  // 处理点赞 - 使用后端API
  const handleLike = async (movieId: number) => {
    try {
      // 调用后端点赞API
      await axios.post(`/movies/${movieId}/likes`);
      
      // 更新本地状态
      const updatedMovies = movies.map(movie => {
        if (movie.id === movieId) {
          const newLikes = movie.isLiked ? movie.likes - 1 : movie.likes + 1;
          return {
            ...movie,
            likes: newLikes,
            isLiked: !movie.isLiked
          };
        }
        return movie;
      });
      
      setMovies(updatedMovies);
      saveLikes(updatedMovies);
    } catch (error) {
      console.error('Failed to update likes:', error);
      message.error('更新点赞失败');
    }
  };
  
  // 处理左滑动
  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? movies.length - 1 : prev - 1));
  };
  
  // 处理右滑动
  const handleNext = () => {
    setCurrentIndex(prev => (prev === movies.length - 1 ? 0 : prev + 1));
  };
  
  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex, movies.length]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="interest-card movie-widget"
    >
      <div className="text-center mb-6">
        <h2 className="widget-title">经典观影</h2>
        <p className="widget-desc">一些深深打动我的电影，从救赎到荒诞到青春</p>
      </div>
      
      {movies.length > 0 && (
        <div className="relative max-w-4xl mx-auto">
          {/* 堆叠效果容器 - 使用相对高度保持原始比例 */}
          <div className="relative max-h-[80vh] flex items-center justify-center">
            {/* 背景堆叠海报 */}
            {movies.map((movie, index) => {
              if (index === currentIndex) return null;
              const offset = Math.abs(index - currentIndex);
              // 只显示当前海报前后的3张海报
              if (offset > 3) return null;
              const isLeft = index < currentIndex;
              return (
                <motion.div
                  key={`stack-${movie.id}`}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 0.08 / (offset + 1), // 进一步降低透明度
                    x: isLeft ? -40 * offset : 40 * offset, // 减小间距，增加堆叠密度
                    y: 8 * offset, // 减少垂直堆叠
                    scale: 1 - (0.04 * offset), // 减小缩放比例，让预览内容更多
                    zIndex: movies.length - offset
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute max-h-[75vh] rounded-xl overflow-hidden shadow-xl"
                >
                  <img 
                    src={movie.poster} 
                    alt={movie.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              );
            })}
            
            {/* 当前海报 */}
            <motion.div
              key={`current-${movies[currentIndex].id}`}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
              className="absolute max-h-[75vh] z-10 rounded-xl overflow-hidden shadow-2xl"
            >
              <img 
                src={movies[currentIndex].poster} 
                alt={movies[currentIndex].title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* 渐变叠加层 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
              
              {/* 电影信息 */}
              <div className="absolute inset-0 p-8 text-white flex flex-col justify-end">
                {/* 顶部评分 */}
                <div className="absolute top-8 right-8 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="text-lg font-bold">{movies[currentIndex].rating}</span>
                </div>
                
                {/* 主要信息 */}
                <div className="max-w-3xl">
                  <div className="flex items-center gap-4 mb-3 flex-wrap">
                    <span className="text-sm bg-blue-600/80 backdrop-blur-md px-4 py-1 rounded-full">
                      {movies[currentIndex].year}
                    </span>
                    {movies[currentIndex].director && (
                      <span className="text-sm bg-green-600/80 backdrop-blur-md px-4 py-1 rounded-full">
                        导演: {movies[currentIndex].director}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{movies[currentIndex].title}</h3>
                  
                  {movies[currentIndex].review && (
                    <p className="text-lg md:text-xl opacity-90 mb-6 line-clamp-3 leading-relaxed">{movies[currentIndex].review}</p>
                  )}
                  
                  {/* 点赞按钮 */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLike(movies[currentIndex].id)}
                    className={`flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full text-base font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 group ${movies[currentIndex].isLiked ? 'text-red-400' : 'text-white'}`}
                  >
                    <span className={`transition-transform duration-300 ${movies[currentIndex].isLiked ? 'scale-110' : ''}`}>❤️</span>
                    <span>{movies[currentIndex].likes} 喜欢</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* 左右切换按钮 - 调整位置到海报下方 */}
          <div className="flex justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white shadow-lg transition-all duration-300 hover:bg-white/30"
              aria-label="Previous movie"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="15 18 9 12 15 6"></polygon>
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white shadow-lg transition-all duration-300 hover:bg-white/30"
              aria-label="Next movie"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="9 18 15 12 9 6"></polygon>
              </svg>
            </motion.button>
          </div>
          
          {/* 指示器 */}
          <div className="flex justify-center gap-2 mt-6">
            {movies.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white w-8' : 'bg-white/50'}`}
                aria-label={`Go to movie ${index + 1}`}
              ></motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};