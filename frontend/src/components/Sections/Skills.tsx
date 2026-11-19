import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, RotateCcw, Volume2 } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { scroller } from 'react-scroll';
import { useI18n } from '../../i18n/i18nContext';
import { useTheme } from '../../context/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { playToggleSwitch, playSuccessChime } from '../../utils/soundEffects';

interface SkillItem {
  id: number;
  indexCode: string;
  name: string;
  nameEn: string;
  shortLabel: string;
  category: 'Core' | 'General';
  level: number;
  projects: { zh: string; en: string }[];
  highlightZh: string;
  highlightEn: string;
}

const DEFAULT_CORE_SKILLS: SkillItem[] = [
  {
    id: 1,
    indexCode: '01',
    name: 'React / Next.js',
    nameEn: 'React / Next.js',
    shortLabel: 'React/Next',
    category: 'Core',
    level: 80,
    projects: [
      { zh: '禾书耕文 (AI4Science)', en: 'HeShu AI4Science' },
      { zh: '界外 Outbounds', en: 'Outbounds Platform' },
      { zh: '个人全栈数字门户', en: 'Personal Full-Stack Portal' },
    ],
    highlightZh: '熟练运用 React 18 Hooks、SSR/CSR 混合渲染、复杂富文本与流式对话状态管理',
    highlightEn: 'React 18 Hooks, Next.js App Router, streaming AI chat state & complex UI orchestration',
  },
  {
    id: 2,
    indexCode: '02',
    name: 'TypeScript',
    nameEn: 'TypeScript',
    shortLabel: 'TypeScript',
    category: 'Core',
    level: 78,
    projects: [
      { zh: '禾书耕文 (AI4Science)', en: 'HeShu AI4Science' },
      { zh: '梦境拓扑 DreamTopo', en: 'Dream Topology' },
      { zh: '饭定了 (智能餐饮决策)', en: 'FanDingLe Mini-App' },
    ],
    highlightZh: '全栈端到端类型安全，结合 Zod 与 Prisma 构建严密的数据校验链路',
    highlightEn: 'End-to-end type safety across frontend & backend with Zod and Prisma',
  },
  {
    id: 3,
    indexCode: '03',
    name: 'Tailwind CSS & Design Systems',
    nameEn: 'Tailwind CSS & Design Systems',
    shortLabel: 'Tailwind',
    category: 'Core',
    level: 74,
    projects: [
      { zh: '个人全栈数字门户', en: 'Personal Full-Stack Portal' },
      { zh: '界外 Outbounds', en: 'Outbounds Platform' },
      { zh: '饭定了 (智能餐饮决策)', en: 'FanDingLe Mini-App' },
    ],
    highlightZh: '克制的建筑感网格排版、CSS 变量主题引擎与 Framer Motion 微交互编排',
    highlightEn: 'Architectural hairline grids, CSS variable token systems & Framer Motion choreography',
  },
  {
    id: 4,
    indexCode: '04',
    name: 'Node.js / FastAPI',
    nameEn: 'Node.js / FastAPI',
    shortLabel: 'Node/FastAPI',
    category: 'Core',
    level: 74,
    projects: [
      { zh: '禾书耕文 (AI4Science)', en: 'HeShu AI4Science' },
      { zh: '洋葱教育 FDE 驻场工程', en: 'Onion Edu FDE Systems' },
      { zh: '个人全栈数字门户', en: 'Personal Full-Stack Portal' },
    ],
    highlightZh: '构建高并发 REST/SSE 流式接口，打通 Python AI 微服务与 Node 业务网关',
    highlightEn: 'High-concurrency REST/SSE streaming APIs bridging Node gateways & Python AI services',
  },
  {
    id: 5,
    indexCode: '05',
    name: 'Prisma / PostgreSQL',
    nameEn: 'Prisma / PostgreSQL',
    shortLabel: 'Prisma/PG',
    category: 'Core',
    level: 72,
    projects: [
      { zh: '梦境拓扑 DreamTopo', en: 'Dream Topology' },
      { zh: '禾书耕文 (AI4Science)', en: 'HeShu AI4Science' },
      { zh: '个人全栈数字门户', en: 'Personal Full-Stack Portal' },
    ],
    highlightZh: '关系型数据建模、pgvector 向量检索集成与查询缓存优化',
    highlightEn: 'Relational schema design, pgvector semantic search & query caching optimization',
  },
  {
    id: 6,
    indexCode: '06',
    name: 'LangGraph / Hybrid RAG',
    nameEn: 'LangGraph / Hybrid RAG',
    shortLabel: 'LangGraph',
    category: 'Core',
    level: 70,
    projects: [
      { zh: '禾书耕文 (AI4Science)', en: 'HeShu AI4Science' },
      { zh: '洋葱教育 FDE 驻场工程', en: 'Onion Edu FDE Systems' },
      { zh: '梦境拓扑 DreamTopo', en: 'Dream Topology' },
    ],
    highlightZh: '多智能体状态机编排、混合检索重排 (Hybrid RAG + Rerank) 与领域长文生成',
    highlightEn: 'Multi-agent state graphs, Hybrid RAG + Reranking & domain-specific generation',
  },
];

const FOODIE_PICKS_ZH = [
  'NO.01 // 长沙必吃推荐：笨萝卜浏阳菜馆 · 醋蒸鸡 + 酸菜炒粉皮',
  'NO.02 // 长沙必吃推荐：茶颜悦色 · 幽兰拿铁（少冰少糖，写代码最佳伴侣）',
  'NO.03 // 长沙必吃推荐：公交新村粉店 · 双码牛肉雪里蕻扁粉',
  'NO.04 // 长沙必吃推荐：大学城天马牛肉饼 + 紫苏桃子姜',
];

const FOODIE_PICKS_EN = [
  'NO.01 // Changsha Pick: Benluobo Liuyang Cuisine · Steamed Chicken with Vinegar',
  'NO.02 // Changsha Pick: SexyTea (ChaYanYueSe) · Orchid Latte with Pecans',
  'NO.03 // Changsha Pick: Changsha Beef Rice Noodles with Pickled Mustard Greens',
  'NO.04 // Changsha Pick: Crispy Tianma Beef Pie @ University Town',
];

export const Skills: React.FC = () => {
  const { t, td } = useI18n();
  const { theme } = useTheme();
  const { activeSkillFilter, setActiveSkillFilter } = useAppStore();

  const [coreSkills, setCoreSkills] = useState<SkillItem[]>(DEFAULT_CORE_SKILLS);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem>(DEFAULT_CORE_SKILLS[0]);
  const [easterEggMsg, setEasterEggMsg] = useState<string | null>(null);
  const [foodIdx, setFoodIdx] = useState(0);
  const [guitarStrumCount, setGuitarStrumCount] = useState(0);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get('/api/skills');
        const data = response.data?.data || response.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setCoreSkills((prev) =>
            prev.map((item) => {
              const found = data.find(
                (d: any) =>
                  d.name &&
                  d.user?.name !== 'Admin' &&
                  (d.name.toLowerCase().includes(item.shortLabel.split('/')[0].toLowerCase()) ||
                    item.name.toLowerCase().includes(d.name.toLowerCase())),
              );
              return found && typeof found.level === 'number' && found.level > item.level
                ? { ...item, level: found.level }
                : item;
            }),
          );
        }
      } catch {
        // Keep DEFAULT_CORE_SKILLS
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    if (activeSkillFilter) {
      const matched = coreSkills.find(
        (s) =>
          s.name.toLowerCase().includes(activeSkillFilter.toLowerCase()) ||
          activeSkillFilter.toLowerCase().includes(s.shortLabel.split('/')[0].toLowerCase()),
      );
      if (matched) {
        setSelectedSkill(matched);
      }
    }
  }, [activeSkillFilter, coreSkills]);

  const radarData = coreSkills.map((s) => ({
    subject: s.shortLabel,
    A: s.level,
    fullMark: 100,
  }));

  const triggerGuitarEasterEgg = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        // 4 Warm Acoustic Chords: G Major -> Cadd9 -> Dsus4 -> Em7
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
          osc2.frequency.setValueAtTime(freq * 2.001, start); // Warm octave harmonic

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
        `♪ ACOUSTIC NOTE // 已拨响 ${chordName} 原声吉他和弦。虽然木吉他进度只有 21%，但写代码间隙拨两下是最好的放松。`,
        `♪ ACOUSTIC NOTE // Strummed ${chordName} acoustic chord. Guitar progress is 21% — my favorite way to unwind.`,
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
        'FIELD RESEARCH // 曾撰写山姆会员店供应链调研、汇报红星农批与东升农场调研并走访 50+ 校园商户，让我写代码前总习惯先问：“真实用户的痛点是什么？”',
        'FIELD RESEARCH // Authored Sam\'s Club supply-chain & agricultural market reports + 50+ merchant interviews — grounding code in real user empathy.',
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
      className="py-20 sm:py-28 transition-colors duration-300 relative overflow-hidden"
    >
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto mb-12 pb-5 border-b designer-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest designer-accent-text mb-2">
              02 // CAPABILITY MATRIX
            </div>
            <h2 className="designer-heading text-3xl md:text-4xl font-normal tracking-[-0.02em]">
              {t('skills.title')}
            </h2>
          </div>
          <p className="designer-text-muted text-xs sm:text-sm font-mono">
            {t('skills.subtitle')}
          </p>
        </motion.div>

        {/* Main 12-Col Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto items-stretch">
          {/* Left 7 Cols: Architectural Skill Index */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 designer-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b designer-hairline">
                <h3 className="text-xs font-mono uppercase tracking-widest designer-text-muted">
                  {t('skills.frontend')}
                </h3>
                {activeSkillFilter && (
                  <button
                    type="button"
                    onClick={() => setActiveSkillFilter(null)}
                    className="inline-flex items-center gap-1 text-xs font-mono text-[#8A6F48] hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t('skills.clearFilter')}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {coreSkills.map((skill) => {
                  const isSelected = selectedSkill.id === skill.id;
                  return (
                    <div
                      key={skill.id}
                      onClick={() => {
                        playToggleSwitch(true);
                        setSelectedSkill(skill);
                        setActiveSkillFilter(skill.name);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F6F4EF] dark:bg-[#22211E] border-[#8A6F48]/60 dark:border-[#C8A97E]/50'
                          : 'bg-transparent border-transparent hover:bg-[#F6F4EF]/60 dark:hover:bg-[#1C1C19]'
                      }`}
                    >
                      <div className="flex justify-between items-baseline mb-2">
                        <div className="flex items-baseline gap-3">
                          <span className="text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">
                            {skill.indexCode}
                          </span>
                          <span className="font-medium text-sm sm:text-base designer-text-primary">
                            {td(skill.name, skill.nameEn)}
                          </span>
                        </div>
                        <span className="text-xs font-mono designer-text-muted">
                          {skill.level}%
                        </span>
                      </div>

                      {/* Sleek 2px Architectural Progress Line (Replaces thick rainbow bar) */}
                      <div className="h-[3px] bg-[#E8E4DA] dark:bg-[#2A2925] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            isSelected
                              ? 'bg-[#8A6F48] dark:bg-[#C8A97E]'
                              : 'bg-[#141413] dark:bg-[#EAE6DF]'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Skill Detail & Project Linker Box */}
            <div className="mt-6 pt-5 border-t designer-hairline">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#8A6F48] dark:text-[#C8A97E]">
                  {selectedSkill.indexCode} // {selectedSkill.name} — {t('skills.linkedProjects')}
                </span>
              </div>
              <p className="text-xs sm:text-sm designer-text-secondary mb-3.5 leading-relaxed">
                {td(selectedSkill.highlightZh, selectedSkill.highlightEn)}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSkill.projects.map((proj) => (
                  <button
                    key={proj.zh}
                    type="button"
                    onClick={() => handleJumpToProjectsWithSkill(selectedSkill.shortLabel.split('/')[0])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F1EC] dark:bg-[#22221F] hover:bg-[#141413] hover:text-[#FAF9F5] dark:hover:bg-[#F2F0EA] dark:hover:text-[#141413] text-xs font-mono border designer-hairline transition-colors"
                  >
                    <span>{td(proj.zh, proj.en)}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right 5 Cols: Warm Bronze Radar + Tactile Field Attributes */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Radar Card — Warm Bronze & Stone Palette */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="designer-card p-6 rounded-2xl flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b designer-hairline">
                <h3 className="text-xs font-mono uppercase tracking-widest designer-text-muted">
                  {t('skills.chart')}
                </h3>
                <span className="text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">6-AXIS</span>
              </div>
              <div className="w-full h-[245px] sm:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                    <PolarGrid
                      stroke={theme === 'dark' ? '#C8A97E' : '#9E9B91'}
                      strokeOpacity={theme === 'dark' ? 0.34 : 0.28}
                    />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{
                        fill: theme === 'dark' ? '#D4D1C7' : '#5F5E58',
                        fontSize: 11,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Skill"
                      dataKey="A"
                      stroke={theme === 'dark' ? '#C8A97E' : '#8A6F48'}
                      strokeWidth={1.85}
                      fill={theme === 'dark' ? '#C8A97E' : '#8A6F48'}
                      fillOpacity={theme === 'dark' ? 0.28 : 0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Tactile Easter Egg Attributes Card — Unified Warm Sand & Bronze */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="designer-card p-6 rounded-2xl flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b designer-hairline">
                  <h3 className="text-xs font-mono uppercase tracking-widest designer-text-muted">
                    {t('skills.other')}
                  </h3>
                  <Volume2 className="w-3.5 h-3.5 text-[#8A6F48] stroke-[1.5]" />
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={triggerFoodEasterEgg}
                    className="w-full p-3 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] hover:border-[#8A6F48] border designer-hairline text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">01 / TASTE</span>
                        <span className="text-xs sm:text-sm font-medium designer-text-primary">
                          {td('美食品鉴 · 长沙活地图', 'Gastronomy · Changsha Guide')}
                        </span>
                      </div>
                      <div className="text-[11px] designer-text-muted mt-0.5">
                        {td('点击抽取一条长沙本地私藏馆子 →', 'Click to draw a local Changsha foodie note →')}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium text-[#8A6F48] dark:text-[#C8A97E]">100%</span>
                  </button>

                  <button
                    type="button"
                    onClick={triggerGuitarEasterEgg}
                    className="w-full p-3 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] hover:border-[#8A6F48] border designer-hairline text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">02 / ACOUSTIC</span>
                        <span className="text-xs sm:text-sm font-medium designer-text-primary">
                          {td('木吉他弹唱', 'Acoustic Guitar')}
                        </span>
                      </div>
                      <div className="text-[11px] designer-text-muted mt-0.5">
                        {td('点击拨动真实吉他和弦 ♪ →', 'Click to strum an acoustic chord ♪ →')}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium text-[#8A6F48] dark:text-[#C8A97E]">21%</span>
                  </button>

                  <button
                    type="button"
                    onClick={triggerSurveyEasterEgg}
                    className="w-full p-3 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] hover:border-[#8A6F48] border designer-hairline text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">03 / FIELD</span>
                        <span className="text-xs sm:text-sm font-medium designer-text-primary">
                          {td('一线市场调研', 'Field Research')}
                        </span>
                      </div>
                      <div className="text-[11px] designer-text-muted mt-0.5">
                        {td('点击查看 50+ 商户访谈洞察 →', 'Click to read field research note →')}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium text-[#8A6F48] dark:text-[#C8A97E]">80%</span>
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {easterEggMsg && (
                  <motion.div
                    key={easterEggMsg}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-3 p-3 rounded-xl bg-[#F3F1EC] dark:bg-[#22221F] border border-[#8A6F48]/35 text-xs font-mono designer-text-primary leading-relaxed"
                  >
                    {easterEggMsg}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
