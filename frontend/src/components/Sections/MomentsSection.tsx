import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';

import { MessageSquare, Heart, MapPin, X } from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { Modal } from '../Modal';
import { ImageWithFallback } from '../UI/ImageWithFallback';
import { getImageUrl } from '../../utils/imageUtils';

interface Moment {
  id: number;
  content: string;
  images: string | null;
  location: string | null;
  likes: number;
  createdAt: string;
}

export function MomentsSection() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userLikes, setUserLikes] = useState<Record<number, boolean>>({});
  const [likingId, setLikingId] = useState<number | null>(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Using centralized getImageUrl from utils

  const handleCardClick = (moment: Moment) => {
    setSelectedMoment(moment);
    setShowModal(true);
  };

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const fetchMoments = async () => {
      try {
        const response = await axios.get('/api/moments?isVisible=true');
        setMoments(response.data.data);
      } catch (error) {
        console.error('获取动态失败:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/users/1');
        const data = response.data?.data || response.data;
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchMoments();
    fetchProfile();
  }, []);

  // 锁定背景滚动
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  useEffect(() => {
    const savedLikes = localStorage.getItem('userMomentLikes');
    if (savedLikes) {
      setUserLikes(JSON.parse(savedLikes));
    }
  }, []);

  const handleLike = async (id: number) => {
    if (!id) {
      console.error('Invalid moment ID:', id);
      return;
    }
    
    if (userLikes[id] || likingId === id) {
      return;
    }

    setLikingId(id);
    try {
      const url = `/api/moments/${id}/likes`;
      const response = await axios.post(url);
      
      if (response.data && (response.data.success || response.data.status === 'success')) {
        const updatedMoment = response.data.data;
        const newLikes = updatedMoment?.likes || ((selectedMoment?.likes || 0) + 1);

        // 更新列表中的赞数
        setMoments(prev => prev.map(m => m.id === id ? { ...m, likes: newLikes } : m));
        
        // 如果当前弹窗打开的是这个动态，同步更新弹窗数据
        if (selectedMoment && selectedMoment.id === id) {
          setSelectedMoment(prev => prev ? { ...prev, likes: newLikes } : null);
        }
        
        // 记录用户已点赞
        setUserLikes(prev => {
          const updated = { ...prev, [id]: true };
          localStorage.setItem('userMomentLikes', JSON.stringify(updated));
          return updated;
        });
      } else {
        console.error('Like failed:', response.data);
        alert('点赞失败，服务器返回错误。');
      }
    } catch (error: any) {
      console.error('Like API error:', error);
      const msg = error.response?.data?.message || error.message;
      alert('点赞失败: ' + msg);
    } finally {
      setLikingId(null);
    }
  };

  if (loading) return (
    <div className="interest-card moment-widget border-2 border-gray-200/50 dark:border-gray-700/30 p-8 flex justify-center items-center">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const displayMoments = isExpanded ? moments : (moments || []).slice(0, isMobile ? 2 : 3);

  return (
    <section id="moments" className="py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-bold mb-4">
            <MessageSquare className="w-4 h-4" />
            生活见解
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">生活见解 & 碎碎念</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">记录生活中的点滴感悟与瞬间，分享那些不经意间的思考。</p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayMoments.map((moment, index) => (
                <motion.div
                  key={moment.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => handleCardClick(moment)}
                  className="interest-card group cursor-pointer border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full p-6 rounded-3xl"
                >
                  {/* Header: User Info */}
                  <div className="flex items-start gap-3 mb-4">
                    {profile?.avatar ? (
                      <ImageWithFallback 
                        src={getImageUrl(profile.avatar)} 
                        alt="avatar" 
                        className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-700"
                        containerClassName="w-10 h-10 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">{profile?.name || 'Me'}</h4>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                          {new Date(moment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-purple-500" />
                        <span className="truncate">{moment.location || '未知地点'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 mb-4 overflow-hidden">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap text-justify">
                      {moment.content}
                    </p>
                  </div>

                  {/* Images Preview */}
                  {moment.images && (() => {
                    try {
                      const images = JSON.parse(moment.images);
                      if (!images || images.length === 0) return null;
                      
                      return (
                        <div className={`grid gap-1 mb-4 rounded-xl overflow-hidden ${
                          images.length === 1 ? 'grid-cols-1' : 
                          images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                        }`}>
                          {images.slice(0, 3).map((img: string, idx: number) => {
                              const fullImageUrl = getImageUrl(img);
                              const thumbnailUrl = img.replace(/(\.[^.]+)$/, '-thumbnail$1');
                              const fullThumbnailUrl = getImageUrl(thumbnailUrl);
                              
                              return (
                                <div key={idx} className="aspect-square relative overflow-hidden">
                                  <ImageWithFallback 
                                    src={fullImageUrl} 
                                    thumbnailSrc={fullThumbnailUrl}
                                    alt="moment" 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                  />
                                  {idx === 2 && images.length > 3 && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">
                                      +{images.length - 3}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      );
                    } catch (e) {
                      console.error('Failed to parse moment images:', e);
                      return null;
                    }
                  })()}

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                        <Heart className={`w-3.5 h-3.5 ${userLikes[moment.id] ? 'fill-pink-500 text-pink-500' : ''}`} />
                        <span>{moment.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>详情</span>
                      </div>
                    </div>
                    <div className="text-purple-600 dark:text-purple-400 text-[11px] font-bold group-hover:translate-x-1 transition-transform">
                      阅读全文 →
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination / Load More */}
          {moments.length > (isMobile ? 2 : 3) && (
            <div className="mt-12 flex justify-center">
              <motion.button
                onClick={handleExpandClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-full text-sm font-bold shadow-sm hover:shadow-xl transition-all"
              >
                {isExpanded ? '收起动态' : `查看更多 (${moments.length - (isMobile ? 2 : 3)})`}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* 二级窗口 */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} maxWidth="max-w-xl">
        {selectedMoment && (
          <div className="flex flex-col bg-white dark:bg-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {profile?.avatar ? (
                  <ImageWithFallback 
                    src={getImageUrl(profile.avatar)} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-600"
                    containerClassName="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500" />
                )}
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{profile?.name || 'Me'}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(selectedMoment.createdAt).toLocaleString('zh-CN', { 
                      year: 'numeric', month: 'long', day: 'numeric', 
                      hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="text-gray-800 dark:text-gray-200 text-base md:text-lg leading-relaxed whitespace-pre-wrap mb-6">
                {selectedMoment.content}
              </div>

              {selectedMoment.images && (
                <div className={`grid gap-2 mb-6 ${
                  JSON.parse(selectedMoment.images).length === 1 ? 'grid-cols-1' : 
                  JSON.parse(selectedMoment.images).length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
                }`}>
                  {JSON.parse(selectedMoment.images).map((img: string, idx: number) => {
                    const fullImageUrl = getImageUrl(img);
                    return (
                      <motion.div 
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        className="relative rounded-xl overflow-hidden shadow-sm"
                      >
                        <ImageWithFallback 
                          src={fullImageUrl} 
                          alt="moment" 
                          className="w-full aspect-square object-cover" 
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Modal Footer Info */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {selectedMoment.location && (
                    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                      <MapPin className="w-3.5 h-3.5 text-purple-500" />
                      <span>{selectedMoment.location}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(selectedMoment.id);
                    }}
                    disabled={userLikes[selectedMoment.id] || likingId === selectedMoment.id}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border transition-all active:scale-95 ${
                      userLikes[selectedMoment.id] 
                        ? 'bg-pink-50 border-pink-100 text-pink-500 cursor-default' 
                        : likingId === selectedMoment.id
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-wait'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-pink-50 hover:border-pink-100 hover:text-pink-500'
                    }`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${likingId === selectedMoment.id ? 'animate-pulse' : ''}`} 
                      fill={userLikes[selectedMoment.id] ? 'currentColor' : 'none'} 
                    />
                    <span className="font-medium">
                      {likingId === selectedMoment.id ? '处理中...' : `${selectedMoment.likes} 次赞`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Action Area */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/30 flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="w-full max-w-xs py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                我知道了
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};
