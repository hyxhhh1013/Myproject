import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCw } from 'lucide-react';

const FocusFlowMiniDemo = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const timerRef = useRef<number | null>(null);

  const MODES = {
    focus: { label: '专注', color: '#FF6B6B', bg: '#FFF0F0' },
    short: { label: '短休息', color: '#4ECDC4', bg: '#E0F7FA' },
    long: { label: '长休息', color: '#45B7D1', bg: '#E1F5FE' },
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (mode === 'focus') {
        setCompletedPomodoros(prev => prev + 1);
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : mode === 'short' ? 5 * 60 : 15 * 60);
  };

  const changeMode = (newMode: 'focus' | 'short' | 'long') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : newMode === 'short' ? 5 * 60 : 15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((mode === 'focus' ? 25 : mode === 'short' ? 5 : 15) * 60 - timeLeft) / ((mode === 'focus' ? 25 : mode === 'short' ? 5 : 15) * 60) * 100;

  return (
    <div className="h-full bg-white dark:bg-gray-900 p-4 flex flex-col">
      {/* Mode Switcher */}
      <div className="flex gap-1 mb-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {Object.keys(MODES).map((m) => {
          const currentMode = MODES[m as keyof typeof MODES];
          const isActiveMode = mode === m;
          return (
            <button
              key={m}
              onClick={() => changeMode(m as any)}
              className={`flex items-center justify-center px-3 py-1 rounded-md text-xs font-medium transition-all ${isActiveMode ? 'bg-white dark:bg-gray-700 shadow-sm' : 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              style={{
                color: isActiveMode ? currentMode.color : 'inherit'
              }}
            >
              {currentMode.label}
            </button>
          );
        })}
      </div>

      {/* Timer Circle */}
      <div className="relative w-full aspect-square flex justify-center items-center mb-3">
        <svg width="100%" height="100%" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#eee" strokeWidth="8" />
          <circle
            cx="50%" cy="50%" r="45%"
            fill="none"
            stroke={MODES[mode].color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 - (2 * Math.PI * 45 * progress) / 100}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-2xl font-bold" style={{ color: MODES[mode].color }}>
            {formatTime(timeLeft)}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {isActive ? '进行中' : '已暂停'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2 mb-3">
        <button 
          onClick={toggleTimer}
          className="flex items-center justify-center w-12 h-12 rounded-full transition-all"
          style={{
            backgroundColor: MODES[mode].color,
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {isActive ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button 
          onClick={resetTimer}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <RotateCw size={24} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mt-auto">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          今日完成: {completedPomodoros}
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-3 h-3 rounded-full ${isActive ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: isActive ? MODES[mode].color : '#e0e0e0'
            }}
          />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isActive ? '专注中' : '已暂停'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusFlowMiniDemo;