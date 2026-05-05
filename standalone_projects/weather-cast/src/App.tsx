import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Cloud, Sun, CloudRain, Wind, Droplets, MapPin, Gauge, Eye, Thermometer, Umbrella, Navigation } from 'lucide-react';
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

// Python API 地址
const API_URL = 'http://localhost:5000/api/weather';

const WeatherIcon = ({ condition, className }: { condition: string, className?: string }) => {
  if (condition.includes('晴')) return <Sun className={`text-yellow-400 drop-shadow-lg ${className}`} />;
  if (condition.includes('雨')) return <CloudRain className={`text-blue-400 drop-shadow-lg ${className}`} />;
  if (condition.includes('雷')) return <CloudRain className={`text-purple-500 drop-shadow-lg ${className}`} />;
  if (condition.includes('阴')) return <Cloud className={`text-gray-400 drop-shadow-lg ${className}`} />;
  return <Cloud className={`text-white/80 drop-shadow-lg ${className}`} />;
};

const App = () => {
  const [city, setCity] = useState('北京');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (queryCity: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}?city=${queryCity}`);
      if (!res.ok) throw new Error('API连接失败');
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error(err);
      setError('无法连接到天气服务 (请确保已启动 Python 后端)');
      // Fallback mock data
      setWeather({
        city: queryCity,
        temp: 22,
        condition: '晴天',
        humidity: 45,
        wind: 12,
        aqi: 50,
        forecast: Array(5).fill(0).map((_, i) => ({
          day: '未来',
          temp_high: 25,
          temp_low: 18,
          condition: '晴天'
        }))
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('北京');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) fetchWeather(city);
  };

  const chartData = {
    labels: weather?.forecast?.map((f: any) => f.day) || [],
    datasets: [
      {
        label: '最高温',
        data: weather?.forecast?.map((f: any) => f.temp_high) || [],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#fff',
      },
      {
        label: '最低温',
        data: weather?.forecast?.map((f: any) => f.temp_low) || [],
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 255, 255, 0.4)',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      y: { display: false },
      x: { 
        grid: { display: false }, 
        ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 12 } } 
      }
    }
  };

  const getBgGradient = (cond: string) => {
    if (!cond) return 'from-blue-400 to-blue-600';
    if (cond.includes('晴')) return 'from-orange-400 to-rose-500';
    if (cond.includes('雨')) return 'from-slate-700 to-slate-900';
    if (cond.includes('阴') || cond.includes('云')) return 'from-slate-400 to-slate-600';
    return 'from-blue-400 to-blue-600';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBgGradient(weather?.condition)} transition-all duration-1000 p-4 md:p-8 flex items-center justify-center font-sans text-white`}>
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px] relative">
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Left Panel: Main Info */}
        <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-between relative z-10">
          <div>
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="搜索城市..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/10 focus:bg-white/20 focus:border-white/30 outline-none transition-all placeholder-white/50 text-white shadow-lg"
              />
              <Search className="absolute left-4 top-4 text-white/70 w-5 h-5 group-focus-within:text-white transition-colors" />
            </form>
            {error && <p className="text-red-300 text-xs mt-3 ml-2 bg-red-500/20 py-1 px-2 rounded-lg inline-block">{error}</p>}
          </div>

          <div className="flex flex-col items-center md:items-start my-10">
            {weather && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center md:text-left"
              >
                <div className="flex items-center justify-center md:justify-start space-x-2 text-white/80 mb-4 bg-white/10 px-4 py-1.5 rounded-full w-fit mx-auto md:mx-0 backdrop-blur-md border border-white/10">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium tracking-wide">{weather.city}</span>
                </div>
                
                <div className="mb-6 drop-shadow-2xl filter">
                  <WeatherIcon condition={weather.condition} className="w-40 h-40" />
                </div>
                
                <div className="relative">
                   <h1 className="text-8xl font-bold tracking-tighter drop-shadow-sm">{weather.temp}°</h1>
                   <p className="text-2xl font-medium mt-2 opacity-90">{weather.condition}</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
               <div className="flex items-center text-white/60 mb-2 text-xs font-bold uppercase tracking-wider">
                 <Umbrella className="w-4 h-4 mr-2" /> 空气质量
               </div>
               <p className="text-2xl font-bold">{weather?.aqi || '--'}</p>
               <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                 <div className="bg-green-400 h-full rounded-full" style={{ width: `${Math.min(weather?.aqi || 0, 100)}%` }}></div>
               </div>
             </div>
             <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center text-white/60 mb-2 text-xs font-bold uppercase tracking-wider">
                 <Navigation className="w-4 h-4 mr-2" /> 风向
               </div>
               <p className="text-xl font-bold">东北风</p>
               <p className="text-xs text-white/50 mt-1">3级</p>
             </div>
          </div>
        </div>

        {/* Right Panel: Details & Forecast */}
        <div className="md:w-3/5 bg-black/10 p-8 md:p-12 flex flex-col backdrop-blur-md border-l border-white/5">
          {loading ? (
             <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
             </div>
          ) : weather ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Grid Stats */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { icon: Droplets, label: '湿度', value: `${weather.humidity}%` },
                  { icon: Wind, label: '风速', value: `${weather.wind} km/h` },
                  { icon: Gauge, label: '气压', value: '1012 hPa' },
                  { icon: Eye, label: '能见度', value: '10 km' },
                  { icon: Sun, label: '紫外线', value: '强' },
                  { icon: Thermometer, label: '体感', value: `${weather.temp + 2}°` },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all hover:scale-105">
                    <item.icon className="w-6 h-6 mb-3 text-white/70" />
                    <p className="text-xs text-white/40 mb-1">{item.label}</p>
                    <p className="text-lg font-bold">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="flex-grow min-h-[180px] bg-white/5 rounded-3xl p-6 border border-white/5 mb-8 relative group">
                <h3 className="text-sm font-bold text-white/60 mb-4 absolute top-6 left-6">温度趋势</h3>
                <div className="w-full h-full pt-6">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Forecast List */}
              <div className="grid grid-cols-5 gap-2">
                {weather.forecast?.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/20 transition-all cursor-pointer">
                    <span className="text-xs text-white/50 mb-2">{item.day}</span>
                    <WeatherIcon condition={item.condition} className="w-8 h-8 mb-2" />
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-sm">{item.temp_high}°</span>
                      <span className="text-xs text-white/40">{item.temp_low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default App;
