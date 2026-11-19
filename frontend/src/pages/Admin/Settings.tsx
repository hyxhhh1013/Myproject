import { useState, useEffect } from 'react';
import { Loader2, Save, Eye, EyeOff, Settings as SettingsIcon, Key } from 'lucide-react';
import { message as toast } from 'antd';
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
      toast.success('网站配置已保存');
      setMessage(null);
    } catch (error) {
      console.error('Failed to save config:', error);
      toast.error('保存失败，请重试');
      setMessage({ type: 'error', text: '保存失败，请重试' });
    } finally {
      setConfigSaving(false);
    }
  };

  // 修改密码
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: 'error', text: '请填写所有密码字段' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码至少需要 6 位字符' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的新密码不一致' });
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      setMessage({ type: 'error', text: '新密码不能与当前密码相同' });
      return;
    }

    try {
      setPasswordLoading(true);
      await axios.put('/api/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      toast.success('密码修改成功，即将跳转至登录页');
      setMessage({ type: 'success', text: '密码修改成功，即将跳转至登录页' });
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1800);
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } } };
      const errorMsg = errObj.response?.data?.message || '修改密码失败，请重试';
      toast.error(errorMsg);
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between border-b border-[#E6E2D8] dark:border-[#262522]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab('site'); setMessage(null); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'site'
                ? 'border-[#8A6F48] text-[#141413] dark:border-[#C8A97E] dark:text-[#F0EFEA]'
                : 'border-transparent text-[#6E6A63] hover:text-[#141413] dark:text-[#9E9A92] dark:hover:text-[#F0EFEA]'
            }`}
          >
            <SettingsIcon size={16} className="text-[#8A6F48] dark:text-[#C8A97E]" />
            网站配置
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('password'); setMessage(null); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'border-[#8A6F48] text-[#141413] dark:border-[#C8A97E] dark:text-[#F0EFEA]'
                : 'border-transparent text-[#6E6A63] hover:text-[#141413] dark:text-[#9E9A92] dark:hover:text-[#F0EFEA]'
            }`}
          >
            <Key size={16} className="text-[#8A6F48] dark:text-[#C8A97E]" />
            账户安全
          </button>
        </div>
        <span className="hidden sm:inline text-[11px] font-mono text-[#8C877E]">
          SYSTEM // {activeTab === 'site' ? 'SITE CONFIG' : 'SECURITY'}
        </span>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl border text-sm ${
          message.type === 'success'
            ? 'bg-emerald-50/80 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50/80 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* 选项卡内容 */}
      {activeTab === 'site' ? (
        <form onSubmit={handleConfigSubmit} className="space-y-5">
          {configLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-7 h-7 animate-spin text-[#8A6F48]" />
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-[#161614] p-6 rounded-xl border border-[#E6E2D8] dark:border-[#262522] space-y-5">
                <div>
                  <label htmlFor="siteTitle" className="block text-sm font-medium text-[#141413] dark:text-[#F0EFEA] mb-1.5">
                    网站标题 *
                  </label>
                  <input
                    type="text"
                    id="siteTitle"
                    name="siteTitle"
                    value={config.siteTitle}
                    onChange={handleConfigChange}
                    placeholder="例如：奕轩.Dev"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] dark:bg-[#1D1D1A] border border-[#E6E2D8] dark:border-[#2B2A26] rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                    required
                  />
                  <p className="text-xs text-[#8C877E] mt-1.5">用于浏览器标签页标题与搜索引擎展示</p>
                </div>

                <div>
                  <label htmlFor="seoKeywords" className="block text-sm font-medium text-[#141413] dark:text-[#F0EFEA] mb-1.5">
                    SEO 关键词 *
                  </label>
                  <textarea
                    id="seoKeywords"
                    name="seoKeywords"
                    value={config.seoKeywords}
                    onChange={handleConfigChange}
                    placeholder="例如：黄奕轩, FDE, AI 全栈开发, Agent, RAG"
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] dark:bg-[#1D1D1A] border border-[#E6E2D8] dark:border-[#2B2A26] rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                    required
                  />
                  <p className="text-xs text-[#8C877E] mt-1.5">核心检索词，以英文逗号分隔</p>
                </div>

                <div>
                  <label htmlFor="seoDescription" className="block text-sm font-medium text-[#141413] dark:text-[#F0EFEA] mb-1.5">
                    SEO 站点简介 *
                  </label>
                  <textarea
                    id="seoDescription"
                    name="seoDescription"
                    value={config.seoDescription}
                    onChange={handleConfigChange}
                    placeholder="例如：黄奕轩个人主页，展示 AI 全栈工程项目、研究实践与摄影作品"
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] dark:bg-[#1D1D1A] border border-[#E6E2D8] dark:border-[#2B2A26] rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                    required
                  />
                  <p className="text-xs text-[#8C877E] mt-1.5">搜索引擎结果摘要展示的站点描述</p>
                </div>

                <div>
                  <label htmlFor="icpCode" className="block text-sm font-medium text-[#141413] dark:text-[#F0EFEA] mb-1.5">
                    ICP 备案号
                  </label>
                  <input
                    type="text"
                    id="icpCode"
                    name="icpCode"
                    value={config.icpCode || ''}
                    onChange={handleConfigChange}
                    placeholder="例如：湘ICP备xxxxxxxx号（选填）"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] dark:bg-[#1D1D1A] border border-[#E6E2D8] dark:border-[#2B2A26] rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                  />
                  <p className="text-xs text-[#8C877E] mt-1.5">展示于站点页脚的备案编号（可留空）</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={configSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#141413] dark:bg-[#F0EFEA] text-[#FAF9F5] dark:text-[#141413] hover:opacity-90 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                >
                  {configSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {configSaving ? '保存中...' : '保存配置'}
                </button>
              </div>
            </>
          )}
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div className="bg-white dark:bg-[#161614] p-6 rounded-xl border border-[#E6E2D8] dark:border-[#262522] space-y-5">
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-[#141413] dark:text-[#F0EFEA] mb-1.5">
                当前密码 *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  id="oldPassword"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="请输入当前登录密码"
                  className="w-full px-3.5 py-2.5 pr-11 bg-[#FAF9F5] dark:bg-[#1D1D1A] border border-[#E6E2D8] dark:border-[#2B2A26] rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877E] hover:text-[#141413] dark:hover:text-[#F0EFEA]"
                >
                  {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-[#141413] dark:text-[#F0EFEA] mb-1.5">
                新密码 *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="设置新密码（至少 6 位字符）"
                  className="w-full px-3.5 py-2.5 pr-11 bg-[#FAF9F5] dark:bg-[#1D1D1A] border border-[#E6E2D8] dark:border-[#2B2A26] rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877E] hover:text-[#141413] dark:hover:text-[#F0EFEA]"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-[#8C877E] mt-1.5">新密码不能与当前密码相同，建议包含字母与数字</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#141413] dark:text-[#F0EFEA] mb-1.5">
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
                  className="w-full px-3.5 py-2.5 pr-11 bg-[#FAF9F5] dark:bg-[#1D1D1A] border border-[#E6E2D8] dark:border-[#2B2A26] rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877E] hover:text-[#141413] dark:hover:text-[#F0EFEA]"
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-[#8C877E]">
              修改密码后将自动跳转至登录页，请使用新密码重新登录。
            </p>
            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#141413] dark:bg-[#F0EFEA] text-[#FAF9F5] dark:text-[#141413] hover:opacity-90 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 shrink-0"
            >
              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {passwordLoading ? '提交中...' : '更新密码'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;