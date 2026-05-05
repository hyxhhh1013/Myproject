import React from 'react'

const Skills: React.FC = () => {
  // 技能数据
  const skills = [
    // 前端技能
    { name: 'HTML', level: 5, category: '前端' },
    { name: 'CSS', level: 5, category: '前端' },
    { name: 'JavaScript', level: 5, category: '前端' },
    { name: 'TypeScript', level: 4, category: '前端' },
    { name: 'React', level: 5, category: '前端' },
    { name: 'Vue.js', level: 4, category: '前端' },
    { name: 'Tailwind CSS', level: 4, category: '前端' },
    { name: 'Redux', level: 4, category: '前端' },
    
    // 后端技能
    { name: 'Node.js', level: 5, category: '后端' },
    { name: 'Express', level: 5, category: '后端' },
    { name: 'NestJS', level: 3, category: '后端' },
    { name: 'GraphQL', level: 3, category: '后端' },
    
    // 数据库技能
    { name: 'PostgreSQL', level: 4, category: '数据库' },
    { name: 'MySQL', level: 4, category: '数据库' },
    { name: 'MongoDB', level: 3, category: '数据库' },
    { name: 'Redis', level: 3, category: '数据库' },
    
    // 其他技能
    { name: 'Git', level: 5, category: '其他' },
    { name: 'Docker', level: 3, category: '其他' },
    { name: 'AWS', level: 3, category: '其他' },
    { name: 'Linux', level: 4, category: '其他' },
  ]

  // 按类别分组技能
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, typeof skills>)

  return (
    <div>
      <h2 className="section-title">技能</h2>
      <div className="card">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{category}</h3>
            <div className="space-y-4">
              {categorySkills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 font-medium">{skill.name}</span>
                    <span className="text-gray-500 text-sm">{skill.level}/5</span>
                  </div>
                  <div className="skill-bar">
                    <div 
                      className="skill-bar-fill" 
                      style={{ width: `${(skill.level / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Skills