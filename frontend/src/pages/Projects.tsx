import React from 'react'

const Projects: React.FC = () => {
  // 项目数据
  const projects = [
    {
      id: 1,
      title: '电商网站',
      description: '一个完整的电商网站，包括商品展示、购物车、订单管理和支付功能。',
      technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Stripe'],
      githubUrl: 'https://github.com',
      demoUrl: 'https://example.com',
    },
    {
      id: 2,
      title: '博客系统',
      description: '一个功能完整的博客系统，包括文章发布、评论、分类和标签功能。',
      technologies: ['Vue.js', 'JavaScript', 'Node.js', 'Express', 'MongoDB'],
      githubUrl: 'https://github.com',
      demoUrl: 'https://example.com',
    },
    {
      id: 3,
      title: '任务管理应用',
      description: '一个任务管理应用，支持任务创建、编辑、删除和状态管理。',
      technologies: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS'],
      githubUrl: 'https://github.com',
      demoUrl: 'https://example.com',
    },
    {
      id: 4,
      title: '社交媒体平台',
      description: '一个社交媒体平台，支持用户注册、登录、发布动态和关注功能。',
      technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Socket.io'],
      githubUrl: 'https://github.com',
      demoUrl: 'https://example.com',
    },
  ]

  return (
    <div>
      <h2 className="section-title">项目案例</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <h3 className="project-title">{project.title}</h3>
            <p className="project-description">{project.description}</p>
            <div className="project-technologies">
              {project.technologies.map((tech, index) => (
                <span key={index} className="project-tech-tag">{tech}</span>
              ))}
            </div>
            <div className="project-links">
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary"
              >
                GitHub
              </a>
              <a 
                href={project.demoUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
              >
                演示
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Projects