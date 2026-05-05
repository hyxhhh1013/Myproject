import { useState, useEffect } from 'react';
import { Search, Cloud, Sun, CloudRain, Wind, Droplets, MapPin, Eye, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WeatherIcon = ({ condition, className }: { condition: string, className?: string }) => {
  if (condition.includes('晴')) return <Sun className={`text-yellow-400 drop-shadow-lg ${className}`} />;
  if (condition.includes('雪')) return <CloudSnow className={`text-blue-200 drop-shadow-lg ${className}`} />;
  if (condition.includes('雷')) return <CloudLightning className={`text-purple-400 drop-shadow-lg ${className}`} />;
  if (condition.includes('雾') || condition.includes('霾')) return <CloudFog className={`text-gray-400 drop-shadow-lg ${className}`} />;
  if (condition.includes('雨')) return <CloudRain className={`text-blue-400 drop-shadow-lg ${className}`} />;
  if (condition.includes('阴')) return <Cloud className={`text-gray-400 drop-shadow-lg ${className}`} />;
  if (condition.includes('云')) return <Cloud className={`text-gray-300 drop-shadow-lg ${className}`} />;
  return <Cloud className={`text-white/80 drop-shadow-lg ${className}`} />;
};

const WeatherCastMiniDemo = () => {
  const [city, setCity] = useState('北京');
  const [weather, setWeather] = useState({
    temp: 22,
    condition: '晴天',
    humidity: 45,
    wind: 12,
    aqi: 50,
    feels_like: 24,
    visibility: 10
  });
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化时获取当前位置天气
  useEffect(() => {
    fetchLocalWeather();
  }, []);

  // 获取天气数据
  const fetchWeatherData = async (locationQuery: string) => {
    try {
      const response = await axios.get(`https://wttr.in/${locationQuery}?format=j1`);
      if (response.data && response.data.current_condition) {
        const data = response.data;
        const current = data.current_condition[0];
        // 提取城市名
        const area = data.nearest_area?.[0]?.areaName?.[0]?.value || '当地';
        
        setCity(area);
        setWeather({
          temp: parseInt(current.temp_C) || 22,
          condition: translateCondition(current.weatherDesc?.[0]?.value || 'Clear'),
          humidity: parseInt(current.humidity) || 45,
          wind: parseInt(current.windspeedKmph) || 12,
          aqi: Math.floor(Math.random() * 100) + 20, // wttr不提供AQI，使用mock
          feels_like: parseInt(current.FeelsLikeC) || 20,
          visibility: parseInt(current.visibility) || 10
        });

        // 格式化预报数据
        if (data.weather && Array.isArray(data.weather)) {
          const formattedForecast = data.weather.slice(0, 3).map((f: any, i: number) => ({
            day: i === 0 ? '今天' : i === 1 ? '明天' : '后天',
            temp_high: parseInt(f.maxtempC),
            temp_low: parseInt(f.mintempC),
            condition: translateCondition(f.hourly?.[4]?.weatherDesc?.[0]?.value || 'Clear') // 取中午的天气
          }));
          
          // wttr通常返回3天预报，补充剩下2天
          let lastHigh = formattedForecast[2].temp_high;
          let lastLow = formattedForecast[2].temp_low;
          formattedForecast.push({ day: '大后天', temp_high: lastHigh + 1, temp_low: lastLow - 1, condition: '晴' });
          formattedForecast.push({ day: '几天后', temp_high: lastHigh, temp_low: lastLow + 1, condition: '多云' });
          
          setForecast(formattedForecast);
        } else {
          generateMockData();
        }
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('获取天气失败:', error);
      return false;
    }
  };

  // 使用浏览器地理位置API获取位置
  const getGeolocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          resolve(null);
        }
      );
    });
  };

  const fetchLocalWeather = async () => {
    try {
      setLoading(true);
      
      // 1. 尝试使用浏览器地理位置API
      const geoLocation = await getGeolocation();
      if (geoLocation) {
        const { latitude, longitude } = geoLocation;
        const locationQuery = `${latitude},${longitude}`;
        const success = await fetchWeatherData(locationQuery);
        if (success) {
          return;
        }
      }

      // 2. 尝试使用IP地址获取位置
      try {
        const ipInfo = await axios.get('https://ipapi.co/json/');
        if (ipInfo.data && ipInfo.data.city) {
          const locationQuery = ipInfo.data.city;
          const success = await fetchWeatherData(locationQuery);
          if (success) {
            return;
          }
        }
      } catch (e) {
      }

      // 3. 尝试使用自动IP解析
      const success = await fetchWeatherData('');
      if (success) {
        return;
      }

      // 4. 所有方法都失败，使用模拟数据
      generateMockData();
    } catch (error) {
      console.error('获取天气失败:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const translateCondition = (enCond: string) => {
    const cond = enCond.toLowerCase();
    if (cond.includes('sunny') || cond.includes('clear')) return '晴';
    if (cond.includes('cloud') || cond.includes('overcast')) return '多云';
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) return '雨';
    if (cond.includes('snow') || cond.includes('ice')) return '雪';
    if (cond.includes('thunder') || cond.includes('storm')) return '雷阵雨';
    if (cond.includes('fog') || cond.includes('mist')) return '雾';
    return '晴'; // 默认
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      if (response.data && response.data.current_condition) {
        const data = response.data;
        const current = data.current_condition[0];
        // 提取城市名
        const area = data.nearest_area?.[0]?.areaName?.[0]?.value || city;
        
        setCity(area);
        setWeather({
          temp: parseInt(current.temp_C) || 22,
          condition: translateCondition(current.weatherDesc?.[0]?.value || 'Clear'),
          humidity: parseInt(current.humidity) || 45,
          wind: parseInt(current.windspeedKmph) || 12,
          aqi: Math.floor(Math.random() * 100) + 20,
          feels_like: parseInt(current.FeelsLikeC) || 20,
          visibility: parseInt(current.visibility) || 10
        });

        if (data.weather && Array.isArray(data.weather)) {
          const formattedForecast = data.weather.slice(0, 3).map((f: any, i: number) => ({
            day: i === 0 ? '今天' : i === 1 ? '明天' : '后天',
            temp_high: parseInt(f.maxtempC),
            temp_low: parseInt(f.mintempC),
            condition: translateCondition(f.hourly?.[4]?.weatherDesc?.[0]?.value || 'Clear')
          }));
          
          let lastHigh = formattedForecast[2].temp_high;
          let lastLow = formattedForecast[2].temp_low;
          formattedForecast.push({ day: '大后天', temp_high: lastHigh + 1, temp_low: lastLow - 1, condition: '晴' });
          formattedForecast.push({ day: '几天后', temp_high: lastHigh, temp_low: lastLow + 1, condition: '多云' });
          
          setForecast(formattedForecast);
        } else {
          generateMockData();
        }
      } else {
        alert('未找到该城市的天气信息');
        generateMockData();
      }
    } catch (error) {
      console.error('搜索天气失败:', error);
      alert('获取天气信息失败，请稍后重试');
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    setWeather({
      temp: Math.floor(Math.random() * 25) + 10,
      condition: ['晴天', '多云', '小雨', '阴'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 50) + 30,
      wind: Math.floor(Math.random() * 20) + 5,
      aqi: Math.floor(Math.random() * 100) + 20,
      feels_like: Math.floor(Math.random() * 25) + 12,
      visibility: Math.floor(Math.random() * 8) + 5
    });
    setForecast(Array(5).fill(0).map((_, i) => ({
      day: ['今天', '明天', '后天', '周四', '周五'][i],
      temp_high: 25 + Math.floor(Math.random() * 5),
      temp_low: 15 - Math.floor(Math.random() * 5),
      condition: ['晴天', '多云', '小雨', '晴', '阴'][i]
    })));
  };

  const chartData = {
    labels: forecast.map(f => f.day),
    datasets: [
      {
        data: forecast.map(f => f.temp_high),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        data: forecast.map(f => f.temp_low),
        borderColor: 'rgb(147, 197, 253)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: 'transparent',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 13 as any, weight: 'bold' },
        bodyFont: { size: 12 as any },
        callbacks: {
          label: function(context: any) {
            return context.parsed.y + '°C';
          }
        }
      }
    },
    scales: { 
      x: { display: false },
      y: { display: false, min: Math.min(...forecast.map(f => f.temp_low)) - 2, max: Math.max(...forecast.map(f => f.temp_high)) + 2 }
    }
  } as any;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-3 md:p-4 flex flex-col shadow-lg border border-blue-400/30 relative overflow-hidden"
    >
      {/* Background Decoration - Subtle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-3xl" />
      
      <div className="relative z-10">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-3 md:mb-4">
          <div className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="搜索城市..."
              className="w-full pl-7 pr-2 py-1.5 text-xs md:text-sm rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur focus:bg-white/30 focus:border-white/60 focus:ring-2 focus:ring-white/20 outline-none text-white placeholder-white/60 transition-all"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/70" />
          </div>
        </form>
        
        {/* Main Weather Info */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="mb-3 md:mb-4">
              <div className="flex justify-between items-start mb-2 md:mb-3">
                <div>
                  <div className="flex items-center gap-1 text-white/90 text-xs mb-1">
                    <MapPin className="w-3 h-3" />
                    <span className="font-semibold">{city}</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{weather.temp}°</div>
                  <div className="text-xs text-white/90 mt-1 font-medium">{weather.condition}</div>
                  <div className="text-xs text-white/70 mt-0.5">体感 {weather.feels_like}°</div>
                </div>
                <WeatherIcon condition={weather.condition} className="w-10 h-10 md:w-12 h-12" />
              </div>
              
              {/* Weather Details Grid */}
              <div className="grid grid-cols-4 gap-1 mb-3 md:mb-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/15 backdrop-blur-md border border-white/20 p-1.5 rounded-xl flex flex-col items-center hover:bg-white/25 transition-all"
                >
                  <Droplets className="w-3.5 h-3.5 text-white/80 mb-0.5" />
                  <span className="text-xs md:text-sm font-bold text-white">{weather.humidity}%</span>
                  <span className="text-xs text-white/60">湿度</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/15 backdrop-blur-md border border-white/20 p-1.5 rounded-xl flex flex-col items-center hover:bg-white/25 transition-all"
                >
                  <Wind className="w-3.5 h-3.5 text-white/80 mb-0.5" />
                  <span className="text-xs md:text-sm font-bold text-white">{weather.wind}</span>
                  <span className="text-xs text-white/60">km/h</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/15 backdrop-blur-md border border-white/20 p-1.5 rounded-xl flex flex-col items-center hover:bg-white/25 transition-all"
                >
                  <Cloud className="w-3.5 h-3.5 text-white/80 mb-0.5" />
                  <span className="text-xs md:text-sm font-bold text-white">{weather.aqi}</span>
                  <span className="text-xs text-white/60">AQI</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/15 backdrop-blur-md border border-white/20 p-1.5 rounded-xl flex flex-col items-center hover:bg-white/25 transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-white/80 mb-0.5" />
                  <span className="text-xs md:text-sm font-bold text-white">{weather.visibility}</span>
                  <span className="text-xs text-white/60">km</span>
                </motion.div>
              </div>
            </div>
            
            {/* Forecast Chart */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 overflow-hidden border border-white/20 mb-3 min-h-[100px] md:min-h-[140px]">
              <Line data={chartData} options={chartOptions} />
            </div>
            
            {/* Forecast List */}
            <div className="grid grid-cols-5 gap-1.5">
              {forecast.map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex flex-col items-center p-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 transition-all"
                >
                  <span className="text-xs text-white/70 mb-1 font-semibold">{item.day}</span>
                  <WeatherIcon condition={item.condition} className="w-4 h-4 mb-1" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs md:text-sm font-bold text-white">{item.temp_high}°</span>
                    <span className="text-xs text-white/60">{item.temp_low}°</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default WeatherCastMiniDemo;