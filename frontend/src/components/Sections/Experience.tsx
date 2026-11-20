import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../../utils/axiosConfig';
import {
  Calendar,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import { getImageUrl } from '../../utils/imageUtils';
import { ImageWithFallback } from '../UI/ImageWithFallback';
import { useI18n } from '../../i18n/i18nContext';

interface ExperienceModule {
  code: string;
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
}

interface ExperienceStat {
  value: string;
  label: string;
  labelEn: string;
}

interface ExperienceItem {
  id: number;
  indexCode: string;
  position: string;
  positionEn: string;
  company: string;
  companyEn: string;
  dateLabel: string;
  dateLabelEn: string;
  tags: string[];
  description: string;
  descriptionEn: string;
  linkUrl?: string;
  linkLabel?: string;
  images: string[];
  // Featured (first) card only: top-bar tags, 2x2 modules, 4 stats and photo caption.
  featuredTags?: string[];
  highlights?: ExperienceModule[];
  metrics?: ExperienceStat[];
  photoCaption?: string;
  photoCaptionEn?: string;
}

// Presentation of the FDE residency card while the DB has no highlights/metrics for it.
const FDE_FEATURED_TAGS = ['React', 'Vite', 'TypeScript', 'FastAPI', 'LangGraph', 'PostgreSQL', '巨量引擎 API'];

const FDE_MODULES: ExperienceModule[] = [
  {
    code: '01 / AGENT',
    title: '经营 Agent（35 个只读工具）',
    titleEn: 'Operations Agent (35 Read-Only Tools)',
    desc: '到账、退费、课消、转化、投流与看板同口径直接问；异常仅拟任务草稿，人工确认后才写库。',
    descEn: 'Unified with dashboard metrics across 35 read-only tools; anomalies draft tasks requiring human approval.',
  },
  {
    code: '02 / PIPELINE',
    title: '整线绑定（驻场 15 周 · 8 部门）',
    titleEn: 'Full-Line Integration (15 Weeks · 8 Teams)',
    desc: '覆盖引流、签单、排课、售后与财务核对（FastAPI 100+ 路由），沉淀 45 份同日更新业务流程。',
    descEn: 'Covered lead-to-finance workflows across 100+ FastAPI routes with 45 same-day updated process docs.',
  },
  {
    code: '03 / WORKFLOW',
    title: '家教与雅思双线 & 三级审批硬闸',
    titleEn: 'Dual-Line Conversion & Server Hard Gates',
    desc: '家教与雅思共用一库、表前缀隔离；电子合同签审才落档，消课三级审批与课酬按日指派做在服务端。',
    descEn: 'Shared DB with table-prefix isolation; server-side hard gates for e-contracts and 3-tier approval.',
  },
  {
    code: '04 / ATTRIBUTION',
    title: '投流回台（巨量引擎 19 条 API）',
    titleEn: 'Ad Attribution (19 Ocean Engine APIs)',
    desc: '按账户、计划、广告、素材四层按日拉回消耗与线索成本；改预算须人工确认，单次不超 ±20%。',
    descEn: '4-level daily ad spend & CPL attribution via 19 official APIs; budget edits capped at ±20% with HITL.',
  },
];

const FDE_STATS: ExperienceStat[] = [
  { value: '15 Weeks', label: '连续驻场 · 对接 8 部门', labelEn: 'On-Site · 8 Teams' },
  { value: '35 Tools', label: '经营 Agent 只读工具', labelEn: 'Read-Only Agent Tools' },
  { value: '100+ Routes', label: 'FastAPI 双业务线中台', labelEn: 'FastAPI Middle Platform' },
  { value: '19 APIs', label: '巨量引擎四层投流归因', labelEn: 'Ocean Engine APIs' },
];

const FDE_PHOTO_CAPTION = { zh: '洋葱教育驻场交付现场', en: 'Onion Education On-Site Residency' };

const DEFAULT_EXPERIENCES: ExperienceItem[] = [
  {
    id: 1,
    indexCode: '01',
    position: 'FDE 驻场工程师',
    positionEn: 'Forward-Deployed Engineer (FDE Intern)',
    company: '湖南洋葱教育科技有限公司 · 教育培训经营中台',
    companyEn: 'Hunan Onion Education Technology Co., Ltd.',
    dateLabel: '2026.06 — 至今',
    dateLabelEn: 'JUN 2026 — PRESENT',
    tags: ['LangGraph', 'FastAPI', 'React', '巨量引擎 API'],
    description:
      '连续驻场 15 周对接 8 个部门，沉淀 45 份业务流程文档。落地 35 个只读工具的经营 Agent、家教与雅思双线全链路中台（FastAPI 100+ 路由）及巨量引擎 19 条 API 投流归因。',
    descriptionEn:
      'On-site for 15 weeks across 8 teams. Shipped a 35-tool Operations Agent, full-link Tutoring & IELTS middle platform across 100+ FastAPI routes, and 19 Ocean Engine ad attribution APIs.',
    images: [],
    featuredTags: FDE_FEATURED_TAGS,
    highlights: FDE_MODULES,
    metrics: FDE_STATS,
    photoCaption: FDE_PHOTO_CAPTION.zh,
    photoCaptionEn: FDE_PHOTO_CAPTION.en,
  },
  {
    id: 2,
    indexCode: '02',
    position: '农业科研 AI 写作系统 · 独立负责',
    positionEn: 'Agricultural AI Writing System · Lead Developer',
    company: 'AIFA 实验室（湖南农业大学 · 农业人工智能实验室）',
    companyEn: 'AIFA Lab · Hunan Agricultural University',
    dateLabel: '2026.03 — 至今',
    dateLabelEn: 'MAR 2026 — PRESENT',
    tags: ['Next.js 16', 'LangGraph', 'Hybrid RAG'],
    description:
      '把论文初稿从手写约 1 个月缩短至约 3 天（已出 10+ 篇初稿）。用 LangGraph 构建 46 工具可恢复写作循环，收录 2,749 篇文献（17.6 万知识块），支持 5 套期刊模板导出。',
    descriptionEn:
      'Reduced paper first-draft time from ~1 month to ~3 days (10+ drafts). Built a 46-tool LangGraph loop over 2,749 papers (176k chunks) with 5 journal export templates.',
    linkUrl: 'https://ai4science.hyxhhh.site/',
    linkLabel: 'ai4science.hyxhhh.site',
    images: [],
  },
  {
    id: 3,
    indexCode: '03',
    position: '学生团队负责人 · 一线调研',
    positionEn: 'Student Team Leader · Supply-Chain Research',
    company: '智慧农业创新中心',
    companyEn: 'Smart Agriculture Innovation Center',
    dateLabel: '2026.03 — 至今',
    dateLabelEn: 'MAR 2026 — PRESENT',
    tags: ['Supply Chain', 'Field Research', 'Team Lead'],
    description:
      '撰写山姆会员店供应链调研报告，汇报红星农批与东升农场一线调研成果，参与编书并在暑期科创营分享调研方法论。',
    descriptionEn:
      'Authored the Sam\'s Club supply-chain report, presented findings on Hongxing Market & Dongsheng Farm, and shared field methodology at the Summer Innovation Camp.',
    images: [],
  },
  {
    id: 4,
    indexCode: '04',
    position: '全栈门户 & AI 助手 · 独立开发',
    positionEn: 'Full-Stack Portal & AI Guide · Indie Developer',
    company: '个人项目 · hyxhhh.site',
    companyEn: 'Personal Project · hyxhhh.site',
    dateLabel: '2025.12 — 至今',
    dateLabelEn: 'DEC 2025 — PRESENT',
    tags: ['React 18', 'Express', 'Prisma', '智谱 GLM'],
    description:
      '11 个后台 CMS 模块 + 智谱 GLM 服务端 SSE 流式助手。照片上传经 Sharp 自动转 WebP 并提取 EXIF，支持中英文按需翻译缓存，Nginx/PM2 生产部署。',
    descriptionEn:
      '11 CMS modules + server-side GLM SSE assistant, automated Sharp WebP/EXIF pipeline, on-demand translation caching, and Nginx/PM2 deployment.',
    linkUrl: 'https://hyxhhh.site/',
    linkLabel: 'hyxhhh.site',
    images: [],
  },
  {
    id: 5,
    indexCode: '05',
    position: '「沃·创计划」第五期实习',
    positionEn: '"Wo-Chuang Plan" Cohort 5 Intern',
    company: '中国联通长沙市分公司（芙蓉区分公司）',
    companyEn: 'China Unicom Changsha Branch',
    dateLabel: '2025.07 — 2025.08',
    dateLabelEn: 'JUL 2025 — AUG 2025',
    tags: ['China Unicom', 'Operations'],
    description:
      '参加长沙联通「沃·创计划」第五期暑期实习，在芙蓉区分公司参与一线业务实践与数字化运营协作。',
    descriptionEn:
      'Participated in China Unicom Changsha Branch\'s "Wo-Chuang Plan" Cohort 5 summer internship at the Furong District Branch.',
    images: [],
  },
];

const TECH_TAG_EN_MAP: Record<string, string> = {
  '巨量引擎 API': 'Ocean Engine API',
  '巨量引擎': 'Ocean Engine API',
  '智谱 GLM': 'Zhipu GLM-4',
};

// ---- API rows (GET /api/experience) ---------------------------------------
interface ApiExperience {
  id: number;
  company?: string | null;
  companyEn?: string | null;
  position?: string | null;
  positionEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  tags?: unknown;
  linkUrl?: string | null;
  linkLabel?: string | null;
  highlights?: unknown;
  metrics?: unknown;
  images?: unknown;
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

const parseObjects = (v: unknown): Record<string, unknown>[] =>
  parseJsonArray(v).filter((x): x is Record<string, unknown> => !!x && typeof x === 'object');

const sortByOrder = <T extends { id: number; orderIndex?: number | null }>(rows: T[]): T[] =>
  [...rows].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0) || a.id - b.id);

const isExperienceSynced = (rows: ApiExperience[]) =>
  rows.some((r) => str(r.positionEn) || parseStringList(r.tags).length > 0);

const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Year/month of a stored date. The +12h shift keeps a local-midnight date saved from
// any UTC±12 timezone (e.g. 2026-05-31T16:00Z for 2026-06-01 in Beijing) in its month.
const yearMonth = (v: unknown): { y: number; m: number } | null => {
  if (typeof v !== 'string' && !(v instanceof Date)) return null;
  const t = new Date(v).getTime();
  if (Number.isNaN(t)) return null;
  const d = new Date(t + 12 * 60 * 60 * 1000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
};

// zh `2026.06 — 至今` / `2025.07 — 2025.08`; en `JUN 2026 — PRESENT` / `JUL 2025 — AUG 2025`.
const dateLabels = (start: unknown, end: unknown) => {
  const s = yearMonth(start);
  const e = yearMonth(end);
  const zh = (p: { y: number; m: number }) => `${p.y}.${String(p.m + 1).padStart(2, '0')}`;
  const en = (p: { y: number; m: number }) => `${MONTHS_EN[p.m]} ${p.y}`;
  return {
    zh: `${s ? zh(s) : ''} — ${e ? zh(e) : '至今'}`.trim(),
    en: `${s ? en(s) : ''} — ${e ? en(e) : 'PRESENT'}`.trim(),
  };
};

const isOnionFde = (r: ApiExperience) =>
  /洋葱|onion/i.test(`${r.company || ''} ${r.companyEn || ''}`);

const toExperienceItem = (row: ApiExperience, index: number): ExperienceItem => {
  const dates = dateLabels(row.startDate, row.endDate);
  const tags = parseStringList(row.tags);
  const linkUrl = str(row.linkUrl);
  const item: ExperienceItem = {
    id: row.id,
    indexCode: String(index + 1).padStart(2, '0'),
    position: str(row.position),
    positionEn: str(row.positionEn),
    company: str(row.company),
    companyEn: str(row.companyEn),
    dateLabel: dates.zh,
    dateLabelEn: dates.en,
    tags,
    description: str(row.description),
    descriptionEn: str(row.descriptionEn),
    linkUrl: linkUrl || undefined,
    linkLabel: str(row.linkLabel) || linkUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') || undefined,
    images: parseStringList(row.images).map((img) => getImageUrl(img)).filter(Boolean),
  };
  if (index > 0) return item;

  // Featured residency card: modules from `highlights`, stats from `metrics`; the known
  // FDE residency keeps its hardcoded presentation while those are still empty.
  const known = isOnionFde(row);
  const highlights = parseObjects(row.highlights)
    .map((h) => ({
      code: str(h.code),
      title: str(h.title),
      titleEn: str(h.titleEn),
      desc: str(h.desc),
      descEn: str(h.descEn),
    }))
    .filter((h) => h.title || h.desc);
  const metrics = parseObjects(row.metrics)
    .map((m) => ({ value: str(m.value), label: str(m.label), labelEn: str(m.labelEn) }))
    .filter((m) => m.value || m.label);
  return {
    ...item,
    featuredTags: tags.length > 0 ? tags : known ? FDE_FEATURED_TAGS : [],
    highlights: highlights.length > 0 ? highlights : known ? FDE_MODULES : [],
    metrics: metrics.length > 0 ? metrics : known ? FDE_STATS : [],
    photoCaption: known ? FDE_PHOTO_CAPTION.zh : undefined,
    photoCaptionEn: known ? FDE_PHOTO_CAPTION.en : undefined,
  };
};

const FeaturedResidencyCard: React.FC<{
  item: ExperienceItem;
  onOpenLightbox: (images: string[], idx: number) => void;
}> = ({ item, onOpenLightbox }) => {
  const { td } = useI18n();
  const [imgIndex, setImgIndex] = useState(0);
  const images = item.images && item.images.length > 0 ? item.images : [];
  const topTags = item.featuredTags ?? item.tags;
  const modules = item.highlights ?? [];
  const stats = item.metrics ?? [];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="designer-card rounded-2xl overflow-hidden mb-6"
    >
      {/* Top Bar */}
      <div className="px-4 sm:px-6 py-3 border-b designer-hairline bg-[#FAF9F5] dark:bg-[#141412] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="px-2 py-0.5 rounded bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] font-semibold">
            RESIDENCY // {item.indexCode}
          </span>
          <span className="text-[#8A6F48] dark:text-[#C8A97E] font-medium flex items-center gap-1.5">
            <Calendar className="w-3 h-3 stroke-[1.5]" />
            {td(item.dateLabel, item.dateLabelEn)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {topTags.map(
            (tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded bg-[#F3F1EC] dark:bg-[#22221F] designer-text-secondary border designer-hairline text-[11px]"
              >
                {td(tech, TECH_TAG_EN_MAP[tech] || tech)}
              </span>
            ),
          )}
        </div>
      </div>

      {/* 12-Col Split Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 7 Cols: Concise 2x2 Modules */}
        <div className="lg:col-span-7 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r designer-hairline flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold tracking-tight designer-text-primary">
                {td(item.position, item.positionEn)}
              </h3>
              <p className="text-xs font-mono designer-text-secondary mt-0.5">
                {td(item.company, item.companyEn)}
              </p>
            </div>

            {modules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modules.map((mod, idx) => (
                  <div
                    key={`${mod.code}-${idx}`}
                    className="p-3.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline"
                  >
                    <div className="text-[11px] font-mono designer-text-muted mb-0.5">
                      {mod.code}
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold designer-text-primary mb-1">
                      {td(mod.title, mod.titleEn)}
                    </h4>
                    <p className="text-[13px] designer-text-secondary leading-relaxed">
                      {td(mod.desc, mod.descEn)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              item.description && (
                <p className="text-sm sm:text-[15px] designer-text-secondary leading-relaxed max-w-2xl">
                  {td(item.description, item.descriptionEn)}
                </p>
              )
            )}
          </div>
        </div>

        {/* Right 5 Cols: Photo Preview + 4 Compact Numbers */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#FAF9F5]/50 dark:bg-[#121210]/50">
          {images.length > 0 && (
            <div
              onClick={() => onOpenLightbox(images, imgIndex)}
              className="relative h-52 sm:h-56 border-b designer-hairline overflow-hidden cursor-pointer group bg-[#141413]"
            >
              <ImageWithFallback
                src={images[imgIndex]}
                thumbnailSrc={images[imgIndex]}
                alt={td(item.position, item.positionEn)}
                adaptiveFrame={true}
                className="transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent flex items-end justify-between p-3.5">
                <span className="text-xs font-mono text-white">
                  {td(item.photoCaption || item.company, item.photoCaptionEn || item.companyEn)}
                </span>
                <Maximize2 className="w-3.5 h-3.5 text-white shrink-0 stroke-[1.5]" />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous photo"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-10"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next photo"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-10"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}

          {stats.length > 0 && (
            <div className="grid grid-cols-2 gap-px bg-[var(--border-hairline)] flex-1">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-3 sm:p-3.5 flex flex-col justify-center bg-[var(--bg-card)]">
                  <div className="text-sm sm:text-lg font-mono font-bold designer-text-primary">
                    {stat.value}
                  </div>
                  <div className="text-[11px] sm:text-xs designer-text-secondary mt-0.5">
                    {td(stat.label, stat.labelEn)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// One entry on the vertical timeline that follows the featured residency card.
// Desktop: date column | rail + dot | content. Mobile: a single column hung off the rail.
// Ongoing roles ("至今") get a filled dot so the reader sees what is current at a glance.
const ChronicleTimelineEntry: React.FC<{
  item: ExperienceItem;
  index: number;
  isLast: boolean;
  onOpenLightbox: (images: string[], idx: number) => void;
}> = ({ item, index, isLast, onOpenLightbox }) => {
  const { td } = useI18n();
  const images = item.images && item.images.length > 0 ? item.images : [];
  const isCurrent = item.dateLabel.includes('至今');
  const dotClass = `absolute -left-[5px] w-[9px] h-[9px] rounded-full border-2 border-[var(--accent-label)] ${
    isCurrent
      ? 'bg-[var(--accent-label)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent-label)_18%,transparent)]'
      : 'bg-[var(--bg-alt)]'
  }`;

  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative grid grid-cols-1 md:grid-cols-[176px_1fr] md:gap-x-10"
    >
      {/* Date label: own column on desktop, sits on the rail on mobile */}
      <div className="relative pl-7 border-l designer-hairline md:border-l-0 md:pl-0 md:pt-0.5 md:text-right">
        <span aria-hidden="true" className={`md:hidden top-1 ${dotClass}`} />
        <div className="text-xs font-mono designer-text-secondary tabular-nums">
          {td(item.dateLabel, item.dateLabelEn)}
        </div>
        <div className="mt-1 text-[11px] font-mono designer-text-muted">{item.indexCode}</div>
      </div>

      {/* Content hung off the rail */}
      <div
        className={`relative pl-7 md:pl-10 border-l designer-hairline pt-2.5 md:pt-0 ${
          isLast ? 'pb-1' : 'pb-10 sm:pb-12'
        }`}
      >
        <span aria-hidden="true" className={`hidden md:block top-1.5 ${dotClass}`} />

        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight designer-text-primary leading-snug">
                {td(item.position, item.positionEn)}
              </h3>
              {item.linkUrl && (
                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-xs font-mono designer-accent-text hover:underline underline-offset-4 shrink-0"
                >
                  <span>{item.linkLabel || 'Link'}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="mt-1 text-[13px] designer-text-secondary">{td(item.company, item.companyEn)}</p>
            <p className="mt-3 text-sm sm:text-[15px] designer-text-secondary leading-relaxed max-w-2xl">
              {td(item.description, item.descriptionEn)}
            </p>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-[var(--bg-card)] designer-text-secondary border designer-hairline"
                >
                  {td(tag, TECH_TAG_EN_MAP[tag] || tag)}
                </span>
              ))}
            </div>
          </div>

          {images.length > 0 && (
            <div
              onClick={() => onOpenLightbox(images, 0)}
              className="w-full sm:w-40 aspect-[4/3] rounded-xl overflow-hidden border designer-hairline shrink-0 cursor-pointer group relative bg-[#141413]"
            >
              <ImageWithFallback
                src={images[0]}
                thumbnailSrc={images[0]}
                alt={td(item.position, item.positionEn)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.li>
  );
};

export const Experience: React.FC = () => {
  const { t, td } = useI18n();
  const [experiences, setExperiences] = useState<ExperienceItem[]>(DEFAULT_EXPERIENCES);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<{ src: string }[]>([]);

  const openLightbox = (images: string[], index: number) => {
    setLightboxSlides(images.map((img) => ({ src: img })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await axios.get('/api/experience');
        const data = response.data?.data || response.data || [];
        if (Array.isArray(data) && data.length > 0) {
          // Synced DB: the rows ARE the section (order, hiding, additions).
          if (isExperienceSynced(data as ApiExperience[])) {
            const visible = sortByOrder((data as ApiExperience[]).filter((r) => r.isVisible !== false));
            if (visible.length > 0) setExperiences(visible.map(toExperienceItem));
            return;
          }

          // Not synced yet: hardcoded copy + uploaded photos from matching rows.
          setExperiences((prev) =>
            prev.map((defExp) => {
              const found = data.find(
                (d: any) =>
                  d.company &&
                  (d.company.includes(defExp.company.slice(0, 4)) ||
                    defExp.company.includes(d.company.slice(0, 4))),
              );
              if (!found) return defExp;
              let imgs: string[] = [];
              if (Array.isArray(found.images) && found.images.length > 0) {
                imgs = found.images.map((img: string) => getImageUrl(img));
              } else if (typeof found.images === 'string' && found.images.trim().startsWith('[')) {
                try {
                  imgs = JSON.parse(found.images).map((img: string) => getImageUrl(img));
                } catch {
                  imgs = [];
                }
              }
              return imgs.length > 0 ? { ...defExp, images: imgs } : defExp;
            }),
          );
        }
      } catch {
        // Keep DEFAULT_EXPERIENCES
      }
    };

    fetchExperiences();
  }, []);

  const featuredFde = experiences[0];
  const chronicleItems = experiences.slice(1);

  return (
    <section
      id="experience"
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
              04 // EXPERIENCE
            </div>
            <h2 className="designer-heading text-[30px] sm:text-[40px] md:text-5xl lg:text-[56px] font-medium leading-[1.08] tracking-[-0.025em]">
              {t('experience.title')}
            </h2>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {featuredFde && (
            <FeaturedResidencyCard item={featuredFde} onOpenLightbox={openLightbox} />
          )}

          {chronicleItems.length > 0 && (
            <div className="mt-12 sm:mt-16">
              <div className="mb-6 sm:mb-8 md:pl-[256px] text-xs font-mono uppercase tracking-[0.16em] designer-text-muted">
                {td('TIMELINE // 更多经历', 'TIMELINE // MORE')}
              </div>
              <ol className="relative">
                {chronicleItems.map((exp, index) => (
                  <ChronicleTimelineEntry
                    key={exp.id}
                    item={exp}
                    index={index}
                    isLast={index === chronicleItems.length - 1}
                    onOpenLightbox={openLightbox}
                  />
                ))}
              </ol>
            </div>
          )}
        </div>

        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={lightboxSlides}
          plugins={[Captions]}
        />
      </div>
    </section>
  );
};
