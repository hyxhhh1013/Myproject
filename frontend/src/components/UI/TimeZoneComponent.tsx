import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface TimeZoneComponentProps {
  location?: string;
  timezone?: string;
}

export const TimeZoneComponent: React.FC<TimeZoneComponentProps> = ({
  location = '中国 · 长沙',
  timezone = 'GMT+8'
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="glass-card p-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest">Time & Location / 时间与位置</h3>
      </div>
      
      <div className="flex flex-col gap-4">
        {/* 实时时间 */}
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs mb-1">Local Time / 当地时间</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{formattedTime}</span>
            <span className="text-gray-400 text-sm">{timezone}</span>
          </div>
        </div>

        {/* 位置信息 */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <div>
            <span className="text-gray-400 text-xs block">Location / 位置</span>
            <span className="text-white text-sm">{location}</span>
          </div>
        </div>
      </div>

      {/* 微型地图占位符 */}
      <div className="mt-4 h-24 bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
          [地图占位符]
        </div>
      </div>
    </div>
  );
};
