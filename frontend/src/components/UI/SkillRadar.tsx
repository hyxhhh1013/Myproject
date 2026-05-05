import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// 技能雷达图数据
const data = [
  { subject: 'Frontend', A: 95, fullMark: 100 },
  { subject: 'Backend', A: 80, fullMark: 100 },
  { subject: 'Design', A: 70, fullMark: 100 },
  { subject: 'DevOps', A: 60, fullMark: 100 },
  { subject: 'AI/LLM', A: 85, fullMark: 100 },
  { subject: 'CS Base', A: 90, fullMark: 100 },
];

export const SkillRadar: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        {/* 网格线颜色淡化 */}
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        {/* 轴线文字颜色 */}
        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
        {/* 雷达区域：使用渐变色填充 */}
        <Radar
          name="Skills"
          dataKey="A"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="rgba(59, 130, 246, 0.3)"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};