import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Github, Linkedin, Mail, MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';

export const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    content: ''
  });
  
  // Re-write form using name attributes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.content) {
        message.warning('请填写必要信息');
        return;
    }
    
    setLoading(true);
    try {
        await axios.post('/messages', formData);
        message.success('消息发送成功！');
        setFormData({ name: '', email: '', subject: '', content: '' });
    } catch (error) {
        console.error('Send message failed:', error);
        message.error('发送失败，请稍后重试');
    } finally {
        setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
      {/* Background Map Decoration (Abstract) */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
         </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">联系我</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            有项目合作、招聘需求或单纯聊天，都欢迎联系我！
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left: Socials & Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center space-y-8"
          >
             <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                让我们开始对话
             </h3>
             <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                无论是项目合作、技术探讨，还是单纯的交个朋友，我都非常欢迎。
                您可以通过下方的表单发送邮件，或者通过社交媒体找到我。
             </p>

             <div className="flex flex-col space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail className="w-5 h-5 mr-3 text-blue-600" />
                  <span>2090862712@qq.com</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                  <span>中国，长沙</span>
                </div>
             </div>

             <div className="flex space-x-6 pt-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg hover:text-blue-600 dark:hover:text-blue-400 transition-all transform hover:scale-110 group">
                   <Github className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg hover:text-blue-700 dark:hover:text-blue-500 transition-all transform hover:scale-110 group">
                   <Linkedin className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-500" />
                </a>
                <a href="mailto:2090862712@qq.com" className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg hover:text-green-600 dark:hover:text-green-400 transition-all transform hover:scale-110 group">
                   <Send className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400" />
                </a>
             </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">姓名</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
                    placeholder="您的称呼" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邮箱</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
                    placeholder="your@email.com" 
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">主题</label>
                <input 
                    type="text" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
                    placeholder="您想聊什么？" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">消息</label>
                <textarea 
                    rows={4} 
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
                    placeholder="详细内容..."
                    required
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />} 
                发送消息
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
