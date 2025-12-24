import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Cloud, Sun, CloudRain, Wind, Droplets, ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
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

const WeatherDemo = () => {
  const [city, setCity] = useState('Changsha');
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (searchCity: string) => {
    try {
      setLoading(true);
      setError('');

      // 1. Geocoding
      const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${searchCity}&count=1&language=en&format=json`);
      
      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        throw new Error('未找到该城市');
      }

      const { latitude, longitude, name, country } = geoRes.data.results[0];

      // 2. Weather Data
      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m&timezone=auto`
      );

      const current = weatherRes.data.current;
      const hourly = weatherRes.data.hourly;

      setWeather({
        temp: Math.round(current.temperature_2m),
        condition: getWeatherCondition(current.weather_code),
        humidity: current.relative_humidity_2m,
        wind: current.wind_speed_10m,
        name: name,
        country: country
      });

      // Process forecast for chart (next 24 hours, every 3 hours)
      const next24h = hourly.time.slice(0, 24);
      const next24hTemps = hourly.temperature_2m.slice(0, 24);
      
      // Filter for every 3 hours
      const chartLabels = [];
      const chartDataPoints = [];
      
      for(let i=0; i<24; i+=3) {
         const date = new Date(next24h[i]);
         chartLabels.push(date.getHours() + ':00');
         chartDataPoints.push(next24hTemps[i]);
      }

      setForecast({
        labels: chartLabels,
        data: chartDataPoints
      });

    } catch (err) {
      console.error(err);
      setError('未找到该城市或网络错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Changsha');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(city.trim()) {
       fetchWeather(city);
    }
  };

  // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
  const getWeatherCondition = (code: number) => {
    if (code === 0) return '晴朗';
    if (code >= 1 && code <= 3) return '多云';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '雨';
    if (code >= 71 && code <= 77) return '雪';
    if (code >= 95) return '暴风雨';
    return '多云';
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
    labels: forecast?.labels || [],
    datasets: [
      {
        label: '温度 (°C)',
        data: forecast?.data || [],
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