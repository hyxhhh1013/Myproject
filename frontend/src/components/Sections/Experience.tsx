import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { Briefcase, Calendar, Maximize2 } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { getImageUrl } from '../../utils/imageUtils';

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
};

const calculateDuration = (startDate: string, endDate?: string | null) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years > 0 && remainingMonths > 0) {
    return `${years}年${remainingMonths}个月`;
  } else if (years > 0) {
    return `${years}年`;
  } else {
    return `${Math.max(remainingMonths, 1)}个月`;
  }
};

export const Experience = () => {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<any[]>([]);

  const openLightbox = (images: string[], index: number) => {
    setLightboxSlides(images.map(img => ({ src: img })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/experience');
      const data = response.data || [];
      
      const visibleExperiences = data
          .filter((exp: any) => exp.isVisible !== false)
          .map((exp: any) => ({
            ...exp,
            images: exp.images && exp.images.length > 0 ? exp.images.map((img: string) => getImageUrl(img)) : [],
            thumbnailImages: exp.thumbnailImages && exp.thumbnailImages.length > 0 ? exp.thumbnailImages.map((img: string) => getImageUrl(img)) : []
          }))
          .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      setExperiences(visibleExperiences);
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
      // 提供默认的本地数据作为 fallback
        setExperiences([
          {
            id: 1,
            company: '科技创新有限公司',
            position: '高级全栈工程师',
            startDate: '2021-07-01',
            endDate: null,
            description: '负责公司核心产品的架构设计和开发，带领5人团队完成多个关键项目。',
            isVisible: true,
            images: []
          },
          {
            id: 2,
            company: '互联网初创企业',
            position: '前端开发工程师',
            startDate: '2020-01-01',
            endDate: '2021-06-30',
            description: '负责公司官网和移动端H5页面的开发，优化前端性能。',
            isVisible: true,
            images: []
          }
        ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
    
    // 监听localStorage变化，当经历数据更新时刷新
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'experienceUpdated') {
        fetchExperiences();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return (
      <section id="experience" className="py-12 sm:py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">加载中...</div>
        </div>
      </section>
    );
  }

  if (experiences.length === 0) {
    return null;
  }

  return (
    <section id="experience" className="py-12 sm:py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">个人经历</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            我的成长历程与足迹
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-10"
              >
                <div className="absolute left-3 top-5 w-3 h-3 rounded-full bg-blue-500 border-3 border-white dark:border-gray-900 z-10" />
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        {exp.position}
                      </h3>
                      <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {exp.company}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : '至今'}</span>
                    </div>
                    <span className="px-1.5 sm:px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {calculateDuration(exp.startDate, exp.endDate)}
                    </span>
                  </div>
                  
                  {exp.description && (
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed mb-3 sm:mb-4">
                      {exp.description}
                    </div>
                  )}

                  {/* Images Gallery */}
                  {exp.images && exp.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                      {exp.images.map((img: string, imgIndex: number) => (
                        <div 
                          key={imgIndex} 
                          className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                          onClick={() => openLightbox(exp.images, imgIndex)}
                        >
                          <img 
                            src={exp.thumbnailImages && exp.thumbnailImages[imgIndex] ? exp.thumbnailImages[imgIndex] : img} 
                            alt={`${exp.position} photo ${imgIndex + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lightbox for viewing images */}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={lightboxSlides}
          plugins={[Captions]}
        />
      </div>
    </section>
  );
};
