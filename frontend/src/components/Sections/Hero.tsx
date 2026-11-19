import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import { ChevronDown, ArrowUpRight, FileText, Terminal } from 'lucide-react';
import { HolographicIDCard } from '../UI/HolographicIDCard';
import { getImageUrl } from '../../utils/imageUtils';
import axios from '../../utils/axiosConfig';
import { useI18n } from '../../i18n/i18nContext';
import { useAppStore } from '../../store/useAppStore';

export const Hero: React.FC = () => {
  const { t, td } = useI18n();
  const { openAiWithPrompt } = useAppStore();

  const [heroData, setHeroData] = useState<{
    name: string;
    title: string;
    bio: string;
    avatar: string;
    avatarThumbnail?: string;
  }>({
    name: '黄奕轩',
    title: 'FDE / AI 全栈实习生',
    bio: '湖南农业大学计算机科学与技术 2024 级。',
    avatar: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get('/api/users/1');
        const userData = userResponse.data?.data || userResponse.data;
        if (userData && userData.name && userData.name !== '张三' && userData.name !== 'Admin') {
          setHeroData({
            name: userData.name,
            title: userData.title || 'FDE / AI 全栈实习生',
            bio: userData.bio || '',
            avatar: userData.avatar ? getImageUrl(userData.avatar) : '',
            avatarThumbnail: userData.avatarThumbnail ? getImageUrl(userData.avatarThumbnail) : '',
          });
        } else if (userData && userData.avatar) {
          setHeroData((prev) => ({
            ...prev,
            avatar: getImageUrl(userData.avatar),
            avatarThumbnail: userData.avatarThumbnail ? getImageUrl(userData.avatarThumbnail) : '',
          }));
        }
      } catch {
        // Keep default heroData
      }
    };

    fetchData();
  }, []);

  return (
    <section
      id="hero"
      className="designer-section-hero relative min-h-screen flex flex-col justify-between overflow-hidden pt-24 border-b designer-hairline transition-colors duration-300"
    >
      {/* Subtle Architectural Hairline Grid Frame aligned to max-w-7xl */}
      <div className="pointer-events-none absolute inset-0 max-w-7xl mx-auto border-x designer-hairline opacity-65" />

      {/* Center Editorial Stage */}
      <div className="flex-1 flex items-center relative z-10 py-14 lg:py-20">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-center">
            {/* Left 7 Cols: Commanding Editorial Display Typography */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 text-left flex flex-col items-start"
            >
              {/* Crisp Mono Eyebrow */}
              <div className="inline-flex items-center gap-2.5 text-[11px] sm:text-xs font-mono tracking-[0.12em] uppercase designer-text-muted mb-7">
                <span className="w-2 h-2 rounded-full bg-[#8A6F48] dark:bg-[#C8A97E]" />
                <span>{td('00 // FDE 驻场工程 & AI 全栈开发', '00 // FDE & AI FULL-STACK ENGINEER')}</span>
              </div>

              {/* Giant Editorial Headline — Clear Scale Contrast */}
              <h1 className="designer-heading text-5xl sm:text-6xl lg:text-[66px] xl:text-[74px] font-normal tracking-[-0.035em] leading-[1.08] mb-6">
                <span className="designer-text-secondary/85 font-light">{t('hero.greeting')}</span>
                <span className="designer-accent-serif italic font-normal block sm:inline mt-1 sm:mt-0">
                  {td(heroData.name, 'Huang Yixuan')}
                </span>
              </h1>

              {/* Clean Sans Subheadline — Separates Display Serif from Body */}
              <p className="text-lg sm:text-xl lg:text-[22px] leading-[1.55] tracking-[-0.015em] font-normal designer-text-primary/85 max-w-xl mb-4">
                {td(
                  '把复杂的 Agent 工作流与业务现场，做成干净好用的全栈产品。',
                  'Turning complex agentic workflows & field operations into clean, tactile web products.',
                )}
              </p>

              {/* Concise 2-Line Bio */}
              <p className="designer-text-secondary text-sm sm:text-[15px] max-w-xl mb-10 leading-[1.85] font-normal">
                {td(
                  '湖南农业大学计算机科学与技术 2024 级。目前在湖南洋葱教育担任 FDE 驻场工程师，同时独立负责 AIFA 实验室「禾书耕文」科研写作系统。',
                  'CS undergraduate at Hunan Agricultural University (\'28). Currently an on-site FDE intern at Onion Education and lead developer of HeShu AI4Science at AIFA Lab.',
                )}
              </p>

              {/* Sharp CTA Hierarchy: Primary + Secondary + Borderless Resume Link */}
              <div className="flex flex-wrap items-center gap-3.5">
                <ScrollLink
                  to="projects"
                  smooth={true}
                  duration={500}
                  offset={-70}
                  className="designer-btn-primary h-11 px-6 rounded-lg font-medium text-sm tracking-tight inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>{t('hero.viewProjects')}</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[1.75]" />
                </ScrollLink>

                <button
                  type="button"
                  onClick={() =>
                    openAiWithPrompt('🚀 介绍最硬核的 AI 项目')
                  }
                  className="designer-btn-secondary h-11 px-5 rounded-lg font-mono text-xs sm:text-sm inline-flex items-center gap-2"
                >
                  <Terminal className="w-3.5 h-3.5 stroke-[1.75] designer-accent-text" />
                  <span>{t('hero.askAi')}</span>
                </button>

                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="designer-btn-secondary h-11 px-4 rounded-lg font-mono text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 stroke-[1.75] text-[#8A6F48] dark:text-[#C8A97E]" />
                  <span>{td('下载简历 CV.pdf', 'Resume.pdf')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-75" />
                </a>
              </div>
            </motion.div>

            {/* Right 5 Cols: Authoritative Monograph Dossier Card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 flex justify-center lg:justify-end"
            >
              <HolographicIDCard
                name={heroData.name}
                title={heroData.title}
                avatarUrl={heroData.avatar}
                avatarThumbnailUrl={heroData.avatarThumbnail}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Full-Width Architectural Bottom Index Strip (Anchors the entire Above-the-Fold viewport) */}
      <div className="relative z-10 w-full border-t designer-hairline bg-[#FAF9F5]/70 dark:bg-[#0D0D0C]/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x designer-hairline">
            <div className="py-5 pr-6">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] designer-text-muted mb-1">
                01 / FOCUS
              </div>
              <div className="text-sm font-medium designer-text-primary">
                {td('Agent · RAG · 全栈工程', 'Agent · RAG · Full-Stack')}
              </div>
            </div>
            <div className="py-5 sm:px-6">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] designer-text-muted mb-1">
                02 / PRACTICE
              </div>
              <div className="text-sm font-medium designer-text-primary">
                {td('洋葱教育 FDE · AIFA 实验室', 'Onion Edu FDE · AIFA Lab')}
              </div>
            </div>
            <div className="py-5 lg:px-6">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] designer-text-muted mb-1">
                03 / HONORS
              </div>
              <div className="text-sm font-medium designer-text-primary">
                {td('5 项竞赛与黑客松奖项', '5 Hackathon & Contest Awards')}
              </div>
            </div>
            <div className="py-5 sm:pl-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] designer-text-muted mb-1">
                  04 / SCALE
                </div>
                <div className="text-sm font-mono font-medium text-[#8A6F48] dark:text-[#C8A97E]">
                  200M+ Tokens / Day
                </div>
              </div>
              <ScrollLink
                to="about"
                smooth={true}
                duration={500}
                offset={-70}
                aria-label="向下滚动"
                className="hidden sm:inline-flex w-8 h-8 rounded-full border designer-hairline items-center justify-center designer-text-muted hover:designer-text-primary hover:border-[#8A6F48]/40 transition-colors cursor-pointer shrink-0"
              >
                <ChevronDown className="w-4 h-4 stroke-[1.5]" />
              </ScrollLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
