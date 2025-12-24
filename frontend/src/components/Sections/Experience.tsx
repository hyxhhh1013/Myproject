import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Terminal, Trophy, Phone, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import "yet-another-react-lightbox/styles.css";
import { ImageWithFallback } from '../UI/ImageWithFallback';

// Import images
// Unicom
import unicomImg1 from '../../assets/images/experiences/06eefaf1b3712646432e2f5011dd0be2.jpg';
import unicomImg2 from '../../assets/images/experiences/19875c2fd413d3e85176455737c06d0c.jpg';
import unicomImg3 from '../../assets/images/experiences/9a4c01fbafbeffd11b3bc809181b0f02.jpg';

// Startup
import startupImg1 from '../../assets/images/experiences/1d19c0a21fdbfc7dd3847fad6aa7d99.jpg';
import startupImg2 from '../../assets/images/experiences/45056586f58781714fbb8bae6e88640.jpg';
import startupImg3 from '../../assets/images/experiences/fee1dcaea04d70de6f4bc84a6353ca5.jpg';

// Lab
import labImg1 from '../../assets/images/experiences/1b0ac42167f193334210d15b520f15b0.jpg';
import labImg2 from '../../assets/images/experiences/ea82875e36aeef70b7511314f66f1c55.jpg';

// Community
import communityImg1 from '../../assets/images/experiences/4164fc01048f0bc04ee55121f0ebf346.jpg';
import communityImg2 from '../../assets/images/experiences/a894e545c49e4cc4be1685d2545e2258.jpg';
import communityImg3 from '../../assets/images/experiences/e799e6dceadd8bcdea6bc8e9201e0e4b.jpg';

// Map hardcoded images to companies for now (until we have real image uploads)
const imageMap: Record<string, string[]> = {
  "中国联通": [unicomImg1, unicomImg2, unicomImg3],
  "自主创业": [startupImg1, startupImg2, startupImg3],
  "湖南农业大学": [labImg1, labImg2],
  "开源社区 / Trae": [communityImg1, communityImg2, communityImg3]
};

const iconMap: Record<string, any> = {
  "中国联通": Phone,
  "自主创业": Trophy,
  "湖南农业大学": Terminal,
  "开源社区 / Trae": Code
};

const colorMap: Record<string, string> = {
  "中国联通": "bg-green-500",
  "自主创业": "bg-yellow-500",
  "湖南农业大学": "bg-red-500",
  "开源社区 / Trae": "bg-blue-500"
};

const ITEMS_PER_PAGE = 3;

const TimelineItem = ({ data, index }: { data: any, index: number }) => {
  const isEven = index % 2 === 0;
  // Odd item (index 0, 2...): Text Left, Image Right
  // Even item (index 1, 3...): Image Left, Text Right
  const isTextLeft = isEven;

  return (
    <motion.div
      initial={{ opacity: 0, x: isTextLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      className={`flex flex-col md:flex-row items-center justify-between w-full mb-16 md:mb-32 relative group`}
    >
      {/* Center Line Dot (Desktop) */}
      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border-4 border-blue-500 z-20 shadow-[0_0_15px_rgba(59,130,246,0.6)] group-hover:scale-125 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.9)] transition-all duration-300"></div>
      
      {/* Left Side Container */}
      <div className={`w-full md:w-[45%] md:pr-12`}>
        {isTextLeft ? (
           <ExperienceText data={data} align="right" />
        ) : (
           <ExperienceImage data={data} />
        )}
      </div>

      {/* Spacer for Center Line */}
      <div className="hidden md:block md:w-[10%]"></div>

      {/* Right Side Container */}
      <div className={`w-full md:w-[45%] md:pl-12`}>
         {isTextLeft ? (
            <ExperienceImage data={data} />
         ) : (
            <ExperienceText data={data} align="left" />
         )}
      </div>
    </motion.div>
  );
};

const ExperienceText = ({ data, align }: { data: any, align: 'left' | 'right' }) => (
  <div className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${align === 'right' ? 'md:text-right' : 'md:text-left'}`}>
    <div className={`flex items-center mb-4 ${align === 'right' ? 'md:justify-end' : 'md:justify-start'}`}>
      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800">
        {data.date}
      </span>
    </div>
    
    <h3 className={`text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3 ${align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
      <data.icon className={`w-6 h-6 ${data.color.replace('bg-', 'text-')} flex-shrink-0`} />
      {data.title}
    </h3>
    
    <p className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-4">{data.company}</p>
    
    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed text-justify">
      {data.description}
    </p>
  </div>
);

const ExperienceImage = ({ data }: { data: any }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % data.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + data.images.length) % data.images.length);
  };

  return (
    <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 max-w-[400px] mx-auto w-full aspect-[4/3]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <ImageWithFallback
            src={data.images[currentImageIndex]}
            alt={data.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]">
        <span className="text-white font-bold text-lg tracking-wider px-6 py-2 border border-white/30 bg-white/10 backdrop-blur-md rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 mb-4">
          {data.caption}
        </span>
        
        {/* Navigation Dots */}
        {data.images.length > 1 && (
          <div className="flex gap-2 mt-4">
            {data.images.map((_: any, idx: number) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {data.images.length > 1 && (
        <>
          <button 
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

// Mobile Version
const MobileTimelineItem = ({ data }: { data: any, index: number }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      // Calculate index based on scroll position and item width (approx 85% + gap)
      // Since items are centered, this rough calculation works well enough for dots
      const newIndex = Math.round(scrollLeft / (width * 0.85));
      if (newIndex >= 0 && newIndex < data.images.length && newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative mb-16 last:mb-0 pl-8 border-l-2 border-gray-200 dark:border-gray-700 ml-4"
    >
      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-gray-900 ring-2 ring-blue-100 dark:ring-blue-900/30"></div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
         {/* Header Section */}
         <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 relative">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-1">
                     <data.icon className={`w-4 h-4 ${data.color.replace('bg-', 'text-')}`} />
                     {data.title}
                  </h3>
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-xs block">{data.company}</span>
               </div>
               <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-800 whitespace-nowrap">
                 {data.date}
               </span>
            </div>
         </div>
  
         {/* Image Section */}
         <div className="relative group bg-gray-100 dark:bg-gray-900 py-4">
           <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 gap-3 pb-2"
           >
              {data.images.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  className="min-w-[85%] aspect-[4/3] snap-center relative rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700"
                  onClick={() => setLightboxOpen(true)}
                >
                   <ImageWithFallback
                     src={img}
                     alt={data.title}
                     className="w-full h-full object-cover"
                   />
                   <div className="absolute inset-0 bg-black/0 active:bg-black/10 transition-colors flex items-center justify-center">
                      <ZoomIn className="text-white opacity-0 active:opacity-100 w-8 h-8 drop-shadow-md" />
                   </div>
                </div>
              ))}
           </div>
           
           {/* Navigation Dots */}
           {data.images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2 mb-1">
                {data.images.map((_: any, idx: number) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-blue-500 w-4' : 'bg-gray-300 dark:bg-gray-600 w-1.5'}`}
                  />
                ))}
              </div>
           )}
         </div>
  
         {/* Description Section */}
         <div className="p-5 pt-2">
           <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
             {data.description}
           </p>
         </div>

         <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            slides={data.images.map((src: string) => ({ src }))}
            index={currentImageIndex}
         />
      </div>
    </motion.div>
  );
};

export const Experience = () => {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);

  // 本地经历数据
  const localExperiences = [
    {
      id: 1,
      company: "中国联通",
      position: "前端开发实习生",
      description: "参与了中国联通智慧校园项目的前端开发工作，负责学生管理系统的页面开发与优化。使用 React + TypeScript + Ant Design 构建了多个核心功能模块，包括学生信息管理、成绩查询、课程安排等。优化了系统的响应速度，减少了页面加载时间，提升了用户体验。",
      startDate: "2022-07-01",
      endDate: "2022-09-30",
      title: "前端开发实习生",
      date: "2022.07 - 2022.09",
      icon: Phone,
      color: "bg-green-500",
      images: imageMap["中国联通"],
      caption: "中国联通实习"
    },
    {
      id: 2,
      company: "自主创业",
      position: "全栈开发工程师",
      description: "自主创业期间，负责了多个项目的全栈开发工作，包括电商平台、教育管理系统、社区论坛等。从需求分析、架构设计到开发测试，全程参与项目生命周期。使用 React、Node.js、MySQL 等技术栈构建了高性能、可扩展的 Web 应用。",
      startDate: "2023-03-01",
      endDate: "2024-01-31",
      title: "全栈开发工程师",
      date: "2023.03 - 2024.01",
      icon: Trophy,
      color: "bg-yellow-500",
      images: imageMap["自主创业"],
      caption: "自主创业经历"
    },
    {
      id: 3,
      company: "湖南农业大学",
      position: "实验室助理 / 前端开发",
      description: "在湖南农业大学信息科学技术学院实验室工作，负责实验室网站的开发与维护，以及相关科研项目的前端开发工作。参与了农业大数据平台的前端开发，使用 React + D3.js 构建了数据可视化图表，展示农业生产数据。",
      startDate: "2024-03-01",
      endDate: "2024-06-30",
      title: "实验室助理 / 前端开发",
      date: "2024.03 - 2024.06",
      icon: Terminal,
      color: "bg-red-500",
      images: imageMap["湖南农业大学"],
      caption: "实验室工作"
    },
    {
      id: 4,
      company: "开源社区 / Trae",
      position: "前端开发工程师",
      description: "参与开源社区贡献，主要负责 Trae AI 开发助手的前端开发工作。使用 React + TypeScript + Tailwind CSS 构建了现代化的 Web 界面，实现了代码编辑、实时协作、AI 辅助开发等核心功能。优化了界面的响应速度和用户体验，提升了产品的易用性。",
      startDate: "2024-07-01",
      endDate: "2024-12-31",
      title: "前端开发工程师",
      date: "2024.07 - 2024.12",
      icon: Code,
      color: "bg-blue-500",
      images: imageMap["开源社区 / Trae"],
      caption: "开源社区贡献"
    }
  ];

  useEffect(() => {
    // 使用本地数据
    setExperiences(localExperiences);

    // 可选：尝试从后端获取最新数据，失败则使用本地数据
    const fetchExperiences = async () => {
      try {
        const response = await axios.get('/api/experiences');
        const formattedData = response.data.map((exp: any) => ({
          ...exp,
          title: exp.position,
          date: `${new Date(exp.startDate).getFullYear()}.${(new Date(exp.startDate).getMonth() + 1).toString().padStart(2, '0')} - ${exp.endDate ? `${new Date(exp.endDate).getFullYear()}.${(new Date(exp.endDate).getMonth() + 1).toString().padStart(2, '0')}` : '至今'}`,
          // Map visuals based on company name for now
          icon: iconMap[exp.company] || Code,
          color: colorMap[exp.company] || "bg-gray-500",
          images: imageMap[exp.company] || [],
          caption: exp.description.substring(0, 10) + "..."
        }));
        setExperiences(formattedData);
      } catch (error) {
        console.log('使用本地经历数据');
        // 保持使用本地数据
      }
    };

    fetchExperiences();
  }, []);

  const displayedExperiences = showAll ? experiences : experiences.slice(0, ITEMS_PER_PAGE);

  return (
    <section id="experience" className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">经历与实践</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            在不同领域的探索与实践，塑造了今天的我
          </p>
        </motion.div>

        {/* Desktop Timeline */}
        <div className="hidden md:block relative max-w-6xl mx-auto">
          {/* Vertical Center Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full opacity-30"></div>
          
          <AnimatePresence mode='wait'>
            {displayedExperiences.map((exp, index) => (
              <TimelineItem key={exp.company + index} data={exp} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden max-w-lg mx-auto">
          <AnimatePresence mode='wait'>
            {displayedExperiences.map((exp, index) => (
               <MobileTimelineItem key={exp.company + index} data={exp} index={index} />
            ))}
          </AnimatePresence>
        </div>


        {/* Show More Button */}
        {experiences.length > ITEMS_PER_PAGE && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12 relative z-10"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-all transform hover:scale-105 flex items-center mx-auto border border-gray-100 dark:border-gray-700"
            >
              {showAll ? (
                <>
                  收起 <ChevronUp className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  查看更多经历 <ChevronDown className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};
