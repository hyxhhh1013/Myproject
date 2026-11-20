// Strictly sourced from: 计算机组成原理期末复习汇总与参考答案.md

export interface ExamTipGroup {
  title: string;
  items: { label: string; text: string; emphasize?: boolean }[];
}

export const EXAM_META = {
  title: '《计算机组成原理》期末复习题汇总与参考答案',
  source: '11月18日《计算机组成原理期末复习与考点解析》钉钉闪记录音/纪要 + 课堂 PPT 实拍题目（共 13 道核心题，覆盖填空、简答、计算与综合设计题）',
};

export const EXAM_TIPS: ExamTipGroup[] = [
  {
    title: '1. 成绩构成与近期安排',
    items: [
      { label: '成绩占比', text: '实验成绩占总成绩约 60%，卷面成绩占 40%–50%。' },
      { label: '学习通实验', text: '平台仅剩最后一周即将关闭，未交实验任务务必尽快提交；实验报告严禁抄袭，实验中连线出错如实记录得分反而更高。' },
      { label: '近期考核', text: '周四有一套随堂测试；周六实验课重点考微程序编程题（20 分）（按实验指导书的混合表示法）。', emphasize: true },
    ],
  },
  {
    title: '2. 命题规律与防错提醒',
    items: [
      { label: '明确不考', text: '老师在课堂上明确表示，本次期末计算题不考浮点数加减乘除的复杂具体运算过程，但五大基本操作步骤必背。' },
      { label: '不会考一模一样的原题', text: '组相联 Cache 地址格式、存储器芯片扩展等大题会更换参数（如 Cache 行数 64→128、每块字数 128→256 等），必须掌握推导步骤。', emphasize: true },
      { label: '以教材和课堂为准（防 AI 偏差）', text: '老师专门提到，Cache 替换算法请务必答 随机、LFU、LRU，不要受部分 AI 默认输出 FIFO 的误导。', emphasize: true },
    ],
  },
];

export type QuestionSection = 'fill' | 'short' | 'design';

export type QuestionInteractiveType =
  | 'single-blank'
  | 'multi-ordered'
  | 'cache-two-groups'
  | 'short-answer'
  | 'cache-address'
  | 'microprogram'
  | 'sram-expansion';

export interface MicroprogramRow {
  addr: string;
  m23m22: string;
  wrrdiom: string;
  s3s0: string;
  aField: string;
  bField: string;
  cField: string;
  ma5ma0: string;
  hex24: string;
  desc: string;
  note?: string;
}

export interface CoQuestion {
  id: number;
  label: string; // e.g. "第 1 题" or "第 9 题（原题 10）"
  title: string;
  section: QuestionSection;
  sectionLabel: string;
  tag?: string;
  interactiveType: QuestionInteractiveType;
  prompt: string;
  // For single-blank
  placeholder?: string;
  acceptedAnswers?: string[];
  secondaryAccepted?: { answers: string[]; message: string };
  // For multi-ordered (Q6)
  orderedSlots?: { label: string; accepted: string[]; display: string }[];
  // For cache-two-groups (Q7)
  groupA?: { title: string; count: number; items: { canonical: string; aliases: string[] }[] };
  groupB?: { title: string; count: number; items: { canonical: string; aliases: string[] }[]; forbidden?: { word: string; warning: string }[] };
  // For short-answer (Q8-Q10)
  checklist?: string[];
  comparisonTable?: { headers: string[]; rows: string[][] };
  // For cache-address (Q11)
  cacheFields?: { key: 'total' | 'tag' | 'set' | 'offset'; label: string; answer: number }[];
  // For microprogram (Q12)
  microprogramFlow?: { group: string; lines: string[] }[];
  microprogramFormat?: string[];
  microprogramRows?: MicroprogramRow[];
  microprogramFootnote?: string;
  // For sram-expansion (Q13)
  sramFields?: { key: string; label: string; unit: string; accepted: string[]; display: string }[];
  sramDiagram?: string;
  sramRubric?: string[];
  // Common reference answer & explanation
  answerSummary: string;
  explanationLines: string[];
  pitfall?: string;
}

export const CO_QUESTIONS: CoQuestion[] = [
  {
    id: 1,
    label: '第 1 题',
    title: '按字编址寻址范围',
    section: 'fill',
    sectionLabel: '填空与基础计算',
    interactiveType: 'single-blank',
    prompt: '某计算机字长 64 位，其存储容量为 256MB，若按字编址，它的寻址范围是（ ）。',
    placeholder: '例如：32M 或 2^25 或 0~32M-1',
    acceptedAnswers: [
      '32m',
      '2^25',
      '0~32m-1',
      '0-32m-1',
      '0~2^25-1',
      '0000000h~1ffffffh',
      '0000000h-1ffffffh',
      '0h~1ffffffh',
      '33554432',
    ],
    answerSummary: '32M（或表示为 2²⁵、0 ~ 32M - 1、0000000H ~ 1FFFFFFH）',
    explanationLines: [
      '计算机字长为 64 位，换算成字节为：64 bit ÷ 8 = 8 B = 2³ B。',
      '总存储容量为：256 MB = 2⁸ × 2²⁰ B = 2²⁸ B。',
      '按字编址的总字数（寻址范围）= 总容量 ÷ 字长（字节数）= 256 MB ÷ 8 B = 32 M = 2²⁵。',
    ],
    pitfall: '切忌把“64 位”直接当成“64 字节（64B）”，一定要先除以 8 换算成字节（区分大写 B 字节和小写 b 位）。',
  },
  {
    id: 2,
    label: '第 2 题',
    title: '存储器地址线与数据线总和',
    section: 'fill',
    sectionLabel: '填空与基础计算',
    interactiveType: 'single-blank',
    prompt: '一个 32K × 32 位的存储器，其地址线和数据线的总和是（ ）。',
    placeholder: '输入数字，如 47',
    acceptedAnswers: ['47', '47根'],
    answerSummary: '47',
    explanationLines: [
      '口诀：存储单元数（容量）决定地址线根数，字长决定数据线根数。',
      '单元数 32K = 2⁵ × 2¹⁰ = 2¹⁵ ⇒ 地址线为 15 根。',
      '字长为 32 位 ⇒ 数据线为 32 根。',
      '总和：15 + 32 = 47 根。',
      '课堂补充：常见 2 的幂次要熟记：1K = 2¹⁰，1M = 2²⁰，1G = 2³⁰；例如 4G = 2³²，对应 32 根地址线。',
    ],
  },
  {
    id: 3,
    label: '第 3 题',
    title: '十进制小数转二进制',
    section: 'fill',
    sectionLabel: '填空与基础计算',
    interactiveType: 'single-blank',
    prompt: '十进制数 78.375 对应的二进制数为（ ）。',
    placeholder: '例如：1001110.011',
    acceptedAnswers: ['1001110.011', '(1001110.011)2', '1001110.011b'],
    answerSummary: '1001110.011',
    explanationLines: [
      '口诀：整数除 2 取余逆序排列，小数乘 2 取整顺序排列，两段算完拼接。',
      '1. 整数部分 78（除 2 取余，逆序读）：78÷2=39…0 → 39÷2=19…1 → 19÷2=9…1 → 9÷2=4…1 → 4÷2=2…0 → 2÷2=1…0 → 1÷2=0…1，逆序排列得 1001110。',
      '2. 小数部分 0.375（乘 2 取整，顺序读）：0.375×2=0.75（取 0）→ 0.75×2=1.5（取 1）→ 0.5×2=1.0（取 1），顺序排列得 011。',
      '3. 合并结果：(78.375)₁₀ = (1001110.011)₂。',
    ],
  },
  {
    id: 4,
    label: '第 4 题',
    title: '混合进制加法',
    section: 'fill',
    sectionLabel: '填空与基础计算',
    interactiveType: 'single-blank',
    prompt: '数 2A3CH 与数 (753)₈ 的和为（ ）。',
    placeholder: '推荐填十六进制，如 2C27H',
    acceptedAnswers: [
      '2c27h',
      '2c27',
      '0x2c27',
      '11303',
      '26047',
      '(26047)8',
      '10110000100111',
      '(10110000100111)2',
    ],
    answerSummary: '2C27H（等价于二进制 (10110000100111)₂、八进制 (26047)₈、十进制 11303）',
    explanationLines: [
      '核心原则：先统一转换为同一进制再相加。',
      '1. 将八进制 (753)₈ 按“1 位八进制 = 3 位二进制”展开：(753)₈ = (111 101 011)₂。',
      '2. 再按“4 位二进制 = 1 位十六进制”从右向左分组（左侧补 0）：(0001 1110 1011)₂ = 1EBH。',
      '3. 十六进制直接相加：2A3CH + 01EBH：',
      '   • 最低位：C(12) + B(11) = 23 = 16 + 7，写 7 进 1；',
      '   • 次低位：3 + E(14) + 1 = 18 = 16 + 2，写 2 进 1；',
      '   • 第三位：A(10) + 1 + 1 = 12 = C，写 C 进 0；',
      '   • 最高位：2 + 0 = 2；最终结果：2C27H。',
    ],
  },
  {
    id: 5,
    label: '第 5 题',
    title: 'RAM 存储芯片最少引出线数目',
    section: 'fill',
    sectionLabel: '填空与基础计算',
    interactiveType: 'single-blank',
    prompt: '某一 RAM 芯片，其容量为 1024 × 8 位，除电源和接地端以外，该芯片引出线的最少数目是（ ）。',
    placeholder: '常规默认填 SRAM 答案（20），或填 DRAM（15）',
    acceptedAnswers: ['20', '20根'],
    secondaryAccepted: {
      answers: ['15', '15根'],
      message: '答对了 DRAM 情况（15 根，地址线分时复用）！常规默认 SRAM（不分时复用）为 20 根，考试建议注明两种情况或按题意作答。',
    },
    answerSummary: 'SRAM（地址线不分时复用，常规默认）：20 根；DRAM（地址线分时复用）：15 根',
    explanationLines: [
      '核心公式：引出线总数 = 地址线 + 数据线 + 控制线（不含电源 VCC 和接地 GND）。',
      '1024 = 2¹⁰ ⇒ 地址线 10 根；8 位 ⇒ 数据线 8 根；读写/片选控制线至少 2 根（如 CS̅ 与 R/W̅）。',
      'SRAM：10 + 8 + 2 = 20 根。',
      'DRAM：采用地址线分时复用技术，10 位地址分两次（行地址 5 位、列地址 5 位）送入，地址线减半为 5 根，故 5 + 8 + 2 = 15 根。',
    ],
    pitfall: '切勿漏算 2 根控制线而误填 18！',
  },
  {
    id: 6,
    label: '第 6 题',
    title: '浮点加减法运算基本操作',
    section: 'fill',
    sectionLabel: '填空与基础计算',
    tag: '必背 5 步',
    interactiveType: 'multi-ordered',
    prompt: '浮点加减法运算五个基本操作分别是：（ ）、（ ）、（ ）、（ ）、（ ）。',
    orderedSlots: [
      { label: '步骤 1', accepted: ['对阶'], display: '对阶' },
      { label: '步骤 2', accepted: ['尾数求和', '尾数加减', '尾数运算'], display: '尾数求和' },
      { label: '步骤 3', accepted: ['规格化', '结果规格化'], display: '规格化' },
      { label: '步骤 4', accepted: ['舍入', '舍入处理'], display: '舍入' },
      { label: '步骤 5', accepted: ['溢出判断', '判断溢出', '判溢出'], display: '溢出判断' },
    ],
    answerSummary: '对阶、尾数求和、规格化、舍入、溢出判断',
    explanationLines: [
      '1. 对阶：小阶向大阶看齐，尾数相应右移，使两数小数点对齐。',
      '2. 尾数求和：将对阶后的两尾数按定点加减法规则相加/相减。',
      '3. 规格化：检查结果的符号位与最高有效数值位是否异值（补码规格化要求），若同值则左规，若尾数溢出则右规。',
      '4. 舍入：对右移丢失的位进行精度补偿（常用 0 舍 1 入法）。',
      '5. 溢出判断：判断阶码是否上溢或下溢（绝对不能省略）。',
      '辨析：教材中有 6 个步骤，其中“操作数检查”可有可无，其余 5 步不可或缺。',
    ],
  },
  {
    id: 7,
    label: '第 7 题',
    title: 'Cache 地址映射方式与替换算法',
    section: 'fill',
    sectionLabel: '填空与基础计算',
    tag: '防 AI 偏差',
    interactiveType: 'cache-two-groups',
    prompt: 'Cache 中主存块的常用地址映射方式有（ ）、（ ）、（ ），替换算法有（ ）、（ ）、（ ）。',
    groupA: {
      title: '常用地址映射方式（3 空，顺序不限）',
      count: 3,
      items: [
        { canonical: '直接映射', aliases: ['直接映射', '直接'] },
        { canonical: '全相联映射', aliases: ['全相联映射', '全相联'] },
        { canonical: '组相联映射', aliases: ['组相联映射', '组相联'] },
      ],
    },
    groupB: {
      title: '替换算法（3 空，顺序不限，切勿填 FIFO！）',
      count: 3,
      items: [
        { canonical: '随机算法', aliases: ['随机算法', '随机', 'random'] },
        { canonical: 'LFU 算法', aliases: ['lfu', 'lfu算法', '最不经常使用', '最不经常使用算法'] },
        { canonical: 'LRU 算法', aliases: ['lru', 'lru算法', '近期最少使用', '最近最少使用', '近期最少使用算法'] },
      ],
      forbidden: [
        {
          word: 'fifo',
          warning: '课堂特别避坑：老师专门强调不要受 AI 误导填 FIFO / 先进先出！请务必答 随机、LFU、LRU。',
        },
        {
          word: '先进先出',
          warning: '课堂特别避坑：老师专门强调不要受 AI 误导填 FIFO / 先进先出！请务必答 随机、LFU、LRU。',
        },
      ],
    },
    answerSummary: '地址映射方式：直接映射、全相联映射、组相联映射；替换算法：随机算法、LFU 算法（最不经常使用）、LRU 算法（近期最少使用）',
    explanationLines: [
      '映射方式特点：直接映射电路简单、冲突概率高；全相联映射灵活、冲突低但硬件成本高；组相联映射在两者之间折中。',
      'LFU：每行设访问计数器，每访问一次加 1，替换计数值最小的行（反映历史访问频率）。',
      'LRU：命中行计数器清 0，其余行加 1（0 表示当前刚访问，数值越大表示越久未访问），替换计数值最大的行（反映近期访问情况）。',
      '随机算法：随机选择一行替换，实现最简单。',
    ],
    pitfall: '老师专门提醒：Cache 替换算法务必答 随机、LFU、LRU，不要答 FIFO！',
  },
  {
    id: 8,
    label: '第 8 题',
    title: '汉字编码三阶段',
    section: 'short',
    sectionLabel: '简答题',
    interactiveType: 'short-answer',
    prompt: '汉字在输入、存储、输出过程中所使用的编码是否一样？使用的是什么编码？',
    checklist: [
      '明确回答“不一样”',
      '输入阶段——外码（汉字输入码 / 外部编码：顺序码、音码、形码、音形码）',
      '存储与处理阶段——机内码（唯一、占 2 个字节、每字节最高位为 1，与 1 字节最高位为 0 的 ASCII 区分）',
      '输出阶段——点阵码（汉字字模点阵码 / 字形码，点阵像素越高越清晰）',
    ],
    answerSummary: '不一样。输入阶段用外码（输入码），存储与处理阶段用机内码（2 字节），输出阶段用点阵码（字形码）。',
    explanationLines: [
      '1. 输入阶段——外码（汉字输入码 / 外部编码）：用于将汉字输入计算机，主要有顺序码、音码（如拼音）、形码（如五笔字型）、音形码。',
      '2. 存储与处理阶段——机内码（汉字内部编码）：机器内部统一采用机内码进行存储和处理。每个汉字的机内码是唯一的，占 2 个字节（每字节最高位为 1，用于与最高位为 0 的 1 字节 ASCII 英文字符区分）。',
      '3. 输出阶段——点阵码（汉字字模点阵码 / 字形码）：用于屏幕显示或打印输出，以点阵形式描绘字形，点阵像素越高字形越清晰。',
    ],
  },
  {
    id: 9,
    label: '第 9 题（原题 10）',
    title: '水平型微指令与垂直型微指令的优缺点',
    section: 'short',
    sectionLabel: '简答题',
    interactiveType: 'short-answer',
    prompt: '水平型微指令和垂直型微指令的优缺点？',
    checklist: [
      '并行能力：水平型并行操作能力强、效率高、灵活性强（优）；垂直型并行能力较差、效率较低（缺）',
      '执行时间：水平型执行一条机器指令时间短（优）；垂直型时间长（缺）',
      '字长与微程序：水平型微指令字较长、微程序较短；垂直型微指令字较短、微程序较长',
      '掌握难度：水平型难以掌握、编写复杂（缺）；垂直型与机器指令相似、相对容易掌握（优）',
    ],
    comparisonTable: {
      headers: ['对比维度', '水平型微指令', '垂直型微指令'],
      rows: [
        ['并行能力', '并行操作能力强、效率高、灵活性强（优点）', '并行操作能力较差、效率较低（缺点）'],
        ['执行时间', '执行一条机器指令的时间短（优点）', '执行一条机器指令的时间长（缺点）'],
        ['字长与微程序', '微指令字较长、微程序较短', '微指令字较短、微程序较长'],
        ['掌握难度', '难以掌握、编写复杂（缺点）', '与机器指令相似、相对容易掌握（优点）'],
      ],
    },
    answerSummary: '按「并行能力—执行时间—字长与程序—掌握难度」四个维度对照作答（见下表）。',
    explanationLines: [
      '记忆技巧：水平型“字长、程序短、并行强、速度快、难写”；垂直型与水平型逐项正好相反。',
    ],
  },
  {
    id: 10,
    label: '第 10 题（原题 11）',
    title: '计算机如何区分内存中的指令与数据',
    section: 'short',
    sectionLabel: '简答题',
    tag: '双维度必答',
    interactiveType: 'short-answer',
    prompt: '指令和数据均存放在内存中，计算机如何区分它们是指令还是数据？',
    checklist: [
      '时间维度：取指令发生在取指周期；取数据发生在执行周期（或间址周期取有效地址）',
      '空间（信息流向）维度：取出的指令流流向控制器（送入指令寄存器 IR）；取出的数据流流向运算器（送入通用寄存器 / ALU）',
    ],
    answerSummary: '必须同时答出「时间维度」和「空间（信息流向）维度」，缺一扣分。',
    explanationLines: [
      '1. 从时间维度区分：取指令发生在取指周期；取数据发生在执行周期（或间址周期取有效地址）。',
      '2. 从空间（信息流向）维度区分：从内存取出的指令流，流向控制器（送入指令寄存器 IR）；从内存取出的数据流，流向运算器（送入通用寄存器 / ALU）。',
    ],
    pitfall: '必须同时答出时间和空间两个维度，缺一扣分！',
  },
  {
    id: 11,
    label: '第 11 题',
    title: '组相联 Cache 主存地址格式计算',
    section: 'design',
    sectionLabel: '计算与综合设计',
    tag: '会换参数',
    interactiveType: 'cache-address',
    prompt: '一个组相联 Cache 由 64 个行组成，每组 4 行。主存储器包含 4K 个块，每块 128 个字。请表示内存地址的格式。',
    cacheFields: [
      { key: 'total', label: '主存地址总位数', answer: 19 },
      { key: 'tag', label: '标记 (Tag) 位数', answer: 8 },
      { key: 'set', label: '组号 (Set) 位数', answer: 4 },
      { key: 'offset', label: '块内字地址 (Offset) 位数', answer: 7 },
    ],
    answerSummary: '主存地址总长为 19 位：标记 (8 位) + 组号 (4 位) + 块内字地址 (7 位)',
    explanationLines: [
      '1. 求块内字地址位数：每块包含 128 个字，128 = 2⁷，故块内字地址占 7 位。',
      '2. 求主存块号位数与主存总地址位数：主存包含 4K 个块，4K = 2² × 2¹⁰ = 2¹²，故主存块号占 12 位；主存地址总位数 = 12 + 7 = 19 位。',
      '3. 求 Cache 组数与组号位数：Cache 共 64 行，每组 4 行，故组数 = 64 ÷ 4 = 16 = 2⁴ 组，组号占 4 位。',
      '4. 求标记（Tag）位数：标记位数 = 主存块号位数 - 组号位数 = 12 - 4 = 8 位。',
    ],
    pitfall: '考试会更换参数（如 64→128 行、128→256 字），可用下方「换参变式演练」反复练熟 4 步推导！',
  },
  {
    id: 12,
    label: '第 12 题',
    title: '根据指令执行微程序流程图写出微程序',
    section: 'design',
    sectionLabel: '计算与综合设计',
    tag: '实验课 20 分重点',
    interactiveType: 'microprogram',
    prompt: '根据指令执行微程序流程图及微指令字段编码表，写出完整 24 位微程序（混合表示法）。',
    microprogramFlow: [
      {
        group: '公共入口',
        lines: [
          '地址 00H：NOP → 下址 01H',
          '地址 01H：指令译码（读指令送 IR，经 P<1> 测试位按操作码形成分支，基础下址 30H）',
        ],
      },
      {
        group: '四条指令分支',
        lines: [
          'ADD 分支：30H (R0 -> A) → 04H (R0 -> B) → 05H (A + B -> R0) → 返回 01H',
          'IN 分支：32H (IN -> R0) → 返回 01H',
          'OUT 分支：33H (R0 -> OUT) → 返回 01H',
          'HLT 分支：35H (NOP) → 跳转到 35H（原地停机循环）',
        ],
      },
    ],
    microprogramFormat: [
      '位分配（23~0 位）：M23 M22 (2位) | WR RD IOM (3位) | S3-S0 (4位) | A字段 (14~12, 3位) | B字段 (11~9, 3位) | C字段 (8~6, 3位) | MA5-MA0 (5~0, 6位下址)',
      'A 字段（目的寄存器打入）：000 NOP，001 LDA，010 LDB，011 LDR0，111 LDIR',
      'B 字段（数据送到总线）：000 NOP，001 ALU_B，010 R0_B',
      'C 字段（判别测试位）：000 NOP，001 P<1>',
    ],
    microprogramRows: [
      { addr: '00', m23m22: '00', wrrdiom: '000', s3s0: '0000', aField: '000', bField: '000', cField: '000', ma5ma0: '000001', hex24: '000001H', desc: 'NOP，转 01H' },
      { addr: '01', m23m22: '00', wrrdiom: '010', s3s0: '0000', aField: '111', bField: '000', cField: '001', ma5ma0: '110000', hex24: '107070H', desc: '读指送 IR（LDIR），P<1> 分支（基址 30H）' },
      { addr: '04', m23m22: '00', wrrdiom: '000', s3s0: '0000', aField: '010', bField: '010', cField: '000', ma5ma0: '000101', hex24: '002405H', desc: 'R0 -> B（R0_B、LDB），转 05H' },
      { addr: '05', m23m22: '00', wrrdiom: '000', s3s0: '1001', aField: '011', bField: '001', cField: '000', ma5ma0: '000001', hex24: '04B201H', desc: 'A + B -> R0（ALU加、ALU_B、LDR0），回 01H' },
      { addr: '30', m23m22: '00', wrrdiom: '000', s3s0: '0000', aField: '001', bField: '010', cField: '000', ma5ma0: '000100', hex24: '001404H', desc: 'R0 -> A（R0_B、LDA），转 04H' },
      { addr: '32', m23m22: '00', wrrdiom: '011', s3s0: '0000', aField: '011', bField: '000', cField: '000', ma5ma0: '000001', hex24: '183001H', desc: 'IN -> R0（RD=1, IOM=1 读I/O、LDR0），回 01H' },
      { addr: '33', m23m22: '00', wrrdiom: '101', s3s0: '0000', aField: '000', bField: '010', cField: '000', ma5ma0: '000001', hex24: '280401H', desc: 'R0 -> OUT（WR=1, IOM=1 写I/O、R0_B），回 01H' },
      { addr: '35', m23m22: '00', wrrdiom: '000', s3s0: '0000', aField: '000', bField: '000', cField: '000', ma5ma0: '110101', hex24: '000035H', desc: 'HLT 停机（NOP，下址 35H 原地循环）', note: '*' },
    ],
    microprogramFootnote: '注：课堂 PPT 中地址 35 的“2位”一栏排版多打了一个 0（显示为 000），按 24 位微指令格式实际应为 2 位 00。',
    answerSummary: '8 条微指令十六进制依次为：00→000001H、01→107070H、04→002405H、05→04B201H、30→001404H、32→183001H、33→280401H、35→000035H。',
    explanationLines: [
      '【核心做题法】先把 7 个字段按 2 | 3 | 4 | 3 | 3 | 3 | 6 位拼接成 24 位二进制，再从左到右每 4 位一划，直接转成 6 位十六进制。',
      '• 00H（NOP → 01H）：所有控制位全 0，仅 MA=000001 → 0000_0000_0000_0000_0000_0001 = 000001H。',
      '• 01H（取指译码）：读内存(WR,RD,IOM=010)，打入 IR(A=111)，判别分支 P<1>(C=001)，基址 30H(MA=110000) → 0001_0000_0111_0000_0111_0000 = 107070H。',
      '• 30H（R0→A，转 04H）：R0 送总线(B=010)，打入 A(A=001)，下址 04H(000100) → 0000_0000_0001_0100_0000_0100 = 001404H。',
      '• 04H（R0→B，转 05H）：R0 送总线(B=010)，打入 B(A=010)，下址 05H(000101) → 0000_0000_0010_0100_0000_0101 = 002405H。',
      '• 05H（A+B→R0，回 01H）：ALU 加法(S3-S0=1001)，ALU 送总线(B=001)，打入 R0(A=011)，回 01H → 0000_0100_1011_0010_0000_0001 = 04B201H。',
      '• 32H（IN→R0，回 01H）：读 I/O(WR,RD,IOM=011，IOM=1 表 I/O)，打入 R0(A=011)，回 01H → 0001_1000_0011_0000_0000_0001 = 183001H。',
      '• 33H（R0→OUT，回 01H）：写 I/O(WR,RD,IOM=101)，R0 送总线(B=010)，回 01H → 0010_1000_0000_0100_0000_0001 = 280401H。',
      '• 35H（HLT 停机）：控制位全 0，下址 35H(110101) 实现原地死循环停机 → 000035H。',
    ],
  },
  {
    id: 13,
    label: '第 13 题（原题 15）',
    title: '2114 SRAM 存储器扩展设计',
    section: 'design',
    sectionLabel: '计算与综合设计',
    tag: '大题 20 分重点',
    interactiveType: 'sram-expansion',
    prompt: '用 2114 SRAM（1K × 4 位）芯片组成容量为 4K × 8 的存储器。地址总线 A11 ~ A0（低），双向数据总线 D7 ~ D0（低），读/写信号线 R/W̅。计算所需的芯片个数，并绘制相应的连线图。',
    sramFields: [
      { key: 'totalChips', label: '所需芯片总数', unit: '片', accepted: ['8'], display: '8' },
      { key: 'bitGroup', label: '位扩展：每组并联芯片数', unit: '片', accepted: ['2'], display: '2' },
      { key: 'wordGroups', label: '字扩展：共需组数', unit: '组', accepted: ['4'], display: '4' },
      { key: 'chipAddr', label: '片内地址线根数 (A0~A9)', unit: '根', accepted: ['10'], display: '10' },
      { key: 'totalAddr', label: '目标总地址线根数 (A0~A11)', unit: '根', accepted: ['12'], display: '12' },
      { key: 'decoder', label: '高位译码器规格 (接 A10、A11)', unit: '译码器', accepted: ['2:4', '2-4', '2线-4线', '2-to-4'], display: '2:4' },
    ],
    sramDiagram: `D7~D4 (4) ────┬──────────────────┬──────────────────┬──────────────────┐
              │(4)               │(4)               │(4)               │(4)
D3~D0 (4) ────┼────┐             ┼────┐             ┼────┐             ┼────┐
              │    │(4)          │    │(4)          │    │(4)          │    │(4)
          ┌───┴──┐ │         ┌───┴──┐ │         ┌───┴──┐ │         ┌───┴──┐ │
          │1K×4  │ │         │1K×4  │ │         │1K×4  │ │         │1K×4  │ │  ← 每组上片接 D7~D4
          └──┬─┬─┘ │         └──┬─┬─┘ │         └──┬─┬─┘ │         └──┬─┬─┘ │
R/W ─────────┼─┼───┼────────────┼─┼───┼────────────┼─┼───┼────────────┼─┼───┤  ← R/W 统一接所有8片
             │ │   │            │ │   │            │ │   │            │ │   │
          ┌──┴─┴─┐ │         ┌──┴─┴─┐ │         ┌──┴─┴─┐ │         ┌──┴─┴─┐ │
          │1K×4  ├─┘         │1K×4  ├─┘         │1K×4  ├─┘         │1K×4  ├─┘  ← 每组下片接 D3~D0
          └──┬─┬─┘           └──┬─┬─┘           └──┬─┬─┘           └──┬─┬─┘
             │ │                │ │                │ │                │ │
A9~A0 (10) ──┴─┼────────────────┴─┼────────────────┴─┼────────────────┴─┘     ← A9~A0 并联接所有8片
               │CS0               │CS1               │CS2               │CS3
            ┌──┴──────────────────┴──────────────────┴──────────────────┴──┐
  A10 ─────►│                         2:4 译码器                           │
  A11 ─────►│                (每组2片共用同一片选信号 CS0~CS3)              │
            └──────────────────────────────────────────────────────────────┘`,
    sramRubric: [
      '数据线必须分高低 4 位：每片 2114 只有 4 位数据线，务必分别标清 D7~D4（4 根）和 D3~D0（4 根）（或在斜杠上标注数字 4），不可直接把 8 根线全接到单片上。',
      '地址线标清位数：A9~A0 标明 10 根并联进每组芯片；A10、A11 接 2:4 译码器输入端。',
      '片选与读写线清晰：每组（上下 2 片）共用一根片选线（CS0～CS3）；R/W 线画在两组芯片中间统一引出连接全部芯片。',
      '务必写文字计算过程：芯片个数、地址线根数、译码器选型理由都按步骤写清楚，就算图有小瑕疵也能拿步骤分。',
    ],
    answerSummary: '共需 8 片（4 组 × 每组 2 片）；A0~A9（10 根）并联所有芯片，A10、A11 接 2:4 译码器输出 CS0~CS3，每组上片接 D7~D4、下片接 D3~D0，R/W̅ 并联所有 8 片。',
    explanationLines: [
      '1. 计算所需芯片数：(4K × 8 位) ÷ (1K × 4 位) = 4 × 2 = 8 片。位扩展每组 2 片（D3~D0 与 D7~D4）；字扩展共 4 组。',
      '2. 地址线分配与译码器：单芯片 1K = 2¹⁰ 需 10 根片内地址线（A0 ~ A9）并联全部 8 片；总容量 4K = 2¹² 需 12 根地址线（A0 ~ A11）；高位 2 根（A10、A11）接 2:4 译码器，输出 CS0̅ ~ CS3̅ 分别接第 1~4 组（每组 2 片共用）。',
      '3. 控制线连接：读/写控制信号线 R/W̅ 并联接到全部 8 片芯片的写允许/读写控制端。',
    ],
  },
];
