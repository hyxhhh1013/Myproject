import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, ExternalLink } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import WeatherCastMiniDemo from '../Demos/WeatherCastMiniDemo';
import TaskMasterMiniDemo from '../Demos/TaskMasterMiniDemo';
import FocusFlowMiniDemo from '../Demos/FocusFlowMiniDemo';
import LiteNoteMiniDemo from '../Demos/LiteNoteMiniDemo';
import { ImageWithFallback } from '../UI/ImageWithFallback';

const demoComponentMap: Record<string, React.ComponentType<any>> = {
  'FocusFlow 专注时钟': FocusFlowMiniDemo,
  'LiteNote 轻量笔记': LiteNoteMiniDemo,
  'TaskMaster 任务管理': TaskMasterMiniDemo,
  'WeatherCast 天气预报': WeatherCastMiniDemo,
};

type ProjectCardProps = {
  title: string;
  intro?: string;
  description: string;
  stack: string[];
  responsibilities?: string[];
  challenges?: { problem: string; solution: string };
  github?: string;
  demoLink?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  DemoComponent?: React.ComponentType<any>;
  delay: number;
};

const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ title, intro, description, stack, responsibilities, challenges, github, demoLink, imageUrl, thumbnailUrl, DemoComponent, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border border-gray-100 dark:border-gray-700 flex flex-col h-full"
    >
      {DemoComponent ? (
        <div className="h-48 sm:h-56 md:h-64 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-hidden relative">
          <div className="absolute inset-0 z-0">
            <DemoComponent />
          </div>
          <Link to={demoLink || '#'} className="absolute inset-0 z-10 bg-transparent" aria-label={`View full demo of ${title}`} />
        </div>
      ) : imageUrl ? (
        <div className="h-48 sm:h-56 md:h-64 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-hidden relative group">
          <ImageWithFallback 
            src={imageUrl.startsWith('http') ? imageUrl : `${imageUrl}`} 
            thumbnailSrc={thumbnailUrl ? (thumbnailUrl.startsWith('http') ? thumbnailUrl : `${thumbnailUrl}`) : undefined}
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          {demoLink && <Link to={demoLink} className="absolute inset-0 z-10 bg-transparent" aria-label={`View full demo of ${title}`} />}
        </div>
      ) : null}

      <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
            {intro || description}
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {stack.map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-md font-medium border border-blue-100 dark:border-blue-800">
                {tag}
              </span>
            ))}
          </div>
          {responsibilities && responsibilities.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">我的职责</h4>
              <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {responsibilities.map((item: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}
          {challenges && (
            <div className="mb-3 sm:mb-4 bg-gray-50 dark:bg-gray-700/30 p-2 sm:p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">难点与解决</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                <span className="font-semibold text-gray-700 dark:text-gray-300">问题：</span>{challenges.problem}<br/>
                <span className="font-semibold text-gray-700 dark:text-gray-300">解决：</span>{challenges.solution}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 mt-2 gap-2 sm:gap-3">
          {github ? (
            <a href={github} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs sm:text-sm font-bold bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 z-20">
              <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> GitHub 源码
            </a>
          ) : (
            <span className="text-gray-400 text-xs sm:text-sm cursor-not-allowed flex items-center bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg"><Github className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> 私有仓库</span>
          )}
          {demoLink && (
            <Link to={demoLink} className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white transition-colors text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg z-20 shadow-md hover:shadow-lg">
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> 完整演示
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/projects');
        const data = response.data?.data || response.data || [];
        
        const formattedData = data
          .filter((proj: any) => proj.isVisible !== false)
          .map((proj: any) => ({
            id: proj.id,
            title: proj.title,
            description: proj.description,
            intro: proj.intro,
            stack: proj.technologies ? (
              // Handle both JSON string array and comma-separated string
              proj.technologies.startsWith('[') 
                ? JSON.parse(proj.technologies) 
                : proj.technologies.split(',').map((t: string) => t.trim())
            ) : [],
            responsibilities: proj.responsibilities ? proj.responsibilities.split('\n').filter((r: string) => r.trim()) : [],
            challenges: proj.challengesProblem && proj.challengesSolution ? {
              problem: proj.challengesProblem,
              solution: proj.challengesSolution
            } : undefined,
            github: proj.githubUrl,
            demoLink: proj.demoUrl,
            imageUrl: proj.imageUrl,
            thumbnailUrl: proj.thumbnailUrl,
            DemoComponent: demoComponentMap[proj.title] || null,
            orderIndex: proj.orderIndex || 0
          }))
          .sort((a: any, b: any) => a.orderIndex - b.orderIndex);
        
        setProjects(formattedData);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section id="projects" className="py-12 sm:py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">加载中...</div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <section id="projects" className="py-12 sm:py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
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
