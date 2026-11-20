import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import { ChevronDown, ArrowUpRight, FileText, Copy, Check } from 'lucide-react';
import { ImageWithFallback } from '../UI/ImageWithFallback';
import axios from '../../utils/axiosConfig';
import { useI18n } from '../../i18n/i18nContext';
import { playSuccessChime } from '../../utils/soundEffects';

const GITHUB_AVATAR = 'https://avatars.githubusercontent.com/hyxhhh1013';

export const Hero: React.FC = () => {
  const { language, t, td } = useI18n();
  const [copied, setCopied] = useState(false);

  const [heroName, setHeroName] = useState<string>('黄奕轩');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get('/api/users/1');
        const userData = userResponse.data?.data || userResponse.data;
        if (userData && userData.name && userData.name !== '张三' && userData.name !== 'Admin') {
          setHeroName(userData.name);
        }
      } catch {
        // Keep default heroName
      }
    };

    fetchData();
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('hyxhhh1013@gmail.com');
    playSuccessChime();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section
      id="hero"
      className="designer-section-hero relative min-h-[100dvh] flex flex-col justify-between overflow-hidden pt-16 sm:pt-20 border-b designer-hairline transition-colors duration-300"
    >
      {/* Subtle Architectural Hairline Grid Frame aligned to max-w-7xl */}
      <div className="pointer-events-none absolute inset-0 max-w-7xl mx-auto border-x designer-hairline opacity-65" />

      {/* Center Editorial Manifesto Stage */}
      <div className="flex-1 flex items-center justify-center relative z-10 py-8 sm:py-20 lg:py-24">
        <div className="w-full max-w-3xl mx-auto px-5 sm:px-6 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center w-full"
          >
            {/* Centered Portrait Medallion + Whisper-Quiet Mono Eyebrow */}
            <div className="flex flex-col items-center mb-5 sm:mb-7">
              <div className="relative mb-4 sm:mb-5">
                <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full p-1 bg-[var(--bg-canvas)] border designer-hairline shadow-[0_6px_24px_rgba(20,20,19,0.06)]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#F3F1EC] dark:bg-[#22221F]">
                    <ImageWithFallback
                      src={GITHUB_AVATAR}
                      thumbnailSrc={GITHUB_AVATAR}
                      alt={heroName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span
                  className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-[3px] ring-[var(--bg-canvas)]"
                  title={td('可立即到岗', 'Available Now')}
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] sm:text-xs font-mono uppercase tracking-[0.12em] sm:tracking-[0.18em] designer-text-muted">
                <span className="text-[#8A6F48] dark:text-[#C8A97E]">00 // AI AGENT &amp; FDE</span>
                <span aria-hidden="true" className="opacity-35">/</span>
                <span>{td('可立即到岗 · 深 · 杭 · 长', 'AVAILABLE NOW · SZ / HZ / CS')}</span>
              </div>
            </div>

            {/* Giant Centered Editorial Headline */}
            <h1 className="designer-heading text-[2.5rem] sm:text-6xl lg:text-[72px] xl:text-[80px] font-normal tracking-[-0.025em] leading-[1.14] mb-5 sm:mb-7">
              <span className="designer-text-secondary/85 font-light">{t('hero.greeting')}</span>
              <span
                className={`designer-accent-serif block sm:inline mt-1 sm:mt-0 ${
                  language === 'en' ? 'italic font-normal' : 'not-italic font-medium'
                }`}
              >
                {td(heroName, 'Huang Yixuan')}
              </span>
            </h1>

            {/* Signature Manifesto Quote */}
            <p
              className={`text-base sm:text-xl lg:text-[22px] leading-[1.75] font-serif designer-text-secondary max-w-2xl mb-7 sm:mb-10 px-1 sm:px-0 ${
                language === 'en' ? 'italic tracking-[-0.01em]' : 'not-italic tracking-[0.01em]'
              }`}
            >
              {td(
                '“我坚信在不久的将来，最好的编程语言一定是自然语言——而扎实的工程化能力让它真正落地。”',
                '“I firmly believe that in the near future, the best programming language will be natural language — and solid engineering brings it to life.”',
              )}
            </p>

            {/* Clean Two-Action CTA Hierarchy */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-3.5 w-full">
              <ScrollLink
                to="projects"
                smooth={true}
                duration={500}
                offset={-64}
                className="designer-btn-primary h-11 px-5 sm:px-6 rounded-lg font-medium text-sm tracking-tight inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('hero.viewProjects')}</span>
                <ArrowUpRight className="w-4 h-4 stroke-[1.75]" />
              </ScrollLink>

              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="designer-btn-secondary h-11 px-4 sm:px-5 rounded-lg font-mono text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 stroke-[1.75] designer-accent-text" />
                <span>{td('简历 CV.pdf', 'Resume.pdf')}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            {/* Quiet Meta & Quick Contact Strip */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2 text-[11px] sm:text-xs font-mono designer-text-muted">
              <span>{td('湖南农业大学 · 计科 ’28', 'HNUA · CS \'28')}</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <button
                type="button"
                data-sfx="custom"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 hover:designer-text-primary transition-colors cursor-pointer"
                title={td('点击复制邮箱', 'Copy email')}
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 opacity-70" />
                )}
                <span>{copied ? t('idcard.copied') : 'hyxhhh1013@gmail.com'}</span>
              </button>
              <span aria-hidden="true" className="opacity-40">·</span>
              <a
                href="https://github.com/hyxhhh1013"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 hover:designer-text-primary transition-colors"
              >
                <span>GitHub</span>
                <ArrowUpRight className="w-3 h-3 opacity-70" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Whisper-Quiet Centered Scroll Cue (Above Mobile Dock) */}
      <div className="relative z-10 pb-24 md:pb-8 flex justify-center">
        <ScrollLink
          to="about"
          smooth={true}
          duration={500}
          offset={-64}
          aria-label={td('向下滚动探索', 'Scroll down to explore')}
          className="group inline-flex flex-col items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.22em] designer-text-muted hover:designer-text-primary transition-colors cursor-pointer"
        >
          <span>SCROLL</span>
          <ChevronDown className="w-3.5 h-3.5 stroke-[1.5] text-[#8A6F48] dark:text-[#C8A97E] transition-transform duration-300 group-hover:translate-y-0.5" />
        </ScrollLink>
      </div>
    </section>
  );
};
