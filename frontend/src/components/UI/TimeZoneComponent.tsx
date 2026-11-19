import React, { useState, useEffect } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { useI18n } from '../../i18n/i18nContext';

interface TimeZoneComponentProps {
  location?: string;
  timezone?: string;
}

export const TimeZoneComponent: React.FC<TimeZoneComponentProps> = ({
  location = '中国 · 长沙',
  timezone = 'UTC+8',
}) => {
  const { td } = useI18n();
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
    second: '2-digit',
    timeZone: 'Asia/Shanghai',
  });

  return (
    <div className="designer-card p-5 sm:p-6 rounded-2xl h-full flex flex-col justify-between">
      <div className="flex justify-between items-center pb-3 border-b designer-hairline">
        <span className="text-[#8E8C84] text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#8A6F48] stroke-[1.5]" />
          {td('LOCAL TELEMETRY', 'LOCAL TELEMETRY')}
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F3F1EC] dark:bg-[#22221F] text-[#5F5E58] dark:text-[#A09E96] border designer-hairline">
          {timezone}
        </span>
      </div>

      <div className="my-4 sm:my-5">
        <div className="text-3xl sm:text-4xl font-light font-mono tracking-tight text-[#141413] dark:text-[#F2F0EA]">
          {formattedTime}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs sm:text-sm text-[#5F5E58] dark:text-[#A09E96]">
          <MapPin className="w-3.5 h-3.5 text-[#8A6F48] shrink-0 stroke-[1.5]" />
          <span>{td(location, 'Changsha, Hunan, China')}</span>
        </div>
      </div>

      {/* Changsha Coordinates Bar */}
      <div className="px-3 py-2 rounded-xl bg-[#F6F4EF] dark:bg-[#1D1D1A] border designer-hairline flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E6F4E] dark:bg-emerald-400" />
          <span className="text-[#6E6C65] dark:text-[#9E9C94]">28.2282° N, 112.9388° E</span>
        </div>
        <span className="text-[#8A6F48] dark:text-[#C8A97E] font-medium">
          {td('ONLINE', 'ONLINE')}
        </span>
      </div>
    </div>
  );
};
