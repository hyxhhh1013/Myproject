import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { usePhotoContext } from '../context/PhotoContext';
import { useI18n } from '../i18n/i18nContext';
import { Loader2 } from 'lucide-react';

const Photos = () => {
  const { t } = useI18n();
  const { photos, loading, error } = usePhotoContext();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('全部');

  // Get all unique categories
  const categories = useMemo(() => {
    const cats = new Set(['全部']);
    photos.forEach(photo => cats.add(photo.category.name));
    return Array.from(cats);
  }, [photos]);

  // Filter photos by category
  const filteredPhotos = useMemo(() => {
    if (activeCategory === '全部') return photos;
    return photos.filter(photo => photo.category.name === activeCategory);
  }, [photos, activeCategory]);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('photos.title')}</h1>
        <p className="text-white/60">{t('photos.subtitle')}</p>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-transparent text-gray-400 hover:bg-blue-500/20 hover:text-white border border-white/10'}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-white/60">{t('photos.loading')}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-20 text-red-400">
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPhotos.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <p className="text-white/60">{t('photos.noPhotos')}</p>
        </div>
      )}

      {/* Photos Grid - Masonry Style */}
      {!loading && !error && filteredPhotos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="overflow-hidden rounded-xl cursor-zoom-in group relative"
              onClick={() => { setIndex(i); setOpen(true); }}
            >
              <div className="w-full overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.title || '摄影作品'}
                  className="w-full h-auto object-scale-down transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {/* 渐变遮罩 - 文字浮在图片上 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition">
                {/* 内容绝对定位到底部 */}
                <div className="absolute bottom-0 p-4 w-full">
                  <h3 className="text-white font-bold text-sm drop-shadow-md truncate">
                    {photo.title || `作品 ${photo.id}`}
                  </h3>
                  <span className="text-xs text-white/70 backdrop-blur-md px-2 py-1 rounded-full bg-white/10 border border-white/10">
                    {photo.category.name}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={filteredPhotos.map(p => ({ 
          src: p.imageUrl, 
          title: p.title 
        }))}
      />
    </div>
  );
};

export default Photos;