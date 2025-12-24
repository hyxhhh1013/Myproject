import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Code, Server 
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const SkillBar = ({ name, level, delay, icon: Icon, color }: any) => (
  <div className="mb-6 group">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center">
        {Icon && (
          <div className={`p-1.5 rounded-lg mr-3 ${color} bg-opacity-10 dark:bg-opacity-20`}>
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
          </div>
        )}
        <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-600 transition-colors">{name}</span>
      </div>
      <span className="text-gray-500 dark:text-gray-400 text-sm font-mono">{level}%</span>
    </div>
    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${level}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
        className={`h-full rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-green-400`}
      />
    </div>
  </div>
);

export const Skills = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);

  // 本地技能数据
  const localSkills = [
    {
      id: 1,
      name: 'HTML5 / CSS3 / Tailwind',
      category: 'Frontend',
      level: 92
    },
    {
      id: 2,
      name: 'JavaScript / TypeScript',
      category: 'Frontend',
      level: 85
    },
    {
      id: 3,
      name: 'Vue 3 / Composition API',
      category: 'Frontend',
      level: 88
    },
    {
      id: 4,
      name: 'AI 工具应用',
      category: 'Other',
      level: 85
    },
    {
      id: 5,
      name: 'github',
      category: 'Other',
      level: 78
    },
    {
      id: 6,
      name: 'Python',
      category: 'Other',
      level: 70
    }
  ];

  useEffect(() => {
    // 使用本地数据
    setSkills(localSkills);
    
    // 生成雷达图数据
    const chartData = localSkills.slice(0, 6).map((skill: any) => ({
      subject: skill.name.split('/')[0].trim(), // Simplify name for chart
      A: skill.level,
      fullMark: 100
    }));
    setRadarData(chartData);

    // 可选：尝试从后端获取最新数据，失败则使用本地数据
    const fetchSkills = async () => {
      try {
        const response = await axios.get('/api/skills');
        const data = response.data;
        if (data && data.length > 0) {
          setSkills(data);
          
          // 生成雷达图数据
          const chartData = data.slice(0, 6).map((skill: any) => ({
            subject: skill.name.split('/')[0].trim(), // Simplify name for chart
            A: skill.level,
            fullMark: 100
          }));
          setRadarData(chartData);
        }
      } catch (error) {
        console.log('使用本地技能数据');
        // 保持使用本地数据
      }
    };

    fetchSkills();
  }, []);

  const frontendSkills = skills.filter(s => s.category === 'Frontend');
  const otherSkills = skills.filter(s => s.category !== 'Frontend');

  return (
    <section id="skills" className="py-24 bg-white dark:bg-dark-surface transition-colors duration-300 relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-0"></div>
       <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -z-0"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">专业技能</h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            核心技术栈与能力分布
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start max-w-7xl mx-auto">
          {/* Frontend Skills */}
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-8 border-l-4 border-blue-600 pl-4 flex items-center">
              <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                 <Code className="text-blue-600 dark:text-blue-400" />
              </span>
              前端核心
            </h3>
            {frontendSkills.map((skill: any, index: number) => (
              <SkillBar 
                key={skill.id}
                name={skill.name} 
                level={skill.level} 
                delay={index * 0.1} 
                icon={Code} // You might want to map icons dynamically based on skill name
                color="text-blue-500" 
              />
            ))}
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 min-h-[400px]"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">技能分布</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Skill Level"
                    dataKey="A"
                    stroke="#10b981"
                    fill="#34d399"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Other Skills */}
          <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-8 border-l-4 border-green-600 pl-4 flex items-center">
              <span className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
                 <Server className="text-green-600 dark:text-green-400" />
              </span>
              通用技能
            </h3>
            {otherSkills.map((skill: any, index: number) => (
              <SkillBar 
                key={skill.id}
                name={skill.name} 
                level={skill.level} 
                delay={0.5 + index * 0.1} 
                icon={Server} 
                color="text-green-500" 
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
