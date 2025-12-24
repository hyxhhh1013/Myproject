import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { Camera, Maximize2, Loader2, Check } from 'lucide-react';
import { ImageWithFallback } from '../UI/ImageWithFallback';
import { usePhotoContext } from '../../context/PhotoContext';

const CATEGORIES = ['全部', '风景', '城市', '日常'];
const BATCH_SIZE = 9;

export const Photos = () => {
  const [index, setIndex] = useState(-1);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const { photos: apiPhotos } = usePhotoContext();

  const allPhotos = useMemo(() => {
    // Map Context photos (which includes both API and Local now) to the shape used in this component
    return apiPhotos.map(p => ({
        src: p.imageUrl,
        category: p.category.name,
        title: p.title,
        exif: p.exifData ? `${p.exifData.cameraModel || 'Unknown'} • f/${p.exifData.aperture || '?'} • ISO ${p.exifData.iso || '?'}` : 'No EXIF'
    }));
  }, [apiPhotos]);

  // Update CATEGORIES based on data
  const dynamicCategories = useMemo(() => {
      const cats = new Set(CATEGORIES);
      apiPhotos.forEach(p => cats.add(p.category.name));
      return Array.from(cats);
  }, [apiPhotos]);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === '全部') return allPhotos;
    return allPhotos.filter(p => p.category === activeCategory);
  }, [activeCategory, allPhotos]);

  const visiblePhotos = useMemo(() => {
    return filteredPhotos.slice(0, visibleCount);
  }, [filteredPhotos, visibleCount]);

  const hasMore = visiblePhotos.length < filteredPhotos.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleCount(prev => prev + BATCH_SIZE);
      setLoadingMore(false);
    }, 600);
  };

  // Reset visible count when category changes
  useEffect(() => {
     setVisibleCount(BATCH_SIZE);
  }, [activeCategory]);

  return (
    <section id="photos" className="py-24 bg-white dark:bg-dark-surface transition-colors duration-300">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">摄影作品</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            审美能力与个人兴趣展示
          </p>
        </motion.div>

        {/* Categories */}
        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div 
          layout
          className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6"
        >
          <AnimatePresence>
            {visiblePhotos.map((photo, i) => (
              <motion.div
                layout
                key={photo.src}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl bg-gray-200 dark:bg-gray-800"
                onClick={() => setIndex(i)}
              >
                <ImageWithFallback
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-auto block transform group-hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-block px-2 py-1 mb-2 text-[10px] md:text-xs font-semibold bg-blue-600 text-white rounded-md">
                      {photo.category}
                    </span>
                    <h3 className="text-white font-bold text-sm md:text-lg truncate">{photo.title}</h3>
                    <div className="flex items-center text-white/80 text-[10px] md:text-xs mt-1 truncate">
                      <Camera className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{photo.exif}</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                     <Maximize2 className="w-5 h-5 drop-shadow-md" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredPhotos.length === 0 && (
           <div className="text-center py-20 text-gray-500">
              暂无该分类照片
           </div>
        )}

        {/* Load More Button */}
        {filteredPhotos.length > 0 && (
          <div className="mt-12 text-center">
             {hasMore ? (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center mx-auto shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px]"
                >
                   {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        加载中...
                      </>
                   ) : (
                      '加载更多'
                   )}
                </button>
             ) : (
                <div className="text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center animate-fade-in">
                   <Check className="w-4 h-4 mr-2" />
                   已显示全部 {filteredPhotos.length} 张照片
                </div>
             )}
          </div>
        )}

        <Lightbox
          index={index}
          slides={filteredPhotos}
          open={index >= 0}
          close={() => setIndex(-1)}
          plugins={[Captions]}
        />
      </div>
    </section>
  );
};
