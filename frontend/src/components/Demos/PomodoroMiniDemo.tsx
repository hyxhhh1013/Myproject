import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const PomodoroMiniDemo = () => {
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const progress = ((1500 - timeLeft) / 1500) * 100;
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="h-full bg-red-50 dark:bg-gray-800 p-4 flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 flex items-center justify-center mb-4">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="8" 
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="text-3xl font-mono font-bold text-gray-800 dark:text-white">
          {mins}:{secs}
        </div>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform active:scale-95"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button 
          onClick={() => { setIsActive(false); setTimeLeft(1500); }}
          className="p-3 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PomodoroMiniDemo;
