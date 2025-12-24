import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import WeatherMiniDemo from '../Demos/WeatherMiniDemo';
import TodoMiniDemo from '../Demos/TodoMiniDemo';
import PomodoroMiniDemo from '../Demos/PomodoroMiniDemo';
import NotesMiniDemo from '../Demos/NotesMiniDemo';

const ProjectCard = ({ title, intro, stack, responsibilities, challenges, github, demoLink, DemoComponent, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border border-gray-100 dark:border-gray-700 flex flex-col h-full"
  >
    {/* Interactive Demo Area */}
    <div className="h-64 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <DemoComponent />
      </div>
      {/* Overlay for Click-through */}
      <Link to={demoLink} className="absolute inset-0 z-10 bg-transparent" aria-label={`View full demo of ${title}`} />
    </div>

    <div className="p-6 flex flex-col flex-grow">
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
        
        {/* Intro */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
          {intro}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {stack.map((tag: string) => (
            <span key={tag} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-md font-medium border border-blue-100 dark:border-blue-800">
              {tag}
            </span>
          ))}
        </div>

        {/* Responsibilities */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">我的职责</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {responsibilities.map((item: string, idx: number) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>

        {/* Challenges & Solutions */}
        {challenges && (
          <div className="mb-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">难点与解决</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <span className="font-semibold text-gray-700 dark:text-gray-300">问题：</span>{challenges.problem}<br/>
              <span className="font-semibold text-gray-700 dark:text-gray-300">解决：</span>{challenges.solution}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
        {github ? (
          <a href={github} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 z-20">
            <Github className="w-4 h-4 mr-2" /> GitHub 源码
          </a>
        ) : (
          <span className="text-gray-400 text-sm cursor-not-allowed flex items-center"><Github className="w-4 h-4 mr-2" /> 私有仓库</span>
        )}
        {demoLink && (
          <Link to={demoLink} className="flex items-center text-blue-600 hover:text-blue-700 transition-colors text-sm font-bold z-20">
            <ExternalLink className="w-4 h-4 mr-2" /> 完整演示
          </Link>
        )}
      </div>
    </div>
  </motion.div>
);

export const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);

  // 本地项目数据
  const localProjects = [
    {
      id: 1,
      title: 'WeatherCast 天气预报',
      description: '基于 React + TypeScript 构建的现代化天气应用，支持实时天气查询与未来预报',
      technologies: 'React, TypeScript, Axios, Chart.js, Tailwind CSS',
      githubUrl: 'https://github.com',
      demoUrl: '/demo/weather',
      intro: '基于 React + TypeScript 构建的现代化天气应用，支持实时天气查询与未来预报',
      stack: ['React', 'TypeScript', 'Axios', 'Chart.js', 'Tailwind CSS'],
      challenges: {
        problem: '频繁搜索导致 API 请求过多触发限制',
        solution: '引入防抖 (Debounce) 机制，减少不必要的请求调用，并实现简单的本地缓存'
      },
      responsibilities: [
        '使用 Axios 进行异步数据请求，处理 API 响应与错误状态',
        '封装可复用的天气卡片组件，实现响应式布局',
        '使用 Chart.js 可视化展示未来 24 小时温度变化趋势'
      ],
      DemoComponent: WeatherMiniDemo
    },
    {
      id: 2,
      title: 'TaskMaster 任务管理',
      description: '集成 dnd-kit 实现流畅拖拽体验的任务管理应用，支持状态流转与主题切换',
      technologies: 'React, TypeScript, dnd-kit, Tailwind CSS, LocalStorage',
      githubUrl: 'https://github.com',
      demoUrl: '/demo/todo',
      intro: '集成 dnd-kit 实现流畅拖拽体验的任务管理应用，支持状态流转与主题切换',
      stack: ['React', 'TypeScript', 'dnd-kit', 'Tailwind CSS', 'LocalStorage'],
      challenges: {
        problem: '拖拽过程中组件重新渲染导致性能问题',
        solution: '使用 React.memo 和 useMemo 优化组件渲染，避免不必要的 DOM 更新'
      },
      responsibilities: [
        '集成 dnd-kit 库实现平滑的拖拽排序与状态流转交互',
        '设计清晰的数据结构管理任务状态（Todo/Doing/Done）',
        '实现深色/浅色模式切换，适配不同使用场景'
      ],
      DemoComponent: TodoMiniDemo
    },
    {
      id: 3,
      title: 'FocusFlow 专注时钟',
      description: '基于 Pomodoro 技术的专注时钟应用，支持自定义专注时长与休息周期',
      technologies: 'React, TypeScript, Web Audio API, LocalStorage, Tailwind CSS',
      githubUrl: 'https://github.com',
      demoUrl: '/demo/pomodoro',
      intro: '基于 Pomodoro 技术的专注时钟应用，支持自定义专注时长与休息周期',
      stack: ['React', 'TypeScript', 'Web Audio API', 'LocalStorage', 'Tailwind CSS'],
      challenges: {
        problem: '页面切换到后台时计时器可能不准确',
        solution: '使用 Web Worker 或对比时间戳的方式校准倒计时，确保时间准确性'
      },
      responsibilities: [
        '使用 useEffect 和 setInterval 实现精确的倒计时逻辑',
        '利用 LocalStorage 持久化存储用户配置与专注记录',
        '实现 Web Audio API 播放提示音，优化用户交互体验'
      ],
      DemoComponent: PomodoroMiniDemo
    },
    {
      id: 4,
      title: 'LiteNote 轻量笔记',
      description: '支持 Markdown 编辑与实时预览的轻量级笔记应用，支持主题切换',
      technologies: 'React, TypeScript, React-Markdown, Context API, Tailwind CSS',
      githubUrl: 'https://github.com',
      demoUrl: '/demo/notes',
      intro: '支持 Markdown 编辑与实时预览的轻量级笔记应用，支持主题切换',
      stack: ['React', 'TypeScript', 'React-Markdown', 'Context API', 'Tailwind CSS'],
      challenges: {
        problem: '输入长文本时页面渲染卡顿',
        solution: '对 Markdown 渲染组件进行懒加载与防抖处理，提升输入流畅度'
      },
      responsibilities: [
        '使用 Controlled Input 实现实时双向绑定',
        '引入 React-Markdown 解析器，安全渲染 HTML 内容',
        '使用 Context API 管理全局笔记状态与侧边栏切换'
      ],
      DemoComponent: NotesMiniDemo
    }
  ];

  useEffect(() => {
    // 使用本地数据
    setProjects(localProjects);
    
    // 可选：尝试从后端获取最新数据，失败则使用本地数据
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects');
        if (response.data && response.data.length > 0) {
          const formattedData = response.data.map((proj: any) => {
            // 查找对应的本地项目配置
            const localProj = localProjects.find(p => p.title === proj.title);
            if (localProj) {
              return {
                ...proj,
                intro: proj.description,
                stack: proj.technologies.split(',').map((t: string) => t.trim()),
                responsibilities: localProj.responsibilities,
                challenges: localProj.challenges,
                github: proj.githubUrl,
                demoLink: proj.demoUrl,
                DemoComponent: localProj.DemoComponent
              };
            }
            return proj;
          });
          setProjects(formattedData);
        }
      } catch (error) {
        console.log('使用本地项目数据');
        // 保持使用本地数据
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects" className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">项目案例</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            具备工程化思维的真实项目实践
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              {...project}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
