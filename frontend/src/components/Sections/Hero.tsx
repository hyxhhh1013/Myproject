import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import { ChevronDown, ArrowRight, Mail, FileText } from 'lucide-react';
import { ParticleBackground } from '../UI/ParticleBackground';
import { ImageWithFallback } from '../UI/ImageWithFallback';
import avatarImg from '../../assets/images/e8f47feeab5afd0a0fce8ab4f9373d09.jpg';
import WeatherMiniDemo from '../Demos/WeatherMiniDemo';
import PomodoroMiniDemo from '../Demos/PomodoroMiniDemo';
import TodoMiniDemo from '../Demos/TodoMiniDemo';

export const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  
  // 鼠标互动效果 - 使用motion的内置动画
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // 鼠标移动事件处理
  const handleMouseMove = (e: React.MouseEvent) => {
    // 计算鼠标在视口中的位置，转换为[-1, 1]范围
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    
    // 更新球体位置
    x.set(mouseX * 50);
    y.set(mouseY * 50);
  };
  
  // 鼠标离开事件处理
  const handleMouseLeave = () => {
    // 重置球体位置
    x.set(0);
    y.set(0);
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900 dark:bg-black pt-20 pb-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-blue-950 to-black dark:from-black dark:via-gray-900 dark:to-black">
        <ParticleBackground />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        {/* Abstract Gradient Orbs - Reduced Count with Mouse Interaction */}
        <motion.div 
          style={{ 
            y: y1,
            x: x
          }}
          animate={{ 
            scale: [1, 1.1, 1],
            transition: {
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }
          }}
          whileHover={{ 
            scale: 1.1,
            transition: {
              duration: 0.3,
              ease: "easeOut"
            }
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"
        />
        <motion.div 
          style={{ 
            y: y2,
            x: x
          }}
          animate={{ 
            scale: [1, 1.1, 1],
            transition: {
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
              delay: 1
            }
          }}
          whileHover={{ 
            scale: 1.1,
            transition: {
              duration: 0.3,
              ease: "easeOut"
            }
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Avatar */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 relative group"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative z-10 ring-4 ring-blue-500/30">
              <ImageWithFallback
                src={avatarImg}
                alt="Avatar"
                className="transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-blue-500/40 blur-2xl transform scale-110 animate-pulse -z-0"></div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            你好，我是 <span className="text-blue-400">黄奕轩</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-6 text-gray-200 max-w-3xl mx-auto font-light leading-relaxed">
            计算机科学与技术专业在读学生，AI 时代的新一代创作者。
          </p>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 font-light">
            这里记录了我创作出的各种项目与实践及我的成长经历。
          </p>

          
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 relative">
            <ScrollLink
              to="projects"
              smooth={true}
              duration={500}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all transform hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 flex items-center cursor-pointer"
            >
              查看我的项目 <ArrowRight className="ml-2 w-4 h-4" />
            </ScrollLink>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-medium transition-all transform hover:scale-110 hover:shadow-lg cursor-pointer flex items-center"
            >
              查看简历 <FileText className="ml-2 w-4 h-4" />
            </a>
            <ScrollLink
              to="contact"
              smooth={true}
              duration={500}
              className="px-8 py-3.5 bg-transparent hover:bg-white/5 text-white border border-white/20 rounded-full font-medium transition-all cursor-pointer flex items-center hover:scale-110 hover:shadow-lg hover:shadow-white/10"
            >
              联系我 <Mail className="ml-2 w-4 h-4" />
            </ScrollLink>
          </div>

          {/* Quick Preview Section */}
          <div className="w-full max-w-5xl mx-auto mt-8 border-t border-white/10 pt-8">
            <p className="text-sm text-gray-400 mb-6 uppercase tracking-widest">精选项目预览</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { 
                  title: 'WeatherCast', 
                  desc: '实时全球天气仪表盘', 
                  Demo: WeatherMiniDemo,
                  color: 'bg-blue-500' 
                },
                { 
                  title: 'TaskMaster', 
                  desc: '拖拽式任务看板', 
                  Demo: TodoMiniDemo,
                  color: 'bg-green-500' 
                },
                { 
                  title: 'FocusFlow', 
                  desc: '极简番茄钟专注工具', 
                  Demo: PomodoroMiniDemo,
                  color: 'bg-red-500' 
                }
              ].map((proj, i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                  <div className="h-32 overflow-hidden relative pointer-events-none">
                    <proj.Demo />
                  </div>
                  <div className="p-5 relative z-20 flex-grow border-t border-white/5">
                    <div className={`w-3 h-3 ${proj.color} rounded-full mb-3 ring-2 ring-white/20`}></div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">{proj.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{proj.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/50 cursor-pointer hover:text-white transition-colors"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <ScrollLink to="projects" smooth={true} duration={500}>
          <ChevronDown className="w-8 h-8" />
        </ScrollLink>
      </motion.div>
    </section>
  );
};
