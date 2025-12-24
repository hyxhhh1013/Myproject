import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export const TravelSection = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [travelData, setTravelData] = useState<any[]>([]);
  
  useEffect(() => {
    // 从后端获取旅行城市数据
    const fetchTravelCities = async () => {
      try {
        const res = await axios.get('/api/travel-cities');
        // 转换后端数据格式以匹配前端需求
        const formattedCities = res.data.map((city: any) => ({
          name: city.location,
          value: [city.longitude, city.latitude],
          note: city.description || '',
          wantCount: Math.floor(Math.random() * 50) + 10, // 模拟数据
          isWanted: false,
          beenCount: Math.floor(Math.random() * 200) + 50, // 模拟数据
          isBeen: true,
          year: new Date(city.visitedAt).getFullYear(),
          photo: city.photo || 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' // 默认图片
        }));
        setTravelData(formattedCities);
        localStorage.setItem('travelData', JSON.stringify(formattedCities));
      } catch (error) {
        console.error('Failed to fetch travel cities:', error);
        // 使用默认数据作为后备
        const defaultCities = [
          { name: '杭州', value: [120.15, 30.28], note: '西湖美景', wantCount: 24, isWanted: false, beenCount: 201, isBeen: true, year: 2023, photo: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
          { name: '株洲', value: [113.16, 27.83], note: '工业重镇', wantCount: 12, isWanted: false, beenCount: 89, isBeen: true, year: 2022, photo: 'https://p2.music.126.net/8SQn3b8U4KcVb2x4JgS1uw==/109951165087313309.jpg' },
          { name: '长沙', value: [112.94, 28.22], note: '岳麓山和橘子洲头', wantCount: 14, isWanted: false, beenCount: 135, isBeen: true, year: 2023, photo: 'https://p2.music.126.net/4G8Wjmj7DlT24LbJx8nZJw==/109951163076649060.jpg' },
          { name: '武汉', value: [114.31, 30.52], note: '家乡，珞珈山下', wantCount: 15, isWanted: false, beenCount: 128, isBeen: true, year: 2021, photo: 'https://p2.music.126.net/3mC1kYxTtU0VqTfK0y9ZgA==/109951165087313310.jpg' },
          { name: '萍乡', value: [113.85, 27.60], note: '革命圣地', wantCount: 18, isWanted: false, beenCount: 95, isBeen: true, year: 2022, photo: 'https://p2.music.126.net/1a0oK2jGx7pN5v3Z5x5l5g==/109951165087313311.jpg' },
          { name: '汕头', value: [116.69, 23.37], note: '海滨城市', wantCount: 22, isWanted: false, beenCount: 112, isBeen: true, year: 2024, photo: 'https://p2.music.126.net/2Zg1q1q5Z1q1q5Z1q1q5Z1q==/109951165087313312.jpg' }
        ];
        setTravelData(defaultCities);
        localStorage.setItem('travelData', JSON.stringify(defaultCities));
      }
    };
    
    fetchTravelCities();
    
    return () => {
      // 清理函数
    };
  }, []);
  
  // 保存数据到 localStorage
  const saveData = (updatedData: any[]) => {
    setTravelData(updatedData);
    localStorage.setItem('travelData', JSON.stringify(updatedData));
  };
  
  // 处理想去打卡
  const handleWant = (cityName: string) => {
    const updatedData = travelData.map(city => {
      if (city.name === cityName) {
        return {
          ...city,
          wantCount: city.isWanted ? city.wantCount - 1 : city.wantCount + 1,
          isWanted: !city.isWanted
        };
      }
      return city;
    });
    saveData(updatedData);
  };
  
  // 处理去过这里
  const handleBeen = (cityName: string) => {
    const updatedData = travelData.map(city => {
      if (city.name === cityName) {
        return {
          ...city,
          beenCount: city.isBeen ? city.beenCount - 1 : city.beenCount + 1,
          isBeen: !city.isBeen
        };
      }
      return city;
    });
    saveData(updatedData);
  };
  


  // 按年份排序城市，用于时间线
  const sortedCitiesByYear = [...travelData].sort((a, b) => a.year - b.year);
  // 地图容器高度
  const mapHeight = '400px';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="interest-card travel-widget"
    >
      <div className="text-center mb-8">
        <h2 className="widget-title">旅行足迹 · 12 座城市</h2>
        <p className="widget-desc">用脚丈量的风景，记录走过的每一座城</p>
      </div>
      
      {/* 地图区域 - 添加加载状态和条件渲染 */}
      <div className="map-container mb-12">
        <div
          ref={mapRef}
          id="china-map"
          style={{ 
            height: mapHeight, 
            width: '100%',
            backgroundColor: 'rgba(176, 168, 185, 0.05)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          {/* 地图功能已移除，仅显示足迹时间线 */}
          <div className="flex items-center justify-center h-full text-gray-400">
            <span>足迹地图功能已简化，下方显示足迹时间线</span>
          </div>
        </div>
      </div>
      
      {/* 足迹时间线 */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-white mb-6">足迹时间线</h3>
        <div className="relative">
          {/* 时间线轴线 */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-transparent via-gray-500 to-transparent"></div>
          
          {/* 时间线城市 */}
          {sortedCitiesByYear.map((city, index) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex items-center mb-10 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
            >
              {/* 左侧/右侧内容 */}
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-16 text-right' : 'pl-16'}`}>
                <div className="city-card relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300">
                  {/* 背景图片 - 模糊效果 */}
                  <div className="absolute inset-0 opacity-15">
                    <img 
                      src={city.photo} 
                      alt={city.name} 
                      className="w-full h-full object-cover blur-sm"
                    />
                  </div>
                  
                  {/* 内容 */}
                  <div className="relative z-10">
                    <div className="text-gray-400 text-sm mb-2">{city.year}年</div>
                    <h4 className="text-2xl font-semibold text-white mb-2">{city.name}</h4>
                    <p className="text-gray-300 text-base mb-4 leading-relaxed">{city.note}</p>
                    
                    {/* 非实名交互功能：想去/去过 */}
                    <div className="flex gap-3 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleWant(city.name)}
                        className={`flex-1 flex items-center justify-center gap-1 px-4 py-3 bg-white/10 rounded-full text-sm transition-all duration-300 hover:shadow-lg hover:text-blue-400 transform hover:scale-105 group ${city.isWanted ? 'text-red-500' : ''}`}
                      >
                        <span>🏃</span>
                        <span>{city.wantCount} 想去</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBeen(city.name)}
                        className={`flex-1 flex items-center justify-center gap-1 px-4 py-3 bg-white/10 rounded-full text-sm transition-all duration-300 hover:shadow-lg hover:text-blue-400 transform hover:scale-105 group ${city.isBeen ? 'text-cyan-500' : ''}`}
                      >
                        <span>❤️</span>
                        <span>{city.beenCount} 去过</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 时间线节点 */}
              <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                <motion.div
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border-2 border-gray-400 flex items-center justify-center"
                  whileHover={{ scale: 1.3, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                </motion.div>
              </div>
              
              {/* 占位 */}
              <div className="w-1/2"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};