import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';

const skillCategories = [
  { key: '前端开发', label: '前端开发', icon: '🎨' },
  { key: '后端开发', label: '后端开发', icon: '⚙️' },
  { key: '移动开发', label: '移动开发', icon: '📱' },
  { key: '数据库', label: '数据库', icon: '🗄️' },
  { key: 'DevOps', label: 'DevOps', icon: '🚀' },
  { key: '云服务', label: '云服务', icon: '☁️' },
  { key: '设计工具', label: '设计工具', icon: '🎯' },
  { key: '其他', label: '其他', icon: '🔧' },
  // Mapping for English categories that might be in the database from seed data
  { key: 'Frontend', label: '前端开发', icon: '🎨' },
  { key: 'Backend', label: '后端开发', icon: '⚙️' },
  { key: 'Cloud', label: '云服务', icon: '☁️' },
];

const categoryMap: Record<string, string> = {
  'Frontend': '前端开发',
  'Backend': '后端开发',
  'DevOps': 'DevOps',
  'Cloud': '云服务',
  'Database': '数据库',
  'Mobile': '移动开发',
  'Design': '设计工具',
  'Other': '其他',
};

const getLevelColor = (level: number) => {
  if (level >= 90) return { bg: 'bg-green-500', text: '精通' };
  if (level >= 70) return { bg: 'bg-blue-500', text: '熟练' };
  if (level >= 50) return { bg: 'bg-yellow-500', text: '掌握' };
  return { bg: 'bg-gray-400', text: '了解' };
};

export const Skills = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/skills');
        const data = response.data?.data || response.data || [];
        
        const visibleSkills = data
          .filter((skill: any) => skill.isVisible !== false)
          .sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
        
        setSkills(visibleSkills);
      } catch (error) {
        console.error('Failed to fetch skills:', error);
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const groupedSkills = skillCategories
    .filter(c => !['Frontend', 'Backend', 'Cloud'].includes(c.key)) // Filter out english keys from final display
    .map(category => ({
      ...category,
      skills: skills.filter(skill => {
        const mappedCategory = categoryMap[skill.category] || skill.category;
        return mappedCategory === category.key;
      })
    }))
    .filter(group => group.skills.length > 0);

  if (loading) {
    return (
      <section id="skills" className="py-12 sm:py-24 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">加载中...</div>
        </div>
      </section>
    );
  }

  if (skills.length === 0) {
    return null;
  }

  return (
    <section id="skills" className="py-12 sm:py-24 bg-white dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">专业技能</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            多年积累的技术栈与工具链
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {groupedSkills.map((group, groupIndex) => (
            <motion.div
              key={group.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
              className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-xl sm:text-2xl">
                  {group.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                  {group.label}
                </h3>
              </div>
              
              <div className="space-y-3 sm:space-y-4 flex-grow">
                {group.skills.map((skill: any, index: number) => {
                  const levelInfo = getLevelColor(skill.level);
                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group/skill"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300 group-hover/skill:text-blue-600 dark:group-hover/skill:text-blue-400 transition-colors">
                          {skill?.name || '未命名'}
                        </span>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            {levelInfo.text}
                          </span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white w-6 sm:w-8 text-right">
                            {skill.level}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.25 sm:h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                          className={`h-full rounded-full ${levelInfo.bg} relative`}
                        >
                          <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20" 
                               style={{ animation: 'shimmer 2s infinite linear' }} />
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
