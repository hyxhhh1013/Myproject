import { useState } from 'react';
import { Search, Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react';
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

const WeatherMiniDemo = () => {
  const [city, setCity] = useState('Changsha');
  const [weather, setWeather] = useState({ temp: 28, condition: 'Sunny', humidity: 65, wind: 12 });
  const [loading, setLoading] = useState(false);

  // Mock search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setWeather({
        temp: Math.floor(Math.random() * 15) + 15,
        condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
        humidity: Math.floor(Math.random() * 40) + 40,
        wind: Math.floor(Math.random() * 20) + 5
      });
      setLoading(false);
    }, 600);
  };

  const chartData = {
    labels: ['Now', '3h', '6h', '9h', '12h'],
    datasets: [{
      data: [weather.temp, weather.temp + 1, weather.temp - 2, weather.temp + 3, weather.temp],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } }
  };

  return (
    <div className="h-full bg-blue-50 dark:bg-gray-800 p-4 flex flex-col justify-between">
      <form onSubmit={handleSearch} className="relative mb-2">
        <input 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full pl-8 pr-2 py-1 text-sm rounded-lg border-none bg-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
          placeholder="Search..."
        />
        <Search className="absolute left-2 top-1.5 w-4 h-4 text-gray-400" />
      </form>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">{weather.temp}°</div>
              <div className="text-xs text-gray-500">{weather.condition}</div>
            </div>
            {weather.condition === 'Sunny' && <Sun className="w-10 h-10 text-yellow-500" />}
            {weather.condition === 'Cloudy' && <Cloud className="w-10 h-10 text-gray-400" />}
            {weather.condition === 'Rainy' && <CloudRain className="w-10 h-10 text-blue-500" />}
          </div>
          
          <div className="flex gap-4 text-xs text-gray-500 mb-2">
            <div className="flex items-center"><Droplets className="w-3 h-3 mr-1" />{weather.humidity}%</div>
            <div className="flex items-center"><Wind className="w-3 h-3 mr-1" />{weather.wind}km/h</div>
          </div>
          
          <div className="h-16 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherMiniDemo;
