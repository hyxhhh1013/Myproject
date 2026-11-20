import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Github, Mail, MapPin, Loader2, Copy, Check } from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { message } from 'antd';
import { useI18n } from '../../i18n/i18nContext';
import { playSuccessChime } from '../../utils/soundEffects';
import { useSiteProfile } from '../Layout/Footer';

export const Contact = React.memo(() => {
  const { t, td } = useI18n();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const profile = useSiteProfile();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    content: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    playSuccessChime();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.content) {
      message.warning(td('请填写姓名、邮箱和留言内容', 'Please fill in your name, email, and message'));
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/messages', {
        ...formData,
        subject: formData.subject || td('来自个人门户的留言', 'Website Contact Message'),
      });
      playSuccessChime();
      message.success(td('消息发送成功！我会尽快回复您。', 'Message sent! I will get back to you soon.'));
      setFormData({ name: '', email: '', subject: '', content: '' });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || td('发送失败，请稍后重试', 'Failed to send');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-14 sm:py-28 transition-colors duration-300 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto mb-8 sm:mb-12 pb-4 sm:pb-5 border-b designer-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4"
        >
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.16em] designer-accent-text mb-1.5 sm:mb-2">
              06 // CONTACT
            </div>
            <h2 className="designer-heading text-[30px] sm:text-[40px] md:text-5xl lg:text-[56px] font-medium leading-[1.08] tracking-[-0.025em]">
              {t('contact.title')}
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto items-start">
          {/* Left 5 Cols: Editorial Contact Ledger */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col justify-between space-y-6"
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight designer-text-primary">
                {t('contact.letsTalk')}
              </h3>
            </div>

            <div className="space-y-3 pt-2 border-t designer-hairline text-xs sm:text-sm font-mono">
              <div className="flex items-center justify-between flex-wrap gap-2 py-2 border-b designer-hairline">
                <span className="designer-text-muted flex items-center gap-2 shrink-0">
                  <Mail className="w-4 h-4 text-[#8A6F48] stroke-[1.5]" />
                  EMAIL
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${profile.email}`}
                    className="font-medium designer-text-primary hover:underline break-all"
                  >
                    {profile.email}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    aria-label="Copy Email Address"
                    className="p-1.5 rounded-md designer-pill hover:opacity-80 transition-opacity"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b designer-hairline">
                <span className="designer-text-muted flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#8A6F48] stroke-[1.5]" />
                  BASE
                </span>
                <span className="font-medium designer-text-primary">
                  {td(profile.location || '中国 · 湖南长沙', profile.locationEn || 'Changsha, Hunan, China')}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="designer-text-muted flex items-center gap-2">
                  <Github className="w-4 h-4 text-[#8A6F48] stroke-[1.5]" />
                  GITHUB
                </span>
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium designer-text-primary hover:underline"
                >
                  {profile.githubHandle}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right 7 Cols: Minimalist Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 designer-card p-5 sm:p-8 rounded-2xl"
          >
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider designer-text-muted mb-2">
                    {t('contact.form.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline focus:border-[#8A6F48] outline-none transition-all text-base sm:text-sm designer-text-primary"
                    placeholder={t('contact.form.name')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider designer-text-muted mb-2">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline focus:border-[#8A6F48] outline-none transition-all text-base sm:text-sm designer-text-primary"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider designer-text-muted mb-2">
                  {t('contact.form.subject')}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline focus:border-[#8A6F48] outline-none transition-all text-base sm:text-sm designer-text-primary"
                  placeholder={td('项目合作 / 实习邀请 / 技术交流', 'Collaboration / Internship / Tech Chat')}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider designer-text-muted mb-2">
                  {t('contact.form.message')}
                </label>
                <textarea
                  rows={4}
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline focus:border-[#8A6F48] outline-none transition-all text-base sm:text-sm designer-text-primary"
                  placeholder={td('请写下您想交流的内容...', 'Write your message here...')}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 designer-btn-primary font-mono font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 mr-2 stroke-[1.5]" />
                )}
                {t('contact.form.send')}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
});
