import React from 'react'

const Projects: React.FC = () => {
  // 项目数据
  const projects = [
    {
      id: 1,
      title: '电商网站',
      description: '一个完整的电商网站，包括商品展示、购物车、订单管理和支付功能。',
      technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Stripe'],
      githubUrl: 'https://github.com/hyxhhh1013',
      demoUrl: 'https://example.com',
    },
    {
      id: 2,
      title: '博客系统',
      description: '一个功能完整的博客系统，包括文章发布、评论、分类和标签功能。',
      technologies: ['Vue.js', 'JavaScript', 'Node.js', 'Express', 'MongoDB'],
      githubUrl: 'https://github.com/hyxhhh1013',
      demoUrl: 'https://example.com',
    },
    {
      id: 3,
      title: '任务管理应用',
      description: '一个任务管理应用，支持任务创建、编辑、删除和状态管理。',
      technologies: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS'],
      githubUrl: 'https://github.com/hyxhhh1013',
      demoUrl: 'https://example.com',
    },
    {
      id: 4,
      title: '社交媒体平台',
      description: '一个社交媒体平台，支持用户注册、登录、发布动态和关注功能。',
      technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Socket.io'],
      githubUrl: 'https://github.com/hyxhhh1013',
      demoUrl: 'https://example.com',
    },
  ]

  return (
    <div className="space-y-16">
      <h2 className="section-title">项目案例</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}

// Project Card Component
function ProjectCard({ project }: { project: any }) {
  return (
    <div className="card apple-card-hover overflow-hidden">
      <div className="space-y-6">
        <div>
          <h3 className="project-title group-hover:text-[#0071e3] transition-colors duration-300">{project.title}</h3>
          <p className="project-description">{project.description}</p>
        </div>
        
        <div className="project-technologies">
          {project.technologies.map((tech: string, index: number) => (
            <span key={index} className="project-tech-tag group-hover:bg-[#e5e5ea] transition-colors duration-300">{tech}</span>
          ))}
        </div>
        
        <div className="project-links pt-2">
          <a 
            href={project.githubUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-secondary"
            aria-label={`View ${project.title} on GitHub`}
          >
            GitHub
          </a>
          <a 
            href={project.demoUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary"
            aria-label={`View demo of ${project.title}`}
          >
            演示
          </a>
        </div>
      </div>
    </div>
  )
}

export default Projects