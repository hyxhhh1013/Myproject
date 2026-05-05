import { useState, useEffect, useRef } from 'react';
import { ImageOff, Loader2, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  containerClassName?: string;
  thumbnailSrc?: string;
}

export const ImageWithFallback = ({ 
  src, 
  alt, 
  className,
  containerClassName,
  thumbnailSrc
}: ImageWithFallbackProps) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // If no src, consider it error/placeholder immediately
    if (!src) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    
    const loadImage = async () => {
      const load = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        });
      };

      // Try thumbnail first
      if (thumbnailSrc) {
        await load(thumbnailSrc);
      }

      // Try main image
      const success = await load(src as string);
      setStatus(success ? 'loaded' : 'error');
    };

    loadImage();
  }, [src, thumbnailSrc, retryCount]);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRetryCount(prev => prev + 1);
  };

  // Generate a consistent gradient based on alt or src to use as placeholder
  const getPlaceholderGradient = () => {
    const str = alt || (typeof src === 'string' ? src : 'fallback');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash % 360);
    const h2 = (h1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 80%), hsl(${h2}, 80%, 70%))`;
  };

  return (
    <div 
      className={clsx(
        "relative overflow-hidden group transition-all duration-500", 
        containerClassName,
        status === 'loading' && "animate-pulse"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={status === 'error' ? { background: getPlaceholderGradient() } : {}}
    >
      <AnimatePresence mode="popLayout">
        {status === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm"
          >
             <div className="flex flex-col items-center gap-2">
               <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
               <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Optimizing</span>
             </div>
          </motion.div>
        )}
        
        {status === 'error' && (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-20 group"
          >
            <div className="absolute inset-0 opacity-20 bg-black/5 dark:bg-white/5" />
            
            <motion.div
              animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              className="relative z-10 mb-2 p-3 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/40"
            >
              <ImageOff className="w-8 h-8 text-white" />
            </motion.div>
            
            <div className="relative z-10">
              <span className="block text-xs font-bold text-white/90 mb-3 drop-shadow-sm uppercase tracking-wider">Missing Memory</span>
              <button 
                onClick={handleRetry}
                className="inline-flex items-center px-4 py-1.5 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white shadow-xl rounded-full text-[10px] font-bold hover:scale-110 active:scale-95 transition-all"
              >
                <RefreshCw className={clsx("w-3 h-3 mr-1.5", retryCount > 0 && "animate-spin")} /> RELOAD
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(status === 'loaded' || status === 'loading') && src && (
        <motion.img
          ref={imgRef}
          src={src}
          alt={alt}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: status === 'loaded' ? 1 : 0,
            scale: status === 'loaded' ? 1 : 1.1
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={clsx(
            "w-full h-full object-cover transition-transform duration-700",
            status === 'loaded' && "group-hover:scale-110",
            className
          )}
          loading="lazy"
          decoding="async"
        />
      )}
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50" />
    </div>
  );
};
