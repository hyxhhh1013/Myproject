import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from '../UI/ImageWithFallback';

// Define interface locally to avoid circular dependencies or complex refactoring
interface PhotoData {
  id: number;
  name: string;
  visitedAt: string;
  photo: string;
  photoThumbnail?: string;
  note: string;
}

interface PhotoWallProps {
  photos: PhotoData[];
}

export const PhotoWall: React.FC<PhotoWallProps> = ({ photos }) => {
  // Generate random rotations for each photo once on mount (or use a deterministic hash based on ID)
  // We'll use a simple deterministic function to keep it consistent during re-renders
  const getRotation = (id: number) => {
    // Simple hash function to get a number between -15 and 15
    const hash = Math.sin(id * 123.45) * 15;
    return hash;
  };

  const getOffset = (id: number) => {
      // Random offset for "messy" look
      const x = Math.cos(id * 56.78) * 10;
      const y = Math.sin(id * 90.12) * 10;
      return { x, y };
  };

  // Helper function to format date safely
  const formatDate = (dateString: string) => {
    if (!dateString) return '未知日期';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '未知日期' : date.toLocaleDateString();
  };

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = window.innerWidth < 768;

  return (
    <div className="relative w-full py-12 px-4 overflow-hidden">
      {/* Light Wood Background */}
      <div 
        className="absolute inset-0 z-0 rounded-3xl shadow-inner"
        style={{
          backgroundColor: '#f4f1e8', // Light wood base color
          backgroundImage: `
            linear-gradient(90deg, rgba(244,241,232,1) 0%, rgba(230,220,200,1) 100%),
            repeating-linear-gradient(
              90deg,
              rgba(0,0,0,0.02) 0px,
              rgba(0,0,0,0.02) 1px,
              transparent 1px,
              transparent 10px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0.03) 0px,
              rgba(0,0,0,0.03) 1px,
              transparent 1px,
              transparent 20px
            )
          `,
          backgroundSize: '100% 100%, 10px 100%, 100% 20px',
          backgroundPosition: '0 0, 0 0, 0 0',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)'
        }}
      ></div>

      {/* Title */}
      <div className="relative z-10 text-center mb-6 md:mb-10">
        <div className="flex items-center justify-between mb-2 md:mb-0">
          <div className="w-full">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 drop-shadow-sm" style={{ fontFamily: 'cursive' }}>
              旅行 · 记忆
            </h3>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-2 rounded-full opacity-80 rotate-1"></div>
          </div>
          {photos.length > (isMobile ? 4 : 6) && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 mt-4 md:mt-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExpanded ? '收起' : '展开'}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
            </motion.button>
          )}
        </div>
      </div>

      {/* Photos Container */}
      <div className="relative z-10 flex flex-wrap justify-center gap-4 md:gap-8 p-4 min-h-[300px] md:min-h-[400px]">
        {(isExpanded ? photos : photos.slice(0, isMobile ? 4 : 6)).map((photo) => {
          const rotation = getRotation(photo.id);
          const offset = getOffset(photo.id);
          
          return (
            <motion.div
              key={photo.id}
              className="relative group cursor-pointer"
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              whileInView={{ opacity: 1, scale: 1, rotate: rotation }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.1, 
                rotate: 0, 
                zIndex: 20,
                transition: { type: 'spring', stiffness: 300 } 
              }}
              style={{
                marginTop: `${offset.y}px`,
                marginLeft: `${offset.x}px`,
              }}
              onClick={() => setSelectedPhoto(photo)}
            >
              {/* Pin */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 w-4 h-4 rounded-full bg-red-600 shadow-md border border-red-800"></div>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 w-1 h-6 bg-gray-400 opacity-50 rotate-45 origin-bottom"></div>

              {/* Polaroid Frame */}
              <div className="bg-white p-3 pb-8 shadow-lg transform transition-transform duration-300 w-36 sm:w-48 md:w-56">
                <div className="overflow-hidden bg-gray-50 mb-2 rounded shadow-inner">
                  <ImageWithFallback 
                    src={photo.photo} 
                    thumbnailSrc={photo.photoThumbnail}
                    alt={photo?.name || '照片'}
                    className="w-full aspect-[4/5] object-cover filter contrast-[1.1] saturate-[0.8] brightness-[1.05]"
                  />
                </div>
                <div className="text-center">
                  <p className="font-handwriting text-gray-800 font-bold text-sm md:text-lg leading-tight" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
                    {photo?.name || '未命名'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1 font-mono">
                    {formatDate(photo.visitedAt)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {photos.length > (isMobile ? 4 : 6) && !isExpanded && (
        <motion.button
          onClick={() => setIsExpanded(true)}
          className="mt-6 w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          查看全部 {photos.length} 张照片
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </motion.button>
      )}

      {/* Lightbox/Modal for Selected Photo */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-4 max-w-3xl w-full rounded-lg shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-gray-800 shadow-lg hover:bg-gray-100"
            >
              ✕
            </button>
            <ImageWithFallback 
              src={selectedPhoto?.photo || ''} 
              alt={selectedPhoto?.name || '照片'}
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl shadow-inner bg-gray-50"
            />
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bold text-gray-800">{selectedPhoto?.name || '未命名'}</h3>
              <p className="text-gray-600 mt-2">{selectedPhoto?.note || ''}</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
