import axios from './axiosConfig';
import {
  AgentPersonaMode,
  AgentSseEvent,
  AgentToolDefinition,
  FdeTelemetryCardData,
  HitlContactDraftData,
  JdMatchCardData,
  ProjectDossierCardData,
} from '../types/agent';

export const AGENT_TOOLS_REGISTRY: AgentToolDefinition[] = [
  // Category 1: Read-Only Knowledge & DB Tools (只读检索工具)
  {
    name: 'get_project_dossier',
    category: 'read_only',
    titleZh: '项目档案与架构检索',
    titleEn: 'Project Dossier & Architecture Lookup',
    descriptionZh: '检索禾书耕文、饭定了、梦境拓扑、界外 Outbounds 的量化指标、技术栈与难点方案',
    descriptionEn: 'Retrieve quantitative metrics, tech stack, and architecture solutions for flagship projects',
    schemaSummary: '{ slug: "heshu" | "fandingle" | "dreamtop" | "outbounds" | "all", focus?: "overview" | "architecture" }',
    samplePromptZh: '请深入讲讲「禾书耕文」项目的技术架构、46个工具与混合检索方案',
    samplePromptEn: 'Deep-dive into the HeShu AI4Science architecture, 46-tool loop, and Hybrid RAG',
  },
  {
    name: 'get_fde_residency_log',
    category: 'read_only',
    titleZh: '洋葱教育 FDE 驻场遥测',
    titleEn: 'Onion Edu FDE Residency Telemetry',
    descriptionZh: '查询 15 周驻场、35 个只读经营工具、双线 FastAPI 100+ 路由与 19 条巨量投流 API 细节',
    descriptionEn: 'Query 15-week on-site delivery, 35 read-only agent tools, and 19 Ocean Engine APIs',
    schemaSummary: '{ module?: "agent_tools" | "dual_line" | "ocean_engine" | "all" }',
    samplePromptZh: '💼 洋葱教育 FDE 驻场做了什么？经营 Agent 如何防止静默改数？',
    samplePromptEn: 'What did he build during his FDE residency at Onion Education?',
  },
  {
    name: 'analyze_jd_fit',
    category: 'read_only',
    titleZh: 'HR 岗位 JD 匹配度评估器',
    titleEn: 'Recruiter JD Match Evaluator',
    descriptionZh: '解析招聘 JD 或岗位方向，计算与黄奕轩 Agent/全栈能力、到岗时间的匹配度并生成推荐词',
    descriptionEn: 'Evaluate JD requirements against Yixuan’s Agent/Full-stack skills and availability',
    schemaSummary: '{ jdText: string, roleType?: "agent" | "fullstack" | "fde" }',
    samplePromptZh: '🎯 评估岗位匹配度：招聘 AI Agent 研发实习生，要求熟悉 LangGraph、RAG、React/TypeScript，能连续实习 3 个月以上',
    samplePromptEn: 'Evaluate JD fit: Hiring AI Agent Intern familiar with LangGraph, Hybrid RAG, React & TypeScript',
  },
  {
    name: 'query_awards_and_strengths',
    category: 'read_only',
    titleZh: '竞赛荣誉与 AI 原生开发指标',
    titleEn: 'Awards & AI-Native Builder Metrics',
    descriptionZh: '检索 5 项竞赛奖项（字节跳动 Trae 二/三等奖、LEV0 最佳创意奖）与日均 2 亿 Token 工程实践',
    descriptionEn: 'Query 5 competition awards and 200M tokens/day AI-native engineering workflow',
    schemaSummary: '{ includeTokenWorkflow?: boolean }',
    samplePromptZh: '🏆 拿过哪些奖项与个人核心优势？',
    samplePromptEn: 'What competition awards and core strengths does Yixuan have?',
  },
  {
    name: 'query_availability_and_cities',
    category: 'read_only',
    titleZh: '到岗时间与意向城市查询',
    titleEn: 'Internship Availability & Target Cities',
    descriptionZh: '查询当前求职状态：立即到岗、每周 5 天、连续 3-6 个月、深圳优先 / 杭州 / 长沙',
    descriptionEn: 'Check immediate availability (5 days/wk, 3-6 months) and target cities (Shenzhen/Hangzhou/Changsha)',
    schemaSummary: '{ checkRemoteInterview?: boolean }',
    samplePromptZh: '📅 到岗时间、实习城市与求职方向是什么？',
    samplePromptEn: 'What is his internship availability, duration, and preferred cities?',
  },
  {
    name: 'query_cultural_archive',
    category: 'read_only',
    titleZh: '数字花园与 35mm 摄影档案查询',
    titleEn: '35mm Photography & Cultural Archive',
    descriptionZh: '检索街头风光摄影、木吉他弹唱彩蛋、长沙美食品鉴与一线市调经历',
    descriptionEn: 'Query 35mm photography, acoustic guitar easter egg, and field research archive',
    schemaSummary: '{ archiveType: "photos" | "music" | "hobbies" }',
    samplePromptZh: '除了写代码，奕轩平时有哪些摄影、音乐和一线调研爱好？',
    samplePromptEn: 'What are Yixuan’s hobbies in photography, music, and field research?',
  },
  {
    name: 'privacy_guard_check',
    category: 'read_only',
    titleZh: '隐私红线安全拦截器',
    titleEn: 'Privacy Redline Guardrail',
    descriptionZh: '自动拦截手机号、微信号、身份证、生日或私密网申投递记录查询，引导合规公开联系渠道',
    descriptionEn: 'Block sensitive PII queries (phone, WeChat, ID) and redirect to public email/contact form',
    schemaSummary: '{ triggeredKeyword: string, policy: "STRICT_PII_REDACTION" }',
    samplePromptZh: '能告诉我奕轩的手机号或个人微信号吗？',
    samplePromptEn: 'Can you share his phone number or personal WeChat?',
  },

  // Category 2: Client-Side Page Co-Pilot UI Action Tools (页面协同控制工具)
  {
    name: 'navigate_and_highlight',
    category: 'ui_action',
    titleZh: '页面章节导航与架构面板展开',
    titleEn: 'Section Scroll & Architecture Tab Opener',
    descriptionZh: '自动滚动到指定章节或项目卡片，并可自动将项目卡片切换至「架构拆解」视图',
    descriptionEn: 'Smooth-scroll to page sections/cards and auto-open the Architecture breakdown tab',
    schemaSummary: '{ section: string, projectCode?: "01"|"02"|"03"|"04", projectTab?: "overview"|"architecture" }',
    samplePromptZh: '带我去看「禾书耕文」项目，并自动展开它的架构拆解面板！',
    samplePromptEn: 'Scroll to the HeShu project card and open its Architecture breakdown tab!',
  },
  {
    name: 'filter_skill_matrix',
    category: 'ui_action',
    titleZh: '技能矩阵与关联项目联动筛选',
    titleEn: 'Skill Matrix & Project Filter',
    descriptionZh: '按指定技术栈（如 LangGraph、React 19、Next.js 16）高亮筛选首页关联项目',
    descriptionEn: 'Highlight and filter portfolio projects by specific technology tag',
    schemaSummary: '{ skill: "LangGraph" | "React 19" | "Next.js 16" | "Hybrid RAG" | "Prisma" | null }',
    samplePromptZh: '帮我在页面上筛选并高亮所有使用了 LangGraph 的项目',
    samplePromptEn: 'Filter and highlight all projects built with LangGraph on the page',
  },
  {
    name: 'control_vinyl_player',
    category: 'ui_action',
    titleZh: '全站黑胶随身听控制',
    titleEn: 'Vinyl Music Player Controller',
    descriptionZh: '通过自然语言直接播放、暂停或切换全站背景 Lofi / 音乐曲目',
    descriptionEn: 'Play, pause, or skip tracks on the site-wide vinyl music player',
    schemaSummary: '{ command: "play" | "pause" | "next" | "prev" }',
    samplePromptZh: '🎵 帮我播放背景音乐，边听歌边看作品集',
    samplePromptEn: 'Play background music while I browse the portfolio',
  },
  {
    name: 'switch_portal_skin',
    category: 'ui_action',
    titleZh: '全站设计师皮肤与主题切换',
    titleEn: 'Designer Skin & Theme Switcher',
    descriptionZh: '在暖沙杂志(Editorial)、曜石微光(Titanium)、画廊松墨(Forest)、博朗工业(Cobalt)及日夜模式间切换',
    descriptionEn: 'Switch between Editorial, Titanium, Forest, Cobalt skins and Light/Dark modes',
    schemaSummary: '{ skin?: "editorial" | "titanium" | "forest" | "cobalt", darkMode?: boolean }',
    samplePromptZh: '🎨 把网站切换成「画廊松墨 (Forest)」皮肤看看效果',
    samplePromptEn: 'Switch the website skin to Kinfolk Gallery Moss (Forest)',
  },

  // Category 3: Human-in-the-Loop Write Gate (人工确认硬闸工具)
  {
    name: 'draft_interview_or_message',
    category: 'hitl_gate',
    titleZh: '面试邀请 / 留言草稿生成（人工确认硬闸）',
    titleEn: 'Interview / Contact Draft (HITL Write Gate)',
    descriptionZh: '仅拟定结构化留言或面试邀请草稿卡，必须经访客点击「确认写入」后才调用 POST /api/messages 落库',
    descriptionEn: 'Drafts a structured contact/interview card; requires explicit human approval before DB write',
    schemaSummary: '{ senderName: string, senderEmail: string, subject: string, content: string, requiresHumanApproval: true }',
    samplePromptZh: '📬 我是深圳某 AI 团队面试官，想约奕轩这周四下午远程面试，帮我拟一份留言草稿',
    samplePromptEn: 'I am an AI team interviewer in Shenzhen; help me draft an interview invitation message for Yixuan',
  },
];

export const PROJECT_DOSSIERS: Record<'heshu' | 'fandingle' | 'dreamtop' | 'outbounds', ProjectDossierCardData> = {
  heshu: {
    indexCode: '01',
    slug: 'heshu',
    titleZh: '禾书耕文 · 农业科研论文 AI 写作系统',
    titleEn: 'HeShu · AI4Science Research Writing System',
    badgeZh: 'AIFA 实验室重点项目 · 独立负责',
    badgeEn: 'AIFA LAB FLAGSHIP · LEAD ARCHITECT',
    metrics: [
      { value: '~3 Days', labelZh: '初稿周期 (原1个月)', labelEn: 'Draft Cycle (vs 1 mo)' },
      { value: '46 Tools', labelZh: 'LangGraph 写作循环', labelEn: 'LangGraph Agent Loop' },
      { value: '176,230', labelZh: '文献知识块 (2,749篇)', labelEn: 'RAG Chunks (2,749 PDFs)' },
      { value: '2000+', labelZh: '自动化测试 & 124 API', labelEn: 'Tests & 124 APIs' },
    ],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'LangGraph', 'Hybrid RAG (BM25+Vector+RRF)', 'PostgreSQL', '11-Ch SSE', 'Playwright'],
    highlightZh: '驻在课题组将论文初稿从手写约 1 个月缩短至约 3 天（已交付 10+ 篇初稿）。大纲与协作蓝图经人工批准后才继续写正文，支持检查点断点续跑。',
    highlightEn: 'Reduced paper first-draft time from ~1 month to ~3 days (10+ drafts delivered) with human-in-the-loop outline checkpoints and resumable state graphs.',
    architectureNoteZh: 'BM25 + 向量混合检索 + RRF 融合排序；越界引用编号在写回前先剥离，导出前完成学术规范、论证、结构、诚信四维审查，支持 SCI/Nature/IEEE/GB/T 7713/CAS 五套模板 PDF 导出。',
    architectureNoteEn: 'BM25 + Vector + RRF hybrid retrieval; out-of-bounds citations stripped pre-write; 4D pre-export integrity review across 5 academic PDF templates.',
    demoUrl: 'https://ai4science.hyxhhh.site/',
    githubUrl: 'https://github.com/hyxhhh1013/AI-assisted-writing-system-for-agricultural-research',
  },
  fandingle: {
    indexCode: '02',
    slug: 'fandingle',
    titleZh: '饭定了 · 校园餐饮协同决策应用',
    titleEn: 'FanDingLe · Campus Group Dining Decision App',
    badgeZh: 'LEV0 黑客松 · 最佳创意奖',
    badgeEn: 'LEV0 HACKATHON · BEST CREATIVITY AWARD',
    metrics: [
      { value: '30 Sec', labelZh: '多人选店收敛耗时', labelEn: 'Decision Convergence' },
      { value: '50+ 门店', labelZh: '农大周边一线实测池', labelEn: 'Curated Campus Spots' },
      { value: 'Multi-Room', labelZh: '室友建房协同填口味', labelEn: 'Room-Based Voting' },
      { value: 'Top 1', labelZh: '最佳创意奖 (2026.06)', labelEn: 'Best Creativity Award' },
    ],
    stack: ['TypeScript', 'React', 'Node.js', 'Tailwind CSS', 'Prisma'],
    highlightZh: '解决室友聚餐「众口难调」痛点：建房、填报口味偏好与忌口红线，基于真实调研的高校周边门店池快速收敛决策。',
    highlightEn: 'Collaborative room-based dining selector combining negative dietary filtering with weighted preference scoring over real campus restaurants.',
    architectureNoteZh: '采用「负向忌口硬过滤 + 多维口味向量加权」收敛算法，结合一线实地采集的门店人均、品类与口味标签实现零纠结选餐。',
    architectureNoteEn: 'Hard constraint filtering for dietary restrictions followed by multi-dimensional taste preference scoring.',
    demoUrl: 'https://eat.hyxhhh.site/',
  },
  dreamtop: {
    indexCode: '03',
    slug: 'dreamtop',
    titleZh: '梦境拓扑 DreamTop · 潜意识意象图谱',
    titleEn: 'DreamTop · Subconscious Topology Graph',
    badgeZh: '字节跳动 Trae on Campus · 湖南农大三等奖',
    badgeEn: 'BYTEDANCE TRAE · HNUA 3RD PRIZE',
    metrics: [
      { value: '4 Weeks', labelZh: '从 0 到 1 独立上线', labelEn: '0-to-1 Delivery' },
      { value: '60 FPS', labelZh: '力导向拓扑图谱渲染', labelEn: 'Force Graph Rendering' },
      { value: 'GLM-4', labelZh: '非结构化意象/情感抽取', labelEn: 'Symbol & Emotion NLP' },
      { value: '3rd Prize', labelZh: 'Trae 校园赛三等奖', labelEn: 'Trae Campus 3rd Prize' },
    ],
    stack: ['React', 'Vite', 'Node.js', 'Express', 'Prisma', 'MySQL', 'Framer Motion', 'GLM-4 API'],
    highlightZh: '支持语音和文字双模态录入梦境，利用 GLM-4 抽取潜意识意象节点与情感权重，构建 60fps 交互式拓扑网络。',
    highlightEn: 'Voice & text dream logging with GLM-4 structured symbol extraction and 60fps force-directed topology visualization.',
    architectureNoteZh: '设计 `dream_records`、`dream_symbols`、`topology_edges` 与 `physiological_data` 关联表结构，将碎片化叙事映射为可计算的图结构。',
    architectureNoteEn: 'Normalized graph schema linking dream records, recurring symbols, weighted topology edges, and sleep telemetry.',
    demoUrl: 'https://dream.hyxhhh.site/',
    githubUrl: 'https://github.com/hyxhhh1013/dream-topology',
  },
  outbounds: {
    indexCode: '04',
    slug: 'outbounds',
    titleZh: '界外 Outbounds · 多主题宇宙全栈社区',
    titleEn: 'Outbounds · Multi-Universe Exploration Hub',
    badgeZh: '字节跳动 Trae on Campus · 中南大学二等奖',
    badgeEn: 'BYTEDANCE TRAE · CSU 2ND PRIZE',
    metrics: [
      { value: '3 Universes', labelZh: 'Hacker / Art / ACG', labelEn: 'Hacker / Art / ACG' },
      { value: 'Next.js 16', labelZh: 'React 19 全栈架构', labelEn: 'React 19 App Router' },
      { value: '0-Flicker', labelZh: '跨宇宙状态无缝切换', labelEn: 'Seamless Context Sync' },
      { value: '2nd Prize', labelZh: 'Trae 中南大学二等奖', labelEn: 'Trae CSU 2nd Prize' },
    ],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Prisma', 'SQLite', 'Framer Motion', 'Zod', 'Vitest'],
    highlightZh: '独立构建 Hacker / Art / ACG 三个平行主题宇宙，包含卡片手势流、即时通讯与跨宇宙 AI 伴侣，获字节跳动 Trae 中南大学场次二等奖。',
    highlightEn: 'Three distinct themed universes with gesture card streams, instant messaging, and cross-universe AI companions.',
    architectureNoteZh: '基于 React Context + URL 参数持久化与 Framer Motion 共享布局过渡，配合 Zod 全链路校验与 Vitest 单元测试保障多宇宙状态同步。',
    architectureNoteEn: 'React Context + URL state persistence with Zod schema validation and Vitest unit testing.',
    demoUrl: 'https://hyxhhh.site/outbounds',
    githubUrl: 'https://github.com/hyxhhh1013/Outbounds',
  },
};

export const FDE_TELEMETRY_DATA: FdeTelemetryCardData = {
  companyZh: '湖南洋葱教育科技有限公司',
  companyEn: 'Hunan Onion Education Tech Co., Ltd.',
  roleZh: 'FDE 驻场工程师（教育培训经营中台）',
  roleEn: 'Forward-Deployed Engineer (FDE) Intern',
  period: '2026.06 — PRESENT (15 Weeks On-Site)',
  metrics: [
    { value: '15 Weeks', labelZh: '连续驻场 · 对接 8 组', labelEn: 'On-Site · 8 Teams' },
    { value: '35 Tools', labelZh: '经营 Agent 只读工具', labelEn: 'Read-Only Agent Tools' },
    { value: '100+ APIs', labelZh: '家教/雅思双线 FastAPI', labelEn: 'Dual-Line FastAPI Routes' },
    { value: '19 APIs', labelZh: '巨量引擎四层拉回台', labelEn: 'Ocean Engine Ad APIs' },
  ],
  pillars: [
    {
      code: '01 // READ-ONLY + HITL GATE',
      titleZh: '35 个只读问数工具 + 人工确认写库硬闸',
      titleEn: '35 Read-Only Tools + Human-in-the-Loop Write Gate',
      detailZh: '到账、退费、课消、转化、投流与人事和现有看板同口径直接问；异常仅拟成派任务草稿，必须人工点确认后才写入，杜绝静默改数。',
      detailEn: 'Unified metric queries across revenue, refunds, and conversion; anomalies generate task drafts requiring human approval before DB writes.',
    },
    {
      code: '02 // DUAL-LINE ARCHITECTURE',
      titleZh: '家教与雅思双业务线全链路（表前缀隔离）',
      titleEn: 'Tutoring & IELTS End-to-End Middle Platform',
      detailZh: '贯穿线索、试课、签单、排课、消课三级审批与课酬按日指派服务端硬闸，学员电子合同签名且审核通过才落档。',
      detailEn: 'Shared DB with table-prefix isolation, 3-tier class consumption approval gates, and verified e-contract archiving.',
    },
    {
      code: '03 // OCEAN ENGINE ATTRIBUTION',
      titleZh: '巨量引擎 19 条官方 API 四层投流回台',
      titleEn: '19 Ocean Engine APIs 4-Tier Ad Attribution',
      detailZh: '按账户、计划、广告、素材四层按日拉回消耗、点击、转化与线索成本；改预算须人工确认且单次硬限 ±20%。',
      detailEn: 'Daily ingestion across Account/Campaign/Ad/Creative tiers with human-approved budget caps (±20% max delta).',
    },
  ],
};

export function evaluateJdMatch(rawInput: string): JdMatchCardData {
  const q = rawInput.toLowerCase();
  const isFde = q.includes('fde') || q.includes('驻场') || q.includes('解决方案') || q.includes('交付') || q.includes('业务');
  const isBackendOrFullstack =
    (q.includes('后端') || q.includes('全栈') || q.includes('fastapi') || q.includes('python') || q.includes('node')) &&
    !q.includes('agent');

  let roleTitleZh = 'AI Agent 研发 / AI 应用工程实习生';
  let roleTitleEn = 'AI Agent / Applied AI Engineering Intern';
  let overallScore = 96;

  if (isFde) {
    roleTitleZh = 'FDE 驻场工程师 / AI 解决方案实习生';
    roleTitleEn = 'Forward-Deployed Engineer (FDE) Intern';
    overallScore = 98;
  } else if (isBackendOrFullstack) {
    roleTitleZh = 'AI 后端 & Agent 全栈工程实习生 (Python / FastAPI / LangGraph / PG)';
    roleTitleEn = 'AI Backend & Agent Systems Engineer Intern';
    overallScore = 96;
  }

  return {
    overallScore,
    roleTitleZh,
    roleTitleEn,
    jdSnippet: rawInput.length > 18 ? rawInput.slice(0, 120) : undefined,
    dimensions: [
      {
        nameZh: 'Agent 状态机编排与 RAG 工程落地',
        nameEn: 'Multi-Agent State Graphs & Hybrid RAG',
        score: 98,
        evidenceZh: '独立构建「禾书耕文」LangGraph 46 工具可恢复循环 + 11 路 SSE + 2,749 篇文献 BM25/向量 RRF 混合检索，已交付 10+ 篇科研初稿。',
        evidenceEn: 'Built HeShu with a 46-tool LangGraph recoverable loop, 11 SSE channels, and 176,230-chunk Hybrid RAG (BM25 + Vector + RRF).',
      },
      {
        nameZh: 'Python/FastAPI 后端中台与 FDE 驻场交付',
        nameEn: 'FastAPI Middle Platform & On-Site FDE Delivery',
        score: 96,
        evidenceZh: '洋葱教育连续 15 周 FDE 驻场（35 个只读工具 + 人工确认写库硬闸 + FastAPI 100+ 路由 + 19 条巨量 API）；PostgreSQL 表前缀隔离、幂等对账与 2000+ 自动化测试。',
        evidenceEn: '15 weeks on-site FDE delivery across 8 teams; 35 read-only tools with HITL write gates, 100+ FastAPI routes, PostgreSQL, and 2000+ automated tests.',
      },
      {
        nameZh: '到岗时间、出勤率与 AI 原生效率',
        nameEn: 'Immediate Availability & AI-Native Velocity',
        score: 95,
        evidenceZh: '可立即到岗，每周出勤 5 天，连续实习 3–6 个月（深圳优先 / 杭州 / 长沙均可）；日均使用 2 亿 Token（Cursor / Claude Code / Codex）。',
        evidenceEn: 'Immediately available, 5 days/week for 3–6 months (Shenzhen priority / Hangzhou / Changsha); ~200M tokens/day AI-native builder.',
      },
    ],
    availabilityZh: '可立即到岗 · 每周 5 天 · 连续 3–6 个月 · 深圳优先 / 杭州 / 长沙',
    availabilityEn: 'Immediate · 5 Days/Wk · 3–6 Months · Shenzhen / Hangzhou / Changsha',
    recruiterPitchZh:
      '【候选人速览】黄奕轩（湖南农大计科 28 届），具备极为罕见的「一线多智能体生产落地 + FDE 驻场交付」双背景：1）独立负责农业科研写作系统「禾书耕文」（LangGraph 46 工具 + 11 路 SSE + 17.6 万块混合 RAG，初稿周期从 1 个月缩至 3 天）；2）洋葱教育连续 15 周 FDE 驻场，落地 35 个只读经营工具（人工确认写库硬闸）与 19 条巨量投流 API；3）斩获字节跳动 Trae 校园赛二/三等奖与 LEV0 黑客松最佳创意奖。可立即到岗，每周 5 天实习 3–6 个月（深圳优先）。',
    recruiterPitchEn:
      '[Candidate Summary] Huang Yixuan (CS ’28) combines production Multi-Agent engineering with on-site FDE delivery: (1) Lead architect of HeShu AI4Science (46-tool LangGraph loop, 11 SSE channels, 176k-chunk Hybrid RAG, cutting paper drafting from 1 month to 3 days); (2) 15-week FDE residency at Onion Education (35 read-only agent tools with HITL write gates + 19 Ocean Engine APIs); (3) 2x ByteDance Trae Award & LEV0 Hackathon Best Creativity winner. Immediately available 5 days/wk for 3–6 months.',
  };
}

export function buildHitlContactDraft(userText: string, lang: 'zh' | 'en'): HitlContactDraftData {
  const emailMatch = userText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const isInterview =
    userText.includes('面试') ||
    userText.includes('招聘') ||
    userText.includes('实习') ||
    userText.includes('hr') ||
    userText.toLowerCase().includes('interview') ||
    userText.toLowerCase().includes('hire');

  const isCommandPrompt =
    userText.includes('帮我拟') ||
    userText.includes('留言草稿') ||
    userText.toLowerCase().includes('help me draft') ||
    userText.length <= 16;

  const formattedBody = isCommandPrompt
    ? lang === 'en'
      ? 'Hi Yixuan, we are an AI engineering team and were impressed by your HeShu AI4Science (46-tool LangGraph loop) and Onion Edu FDE residency projects. We would love to schedule a remote interview with you this Thursday afternoon.'
      : '奕轩你好！我们是深圳 AI 研发团队，在你的个人门户了解到你在「禾书耕文」LangGraph 多智能体系统（46 工具 / 17.6 万知识块 RAG）与洋葱教育 FDE 驻场中的工程实践，非常契合我们的 AI Agent / 全栈实习岗位。想约你本周四下午进行一次远程视频面试，期待你的回复！'
    : userText.replace(/^📬\s*/, '');

  return {
    draftId: `draft-${Date.now()}`,
    intentType: isInterview ? 'interview' : 'collaboration',
    senderName: lang === 'en' ? 'Visiting Recruiter / Collaborator' : '深圳 AI 团队面试官 / 合作伙伴',
    senderEmail: emailMatch ? emailMatch[0] : '',
    subject: isInterview
      ? lang === 'en'
        ? 'Internship Interview Invitation for Huang Yixuan (AI Agent / Full-Stack)'
        : '【实习面试邀请】AI Agent / 全栈研发实习生沟通 — 致黄奕轩'
      : lang === 'en'
      ? 'Project Collaboration / Technical Exchange'
      : '【项目合作 / 技术交流】来自个人门户 AI 小轩的留言',
    content: formattedBody,
    status: 'pending_approval',
  };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface RunAgentTurnParams {
  userMessage: string;
  persona: AgentPersonaMode;
  lang: 'zh' | 'en';
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  onEvent: (event: AgentSseEvent) => void;
}

export async function runAgentTurn({
  userMessage,
  persona,
  lang,
  history,
  onEvent,
}: RunAgentTurnParams): Promise<void> {
  const startTime = Date.now();
  const q = userMessage.toLowerCase().trim();

  // Step 1: Guardrail & Intent Routing
  onEvent({
    type: 'step_start',
    node: 'GUARDRAIL',
    titleZh: '安全红线校验与意图路由...',
    titleEn: 'Running privacy guardrail & intent router...',
  });
  await delay(140);

  // 1. Privacy Guardrail Check
  if (
    q.includes('电话') ||
    q.includes('手机') ||
    q.includes('微信') ||
    q.includes('身份证') ||
    q.includes('生日') ||
    q.includes('紧急联系') ||
    q.includes('已投') ||
    q.includes('网申') ||
    q.includes('phone') ||
    q.includes('wechat') ||
    q.includes('id card')
  ) {
    onEvent({
      type: 'tool_call',
      tool: {
        id: `tc-${Date.now()}-privacy`,
        toolName: 'privacy_guard_check',
        category: 'read_only',
        status: 'completed',
        args: { policy: 'STRICT_PII_REDACTION', query: userMessage.slice(0, 32) },
        summaryZh: '已触发隐私保护红线：拦截敏感个人信息，返回公开联系渠道与留言表单引导',
        summaryEn: 'Privacy guardrail triggered: redacted sensitive PII, returning public contact channels',
        durationMs: 45,
      },
    });

    onEvent({
      type: 'step_start',
      node: 'HITL_GATE',
      titleZh: '生成合规联系与人工确认留言卡...',
      titleEn: 'Preparing human-in-the-loop contact card...',
    });
    await delay(120);

    const draft = buildHitlContactDraft('', lang);
    onEvent({
      type: 'generative_card',
      card: { type: 'contact_approval', data: draft },
    });

    const replyText =
      lang === 'en'
        ? `For privacy protection, sensitive personal details (such as phone numbers, personal WeChat, ID numbers, or private job application logs) are strictly protected and not publicly displayed.\n\nYou can reach Huang Yixuan directly via **hyxhhh1013@gmail.com**, or fill out the **Human-in-the-Loop Message Draft Card** below — nothing is written to the database until you click **Approve & Send**!`
        : `出于个人隐私保护红线，公开门户严禁透露手机号、个人微信号、身份证号或私密网申记录等敏感信息。\n\n如果您有实习面试邀请或技术合作意向，欢迎直接发送邮件至 **hyxhhh1013@gmail.com**，或直接在下方我为您生成的 **「人工确认硬闸留言卡」** 中填写并点击确认发送！`;

    await streamTextChunks(replyText, onEvent);
    onEvent({
      type: 'suggestions',
      itemsZh: ['🎯 评估岗位 JD 匹配度', '🚀 介绍禾书耕文 46 个工具', '📅 查看可到岗时间与意向城市'],
      itemsEn: ['🎯 Evaluate JD Match', '🚀 HeShu 46-Tool Architecture', '📅 Availability & Target Cities'],
    });
    onEvent({ type: 'done', totalDurationMs: Date.now() - startTime });
    return;
  }

  // 2. Check for Page Co-Pilot UI Actions (Skin switch, Music control, Skill filter, Section scroll)
  onEvent({
    type: 'step_start',
    node: 'PLAN',
    titleZh: '规划工具调用链与页面联动动作...',
    titleEn: 'Planning tool execution chain & page co-pilot actions...',
  });
  await delay(150);

  // 2a. Skin / Theme Switching
  if (
    q.includes('皮肤') ||
    q.includes('主题') ||
    q.includes('松墨') ||
    q.includes('曜石') ||
    q.includes('博朗') ||
    q.includes('暖沙') ||
    q.includes('暗黑') ||
    q.includes('深色') ||
    q.includes('浅色') ||
    q.includes('夜间') ||
    q.includes('日间') ||
    q.includes('skin') ||
    q.includes('forest') ||
    q.includes('titanium') ||
    q.includes('cobalt') ||
    q.includes('dark mode') ||
    q.includes('light mode')
  ) {
    let targetSkin: 'editorial' | 'titanium' | 'forest' | 'cobalt' | undefined;
    if (q.includes('松墨') || q.includes('画廊') || q.includes('forest')) targetSkin = 'forest';
    else if (q.includes('曜石') || q.includes('titanium')) targetSkin = 'titanium';
    else if (q.includes('博朗') || q.includes('工业') || q.includes('cobalt')) targetSkin = 'cobalt';
    else if (q.includes('暖沙') || q.includes('杂志') || q.includes('editorial')) targetSkin = 'editorial';

    let darkMode: boolean | undefined;
    if (q.includes('暗黑') || q.includes('深色') || q.includes('夜间') || q.includes('dark')) darkMode = true;
    else if (q.includes('浅色') || q.includes('日间') || q.includes('白天') || q.includes('light')) darkMode = false;

    if (!targetSkin && darkMode === undefined) {
      targetSkin = 'forest';
    }

    onEvent({
      type: 'step_start',
      node: 'TOOL_EXEC',
      titleZh: '调用 switch_portal_skin 切换全站视觉系统...',
      titleEn: 'Executing switch_portal_skin on DOM...',
    });

    onEvent({
      type: 'tool_call',
      tool: {
        id: `tc-${Date.now()}-skin`,
        toolName: 'switch_portal_skin',
        category: 'ui_action',
        status: 'completed',
        args: { skin: targetSkin || 'keep', darkMode: darkMode ?? 'keep' },
        summaryZh: `已实时切换全站视觉皮肤 token (${targetSkin || (darkMode ? 'Dark' : 'Light')})`,
        summaryEn: `Switched site-wide CSS design tokens (${targetSkin || (darkMode ? 'Dark' : 'Light')})`,
        durationMs: 65,
      },
    });

    onEvent({
      type: 'ui_action',
      action: { type: 'switch_skin', skin: targetSkin, darkMode },
    });

    const skinReply =
      lang === 'en'
        ? `Done! I executed \`switch_portal_skin\` to update the live CSS design tokens (${
            targetSkin ? `Skin: **${targetSkin.toUpperCase()}**` : ''
          } ${darkMode !== undefined ? `Mode: **${darkMode ? 'Dark' : 'Light'}**` : ''}).\n\nYou can also test **Editorial (Warm Sand)**, **Titanium (Linear Obsidian)**, **Forest (Kinfolk Moss)**, or **Cobalt (Braun Industrial)** anytime!`
        : `已通过前端协同总线执行 \`switch_portal_skin\`，为您实时切换全站视觉主题${
            targetSkin ? `（当前皮肤：**${targetSkin}**）` : ''
          }${darkMode !== undefined ? `（模式：**${darkMode ? '夜间暗黑' : '日间浅色'}**）` : ''} ✨\n\n全站共有 4 套致敬 Dieter Rams、Kinfolk 与 Linear 的设计师皮肤：**暖沙杂志 (Editorial)**、**曜石微光 (Titanium)**、**画廊松墨 (Forest)** 与 **工业暖灰 (Cobalt)**，你可以随时让我切换！`;

    await streamTextChunks(skinReply, onEvent);
    onEvent({
      type: 'suggestions',
      itemsZh: ['🎨 切回暖沙杂志 (Editorial) 皮肤', '🎨 试试博朗工业 (Cobalt) 皮肤', '🎵 播放背景 Lofi 音乐'],
      itemsEn: ['🎨 Switch to Editorial Skin', '🎨 Try Braun Cobalt Skin', '🎵 Play Lofi Music'],
    });
    onEvent({ type: 'done', totalDurationMs: Date.now() - startTime });
    return;
  }

  // 2b. Music Control
  if (
    q.includes('播放') ||
    q.includes('放首歌') ||
    q.includes('听歌') ||
    q.includes('音乐') ||
    q.includes('暂停') ||
    q.includes('下一首') ||
    q.includes('切歌') ||
    q.includes('黑胶') ||
    q.includes('play music') ||
    q.includes('pause music') ||
    q.includes('next track')
  ) {
    let command: 'play' | 'pause' | 'next' | 'prev' = 'play';
    if (q.includes('暂停') || q.includes('停') || q.includes('pause')) command = 'pause';
    else if (q.includes('下一首') || q.includes('切歌') || q.includes('换一首') || q.includes('next')) command = 'next';
    else if (q.includes('上一首') || q.includes('prev')) command = 'prev';

    onEvent({
      type: 'step_start',
      node: 'TOOL_EXEC',
      titleZh: `调用 control_vinyl_player (${command})...`,
      titleEn: `Executing control_vinyl_player (${command})...`,
    });

    onEvent({
      type: 'tool_call',
      tool: {
        id: `tc-${Date.now()}-music`,
        toolName: 'control_vinyl_player',
        category: 'ui_action',
        status: 'completed',
        args: { command },
        summaryZh: `已联动 MusicContext 执行动作: ${command.toUpperCase()}`,
        summaryEn: `Triggered MusicContext action: ${command.toUpperCase()}`,
        durationMs: 55,
      },
    });

    onEvent({
      type: 'ui_action',
      action: { type: 'music_control', command },
    });

    onEvent({
      type: 'generative_card',
      card: {
        type: 'music_now_playing',
        data: {
          actionPerformed: command,
          noteZh: '已打通全站 Audio 引擎与 Lofi 电钢琴合成器，可在下方迷你唱机卡片直接控制进度与切歌。',
          noteEn: 'Connected to the site-wide Audio Engine & WebAudio Lofi synth. Control playback directly below.',
        },
      },
    });

    const musicReply =
      lang === 'en'
        ? `Executed \`control_vinyl_player({ command: "${command}" })\`! You can control playback directly in the embedded vinyl card above or switch to the **Music** tab.`
        : `已通过 \`control_vinyl_player({ command: "${command}" })\` 为你联动全站随身听 🎵 你可以直接在下方的内嵌黑胶卡片中调节进度、切歌，或者边听音乐边让我带你导览项目！`;

    await streamTextChunks(musicReply, onEvent);
    onEvent({
      type: 'suggestions',
      itemsZh: ['⏭ 切换到下一首歌', '🚀 边听歌边看「禾书耕文」架构', '🎨 切换成画廊松墨主题'],
      itemsEn: ['⏭ Next Track', '🚀 Explore HeShu Architecture', '🎨 Switch to Forest Skin'],
    });
    onEvent({ type: 'done', totalDurationMs: Date.now() - startTime });
    return;
  }

  // 2c. Human-in-the-Loop Contact / Interview Invitation
  if (
    q.includes('留言') ||
    q.includes('约面') ||
    q.includes('预约面试') ||
    q.includes('发邮件') ||
    q.includes('联系奕轩') ||
    q.includes('怎么联系') ||
    q.includes('如何联系') ||
    q.includes('发消息') ||
    q.includes('contact yixuan') ||
    q.includes('leave a message') ||
    q.includes('schedule an interview') ||
    q.includes('draft')
  ) {
    onEvent({
      type: 'step_start',
      node: 'HITL_GATE',
      titleZh: '触发 Human-in-the-Loop 写入硬闸：生成待确认留言草稿...',
      titleEn: 'Triggering HITL Write Gate: drafting contact card for human approval...',
    });

    const draft = buildHitlContactDraft(userMessage, lang);

    onEvent({
      type: 'tool_call',
      tool: {
        id: `tc-${Date.now()}-hitl`,
        toolName: 'draft_interview_or_message',
        category: 'hitl_gate',
        status: 'completed',
        args: {
          intentType: draft.intentType,
          subject: draft.subject,
          requiresHumanApproval: true,
        },
        summaryZh: '已拟定留言草稿（未写库），等待访客点击「人工确认并写入」',
        summaryEn: 'Draft created (DB write blocked until human confirmation)',
        durationMs: 110,
      },
    });

    if (q.includes('跳') || q.includes('滚') || q.includes('带我')) {
      onEvent({
        type: 'ui_action',
        action: { type: 'navigate_section', section: 'contact' },
      });
    }

    onEvent({
      type: 'generative_card',
      card: { type: 'contact_approval', data: draft },
    });

    const hitlReply =
      lang === 'en'
        ? `Huang Yixuan’s public contact channels:\n- **Email**: \`hyxhhh1013@gmail.com\`\n- **GitHub**: https://github.com/hyxhhh1013\n- **Location**: Changsha, Hunan (Immediately available for internships in **Shenzhen / Hangzhou / Changsha**)\n\nFollowing the same **Human-in-the-Loop (HITL) safety gate** engineered in his Onion Education FDE Agent, I drafted a structured message card above instead of writing silently to the database. You can edit the fields and click **✓ Approve & Write to DB** to send it!`
        : `你可以通过以下公开渠道直接联系黄奕轩：\n- 📧 **公开邮箱**：\`hyxhhh1013@gmail.com\`\n- 🐙 **GitHub**：https://github.com/hyxhhh1013\n- 📍 **常驻与意向城市**：湖南长沙（可**立即到岗**，**深圳优先 / 杭州 / 长沙**均可）\n\n同时，复刻奕轩在**洋葱教育 FDE 经营 Agent** 中的 **「只拟草稿、人工点确认才写库」** 安全机制，我已为您在上方生成了可编辑的 **待审批留言草稿卡**——核对或补充您的邮箱后点击 **「✓ 人工确认并写入数据库」** 即可直接写入后台数据库！`;

    await streamTextChunks(hitlReply, onEvent);
    onEvent({
      type: 'suggestions',
      itemsZh: ['🎯 测一测岗位 JD 匹配度', '💼 了解洋葱教育 35 个只读工具', '🚀 查看禾书耕文 46 工具架构'],
      itemsEn: ['🎯 Evaluate JD Fit', '💼 Onion Edu 35 Agent Tools', '🚀 HeShu 46-Tool Architecture'],
    });
    onEvent({ type: 'done', totalDurationMs: Date.now() - startTime });
    return;
  }

  // 2d. Recruiter JD Match Evaluation
  if (
    q.includes('jd') ||
    q.includes('匹配') ||
    q.includes('评估') ||
    q.includes('岗位') ||
    q.includes('招聘') ||
    q.includes('合适') ||
    q.includes('招人') ||
    q.includes('面试官') ||
    q.includes('fit') ||
    q.includes('evaluate') ||
    q.includes('recruiter') ||
    (persona === 'recruiter' && (q.includes('优势') || q.includes('为什么选') || q.includes('简历')))
  ) {
    onEvent({
      type: 'step_start',
      node: 'TOOL_EXEC',
      titleZh: '调用 analyze_jd_fit 交叉比对技术栈、项目指标与到岗周期...',
      titleEn: 'Running analyze_jd_fit across skills, production metrics & availability...',
    });
    await delay(180);

    const matchData = evaluateJdMatch(userMessage);

    onEvent({
      type: 'tool_call',
      tool: {
        id: `tc-${Date.now()}-jd`,
        toolName: 'analyze_jd_fit',
        category: 'read_only',
        status: 'completed',
        args: {
          roleTarget: matchData.roleTitleZh,
          computedScore: `${matchData.overallScore}%`,
        },
        summaryZh: `匹配度计算完成：综合契合度 ${matchData.overallScore}%（含 3 维工程实证与推荐摘要）`,
        summaryEn: `JD evaluation complete: ${matchData.overallScore}% overall fit across 3 engineering dimensions`,
        durationMs: 185,
      },
    });

    onEvent({
      type: 'generative_card',
      card: { type: 'jd_match', data: matchData },
    });

    const jdReply =
      lang === 'en'
        ? `I ran \`analyze_jd_fit\` against Huang Yixuan’s production portfolio and internship availability (**${matchData.overallScore}% Match**).\n\nKey highlights for interviewers:\n1. **Production Agent Engineering**: Built a recoverable **46-tool LangGraph loop** + **11-channel SSE** + **176,230-chunk Hybrid RAG** (*HeShu*), and **35 read-only tools with HITL write gates** (*Onion Edu*).\n2. **AI-Native Speed**: Uses ~**200M tokens/day** across Cursor, Claude Code, Codex & Trae, shipping full-stack apps with **2000+ automated tests**.\n3. **Immediate Onboarding**: Available **immediately**, **5 days/week** for **3–6 consecutive months** (**Shenzhen priority**, Hangzhou, Changsha).\n\nYou can also paste any custom job description directly into the evaluator card above or copy the one-click recruiter pitch!`
        : `我已调用 \`analyze_jd_fit\` 完成岗位画像与黄奕轩工程履历的交叉评估（综合契合度 **${matchData.overallScore}%**）：\n\n- **真刀真枪的生产级 Agent 经验**：不仅懂原理，更在课题组落地了 **46 个工具 + 11 路 SSE + 17.6 万知识块混合 RAG** 的「禾书耕文」（初稿从 1 个月缩至 3 天），并在洋葱教育驻场落地 **35 个只读工具 + 人工确认写库硬闸**；\n- **极致的 AI 原生交付效率**：日均使用 **2 亿 Token**（Cursor / Claude Code / Codex / Trae），4 周独立交付 60fps「梦境拓扑」，单项目覆盖 **124 个 API 与 2000+ 自动化测试**；\n- **到岗快、周期稳**：**可立即到岗**，每周出勤 **5 天**，可连续实习 **3–6 个月**（**深圳优先**，杭州、长沙均可）。\n\n您可以在上方卡片中**一键复制内推/评估摘要**，或点击「拟定面试邀请」向他发送消息！`;

    await streamTextChunks(jdReply, onEvent);
    onEvent({
      type: 'suggestions',
      itemsZh: ['📬 帮我拟一份远程面试邀请草稿', '🚀 深入拆解「禾书耕文」46个工具架构', '💼 查看洋葱教育 FDE 15周驻场细节'],
      itemsEn: ['📬 Draft Interview Invitation', '🚀 Deep-dive HeShu 46 Tools', '💼 Onion Edu FDE Details'],
    });
    onEvent({ type: 'done', totalDurationMs: Date.now() - startTime });
    return;
  }

  // 2e. Skill Filter Action
  if (
    (q.includes('筛选') || q.includes('高亮') || q.includes('过滤') || q.includes('filter')) &&
    (q.includes('langgraph') || q.includes('react') || q.includes('next') || q.includes('rag') || q.includes('prisma') || q.includes('typescript'))
  ) {
    let targetSkill = 'LangGraph';
    if (q.includes('react')) targetSkill = 'React 19';
    else if (q.includes('next')) targetSkill = 'Next.js 16';
    else if (q.includes('rag')) targetSkill = 'Hybrid RAG';
    else if (q.includes('prisma')) targetSkill = 'Prisma';
    else if (q.includes('typescript')) targetSkill = 'TypeScript';

    onEvent({
      type: 'tool_call',
      tool: {
        id: `tc-${Date.now()}-filter`,
        toolName: 'filter_skill_matrix',
        category: 'ui_action',
        status: 'completed',
        args: { skill: targetSkill },
        summaryZh: `已在首页项目区激活技能筛选器: ${targetSkill}`,
        summaryEn: `Activated project skill filter: ${targetSkill}`,
        durationMs: 70,
      },
    });

    onEvent({
      type: 'ui_action',
      action: { type: 'filter_skill', skill: targetSkill },
    });
    onEvent({
      type: 'ui_action',
      action: { type: 'navigate_section', section: 'projects' },
    });

    const filterReply =
      lang === 'en'
        ? `Executed \`filter_skill_matrix({ skill: "${targetSkill}" })\` and scrolled to the **Selected Works** section! All projects utilizing **${targetSkill}** are now highlighted with a warm brass ring.`
        : `已执行 \`filter_skill_matrix({ skill: "${targetSkill}" })\` 并为您平滑滚动至首页「项目案例」区！所有采用 **${targetSkill}** 的项目卡片现已高亮标记。`;

    await streamTextChunks(filterReply, onEvent);
    onEvent({
      type: 'suggestions',
      itemsZh: ['🚀 展开禾书耕文的架构拆解面板', '💼 洋葱教育 FDE 驻场做了什么？', '🎯 评估 AI Agent 实习岗位匹配度'],
      itemsEn: ['🚀 Open HeShu Architecture Tab', '💼 Onion Edu FDE Residency', '🎯 Evaluate JD Fit'],
    });
    onEvent({ type: 'done', totalDurationMs: Date.now() - startTime });
    return;
  }

  // 2f. Project Dossier & Architecture Deep-Dive (HeShu / FanDingLe / DreamTop / Outbounds / All)
  if (
    q.includes('禾书') ||
    q.includes('ai4science') ||
    q.includes('46') ||
    q.includes('文献') ||
    q.includes('饭定了') ||
    q.includes('选餐') ||
    q.includes('梦境') ||
    q.includes('dream') ||
    q.includes('拓扑') ||
    q.includes('界外') ||
    q.includes('outbounds') ||
    q.includes('项目') ||
    q.includes('作品') ||
    q.includes('架构') ||
    q.includes('project') ||
    q.includes('heshu')
  ) {
    let targetSlug: 'heshu' | 'fandingle' | 'dreamtop' | 'outbounds' = 'heshu';
    if (q.includes('饭定了') || q.includes('选餐') || q.includes('餐饮') || q.includes('fandingle')) {
      targetSlug = 'fandingle';
    } else if (q.includes('梦境') || q.includes('拓扑') || q.includes('dream')) {
      targetSlug = 'dreamtop';
    } else if (q.includes('界外') || q.includes('宇宙') || q.includes('outbounds')) {
      targetSlug = 'outbounds';
    }

    const wantsAllProjects =
      (q.includes('项目') || q.includes('作品') || q.includes('project')) &&
      !q.includes('禾书') &&
      !q.includes('饭定了') &&
      !q.includes('梦境') &&
      !q.includes('界外') &&
      !q.includes('heshu') &&
      !q.includes('dream') &&
      !q.includes('outbounds');

    const wantsArchitectureTab =
      q.includes('架构') || q.includes('难点') || q.includes('拆解') || q.includes('展开') || q.includes('arch') || persona === 'architect';

    const dossier = PROJECT_DOSSIERS[targetSlug];

    onEvent({
      type: 'step_start',
      node: 'TOOL_EXEC',
      titleZh: `调用 get_project_dossier 检索项目指标与架构图谱...`,
      titleEn: `Executing get_project_dossier for quantitative telemetry...`,
    });
    await delay(160);

    onEvent({
      type: 'tool_call',
      tool: {
        id: `tc-${Date.now()}-proj`,
        toolName: 'get_project_dossier',
        category: 'read_only',
        status: 'completed',
        args: {
          slug: wantsAllProjects ? 'all_flagship' : targetSlug,
          focus: wantsArchitectureTab ? 'architecture' : 'overview',
        },
        summaryZh: `已检索「${dossier.titleZh.split(' ')[0]}」4 项核心遥测指标与架构方案`,
        summaryEn: `Retrieved ${dossier.slug.toUpperCase()} telemetry & architecture dossier`,
        durationMs: 145,
      },
    });

    const wantsExplicitScroll =
      q.includes('带我') ||
      q.includes('去看') ||
      q.includes('定位') ||
      q.includes('展开') ||
      q.includes('滚') ||
      q.includes('scroll') ||
      q.includes('locate') ||
      q.includes('open its architecture');

    if (wantsExplicitScroll) {
      onEvent({
        type: 'tool_call',
        tool: {
          id: `tc-${Date.now()}-nav`,
          toolName: 'navigate_and_highlight',
          category: 'ui_action',
          status: 'completed',
          args: {
            section: 'projects',
            projectCode: dossier.indexCode,
            projectTab: wantsArchitectureTab ? 'architecture' : 'overview',
          },
          summaryZh: `已滚动至 PLATE // ${dossier.indexCode} 并切换至「${wantsArchitectureTab ? '架构拆解' : '产品概览'}」面板`,
          summaryEn: `Scrolled to PLATE // ${dossier.indexCode} (${wantsArchitectureTab ? 'Architecture' : 'Overview'} tab)`,
          durationMs: 80,
        },
      });

      onEvent({
        type: 'ui_action',
        action: {
          type: 'navigate_section',
          section: 'projects',
          projectCode: dossier.indexCode,
          projectTab: wantsArchitectureTab ? 'architecture' : 'overview',
        },
      });
    }

    onEvent({
      type: 'generative_card',
      card: { type: 'project_dossier', data: dossier },
    });

    let projReply = '';
    if (wantsAllProjects) {
      projReply =
        lang === 'en'
          ? `Huang Yixuan has independently architected and shipped **4 flagship full-stack & AI systems**:\n\n1. **HeShu (AI4Science Research Writing System)**: Reduced academic paper first-draft time from ~1 month to **~3 days** (10+ drafts delivered). Built with a **46-tool LangGraph loop**, **11 SSE channels**, **176,230-chunk Hybrid RAG** (2,749 papers, BM25 + Vector + RRF), and **5 journal PDF templates** across **124 APIs & 2000+ tests**.\n2. **DreamTop (Subconscious Topology)**: Shipped from 0 to 1 in 4 weeks; extracts dream symbols via GLM-4 into a **60fps** force-directed graph (**ByteDance Trae 3rd Prize**).\n3. **Outbounds**: Next.js 16 & React 19 multi-universe hub (Hacker / Art / ACG) with cross-universe AI companions (**ByteDance Trae 2nd Prize**).\n4. **FanDingLe**: Room-based campus dining decision app (**LEV0 Hackathon Best Creativity Award**).\n\nClick **Locate & Open Architecture** on the card above to jump directly to the live interactive breakdown!`
          : `黄奕轩独立负责并上线了 **4 个代表性全栈与 AI 生产级项目**（上方已为您渲染核心代表作 **「禾书耕文」** 交互档案卡）：\n\n1. **禾书耕文 | 农业科研论文 AI 写作系统**（AIFA 实验室重点项目）：\n   - **真实落地**：将论文初稿从手写约 1 个月缩短至 **约 3 天**，课题组学生已交出 **10 余篇初稿**；\n   - **可恢复多智能体循环**：基于 LangGraph 构建 \`plan → agent → tools → reflect\` 状态机，拆解 **46 个工具**，通过 **11 路 SSE** 实时推送计划与人工审批检查点；\n   - **混合 RAG 与四维审查**：收录 **2,749 篇文献、176,230 个知识块**（BM25 + 向量 + RRF 融合排序），支持 **SCI / Nature / IEEE / GB/T 7713 / CAS 五套模板** PDF 导出，含 **124 个 API、18 张表、2000+ 测试**。\n2. **梦境拓扑 DreamTop**：4 周独立从 0 到 1 上线，GLM-4 意象抽取 + **60fps** 力导向图谱，获 **字节跳动 Trae on Campus 湖南农大三等奖**。\n3. **界外 Outbounds**：Next.js 16 + React 19 构建 Hacker / Art / ACG 三主题宇宙，获 **字节跳动 Trae on Campus 中南大学二等奖**。\n4. **饭定了**：室友建房协同选餐应用，获 **LEV0 黑客松最佳创意奖**。`;
    } else {
      projReply =
        lang === 'en'
          ? `Here is the technical breakdown for **${dossier.titleEn}**:\n\n- **Core Impact**: ${dossier.highlightEn}\n- **Architecture & Engineering Solution**: ${dossier.architectureNoteEn}\n- **Tech Stack**: \`${dossier.stack.join('` · `')}\`\n\nYou can click **Locate & Open Architecture** on the dossier card above to inspect the card on the page!`
          : `为您拆解 **「${dossier.titleZh}」** 的核心工程架构：\n\n- **落地成效**：${dossier.highlightZh}\n- **核心架构与难点攻克**：${dossier.architectureNoteZh}\n- **工程技术栈**：\`${dossier.stack.join('` · `')}\`\n\n点击上方卡片中的 **「定位并展开架构拆解」** 按钮，页面将自动平滑滚动至对应展板并为您打开架构视图！`;
    }

    await streamTextChunks(projReply, onEvent);
    onEvent({
      type: 'suggestions',
      itemsZh: [
        targetSlug === 'heshu' ? '🔍 深入了解「梦境拓扑」60fps 图谱架构' : '🚀 深入了解「禾书耕文」46 工具架构',
        '💼 洋葱教育 FDE 驻场 35 个只读工具细节',
        '🎯 评估 AI Agent 实习岗位匹配度',
      ],
      itemsEn: [
        targetSlug === 'heshu' ? '🔍 Explore DreamTop 60fps Graph' : '🚀 Explore HeShu 46-Tool Loop',
        '💼 Onion Edu FDE 35 Agent Tools',
        '🎯 Evaluate JD Match',
      ],
    });
    onEvent({ type: 'done', totalDurationMs: Date.now() - startTime });
    return;
  }

  // 2g. Onion Education FDE Residency & Experience
  if (
    q.includes('fde') ||
    q.includes('洋葱') ||
    q.includes('驻场') ||
    q.includes('实习') ||
    q.includes('经历') ||
    q.includes('35') ||
    q.includes('巨量') ||
    q.includes('投流') ||
    q.includes('联通') ||
    q.includes('aifa') ||
    q.includes('intern') ||
    q.includes('onion')
  ) {
    onEvent({
      type: 'step_start',
      node: 'TOOL_EXEC',
      titleZh: '调用 get_fde_residency_log 检索洋葱教育 15 周驻场工程日志...',
      titleEn: 'Executing get_fde_residency_log for FDE residency telemetry...',
    });
    await delay(160);

    onEvent({
      type: 'tool_call',
      tool: {
        id: `tc-${Date.now()}-fde`,
        toolName: 'get_fde_residency_log',
        category: 'read_only',
        status: 'completed',
        args: { company: 'Onion Education', weeksOnSite: 15, readOnlyTools: 35, oceanEngineApis: 19 },
        summaryZh: '已加载洋葱教育 FDE 驻场遥测：15周驻场 / 35个只读工具 / 100+路由 / 19条投流API',
        summaryEn: 'Loaded FDE telemetry: 15 weeks on-site, 35 read-only tools, 100+ routes, 19 ad APIs',
        durationMs: 135,
      },
    });

    if (q.includes('带我') || q.includes('去看') || q.includes('跳') || q.includes('滚')) {
      onEvent({
        type: 'ui_action',
        action: { type: 'navigate_section', section: 'experience' },
      });
    }

    onEvent({
      type: 'generative_card',
      card: { type: 'fde_telemetry', data: FDE_TELEMETRY_DATA },
    });

    const fdeReply =
      lang === 'en'
        ? `In his role as a **Forward-Deployed Engineer (FDE) Intern at Hunan Onion Education** (2026.06–Present), Huang Yixuan bridges frontline business operations and production AI engineering:\n\n1. **15 Consecutive Weeks On-Site**: Embedded across **8 business teams** (Conversion, Academic, HR, Finance), shipping same-day verified updates and authoring **39–45 workflow specs**.\n2. **Operations Agent (35 Read-Only Tools + HITL Gate)**: Unified metrics with existing dashboards for instant natural-language querying. Anomalies only generate task drafts that **require human approval before database writes** — preventing silent data corruption.\n3. **Dual-Line Full-Lifecycle Platform**: Spans **100+ FastAPI routes** for Tutoring & IELTS with table-prefix isolation and server-side hard gates for 3-tier class consumption approval.\n4. **Ad Attribution (19 Ocean Engine APIs)**: Pulls daily cost/click/conversion metrics across 4 tiers (Account/Campaign/Ad/Creative) with human-confirmed budget caps (±20%).`
        : `黄奕轩在 **湖南洋葱教育科技有限公司** 担任 **FDE 驻场工程师**（教育培训经营中台，2026.06–至今），核心工程交付可概括为四大支柱（详见上方遥测卡）：\n\n1. **连续驻场 15 周 · 极速响应**：直接对接转化、教务、HR、财务等 **8 个项目组**，把一线模糊痛点拆成当日可上线验收的代码改动，沉淀 **39–45 份**业务流程文档与前后端热规则；\n2. **经营 Agent（35 个只读工具 + 人工确认写库硬闸）**：到账、退费、课消、转化、投流和人事与现有看板同一口径直接问；发现异常只拟成派任务草稿，**必须经人工点击确认后才写入数据库**，彻底杜绝静默改数；\n3. **家教与雅思双业务线全链路**：独立改动贯穿 **FastAPI 100+ 路由模块**，同库表前缀隔离，消课三级审批、课酬按日指派与电子合同审核全部做成服务端硬闸；\n4. **巨量引擎 19 条官方 API 投流回台**：按账户、计划、广告、素材四层按日拉回消耗与线索成本，改预算须人工确认且单次硬限不超过 ±20%。`;

    await streamTextChunks(fdeReply, onEvent);
    onEvent({
      type: 'suggestions',
      itemsZh: ['📍 滚动到首页「04 // 经历与实践」时间轴', '🚀 对比禾书耕文 46 个工具与 FDE 35 个工具', '🎯 评估岗位匹配度'],
      itemsEn: ['📍 Scroll to Experience Timeline', '🚀 Compare HeShu 46 Tools vs FDE 35 Tools', '🎯 Evaluate JD Fit'],
    });
    onEvent({ type: 'done', totalDurationMs: Date.now() - startTime });
    return;
  }

  // 2h. Awards, Strengths, Availability, or General Questions -> Call Backend SSE / Chat or Rich Knowledge Base
  const isAwardOrAvail =
    q.includes('奖') ||
    q.includes('荣誉') ||
    q.includes('优势') ||
    q.includes('token') ||
    q.includes('到岗') ||
    q.includes('求职') ||
    q.includes('城市') ||
    q.includes('方向') ||
    q.includes('深圳') ||
    q.includes('杭州') ||
    q.includes('award') ||
    q.includes('available') ||
    q.includes('strength');

  onEvent({
    type: 'step_start',
    node: 'TOOL_EXEC',
    titleZh: isAwardOrAvail
      ? '调用 query_awards_and_strengths & query_availability_and_cities...'
      : '检索黄奕轩全栈数字档案与实时知识库...',
    titleEn: isAwardOrAvail
      ? 'Executing query_awards_and_strengths & query_availability_and_cities...'
      : 'Querying Huang Yixuan digital portfolio knowledge base...',
  });

  onEvent({
    type: 'tool_call',
    tool: {
      id: `tc-${Date.now()}-kb`,
      toolName: isAwardOrAvail ? 'query_awards_and_strengths' : 'query_cultural_archive',
      category: 'read_only',
      status: 'completed',
      args: { persona, lang, query: userMessage.slice(0, 40) },
      summaryZh: isAwardOrAvail
        ? '已检索 5 项竞赛荣誉、日均 2 亿 Token 工作流及深圳/杭州/长沙立即到岗状态'
        : '已完成全站档案检索，准备合成回复',
      summaryEn: isAwardOrAvail
        ? 'Retrieved 5 awards, 200M tokens/day workflow & immediate availability'
        : 'Completed portfolio knowledge retrieval',
      durationMs: 120,
    },
  });

  onEvent({
    type: 'step_start',
    node: 'SYNTHESIS',
    titleZh: '正在流式生成回答...',
    titleEn: 'Synthesizing streaming response...',
  });

  // Try backend /api/ai/chat with persona context, fallback to rich local synthesis
  let finalReply = '';
  try {
    const response = await axios.post('/api/ai/chat', {
      persona,
      messages: [
        ...history.slice(-6),
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });
    if (response.data?.success && response.data?.message) {
      finalReply = response.data.message;
    }
  } catch {
    // Fallback handled below
  }

  if (!finalReply) {
    finalReply = buildFallbackSynthesis(userMessage, lang);
  }

  await streamTextChunks(finalReply, onEvent);

  onEvent({
    type: 'suggestions',
    itemsZh: ['🎯 启动 HR 岗位 JD 匹配度评估', '🚀 拆解「禾书耕文」46工具架构', '📬 拟一份面试邀请留言草稿'],
    itemsEn: ['🎯 Run Recruiter JD Match Evaluator', '🚀 HeShu 46-Tool Architecture', '📬 Draft Interview Invitation'],
  });
  onEvent({ type: 'done', totalDurationMs: Date.now() - startTime });
}

async function streamTextChunks(text: string, onEvent: (e: AgentSseEvent) => void): Promise<void> {
  // Split into natural small chunks (6-14 chars) so streaming feels snappy & tactile (like Linear / Claude)
  const chunkSize = 10;
  for (let i = 0; i < text.length; i += chunkSize) {
    const slice = text.slice(i, i + chunkSize);
    onEvent({ type: 'delta', content: slice });
    await delay(14);
  }
}

function buildFallbackSynthesis(question: string, lang: 'zh' | 'en'): string {
  const q = question.toLowerCase();

  if (q.includes('奖') || q.includes('荣誉') || q.includes('优势') || q.includes('token') || q.includes('award')) {
    return lang === 'en'
      ? `**🏆 Competition Awards (5 Honors)**:\n- **ByteDance Trae on Campus (Central South Univ.) — 2nd Prize** (*Outbounds*)\n- **ByteDance Trae on Campus (Hunan Agricultural Univ.) — 3rd Prize** (*DreamTop*)\n- **LEV0 Hackathon (2026.06) — Best Creativity Award** (*FanDingLe*)\n- **Hunan University Student Innovation Competition — 2nd Prize**\n- **Hunan Collegiate Programming Contest (Cybersecurity) — 3rd Prize**\n\n**⚡ Core Engineering Strengths**:\n- **AI-Native Builder (~200M tokens/day)**: Deeply integrates Cursor, Claude Code, Codex & Trae across architecture design, codegen, refactoring, and automated testing.\n- **Production Agent & RAG Systems**: Built recoverable LangGraph state machines (46 tools, 11 SSE channels) and 176k-chunk Hybrid RAG with strict citation gates.`
      : `**🏆 竞赛荣誉与奖项（共 5 项）**：\n- **字节跳动 Trae on Campus · 中南大学 二等奖**（独立全栈作品：界外 Outbounds）\n- **字节跳动 Trae on Campus · 湖南农业大学 三等奖**（独立全栈作品：梦境拓扑 DreamTop）\n- **LEV0 黑客松 · 2026.06 最佳创意奖**（独立全栈作品：饭定了）\n- **湖南省大学生创新大赛校赛 · 一鉴到底 二等奖**\n- **湖南省程序设计大赛 · 网络安全 三等奖**\n\n**⚡ 个人核心工程优势**：\n1. **AI 原生开发（日均 2 亿 Token）**：深度使用 Cursor、Claude Code、Codex、Trae，将 AI 融入从架构设计、编码、重构到 2000+ 自动化测试全流程；\n2. **Agent 与 RAG 生产落地**：系统掌握 LangGraph 可恢复状态机、BM25+向量 RRF 混合检索、多路 SSE 与人工审批硬闸（Human-in-the-Loop）。`;
  }

  if (q.includes('到岗') || q.includes('求职') || q.includes('城市') || q.includes('方向') || q.includes('available')) {
    return lang === 'en'
      ? `**📅 Internship Availability & Target Roles**:\n- **Target Roles**: AI Agent Engineer, AI Full-Stack Developer, Applied AI Engineer (Class of 2028 Undergraduate)\n- **Onboarding & Duration**: **Immediately available**, **5 days/week**, for **3–6 consecutive months**\n- **Target Cities**: **Shenzhen (Priority)**, **Hangzhou**, **Changsha** (Remote interviews supported)`
      : `**📅 求职意向与到岗状态**：\n- **目标方向**：AI Agent 开发、AI 全栈研发、AI 应用工程（日常实习，湖南农大计科 2024 级 / 2028 届本科在读）\n- **到岗与出勤**：**可立即到岗**，每周出勤 **5 天**，可连续实习 **3–6 个月**（最长可连续 6 个月）\n- **意向城市**：**深圳优先**，**杭州、长沙**均可，支持随时远程视频面试。`;
  }

  return lang === 'en'
    ? `Hi! I'm **XiaoXuan**, Huang Yixuan's Page-Aware Agent Co-Pilot ✨\n\nUnlike a static chatbot, I am wired to **12 live tools** across this portfolio:\n- **Read-Only Dossiers**: Ask about **HeShu AI4Science** (46 tools, 176k RAG chunks), **Onion Edu FDE Residency** (35 agent tools, 19 Ocean Engine APIs), or run a **Recruiter JD Match Evaluation**.\n- **Page Co-Pilot**: Tell me to *"Scroll to HeShu and open its Architecture tab"*, *"Filter projects by LangGraph"*, *"Play background music"*, or *"Switch to Forest skin"*.\n- **Human-in-the-Loop Gate**: Ask me to draft an interview invitation — I'll generate an editable approval card before writing to the database!`
    : `嗨！我是**小轩**，黄奕轩门户站点的 **Page-Aware 智能体副驾驶 (Agent Co-Pilot)** ✨\n\n我不只是一个问答框，还挂载了 **12 个实时工具**，你可以直接对我下达自然语言指令：\n- 📊 **查硬核项目与驻场实绩**：问我「禾书耕文的 46 个工具怎么设计的」或「洋葱教育 FDE 驻场做了什么」；\n- 🎯 **HR 岗位 JD 匹配评估**：发送一段招聘 JD，我会自动计算匹配度并生成三维实证卡片；\n- 🧭 **操控当前页面**：对我说「带我去看禾书耕文并展开架构拆解」「筛选 LangGraph 项目」「放首背景音乐」或「切换成画廊松墨皮肤」；\n- 🛡️ **人工审批硬闸留言**：对我说「帮我给奕轩拟一份面试邀请」，我会生成待确认草稿卡，经你点击批准后才写入数据库！`;
}
