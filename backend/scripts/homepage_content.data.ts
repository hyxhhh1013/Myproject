/**
 * Homepage content = source of truth for scripts/sync_homepage_content.ts (zh + en).
 *
 * Copied verbatim (by script, not by hand) from the hardcoded defaults in
 * frontend/src/components/Sections/ as of 2026-11-20, before the homepage switched to DB rows:
 *   - Projects.tsx   DEFAULT_PROJECTS + the flagship card's inline 4 metrics
 *   - Experience.tsx DEFAULT_EXPERIENCES + FDE_MODULES (-> highlights) + the residency card's
 *                    inline 4 stats (-> metrics). The first entry's `tags` is the tag strip the
 *                    featured card actually renders (its DEFAULT_EXPERIENCES tags were never shown).
 *   - Skills.tsx     DEFAULT_CORE_SKILLS (badgeZh/labelZh/highlightZh/projects renamed to the DB
 *                    names badge/label/highlight/linkedProjects)
 * Field names are the Prisma field names (see the content contract). Array order = homepage order
 * = orderIndex.
 */

export interface Metric {
  value: string;
  label: string;
  labelEn: string;
}

export interface HomepageProject {
  /** Stable key used only in the script's log output. */
  key: string;
  /** The first project is the FLAGSHIP card: its demo link always comes from here. */
  flagship: boolean;
  /** Lower-case keywords matched against existing DB titles (first unclaimed row wins). */
  match: string[];
  /** Only used when the row has to be created (the homepage never shows project dates). */
  createStartDate: string;
  title: string;
  titleEn: string;
  badge: string;
  badgeEn: string;
  description: string;
  descriptionEn: string;
  technologies: string[];
  responsibilities: string[];
  responsibilitiesEn: string[];
  challengesProblem: string;
  challengesProblemEn: string;
  challengesSolution: string;
  challengesSolutionEn: string;
  /** Fallbacks: the homepage shows db.githubUrl || this, db.demoUrl || this (flagship: always this). */
  githubUrl: string | null;
  demoUrl: string | null;
  /** Fallback cover when the DB row has no images. */
  images: string[];
  metrics: Metric[] | null;
}

export interface HomepageExperience {
  position: string;
  positionEn: string;
  company: string;
  companyEn: string;
  /** zh label is parsed into startDate/endDate ('至今' = ongoing = null). */
  dateLabel: string;
  dateLabelEn: string;
  tags: string[];
  description: string;
  descriptionEn: string;
  linkUrl: string | null;
  linkLabel: string | null;
  highlights: { code: string; title: string; titleEn: string; desc: string; descEn: string }[] | null;
  metrics: Metric[] | null;
}

export interface HomepageSkill {
  name: string;
  nameEn: string;
  shortLabel: string;
  badge: string;
  badgeEn: string;
  metrics: Metric[];
  stack: string[];
  linkedProjects: { zh: string; en: string }[];
  highlight: string;
  highlightEn: string;
}

export const HOMEPAGE_PROJECTS: HomepageProject[] = [
  {
    key: "heshu",
    flagship: true,
    match: [
      "农业科研",
      "禾书",
      "ai4science"
    ],
    createStartDate: "2026-03-01",
    title: "禾书耕文 · 科研论文写作系统",
    titleEn: "HeShu · AI4Science Writing System",
    badge: "AIFA 实验室重点项目 · 2026.03–至今",
    badgeEn: "AIFA LAB FLAGSHIP · 2026.03–PRESENT",
    description: "驻在课题组将论文初稿从手写约 1 个月缩短至约 3 天，学生已交出 10 余篇初稿。涵盖文献混合检索、可恢复写作循环与五套学术模板导出。",
    descriptionEn: "Reduced academic paper first-draft time from ~1 month to ~3 days (10+ drafts delivered). Features a 46-tool LangGraph loop and 2,749-paper Hybrid RAG.",
    technologies: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "LangGraph",
      "Hybrid RAG",
      "PostgreSQL",
      "SSE",
      "Playwright"
    ],
    responsibilities: [
      "LangGraph 可恢复写作循环（plan→agent→tools→reflect），拆成 46 个工具 + 11 路 SSE 检查点推送",
      "收录 2,749 篇文献、176,230 个知识块（BM25+向量+RRF 融合排序），越界引用写回前自动剥离",
      "导出前做学术规范/论证/结构/诚信四维审查，支持 SCI、Nature、IEEE 等 5 套模板导出（124 API / 2000+ 测试）"
    ],
    responsibilitiesEn: [
      "Recoverable LangGraph loop (plan→agent→tools→reflect) with 46 tools & 11 SSE channels",
      "2,749 papers (176,230 chunks) with BM25+Vector+RRF hybrid retrieval & strict citation stripping",
      "4D pre-export integrity review & Playwright PDF export across 5 templates (124 APIs / 2000+ tests)"
    ],
    challengesProblem: "长文综述跨段落上下文易漂移，且农学专业术语检索与引文真实性要求极高。",
    challengesProblemEn: "Long-form generation suffered from context drift and strict agronomic citation requirements.",
    challengesSolution: "BM25 + 向量 RRF 融合重排 + 大纲人工批准检查点断点续跑 + 引用落表硬闸校验。",
    challengesSolutionEn: "BM25+Vector RRF fusion + human-in-the-loop outline checkpoints + DB-backed citation gates.",
    githubUrl: "https://github.com/hyxhhh1013/AI-assisted-writing-system-for-agricultural-research",
    demoUrl: "https://ai4science.hyxhhh.site/",
    images: [
      "/projects/heshu-cover.webp"
    ],
    metrics: [
      {
        value: "~3 Days",
        label: "初稿周期 · 已出 10+ 篇",
        labelEn: "Draft Cycle · 10+ Papers"
      },
      {
        value: "46 Tools",
        label: "LangGraph · 11 路 SSE",
        labelEn: "LangGraph · 11 SSE"
      },
      {
        value: "176,230",
        label: "2,749 篇文献知识块",
        labelEn: "2,749 Papers Indexed"
      },
      {
        value: "2000+",
        label: "测试 · 124 API · 5 模板",
        labelEn: "Tests · 124 APIs"
      }
    ]
  },
  {
    key: "dreamtop",
    flagship: false,
    match: [
      "梦境"
    ],
    createStartDate: "2026-04-01",
    title: "梦境拓扑 DreamTop",
    titleEn: "DreamTop · Subconscious Topology",
    badge: "字节跳动 Trae · 湖南农大三等奖",
    badgeEn: "TRAE ON CAMPUS · HNUA 3RD PRIZE",
    description: "4 周独立从 0 到 1 上线。支持语音与文字输入，将梦境文本抽取为意象与情感结构化数据，再做 60fps 拓扑图谱可视化。",
    descriptionEn: "Shipped from 0 to 1 in 4 weeks. Extracts dream symbols & emotions via GLM-4 into a 60fps interactive topology graph.",
    technologies: [
      "React",
      "Vite",
      "Node.js",
      "Express",
      "Prisma",
      "MySQL",
      "Framer Motion",
      "GLM-4 API"
    ],
    responsibilities: [
      "4 周独立完成需求梳理、Prisma/MySQL 图关系建模与生产环境部署上线",
      "支持语音与文字双模态录入，接入 GLM-4 结构化抽取潜意识意象与情感极性",
      "实现力导向拓扑图谱与周期洞察报告，画布交互稳定保持 60fps"
    ],
    responsibilitiesEn: [
      "Independently built & deployed from 0 to 1 in 4 weeks with Prisma & MySQL",
      "Voice & text dream capture with GLM-4 structured symbol/emotion extraction",
      "Interactive Force-Directed topology graph running steadily at 60fps"
    ],
    challengesProblem: "非结构化梦境意象跳跃性强，跨日同源符号易产生孤立节点且影响画布帧率。",
    challengesProblemEn: "Fragmented dream symbols created isolated nodes and degraded canvas frame rates.",
    challengesSolution: "构建符号归一化关联表（dream_symbols + topology_edges）与画布渲染节流优化。",
    challengesSolutionEn: "Normalized symbol-edge schemas paired with 60fps canvas simulation throttling.",
    githubUrl: "https://github.com/hyxhhh1013/dream-topology",
    demoUrl: "https://dream.hyxhhh.site/",
    images: [
      "/projects/dreamtop-cover.webp"
    ],
    metrics: null
  },
  {
    key: "outbounds",
    flagship: false,
    match: [
      "界外",
      "outbounds"
    ],
    createStartDate: "2026-03-01",
    title: "界外 Outbounds",
    titleEn: "Outbounds · Multi-Universe Hub",
    badge: "字节跳动 Trae · 中南大学二等奖",
    badgeEn: "TRAE ON CAMPUS · CSU 2ND PRIZE",
    description: "Next.js 16 全栈社区，独立打造 Hacker / Art / ACG 三个主题宇宙，支持卡片手势流、即时通讯与跨宇宙 AI 伴侣。",
    descriptionEn: "Next.js 16 community featuring Hacker / Art / ACG themed universes with gesture cards and AI companions.",
    technologies: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind v4",
      "Prisma",
      "SQLite",
      "Framer Motion",
      "Zod"
    ],
    responsibilities: [
      "基于 Next.js 16 App Router 与 React 19 独立完成全栈架构与边缘可部署设计",
      "构建 Hacker / Art / ACG 三套独立视觉宇宙、卡片手势流与跨宇宙 AI 伴侣对话",
      "采用 Prisma + Zod 全链路数据校验与 Vitest 单元测试保障稳定性"
    ],
    responsibilitiesEn: [
      "Architected the Next.js 16 App Router & React 19 full-stack application",
      "Built Hacker / Art / ACG themed universes with gesture streams & AI chat",
      "End-to-end Zod validation, Prisma modeling, and Vitest unit testing"
    ],
    challengesProblem: "三套截然不同的宇宙主题与对话上下文在高频切换时易闪烁或丢失状态。",
    challengesProblemEn: "Switching across three distinct universe themes caused layout flicker and state loss.",
    challengesSolution: "采用 React Context + URL 参数持久化与共享布局过渡，实现零闪烁无缝切换。",
    challengesSolutionEn: "Combined React Context + URL persistence with Framer Motion shared layout transitions.",
    githubUrl: "https://github.com/hyxhhh1013/Outbounds",
    demoUrl: "https://hyxhhh.site/outbounds",
    images: [
      "/projects/outbounds-cover.webp"
    ],
    metrics: null
  },
  {
    key: "fandingle",
    flagship: false,
    match: [
      "饭定了"
    ],
    createStartDate: "2026-06-01",
    title: "饭定了 · 校园餐饮协同决策",
    titleEn: "FanDingLe · Campus Dining Decision",
    badge: "LEV0 黑客松 · 2026.06 最佳创意奖",
    badgeEn: "LEV0 HACKATHON · BEST CREATIVITY",
    description: "校园选餐协同应用：室友建房、填口味与忌口，30 秒内一起把聚餐门店定下来，覆盖湖南农大周边真实门店池。",
    descriptionEn: "Collaborative campus dining app where roommates create rooms, filter dietary rules, and pick a restaurant in 30s.",
    technologies: [
      "TypeScript",
      "React",
      "Node.js",
      "Tailwind CSS",
      "Prisma"
    ],
    responsibilities: [
      "独立完成前后端全栈开发，实地调研并录入农大周边 50+ 真实餐饮门店池",
      "设计多人建房、口味画像填报与实时投票收敛的轻量化交互闭环",
      "实现「负向忌口一票否决 + 正向偏好加权」门店推荐算法"
    ],
    responsibilitiesEn: [
      "Independently built full-stack app & curated 50+ local campus restaurants",
      "Designed room creation, dietary profiling, and real-time voting flows",
      "Implemented veto-first dietary filtering + weighted preference matching"
    ],
    challengesProblem: "多人聚餐众口难调，传统随机转盘缺乏真实周边门店与忌口数据支撑。",
    challengesProblemEn: "Group dining stalled due to conflicting preferences and generic random wheels.",
    challengesSolution: "结合周边真实门店画像与忌口硬过滤，将候选池快速收敛至 Top 3 高匹配门店。",
    challengesSolutionEn: "Combined real merchant profiles with hard dietary filters to converge on Top 3 matches.",
    githubUrl: null,
    demoUrl: "https://eat.hyxhhh.site/",
    images: [
      "/projects/fandingle-cover.webp"
    ],
    metrics: null
  }
];

export const HOMEPAGE_EXPERIENCES: HomepageExperience[] = [
  {
    position: "FDE 驻场工程师",
    positionEn: "Forward-Deployed Engineer (FDE Intern)",
    company: "湖南洋葱教育科技有限公司 · 教育培训经营中台",
    companyEn: "Hunan Onion Education Technology Co., Ltd.",
    dateLabel: "2026.06 — 至今",
    dateLabelEn: "JUN 2026 — PRESENT",
    tags: [
      "React",
      "Vite",
      "TypeScript",
      "FastAPI",
      "LangGraph",
      "PostgreSQL",
      "巨量引擎 API"
    ],
    description: "连续驻场 15 周对接 8 个部门，沉淀 45 份业务流程文档。落地 35 个只读工具的经营 Agent、家教与雅思双线全链路中台（FastAPI 100+ 路由）及巨量引擎 19 条 API 投流归因。",
    descriptionEn: "On-site for 15 weeks across 8 teams. Shipped a 35-tool Operations Agent, full-link Tutoring & IELTS middle platform across 100+ FastAPI routes, and 19 Ocean Engine ad attribution APIs.",
    linkUrl: null,
    linkLabel: null,
    highlights: [
      {
        code: "01 / AGENT",
        title: "经营 Agent（35 个只读工具）",
        titleEn: "Operations Agent (35 Read-Only Tools)",
        desc: "到账、退费、课消、转化、投流与看板同口径直接问；异常仅拟任务草稿，人工确认后才写库。",
        descEn: "Unified with dashboard metrics across 35 read-only tools; anomalies draft tasks requiring human approval."
      },
      {
        code: "02 / PIPELINE",
        title: "整线绑定（驻场 15 周 · 8 部门）",
        titleEn: "Full-Line Integration (15 Weeks · 8 Teams)",
        desc: "覆盖引流、签单、排课、售后与财务核对（FastAPI 100+ 路由），沉淀 45 份同日更新业务流程。",
        descEn: "Covered lead-to-finance workflows across 100+ FastAPI routes with 45 same-day updated process docs."
      },
      {
        code: "03 / WORKFLOW",
        title: "家教与雅思双线 & 三级审批硬闸",
        titleEn: "Dual-Line Conversion & Server Hard Gates",
        desc: "家教与雅思共用一库、表前缀隔离；电子合同签审才落档，消课三级审批与课酬按日指派做在服务端。",
        descEn: "Shared DB with table-prefix isolation; server-side hard gates for e-contracts and 3-tier approval."
      },
      {
        code: "04 / ATTRIBUTION",
        title: "投流回台（巨量引擎 19 条 API）",
        titleEn: "Ad Attribution (19 Ocean Engine APIs)",
        desc: "按账户、计划、广告、素材四层按日拉回消耗与线索成本；改预算须人工确认，单次不超 ±20%。",
        descEn: "4-level daily ad spend & CPL attribution via 19 official APIs; budget edits capped at ±20% with HITL."
      }
    ],
    metrics: [
      {
        value: "15 Weeks",
        label: "连续驻场 · 对接 8 部门",
        labelEn: "On-Site · 8 Teams"
      },
      {
        value: "35 Tools",
        label: "经营 Agent 只读工具",
        labelEn: "Read-Only Agent Tools"
      },
      {
        value: "100+ Routes",
        label: "FastAPI 双业务线中台",
        labelEn: "FastAPI Middle Platform"
      },
      {
        value: "19 APIs",
        label: "巨量引擎四层投流归因",
        labelEn: "Ocean Engine APIs"
      }
    ]
  },
  {
    position: "农业科研 AI 写作系统 · 独立负责",
    positionEn: "Agricultural AI Writing System · Lead Developer",
    company: "AIFA 实验室（湖南农业大学 · 农业人工智能实验室）",
    companyEn: "AIFA Lab · Hunan Agricultural University",
    dateLabel: "2026.03 — 至今",
    dateLabelEn: "MAR 2026 — PRESENT",
    tags: [
      "Next.js 16",
      "LangGraph",
      "Hybrid RAG"
    ],
    description: "把论文初稿从手写约 1 个月缩短至约 3 天（已出 10+ 篇初稿）。用 LangGraph 构建 46 工具可恢复写作循环，收录 2,749 篇文献（17.6 万知识块），支持 5 套期刊模板导出。",
    descriptionEn: "Reduced paper first-draft time from ~1 month to ~3 days (10+ drafts). Built a 46-tool LangGraph loop over 2,749 papers (176k chunks) with 5 journal export templates.",
    linkUrl: "https://ai4science.hyxhhh.site/",
    linkLabel: "ai4science.hyxhhh.site",
    highlights: null,
    metrics: null
  },
  {
    position: "学生团队负责人 · 一线调研",
    positionEn: "Student Team Leader · Supply-Chain Research",
    company: "智慧农业创新中心",
    companyEn: "Smart Agriculture Innovation Center",
    dateLabel: "2026.03 — 至今",
    dateLabelEn: "MAR 2026 — PRESENT",
    tags: [
      "Supply Chain",
      "Field Research",
      "Team Lead"
    ],
    description: "撰写山姆会员店供应链调研报告，汇报红星农批与东升农场一线调研成果，参与编书并在暑期科创营分享调研方法论。",
    descriptionEn: "Authored the Sam's Club supply-chain report, presented findings on Hongxing Market & Dongsheng Farm, and shared field methodology at the Summer Innovation Camp.",
    linkUrl: null,
    linkLabel: null,
    highlights: null,
    metrics: null
  },
  {
    position: "全栈门户 & AI 助手 · 独立开发",
    positionEn: "Full-Stack Portal & AI Guide · Indie Developer",
    company: "个人项目 · hyxhhh.site",
    companyEn: "Personal Project · hyxhhh.site",
    dateLabel: "2025.12 — 至今",
    dateLabelEn: "DEC 2025 — PRESENT",
    tags: [
      "React 18",
      "Express",
      "Prisma",
      "智谱 GLM"
    ],
    description: "11 个后台 CMS 模块 + 智谱 GLM 服务端 SSE 流式助手。照片上传经 Sharp 自动转 WebP 并提取 EXIF，支持中英文按需翻译缓存，Nginx/PM2 生产部署。",
    descriptionEn: "11 CMS modules + server-side GLM SSE assistant, automated Sharp WebP/EXIF pipeline, on-demand translation caching, and Nginx/PM2 deployment.",
    linkUrl: "https://hyxhhh.site/",
    linkLabel: "hyxhhh.site",
    highlights: null,
    metrics: null
  },
  {
    position: "「沃·创计划」第五期实习",
    positionEn: "\"Wo-Chuang Plan\" Cohort 5 Intern",
    company: "中国联通长沙市分公司（芙蓉区分公司）",
    companyEn: "China Unicom Changsha Branch",
    dateLabel: "2025.07 — 2025.08",
    dateLabelEn: "JUL 2025 — AUG 2025",
    tags: [
      "China Unicom",
      "Operations"
    ],
    description: "参加长沙联通「沃·创计划」第五期暑期实习，在芙蓉区分公司参与一线业务实践与数字化运营协作。",
    descriptionEn: "Participated in China Unicom Changsha Branch's \"Wo-Chuang Plan\" Cohort 5 summer internship at the Furong District Branch.",
    linkUrl: null,
    linkLabel: null,
    highlights: null,
    metrics: null
  }
];

export const HOMEPAGE_SKILLS: HomepageSkill[] = [
  {
    name: "LangGraph / Multi-Agent 编排",
    nameEn: "LangGraph / Multi-Agent Orchestration",
    shortLabel: "LangGraph",
    badge: "46 工具",
    badgeEn: "46 Tools",
    metrics: [
      {
        value: "46",
        label: "可恢复编排工具",
        labelEn: "Recoverable Tools"
      },
      {
        value: "35",
        label: "只读经营工具",
        labelEn: "Read-Only Ops Tools"
      },
      {
        value: "HITL",
        label: "人工审批硬闸",
        labelEn: "Write Approval Gate"
      }
    ],
    stack: [
      "LangGraph",
      "StateGraph",
      "HITL Gate",
      "Multi-Agent",
      "SSE"
    ],
    linkedProjects: [
      {
        zh: "禾书耕文 (AI4Science)",
        en: "HeShu AI4Science"
      },
      {
        zh: "洋葱教育 FDE 驻场工程",
        en: "Onion Edu FDE Systems"
      },
      {
        zh: "个人门户 Agent 工作台",
        en: "Portfolio Agent Workbench"
      }
    ],
    highlight: "可恢复状态图（plan→agent→tools→reflect）、46 工具编排、35 个只读经营工具与人工审批硬闸（HITL Gate）。",
    highlightEn: "Recoverable state graphs (plan→agent→tools→reflect), 46-tool loops, 35 read-only ops tools & HITL write gates."
  },
  {
    name: "Hybrid RAG / 向量检索与重排",
    nameEn: "Hybrid RAG & Reranking Pipeline",
    shortLabel: "Hybrid RAG",
    badge: "2,749 篇文献",
    badgeEn: "2,749 Papers",
    metrics: [
      {
        value: "2,749",
        label: "结构化科研文献",
        labelEn: "Indexed Papers"
      },
      {
        value: "176K",
        label: "切分知识块",
        labelEn: "Knowledge Chunks"
      },
      {
        value: "RRF",
        label: "双路融合重排",
        labelEn: "Fusion Rerank"
      }
    ],
    stack: [
      "BM25",
      "pgvector",
      "RRF Rerank",
      "Citation Gate",
      "Embeddings"
    ],
    linkedProjects: [
      {
        zh: "禾书耕文 (AI4Science)",
        en: "HeShu AI4Science"
      },
      {
        zh: "个人门户 Agent 工作台",
        en: "Portfolio Agent Workbench"
      }
    ],
    highlight: "2,749 篇文献（176,230 知识块）BM25 + 向量检索 + RRF 融合重排，越界引用写回前剥离与落表硬闸校验。",
    highlightEn: "2,749 papers (176,230 chunks) BM25 + Vector + RRF fusion reranking with strict citation verification gates."
  },
  {
    name: "Python / FastAPI 后端与数据中台",
    nameEn: "Python / FastAPI & Middle Platform",
    shortLabel: "FastAPI",
    badge: "100+ 路由",
    badgeEn: "100+ Routes",
    metrics: [
      {
        value: "100+",
        label: "双业务线路由",
        labelEn: "Production Routes"
      },
      {
        value: "11",
        label: "SSE 检查点流",
        labelEn: "SSE Channels"
      },
      {
        value: "19",
        label: "巨量引擎归因接口",
        labelEn: "Attribution APIs"
      }
    ],
    stack: [
      "FastAPI",
      "Python",
      "Node.js",
      "SSE Streaming",
      "REST"
    ],
    linkedProjects: [
      {
        zh: "洋葱教育 FDE 驻场工程",
        en: "Onion Edu FDE Systems"
      },
      {
        zh: "禾书耕文 (AI4Science)",
        en: "HeShu AI4Science"
      }
    ],
    highlight: "独立贯穿 100+ 路由双业务线中台、11 路 SSE 检查点流式推送、消课三级审批服务端硬闸与 19 条巨量引擎 API 归因。",
    highlightEn: "100+ FastAPI routes across dual business lines, 11-channel SSE checkpoint streaming & 19 Ocean Engine APIs."
  },
  {
    name: "Tool Calling / MCP & Context 工程",
    nameEn: "Tool Calling / MCP & Context Eng.",
    shortLabel: "MCP/Tools",
    badge: "多模型路由",
    badgeEn: "Multi-LLM",
    metrics: [
      {
        value: "MCP",
        label: "标准工具协议",
        labelEn: "Tool Protocol"
      },
      {
        value: "4D",
        label: "学术诚信审查",
        labelEn: "Integrity Checks"
      },
      {
        value: "3+",
        label: "异构模型路由",
        labelEn: "LLM Providers"
      }
    ],
    stack: [
      "Tool Schema",
      "MCP",
      "DeepSeek",
      "GLM-4",
      "Context Compression"
    ],
    linkedProjects: [
      {
        zh: "禾书耕文 (AI4Science)",
        en: "HeShu AI4Science"
      },
      {
        zh: "洋葱教育 FDE 驻场工程",
        en: "Onion Edu FDE Systems"
      },
      {
        zh: "梦境拓扑 DreamTop",
        en: "DreamTop Topology"
      }
    ],
    highlight: "结构化 Tool Schema 设计、长上下文防漂移压缩、DeepSeek / GLM-4 / Claude 多模型路由与四维学术诚信审查。",
    highlightEn: "Structured Tool Schemas, long-context drift prevention, multi-LLM routing (DeepSeek/GLM-4) & 4D integrity checks."
  },
  {
    name: "PostgreSQL / Prisma 数据建模",
    nameEn: "PostgreSQL / Prisma & Vector DB",
    shortLabel: "PG/Prisma",
    badge: "财务 0.1 精度",
    badgeEn: "Multi-Tenant",
    metrics: [
      {
        value: "0.1",
        label: "课时财务对账精度",
        labelEn: "Ledger Precision"
      },
      {
        value: "ACID",
        label: "同单号幂等去重",
        labelEn: "Idempotent Writes"
      },
      {
        value: "PG",
        label: "表前缀多租户隔离",
        labelEn: "Prefix Isolation"
      }
    ],
    stack: [
      "PostgreSQL",
      "Prisma ORM",
      "pgvector",
      "SQL",
      "Idempotency"
    ],
    linkedProjects: [
      {
        zh: "禾书耕文 (AI4Science)",
        en: "HeShu AI4Science"
      },
      {
        zh: "洋葱教育 FDE 驻场工程",
        en: "Onion Edu FDE Systems"
      },
      {
        zh: "梦境拓扑 DreamTop",
        en: "DreamTop Topology"
      }
    ],
    highlight: "多业务线同库表前缀隔离、pgvector 向量存储、同单号收款幂等去重与课时 0.1 精度财务对账建模。",
    highlightEn: "Table-prefix multi-tenant isolation, pgvector embeddings, idempotent financial deduplication & graph schemas."
  },
  {
    name: "AI 原生全栈交付 & 自动化测试",
    nameEn: "AI-Native Delivery & E2E Testing",
    shortLabel: "AI-Native",
    badge: "2000+ 测试",
    badgeEn: "2000+ Tests",
    metrics: [
      {
        value: "200M",
        label: "日均 Token 吞吐",
        labelEn: "Daily Tokens"
      },
      {
        value: "2000+",
        label: "自动化测试用例",
        labelEn: "Automated Tests"
      },
      {
        value: "0→1",
        label: "Linux / Nginx 交付",
        labelEn: "Full Delivery"
      }
    ],
    stack: [
      "React 18",
      "TypeScript",
      "Playwright",
      "Vitest",
      "Nginx / PM2"
    ],
    linkedProjects: [
      {
        zh: "禾书耕文 (AI4Science)",
        en: "HeShu AI4Science"
      },
      {
        zh: "界外 Outbounds",
        en: "Outbounds Platform"
      },
      {
        zh: "饭定了 (智能餐饮决策)",
        en: "FanDingLe Mini-App"
      }
    ],
    highlight: "日均 2 亿 Token（Cursor / Claude Code / Codex / Trae）驱动 0→1 交付，配合 2000+ 自动化测试、Playwright 与 Nginx/PM2 部署。",
    highlightEn: "200M+ tokens/day AI-native workflow (Cursor/Claude Code/Codex) backed by 2000+ tests, Playwright & Linux deployment."
  }
];

/** Contact: the GitHub link shown in Hero/Contact (User.email / location are left alone). */
export const HOMEPAGE_GITHUB = { platform: 'GitHub', url: 'https://github.com/hyxhhh1013' };
