import React, { useEffect, useRef, useState } from 'react';
import { FaCode, FaLaptopCode, FaGithub, FaRocket, FaCheckCircle } from 'react-icons/fa';

const Skills: React.FC = () => {
  // 技能数据
  const skills = [
    // 编程语言
    { name: 'C语言', level: 4, category: '编程语言', icon: <FaCode /> },
    { name: 'Java', level: 4, category: '编程语言', icon: <FaCode /> },
    { name: 'HTML', level: 4, category: '编程语言', icon: <FaCode /> },
    { name: 'CSS', level: 4, category: '编程语言', icon: <FaCode /> },
    { name: 'JavaScript', level: 4, category: '编程语言', icon: <FaCode /> },
    
    // 专业知识
    { name: '计算机网络', level: 4, category: '专业知识', icon: <FaLaptopCode /> },
    { name: '数据结构', level: 4, category: '专业知识', icon: <FaLaptopCode /> },
    { name: 'Web开发原理', level: 4, category: '专业知识', icon: <FaLaptopCode /> },
    { name: '前端框架', level: 3, category: '专业知识', icon: <FaLaptopCode /> },
    
    // 实践能力
    { name: 'GitHub', level: 5, category: '实践能力', icon: <FaGithub /> },
    { name: '项目开发', level: 4, category: '实践能力', icon: <FaGithub /> },
    { name: '代码调试', level: 4, category: '实践能力', icon: <FaGithub /> },
    { name: '独立学习', level: 5, category: '实践能力', icon: <FaGithub /> },
    
    // 前沿技术
    { name: 'AI与前端融合', level: 3, category: '前沿技术', icon: <FaRocket /> },
    { name: '低代码开发', level: 3, category: '前沿技术', icon: <FaRocket /> },
    { name: 'AI生成界面', level: 3, category: '前沿技术', icon: <FaRocket /> },
    { name: '技术趋势', level: 4, category: '前沿技术', icon: <FaRocket /> },
  ]

  // 按类别分组技能
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, typeof skills>)

  // 类别图标映射
  const categoryIcons: Record<string, React.ReactNode> = {
    '编程语言': <FaCode className="text-2xl" />,
    '专业知识': <FaLaptopCode className="text-2xl" />,
    '实践能力': <FaGithub className="text-2xl" />,
    '前沿技术': <FaRocket className="text-2xl" />
  }

  return (
    <div className="space-y-16">
      <h2 className="section-title">技能</h2>
      
      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <div 
            key={category} 
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#0071e3]">
                {categoryIcons[category]}
              </div>
              <h3 className="text-xl font-semibold text-black">{category}</h3>
            </div>
            
            <div className="space-y-4">
              {categorySkills.map((skill) => (
                <SkillItem key={skill.name} skill={skill} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface Skill {
  name: string;
  level: number;
  category: string;
  icon: React.ReactNode;
}

// Skill Item Component with Animation
function SkillItem({ skill }: { skill: Skill }) {
  const progressRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    
    const element = progressRef.current
    if (element) {
      observer.observe(element)
    }
    
    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])
  
  useEffect(() => {
    const progressElement = progressRef.current
    if (progressElement && isVisible) {
      // 添加动画效果
      progressElement.style.width = '0%'
      const timer = setTimeout(() => {
        progressElement.style.width = `${(skill.level / 5) * 100}%`
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [skill.level, isVisible])
  
  return (
    <div className="group">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-gray-400 group-hover:text-[#0071e3] transition-colors">
          {skill.icon}
        </div>
        <span className="text-sm font-medium text-gray-700 group-hover:text-[#0071e3] transition-colors flex-1">{skill.name}</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <FaCheckCircle 
              key={index} 
              className={`w-4 h-4 ${index < skill.level ? 'text-[#0071e3]' : 'text-gray-200'} transition-colors`}
            />
          ))}
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          ref={progressRef}
          className="h-full bg-gradient-to-r from-[#0071e3] to-[#5856d6] rounded-full transition-all duration-800 ease-out"
          style={{ width: isVisible ? `${(skill.level / 5) * 100}%` : '0%' }}
        ></div>
      </div>
    </div>
  )
}

export default Skills