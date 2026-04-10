import { useState } from 'react';
import { Loader2, Save, Eye, EyeOff } from 'lucide-react';
import axios from '../../utils/axiosConfig';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">修改密码</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">更改您的账户密码保护账户安全</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800'
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? '修改中...' : '修改密码'}
          </button>
        </div>
      </form>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>提示:</strong> 修改密码后，会程动需改登录和重新索汗。为了您的账户安全，会程动每30天宝需修改一次密码。
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
