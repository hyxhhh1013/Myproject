import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import axios from '../../utils/axiosConfig';

interface SiteConfig {
  id?: number;
  siteTitle: string;
  seoKeywords: string;
  seoDescription: string;
  icpCode?: string;
}

const HomePageManagement = () => {
  const [config, setConfig] = useState<SiteConfig>({
    siteTitle: '',
    seoKeywords: '',
    seoDescription: '',
    icpCode: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/siteConfig');
      const data = response.data?.data || response.data;
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
      setMessage({ type: 'error', text: '获取配置失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      // Backend uses PUT /api/siteConfig or PUT /api/site-config for update (checking index.ts, it mounts at /api/siteConfig)
      await axios.put(`/api/siteConfig`, config);
      setMessage({ type: 'success', text: '配置已保存' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage({ type: 'error', text: '保存失败，请重试' });
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">主页配置</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">配置网站的基本信息和SEO宣传</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
            placeholder="例如: 豆ICP备123456789号"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <p className="text-xs text-gray-500 mt-2">中国大陆网站的ICP备案事业号（可不填）</p>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HomePageManagement;
