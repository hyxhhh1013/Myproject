import { useState, useEffect } from 'react';
import { Loader2, Save, Eye, EyeOff, Settings as SettingsIcon, Key } from 'lucide-react';
import axios from '../../utils/axiosConfig';

interface SiteConfig {
  id?: number;
  siteTitle: string;
  seoKeywords: string;
  seoDescription: string;
  icpCode?: string;
}

const Settings = () => {
  // 选项卡状态
  const [activeTab, setActiveTab] = useState<'site' | 'password'>('site');
  
  // 主页配置状态
  const [config, setConfig] = useState<SiteConfig>({
    siteTitle: '',
    seoKeywords: '',
    seoDescription: '',
    icpCode: ''
  });
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  
  // 修改密码状态
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  
  // 消息状态
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 获取网站配置
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setConfigLoading(true);
      const response = await axios.get('/api/siteConfig');
      const data = response.data?.data || response.data;
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
      setMessage({ type: 'error', text: '获取配置失败' });
    } finally {
      setConfigLoading(false);
    }
  };

  // 处理配置变更
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理密码变更
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 保存配置
  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setConfigSaving(true);
      await axios.put(`/api/siteConfig`, config);
      setMessage({ type: 'success', text: '配置已保存' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage({ type: 'error', text: '保存失败，请重试' });
    } finally {
      setConfigSaving(false);
    }
  };

  // 修改密码
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: 'error', text: '请填写所有字段' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码需要至少6个字母' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的密码不一致' });
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      setMessage({ type: 'error', text: '新密码不能与会故密码相同' });
      return;
    }

    try {
      setPasswordLoading(true);
      await axios.put('/api/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      setMessage({ type: 'success', text: '密码修改成功，请重新登录' });
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        // Redirect to login
        window.location.href = '/login';
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || '修改密码失败，请重试';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">设置</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">配置网站信息和账户安全</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* 选项卡导航 */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('site')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'site' ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          <SettingsIcon size={18} />
          网站配置
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'password' ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          <Key size={18} />
          修改密码
        </button>
      </div>

      {/* 选项卡内容 */}
      {activeTab === 'site' ? (
        <form onSubmit={handleConfigSubmit} className="space-y-6">
          {configLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Site Title */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <label htmlFor="siteTitle" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  网站标题 *
                </label>
                <input
                  type="text"
                  id="siteTitle"
                  name="siteTitle"
                  value={config.siteTitle}
                  onChange={handleConfigChange}
                  placeholder="例如: 奋辉.Dev"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">网站的主体标题，用于浏览器选项卡和SEO</p>
              </div>

              {/* SEO Keywords */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <label htmlFor="seoKeywords" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  SEO关键词 *
                </label>
                <textarea
                  id="seoKeywords"
                  name="seoKeywords"
                  value={config.seoKeywords}
                  onChange={handleConfigChange}
                  placeholder="例如: 个人网站,全栈开发,React,Node.js"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">你的核心关键词，以逗号分隔</p>
              </div>

              {/* SEO Description */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <label htmlFor="seoDescription" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  SEO描述 *
                </label>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={config.seoDescription}
                  onChange={handleConfigChange}
                  placeholder="例如: 奋辉的个人网站，展示个人作品、技术与技术希望"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">搜索引擎结果中所夺的描述</p>
              </div>

              {/* ICP Code */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <label htmlFor="icpCode" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  ICP备案事业号
                </label>
                <input
                  type="text"
                  id="icpCode"
                  name="icpCode"
                  value={config.icpCode || ''}
                  onChange={handleConfigChange}
                  placeholder="例如: 豆ICP备123456789号"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">中国大陆网站的ICP备案事业号（可不填）</p>
              </div>

              {/* Save Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={configSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {configSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {configSaving ? '保存中...' : '保存配置'}
                </button>
              </div>
            </>
          )}
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          {/* Old Password */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <label htmlFor="oldPassword" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              旧密码 *
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? 'text' : 'password'}
                id="oldPassword"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handlePasswordChange}
                placeholder="输入你的旧密码"
                className="w-full px-4 py-2 pr-12 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">为了安全起见，我们需要你确认会故密码</p>
          </div>

          {/* New Password */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              新密码 *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handlePasswordChange}
                placeholder="设置新密码（至少6个字母）"
                className="w-full px-4 py-2 pr-12 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">密码不能伴旧密码相同，且至少6个字母</p>
          </div>

          {/* Confirm Password */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              确认新密码 *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="再次输入新密码"
                className="w-full px-4 py-2 pr-12 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {passwordLoading ? '修改中...' : '修改密码'}
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>提示:</strong> 修改密码后，会程动需改登录和重新索汗。为了您的账户安全，会程动每30天宝需修改一次密码。
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;