import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

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
          return;
        }

        // 从后端 API 获取数据
        const response = await axios.get('/travel-cities');
        const formattedData: CityData[] = response.data.map((city: any) => ({
          id: city.id,
          name: city.name,
          province: city.province,
          longitude: city.longitude,
          latitude: city.latitude,
          visitedAt: city.visited_at,
          note: city.note || '',
          photo: city.photo || 'https://picsum.photos/seed/default/300/200',
          rating: city.rating || 0
        }));

        // 保存到 localStorage
        localStorage.setItem('travelCityData', JSON.stringify(formattedData));
        setCityData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch city data:', err);
        // 使用默认数据
        const defaultData: CityData[] = [
          { id: 1, name: '杭州', province: '浙江', longitude: 120.15, latitude: 30.28, visitedAt: '2023-05-15', note: '西湖美景', photo: 'https://picsum.photos/seed/hangzhou/300/200', rating: 5 },
          { id: 2, name: '长沙', province: '湖南', longitude: 112.94, latitude: 28.22, visitedAt: '2023-08-20', note: '岳麓山和橘子洲头', photo: 'https://picsum.photos/seed/changsha/300/200', rating: 4 },
          { id: 3, name: '武汉', province: '湖北', longitude: 114.31, latitude: 30.52, visitedAt: '2023-10-05', note: '家乡，珞珈山下', photo: 'https://picsum.photos/seed/wuhan/300/200', rating: 5 },
          { id: 4, name: '北京', province: '北京', longitude: 116.40, latitude: 39.90, visitedAt: '2024-02-15', note: '故宫和长城', photo: 'https://picsum.photos/seed/beijing/300/200', rating: 5 },
          { id: 5, name: '上海', province: '上海', longitude: 121.47, latitude: 31.23, visitedAt: '2024-04-10', note: '外滩夜景', photo: 'https://picsum.photos/seed/shanghai/300/200', rating: 4 },
          { id: 6, name: '成都', province: '四川', longitude: 104.07, latitude: 30.67, visitedAt: '2024-06-25', note: '美食之都', photo: 'https://picsum.photos/seed/chengdu/300/200', rating: 5 }
        ];
        setCityData(defaultData);
        setError('Failed to fetch data from server, using default data.');
        setLoading(false);
      }
    };

    fetchCityData();
  }, []);

  // 初始化地图
  useEffect(() => {
    console.log('地图初始化开始');
    console.log('地图容器:', mapRef.current);
    console.log('城市数据数量:', cityData.length);
    
    if (!mapRef.current || cityData.length === 0) {
      console.log('地图容器为空或城市数据为空，跳过初始化');
      return;
    }

    // 动态导入echarts
    const initECharts = async () => {
      try {
        console.log('开始加载echarts');
        // 动态导入echarts
        const echartsInstance = await import('echarts');
        console.log('echarts加载成功:', echartsInstance);

        // 初始化 ECharts 实例
        console.log('开始初始化ECharts实例');
        // 直接使用echartsInstance.init()，不访问default属性
        const chart = echartsInstance.init(mapRef.current);
        chartRef.current = chart;
        console.log('ECharts实例初始化成功');

        // 加载中国地图数据
        const loadMapData = async () => {
          try {
            console.log('开始加载地图数据');
            // 尝试从 localStorage 获取缓存的地图数据
            const cachedMapData = localStorage.getItem('chinaMapData');
            console.log('localStorage中的地图数据:', cachedMapData ? '存在' : '不存在');
            let mapData;

            if (cachedMapData) {
              console.log('使用缓存的地图数据');
              mapData = JSON.parse(cachedMapData);
            } else {
              console.log('从CDN加载地图数据');
              // 从 CDN 加载地图数据
              const response = await fetch('https://cdn.jsdelivr.net/npm/echarts/map/json/china.json');
              console.log('地图数据请求响应:', response.status);
              mapData = await response.json();
              console.log('地图数据加载成功，大小:', JSON.stringify(mapData).length);
              // 缓存地图数据
              localStorage.setItem('chinaMapData', JSON.stringify(mapData));
              console.log('地图数据已缓存到localStorage');
            }

            // 注册地图
            console.log('开始注册地图');
            // 直接使用echartsInstance.registerMap()，不访问default属性
            echartsInstance.registerMap(mapConfig.mapType, mapData);
            console.log('地图注册成功');

            // 地图配置选项
            console.log('开始创建地图配置选项');
            const option = {
              backgroundColor: 'transparent',
              tooltip: {
                trigger: 'item',
                formatter: function(params: any) {
                  const city = cityData.find(c => c.name === params.name);
                  if (city) {
                    return `
                      <div style="padding: 8px;">
                        <h4 style="margin: 0 0 4px 0;">${city.name}</h4>
                        <p style="margin: 2px 0;">访问时间: ${new Date(city.visitedAt).toLocaleDateString()}</p>
                        <p style="margin: 2px 0;">评分: ${'★'.repeat(Math.floor(city.rating))}${'☆'.repeat(5 - Math.floor(city.rating))}</p>
                        <p style="margin: 2px 0;">${city.note}</p>
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
                zoom: 1.2 // 默认缩放级别
              },
              series: [
                {
                  name: '城市标记',
                  type: 'scatter',
                  coordinateSystem: 'geo',
                  data: cityData.map(city => ({
                    name: city.name,
                    value: [city.longitude, city.latitude, city.rating],
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
            console.log('地图配置选项创建成功');

            // 设置图表选项
            console.log('开始设置图表选项');
            chart.setOption(option);
            console.log('图表选项设置成功');

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
        console.log('添加了窗口大小调整监听器');

        // 清理函数
        return () => {
          console.log('执行地图清理函数');
          window.removeEventListener('resize', handleResize);
          chart.dispose();
          chartRef.current = null;
          console.log('地图清理完成');
        };
      } catch (err) {
        console.error('加载echarts失败:', err);
        setError('Failed to load map chart.');
      }
    };

    initECharts();
  }, [cityData, mapConfig]);

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
      className="interest-card travel-widget"
    >
      <div className="text-center mb-8">
        <h2 className="widget-title">旅行足迹 · 中国地图</h2>
        <p className="widget-desc">用脚丈量的风景，记录走过的每一座城</p>
      </div>

      {/* 地图容器 */}
      <div className="map-container mb-12 relative">
        {loading ? (
          <div className="flex items-center justify-center h-96 text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              <span>地图加载中...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96 text-gray-400">
            <span>{error}</span>
          </div>
        ) : (
          <div
            ref={mapRef}
            id="china-map"
            style={{ 
              height: '400px', 
              width: '100%',
              backgroundColor: 'rgba(176, 168, 185, 0.05)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          ></div>
        )}
      </div>

      {/* 城市信息弹窗 */}
      {selectedCity && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
        >
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full mx-4">
            <div className="relative">
              <img 
                src={selectedCity.photo} 
                alt={selectedCity.name} 
                className="w-full h-64 object-contain bg-black"
              />
              <button
                onClick={closeCityInfo}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">{selectedCity.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{selectedCity.province}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm bg-blue-600/80 backdrop-blur-md px-4 py-1 rounded-full">
                  {new Date(selectedCity.visitedAt).toLocaleDateString()}
                </span>
                <span className="text-sm bg-yellow-600/80 backdrop-blur-md px-4 py-1 rounded-full">
                  {'★'.repeat(Math.floor(selectedCity.rating))}{'☆'.repeat(5 - Math.floor(selectedCity.rating))}
                </span>
              </div>
              <p className="text-gray-300 text-base mb-6 leading-relaxed">{selectedCity.note}</p>
              <div className="flex justify-end">
                <button
                  onClick={closeCityInfo}
                  className="px-6 py-2 bg-white/10 rounded-full text-sm transition-all duration-300 hover:bg-white/20"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 城市列表 */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-white mb-6">城市列表</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cityData.map((city) => (
            <motion.div
              key={city.id}
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <img 
                  src={city.photo} 
                  alt={city.name} 
                  className="w-16 h-16 object-contain bg-black rounded" 
                />
                <div className="flex-1">
                  <h4 className="font-medium text-white">{city.name}</h4>
                  <p className="text-gray-400 text-xs">{city.province}</p>
                  <p className="text-gray-400 text-sm mt-1">{new Date(city.visitedAt).toLocaleDateString()}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-400 text-sm">{'★'.repeat(Math.floor(city.rating))}</span>
                    <span className="text-gray-500 text-sm">{'☆'.repeat(5 - Math.floor(city.rating))}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 text-sm mt-3 line-clamp-2">{city.note}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TravelMap;