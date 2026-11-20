import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ChevronRight,
  RotateCcw,
  Utensils,
  Music,
  Compass,
  X,
} from 'lucide-react';
import { scroller } from 'react-scroll';
import { useI18n } from '../../i18n/i18nContext';
import { useAppStore } from '../../store/useAppStore';
import { playToggleSwitch, playSuccessChime } from '../../utils/soundEffects';

interface SkillItem {
  id: number;
  indexCode: string;
  name: string;
  nameEn: string;
  shortLabel: string;
  badgeZh: string;
  badgeEn: string;
  metrics: { value: string; labelZh: string; labelEn: string }[];
  stack: string[];
  projects: { zh: string; en: string }[];
  highlightZh: string;
  highlightEn: string;
}

const DEFAULT_CORE_SKILLS: SkillItem[] = [
  {
    id: 1,
    indexCode: '01',
    name: 'LangGraph / Multi-Agent 编排',
    nameEn: 'LangGraph / Multi-Agent Orchestration',
    shortLabel: 'LangGraph',
    badgeZh: '46 工具',
    badgeEn: '46 Tools',
    metrics: [
      { value: '46', labelZh: '可恢复编排工具', labelEn: 'Recoverable Tools' },
      { value: '35', labelZh: '只读经营工具', labelEn: 'Read-Only Ops Tools' },
      { value: 'HITL', labelZh: '人工审批硬闸', labelEn: 'Write Approval Gate' },
    ],
    stack: ['LangGraph', 'StateGraph', 'HITL Gate', 'Multi-Agent', 'SSE'],
    projects: [
      { zh: '禾书耕文 (AI4Science)', en: 'HeShu AI4Science' },
      { zh: '洋葱教育 FDE 驻场工程', en: 'Onion Edu FDE Systems' },
      { zh: '个人门户 Agent 工作台', en: 'Portfolio Agent Workbench' },
    ],
    highlightZh:
      '可恢复状态图（plan→agent→tools→reflect）、46 工具编排、35 个只读经营工具与人工审批硬闸（HITL Gate）。',
    highlightEn:
      'Recoverable state graphs (plan→agent→tools→reflect), 46-tool loops, 35 read-only ops tools & HITL write gates.',
  },
  {
    id: 2,
    indexCode: '02',
    name: 'Hybrid RAG / 向量检索与重排',
    nameEn: 'Hybrid RAG & Reranking Pipeline',
    shortLabel: 'Hybrid RAG',
    badgeZh: '2,749 篇文献',
    badgeEn: '2,749 Papers',
    metrics: [
      { value: '2,749', labelZh: '结构化科研文献', labelEn: 'Indexed Papers' },
      { value: '176K', labelZh: '切分知识块', labelEn: 'Knowledge Chunks' },
      { value: 'RRF', labelZh: '双路融合重排', labelEn: 'Fusion Rerank' },
    ],
    stack: ['BM25', 'pgvector', 'RRF Rerank', 'Citation Gate', 'Embeddings'],
    projects: [
      { zh: '禾书耕文 (AI4Science)', en: 'HeShu AI4Science' },
      { zh: '个人门户 Agent 工作台', en: 'Portfolio Agent Workbench' },
    ],
    highlightZh:
      '2,749 篇文献（176,230 知识块）BM25 + 向量检索 + RRF 融合重排，越界引用写回前剥离与落表硬闸校验。',
    highlightEn:
      '2,749 papers (176,230 chunks) BM25 + Vector + RRF fusion reranking with strict citation verification gates.',
  },
  {
    id: 3,
    indexCode: '03',
    name: 'Python / FastAPI 后端与数据中台',
    nameEn: 'Python / FastAPI & Middle Platform',
    shortLabel: 'FastAPI',
    badgeZh: '100+ 路由',
    badgeEn: '100+ Routes',
    metrics: [
      { value: '100+', labelZh: '双业务线路由', labelEn: 'Production Routes' },
      { value: '11', labelZh: 'SSE 检查点流', labelEn: 'SSE Channels' },
      { value: '19', labelZh: '巨量引擎归因接口', labelEn: 'Attribution APIs' },
    ],
    stack: ['FastAPI', 'Python', 'Node.js', 'SSE Streaming', 'REST'],
    projects: [
      { zh: '洋葱教育 FDE 驻场工程', en: 'Onion Edu FDE Systems' },
      { zh: '禾书耕文 (AI4Science)', en: 'HeShu AI4Science' },
    ],
    highlightZh:
      '独立贯穿 100+ 路由双业务线中台、11 路 SSE 检查点流式推送、消课三级审批服务端硬闸与 19 条巨量引擎 API 归因。',
    highlightEn:
      '100+ FastAPI routes across dual business lines, 11-channel SSE checkpoint streaming & 19 Ocean Engine APIs.',
  },
  {
    id: 4,
    indexCode: '04',
    name: 'Tool Calling / MCP & Context 工程',
    nameEn: 'Tool Calling / MCP & Context Eng.',
    shortLabel: 'MCP/Tools',
    badgeZh: '多模型路由',
    badgeEn: 'Multi-LLM',
    metrics: [
      { value: 'MCP', labelZh: '标准工具协议', labelEn: 'Tool Protocol' },
      { value: '4D', labelZh: '学术诚信审查', labelEn: 'Integrity Checks' },
      { value: '3+', labelZh: '异构模型路由', labelEn: 'LLM Providers' },
    ],
    stack: ['Tool Schema', 'MCP', 'DeepSeek', 'GLM-4', 'Context Compression'],
    projects: [
      { zh: '禾书耕文 (AI4Science)', en: 'HeShu AI4Science' },
      { zh: '洋葱教育 FDE 驻场工程', en: 'Onion Edu FDE Systems' },
      { zh: '梦境拓扑 DreamTop', en: 'DreamTop Topology' },
    ],
    highlightZh:
      '结构化 Tool Schema 设计、长上下文防漂移压缩、DeepSeek / GLM-4 / Claude 多模型路由与四维学术诚信审查。',
    highlightEn:
      'Structured Tool Schemas, long-context drift prevention, multi-LLM routing (DeepSeek/GLM-4) & 4D integrity checks.',
  },
  {
    id: 5,
    indexCode: '05',
    name: 'PostgreSQL / Prisma 数据建模',
    nameEn: 'PostgreSQL / Prisma & Vector DB',
    shortLabel: 'PG/Prisma',
    badgeZh: '财务 0.1 精度',
    badgeEn: 'Multi-Tenant',
    metrics: [
      { value: '0.1', labelZh: '课时财务对账精度', labelEn: 'Ledger Precision' },
      { value: 'ACID', labelZh: '同单号幂等去重', labelEn: 'Idempotent Writes' },
      { value: 'PG', labelZh: '表前缀多租户隔离', labelEn: 'Prefix Isolation' },
    ],
    stack: ['PostgreSQL', 'Prisma ORM', 'pgvector', 'SQL', 'Idempotency'],
    projects: [
      { zh: '禾书耕文 (AI4Science)', en: 'HeShu AI4Science' },
      { zh: '洋葱教育 FDE 驻场工程', en: 'Onion Edu FDE Systems' },
      { zh: '梦境拓扑 DreamTop', en: 'DreamTop Topology' },
    ],
    highlightZh:
      '多业务线同库表前缀隔离、pgvector 向量存储、同单号收款幂等去重与课时 0.1 精度财务对账建模。',
    highlightEn:
      'Table-prefix multi-tenant isolation, pgvector embeddings, idempotent financial deduplication & graph schemas.',
  },
  {
    id: 6,
    indexCode: '06',
    name: 'AI 原生全栈交付 & 自动化测试',
    nameEn: 'AI-Native Delivery & E2E Testing',
    shortLabel: 'AI-Native',
    badgeZh: '2000+ 测试',
    badgeEn: '2000+ Tests',
    metrics: [
      { value: '200M', labelZh: '日均 Token 吞吐', labelEn: 'Daily Tokens' },
      { value: '2000+', labelZh: '自动化测试用例', labelEn: 'Automated Tests' },
      { value: '0→1', labelZh: 'Linux / Nginx 交付', labelEn: 'Full Delivery' },
    ],
    stack: ['React 18', 'TypeScript', 'Playwright', 'Vitest', 'Nginx / PM2'],
    projects: [
      { zh: '禾书耕文 (AI4Science)', en: 'HeShu AI4Science' },
      { zh: '界外 Outbounds', en: 'Outbounds Platform' },
      { zh: '饭定了 (智能餐饮决策)', en: 'FanDingLe Mini-App' },
    ],
    highlightZh:
      '日均 2 亿 Token（Cursor / Claude Code / Codex / Trae）驱动 0→1 交付，配合 2000+ 自动化测试、Playwright 与 Nginx/PM2 部署。',
    highlightEn:
      '200M+ tokens/day AI-native workflow (Cursor/Claude Code/Codex) backed by 2000+ tests, Playwright & Linux deployment.',
  },
];

const FOODIE_PICKS_ZH = [
  '01 // 笨萝卜浏阳菜馆 · 醋蒸鸡 + 酸菜炒粉皮',
  '02 // 茶颜悦色 · 幽兰拿铁（少冰少糖）',
  '03 // 公交新村粉店 · 双码牛肉雪里蕻扁粉',
  '04 // 大学城天马牛肉饼 + 紫苏桃子姜',
];

const FOODIE_PICKS_EN = [
  '01 // Benluobo Liuyang Cuisine · Steamed Chicken with Vinegar',
  '02 // SexyTea (ChaYanYueSe) · Orchid Latte with Pecans',
  '03 // Changsha Beef Rice Noodles with Pickled Mustard Greens',
  '04 // Crispy Tianma Beef Pie @ University Town',
];

export const Skills: React.FC = () => {
  const { t, td } = useI18n();
  const { activeSkillFilter, setActiveSkillFilter } = useAppStore();

  const [selectedSkill, setSelectedSkill] = useState<SkillItem>(DEFAULT_CORE_SKILLS[0]);
  const [easterEggMsg, setEasterEggMsg] = useState<string | null>(null);
  const [foodIdx, setFoodIdx] = useState(0);
  const [guitarStrumCount, setGuitarStrumCount] = useState(0);

  useEffect(() => {
    if (activeSkillFilter) {
      const matched = DEFAULT_CORE_SKILLS.find(
        (s) =>
          s.name.toLowerCase().includes(activeSkillFilter.toLowerCase()) ||
          activeSkillFilter.toLowerCase().includes(s.shortLabel.split('/')[0].toLowerCase()),
      );
      if (matched) {
        setSelectedSkill(matched);
      }
    }
  }, [activeSkillFilter]);

  const triggerGuitarEasterEgg = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const chords = [
          [196.0, 246.94, 293.66, 392.0, 493.88, 587.33],
          [130.81, 164.81, 196.0, 293.66, 392.0, 587.33],
          [146.83, 220.0, 293.66, 392.0, 440.0, 587.33],
          [164.81, 246.94, 293.66, 392.0, 493.88, 587.33],
        ];
        const notes = chords[guitarStrumCount % chords.length];
        const now = ctx.currentTime;

        const bodyFilter = ctx.createBiquadFilter();
        bodyFilter.type = 'lowpass';
        bodyFilter.frequency.setValueAtTime(2200, now);
        bodyFilter.connect(ctx.destination);

        notes.forEach((freq, i) => {
          const start = now + i * 0.042;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'triangle';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(freq, start);
          osc2.frequency.setValueAtTime(freq * 2.001, start);

          gain.gain.setValueAtTime(0.001, start);
          gain.gain.linearRampToValueAtTime(0.058, start + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0007, start + 1.55);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(bodyFilter);

          osc1.start(start);
          osc2.start(start);
          osc1.stop(start + 1.6);
          osc2.stop(start + 1.6);
        });
      }
    } catch {
      // Ignore audio context block
    }
    const nextCount = guitarStrumCount + 1;
    setGuitarStrumCount(nextCount);
    const chordNames = ['G Major', 'Cadd9', 'Dsus4', 'Em7'];
    const chordName = chordNames[(nextCount - 1) % chordNames.length];
    setEasterEggMsg(
      td(
        `♪ ${chordName} 原声吉他和弦 — 写代码间隙最喜欢的放松方式。`,
        `♪ Strummed ${chordName} acoustic chord — favorite way to unwind between commits.`,
      ),
    );
  };

  const triggerFoodEasterEgg = () => {
    playSuccessChime();
    const pick = td(
      FOODIE_PICKS_ZH[foodIdx % FOODIE_PICKS_ZH.length],
      FOODIE_PICKS_EN[foodIdx % FOODIE_PICKS_EN.length],
    );
    setFoodIdx((prev) => prev + 1);
    setEasterEggMsg(pick);
  };

  const triggerSurveyEasterEgg = () => {
    playSuccessChime();
    setEasterEggMsg(
      td(
        'FIELD RESEARCH // 山姆会员店供应链调研、红星农批与东升农场汇报、50+ 校园商户一线访谈。',
        'FIELD RESEARCH // Sam\'s Club supply-chain & agricultural market reports + 50+ merchant interviews.',
      ),
    );
  };

  const handleJumpToProjectsWithSkill = (skillName: string) => {
    setActiveSkillFilter(skillName);
    scroller.scrollTo('projects', { smooth: true, duration: 500, offset: -70 });
  };

  return (
    <section
      id="skills"
      className="dark ink-band py-14 sm:py-28 transition-colors duration-300 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto mb-8 sm:mb-10 pb-4 sm:pb-5 border-b designer-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4"
        >
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.16em] designer-accent-text mb-1.5 sm:mb-2">
              02 // CAPABILITIES
            </div>
            <h2 className="designer-heading text-[30px] sm:text-[40px] md:text-5xl lg:text-[56px] font-medium leading-[1.08] tracking-[-0.025em]">
              {t('skills.title')}
            </h2>
          </div>
          {activeSkillFilter && (
            <button
              type="button"
              onClick={() => setActiveSkillFilter(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full designer-pill text-xs font-mono text-[#8A6F48] dark:text-[#C8A97E] self-start sm:self-end"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('skills.clearFilter')}</span>
            </button>
          )}
        </motion.div>

        {/* Master-Detail 12-Col Grid (Left Index + Right Shipped Architecture Proof) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 max-w-6xl mx-auto items-stretch">
          {/* Left 5 Cols: Clean Evidence-Indexed Capability List (No arbitrary % bars) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 designer-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between gap-1.5"
          >
            {DEFAULT_CORE_SKILLS.map((skill) => {
              const isSelected = selectedSkill.id === skill.id;
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => {
                    playToggleSwitch(true);
                    setSelectedSkill(skill);
                  }}
                  className={`w-full px-3.5 py-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-[#F6F4EF] dark:bg-[#22211E] border-[#8A6F48]/55 dark:border-[#C8A97E]/50 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-[#F6F4EF]/65 dark:hover:bg-[#1C1C19]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-[11px] font-mono shrink-0 transition-colors ${
                        isSelected
                          ? 'text-[#8A6F48] dark:text-[#C8A97E] font-semibold'
                          : 'designer-text-muted'
                      }`}
                    >
                      {skill.indexCode}
                    </span>
                    <span
                      className={`text-sm font-medium truncate transition-colors ${
                        isSelected
                          ? 'designer-text-primary'
                          : 'designer-text-secondary group-hover:designer-text-primary'
                      }`}
                    >
                      {td(skill.name, skill.nameEn)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-[#EFECE5] dark:bg-[#262522] text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">
                      {td(skill.badgeZh, skill.badgeEn)}
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected
                          ? 'text-[#8A6F48] dark:text-[#C8A97E] translate-x-0.5'
                          : 'designer-text-muted opacity-40 group-hover:opacity-80'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </motion.div>

          {/* Right 7 Cols: Active Capability Architecture & Shipped Proof Card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="lg:col-span-7 designer-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSkill.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="flex flex-col justify-between h-full gap-6"
              >
                <div>
                  {/* Eyebrow & Serif Title */}
                  <div className="flex items-center justify-between gap-3 pb-4 border-b designer-hairline">
                    <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8A6F48] dark:text-[#C8A97E]">
                      {selectedSkill.indexCode} // {selectedSkill.shortLabel}
                    </span>
                    <span className="text-[11px] font-mono designer-text-muted">
                      {selectedSkill.projects.length} {td('项实战落地', 'SHIPPED BUILDS')}
                    </span>
                  </div>

                  <h3 className="mt-5 font-serif text-xl sm:text-2xl font-normal tracking-tight designer-text-primary">
                    {td(selectedSkill.name, selectedSkill.nameEn)}
                  </h3>

                  {/* 3 Concrete Engineering Proof Metrics */}
                  <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
                    {selectedSkill.metrics.map((m) => (
                      <div
                        key={m.labelZh}
                        className="p-3 sm:p-3.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1C1B18] border designer-hairline"
                      >
                        <div className="font-mono text-lg sm:text-xl font-semibold tracking-tight text-[#8A6F48] dark:text-[#C8A97E]">
                          {m.value}
                        </div>
                        <div className="mt-0.5 text-[11px] designer-text-muted truncate">
                          {td(m.labelZh, m.labelEn)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Architecture Summary */}
                  <p className="mt-5 text-[15px] designer-text-secondary leading-[1.8]">
                    {td(selectedSkill.highlightZh, selectedSkill.highlightEn)}
                  </p>

                  {/* Core Stack Tags */}
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {selectedSkill.stack.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md bg-[#F3F1EC] dark:bg-[#22211E] border designer-hairline text-[11px] font-mono designer-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Linked Shipped Projects */}
                <div className="pt-5 border-t designer-hairline">
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] designer-text-muted mb-3">
                    {td('关联实战项目', 'LINKED PROJECTS')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.projects.map((proj) => (
                      <button
                        key={proj.zh}
                        type="button"
                        onClick={() =>
                          handleJumpToProjectsWithSkill(selectedSkill.shortLabel.split('/')[0])
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141413] text-[#FAF9F5] hover:bg-[#8A6F48] dark:bg-[#F2F0EA] dark:text-[#141413] dark:hover:bg-[#C8A97E] text-xs font-mono transition-colors"
                      >
                        <span>{td(proj.zh, proj.en)}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom Minimalist 3-Pill Interactive Bar (Zero Filler Text) */}
        <div className="max-w-6xl mx-auto mt-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={triggerFoodEasterEgg}
              className="px-3.5 py-2 rounded-xl designer-card hover:border-[#8A6F48] dark:hover:border-[#C8A97E] transition-colors inline-flex items-center gap-2 text-xs font-mono designer-text-secondary hover:designer-text-primary"
            >
              <Utensils className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
              <span>{td('长沙美食 · 抽签', 'Changsha Eats')}</span>
            </button>

            <button
              type="button"
              onClick={triggerGuitarEasterEgg}
              className="px-3.5 py-2 rounded-xl designer-card hover:border-[#8A6F48] dark:hover:border-[#C8A97E] transition-colors inline-flex items-center gap-2 text-xs font-mono designer-text-secondary hover:designer-text-primary"
            >
              <Music className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
              <span>{td('木吉他 · 和弦', 'Acoustic Chord')}</span>
            </button>

            <button
              type="button"
              onClick={triggerSurveyEasterEgg}
              className="px-3.5 py-2 rounded-xl designer-card hover:border-[#8A6F48] dark:hover:border-[#C8A97E] transition-colors inline-flex items-center gap-2 text-xs font-mono designer-text-secondary hover:designer-text-primary"
            >
              <Compass className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
              <span>{td('一线市调 · 50+ 商户', 'Field Research · 50+')}</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {easterEggMsg && (
              <motion.div
                key={easterEggMsg}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-3 px-4 py-2.5 rounded-xl bg-[#F3F1EC] dark:bg-[#1E1D1A] border border-[#8A6F48]/35 text-xs font-mono designer-text-primary flex items-center justify-between gap-3"
              >
                <span className="leading-relaxed">{easterEggMsg}</span>
                <button
                  type="button"
                  onClick={() => setEasterEggMsg(null)}
                  className="p-1 rounded-md designer-text-muted hover:designer-text-primary shrink-0"
                  aria-label="关闭"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
