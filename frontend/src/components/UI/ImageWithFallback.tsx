import { useState, useEffect, useRef } from 'react';
import { ImageOff, Loader2, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  containerClassName?: string;
}

export const ImageWithFallback = ({ 
  src, 
  alt, 
  className, 
  containerClassName
}: ImageWithFallbackProps) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setStatus('loading');
    
    const img = new Image();
    img.src = src as string;
    
    img.onload = () => {
      setStatus('loaded');
    };
    
    img.onerror = () => {
      setStatus('error');
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, retryCount]);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className={clsx("relative overflow-hidden bg-gray-100 dark:bg-gray-800", containerClassName || className)}>
      <AnimatePresence mode="popLayout">
        {status === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center text-gray-400 z-10 bg-gray-100 dark:bg-gray-800"
          >
             <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </motion.div>
        )}
        
        {status === 'error' && (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center z-20 bg-gray-50 dark:bg-gray-800"
          >
            <ImageOff className="w-8 h-8 mb-2" />
            <span className="text-xs mb-2">加载失败</span>
            <button 
              onClick={handleRetry}
              className="flex items-center px-3 py-1 bg-white dark:bg-gray-700 shadow-sm rounded-full text-xs hover:text-blue-500 transition-colors"
            >
              <RefreshCw className="w-3 h-3 mr-1" /> 重试
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        ref={imgRef}
        src={src}
        alt={alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: status === 'loaded' ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className={clsx(
          "w-full h-full object-cover",
          className
        )}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};
