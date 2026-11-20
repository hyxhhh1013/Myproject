import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  ArrowUpRight,
  Layers,
  Cpu,
  Terminal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import axios from '../../utils/axiosConfig';
import { ImageWithFallback } from '../UI/ImageWithFallback';
import { getImageUrl } from '../../utils/imageUtils';
import { useI18n } from '../../i18n/i18nContext';
import { useAppStore } from '../../store/useAppStore';
import { playToggleSwitch, playTactileClick } from '../../utils/soundEffects';
import {
  HESHU_BLUEPRINT_SVG,
  DREAMTOP_BLUEPRINT_SVG,
  OUTBOUNDS_BLUEPRINT_SVG,
  FANDINGLE_BLUEPRINT_SVG,
} from '../../utils/projectBlueprints';

export interface ProjectData {
  id: number;
  indexCode: string;
  title: string;
  titleEn: string;
  badge: string;
  badgeEn: string;
  description: string;
  descriptionEn: string;
  stack: string[];
  responsibilities: string[];
  responsibilitiesEn: string[];
  challenges: {
    problem: string;
    problemEn: string;
    solution: string;
    solutionEn: string;
  };
  github?: string;
  demoLink?: string;
  images: string[];
}

const DEFAULT_PROJECTS: ProjectData[] = [
  {
    id: 1,
    indexCode: '01',
    title: '禾书耕文 · 科研论文写作系统',
    titleEn: 'HeShu · AI4Science Writing System',
    badge: 'AIFA 实验室重点项目 · 2026.03–至今',
    badgeEn: 'AIFA LAB FLAGSHIP · 2026.03–PRESENT',
    description:
      '驻在课题组将论文初稿从手写约 1 个月缩短至约 3 天，学生已交出 10 余篇初稿。涵盖文献混合检索、可恢复写作循环与五套学术模板导出。',
    descriptionEn:
      'Reduced academic paper first-draft time from ~1 month to ~3 days (10+ drafts delivered). Features a 46-tool LangGraph loop and 2,749-paper Hybrid RAG.',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'LangGraph', 'Hybrid RAG', 'PostgreSQL', 'SSE', 'Playwright'],
    responsibilities: [
      'LangGraph 可恢复写作循环（plan→agent→tools→reflect），拆成 46 个工具 + 11 路 SSE 检查点推送',
      '收录 2,749 篇文献、176,230 个知识块（BM25+向量+RRF 融合排序），越界引用写回前自动剥离',
      '导出前做学术规范/论证/结构/诚信四维审查，支持 SCI、Nature、IEEE 等 5 套模板导出（124 API / 2000+ 测试）',
    ],
    responsibilitiesEn: [
      'Recoverable LangGraph loop (plan→agent→tools→reflect) with 46 tools & 11 SSE channels',
      '2,749 papers (176,230 chunks) with BM25+Vector+RRF hybrid retrieval & strict citation stripping',
      '4D pre-export integrity review & Playwright PDF export across 5 templates (124 APIs / 2000+ tests)',
    ],
    challenges: {
      problem: '长文综述跨段落上下文易漂移，且农学专业术语检索与引文真实性要求极高。',
      problemEn: 'Long-form generation suffered from context drift and strict agronomic citation requirements.',
      solution: 'BM25 + 向量 RRF 融合重排 + 大纲人工批准检查点断点续跑 + 引用落表硬闸校验。',
      solutionEn: 'BM25+Vector RRF fusion + human-in-the-loop outline checkpoints + DB-backed citation gates.',
    },
    github: 'https://github.com/hyxhhh1013/AI-assisted-writing-system-for-agricultural-research',
    demoLink: 'https://ai4science.hyxhhh.site/',
    images: [HESHU_BLUEPRINT_SVG],
  },
  {
    id: 2,
    indexCode: '02',
    title: '梦境拓扑 DreamTop',
    titleEn: 'DreamTop · Subconscious Topology',
    badge: '字节跳动 Trae · 湖南农大三等奖',
    badgeEn: 'TRAE ON CAMPUS · HNUA 3RD PRIZE',
    description:
      '4 周独立从 0 到 1 上线。支持语音与文字输入，将梦境文本抽取为意象与情感结构化数据，再做 60fps 拓扑图谱可视化。',
    descriptionEn:
      'Shipped from 0 to 1 in 4 weeks. Extracts dream symbols & emotions via GLM-4 into a 60fps interactive topology graph.',
    stack: ['React', 'Vite', 'Node.js', 'Express', 'Prisma', 'MySQL', 'Framer Motion', 'GLM-4 API'],
    responsibilities: [
      '4 周独立完成需求梳理、Prisma/MySQL 图关系建模与生产环境部署上线',
      '支持语音与文字双模态录入，接入 GLM-4 结构化抽取潜意识意象与情感极性',
      '实现力导向拓扑图谱与周期洞察报告，画布交互稳定保持 60fps',
    ],
    responsibilitiesEn: [
      'Independently built & deployed from 0 to 1 in 4 weeks with Prisma & MySQL',
      'Voice & text dream capture with GLM-4 structured symbol/emotion extraction',
      'Interactive Force-Directed topology graph running steadily at 60fps',
    ],
    challenges: {
      problem: '非结构化梦境意象跳跃性强，跨日同源符号易产生孤立节点且影响画布帧率。',
      problemEn: 'Fragmented dream symbols created isolated nodes and degraded canvas frame rates.',
      solution: '构建符号归一化关联表（dream_symbols + topology_edges）与画布渲染节流优化。',
      solutionEn: 'Normalized symbol-edge schemas paired with 60fps canvas simulation throttling.',
    },
    github: 'https://github.com/hyxhhh1013/dream-topology',
    demoLink: 'https://dream.hyxhhh.site/',
    images: [DREAMTOP_BLUEPRINT_SVG],
  },
  {
    id: 3,
    indexCode: '03',
    title: '界外 Outbounds',
    titleEn: 'Outbounds · Multi-Universe Hub',
    badge: '字节跳动 Trae · 中南大学二等奖',
    badgeEn: 'TRAE ON CAMPUS · CSU 2ND PRIZE',
    description:
      'Next.js 16 全栈社区，独立打造 Hacker / Art / ACG 三个主题宇宙，支持卡片手势流、即时通讯与跨宇宙 AI 伴侣。',
    descriptionEn:
      'Next.js 16 community featuring Hacker / Art / ACG themed universes with gesture cards and AI companions.',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind v4', 'Prisma', 'SQLite', 'Framer Motion', 'Zod'],
    responsibilities: [
      '基于 Next.js 16 App Router 与 React 19 独立完成全栈架构与边缘可部署设计',
      '构建 Hacker / Art / ACG 三套独立视觉宇宙、卡片手势流与跨宇宙 AI 伴侣对话',
      '采用 Prisma + Zod 全链路数据校验与 Vitest 单元测试保障稳定性',
    ],
    responsibilitiesEn: [
      'Architected the Next.js 16 App Router & React 19 full-stack application',
      'Built Hacker / Art / ACG themed universes with gesture streams & AI chat',
      'End-to-end Zod validation, Prisma modeling, and Vitest unit testing',
    ],
    challenges: {
      problem: '三套截然不同的宇宙主题与对话上下文在高频切换时易闪烁或丢失状态。',
      problemEn: 'Switching across three distinct universe themes caused layout flicker and state loss.',
      solution: '采用 React Context + URL 参数持久化与共享布局过渡，实现零闪烁无缝切换。',
      solutionEn: 'Combined React Context + URL persistence with Framer Motion shared layout transitions.',
    },
    github: 'https://github.com/hyxhhh1013/Outbounds',
    demoLink: 'https://hyxhhh.site/outbounds',
    images: [OUTBOUNDS_BLUEPRINT_SVG],
  },
  {
    id: 4,
    indexCode: '04',
    title: '饭定了 · 校园餐饮协同决策',
    titleEn: 'FanDingLe · Campus Dining Decision',
    badge: 'LEV0 黑客松 · 2026.06 最佳创意奖',
    badgeEn: 'LEV0 HACKATHON · BEST CREATIVITY',
    description:
      '校园选餐协同应用：室友建房、填口味与忌口，30 秒内一起把聚餐门店定下来，覆盖湖南农大周边真实门店池。',
    descriptionEn:
      'Collaborative campus dining app where roommates create rooms, filter dietary rules, and pick a restaurant in 30s.',
    stack: ['TypeScript', 'React', 'Node.js', 'Tailwind CSS', 'Prisma'],
    responsibilities: [
      '独立完成前后端全栈开发，实地调研并录入农大周边 50+ 真实餐饮门店池',
      '设计多人建房、口味画像填报与实时投票收敛的轻量化交互闭环',
      '实现「负向忌口一票否决 + 正向偏好加权」门店推荐算法',
    ],
    responsibilitiesEn: [
      'Independently built full-stack app & curated 50+ local campus restaurants',
      'Designed room creation, dietary profiling, and real-time voting flows',
      'Implemented veto-first dietary filtering + weighted preference matching',
    ],
    challenges: {
      problem: '多人聚餐众口难调，传统随机转盘缺乏真实周边门店与忌口数据支撑。',
      problemEn: 'Group dining stalled due to conflicting preferences and generic random wheels.',
      solution: '结合周边真实门店画像与忌口硬过滤，将候选池快速收敛至 Top 3 高匹配门店。',
      solutionEn: 'Combined real merchant profiles with hard dietary filters to converge on Top 3 matches.',
    },
    github: '',
    demoLink: 'https://eat.hyxhhh.site/',
    images: [FANDINGLE_BLUEPRINT_SVG],
  },
];

const FlagshipProjectCard: React.FC<{
  project: ProjectData;
  isHighlighted: boolean;
  onOpenLightbox: (images: string[], idx: number) => void;
}> = React.memo(({ project, isHighlighted, onOpenLightbox }) => {
  const { t, td } = useI18n();
  const { openAiWithPrompt, projectTabOverride } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture'>('overview');
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  useEffect(() => {
    if (projectTabOverride && projectTabOverride.code === project.indexCode) {
      setActiveTab(projectTabOverride.tab);
    }
  }, [projectTabOverride, project.indexCode]);

  const images =
    project.images && project.images.length > 0
      ? project.images
      : ['https://picsum.photos/seed/proj/900/540'];
  const currentImage = images[activeImgIdx] || images[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTactileClick(1.1);
    setActiveImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTactileClick(1.1);
    setActiveImgIdx((prev) => (prev + 1) % images.length);
  };

  return (
    <motion.div
      id={`project-card-${project.indexCode}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className={`designer-card rounded-2xl overflow-hidden mb-7 transition-all duration-300 ${
        isHighlighted ? 'ring-2 ring-[#8A6F48] dark:ring-[#C8A97E]' : ''
      }`}
    >
      {/* Top Bar */}
      <div className="px-4 sm:px-6 py-3 border-b designer-hairline bg-[#FAF9F5] dark:bg-[#141412] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="px-2 py-0.5 rounded bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] font-semibold">
            FLAGSHIP // {project.indexCode}
          </span>
          <span className="text-[#8A6F48] dark:text-[#C8A97E] font-medium">
            {td(project.badge, project.badgeEn)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.stack.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[#F3F1EC] dark:bg-[#22221F] designer-text-secondary text-[10px] font-mono rounded border designer-hairline"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 12-Col Split Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 7 Cols: Preview Frame + 4 Key Metrics */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r designer-hairline flex flex-col justify-between bg-[#FAF9F5]/50 dark:bg-[#121210]/50">
          <div
            onClick={() => onOpenLightbox(images, activeImgIdx)}
            className="aspect-[16/10] bg-[#141413] border-b designer-hairline overflow-hidden relative group cursor-pointer"
          >
            <ImageWithFallback
              src={currentImage}
              thumbnailSrc={currentImage}
              alt={td(project.title, project.titleEn)}
              adaptiveFrame={true}
              className="transition-transform duration-700 group-hover:scale-[1.02]"
            />

            <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 p-1.5 rounded-full bg-black/55 text-white opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  data-sfx="custom"
                  onClick={handlePrev}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  data-sfx="custom"
                  onClick={handleNext}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/55 backdrop-blur-xs px-2.5 py-1 rounded-full">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      data-sfx="custom"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTactileClick(1.1);
                        setActiveImgIdx(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        activeImgIdx === idx ? 'w-4 bg-[#FAF9F5]' : 'w-1.5 bg-white/45'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 4 Compact Quantitative Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--border-hairline)]">
            {[
              { val: '~3 Days', label: td('初稿周期 · 已出 10+ 篇', 'Draft Cycle · 10+ Papers') },
              { val: '46 Tools', label: td('LangGraph · 11 路 SSE', 'LangGraph · 11 SSE') },
              { val: '176,230', label: td('2,749 篇文献知识块', '2,749 Papers Indexed') },
              { val: '2000+', label: td('测试 · 124 API · 5 模板', 'Tests · 124 APIs') },
            ].map((m, i) => (
              <div key={i} className="p-3 sm:p-3.5 text-left bg-[var(--bg-card)]">
                <div className="text-sm sm:text-base font-mono font-bold designer-text-primary">{m.val}</div>
                <div className="text-[11px] designer-text-secondary mt-0.5 truncate">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Fixed-Height Tab Body + Actions */}
        <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight designer-text-primary">
                {td(project.title, project.titleEn)}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#F3F1EC] dark:bg-[#1E1E1B] border designer-hairline mb-4">
              <button
                type="button"
                data-sfx="custom"
                onClick={() => {
                  if (activeTab !== 'overview') playToggleSwitch(true);
                  setActiveTab('overview');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#FFFFFF] dark:bg-[#141413] designer-text-primary font-semibold shadow-2xs'
                    : 'designer-text-muted hover:designer-text-primary'
                }`}
              >
                <Layers className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{td('产品概览', 'Overview')}</span>
              </button>
              <button
                type="button"
                data-sfx="custom"
                onClick={() => {
                  if (activeTab !== 'architecture') playToggleSwitch(false);
                  setActiveTab('architecture');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                  activeTab === 'architecture'
                    ? 'bg-[#FFFFFF] dark:bg-[#141413] designer-text-primary font-semibold shadow-2xs'
                    : 'designer-text-muted hover:designer-text-primary'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{td('架构拆解', 'Architecture')}</span>
              </button>
            </div>

            {/* Stable Height Content Box — Never jumps when toggling tabs */}
            <div className="min-h-[185px]">
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === 'overview' ? (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.14 }}
                    className="space-y-3"
                  >
                    <p className="designer-text-secondary text-xs sm:text-sm leading-relaxed">
                      {td(project.description, project.descriptionEn)}
                    </p>
                    <ul className="space-y-1.5 pt-2 border-t designer-hairline text-xs designer-text-secondary">
                      {(td('zh', 'en') === 'en' ? project.responsibilitiesEn : project.responsibilities).map(
                        (item, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E] mt-0.5 shrink-0">
                              0{idx + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </motion.div>
                ) : (
                  <motion.div
                    key="architecture"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.14 }}
                    className="space-y-2.5"
                  >
                    <div className="p-3 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline">
                      <div className="text-[10px] font-mono uppercase text-[#8A6F48] dark:text-[#C8A97E] mb-0.5">
                        I. {t('project.problem')}
                      </div>
                      <p className="text-xs designer-text-secondary leading-relaxed">
                        {td(project.challenges.problem, project.challenges.problemEn)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline">
                      <div className="text-[10px] font-mono uppercase text-[#8A6F48] dark:text-[#C8A97E] mb-0.5">
                        II. {t('project.solution')}
                      </div>
                      <p className="text-xs designer-text-secondary leading-relaxed">
                        {td(project.challenges.solution, project.challenges.solutionEn)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openAiWithPrompt(
                          td(
                            `请深入讲讲「${project.title}」的技术架构与解决方案！`,
                            `Deep-dive the technical architecture and engineering solutions of "${project.titleEn}"!`,
                          ),
                        )
                      }
                      className="w-full py-2 px-3 rounded-lg designer-btn-secondary text-xs font-mono flex items-center justify-center gap-1.5"
                    >
                      <Terminal className="w-3.5 h-3.5 text-[#8A6F48]" />
                      <span>{td('向 AI 小轩提问该项目架构 →', 'Ask AI about this architecture →')}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t designer-hairline flex items-center justify-between gap-3">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center designer-btn-secondary text-xs font-mono px-3 py-1.5 rounded-lg"
              >
                <Github className="w-3.5 h-3.5 mr-1.5 stroke-[1.5]" />
                {t('project.github')}
              </a>
            )}
            {project.demoLink && (
              <a
                href={project.demoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center designer-btn-primary text-xs font-mono font-medium px-4 py-1.5 rounded-lg ml-auto"
              >
                <span>{t('project.demo')}</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const ProjectCard: React.FC<{
  project: ProjectData;
  delay: number;
  isHighlighted: boolean;
  onOpenLightbox: (images: string[], idx: number) => void;
}> = React.memo(({ project, delay, isHighlighted, onOpenLightbox }) => {
  const { t, td } = useI18n();
  const { openAiWithPrompt, projectTabOverride } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture'>('overview');
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  useEffect(() => {
    if (projectTabOverride && projectTabOverride.code === project.indexCode) {
      setActiveTab(projectTabOverride.tab);
    }
  }, [projectTabOverride, project.indexCode]);

  const images =
    project.images && project.images.length > 0
      ? project.images
      : ['https://picsum.photos/seed/proj/900/540'];
  const currentImage = images[activeImgIdx] || images[0];
  const isExternalDemo = project.demoLink?.startsWith('http');

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTactileClick(1.1);
    setActiveImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTactileClick(1.1);
    setActiveImgIdx((prev) => (prev + 1) % images.length);
  };

  return (
    <motion.div
      id={`project-card-${project.indexCode}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay }}
      className={`designer-card rounded-2xl overflow-hidden flex flex-col justify-between h-full transition-all duration-300 ${
        isHighlighted ? 'ring-2 ring-[#8A6F48] dark:ring-[#C8A97E]' : ''
      }`}
    >
      <div>
        {/* Top Metadata Bar */}
        <div className="px-5 py-2.5 border-b designer-hairline bg-[#FAF9F5] dark:bg-[#141412] flex items-center justify-between gap-2 text-[11px] font-mono">
          <span className="text-[#8A6F48] dark:text-[#C8A97E] font-medium shrink-0">
            PLATE // {project.indexCode}
          </span>
          <span className="designer-text-muted text-right truncate">
            {td(project.badge, project.badgeEn)}
          </span>
        </div>

        {/* Image Frame with Clean Arrows + Lightbox Click (16:10 native ratio) */}
        <div
          onClick={() => onOpenLightbox(images, activeImgIdx)}
          className="aspect-[16/10] bg-[#141413] border-b designer-hairline overflow-hidden relative group cursor-pointer"
        >
          <ImageWithFallback
            src={currentImage}
            thumbnailSrc={currentImage}
            alt={td(project.title, project.titleEn)}
            adaptiveFrame={true}
            className="transition-transform duration-700 group-hover:scale-[1.03]"
          />

          <div className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-black/55 text-white opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-3 h-3" />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                data-sfx="custom"
                onClick={handlePrev}
                aria-label="Previous photo"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                data-sfx="custom"
                onClick={handleNext}
                aria-label="Next photo"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2.5 right-3 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    data-sfx="custom"
                    onClick={(e) => {
                      e.stopPropagation();
                      playTactileClick(1.1);
                      setActiveImgIdx(idx);
                    }}
                    className={`h-1 rounded-full transition-all ${
                      activeImgIdx === idx ? 'w-3.5 bg-[#FAF9F5]' : 'w-1 bg-white/45'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Title & Segmented Control */}
        <div className="px-4 sm:px-5 pt-4">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight designer-text-primary mb-2.5 truncate">
            {td(project.title, project.titleEn)}
          </h3>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#F3F1EC] dark:bg-[#1E1E1B] border designer-hairline">
            <button
              type="button"
              data-sfx="custom"
              onClick={() => {
                if (activeTab !== 'overview') playToggleSwitch(true);
                setActiveTab('overview');
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 sm:py-1 px-2 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#FFFFFF] dark:bg-[#141413] designer-text-primary font-semibold shadow-2xs'
                  : 'designer-text-muted hover:designer-text-primary'
              }`}
            >
              <Layers className="w-3 h-3 stroke-[1.5] shrink-0" />
              <span>{td('产品概览', 'Overview')}</span>
            </button>
            <button
              type="button"
              data-sfx="custom"
              onClick={() => {
                if (activeTab !== 'architecture') playToggleSwitch(false);
                setActiveTab('architecture');
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 sm:py-1 px-2 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all ${
                activeTab === 'architecture'
                  ? 'bg-[#FFFFFF] dark:bg-[#141413] designer-text-primary font-semibold shadow-2xs'
                  : 'designer-text-muted hover:designer-text-primary'
              }`}
            >
              <Cpu className="w-3 h-3 stroke-[1.5] shrink-0" />
              <span>{td('架构拆解', 'Architecture')}</span>
            </button>
          </div>
        </div>

        {/* Fixed-Height Body — Zero Height Jump */}
        <div className="p-4 sm:p-5 lg:min-h-[210px] flex flex-col justify-between">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="space-y-3"
              >
                <p className="designer-text-secondary text-xs leading-relaxed line-clamp-2">
                  {td(project.description, project.descriptionEn)}
                </p>

                <div className="flex flex-wrap gap-1">
                  {project.stack.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-[#F3F1EC] dark:bg-[#22221F] designer-text-secondary text-[10px] font-mono rounded border designer-hairline"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <ul className="space-y-1 pt-2 border-t designer-hairline text-xs designer-text-secondary">
                  {(td('zh', 'en') === 'en' ? project.responsibilitiesEn : project.responsibilities).map(
                    (item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E] mt-0.5 shrink-0">
                          0{idx + 1}
                        </span>
                        <span className="line-clamp-1">{item}</span>
                      </li>
                    ),
                  )}
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key="architecture"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="space-y-2"
              >
                <div className="p-2.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline">
                  <div className="text-[10px] font-mono uppercase text-[#8A6F48] dark:text-[#C8A97E]">
                    I. {t('project.problem')}
                  </div>
                  <p className="text-xs designer-text-secondary leading-relaxed line-clamp-2 mt-0.5">
                    {td(project.challenges.problem, project.challenges.problemEn)}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline">
                  <div className="text-[10px] font-mono uppercase text-[#8A6F48] dark:text-[#C8A97E]">
                    II. {t('project.solution')}
                  </div>
                  <p className="text-xs designer-text-secondary leading-relaxed line-clamp-2 mt-0.5">
                    {td(project.challenges.solution, project.challenges.solutionEn)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openAiWithPrompt(
                      td(
                        `请深入讲讲「${project.title}」项目的技术架构与难点突破！`,
                        `Break down the architecture and engineering challenges of "${project.titleEn}"!`,
                      ),
                    )
                  }
                  className="w-full py-1.5 px-2.5 rounded-lg designer-btn-secondary text-[11px] font-mono flex items-center justify-center gap-1.5"
                >
                  <Terminal className="w-3 h-3 text-[#8A6F48]" />
                  <span>{td('让 AI 小轩剖析架构 →', 'Ask AI Assistant →')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="px-5 py-3 bg-[#FAF9F5] dark:bg-[#141412] border-t designer-hairline flex justify-between items-center gap-2">
        {project.github ? (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center designer-btn-secondary text-xs font-mono px-3 py-1.5 rounded-lg"
          >
            <Github className="w-3.5 h-3.5 mr-1.5 stroke-[1.5]" />
            {t('project.github')}
          </a>
        ) : (
          <span className="designer-text-muted text-[11px] font-mono flex items-center px-2.5 py-1.5 rounded-lg border designer-hairline">
            <Github className="w-3 h-3 mr-1 stroke-[1.5]" />
            {t('project.privateRepo')}
          </span>
        )}

        {project.demoLink &&
          (isExternalDemo ? (
            <a
              href={project.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center designer-btn-primary text-xs font-mono font-medium px-3.5 py-1.5 rounded-lg"
            >
              <span>{t('project.demo')}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </a>
          ) : (
            <Link
              to={project.demoLink}
              className="inline-flex items-center justify-center designer-btn-primary text-xs font-mono font-medium px-3.5 py-1.5 rounded-lg"
            >
              <span>{t('project.demo')}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          ))}
      </div>
    </motion.div>
  );
});

export const Projects: React.FC = () => {
  const { t, td } = useI18n();
  const { activeSkillFilter, setActiveSkillFilter, highlightedProjectCode } = useAppStore();
  const [projects, setProjects] = useState<ProjectData[]>(DEFAULT_PROJECTS);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<{ src: string }[]>([]);

  const openLightbox = (images: string[], index: number) => {
    setLightboxSlides(images.map((img) => ({ src: img })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects');
        const data = response.data?.data || response.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const merged = DEFAULT_PROJECTS.map((defProj) => {
            const dbMatch = data.find((p: any) => {
              const tStr = (p.title || '').toLowerCase();
              const gStr = (p.githubUrl || '').toLowerCase();
              const dStr = (p.demoUrl || '').toLowerCase();
              if (defProj.id === 1) {
                return (
                  tStr.includes('禾书') ||
                  tStr.includes('农业') ||
                  tStr.includes('科研') ||
                  gStr.includes('agricultural-research')
                );
              }
              if (defProj.id === 2) {
                return tStr.includes('梦境') || gStr.includes('dream-topology');
              }
              if (defProj.id === 3) {
                return tStr.includes('界外') || tStr.includes('outbounds') || gStr.includes('outbounds');
              }
              if (defProj.id === 4) {
                return tStr.includes('饭定了') || tStr.includes('选餐') || dStr.includes('eat.hyxhhh');
              }
              return (
                p.title &&
                (p.title.includes(defProj.title.split(' ')[0]) ||
                  defProj.title.includes(p.title.split(' ')[0]))
              );
            });
            if (!dbMatch) return defProj;

            let parsedImages: string[] = [];
            if (Array.isArray(dbMatch.images) && dbMatch.images.length > 0) {
              parsedImages = dbMatch.images.map((img: string) => getImageUrl(img));
            } else if (typeof dbMatch.images === 'string' && dbMatch.images.trim().startsWith('[')) {
              try {
                parsedImages = JSON.parse(dbMatch.images).map((img: string) => getImageUrl(img));
              } catch {
                parsedImages = [];
              }
            } else if (dbMatch.imageUrl) {
              parsedImages = [getImageUrl(dbMatch.imageUrl)];
            }

            const combinedImages =
              parsedImages.length > 0
                ? [...defProj.images, ...parsedImages]
                : defProj.images;

            return {
              ...defProj,
              github: dbMatch.githubUrl || defProj.github,
              demoLink: defProj.id === 1 ? defProj.demoLink : dbMatch.demoUrl || defProj.demoLink,
              images: combinedImages,
            };
          });
          setProjects(merged);
        }
      } catch {
        // Keep DEFAULT_PROJECTS
      }
    };

    fetchProjects();
  }, []);

  const isProjectHighlighted = useMemo(() => {
    return (proj: ProjectData) => {
      if (highlightedProjectCode && proj.indexCode === highlightedProjectCode) return true;
      if (!activeSkillFilter) return false;
      const filterLower = activeSkillFilter.toLowerCase();
      if (
        filterLower.includes('ai-native') ||
        filterLower.includes('ai 原生') ||
        filterLower.includes('e2e')
      ) {
        return true;
      }
      if (
        (filterLower.includes('mcp') || filterLower.includes('tool')) &&
        (proj.id === 1 || proj.id === 2)
      ) {
        return true;
      }
      if (filterLower.includes('fastapi') || filterLower.includes('python')) {
        return proj.id === 1;
      }
      if (filterLower.includes('pg') || filterLower.includes('prisma') || filterLower.includes('postgres')) {
        return true;
      }
      return proj.stack.some(
        (s) => s.toLowerCase().includes(filterLower) || filterLower.includes(s.toLowerCase()),
      );
    };
  }, [activeSkillFilter, highlightedProjectCode]);

  const flagshipProject = projects[0];
  const trioProjects = projects.slice(1);

  return (
    <section
      id="projects"
      className="py-14 sm:py-24 transition-colors duration-300"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto mb-8 sm:mb-10 pb-4 border-b designer-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4"
        >
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest designer-accent-text mb-1.5">
              03 // SELECTED WORKS
            </div>
            <h2 className="designer-heading text-2xl sm:text-3xl md:text-4xl font-normal tracking-[-0.02em]">
              {t('projects.title')}
            </h2>
          </div>
          {activeSkillFilter && (
            <div className="flex flex-col sm:items-end gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full designer-pill text-xs font-mono">
                <span>
                  {td(`筛选: ${activeSkillFilter}`, `Filter: ${activeSkillFilter}`)}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSkillFilter(null)}
                  className="inline-flex items-center gap-1 underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t('skills.clearFilter')}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {flagshipProject && (
            <FlagshipProjectCard
              project={flagshipProject}
              isHighlighted={isProjectHighlighted(flagshipProject)}
              onOpenLightbox={openLightbox}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {trioProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                delay={index * 0.06}
                isHighlighted={isProjectHighlighted(project)}
                onOpenLightbox={openLightbox}
              />
            ))}
          </div>
        </div>

        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={lightboxSlides}
        />
      </div>
    </section>
  );
};
