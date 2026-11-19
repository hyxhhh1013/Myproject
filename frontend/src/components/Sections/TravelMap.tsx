import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from '../../utils/axiosConfig';
import { PhotoWall } from './PhotoWall';
import { MapPin, Calendar, Star, Navigation, Maximize2, X } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { ImageWithFallback } from '../UI/ImageWithFallback';
import { Modal } from '../Modal';
import { getImageUrl } from '../../utils/imageUtils';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/i18nContext';

const CITY_NAME_EN_MAP: Record<string, string> = {
  '汕头': 'Shantou',
  '武汉': 'Wuhan',
  '重庆': 'Chongqing',
  '泉州': 'Quanzhou',
  '长沙': 'Changsha',
  '北京': 'Beijing',
  '上海': 'Shanghai',
  '深圳': 'Shenzhen',
  '广州': 'Guangzhou',
  '杭州': 'Hangzhou',
  '成都': 'Chengdu',
  '西安': 'Xi\'an',
  '厦门': 'Xiamen',
  '南京': 'Nanjing',
  '苏州': 'Suzhou',
};

const PROVINCE_NAME_EN_MAP: Record<string, string> = {
  '北京': 'Beijing',
  '天津': 'Tianjin',
  '上海': 'Shanghai',
  '重庆': 'Chongqing',
  '河北': 'Hebei',
  '山西': 'Shanxi',
  '辽宁': 'Liaoning',
  '吉林': 'Jilin',
  '黑龙江': 'Heilongjiang',
  '江苏': 'Jiangsu',
  '浙江': 'Zhejiang',
  '安徽': 'Anhui',
  '福建': 'Fujian',
  '江西': 'Jiangxi',
  '山东': 'Shandong',
  '河南': 'Henan',
  '湖北': 'Hubei',
  '湖南': 'Hunan',
  '广东': 'Guangdong',
  '海南': 'Hainan',
  '四川': 'Sichuan',
  '贵州': 'Guizhou',
  '云南': 'Yunnan',
  '陕西': 'Shaanxi',
  '甘肃': 'Gansu',
  '青海': 'Qinghai',
  '台湾': 'Taiwan',
  '内蒙古': 'Inner Mongolia',
  '广西': 'Guangxi',
  '西藏': 'Tibet',
  '宁夏': 'Ningxia',
  '新疆': 'Xinjiang',
  '香港': 'Hong Kong',
  '澳门': 'Macau',
  '南海诸岛': 'South China Sea Islands',
  '中国': 'China',
};

const HIGHLIGHT_EN_MAP: Record<string, string> = {
  '黄鹤楼': 'Yellow Crane Tower',
  '开元寺还是开福寺': 'Ancient Temple Walk',
  '轮渡': 'Yangtze River Ferry',
  '南澳岛': 'Nan\'ao Island',
  '小公园': 'Little Park Arcade',
  '牛肉火锅': 'Chaoshan Beef Hotpot',
  '洪崖洞': 'Hongyadong',
  '解放碑': 'Jiefangbei',
  '长江索道': 'Yangtze Cableway',
  '开元寺': 'Kaiyuan Temple',
  '西街': 'West Street',
  '清源山': 'Qingyuan Mountain',
};

const NOTE_EN_MAP: Record<string, string> = {
  '美食天堂！': 'A true culinary paradise along the Chaoshan coast!',
  '山城夜景太震撼了！': 'Breathtaking cyberpunk night skyline across the mountain city!',
  '半城烟火半城仙': 'Half bustling street life, half timeless Maritime Silk Road heritage.',
};

const TIPS_EN_MAP: Record<string, string> = {
  '一定要吃牛肉火锅和生腌！': 'Must try authentic Chaoshan beef hotpot and marinated seafood!',
  '夏天去注意防暑，推荐坐一次长江轮渡看日落。': 'Take the Yangtze River ferry at sunset for the best skyline view.',
  '穿双舒服的鞋，重庆的路真的全是爬坡上坎。': 'Wear comfortable walking shoes — Chongqing is full of steep stairs and hills.',
  '租辆小白车在古城慢悠悠逛最舒服。': 'Hop on a white electric shuttle to roam the ancient alleys at an easy pace.',
};

// 城市数据接口定义
interface CityData {
  id: number;
  name: string;
  province: string;
  longitude: number;
  latitude: number;
  visitedAt: string;
  note: string;
  photo: string;
  photos?: string[];
  highlights?: string;
  tips?: string;
  rating: number;
}

// 地图配置接口定义
interface MapConfig {
  mapType: string;
  mapStyle: {
    areaColor: string;
    borderColor: string;
    labelColor: string;
  };
  markerStyle: {
    size: number;
    color: string;
    borderColor: string;
  };
}

export const TravelMap: React.FC = () => {
  const { theme } = useTheme();
  const { language, td } = useI18n();
  const isDark = theme === 'dark';
  const isEn = language === 'en';
  // 地图容器引用
  const mapRef = useRef<HTMLDivElement>(null);
  // 地图实例引用 - 使用any类型避免TypeScript编译错误
  const chartRef = useRef<any>(null);
  // 状态管理
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [activeCityPhotoIdx, setActiveCityPhotoIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'map' | 'photos'>('map');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<any[]>([]);
  const [isCitiesExpanded, setIsCitiesExpanded] = useState(false);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    setActiveCityPhotoIdx(0);
  }, [selectedCity?.id]);

  const getCityGallery = (city?: CityData | null): string[] => {
    if (!city) return [];
    const list: string[] = [];
    if (city.photo) list.push(city.photo);
    if (Array.isArray(city.photos)) {
      city.photos.forEach((p) => {
        if (p && !list.includes(p)) list.push(p);
      });
    }
    return list;
  };

  const translateCityName = (name?: string) => {
    if (!name) return td('未知城市', 'Unknown City');
    return isEn ? CITY_NAME_EN_MAP[name] || name : name;
  };

  const translateProvinceName = (prov?: string) => {
    if (!prov) return isEn ? 'CHINA' : '中国';
    const clean = prov.replace(/省|市|自治区|特别行政区/g, '');
    return isEn ? PROVINCE_NAME_EN_MAP[prov] || PROVINCE_NAME_EN_MAP[clean] || prov : prov;
  };

  const translateHighlight = (spot: string) => {
    const s = spot.trim();
    return isEn ? HIGHLIGHT_EN_MAP[s] || s : s;
  };

  const getCityNote = (city?: CityData | null): string => {
    if (!city) return '';
    const trimmed = (city.note || '').trim();
    if (trimmed) {
      if (isEn) {
        if (NOTE_EN_MAP[trimmed]) return NOTE_EN_MAP[trimmed];
        if (/[\u4e00-\u9fa5]/.test(trimmed)) {
          return `Exploring ${translateCityName(city.name)} — capturing street geometry, local flavors, and light.`;
        }
      }
      return trimmed;
    }
    if (city.highlights) {
      const spots = city.highlights
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (spots.length > 0) {
        return isEn
          ? `Footprint Highlights: ${spots.map(translateHighlight).join(' · ')}`
          : `城市足迹打卡：${spots.join(' · ')}`;
      }
    }
    if (city.tips) {
      const tStr = city.tips.trim();
      return isEn ? TIPS_EN_MAP[tStr] || tStr : tStr;
    }
    return isEn
      ? `Wandering through the streets of ${translateCityName(city.name)}, recording local culture and light.`
      : `漫步${city.name || '城市'}街巷，记录旅途中的风物与光影。`;
  };

  const getCityTips = (city?: CityData | null): string => {
    if (!city || !city.tips) return '';
    const tStr = city.tips.trim();
    if (!isEn) return tStr;
    if (TIPS_EN_MAP[tStr]) return TIPS_EN_MAP[tStr];
    return `Recommended local travel route and cultural spots in ${translateCityName(city.name)}.`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return td('未知时间', 'Unknown Date');
    try {
      return new Date(dateStr).toLocaleDateString(isEn ? 'en-US' : 'zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxSlides(images.map(img => ({ src: img })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  
  // 地图配置（适配 Rauno · 极简沙白 / 暗黑模式高对比度）
  const mapConfig: MapConfig = useMemo(
    () => ({
      mapType: 'china',
      mapStyle: {
        areaColor: isDark ? 'rgba(200, 169, 126, 0.14)' : 'rgba(138, 111, 72, 0.08)',
        borderColor: isDark ? 'rgba(200, 169, 126, 0.48)' : 'rgba(138, 111, 72, 0.35)',
        labelColor: isDark ? '#D4D1C7' : 'rgba(95, 94, 88, 0.92)',
      },
      markerStyle: {
        size: 14,
        color: isDark ? '#D2B488' : '#8A6F48',
        borderColor: isDark ? '#141413' : '#FAF9F5',
      },
    }),
    [isDark],
  );

  // Using centralized getImageUrl from utils

  // 从后端获取城市数据
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setLoading(true);
        // 尝试从 localStorage 获取缓存数据
        const cachedData = localStorage.getItem('travelCityData');
        if (cachedData) {
          setCityData(JSON.parse(cachedData));
          setLoading(false);
          // 即使有缓存，也在后台更新数据
        }

        // 从后端 API 获取数据
        const response = await axios.get('/api/travel-cities?isVisible=true');
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        
        if (data.length > 0) {
          const formattedData: CityData[] = data.map((city: any) => {
            // 处理封面照片 URL
            let photoUrl = city.imageUrl || (city.photos && city.photos.length > 0 ? (typeof city.photos === 'string' ? JSON.parse(city.photos)[0] : city.photos[0]) : 'https://picsum.photos/seed/default/300/200');
            photoUrl = getImageUrl(photoUrl);
            
            // 处理照片数组 URL
            let photosArray: string[] = [];
            if (city.photos) {
              photosArray = typeof city.photos === 'string' ? JSON.parse(city.photos) : city.photos;
              photosArray = photosArray.map((img: string) => getImageUrl(img));
            }
            
            return {
              id: city.id,
              name: city.name || city.city,
              province: city.province || (city.location ? city.location.split(' ')[0] : ''),
              longitude: city.longitude,
              latitude: city.latitude,
              visitedAt: city.visitedAt,
              note: city.description || city.note || '',
              photo: photoUrl,
              photoThumbnail: getImageUrl(city.thumbnailUrl || city.photoThumbnail),
              photos: photosArray,
              thumbnailPhotos: city.thumbnailPhotos && city.thumbnailPhotos.length > 0 ? city.thumbnailPhotos.map((img: string) => getImageUrl(img)) : [],
              highlights: city.highlights,
              tips: city.tips,
              rating: city.rating || 5
            };
          });
          
          // 保存到 localStorage
          localStorage.setItem('travelCityData', JSON.stringify(formattedData));
          setCityData(formattedData);
        } else if (!cachedData) {
           // 使用默认数据（仅在没有缓存且没有后端数据时）
           const defaultData: CityData[] = [
            { id: 1, name: '杭州', province: '浙江', longitude: 120.15, latitude: 30.28, visitedAt: '2023-05-15', note: '西湖美景', photo: 'https://picsum.photos/seed/hangzhou/300/200', rating: 5 },
            { id: 2, name: '长沙', province: '湖南', longitude: 112.94, latitude: 28.22, visitedAt: '2023-08-20', note: '岳麓山和橘子洲头', photo: 'https://picsum.photos/seed/changsha/300/200', rating: 4 },
            { id: 3, name: '武汉', province: '湖北', longitude: 114.31, latitude: 30.52, visitedAt: '2023-10-05', note: '家乡，珞珈山下', photo: 'https://picsum.photos/seed/wuhan/300/200', rating: 5 },
            { id: 4, name: '北京', province: '北京', longitude: 116.40, latitude: 39.90, visitedAt: '2024-02-15', note: '故宫和长城', photo: 'https://picsum.photos/seed/beijing/300/200', rating: 5 },
            { id: 5, name: '上海', province: '上海', longitude: 121.47, latitude: 31.23, visitedAt: '2024-04-10', note: '外滩夜景', photo: 'https://picsum.photos/seed/shanghai/300/200', rating: 4 },
            { id: 6, name: '成都', province: '四川', longitude: 104.07, latitude: 30.67, visitedAt: '2024-06-25', note: '美食之都', photo: 'https://picsum.photos/seed/chengdu/300/200', rating: 5 }
          ];
          setCityData(defaultData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch city data:', err);
        // 如果出错且没有缓存数据，使用默认数据
        const cachedData = localStorage.getItem('travelCityData');
        if (!cachedData) {
          const defaultData: CityData[] = [
            { id: 1, name: '杭州', province: '浙江', longitude: 120.15, latitude: 30.28, visitedAt: '2023-05-15', note: '西湖美景', photo: 'https://picsum.photos/seed/hangzhou/300/200', rating: 5 },
            { id: 2, name: '长沙', province: '湖南', longitude: 112.94, latitude: 28.22, visitedAt: '2023-08-20', note: '岳麓山和橘子洲头', photo: 'https://picsum.photos/seed/changsha/300/200', rating: 4 },
            { id: 3, name: '武汉', province: '湖北', longitude: 114.31, latitude: 30.52, visitedAt: '2023-10-05', note: '家乡，珞珈山下', photo: 'https://picsum.photos/seed/wuhan/300/200', rating: 5 },
            { id: 4, name: '北京', province: '北京', longitude: 116.40, latitude: 39.90, visitedAt: '2024-02-15', note: '故宫和长城', photo: 'https://picsum.photos/seed/beijing/300/200', rating: 5 },
            { id: 5, name: '上海', province: '上海', longitude: 121.47, latitude: 31.23, visitedAt: '2024-04-10', note: '外滩夜景', photo: 'https://picsum.photos/seed/shanghai/300/200', rating: 4 },
            { id: 6, name: '成都', province: '四川', longitude: 104.07, latitude: 30.67, visitedAt: '2024-06-25', note: '美食之都', photo: 'https://picsum.photos/seed/chengdu/300/200', rating: 5 }
          ];
          setCityData(defaultData);
        }
        // setError('Failed to fetch data from server, using default data.'); // 不显示错误，静默降级
        setLoading(false);
      }
    };

    fetchCityData();
  }, []);

  // 优化：缓存城市数据处理
  const optimizedCityData = useMemo(() => {
    return cityData.map(city => ({
      ...city,
      photo: getImageUrl(city.photo),
      photos: city.photos?.map((img: string) => getImageUrl(img)) || []
    }));
  }, [cityData]);

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current || optimizedCityData.length === 0) {
      return;
    }

    let cleanupResize: (() => void) | undefined;

    // 动态导入echarts
    const initECharts = async () => {
      try {
        // 动态导入echarts
        const echartsInstance = await import('echarts');

        // 初始化或复用 ECharts 实例
        const chart =
          echartsInstance.getInstanceByDom(mapRef.current!) ||
          echartsInstance.init(mapRef.current);
        chartRef.current = chart;

        // 加载中国地图数据
        const loadMapData = async () => {
          try {
            // 尝试从 localStorage 获取缓存的地图数据
            const cachedMapData = localStorage.getItem('chinaMapData');
            let mapData;

            if (cachedMapData) {
              mapData = JSON.parse(cachedMapData);
            } else {
              // 优先从本地加载
              try {
                const response = await fetch('/maps/china.json');
                if (!response.ok) throw new Error('Local map file not found');
                mapData = await response.json();
              } catch (localError) {
                // 降级到 CDN
                const response = await fetch('https://cdn.jsdelivr.net/npm/echarts/map/json/china.json');
                mapData = await response.json();
              }
              
              // 缓存地图数据
              localStorage.setItem('chinaMapData', JSON.stringify(mapData));
            }

            // 注册地图
            echartsInstance.registerMap(mapConfig.mapType, mapData);

            // 地图配置选项
            const option = {
              backgroundColor: 'transparent',
              tooltip: {
                trigger: 'item',
                formatter: function(params: any) {
                  const city = optimizedCityData.find(c => c.name === params.name);
                  if (city) {
                    return `
                      <div style="padding: 8px;">
                        <h4 style="margin: 0 0 4px 0;">${translateCityName(city?.name)}</h4>
                        <p style="margin: 2px 0;">${isEn ? 'Visited' : '访问时间'}: ${formatDate(city?.visitedAt || '')}</p>
                        <p style="margin: 2px 0;">${isEn ? 'Rating' : '评分'}: ${'★'.repeat(Math.floor(city?.rating || 5))} ${Number(city?.rating || 5).toFixed(1)}</p>
                        <p style="margin: 2px 0;">${getCityNote(city)}</p>
                      </div>
                    `;
                  }
                  const rawProv = String(params.name || '').replace(/省|市|自治区|特别行政区/g, '');
                  return isEn ? PROVINCE_NAME_EN_MAP[params.name] || PROVINCE_NAME_EN_MAP[rawProv] || params.name : params.name;
                }
              },
              geo: {
                map: mapConfig.mapType,
                roam: true, // 开启缩放和平移
                emphasis: {
                  label: {
                    show: true,
                    color: mapConfig.mapStyle.labelColor,
                    formatter: function(params: any) {
                      const rawProv = String(params.name || '').replace(/省|市|自治区|特别行政区/g, '');
                      return isEn ? PROVINCE_NAME_EN_MAP[params.name] || PROVINCE_NAME_EN_MAP[rawProv] || params.name : params.name;
                    }
                  },
                  itemStyle: {
                    areaColor: 'rgba(176, 168, 185, 0.3)'
                  }
                },
                itemStyle: {
                  areaColor: mapConfig.mapStyle.areaColor,
                  borderColor: mapConfig.mapStyle.borderColor,
                  borderWidth: 1
                },
                label: {
                  show: true,
                  color: mapConfig.mapStyle.labelColor,
                  fontSize: isEn ? 10 : 12,
                  formatter: function(params: any) {
                    const rawProv = String(params.name || '').replace(/省|市|自治区|特别行政区/g, '');
                    return isEn ? PROVINCE_NAME_EN_MAP[params.name] || PROVINCE_NAME_EN_MAP[rawProv] || params.name : params.name;
                  }
                },
                zoom: 1.1, // 调整缩放级别
                center: [105, 38], // 设置地图中心点
                aspectScale: 0.75 // 调整地图宽高比
              },
              series: [
                {
                  name: '城市标记',
                  type: 'scatter',
                  coordinateSystem: 'geo',
                  data: optimizedCityData.map(city => ({
                    name: city?.name || '未知城市',
                    value: [city?.longitude || 0, city?.latitude || 0, city?.rating || 0],
                    cityData: city
                  })),
                  symbol: 'circle',
                  symbolSize: mapConfig.markerStyle.size,
                  itemStyle: {
                    color: mapConfig.markerStyle.color,
                    borderColor: mapConfig.markerStyle.borderColor,
                    borderWidth: 2
                  },
                  emphasis: {
                    itemStyle: {
                      color: '#ffffff',
                      shadowBlur: 15,
                      shadowColor: '#b0a8b9'
                    },
                    label: {
                      show: true,
                      formatter: function(params: any) {
                        return translateCityName(params.name);
                      },
                      color: '#ffffff',
                      fontSize: 14,
                      fontWeight: 'bold'
                    }
                  },
                  zlevel: 2
                }
              ]
            };

            // 设置图表选项
            chart.setOption(option, true);

            // 点击事件处理
            chart.off('click');
            chart.on('click', 'series', function(params: any) {
              if (params.data && params.data.cityData) {
                setSelectedCity(params.data.cityData);
              }
            });
          } catch (err) {
            console.error('加载地图数据失败:', err);
            setError('Failed to load map data.');
          }
        };

        loadMapData();

        // 响应式调整
        const handleResize = () => {
          chart.resize();
        };
        window.addEventListener('resize', handleResize);

        // 清理函数
        cleanupResize = () => {
          window.removeEventListener('resize', handleResize);
          chart.dispose();
          chartRef.current = null;
        };
      } catch (err) {
        console.error('加载echarts失败:', err);
        setError('Failed to load map chart.');
      }
    };

    initECharts();
    return () => {
      if (cleanupResize) cleanupResize();
    };
  }, [optimizedCityData, mapConfig, viewMode, isEn]);

  // 关闭城市信息弹窗
  const closeCityInfo = () => {
    setSelectedCity(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="travel-widget"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b designer-hairline">
        <div>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#8A6F48] dark:text-[#C9A87C] block mb-1">
            CARTOGRAPHY // FOOTPRINTS
          </span>
          <h3 className="text-xl md:text-2xl font-serif-editorial text-[#141413] dark:text-[#F0EFEA]">
            {td('中国旅行足迹地图', 'China Footprint Cartography')}
          </h3>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => setViewMode('map')}
            className={`cursor-pointer px-4 py-1.5 rounded-full font-mono-tech text-[11px] uppercase tracking-[0.14em] transition-all flex items-center gap-2 border ${
              viewMode === 'map'
                ? 'bg-[#141413] text-[#FAF9F5] border-[#141413] dark:bg-[#F0EFEA] dark:text-[#0D0D0C] dark:border-[#F0EFEA]'
                : 'bg-[#FAF9F5] dark:bg-[#141413] text-[#6E6C66] dark:text-[#9E9C94] designer-hairline hover:text-[#141413] dark:hover:text-[#F0EFEA]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
            {td('地图模式 · MAP', 'CARTOGRAPHY · MAP')}
          </button>
          <button
            onClick={() => setViewMode('photos')}
            className={`cursor-pointer px-4 py-1.5 rounded-full font-mono-tech text-[11px] uppercase tracking-[0.14em] transition-all flex items-center gap-2 border ${
              viewMode === 'photos'
                ? 'bg-[#141413] text-[#FAF9F5] border-[#141413] dark:bg-[#F0EFEA] dark:text-[#0D0D0C] dark:border-[#F0EFEA]'
                : 'bg-[#FAF9F5] dark:bg-[#141413] text-[#6E6C66] dark:text-[#9E9C94] designer-hairline hover:text-[#141413] dark:hover:text-[#F0EFEA]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            {td('照片墙 · GALLERY', 'POLAROID WALL · GALLERY')}
          </button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <>
      {/* 地图容器 */}
      {!error && (
        <div className="map-container mb-8 relative border designer-hairline rounded-2xl overflow-hidden bg-[#FAF9F5] dark:bg-[#0D0D0C]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px] min-h-[300px] max-h-[500px] text-[#6E6C66] dark:text-[#9E9C94]">
              <div className="flex flex-col items-center gap-2">
                <div className="w-7 h-7 border-2 border-[#8A6F48] border-t-transparent rounded-full animate-spin"></div>
                <span className="font-mono-tech text-xs uppercase tracking-widest">LOADING CARTOGRAPHY...</span>
              </div>
            </div>
          ) : (
            <div
              ref={mapRef}
              id="china-map"
              style={{ 
                height: '420px',
                minHeight: '320px',
                maxHeight: '500px',
                width: '100%',
                backgroundColor: 'transparent',
                overflow: 'hidden'
              }}
            ></div>
          )}
        </div>
      )}

      {/* 城市信息弹窗 — Editorial Warm Sand & Obsidian Gallery Showcase */}
      <Modal
        isOpen={!!selectedCity}
        onClose={closeCityInfo}
        maxWidth="max-w-4xl"
      >
        {selectedCity && (() => {
          const gallery = getCityGallery(selectedCity);
          const currentImg = gallery[activeCityPhotoIdx] || selectedCity.photo || '';
          const highlightItems = (selectedCity.highlights || '')
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean);

          return (
            <div className="flex flex-col md:flex-row bg-[#FAF9F5] dark:bg-[#141413] text-[#141413] dark:text-[#F2F0EA] overflow-hidden">
              {/* Left 7/12: Full Uncropped Main Stage Photo + Filmstrip Thumbnails */}
              <div className="md:w-7/12 bg-[#F3F1EC] dark:bg-[#10100E] border-b md:border-b-0 md:border-r designer-hairline flex flex-col justify-between">
                {/* Main Stage Viewer (No Cropping on "WH 武汉" or Portrait Photos) */}
                <div
                  onClick={() => openLightbox(gallery, activeCityPhotoIdx)}
                  className="relative h-72 sm:h-80 md:h-[360px] w-full overflow-hidden cursor-pointer group bg-[#EAE6DC] dark:bg-[#181815]"
                >
                  {/* Frosted Ambient Backdrop */}
                  {currentImg && (
                    <>
                      <img
                        src={currentImg}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover object-center scale-125 blur-2xl opacity-80 pointer-events-none select-none"
                      />
                      <div className="absolute inset-0 bg-[#FAF9F5]/20 dark:bg-[#141413]/35 backdrop-blur-md pointer-events-none" />
                    </>
                  )}

                  {/* Full Uncropped Foreground Photo */}
                  <img
                    src={currentImg}
                    alt={selectedCity.name}
                    className="relative z-10 w-full h-full object-contain p-3 sm:p-4 drop-shadow-md transition-transform duration-500 group-hover:scale-[1.02]"
                  />

                  {/* Top Frame Counter & Fullscreen Hint */}
                  <div className="absolute top-3 left-3.5 z-20 px-2.5 py-1 rounded-full bg-[#141413]/75 text-[#FAF9F5] backdrop-blur-xs text-[10px] font-mono">
                    FRAME 0{activeCityPhotoIdx + 1} / 0{Math.max(1, gallery.length)} ·{' '}
                    {td('点击全屏放大', 'CLICK TO ZOOM')}
                  </div>
                  <div className="absolute top-3 right-3.5 z-20 p-1.5 rounded-full bg-[#141413]/75 text-[#FAF9F5] opacity-85 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bottom Filmstrip Thumbnails */}
                {gallery.length > 1 && (
                  <div className="p-3 bg-[#FAF9F5] dark:bg-[#141412] border-t designer-hairline">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A6F48] dark:text-[#C8A97E] mb-2 flex items-center justify-between">
                      <span>
                        {td(
                          `精彩瞬间 · FILMSTRIP (${gallery.length})`,
                          `MOMENTS FILMSTRIP (${gallery.length})`,
                        )}
                      </span>
                      <span className="designer-text-muted">
                        {td('点击缩略图切换主图', 'Select thumbnail to switch')}
                      </span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {gallery.map((imgUrl, idx) => {
                        const isActive = idx === activeCityPhotoIdx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveCityPhotoIdx(idx)}
                            className={`relative w-16 h-16 sm:w-20 sm:h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                              isActive
                                ? 'border-[#8A6F48] dark:border-[#C8A97E] scale-[1.02] shadow-xs'
                                : 'border-transparent opacity-65 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`${translateCityName(selectedCity.name)} ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right 5/12: Editorial Field Dossier */}
              <div className="md:w-5/12 p-5 sm:p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="pb-3.5 border-b designer-hairline flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A6F48] dark:text-[#C8A97E] mb-1">
                        FOOTPRINT // {translateProvinceName(selectedCity.province).toUpperCase()}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-semibold designer-heading tracking-tight">
                        {translateCityName(selectedCity.name)}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3F1EC] dark:bg-[#1E1E1B] border designer-hairline text-[11px] font-mono designer-text-secondary">
                        <Calendar className="w-3 h-3 text-[#8A6F48]" />
                        <span>{formatDate(selectedCity.visitedAt || '')}</span>
                      </div>
                      <div className="text-xs font-mono text-[#8A6F48] dark:text-[#C8A97E] tracking-wider">
                        {'★'.repeat(Math.floor(selectedCity.rating || 5))}
                        <span className="ml-1 text-[11px]">{Number(selectedCity.rating || 5).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Editorial Travel Note (Never empty quotes!) */}
                  <div className="p-3.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1A1A17] border-l-2 border-[#8A6F48] text-xs sm:text-sm designer-text-secondary leading-relaxed">
                    {getCityNote(selectedCity)}
                  </div>

                  {/* Highlights Pills */}
                  {highlightItems.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#F3F1EC]/75 dark:bg-[#1B1B18] border designer-hairline">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#8A6F48] dark:text-[#C8A97E] mb-2.5 flex items-center gap-1.5">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{td('01 // 旅行亮点与打卡地', '01 // LANDMARKS & HIGHLIGHTS')}</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {highlightItems.map((h, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] dark:bg-[#242420] border designer-hairline text-xs designer-text-primary inline-flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8A6F48] dark:bg-[#C8A97E]" />
                            {translateHighlight(h)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Local Tips */}
                  {selectedCity.tips && (
                    <div className="p-4 rounded-xl bg-[#F3F1EC]/75 dark:bg-[#1B1B18] border designer-hairline">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#8A6F48] dark:text-[#C8A97E] mb-1.5 flex items-center gap-1.5">
                        <Navigation className="w-3 h-3" />
                        <span>{td('02 // 当地出行建议', '02 // FIELD TRAVEL NOTES')}</span>
                      </h4>
                      <p className="text-xs sm:text-sm designer-text-secondary leading-relaxed">
                        {getCityTips(selectedCity)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div className="pt-5 mt-5 border-t designer-hairline flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => openLightbox(gallery, activeCityPhotoIdx)}
                    className="py-2 px-3.5 rounded-xl designer-btn-secondary text-xs font-mono flex items-center gap-1.5"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#8A6F48]" />
                    <span>{td('全屏看大图', 'FULLSCREEN')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeCityInfo}
                    className="py-2 px-5 rounded-xl designer-btn-primary text-xs font-mono font-semibold flex items-center gap-1.5"
                  >
                    <span>{td('返回地图', 'BACK TO MAP')}</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Lightbox for viewing city photos */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
        plugins={[Captions]}
      />

      {/* 城市列表 */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono-tech text-xs uppercase tracking-[0.18em] text-[#6E6C66] dark:text-[#9E9C94] flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C9A87C]" />
            VISITED CITIES ARCHIVE ({optimizedCityData.length})
          </h4>
          {optimizedCityData.length > (isMobile ? 2 : 3) && (
            <button
              onClick={() => setIsCitiesExpanded(!isCitiesExpanded)}
              className="font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#8A6F48] dark:text-[#C9A87C] hover:text-[#141413] dark:hover:text-[#F0EFEA] transition-colors flex items-center gap-1 relative z-50"
            >
              {isCitiesExpanded
                ? td('COLLAPSE · 收起', 'COLLAPSE')
                : td('EXPAND · 展开', 'EXPAND ALL')}
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isCitiesExpanded ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(isCitiesExpanded ? optimizedCityData : optimizedCityData.slice(0, isMobile ? 2 : 3)).map((city) => (
            <div
              key={city.id}
              className="group relative bg-[#FAF9F5] dark:bg-[#0D0D0C] rounded-xl overflow-hidden border designer-hairline hover:border-[#8A6F48] dark:hover:border-[#C9A87C] transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCity(city)}
            >
              <div className="flex h-28">
                {/* 左侧图片区域 */}
                <div className="w-1/3 relative overflow-hidden bg-[#EBE7DF] dark:bg-[#1E1E1C]">
                  <ImageWithFallback 
                    src={city?.photo || ''} 
                    alt={translateCityName(city?.name)} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                
                {/* 右侧信息区域 */}
                <div className="w-2/3 p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="text-base font-serif-editorial text-[#141413] dark:text-[#F0EFEA]">
                        {translateCityName(city?.name)}
                      </h5>
                      <div className="flex items-center gap-1 font-mono-tech text-[10px] text-[#8A6F48] dark:text-[#C9A87C]">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{Number(city?.rating || 5).toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 font-mono-tech text-[10px] text-[#6E6C66] dark:text-[#9E9C94] mb-1.5 flex-wrap">
                      {city?.province && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-[#8A6F48] dark:text-[#C9A87C]" />
                          {translateProvinceName(city.province)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatDate(city?.visitedAt || '')}
                      </span>
                    </div>
                    
                    <p className="text-xs text-[#6E6C66] dark:text-[#9E9C94] line-clamp-2 leading-relaxed">
                      {getCityNote(city)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {optimizedCityData.length > (isMobile ? 2 : 3) && !isCitiesExpanded && (
          <button
            onClick={() => setIsCitiesExpanded(true)}
            className="mt-4 w-full py-2.5 flex items-center justify-center gap-2 font-mono-tech text-[11px] uppercase tracking-[0.16em] text-[#141413] dark:text-[#F0EFEA] bg-[#FAF9F5] dark:bg-[#0D0D0C] border designer-hairline hover:border-[#8A6F48] rounded-xl transition-colors relative z-50"
          >
            {td(
              `查看全部 ${optimizedCityData.length} 个城市 · VIEW ALL CITIES`,
              `VIEW ALL ${optimizedCityData.length} VISITED CITIES`,
            )}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        )}
      </div>
      </>
    ) : (
      <PhotoWall
        photos={optimizedCityData.map((c) => ({
          ...c,
          name: translateCityName(c.name),
          note: getCityNote(c),
        }))}
      />
    )}
    </motion.div>
  );
};

export default TravelMap;