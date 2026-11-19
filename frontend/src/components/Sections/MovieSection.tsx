import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../utils/axiosConfig';
import { message } from 'antd';
import { Star, Film, ChevronLeft, ChevronRight, Heart, Calendar, User, Clapperboard } from 'lucide-react';
import { ImageWithFallback } from '../UI/ImageWithFallback';

interface Movie {
  id: number;
  title: string;
  year: string;
  poster: string;
  rating: number;
  likes: number;
  director?: string;
  review?: string;
  watchedAt?: string;
}

export const MovieSection = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchMovies();
  }, []);
  
  const fetchMovies = async () => {
    try {
      const response = await axios.get('/api/movies?isVisible=true&sort=orderIndex_asc');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);

      const backendMovies = data.map((m: any) => ({
        id: m.id,
        title: m.title,
        year: m.year ? m.year.toString() : '',
        poster: m.posterUrl || m.poster,
        rating: m.rating || 0,
        likes: m.likes || 0,
        director: m.director,
        review: m.review,
        watchedAt: m.watchedAt
      }));
      setMovies(backendMovies);
      
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    }
  };
  
  // 存储用户的点赞状态，用于前端显示
  const [userLikes, setUserLikes] = useState<Record<number, boolean>>({});
  
  // 从本地存储加载用户的点赞状态
  useEffect(() => {
    const savedLikes = localStorage.getItem('userMovieLikes');
    if (savedLikes) {
      setUserLikes(JSON.parse(savedLikes));
    }
  }, []);
  
  // 保存用户的点赞状态到本地存储
  const saveUserLikes = (updatedLikes: Record<number, boolean>) => {
    localStorage.setItem('userMovieLikes', JSON.stringify(updatedLikes));
  };
  
  const handleLike = async (movieId: number) => {
    try {
      const isLiked = userLikes[movieId];
      const increment = isLiked ? -1 : 1;
      
      // 发送点赞请求到后端
      const response = await axios.post(`/api/movies/${movieId}/likes`, { increment });
      
      // 更新本地电影列表中的点赞数
      const updatedMovies = movies.map(movie => {
        if (movie.id === movieId) {
          return { ...movie, likes: response.data.likes };
        }
        return movie;
      });
      setMovies(updatedMovies);
      
      // 更新用户的点赞状态
      const updatedLikes = { ...userLikes, [movieId]: !isLiked };
      setUserLikes(updatedLikes);
      saveUserLikes(updatedLikes);
    } catch (error) {
      console.error('Failed to update likes:', error);
      message.error('更新点赞失败');
    }
  };
  
  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? movies.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentIndex(prev => (prev === movies.length - 1 ? 0 : prev + 1));
  };

  if (movies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="interest-card movie-widget h-full flex flex-col relative overflow-hidden group border-2 border-gray-200/50 dark:border-gray-700/30 justify-center items-center p-8"
      >
        <Film className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">暂无收藏的电影</p>
      </motion.div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="interest-card movie-widget h-full flex flex-col relative overflow-hidden group border-2 border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300/80 dark:hover:border-gray-600/50 transition-all pb-6 sm:pb-8"
    >
      {/* Background Ambience */}
      <AnimatePresence mode='wait'>
        <motion.div 
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 overflow-hidden"
        >
          <ImageWithFallback 
            src={currentMovie.poster} 
            className="w-full h-full object-cover blur-3xl scale-125" 
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/80 to-transparent dark:from-black/90 dark:via-black/70 dark:to-transparent" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start mb-6 px-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            经典观影
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {movies.length} 部收藏 · 从救赎到荒诞
          </p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 border border-blue-400/30 dark:border-blue-500/30 shadow-lg"
        >
          <Star className="w-4 h-4 fill-current" />
          {currentMovie.rating}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex justify-between items-center px-2 mb-6">
        <motion.button 
          onClick={handlePrev}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-white/80 dark:bg-black/70 shadow-lg hover:shadow-xl text-gray-800 dark:text-white backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {currentIndex + 1} / {movies.length}
        </span>
        
        <motion.button 
          onClick={handleNext}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-white/80 dark:bg-black/70 shadow-lg hover:shadow-xl text-gray-800 dark:text-white backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Poster Card */}
      <div className="relative z-10 flex justify-center flex-1 px-2">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="relative w-[180px] sm:w-[200px] md:w-[220px] h-[260px] sm:h-[290px] md:h-[320px] rounded-xl overflow-hidden shadow-2xl group/card"
          >
            <ImageWithFallback 
              src={currentMovie.poster} 
              alt={currentMovie.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
            />
            
            {/* Info Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full flex items-center gap-1 font-semibold">
                  <Calendar className="w-3 h-3" />
                  {currentMovie.year}
                </span>
                {currentMovie.director && (
                  <span className="text-xs bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded-full flex items-center gap-1 truncate max-w-[120px] font-semibold">
                    <User className="w-3 h-3" />
                    {currentMovie.director}
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                {currentMovie.title}
              </h3>
              
              {currentMovie.review && (
                <p className="text-xs text-gray-200 line-clamp-2 mb-3 italic">
                  "{currentMovie.review}"
                </p>
              )}
              
              <motion.button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleLike(currentMovie.id); 
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
                  userLikes[currentMovie.id] 
                    ? 'bg-red-500/90 text-white hover:bg-red-600' 
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${userLikes[currentMovie.id] ? 'fill-current' : ''}`} />
                <span>{currentMovie.likes} 喜欢</span>
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};