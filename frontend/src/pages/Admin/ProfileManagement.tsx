import { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Trash2, Edit, X, User, Mail, Phone, MapPin } from 'lucide-react';
import { message } from 'antd';
import axios from '../../utils/axiosConfig';

interface UserInfo {
  id: number;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  email: string;
  phone: string;
  location: string;
}

interface Contact {
  id: number;
  type: string;
  value: string;
}

interface SocialMedia {
  id: number;
  platform: string;
  url: string;
}

const contactTypes = [
  { value: 'email', label: '邮箱', icon: '📧' },
  { value: 'phone', label: '电话', icon: '📱' },
  { value: 'wechat', label: '微信', icon: '💬' },
  { value: 'qq', label: 'QQ', icon: '🐧' },
  { value: 'other', label: '其他', icon: '📌' },
];

const socialPlatforms = [
  { value: 'github', label: 'GitHub', icon: '🐙' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'weibo', label: '微博', icon: '📝' },
  { value: 'zhihu', label: '知乎', icon: '🔵' },
  { value: 'bilibili', label: 'B站', icon: '📺' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'other', label: '其他', icon: '🔗' },
];

const ProfileManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingSocial, setEditingSocial] = useState<SocialMedia | null>(null);
  
  const [contactForm, setContactForm] = useState({ type: 'email', value: '' });
  const [socialForm, setSocialForm] = useState({ platform: 'github', url: '' });
  const [submitting, setSubmitting] = useState(false);
  
  // 头像上传状态
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [userRes, contactsRes, socialRes] = await Promise.all([
        axios.get('/api/users/1'),
        axios.get('/api/contacts'),
        axios.get('/api/social-media'),
      ]);
      
      const userData = Array.isArray(userRes.data) ? userRes.data[0] : userRes.data?.data || userRes.data;
      setUserInfo(userData);
      
      const contactsData = Array.isArray(contactsRes.data) ? contactsRes.data : contactsRes.data?.data || [];
      setContacts(contactsData);
      
      const socialData = Array.isArray(socialRes.data) ? socialRes.data : socialRes.data?.data || [];
      setSocialMedia(socialData);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUserInfo = async () => {
    if (!userInfo) return;
    
    try {
      setSaving(true);
      await axios.put(`/api/users/${userInfo.id}`, {
        name: userInfo.name,
        title: userInfo.title,
        bio: userInfo.bio,
        avatar: userInfo.avatar,
        email: userInfo.email,
        phone: userInfo.phone,
        location: userInfo.location,
      });
      message.success('保存成功！');
    } catch (error) {
      console.error('Failed to save user info:', error);
      message.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenContactModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm({ type: contact.type, value: contact.value });
    } else {
      setEditingContact(null);
      setContactForm({ type: 'email', value: '' });
    }
    setShowContactModal(true);
  };

  const handleOpenSocialModal = (social?: SocialMedia) => {
    if (social) {
      setEditingSocial(social);
      setSocialForm({ platform: social.platform, url: social.url });
    } else {
      setEditingSocial(null);
      setSocialForm({ platform: 'github', url: '' });
    }
    setShowSocialModal(true);
  };

  const handleSaveContact = async () => {
    if (!contactForm.value.trim()) {
      message.warning('请填写联系方式');
      return;
    }

    try {
      setSubmitting(true);
      if (editingContact) {
        await axios.put(`/api/contacts/${editingContact.id}`, contactForm);
      } else {
        await axios.post('/api/contacts', { ...contactForm, userId: 1 });
      }
      await fetchData();
      setShowContactModal(false);
    } catch (error) {
      console.error('Failed to save contact:', error);
      message.error('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSocial = async () => {
    if (!socialForm.url.trim()) {
      message.warning('请填写链接地址');
      return;
    }

    try {
      setSubmitting(true);
      if (editingSocial) {
        await axios.put(`/api/social-media/${editingSocial.id}`, socialForm);
      } else {
        await axios.post('/api/social-media', { ...socialForm, userId: 1 });
      }
      await fetchData();
      setShowSocialModal(false);
    } catch (error) {
      console.error('Failed to save social media:', error);
      message.error('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (!window.confirm('确定要删除这个联系方式吗？')) return;
    try {
      await axios.delete(`/api/contacts/${id}`);
      setContacts(contacts.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete contact:', error);
      message.error('删除失败，请重试');
    }
  };

  const handleDeleteSocial = async (id: number) => {
    if (!window.confirm('确定要删除这个社交媒体吗？')) return;
    try {
      await axios.delete(`/api/social-media/${id}`);
      setSocialMedia(socialMedia.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete social media:', error);
      message.error('删除失败，请重试');
    }
  };

  // 处理头像上传
  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      message.warning('请上传有效的图片文件（JPG、PNG、WebP、GIF）');
      return;
    }

    // 检查文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      message.warning('图片大小不能超过2MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setUploadProgress(progress);
          }
        }
      });

      if (response.data?.url) {
        setUserInfo(prev => prev ? { ...prev, avatar: response.data.url } : null);
        setAvatarPreview(response.data.url);
        message.success('头像上传成功！');
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      message.error('头像上传失败，请重试');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">个人信息</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理您的个人资料和联系方式</p>
        </div>
        <button 
          onClick={handleSaveUserInfo}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={20} />}
          <span>保存更改</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              基本信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  姓名
                </label>
                <input
                  type="text"
                  value={userInfo?.name || ''}
                  onChange={(e) => setUserInfo(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="您的姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  职位/头衔
                </label>
                <input
                  type="text"
                  value={userInfo?.title || ''}
                  onChange={(e) => setUserInfo(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：全栈开发工程师"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  邮箱
                </label>
                <input
                  type="email"
                  value={userInfo?.email || ''}
                  onChange={(e) => setUserInfo(prev => prev ? { ...prev, email: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  电话
                </label>
                <input
                  type="tel"
                  value={userInfo?.phone || ''}
                  onChange={(e) => setUserInfo(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="您的电话号码"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  所在地
                </label>
                <input
                  type="text"
                  value={userInfo?.location || ''}
                  onChange={(e) => setUserInfo(prev => prev ? { ...prev, location: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：北京市"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  头像
                </label>
                <div className="flex flex-col space-y-3">
                  {/* 头像预览 */}
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                      <img 
                        src={avatarPreview || userInfo?.avatar || 'https://ui-avatars.com/api/?name=User&background=random'} 
                        alt="头像预览" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      {/* 头像链接输入 */}
                      <input
                        type="url"
                        value={userInfo?.avatar || ''}
                        onChange={(e) => {
                          setUserInfo(prev => prev ? { ...prev, avatar: e.target.value } : null);
                          setAvatarPreview(e.target.value);
                        }}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>
                  
                  {/* 上传按钮 */}
                  <div>
                    <label className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer">
                      {uploading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>上传中... {uploadProgress}%</span>
                        </div>
                      ) : (
                        <span>上传头像</span>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleAvatarUpload(e.target.files[0]);
                          }
                        }}
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP、GIF 格式，最大 2MB</p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  个人简介
                </label>
                <textarea
                  value={userInfo?.bio || ''}
                  onChange={(e) => setUserInfo(prev => prev ? { ...prev, bio: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="介绍一下自己..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">联系方式</h3>
              <button
                onClick={() => handleOpenContactModal()}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>{contactTypes.find(t => t.value === contact.type)?.icon || '📌'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {contactTypes.find(t => t.value === contact.type)?.label || contact.type}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{contact.value}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenContactModal(contact)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">暂无联系方式</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">社交媒体</h3>
              <button
                onClick={() => handleOpenSocialModal()}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {socialMedia.map((social) => (
                <div key={social.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>{socialPlatforms.find(p => p.value === social.platform)?.icon || '🔗'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {socialPlatforms.find(p => p.value === social.platform)?.label || social.platform}
                      </p>
                      <a 
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline truncate block max-w-[150px]"
                      >
                        {social.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenSocialModal(social)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSocial(social.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {socialMedia.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">暂无社交媒体</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingContact ? '编辑联系方式' : '添加联系方式'}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  类型
                </label>
                <select
                  value={contactForm.type}
                  onChange={(e) => setContactForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {contactTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  内容
                </label>
                <input
                  type="text"
                  value={contactForm.value}
                  onChange={(e) => setContactForm(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入联系方式"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveContact}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSocialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingSocial ? '编辑社交媒体' : '添加社交媒体'}
              </h3>
              <button
                onClick={() => setShowSocialModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  平台
                </label>
                <select
                  value={socialForm.platform}
                  onChange={(e) => setSocialForm(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {socialPlatforms.map(platform => (
                    <option key={platform.value} value={platform.value}>{platform.icon} {platform.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  链接地址
                </label>
                <input
                  type="url"
                  value={socialForm.url}
                  onChange={(e) => setSocialForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSocialModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveSocial}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;
