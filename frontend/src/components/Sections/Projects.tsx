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

// The four known projects get presentation extras the DB does not hold: a quiet
// tint behind the preview frame (so the cards stop reading as one beige block),
// a cover image used when no screenshot is uploaded, and — for the flagship —
// the stat strip shown until metrics are entered in the admin.
type KnownProjectKey = 'heshu' | 'dreamtop' | 'outbounds' | 'fandingle';

const PROJECT_MATS: Record<KnownProjectKey, string> = {
  heshu: 'bg-[#E2EAD9] dark:bg-[#18211A]', // 禾书耕文 · agri sage
  dreamtop: 'bg-[#E6E0F2] dark:bg-[#1D1A28]', // 梦境拓扑 · dream lavender
  outbounds: 'bg-[#DCE3EB] dark:bg-[#151B22]', // 界外 · steel blue
  fandingle: 'bg-[#F5E1CC] dark:bg-[#281D14]', // 饭定了 · warm apricot
};
const projectMat = (key?: KnownProjectKey) =>
  (key && PROJECT_MATS[key]) || 'bg-[#F2EFE8] dark:bg-[#191816]';

const PROJECT_COVERS: Record<KnownProjectKey, string> = {
  heshu: HESHU_BLUEPRINT_SVG,
  dreamtop: DREAMTOP_BLUEPRINT_SVG,
  outbounds: OUTBOUNDS_BLUEPRINT_SVG,
  fandingle: FANDINGLE_BLUEPRINT_SVG,
};

interface ProjectMetric {
  value: string;
  label: string;
  labelEn: string;
}

const HESHU_METRICS: ProjectMetric[] = [
  { value: '~3 Days', label: '初稿周期 · 已出 10+ 篇', labelEn: 'Draft Cycle · 10+ Papers' },
  { value: '46 Tools', label: 'LangGraph · 11 路 SSE', labelEn: 'LangGraph · 11 SSE' },
  { value: '176,230', label: '2,749 篇文献知识块', labelEn: '2,749 Papers Indexed' },
  { value: '2000+', label: '测试 · 124 API · 5 模板', labelEn: 'Tests · 124 APIs' },
];

export interface ProjectData {
  id: number;
  indexCode: string;
  key?: KnownProjectKey;
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
  metrics?: ProjectMetric[];
}

const DEFAULT_PROJECTS: ProjectData[] = [
  {
    id: 1,
    indexCode: '01',
    key: 'heshu',
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
    metrics: HESHU_METRICS,
  },
  {
    id: 2,
    indexCode: '02',
    key: 'dreamtop',
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
    key: 'outbounds',
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
    key: 'fandingle',
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

// ---- API rows (GET /api/projects) -----------------------------------------
interface ApiProject {
  id: number;
  title?: string | null;
  titleEn?: string | null;
  badge?: string | null;
  badgeEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  technologies?: unknown;
  responsibilities?: string | null;
  responsibilitiesEn?: string | null;
  challengesProblem?: string | null;
  challengesProblemEn?: string | null;
  challengesSolution?: string | null;
  challengesSolutionEn?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  imageUrl?: string | null;
  images?: unknown;
  metrics?: unknown;
  orderIndex?: number | null;
  isVisible?: boolean | null;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

// JSON columns arrive as a JSON string (or already parsed); tolerate both, plus a comma list.
const parseJsonArray = (v: unknown): unknown[] => {
  if (Array.isArray(v)) return v;
  if (typeof v !== 'string' || !v.trim()) return [];
  const text = v.trim();
  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return text.split(',');
};

const parseStringList = (v: unknown): string[] =>
  parseJsonArray(v).map((x) => str(x)).filter(Boolean);

const splitLines = (v: unknown): string[] =>
  str(v)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const sortByOrder = <T extends { id: number; orderIndex?: number | null }>(rows: T[]): T[] =>
  [...rows].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0) || a.id - b.id);

const isProjectsSynced = (rows: ApiProject[]) => rows.some((r) => str(r.badge) || str(r.titleEn));

// Recognises the four known projects by title keyword / repo / demo URL.
const KNOWN_PROJECT_MATCHERS: Record<KnownProjectKey, (p: ApiProject) => boolean> = {
  heshu: (p) => {
    const t = `${p.title || ''} ${p.titleEn || ''}`.toLowerCase();
    return (
      t.includes('禾书') ||
      t.includes('农业') ||
      t.includes('科研') ||
      (p.githubUrl || '').toLowerCase().includes('agricultural-research')
    );
  },
  dreamtop: (p) =>
    `${p.title || ''} ${p.titleEn || ''}`.toLowerCase().includes('梦境') ||
    (p.githubUrl || '').toLowerCase().includes('dream-topology'),
  outbounds: (p) => {
    const t = `${p.title || ''} ${p.titleEn || ''}`.toLowerCase();
    return t.includes('界外') || t.includes('outbounds') || (p.githubUrl || '').toLowerCase().includes('outbounds');
  },
  fandingle: (p) => {
    const t = `${p.title || ''} ${p.titleEn || ''}`.toLowerCase();
    return t.includes('饭定了') || t.includes('选餐') || (p.demoUrl || '').toLowerCase().includes('eat.hyxhhh');
  },
};
const KNOWN_PROJECT_ORDER: KnownProjectKey[] = ['heshu', 'dreamtop', 'outbounds', 'fandingle'];
const detectKnownProject = (p: ApiProject) => KNOWN_PROJECT_ORDER.find((k) => KNOWN_PROJECT_MATCHERS[k](p));

const parseProjectImages = (p: ApiProject): string[] => {
  const list = parseStringList(p.images).map((img) => getImageUrl(img)).filter(Boolean);
  if (list.length > 0) return list;
  const single = getImageUrl(str(p.imageUrl));
  return single ? [single] : [];
};

const parseMetrics = (v: unknown): ProjectMetric[] =>
  parseJsonArray(v)
    .map((m) => {
      const o = (m && typeof m === 'object' ? m : {}) as Record<string, unknown>;
      return { value: str(o.value), label: str(o.label), labelEn: str(o.labelEn) };
    })
    .filter((m) => m.value || m.label);

const toProjectData = (row: ApiProject, index: number): ProjectData => {
  const key = detectKnownProject(row);
  const responsibilities = splitLines(row.responsibilities);
  const responsibilitiesEn = splitLines(row.responsibilitiesEn);
  const images = parseProjectImages(row);
  const metrics = parseMetrics(row.metrics);
  return {
    id: row.id,
    indexCode: String(index + 1).padStart(2, '0'),
    key,
    title: str(row.title),
    titleEn: str(row.titleEn),
    badge: str(row.badge),
    badgeEn: str(row.badgeEn),
    description: str(row.description),
    descriptionEn: str(row.descriptionEn),
    stack: parseStringList(row.technologies),
    responsibilities,
    responsibilitiesEn: responsibilitiesEn.length > 0 ? responsibilitiesEn : responsibilities,
    challenges: {
      problem: str(row.challengesProblem),
      problemEn: str(row.challengesProblemEn),
      solution: str(row.challengesSolution),
      solutionEn: str(row.challengesSolutionEn),
    },
    github: str(row.githubUrl),
    demoLink: str(row.demoUrl),
    images: images.length > 0 ? images : key ? [PROJECT_COVERS[key]] : [],
    metrics: metrics.length > 0 ? metrics : key === 'heshu' ? HESHU_METRICS : [],
  };
};

// Stat strip columns: the classic 4-up strip, or a single row for fewer items.
const metricCols = (count: number) =>
  count >= 4 ? 'grid-cols-2 sm:grid-cols-4' : count === 3 ? 'grid-cols-3' : count === 2 ? 'grid-cols-2' : 'grid-cols-1';

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
  const metrics = project.metrics ?? [];

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
          <span className="designer-text-secondary font-medium">
            {td(project.badge, project.badgeEn)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.stack.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[#F3F1EC] dark:bg-[#22221F] designer-text-secondary text-[11px] font-mono rounded border designer-hairline"
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
            className={`aspect-[16/10] ${projectMat(project.key)} border-b designer-hairline p-3 sm:p-4 lg:p-5 relative group cursor-pointer`}
          >
            <div className="w-full h-full rounded-xl overflow-hidden bg-[#FAF9F5] dark:bg-[#141413] ring-1 ring-[#141413]/10 dark:ring-white/10 shadow-[0_14px_34px_-10px_rgba(20,20,19,0.16)] flex flex-col transition-transform duration-500 group-hover:-translate-y-0.5">
              {/* Minimal Warm-Sand Browser Chrome */}
              <div className="h-6 sm:h-7 px-3 bg-[#FAF8F4] dark:bg-[#1D1C19] border-b border-[#141413]/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D5CEC2] dark:bg-[#3A3833]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D5CEC2] dark:bg-[#3A3833]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D5CEC2] dark:bg-[#3A3833]" />
                </div>
                <span className="text-[11px] font-mono text-[#8A8478] dark:text-[#8E8A80] truncate">
                  {(project.demoLink || '').replace(/^https?:\/\//, '').replace(/\/$/, '') || project.indexCode}
                </span>
                <Maximize2 className="w-3 h-3 text-[#8A6F48]/70 group-hover:text-[#8A6F48] dark:text-[#C8A97E]/70 dark:group-hover:text-[#C8A97E] transition-colors shrink-0" />
              </div>

              {/* Screenshot Viewport with Soft Editorial Harmonization */}
              <div className="relative flex-1 min-h-0 overflow-hidden bg-[#FAF9F5] dark:bg-[#141413]">
                <ImageWithFallback
                  src={currentImage}
                  thumbnailSrc={currentImage}
                  alt={td(project.title, project.titleEn)}
                  adaptiveFrame={true}
                  className="transition-transform duration-500"
                />
              </div>
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
          {metrics.length > 0 && (
            <div className={`grid ${metricCols(metrics.length)} gap-px bg-[var(--border-hairline)]`}>
              {metrics.map((m, i) => (
                <div key={i} className="p-3 sm:p-3.5 text-left bg-[var(--bg-card)]">
                  <div className="text-sm sm:text-base font-mono font-bold designer-text-primary">{m.value}</div>
                  <div className="text-[11px] designer-text-secondary mt-0.5 truncate">{td(m.label, m.labelEn)}</div>
                </div>
              ))}
            </div>
          )}
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
                    <p className="designer-text-secondary text-sm sm:text-[15px] leading-relaxed">
                      {td(project.description, project.descriptionEn)}
                    </p>
                    <ul className="space-y-1.5 pt-2 border-t designer-hairline text-[13px] designer-text-secondary">
                      {(td('zh', 'en') === 'en' ? project.responsibilitiesEn : project.responsibilities).map(
                        (item, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-[11px] font-mono designer-text-muted mt-0.5 shrink-0">
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
                      <div className="text-[11px] font-mono uppercase text-[#8A6F48] dark:text-[#C8A97E] mb-0.5">
                        I. {t('project.problem')}
                      </div>
                      <p className="text-[13px] designer-text-secondary leading-relaxed">
                        {td(project.challenges.problem, project.challenges.problemEn)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline">
                      <div className="text-[11px] font-mono uppercase text-[#8A6F48] dark:text-[#C8A97E] mb-0.5">
                        II. {t('project.solution')}
                      </div>
                      <p className="text-[13px] designer-text-secondary leading-relaxed">
                        {td(project.challenges.solution, project.challenges.solutionEn)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openAiWithPrompt(
                          td(
                            `请深入讲讲「${project.title}」的技术架构与解决方案！`,
                            `Deep-dive the technical architecture and engineering solutions of "${project.titleEn || project.title}"!`,
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
          <span className="designer-text-muted font-medium shrink-0">
            PLATE // {project.indexCode}
          </span>
          <span className="designer-text-muted text-right truncate">
            {td(project.badge, project.badgeEn)}
          </span>
        </div>

        {/* Image Frame with Warm-Sand Showcase Mat + Minimal Browser Bezel */}
        <div
          onClick={() => onOpenLightbox(images, activeImgIdx)}
          className={`aspect-[16/10] ${projectMat(project.key)} border-b designer-hairline p-2.5 sm:p-3.5 relative group cursor-pointer`}
        >
          <div className="w-full h-full rounded-lg overflow-hidden bg-[#FAF9F5] dark:bg-[#141413] ring-1 ring-[#141413]/10 dark:ring-white/10 shadow-[0_10px_24px_-8px_rgba(20,20,19,0.16)] flex flex-col transition-transform duration-500 group-hover:-translate-y-0.5">
            {/* Minimal Warm-Sand Browser Chrome */}
            <div className="h-5 sm:h-6 px-2.5 bg-[#FAF8F4] dark:bg-[#1D1C19] border-b border-[#141413]/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D5CEC2] dark:bg-[#3A3833]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#D5CEC2] dark:bg-[#3A3833]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#D5CEC2] dark:bg-[#3A3833]" />
              </div>
              <span className="text-[11px] font-mono text-[#8A8478] dark:text-[#8E8A80] truncate">
                {(project.demoLink || '').replace(/^https?:\/\//, '').replace(/\/$/, '') || project.indexCode}
              </span>
              <Maximize2 className="w-2.5 h-2.5 text-[#8A6F48]/70 group-hover:text-[#8A6F48] dark:text-[#C8A97E]/70 dark:group-hover:text-[#C8A97E] transition-colors shrink-0" />
            </div>

            {/* Screenshot Viewport with Soft Editorial Harmonization */}
            <div className="relative flex-1 min-h-0 overflow-hidden bg-[#FAF9F5] dark:bg-[#141413]">
              <ImageWithFallback
                src={currentImage}
                thumbnailSrc={currentImage}
                alt={td(project.title, project.titleEn)}
                adaptiveFrame={true}
                className="transition-transform duration-500"
              />
            </div>
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
                <p className="designer-text-secondary text-[13px] leading-relaxed line-clamp-2">
                  {td(project.description, project.descriptionEn)}
                </p>

                <div className="flex flex-wrap gap-1">
                  {project.stack.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-[#F3F1EC] dark:bg-[#22221F] designer-text-secondary text-[11px] font-mono rounded border designer-hairline"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <ul className="space-y-1 pt-2 border-t designer-hairline text-[13px] designer-text-secondary">
                  {(td('zh', 'en') === 'en' ? project.responsibilitiesEn : project.responsibilities).map(
                    (item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-[11px] font-mono designer-text-muted mt-0.5 shrink-0">
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
                  <div className="text-[11px] font-mono uppercase text-[#8A6F48] dark:text-[#C8A97E]">
                    I. {t('project.problem')}
                  </div>
                  <p className="text-[13px] designer-text-secondary leading-relaxed line-clamp-2 mt-0.5">
                    {td(project.challenges.problem, project.challenges.problemEn)}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline">
                  <div className="text-[11px] font-mono uppercase text-[#8A6F48] dark:text-[#C8A97E]">
                    II. {t('project.solution')}
                  </div>
                  <p className="text-[13px] designer-text-secondary leading-relaxed line-clamp-2 mt-0.5">
                    {td(project.challenges.solution, project.challenges.solutionEn)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openAiWithPrompt(
                      td(
                        `请深入讲讲「${project.title}」项目的技术架构与难点突破！`,
                        `Break down the architecture and engineering challenges of "${project.titleEn || project.title}"!`,
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
        const response = await axios.get('/api/projects', { params: { limit: 100 } });
        const body = response.data;
        const data: unknown = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
        if (!Array.isArray(data) || data.length === 0) return;
        const rows = data as ApiProject[];

        // Synced DB: the rows ARE the section (order, hiding, additions).
        if (isProjectsSynced(rows)) {
          const visible = sortByOrder(rows.filter((r) => r.isVisible !== false));
          if (visible.length > 0) setProjects(visible.map(toProjectData));
          return;
        }

        // Not synced yet: hardcoded copy + a few live fields from matching rows.
        const merged = DEFAULT_PROJECTS.map((defProj) => {
          const matches = defProj.key ? KNOWN_PROJECT_MATCHERS[defProj.key] : undefined;
          const dbMatch = matches ? rows.find(matches) : undefined;
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

          const combinedImages = parsedImages.length > 0 ? parsedImages : defProj.images;

          return {
            ...defProj,
            github: dbMatch.githubUrl || defProj.github,
            demoLink: defProj.id === 1 ? defProj.demoLink : dbMatch.demoUrl || defProj.demoLink,
            images: combinedImages,
          };
        });
        setProjects(merged);
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
        (proj.key === 'heshu' || proj.key === 'dreamtop')
      ) {
        return true;
      }
      if (filterLower.includes('fastapi') || filterLower.includes('python')) {
        return proj.key === 'heshu';
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
            <div className="text-xs font-mono uppercase tracking-[0.16em] designer-accent-text mb-1.5">
              03 // SELECTED WORKS
            </div>
            <h2 className="designer-heading text-[30px] sm:text-[40px] md:text-5xl lg:text-[56px] font-medium leading-[1.08] tracking-[-0.025em]">
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
