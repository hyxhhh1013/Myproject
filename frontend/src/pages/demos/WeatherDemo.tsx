import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Cloud, Sun, CloudRain, Wind, Droplets, ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
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

const WeatherDemo = () => {
  const [city, setCity] = useState('Changsha');
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock weather data for testing
  const mockWeather = {
    temp: 22,
    condition: '晴朗',
    humidity: 65,
    wind: 12,
    name: 'Changsha',
    country: 'CN'
  };

  const mockForecast = {
    labels: ['0:00', '3:00', '6:00', '9:00', '12:00', '15:00', '18:00', '21:00'],
    data: [20, 18, 17, 20, 24, 25, 23, 21]
  };

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError('');

      // 模拟成功响应，不依赖外部API
      setWeather(mockWeather);
      setForecast(mockForecast);

    } catch (err) {
      console.error(err);
      setError('未找到该城市或网络错误');
      // 使用模拟数据作为备用
      setWeather(mockWeather);
      setForecast(mockForecast);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(city.trim()) {
       fetchWeather();
    }
  };

  const getIcon = (condition: string) => {
     switch(condition) {
        case '晴朗': return <Sun className="w-24 h-24 text-yellow-400 animate-spin-slow" />;
        case '雨': return <CloudRain className="w-24 h-24 text-blue-400 animate-bounce" />;
        case '暴风雨': return <Wind className="w-24 h-24 text-purple-500 animate-pulse" />;
        case '雪': return <Cloud className="w-24 h-24 text-white" />; // Placeholder for snow
        default: return <Cloud className="w-24 h-24 text-gray-200" />;
     }
  };

  const chartData = {
    labels: Array.isArray(forecast?.labels) ? forecast.labels : [],
    datasets: [
      {
        label: '温度 (°C)',
        data: Array.isArray(forecast?.data) ? forecast.data : [],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'white',
        pointBorderColor: 'white',
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { 
         backgroundColor: 'rgba(0,0,0,0.7)',
         titleColor: 'white',
         bodyColor: 'white',
         displayColors: false
      }
    },
    scales: {
      y: { 
         display: false,
         grid: { display: false }
      },
      x: { 
         grid: { display: false, drawBorder: false },
         ticks: { color: 'rgba(255,255,255,0.7)' }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col md:flex-row relative min-h-[600px]">
        
        <Link to="/" className="absolute top-6 left-6 z-20 text-white/70 hover:text-white transition-colors bg-black/10 p-2 rounded-full backdrop-blur-sm">
            <ArrowLeft className="w-6 h-6" />
        </Link>

        {/* Left Panel: Search & Current Weather */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between text-white relative z-10">
           
           <div>
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="搜索城市..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/10 focus:bg-white/20 focus:border-white/30 outline-none transition-all placeholder-white/50 text-white"
                />
                <Search className="absolute left-4 top-4 text-white/70 w-6 h-6 group-focus-within:text-white transition-colors" />
              </form>
              {error && <p className="text-red-300 text-sm mt-2 ml-2">{error}</p>}
           </div>

           {loading ? (
             <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-white/50" />
             </div>
           ) : weather && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-10 md:mt-0"
             >
                <div className="flex items-center gap-2 text-white/80 mb-2">
                   <MapPin className="w-5 h-5" />
                   <span className="text-lg font-medium">{weather.name}, {weather.country}</span>
                </div>
                <h1 className="text-8xl md:text-9xl font-bold tracking-tighter mb-4">{weather.temp}°</h1>
                <div className="flex items-center gap-4">
                   <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                      {getIcon(weather.condition)}
                   </div>
                   <span className="text-3xl font-medium">{weather.condition}</span>
                </div>
             </motion.div>
           )}
        </div>

        {/* Right Panel: Details & Forecast */}
        <div className="w-full md:w-1/2 bg-black/20 p-8 md:p-12 flex flex-col justify-center text-white backdrop-blur-sm">
           {!loading && weather && (
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
             >
                <div className="grid grid-cols-2 gap-6 mb-12">
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                      <p className="text-white/60 mb-2">湿度</p>
                      <div className="flex items-center gap-3">
                         <Droplets className="w-8 h-8 text-blue-300" />
                         <span className="text-2xl font-bold">{weather.humidity}%</span>
                      </div>
                   </div>
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                      <p className="text-white/60 mb-2">风速</p>
                      <div className="flex items-center gap-3">
                         <Wind className="w-8 h-8 text-teal-300" />
                         <span className="text-2xl font-bold">{weather.wind} <span className="text-sm font-normal text-white/60">km/h</span></span>
                      </div>
                   </div>
                </div>

                <div>
                   <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                     <Cloud className="w-5 h-5 text-white/60" /> 24小时预报
                   </h3>
                   <div className="h-48 w-full">
                      {forecast && <Line data={chartData} options={chartOptions} />}
                   </div>
                </div>
             </motion.div>
           )}
        </div>
        
      </div>
    </div>
  );
};

export default WeatherDemo;