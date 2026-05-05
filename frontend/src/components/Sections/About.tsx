import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '../UI/ImageWithFallback';
import avatarImg from '../../assets/images/e8f47feeab5afd0a0fce8ab4f9373d09.jpg';
import { useI18n } from '../../i18n/i18nContext';

const InfoItem = ({ icon: Icon, label, value, href }: any) => (
  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800">
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 mr-4">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      {href ? (
        <a href={href} className="text-gray-800 dark:text-gray-200 font-medium hover:text-blue-600 transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-gray-800 dark:text-gray-200 font-medium">{value}</p>
      )}
    </div>
  </div>
);

import { NowComponent } from '../UI/NowComponent';
import { TechStackMarquee } from '../UI/TechStackMarquee';
import { TimeZoneComponent } from '../UI/TimeZoneComponent';
import { GearComponent } from '../UI/GearComponent';

export const About = () => {
  const { t } = useI18n();
  const [profile, setProfile] = useState<any>({
    name: '黄奕轩',
    email: '2090862712@qq.com',
    location: '中国 · 长沙',
    bio: '湖南农业大学计算机科学与技术专业在读，预计 2028 年毕业。\n\n我是一个 AI 时代的创作者与实践者。从大一时接触 ChatGPT 开始，我就迷上了用 AI 工具提效，这些“超级伙伴”让我一个学生也能快速验证想法、落地项目。\n\n因此我坚信在不久的将来最流行的编程语言一定会是自然语言。\n\n此网站用来记录成长，也期待和更多人聊 AI 如何改变创造力。'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/profile');
        // Backend returns an object with user details
        if (response.data) {
          setProfile({
            ...profile,
            ...response.data,
            // If backend bio is short, keep the long default one for now or use it
            bio: response.data.bio && response.data.bio.length > 50 ? response.data.bio : profile.bio
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <section id="about" className="py-24 bg-white/5 dark:bg-dark-surface transition-colors duration-300">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">{t('about.title')}</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* 第一行 */}
          <div className="md:col-span-1">
            {/* 拍立得风格照片 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card relative group overflow-hidden rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-xl h-full"
            >
              {/* 背景模糊图 */}
              <img 
                src={avatarImg} 
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50"
              />
              
              {/* 实际照片 - 悬停时稍微浮起 */}
              <div className="absolute inset-4 transition-all duration-500 group-hover:-rotate-2 group-hover:scale-105">
                <img 
                  src={avatarImg} 
                  className="w-full h-full object-cover rounded-xl shadow-2xl border-4 border-white/10"
                />
              </div>
              
              {/* 底部签名 */}
              <div className="absolute bottom-6 left-0 w-full text-center">
                <p className="font-handwriting text-2xl text-white/80 rotate-[-4deg]">{t('header.name')}</p>
              </div>
            </motion.div>
          </div>
          
          <div className="md:col-span-1">
            <NowComponent />
          </div>
          
          <div className="md:col-span-1">
            <TimeZoneComponent location={profile.location} />
          </div>

          {/* 第二行 */}
          <div className="md:col-span-1">
            {/* 学校信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl"
            >
              <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Education / 教育背景</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">湖南农业大学</h4>
                  <p className="text-gray-400 text-sm">计算机科学与技术专业</p>
                  <p className="text-gray-500 text-xs mt-1">2024级本科在读，预计2028年毕业</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="md:col-span-2">
            {/* Github数据占位 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl h-full"
            >
              <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">GitHub Stats / Github数据</h3>
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-400">GitHub 数据卡片将在此显示</p>
              </div>
            </motion.div>
          </div>

          {/* 第三行 */}
          <div className="md:col-span-3">
            <TechStackMarquee />
          </div>

          {/* 第四行 */}
          <div className="md:col-span-2">
            <GearComponent />
          </div>
          
          <div className="md:col-span-1">
            {/* 社交/联系信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl h-full"
            >
              <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Contact / 联系信息</h3>
              <div className="space-y-4">
                <InfoItem icon={Mail} label={t('about.info.email')} value={profile.email} href={`mailto:${profile.email}`} />
                <InfoItem icon={MapPin} label={t('about.info.location')} value={profile.location} />
                <InfoItem icon={ExternalLink} label={t('about.info.experience')} value="具备真实项目落地经验" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};



