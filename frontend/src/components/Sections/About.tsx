import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '../UI/ImageWithFallback';
import avatarImg from '../../assets/images/e8f47feeab5afd0a0fce8ab4f9373d09.jpg';

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

export const About = () => {
  const [profile, setProfile] = useState<any>({
    name: '黄奕轩',
    email: '2090862712@qq.com',
    location: '中国 · 长沙',
    bio: '湖南农业大学计算机科学与技术专业在读，预计 2028 年毕业。\n\n我是一个 AI 时代的创作者与实践者。从大一时接触 ChatGPT 开始，我就迷上了用 AI 工具提效，这些“超级伙伴”让我一个学生也能快速验证想法、落地项目。\n\n因此我坚信在不久的将来最流行的编程语言一定会是自然语言。\n\n此网站用来记录成长，也期待和更多人聊 AI 如何改变创造。'
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
    <section id="about" className="py-24 bg-white dark:bg-dark-surface transition-colors duration-300">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">关于我</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left: Avatar & Intro */}
          <motion.div
            className="lg:col-span-5 flex flex-col items-center text-center lg:text-left lg:items-start"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative mb-10 group">
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl relative z-10">
                <ImageWithFallback
                  src={avatarImg}
                  alt="Avatar"
                  className="transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl transform scale-110 group-hover:scale-125 transition-transform duration-700 -z-0"></div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              个人简介
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-lg whitespace-pre-line text-justify">
              {profile.bio}
            </p>
          </motion.div>

          {/* Right: Info Grid */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              <InfoItem icon={User} label="姓名" value={profile.name} />
              <InfoItem icon={Calendar} label="状态" value="2024级本科在读 / 可实习" />
              <InfoItem icon={Mail} label="邮箱" value={profile.email} href={`mailto:${profile.email}`} />
              <InfoItem icon={MapPin} label="现居地" value={profile.location} />
              <InfoItem icon={ExternalLink} label="经验" value="具备真实项目落地经验" />
              <InfoItem icon={User} label="MBTI" value="ENFJ" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
