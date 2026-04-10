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
  // 地图容器引用
  const mapRef = useRef<HTMLDivElement>(null);
  // 地图实例引用 - 使用any类型避免TypeScript编译错误
  const chartRef = useRef<any>(null);
  // 状态管理
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'photos'>('map');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<any[]>([]);
  const [isCitiesExpanded, setIsCitiesExpanded] = useState(false);
  const isMobile = window.innerWidth < 768;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '未知时间';
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxSlides(images.map(img => ({ src: img })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  
  // 地图配置
  const mapConfig: MapConfig = {
    mapType: 'china',
    mapStyle: {
      areaColor: 'rgba(176, 168, 185, 0.1)',
      borderColor: 'rgba(176, 168, 185, 0.3)',
      labelColor: 'rgba(255, 255, 255, 0.6)'
    },
    markerStyle: {
      size: 16,
      color: '#b0a8b9',
      borderColor: '#ffffff'
    }
  };

  const getMediaUrl = (p: string) => {
    if (!p) return '';
    let path = p;
    
    // 处理旧服务器的完整 URL 或错误的域名
    if (path.includes('42.194.162.51') || path.includes('localhost:3001')) {
      try {
        const urlObj = new URL(path.startsWith('http') ? path : `http://localhost${path.startsWith('/') ? '' : '/'}${path}`);
        path = urlObj.pathname;
      } catch (e) {
        console.error('URL parse error:', e);
      }
    }
    
    if (path.startsWith('http')) return path;
    
    // 确保路径以 / 开头
    path = path.startsWith('/') ? path : `/${path}`;
    
    // 移除重复的 /api 前缀，统一指向 /uploads
    if (path.startsWith('/api/uploads')) {
      path = path.replace('/api/uploads', '/uploads');
    }
    
    const baseUrl = axios.defaults.baseURL || '';
    return `${baseUrl}${path}`;
  };

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
            photoUrl = getMediaUrl(photoUrl);
            
            // 处理照片数组 URL
            let photosArray: string[] = [];
            if (city.photos) {
              photosArray = typeof city.photos === 'string' ? JSON.parse(city.photos) : city.photos;
              photosArray = photosArray.map((img: string) => getMediaUrl(img));
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
              photoThumbnail: getMediaUrl(city.thumbnailUrl || city.photoThumbnail),
              photos: photosArray,
              thumbnailPhotos: city.thumbnailPhotos && city.thumbnailPhotos.length > 0 ? city.thumbnailPhotos.map((img: string) => getMediaUrl(img)) : [],
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
      photo: getMediaUrl(city.photo),
      photos: city.photos?.map((img: string) => getMediaUrl(img)) || []
    }));
  }, [cityData]);

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current || optimizedCityData.length === 0) {
      return;
    }

    // 动态导入echarts
    const initECharts = async () => {
      try {
        // 动态导入echarts
        const echartsInstance = await import('echarts');

        // 初始化 ECharts 实例
        const chart = echartsInstance.init(mapRef.current);
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
                        <h4 style="margin: 0 0 4px 0;">${city?.name || '未知城市'}</h4>
                        <p style="margin: 2px 0;">访问时间: ${formatDate(city?.visitedAt || '')}</p>
                        <p style="margin: 2px 0;">评分: ${'★'.repeat(Math.floor(city?.rating || 0))}${'☆'.repeat(5 - Math.floor(city?.rating || 0))}</p>
                        <p style="margin: 2px 0;">${city?.note || ''}</p>
                      </div>
                    `;
                  }
                  return params.name;
                }
              },
              geo: {
                map: mapConfig.mapType,
                roam: true, // 开启缩放和平移
                emphasis: {
                  label: {
                    show: true,
                    color: mapConfig.mapStyle.labelColor
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
                  fontSize: 12
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
                        return params.name;
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
            chart.setOption(option);

            // 点击事件处理
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
        return () => {
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
  }, [optimizedCityData, mapConfig]);

  // 关闭城市信息弹窗
  const closeCityInfo = () => {
    setSelectedCity(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="interest-card travel-widget border-2 border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300/80 dark:hover:border-gray-600/50 transition-all"
    >
      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8m3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5"/></svg>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">旅行足迹</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">用脚丈量的风景</p>
          </div>
        </div>
        
        <div className="flex justify-center gap-2 mt-4 md:mt-6 relative z-10 flex-wrap">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log('Switching to map mode');
              setViewMode('map');
            }}
            className={`cursor-pointer px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-2 border-2 ${
              viewMode === 'map' 
                ? 'bg-blue-600 text-white border-blue-400/50 shadow-lg shadow-blue-500/30' 
                : 'bg-gray-100/50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 border-gray-300/50 hover:border-gray-400/80'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
            地图模式
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log('Switching to photo mode');
              setViewMode('photos');
            }}
            className={`cursor-pointer px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-2 border-2 ${
              viewMode === 'photos' 
                ? 'bg-blue-600 text-white border-blue-400/50 shadow-lg shadow-blue-500/30' 
                : 'bg-gray-100/50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 border-gray-300/50 hover:border-gray-400/80'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            照片墙
          </motion.button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <>
      {/* 地图容器 */}
      {!error && (
        <div className="map-container mb-6 md:mb-12 relative">
          {loading ? (
            <div className="flex items-center justify-center h-[400px] min-h-[300px] max-h-[500px] text-gray-400 bg-white/5 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <span>地图加载中...</span>
              </div>
            </div>
          ) : (
            <div
              ref={mapRef}
              id="china-map"
              style={{ 
                height: '400px',
                minHeight: '300px',
                maxHeight: '500px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            ></div>
          )}
        </div>
      )}

      {/* 城市信息弹窗 */}
      <Modal 
        isOpen={!!selectedCity} 
        onClose={closeCityInfo}
        maxWidth="max-w-4xl"
      >
        {selectedCity && (
          <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 overflow-hidden">
            {/* Left: Hero Image (Visible on all, larger on MD+) */}
            <div className="md:w-5/12 relative h-64 md:h-auto overflow-hidden">
              <ImageWithFallback 
                src={selectedCity?.photo || ''} 
                alt={selectedCity?.name || '城市'} 
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-white/10 dark:md:to-gray-800/10"></div>
              
              {/* Floating Badge on Image (Mobile only) */}
              <div className="absolute bottom-4 left-4 md:hidden">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">{selectedCity?.name}</h3>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedCity?.province}
                </p>
              </div>
            </div>

            {/* Right: Detailed Info */}
            <div className="md:w-7/12 p-5 md:p-8 flex flex-col">
              <div className="hidden md:flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{selectedCity?.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {selectedCity?.province}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{formatDate(selectedCity?.visitedAt || '')}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    {'★'.repeat(Math.floor(selectedCity?.rating || 0))}{'☆'.repeat(5 - Math.floor(selectedCity?.rating || 0))}
                  </div>
                </div>
              </div>

              {/* Mobile Header Info (Visible only on mobile) */}
              <div className="md:hidden flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                    <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">{formatDate(selectedCity?.visitedAt || '')}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-yellow-500 text-xs">
                    {'★'.repeat(Math.floor(selectedCity?.rating || 0))}
                  </div>
                </div>
              </div>

              {/* Note / Description */}
              <div className="relative mb-6 md:mb-8">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-500 rounded-full opacity-50"></div>
                <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed italic pl-4">
                  "{selectedCity?.note || ''}"
                </p>
              </div>

              {/* Highlights & Tips Grid */}
              <div className="grid grid-cols-1 gap-4 md:gap-6 mb-6 md:mb-8">
                {selectedCity?.highlights && (
                  <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-700">
                    <h4 className="text-xs md:text-sm font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                      <Star className="w-3.5 md:w-4 h-3.5 md:h-4 text-blue-500 fill-current" />
                      旅行亮点
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCity.highlights.split('\n').map((h, i) => (
                        <span key={i} className="bg-white dark:bg-gray-800 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm text-gray-700 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                          <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-blue-400" />
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCity?.tips && (
                  <div className="bg-green-50/50 dark:bg-green-900/10 rounded-2xl p-4 md:p-5 border border-green-100/50 dark:border-green-900/30">
                    <h4 className="text-xs md:text-sm font-black text-green-600/70 dark:text-green-400/70 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                      <Navigation className="w-3.5 md:w-4 h-3.5 md:h-4" />
                      当地建议
                    </h4>
                    <p className="text-xs md:text-base text-green-800 dark:text-green-200 leading-relaxed m-0">
                      {selectedCity.tips}
                    </p>
                  </div>
                )}
              </div>

              {/* Photo Moments */}
              {selectedCity?.photos && selectedCity.photos.length > 0 && (
                <div className="mb-6 md:mb-8">
                  <h4 className="text-xs md:text-sm font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                    <Maximize2 className="w-3.5 md:w-4 h-3.5 md:h-4 text-purple-500" />
                    精彩瞬间
                  </h4>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {selectedCity.photos.map((photo, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 1 : -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden cursor-pointer shadow-md border border-white dark:border-gray-700"
                        onClick={() => openLightbox(selectedCity.photos || [], idx)}
                      >
                        <ImageWithFallback 
                          src={photo} 
                          alt={`${selectedCity.name} photo ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="mt-auto pt-4 md:pt-6 flex justify-center md:justify-end">
                <button
                  onClick={closeCityInfo}
                  className="group flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-xs md:text-sm font-bold transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                >
                  返回地图
                  <X className="w-3.5 md:w-4 h-3.5 md:h-4 transition-transform group-hover:rotate-90" />
                </button>
              </div>
            </div>
          </div>
        )}
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
      <div className="mb-6 md:mb-12 px-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Navigation className="w-4 md:w-5 h-4 md:h-5 text-blue-500" />
            城市列表
          </h3>
          {optimizedCityData.length > (isMobile ? 2 : 3) && (
            <motion.button
              onClick={() => setIsCitiesExpanded(!isCitiesExpanded)}
              className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1 relative z-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCitiesExpanded ? '收起' : '展开'}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isCitiesExpanded ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
            </motion.button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {(isCitiesExpanded ? optimizedCityData : optimizedCityData.slice(0, isMobile ? 2 : 3)).map((city) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
              onClick={() => setSelectedCity(city)}
            >
              <div className="flex h-28 md:h-32">
                {/* 左侧图片区域 */}
                <div className="w-1/3 relative overflow-hidden">
                  <ImageWithFallback 
                    src={city?.photo || ''} 
                    alt={city?.name || '城市'} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 dark:to-black/20"></div>
                </div>
                
                {/* 右侧信息区域 */}
                <div className="w-2/3 p-3 md:p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        {city?.name || '未知城市'}
                      </h4>
                      <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-600 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-700/50">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{city?.rating || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
                      {city?.province && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {city.province}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(city?.visitedAt || '')}
                      </span>
                    </div>
                    
                    <div className="relative mt-1">
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 italic leading-relaxed">
                        "{city?.note || ''}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {optimizedCityData.length > (isMobile ? 2 : 3) && !isCitiesExpanded && (
          <motion.button
            onClick={() => setIsCitiesExpanded(true)}
            className="mt-4 w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors relative z-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            查看全部 {optimizedCityData.length} 个城市
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </motion.button>
        )}
      </div>
      </>
    ) : (
      <PhotoWall photos={optimizedCityData} />
    )}
    </motion.div>
  );
};

export default TravelMap;