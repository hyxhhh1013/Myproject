import { useState, useEffect, useRef } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  containerClassName?: string;
  thumbnailSrc?: string;
  /**
   * When true, automatically detects if the image's natural orientation (e.g. vertical 3:4 portrait)
   * mismatches a horizontal card window, rendering a soft ambient blurred backdrop + uncropped object-contain
   * foreground so the photo is never awkwardly chopped.
   */
  adaptiveFrame?: boolean;
  /**
   * When true, the container height adapts naturally to the image's own aspect ratio (ideal for Masonry galleries).
   */
  naturalAspect?: boolean;
}

export const ImageWithFallback = ({
  src,
  alt,
  className,
  containerClassName,
  thumbnailSrc,
  adaptiveFrame = false,
  naturalAspect = false,
}: ImageWithFallbackProps) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    const loadImage = async () => {
      const load = (url: string): Promise<{ ok: boolean; w: number; h: number }> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () =>
            resolve({
              ok: true,
              w: img.naturalWidth || 800,
              h: img.naturalHeight || 600,
            });
          img.onerror = () => resolve({ ok: false, w: 0, h: 0 });
        });
      };

      if (thumbnailSrc && thumbnailSrc !== src) {
        await load(thumbnailSrc);
      }

      const result = await load(src as string);
      if (result.ok) {
        setNaturalSize({ width: result.w, height: result.h });
        setStatus('loaded');
      } else {
        setStatus('error');
      }
    };

    loadImage();
  }, [src, thumbnailSrc, retryCount]);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRetryCount((prev) => prev + 1);
  };

  const getPlaceholderGradient = () => {
    const str = alt || (typeof src === 'string' ? src : 'fallback');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash % 360);
    const h2 = (h1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 35%, 28%), hsl(${h2}, 40%, 22%))`;
  };

  // Detect if image is portrait/square inside a landscape card frame
  const isPortraitOrTall =
    naturalSize !== null && naturalSize.height > naturalSize.width * 0.88;
  const useAmbientContain = adaptiveFrame && isPortraitOrTall;

  return (
    <div
      className={clsx(
        'relative overflow-hidden group transition-all duration-500',
        naturalAspect ? 'w-full' : 'w-full h-full',
        containerClassName,
        status === 'loading' && 'animate-pulse',
      )}
      style={status === 'error' ? { background: getPlaceholderGradient() } : undefined}
    >
      <AnimatePresence mode="popLayout">
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-10 bg-[#F3F1EC]/60 dark:bg-[#181816]/60 backdrop-blur-xs"
          >
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#8A6F48] dark:text-[#C8A97E]" />
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleRetry}
            title="Click to reload image"
            className="absolute inset-0 flex items-center justify-center p-1.5 text-center z-20 cursor-pointer"
          >
            <ImageOff className="w-4 h-4 text-white/75" />
          </motion.div>
        )}
      </AnimatePresence>

      {(status === 'loaded' || status === 'loading') && src && (
        <>
          {/* Frosted Ambient Glass Mat when photo aspect ratio differs from frame (no harsh black bars) */}
          {useAmbientContain && (
            <>
              <img
                src={src}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center scale-125 blur-2xl opacity-85 pointer-events-none select-none"
              />
              <div className="absolute inset-0 bg-[#FAF9F5]/25 dark:bg-[#141413]/35 backdrop-blur-md pointer-events-none" />
            </>
          )}

          <motion.img
            ref={imgRef}
            src={src}
            alt={alt}
            initial={{ opacity: 0 }}
            animate={{
              opacity: status === 'loaded' ? 1 : 0,
            }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={clsx(
              naturalAspect
                ? 'w-full h-auto block transition-transform duration-700'
                : 'w-full h-full object-center transition-transform duration-700',
              useAmbientContain
                ? 'relative z-10 object-contain p-2.5 drop-shadow-md'
                : !naturalAspect && 'object-cover',
              className,
            )}
            loading="lazy"
            decoding="async"
          />
        </>
      )}
    </div>
  );
};
