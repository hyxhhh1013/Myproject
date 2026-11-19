import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from '../../utils/axiosConfig';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  GraduationCap,
  Github,
  GitBranch,
  ExternalLink,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { scroller } from 'react-scroll';
import { ImageWithFallback } from '../UI/ImageWithFallback';
import { getImageUrl } from '../../utils/imageUtils';
import { NowComponent } from '../UI/NowComponent';
import { TechStackMarquee } from '../UI/TechStackMarquee';
import { TimeZoneComponent } from '../UI/TimeZoneComponent';
import { useI18n } from '../../i18n/i18nContext';
import { useAppStore } from '../../store/useAppStore';
import { playTactileClick } from '../../utils/soundEffects';

const DEFAULT_BIO_ZH = `湖南农业大学 · 信息与智能科学技术学院 · 计算机科学与技术 2024 级本科在读（2028 届）。目前在湖南洋葱教育担任驻场 FDE，对接教育培训经营中台与 35 个工具的经营 Agent；同时独立负责 AIFA 实验室「禾书耕文」科研写作系统，并参与智慧农业创新中心一线供应链调研。

深度践行 AI 原生开发（Cursor / Claude Code / Codex / Trae，日均使用 2 亿 token），一条线从现场需求梳理、LangGraph/RAG 架构设计做到生产部署。欢迎聊项目合作或 AI Agent / 全栈实习！`;

const DEFAULT_BIO_EN = `B.Eng. student in Computer Science & Technology at Hunan Agricultural University (Class of 28). Currently serving as an on-site Forward-Deployed Engineer (FDE) Intern at Hunan Onion Education while independently leading "HeShu" (an AI4Science research writing system at AIFA Lab) and conducting supply-chain field research.

An AI-native builder (~200M tokens/day across Cursor, Claude Code, Codex & Trae) delivering end-to-end systems from 0 to 1.`;

interface GithubRepoItem {
  name: string;
  displayName: string;
  displayNameEn?: string;
  url: string;
  language: string;
  stars: number;
  pushedAt: string;
  descZh: string;
  descEn: string;
}

interface GithubContribDay {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  count: number;
}

const REPO_EN_MAP: Record<string, { displayNameEn: string; descEn: string }> = {
  TravelWeather: {
    displayNameEn: 'TravelWeather · Travel Meteorology',
    descEn: 'Python-based travel meteorology aggregation, forecasting & data analysis tool',
  },
  'AI-assisted-writing-system-for-agricultural-research': {
    displayNameEn: 'HeShu · AI4Science Writing System',
    descEn: '46-tool LangGraph recoverable writing loop & 2,749-paper Hybrid RAG system',
  },
  Myproject: {
    displayNameEn: 'hyxhhh.site · Portfolio & Agent',
    descEn: 'Full-stack portfolio with 11 CMS modules, 12-tool Agent Co-Pilot & 3D WebGL Island',
  },
  Outbounds: {
    displayNameEn: 'Outbounds · Multi-Universe Hub',
    descEn: 'ByteDance Trae 2nd Prize · Multi-universe community built with Next.js 16 & React 19',
  },
  'dream-topology': {
    displayNameEn: 'DreamTop · Subconscious Topology',
    descEn: 'ByteDance Trae 3rd Prize · Voice/Text dream symbol extraction & 60fps topology graph',
  },
  CropManagement: {
    displayNameEn: 'CropManagement · Agronomic DB',
    descEn: 'Agricultural crop variety metadata management & analytical query platform',
  },
  'agri-crop': {
    displayNameEn: 'agri-crop · Crop Variety Management',
    descEn: 'Agricultural crop variety metadata management & analytical query platform',
  },
  'ai-daily': {
    displayNameEn: 'ai-daily · AI Engineering Daily',
    descEn: 'Daily full-stack & AI agent engineering practice repository',
  },
};

const HEATMAP_WEEKS = 52;

function expandToWeeks(rawWeeks: GithubContribDay[][], targetWeeks = HEATMAP_WEEKS): GithubContribDay[][] {
  if (!Array.isArray(rawWeeks) || rawWeeks.length === 0) return buildInitialWeeks(targetWeeks);
  if (rawWeeks.length >= targetWeeks) return rawWeeks.slice(-targetWeeks);

  const missingCount = targetWeeks - rawWeeks.length;
  const firstDateStr = rawWeeks[0]?.[0]?.date;
  const firstDate = firstDateStr ? new Date(`${firstDateStr}T00:00:00Z`) : new Date();
  const prefixWeeks: GithubContribDay[][] = [];

  for (let w = missingCount; w >= 1; w--) {
    const week: GithubContribDay[] = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(firstDate);
      dt.setUTCDate(firstDate.getUTCDate() - w * 7 + d);
      const iso = dt.toISOString().slice(0, 10);
      week.push({ date: iso, level: 0, count: 0 });
    }
    prefixWeeks.push(week);
  }

  return [...prefixWeeks, ...rawWeeks];
}

const DEFAULT_REPOS: GithubRepoItem[] = [
  {
    name: 'TravelWeather',
    displayName: 'TravelWeather · 出行气象分析',
    displayNameEn: 'TravelWeather · Travel Meteorology',
    url: 'https://github.com/hyxhhh1013/TravelWeather',
    language: 'Python',
    stars: 1,
    pushedAt: '2026-11-18T03:43:52Z',
    descZh: '基于 Python 的旅行城市气象数据聚合、趋势预测与可视化分析工具',
    descEn: 'Python-based travel meteorology aggregation, forecasting & data analysis tool',
  },
  {
    name: 'AI-assisted-writing-system-for-agricultural-research',
    displayName: 'HeShu · AI4Science 禾书耕文',
    displayNameEn: 'HeShu · AI4Science Writing System',
    url: 'https://github.com/hyxhhh1013/AI-assisted-writing-system-for-agricultural-research',
    language: 'TypeScript / LangGraph',
    stars: 2,
    pushedAt: '2026-11-15T14:20:00Z',
    descZh: '农业科研论文 AI 写作系统 · 46 工具可恢复循环 + 11 路 SSE + 2,749 篇文献混合检索',
    descEn: '46-tool LangGraph recoverable writing loop & 2,749-paper Hybrid RAG system',
  },
  {
    name: 'Myproject',
    displayName: 'hyxhhh.site · 个人门户与 Agent',
    displayNameEn: 'hyxhhh.site · Portfolio & Agent',
    url: 'https://github.com/hyxhhh1013/Myproject',
    language: 'TypeScript / Node.js',
    stars: 1,
    pushedAt: '2026-11-19T02:00:00Z',
    descZh: '个人全栈门户 + 11 个 CMS 模块 + 12 工具 Page-Aware Agent 副驾驶与 3D 拾遗岛',
    descEn: 'Full-stack portfolio with 11 CMS modules, 12-tool Agent Co-Pilot & 3D WebGL Island',
  },
  {
    name: 'Outbounds',
    displayName: 'Outbounds · 界外多宇宙社区',
    displayNameEn: 'Outbounds · Multi-Universe Hub',
    url: 'https://github.com/hyxhhh1013/Outbounds',
    language: 'Next.js 16 / React 19',
    stars: 2,
    pushedAt: '2026-10-28T11:15:00Z',
    descZh: '字节跳动 Trae 中南大学二等奖 · Hacker / Art / ACG 三主题宇宙与跨宇宙 AI 伴侣',
    descEn: 'ByteDance Trae 2nd Prize · Multi-universe community built with Next.js 16 & React 19',
  },
];

function buildInitialWeeks(numWeeks = HEATMAP_WEEKS): GithubContribDay[][] {
  const today = new Date();
  const totalDays = numWeeks * 7;
  const start = new Date(today);
  start.setUTCDate(today.getUTCDate() - (totalDays - 1));

  const weeks: GithubContribDay[][] = [];
  let currentWeek: GithubContribDay[] = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    currentWeek.push({ date: iso, level: 0, count: 0 });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  return weeks;
}

export const About = () => {
  const { t, td } = useI18n();
  const { setActiveSkillFilter } = useAppStore();

  const [profile, setProfile] = useState<any>({
    name: '黄奕轩',
    title: 'FDE / AI 全栈实习生 · 2024级本科在读',
    email: 'hyxhhh1013@gmail.com',
    location: '中国 · 湖南长沙',
    bio: DEFAULT_BIO_ZH,
    avatar: 'https://avatars.githubusercontent.com/hyxhhh1013',
  });

  const [githubRepos, setGithubRepos] = useState<GithubRepoItem[]>(DEFAULT_REPOS);
  const [contribWeeks, setContribWeeks] = useState<GithubContribDay[][]>(() => buildInitialWeeks());
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(false);
  const [syncingGithub, setSyncingGithub] = useState<boolean>(false);
  const [hoveredDay, setHoveredDay] = useState<GithubContribDay | null>(null);

  const fetchGithubTelemetry = useCallback(async (forceRefresh = false) => {
    setSyncingGithub(true);
    try {
      const response = await axios.get(
        `/api/ai/github-telemetry${forceRefresh ? '?refresh=true' : ''}`,
      );
      const data = response.data;
      if (data && data.success) {
        if (Array.isArray(data.repos) && data.repos.length > 0) {
          setGithubRepos(data.repos.slice(0, 4));
        }
        if (Array.isArray(data.weeks) && data.weeks.length > 0) {
          setContribWeeks(expandToWeeks(data.weeks, HEATMAP_WEEKS));
        }
        if (typeof data.totalContributions === 'number') {
          setTotalContributions(data.totalContributions);
        }
        setIsLiveSynced(Boolean(data.isLive));
      }
    } catch {
      // Fallback to default repos and empty weeks
    } finally {
      setSyncingGithub(false);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/users/1');
        const data = response.data?.data || response.data;
        if (data && data.name && data.name !== '张三' && data.name !== 'Admin') {
          setProfile((prev: any) => ({
            ...prev,
            ...data,
            bio: data.bio && data.bio.length > 40 ? data.bio : prev.bio,
            avatar: data.avatar ? getImageUrl(data.avatar) : prev.avatar,
          }));
        }
      } catch {
        // Keep default profile
      }
    };

    fetchProfile();
    fetchGithubTelemetry(false);
  }, [fetchGithubTelemetry]);

  const formatPushedDate = (isoDate: string) => {
    if (!isoDate) return '';
    try {
      const d = new Date(isoDate);
      if (Number.isNaN(d.getTime())) return '';
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
        d.getDate(),
      ).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  const getLevelColorClass = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 4:
        return 'bg-[#141413] dark:bg-[#F2F0EA]';
      case 3:
        return 'bg-[#8A6F48] dark:bg-[#C8A97E]';
      case 2:
        return 'bg-[#B59A72] dark:bg-[#8A7250]';
      case 1:
        return 'bg-[#D6C8B0] dark:bg-[#4A4133]';
      default:
        return 'bg-[#EAE6DC] dark:bg-[#22211D]';
    }
  };

  // Compute month labels for the heatmap columns
  const monthLabels = useMemo(() => {
    const monthsEn = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    let lastMonth = -1;
    return contribWeeks.map((week) => {
      const firstDay = week[0]?.date;
      if (!firstDay) return '';
      const m = parseInt(firstDay.slice(5, 7), 10) - 1;
      if (m !== lastMonth && m >= 0 && m < 12) {
        lastMonth = m;
        return monthsEn[m];
      }
      return '';
    });
  }, [contribWeeks]);

  const handleTechClick = (techName: string) => {
    setActiveSkillFilter(techName);
    scroller.scrollTo('skills', { smooth: true, duration: 500, offset: -70 });
  };

  return (
    <section
      id="about"
      className="py-20 sm:py-24 transition-colors duration-300"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto mb-10 pb-4 border-b designer-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest designer-accent-text mb-1.5">
              01 // PROFILE &amp; TELEMETRY
            </div>
            <h2 className="designer-heading text-3xl md:text-4xl font-normal tracking-[-0.02em]">
              {t('about.title')}
            </h2>
          </div>
          <p className="designer-text-muted text-xs sm:text-sm font-mono">
            {t('about.subtitle')}
          </p>
        </motion.div>

        {/* Clean 4-Card Bento Grid + Bottom Marquee */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {/* Card 1: Main Bio & Core Edge Tags (2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-2 designer-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-4 border-b designer-hairline">
                <div className="w-14 h-14 rounded-xl overflow-hidden border designer-hairline shrink-0">
                  <ImageWithFallback
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold tracking-tight designer-text-primary">
                      {td(profile.name, 'Huang Yixuan')}
                    </h3>
                    <span className="px-2.5 py-0.5 text-[10px] font-mono rounded-full bg-[#F3F1EC] dark:bg-[#22221F] text-[#8A6F48] dark:text-[#C8A97E] border designer-hairline">
                      ENFJ · AI-NATIVE BUILDER
                    </span>
                  </div>
                  <div className="mt-1">
                    <NowComponent />
                  </div>
                </div>
              </div>

              <p className="text-sm designer-text-secondary leading-[1.8] whitespace-pre-line font-normal">
                {td(profile.bio || DEFAULT_BIO_ZH, DEFAULT_BIO_EN)}
              </p>
            </div>

            {/* 3 Concise Edge Pills + Direct Email */}
            <div className="mt-5 pt-4 border-t designer-hairline flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded-md bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline designer-text-primary">
                  ⚡ {td('日均 2 亿 Token AI 原生开发', '200M+ Tokens/Day AI Workflow')}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline designer-text-primary">
                  🕸️ LangGraph · Hybrid RAG
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline designer-text-primary">
                  🚀 {td('0→1 端到端交付', '0→1 Full-Stack Delivery')}
                </span>
              </div>

              <a
                href={`mailto:${profile.email}`}
                className="text-xs font-mono font-medium designer-text-primary hover:text-[#8A6F48] inline-flex items-center gap-1 underline underline-offset-4"
              >
                <span>{profile.email}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

          {/* Card 2: Time & Location (1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="lg:col-span-1"
          >
            <TimeZoneComponent location={profile.location || '中国 · 湖南长沙'} />
          </motion.div>

          {/* Card 3: Education, Labs & Quick Contact (1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-1 designer-card p-6 rounded-2xl flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest designer-text-muted pb-3 mb-3.5 border-b designer-hairline">
                <GraduationCap className="w-3.5 h-3.5 text-[#8A6F48] stroke-[1.5]" />
                <span>{t('about.education.title')}</span>
              </div>
              <h4 className="text-base sm:text-lg font-semibold designer-text-primary">
                {t('about.education.school')}
              </h4>
              <p className="text-xs sm:text-sm text-[#8A6F48] dark:text-[#C8A97E] font-medium mt-0.5">
                {t('about.education.major')}
              </p>
              <p className="text-xs font-mono designer-text-muted mt-1">
                {t('about.education.time')}
              </p>

              <div className="mt-3 pt-3 border-t designer-hairline space-y-2 text-xs designer-text-secondary">
                <div>
                  <span className="font-mono text-[10px] text-[#8A6F48] dark:text-[#C8A97E]">LABS // </span>
                  {td('农业人工智能实验室 (AIFA) · 蝮蛇信息安全实验室', 'AIFA Lab · Viper InfoSec Lab')}
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#8A6F48] dark:text-[#C8A97E]">COURSES // </span>
                  {td('数据结构 · 计网 · 操作系统 · 数据库 · 网安', 'DSA · Networks · OS · DB · Security')}
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#8A6F48] dark:text-[#C8A97E]">TARGET // </span>
                  {td('AI Agent 工程 · AI 全栈研发 · FDE 驻场（可立即到岗 5天/周 × 3–6个月）', 'AI Agent · Full-Stack · FDE Intern (Immediate · 5d/wk · 3–6 mos)')}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t designer-hairline text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="designer-text-muted flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#8A6F48] stroke-[1.5]" />
                  {t('about.info.location')}
                </span>
                <span className="font-medium designer-text-primary">
                  {td('深圳 / 杭州 / 长沙', 'SZ / HZ / CS')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="designer-text-muted flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8A6F48] stroke-[1.5]" />
                  {t('about.info.email')}
                </span>
                <a
                  href={`mailto:${profile.email}`}
                  className="font-medium designer-text-primary hover:underline"
                >
                  {profile.email}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Live GitHub Open Source Activity & Contribution Heatmap (2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.14 }}
            className="lg:col-span-2 designer-card p-6 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b designer-hairline">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 designer-text-primary stroke-[1.5]" />
                  <h3 className="text-xs font-mono uppercase tracking-widest designer-text-muted">
                    {t('about.github.title')}
                  </h3>
                  <span className="text-xs font-mono text-[#8A6F48] dark:text-[#C8A97E]">
                    @hyxhhh1013
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isLiveSynced ? td('实时同步', 'LIVE SYNC') : 'SYNCED'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      fetchGithubTelemetry(true);
                    }}
                    disabled={syncingGithub}
                    title={td('从 GitHub 实时刷新仓库与贡献热力图', 'Force sync from GitHub API')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F3F1EC] dark:bg-[#1E1E1B] border designer-hairline text-[10px] font-mono designer-text-secondary hover:designer-text-primary transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncingGithub ? 'animate-spin text-[#8A6F48]' : ''}`} />
                    <span>{td('刷新同步', 'Sync')}</span>
                  </button>

                  <a
                    href="https://github.com/hyxhhh1013"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono designer-text-primary hover:opacity-75"
                  >
                    <span className="hidden sm:inline">GITHUB.COM/HYXHHH1013</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* 2x2 Live Recently Pushed Repositories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {githubRepos.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline hover:border-[#8A6F48] transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-semibold designer-text-primary flex items-center gap-1.5 min-w-0">
                        <GitBranch className="w-3.5 h-3.5 text-[#8A6F48] shrink-0" />
                        <span className="truncate">
                          {td(
                            repo.displayName,
                            repo.displayNameEn ||
                              REPO_EN_MAP[repo.name]?.displayNameEn ||
                              repo.name,
                          )}
                        </span>
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-[#EAE6DC] dark:bg-[#262622] text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E] shrink-0">
                        {repo.language.split('/')[0].trim()}
                      </span>
                    </div>
                    <p className="text-xs designer-text-secondary mt-1 line-clamp-1">
                      {td(repo.descZh, repo.descEn)}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono designer-text-muted">
                      <span>
                        {td(
                          `最近推送: ${formatPushedDate(repo.pushedAt)}`,
                          `Pushed: ${formatPushedDate(repo.pushedAt)}`,
                        )}
                      </span>
                      <span className="group-hover:text-[#8A6F48] transition-colors">
                        REPO ↗
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Live 28-Week x 7-Day Contribution Heatmap */}
            <div className="pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono designer-text-muted mb-1.5">
                <span>
                  {hoveredDay
                    ? td(
                        `${hoveredDay.date} · ${hoveredDay.count} 次代码提交/贡献`,
                        `${hoveredDay.date} · ${hoveredDay.count} contribution${hoveredDay.count === 1 ? '' : 's'}`,
                      )
                    : `${t('about.github.commits')} (${totalContributions} ${td('次近期贡献', 'contributions')})`}
                </span>
                <div className="flex items-center gap-1 text-[10px]">
                  <span>{td('少', 'Less')}</span>
                  {([0, 1, 2, 3, 4] as const).map((lvl) => (
                    <span
                      key={lvl}
                      className={`w-2.5 h-2.5 rounded-[2px] inline-block ${getLevelColorClass(lvl)}`}
                    />
                  ))}
                  <span>{td('多', 'More')}</span>
                </div>
              </div>

              <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* Month Headers — Fine 48-Week Compact Grid */}
                <div
                  className="grid gap-[3px] mb-1 min-w-[480px] w-full"
                  style={{
                    gridTemplateColumns: `repeat(${contribWeeks.length}, minmax(0, 1fr))`,
                  }}
                >
                  {monthLabels.map((mLabel, idx) => (
                    <div
                      key={idx}
                      className="text-[9px] font-mono text-[#8A6F48] dark:text-[#C8A97E] overflow-visible whitespace-nowrap leading-none"
                    >
                      {mLabel}
                    </div>
                  ))}
                </div>

                {/* 48 Weeks x 7 Days Matrix — Delicate ~11px Cells */}
                <div
                  className="grid gap-[3px] min-w-[480px] w-full"
                  style={{
                    gridTemplateColumns: `repeat(${contribWeeks.length}, minmax(0, 1fr))`,
                  }}
                >
                  {contribWeeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.map((day, dIdx) => (
                        <div
                          key={`${wIdx}-${dIdx}`}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          title={`${day.date}: ${day.count} contributions`}
                          className={`w-full aspect-square rounded-[2px] transition-transform hover:scale-125 cursor-pointer ${getLevelColorClass(
                            day.level,
                          )}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Interactive Tech Stack Marquee (3 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="lg:col-span-3"
          >
            <TechStackMarquee onSelectTech={handleTechClick} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
