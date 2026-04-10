import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '../UI/ImageWithFallback';


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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/users/1');
        const data = response.data?.data || response.data;
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <section id="about" className="py-12 sm:py-24 bg-white dark:bg-dark-surface transition-colors duration-300">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">加载中...</div>
        </div>
      </section>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <section id="about" className="py-12 sm:py-24 bg-white dark:bg-dark-surface transition-colors duration-300">
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
                  src={profile?.avatar ? (profile.avatar.startsWith('http') ? profile.avatar : `${axios.defaults.baseURL || ''}${profile.avatar.startsWith('/') ? '' : '/'}${profile.avatar}`) : ""}
                  thumbnailSrc={profile?.avatarThumbnail ? (profile.avatarThumbnail.startsWith('http') ? profile.avatarThumbnail : `${axios.defaults.baseURL || ''}${profile.avatarThumbnail.startsWith('/') ? '' : '/'}${profile.avatarThumbnail}`) : (profile?.avatar ? (profile.avatar.startsWith('http') ? profile.avatar : `${axios.defaults.baseURL || ''}${profile.avatar.startsWith('/') ? '' : '/'}${profile.avatar}`) : "")}
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
              {profile?.bio || '暂无简介'}
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
              <InfoItem icon={User} label="姓名" value={profile?.name || '未设置'} />
              <InfoItem icon={Calendar} label="状态" value={profile?.title || '2024级本科在读 / 可实习'} />
              <InfoItem icon={Mail} label="邮箱" value={profile?.email || '未设置'} href={profile?.email ? `mailto:${profile.email}` : undefined} />
              <InfoItem icon={MapPin} label="现居地" value={profile?.location || '未设置'} />
              <InfoItem icon={ExternalLink} label="经验" value="具备真实项目落地经验" />
              <InfoItem icon={User} label="MBTI" value="ENFJ" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
