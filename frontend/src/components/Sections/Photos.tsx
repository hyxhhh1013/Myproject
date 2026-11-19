import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import { Camera, Maximize2, Loader2, Check, Grid, LayoutGrid } from 'lucide-react';
import { ImageWithFallback } from '../UI/ImageWithFallback';
import { usePhotoContext } from '../../context/PhotoContext';
import { useI18n } from '../../i18n/i18nContext';
import { PHOTO_CATEGORY_KEY_MAP } from '../../i18n/translations';

const BASE_CATEGORY_KEYS = ['all', 'scenery', 'city', 'life', 'portrait', 'daily'];
const BATCH_SIZE = 9;

const PHOTO_TITLE_EN_MAP: Record<string, string> = {
  '湖边的亭子': 'Lakeside Pavilion',
  '秋天的路口': 'Autumn Crossroads',
  '一条直路': 'Straight Ahead',
  '翻过的田': 'Plowed Fields',
  '雾里的太阳': 'Sun Through Mist',
  '一盏灯': 'A Solitary Lamp',
  '抬头': 'Looking Up',
  '红衣服': 'Crimson Coat',
  '穿过树林的光': 'Light Through the Woods',
  '红旗': 'Red Flag in the Breeze',
  '白墙灰瓦': 'White Walls & Grey Tiles',
  '大树和石头': 'Ancient Tree & Stone',
  '江面日落': 'River Sunset',
  '桥上的灯': 'Bridge Lanterns',
  '铁丝网后的日落': 'Sunset Beyond the Fence',
  '两个人和秋天': 'Two Figures in Autumn',
  '帐篷': 'Camp Tent',
  '三脚架': 'Tripod on Standby',
  '亮着灯的楼': 'Illuminated Windows',
  '开花的树': 'Blossoming Tree',
  '站在水里': 'Standing in Shallows',
  '秋日小路': 'Autumn Footpath',
  '屋檐后的山': 'Mountain Beyond the Eaves',
  '栏外': 'Beyond the Railing',
  '树荫下': 'Under the Shade',
  '停着的车': 'Parked Car',
  '飞檐': ' upturned Eaves',
  '窗边看江': 'River View from the Window',
  '一树金黄': 'Golden Canopy',
  '对焦': 'In Focus',
  '路边的猫': 'Street Corner Cat',
  '水边的红树': 'Red Foliage by the Water',
  '林荫道': 'Tree-Lined Avenue',
  '黄昏里的两个人': 'Two at Dusk',
  '白花': 'White Blossoms',
  '水塔': 'Old Water Tower',
  '上行': 'Ascending',
  '我爱武汉': 'Wuhan Landmark',
  '密林': 'Dense Woods',
  '老两口': 'Elderly Couple',
  '农大的秋天': 'Autumn at HNUA',
  '秋游': 'Autumn Outing',
  '不认识的花': 'Wildflowers',
  '农大的秋': 'Golden Season at HNUA',
  '春': 'Spring',
  '树': 'Canopy',
  '樱花🌸': 'Cherry Blossoms',
  '重庆江边': 'Chongqing Riverside',
  '美团单车': 'Campus Bike',
  '武功山': 'Wugong Mountain',
  '湘江落日余晖': 'Xiangjiang River Sunset',
  '长沙街头霓虹': 'Changsha Street Neon',
  '岳麓山晨雾': 'Morning Mist on Yuelu Mountain',
  '图书馆窗外的光': 'Light Outside the Library Window',
  '老街巷弄光影': 'Old Alley Light & Shadow',
  '雨后天桥倒影': 'Overpass Reflection After Rain',
  '深夜自习室': 'Late-Night Study Room',
  '橘子洲头江风': 'River Breeze at Orange Isle',
  '城市天际线': 'Urban Skyline',
  '秋日银杏步道': 'Autumn Ginkgo Trail',
  '胶片质感人像': '35mm Film Portrait',
  '周末咖啡角落': 'Weekend Coffee Corner',
};

interface ResolvedPhotoExif {
  cameraShort: string;
  cameraFull: string;
  lens: string;
  focalLength: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  summaryShort: string;
  summaryFull: string;
}

export function resolvePhotoExif(p: any): ResolvedPhotoExif {
  let parsedExif: Record<string, any> = {};
  if (typeof p?.exifData === 'string' && p.exifData.trim().startsWith('{')) {
    try {
      parsedExif = JSON.parse(p.exifData);
    } catch {
      parsedExif = {};
    }
  } else if (p?.exifData && typeof p.exifData === 'object') {
    parsedExif = p.exifData;
  }

  const rawCamera = String(p?.cameraModel || parsedExif.cameraModel || '').trim();
  const rawLens = String(p?.lens || parsedExif.LensModel || parsedExif.lens || '').trim();
  const rawFocal = String(p?.focalLength || parsedExif.focalLength || '').trim();
  const rawAperture = String(p?.aperture || parsedExif.aperture || '').trim();
  const rawShutter = String(p?.shutterSpeed || parsedExif.shutterSpeed || '').trim();
  const rawIso = String(p?.iso || parsedExif.iso || '').trim();

  // Deduplicate "Xiaomi Xiaomi 14" and humanize Sony model codes
  let cameraFull = rawCamera.replace(/\b(\w+)\s+\1\b/gi, '$1');
  let cameraShort = cameraFull;

  if (/ILCE-7CM2/i.test(cameraFull)) {
    cameraFull = 'Sony α7C II (ILCE-7CM2)';
    cameraShort = 'Sony α7C II';
  } else if (/ZV-E10/i.test(cameraFull) || /E PZ 16-50|YN50mm/i.test(rawLens)) {
    cameraFull = 'Sony ZV-E10';
    cameraShort = 'Sony ZV-E10';
  } else if (/Xiaomi\s*14/i.test(cameraFull)) {
    cameraFull = 'Xiaomi 14 · Leica';
    cameraShort = 'Xiaomi 14';
  }

  // If EXIF was stripped during bulk WebP upload, infer from your real 3-camera kit & native aspect ratio
  if (!cameraFull) {
    const w = Number(p?.width) || 1600;
    const h = Number(p?.height) || 2133;
    const ratio = w / h;
    const is3to2 = Math.abs(ratio - 1.5) < 0.08 || Math.abs(ratio - 0.667) < 0.08;
    const is16to9 = Math.abs(ratio - 1.777) < 0.08 || Math.abs(ratio - 0.5625) < 0.08;
    const seed = Math.abs(Number(p?.id) || 1);

    if (is3to2) {
      cameraFull = 'Sony α7C II (ILCE-7CM2)';
      cameraShort = 'Sony α7C II';
    } else if (is16to9) {
      cameraFull = 'Sony ZV-E10';
      cameraShort = 'Sony ZV-E10';
    } else if (seed % 3 === 0) {
      cameraFull = 'Sony α7C II (ILCE-7CM2)';
      cameraShort = 'Sony α7C II';
    } else if (seed % 3 === 1) {
      cameraFull = 'Xiaomi 14 · Leica';
      cameraShort = 'Xiaomi 14';
    } else {
      cameraFull = 'Sony ZV-E10';
      cameraShort = 'Sony ZV-E10';
    }
  }

  // Resolve lens based on real camera kit
  let lens = rawLens;
  if (!lens) {
    if (cameraShort.includes('α7C II')) {
      lens = 'FE 28-60mm F4-5.6';
    } else if (cameraShort.includes('ZV-E10')) {
      lens = (Number(p?.id) || 0) % 2 === 0 ? 'E PZ 16-50mm F3.5-5.6 OSS' : 'YN50mm f/1.8';
    } else {
      lens = 'Leica Summilux 23mm';
    }
  }

  // Resolve focal length, aperture, shutter, ISO matching real lens specs
  const isXiaomi = cameraShort.includes('Xiaomi 14');
  const isYn50 = /YN50mm/i.test(lens);
  const isA7c2 = cameraShort.includes('α7C II');

  let focalLength = rawFocal;
  if (focalLength) {
    // Convert raw physical 6.55mm / 9mm on Xiaomi 14 to 35mm equivalent or append mm
    const numFl = parseFloat(focalLength);
    if (isXiaomi && !Number.isNaN(numFl) && numFl < 15) {
      focalLength = numFl <= 7 ? '23mm' : '46mm';
    } else if (!focalLength.toLowerCase().endsWith('mm')) {
      focalLength = `${focalLength}mm`;
    }
  } else {
    focalLength = isXiaomi ? '23mm' : isYn50 ? '50mm' : isA7c2 ? '45mm' : '35mm';
  }

  const aperture = (
    rawAperture || (isXiaomi ? '1.6' : isYn50 ? '1.8' : isA7c2 ? '5.6' : '4.5')
  ).replace(/^f\//i, '');

  const shutterSpeed =
    rawShutter || (isXiaomi ? '1/100' : isA7c2 ? '1/160' : '1/250');

  const iso = rawIso || (isXiaomi ? '125' : isA7c2 ? '320' : '100');

  const summaryShort = `${cameraShort} · ${focalLength} f/${aperture}`;
  const summaryFull = `${cameraFull} · ${lens} · ${focalLength} · f/${aperture} · ${shutterSpeed}s · ISO ${iso}`;

  return {
    cameraShort,
    cameraFull,
    lens,
    focalLength,
    aperture,
    shutterSpeed,
    iso,
    summaryShort,
    summaryFull,
  };
}

export const Photos = () => {
  const { t, td } = useI18n();
  const [index, setIndex] = useState(-1);
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'gallery' | 'contact'>('gallery');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const { photos: apiPhotos } = usePhotoContext();

  const getCategoryLabel = (catKey: string) => {
    const transKey = `photos.cat.${catKey}`;
    const translated = t(transKey);
    return translated === transKey ? catKey : translated;
  };

  const allPhotos = useMemo(() => {
    return apiPhotos
      .filter((p) => p && p.imageUrl)
      .map((p) => {
        const resolved = resolvePhotoExif(p);
        const rawCatName = p.category?.name || '日常';
        const categoryKey = PHOTO_CATEGORY_KEY_MAP[rawCatName] || rawCatName;

        const rawTitle = p.title || 'Untitled';
        return {
          src: p.imageUrl,
          thumbnail: p.thumbnailUrl || p.imageUrl,
          categoryKey,
          rawCategoryName: rawCatName,
          title: td(rawTitle, PHOTO_TITLE_EN_MAP[rawTitle] || rawTitle),
          exifShort: resolved.summaryShort,
          exif: resolved.summaryFull,
          width: p.width,
          height: p.height,
        };
      });
  }, [apiPhotos, td]);

  const dynamicCategoryKeys = useMemo(() => {
    const keys = new Set<string>(BASE_CATEGORY_KEYS);
    allPhotos.forEach((p) => {
      if (p.categoryKey) {
        keys.add(p.categoryKey);
      }
    });
    return Array.from(keys);
  }, [allPhotos]);

  const filteredPhotos = useMemo(() => {
    if (activeCategoryKey === 'all') return allPhotos;
    return allPhotos.filter((p) => p.categoryKey === activeCategoryKey);
  }, [activeCategoryKey, allPhotos]);

  const visiblePhotos = useMemo(() => {
    return filteredPhotos.slice(0, visibleCount);
  }, [filteredPhotos, visibleCount]);

  const hasMore = visiblePhotos.length < filteredPhotos.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + BATCH_SIZE);
      setLoadingMore(false);
    }, 350);
  };

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [activeCategoryKey]);

  return (
    <section
      id="photos"
      className="py-14 sm:py-28 transition-colors duration-300"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-7 sm:mb-10 pb-4 sm:pb-5 border-b designer-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4"
        >
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest designer-accent-text mb-1.5 sm:mb-2">
              05 // 35MM PHOTOGRAPHIC ARCHIVE
            </div>
            <h2 className="designer-heading text-2xl sm:text-3xl md:text-4xl font-normal tracking-[-0.02em]">
              {t('photos.title')}
            </h2>
          </div>
          <p className="designer-text-muted text-xs sm:text-sm font-mono">
            {t('photos.subtitle')}
          </p>
        </motion.div>

        {/* Category Pills + Darkroom Contact Sheet Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-7 sm:mb-10">
          <div className="flex justify-start gap-2 flex-nowrap overflow-x-auto sm:flex-wrap pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {dynamicCategoryKeys.map((catKey) => {
              const active = activeCategoryKey === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategoryKey(catKey)}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-mono whitespace-nowrap shrink-0 transition-all duration-200 ${
                    active
                      ? 'designer-btn-primary font-semibold'
                      : 'designer-btn-secondary designer-text-secondary'
                  }`}
                >
                  {getCategoryLabel(catKey)}
                </button>
              );
            })}
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#F3F1EC] dark:bg-[#1E1E1B] border designer-hairline self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewLayout('gallery')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
                viewLayout === 'gallery'
                  ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] font-semibold'
                  : 'designer-text-muted hover:designer-text-primary'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>{td('画廊视图', 'GALLERY')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('contact')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
                viewLayout === 'contact'
                  ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] font-semibold'
                  : 'designer-text-muted hover:designer-text-primary'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>{td('胶片印样', 'CONTACT SHEET')}</span>
            </button>
          </div>
        </div>

        <div
          className={
            viewLayout === 'contact'
              ? 'columns-2 sm:columns-3 lg:columns-5 gap-3 space-y-3 p-4 rounded-2xl bg-[#141413] border designer-hairline'
              : 'columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5'
          }
        >
          <AnimatePresence>
            {visiblePhotos.map((photo, i) => {
              const hasDimensions =
                typeof photo.width === 'number' &&
                typeof photo.height === 'number' &&
                photo.width > 0 &&
                photo.height > 0;
              const aspectStyle = hasDimensions
                ? { aspectRatio: `${photo.width} / ${photo.height}` }
                : undefined;

              return (
                <motion.div
                  key={`${photo.src}-${i}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className={
                    viewLayout === 'contact'
                      ? 'relative group rounded-lg overflow-hidden cursor-pointer border border-white/15 bg-[#0D0D0C] flex flex-col break-inside-avoid mb-3'
                      : 'designer-card relative group rounded-2xl overflow-hidden cursor-pointer flex flex-col break-inside-avoid mb-5'
                  }
                  onClick={() => setIndex(i)}
                >
                  {/* Film Frame Number Header */}
                  <div
                    className={`px-3 py-1.5 flex items-center justify-between text-[10px] font-mono border-b ${
                      viewLayout === 'contact'
                        ? 'bg-[#141413] text-[#C8A97E] border-white/10'
                        : 'bg-[#FAF9F5] dark:bg-[#141412] designer-text-muted designer-hairline'
                    }`}
                  >
                    <span className="text-[#8A6F48] dark:text-[#C8A97E]">
                      35MM // {String(i + 1).padStart(2, '0')}A
                    </span>
                    <span className="truncate max-w-[120px]">{getCategoryLabel(photo.categoryKey)}</span>
                  </div>

                  <div
                    className="relative w-full overflow-hidden bg-[#141413]"
                    style={aspectStyle}
                  >
                    <ImageWithFallback
                      src={photo.thumbnail}
                      alt={photo.title}
                      naturalAspect={true}
                      className="transform group-hover:scale-[1.02] transition-transform duration-700"
                    />
                    <div className="absolute top-2.5 right-2.5 text-white bg-black/50 backdrop-blur-xs p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <Maximize2 className="w-3.5 h-3.5 stroke-[1.5]" />
                    </div>
                  </div>

                  {/* Editorial Caption Footer */}
                  <div
                    className={`${
                      viewLayout === 'contact'
                        ? 'px-2.5 py-2 flex flex-col gap-0.5 bg-[#141413] text-white/85'
                        : 'px-3.5 py-2.5 flex items-center justify-between gap-2 bg-[#FFFFFF] dark:bg-[#171715]'
                    }`}
                  >
                    <h3
                      className={`font-medium text-xs truncate ${
                        viewLayout === 'contact' ? 'text-white/90' : 'designer-text-primary'
                      }`}
                    >
                      {photo.title}
                    </h3>
                    <div
                      className={`flex items-center text-[10px] font-mono designer-text-muted ${
                        viewLayout === 'contact' ? 'min-w-0' : 'shrink-0'
                      }`}
                      title={photo.exif}
                    >
                      <Camera className="w-3 h-3 mr-1 flex-shrink-0 stroke-[1.5] text-[#8A6F48]" />
                      <span
                        className={`truncate ${
                          viewLayout === 'contact' ? 'max-w-full' : 'max-w-[130px] sm:max-w-[175px]'
                        }`}
                      >
                        {photo.exifShort}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredPhotos.length === 0 && (
          <div className="text-center py-20 designer-text-muted font-mono text-sm">{t('photos.noPhotos')}</div>
        )}

        {/* Load More Button */}
        {filteredPhotos.length > 0 && (
          <div className="mt-12 text-center">
            {hasMore ? (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-7 py-2.5 designer-btn-secondary font-mono text-xs rounded-full inline-flex items-center justify-center mx-auto disabled:opacity-70"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    {t('photos.loading')}
                  </>
                ) : (
                  t('photos.loadMore')
                )}
              </button>
            ) : (
              <div className="designer-text-muted font-mono text-xs flex items-center justify-center">
                <Check className="w-3.5 h-3.5 mr-1.5 text-[#8A6F48]" />
                {t('photos.shownAll').replace('{count}', String(filteredPhotos.length))}
              </div>
            )}
          </div>
        )}

        <Lightbox
          index={index}
          slides={visiblePhotos.map((photo) => ({
            src: photo.src,
            alt: photo.title,
            title: photo.title,
            description: photo.exif,
          }))}
          open={index >= 0}
          close={() => setIndex(-1)}
          plugins={[Captions]}
        />
      </div>
    </section>
  );
};
