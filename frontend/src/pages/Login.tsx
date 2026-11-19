import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      const { token, ...user } = response.data.data;
      login(token, user);

      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5] dark:bg-[#0D0D0C] text-[#141413] dark:text-[#F0EFEA] px-4 font-sans transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#161614] border border-[#E6E2D8] dark:border-[#262522] rounded-2xl shadow-sm p-8 sm:p-10">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8C877E] hover:text-[#8A6F48] transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回个人门户首页</span>
          </Link>

          <div className="text-[11px] font-mono uppercase tracking-widest text-[#8A6F48] dark:text-[#C8A97E] mb-2">
            STUDIO CMS // AUTHENTICATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight">
            管理员登录
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A63] dark:text-[#9E9A92] mt-1.5">
            验证身份后进入内容与摄影画廊控制台
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#6E6A63] dark:text-[#A8A39A] mb-1.5">
              邮箱账号 · EMAIL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-[#8C877E]" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-[#E6E2D8] dark:border-[#2C2B27] rounded-xl bg-[#FAF9F5] dark:bg-[#1E1D1A] text-[#141413] dark:text-[#F0EFEA] focus:outline-none focus:border-[#8A6F48] transition-colors"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#6E6A63] dark:text-[#A8A39A] mb-1.5">
              登录密码 · PASSWORD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[#8C877E]" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-[#E6E2D8] dark:border-[#2C2B27] rounded-xl bg-[#FAF9F5] dark:bg-[#1E1D1A] text-[#141413] dark:text-[#F0EFEA] focus:outline-none focus:border-[#8A6F48] transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-xs font-mono font-semibold text-[#FAF9F5] dark:text-[#141413] bg-[#141413] dark:bg-[#F0EFEA] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                正在验证身份...
              </>
            ) : (
              '进入 STUDIO 后台 →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
