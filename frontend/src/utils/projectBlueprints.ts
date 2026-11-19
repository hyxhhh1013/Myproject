// Bespoke 16:10 (960x600) Swiss Editorial System Blueprint SVG Data-URIs
// Replaces generic picsum.photos stock placeholders with authentic 16:10 architecture & UI previews

function svgToDataUri(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const HESHU_BLUEPRINT_SVG = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" width="960" height="600">
  <rect width="960" height="600" fill="#141413"/>
  <g stroke="rgba(255,255,255,0.06)" stroke-width="1">
    <line x1="0" y1="80" x2="960" y2="80"/>
    <line x1="0" y1="520" x2="960" y2="520"/>
    <line x1="80" y1="0" x2="80" y2="600"/>
    <line x1="880" y1="0" x2="880" y2="600"/>
  </g>
  <text x="105" y="54" fill="#C8A97E" font-family="monospace" font-size="14" letter-spacing="2">FLAGSHIP // 01 · HESHU AI4SCIENCE ARCHITECTURE</text>
  <text x="855" y="54" fill="#8E8C84" font-family="monospace" font-size="13" text-anchor="end">46 TOOLS · 11 SSE CHANNELS · 2,749 PAPERS</text>

  <!-- 4 Stage Recoverable LangGraph Nodes -->
  <g transform="translate(105, 120)">
    <rect x="0" y="0" width="165" height="115" rx="12" fill="#1D1D1A" stroke="#8A6F48" stroke-width="1.5"/>
    <text x="18" y="30" fill="#C8A97E" font-family="monospace" font-size="12">01 // PLAN</text>
    <text x="18" y="58" fill="#F2F0EA" font-family="sans-serif" font-size="16" font-weight="bold">选题与大纲蓝图</text>
    <text x="18" y="84" fill="#A09E96" font-family="monospace" font-size="11">Topic &amp; Blueprint</text>

    <line x1="165" y1="57" x2="195" y2="57" stroke="#C8A97E" stroke-width="1.5"/>

    <rect x="195" y="0" width="165" height="115" rx="12" fill="#24211B" stroke="#C8A97E" stroke-width="2"/>
    <text x="213" y="30" fill="#C8A97E" font-family="monospace" font-size="12">02 // HUMAN GATE</text>
    <text x="213" y="58" fill="#F2F0EA" font-family="sans-serif" font-size="16" font-weight="bold">人工批准检查点</text>
    <text x="213" y="84" fill="#C8A97E" font-family="monospace" font-size="11">Resumable State</text>

    <line x1="360" y1="57" x2="390" y2="57" stroke="#C8A97E" stroke-width="1.5"/>

    <rect x="390" y="0" width="165" height="115" rx="12" fill="#1D1D1A" stroke="#8A6F48" stroke-width="1.5"/>
    <text x="408" y="30" fill="#C8A97E" font-family="monospace" font-size="12">03 // 46 TOOLS</text>
    <text x="408" y="58" fill="#F2F0EA" font-family="sans-serif" font-size="16" font-weight="bold">混合 RAG 检索</text>
    <text x="408" y="84" fill="#A09E96" font-family="monospace" font-size="11">176,230 Chunks</text>

    <line x1="555" y1="57" x2="585" y2="57" stroke="#C8A97E" stroke-width="1.5"/>

    <rect x="585" y="0" width="165" height="115" rx="12" fill="#1D1D1A" stroke="#8A6F48" stroke-width="1.5"/>
    <text x="603" y="30" fill="#C8A97E" font-family="monospace" font-size="12">04 // 4D REVIEW</text>
    <text x="603" y="58" fill="#F2F0EA" font-family="sans-serif" font-size="16" font-weight="bold">四维审查与导出</text>
    <text x="603" y="84" fill="#A09E96" font-family="monospace" font-size="11">SCI/Nature/IEEE PDF</text>
  </g>

  <!-- Bottom Telemetry Panel -->
  <g transform="translate(105, 270)">
    <rect x="0" y="0" width="750" height="210" rx="14" fill="#1A1A17" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <text x="28" y="38" fill="#C8A97E" font-family="monospace" font-size="13">HYBRID RAG &amp; CITATION HARD-GATE PIPELINE // BM25 + PGVECTOR + RRF FUSION</text>
    <rect x="28" y="60" width="215" height="120" rx="10" fill="#141413" stroke="rgba(200,169,126,0.3)"/>
    <text x="46" y="95" fill="#F2F0EA" font-family="monospace" font-size="26" font-weight="bold">~3 Days</text>
    <text x="46" y="125" fill="#A09E96" font-family="sans-serif" font-size="13">论文初稿周期 (原1个月)</text>
    <text x="46" y="152" fill="#C8A97E" font-family="monospace" font-size="11">10+ Drafts Delivered</text>

    <rect x="267" y="60" width="215" height="120" rx="10" fill="#141413" stroke="rgba(200,169,126,0.3)"/>
    <text x="285" y="95" fill="#F2F0EA" font-family="monospace" font-size="26" font-weight="bold">176,230</text>
    <text x="285" y="125" fill="#A09E96" font-family="sans-serif" font-size="13">农学文献检索知识块</text>
    <text x="285" y="152" fill="#C8A97E" font-family="monospace" font-size="11">2,749 PDFs · 9 Disciplines</text>

    <rect x="506" y="60" width="215" height="120" rx="10" fill="#141413" stroke="rgba(200,169,126,0.3)"/>
    <text x="524" y="95" fill="#F2F0EA" font-family="monospace" font-size="26" font-weight="bold">2000+</text>
    <text x="524" y="125" fill="#A09E96" font-family="sans-serif" font-size="13">自动化测试 &amp; 124 API</text>
    <text x="524" y="152" fill="#C8A97E" font-family="monospace" font-size="11">18 Tables · Zero Hallucination</text>
  </g>
</svg>
`);

export const DREAMTOP_BLUEPRINT_SVG = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" width="960" height="600">
  <rect width="960" height="600" fill="#131312"/>
  <g stroke="rgba(255,255,255,0.06)" stroke-width="1">
    <line x1="0" y1="76" x2="960" y2="76"/>
    <line x1="0" y1="524" x2="960" y2="524"/>
    <line x1="76" y1="0" x2="76" y2="600"/>
    <line x1="884" y1="0" x2="884" y2="600"/>
  </g>
  <text x="96" y="50" fill="#C8A97E" font-family="monospace" font-size="14" letter-spacing="2">PLATE // 02 · DREAMTOP SUBCONSCIOUS TOPOLOGY</text>
  <text x="864" y="50" fill="#8E8C84" font-family="monospace" font-size="13" text-anchor="end">60FPS FORCE GRAPH · GLM-4 NLP · TRAE 3RD PRIZE</text>

  <!-- Force-Directed Graph Network -->
  <g stroke="#8A6F48" stroke-opacity="0.55" stroke-width="1.8">
    <line x1="310" y1="295" x2="185" y2="185"/>
    <line x1="310" y1="295" x2="450" y2="175"/>
    <line x1="310" y1="295" x2="465" y2="395"/>
    <line x1="310" y1="295" x2="175" y2="410"/>
    <line x1="450" y1="175" x2="620" y2="230"/>
    <line x1="465" y1="395" x2="620" y2="230"/>
    <line x1="465" y1="395" x2="640" y2="415"/>
    <line x1="185" y1="185" x2="450" y2="175" stroke-dasharray="4 4"/>
  </g>

  <!-- Central Node -->
  <circle cx="310" cy="295" r="46" fill="#221E18" stroke="#C8A97E" stroke-width="2.5"/>
  <text x="310" y="292" fill="#F2F0EA" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">潜意识核心</text>
  <text x="310" y="311" fill="#C8A97E" font-family="monospace" font-size="11" text-anchor="middle">REM 82 BPM</text>

  <!-- Satellite Symbol Nodes -->
  <circle cx="185" cy="185" r="32" fill="#1B1B18" stroke="#8A6F48" stroke-width="1.8"/>
  <text x="185" y="189" fill="#F2F0EA" font-family="sans-serif" font-size="13" text-anchor="middle">深海 · 坠落</text>

  <circle cx="450" cy="175" r="34" fill="#1B1B18" stroke="#C8A97E" stroke-width="1.8"/>
  <text x="450" y="179" fill="#F2F0EA" font-family="sans-serif" font-size="13" text-anchor="middle">迷宫 · 镜像</text>

  <circle cx="465" cy="395" r="32" fill="#1B1B18" stroke="#8A6F48" stroke-width="1.8"/>
  <text x="465" y="399" fill="#F2F0EA" font-family="sans-serif" font-size="13" text-anchor="middle">星空 · 飞翔</text>

  <circle cx="175" cy="410" r="28" fill="#1B1B18" stroke="#8A6F48" stroke-width="1.8"/>
  <text x="175" y="414" fill="#A09E96" font-family="sans-serif" font-size="12" text-anchor="middle">旧钟楼</text>

  <circle cx="620" cy="230" r="30" fill="#1B1B18" stroke="#C8A97E" stroke-width="1.8"/>
  <text x="620" y="234" fill="#F2F0EA" font-family="sans-serif" font-size="12" text-anchor="middle">阿尼玛原型</text>

  <circle cx="640" cy="415" r="27" fill="#1B1B18" stroke="#8A6F48" stroke-width="1.8"/>
  <text x="640" y="419" fill="#A09E96" font-family="sans-serif" font-size="12" text-anchor="middle">列车远行</text>

  <!-- Right Telemetry Dossier Card -->
  <g transform="translate(690, 130)">
    <rect x="0" y="0" width="175" height="340" rx="12" fill="#1B1B18" stroke="rgba(255,255,255,0.12)"/>
    <text x="18" y="34" fill="#C8A97E" font-family="monospace" font-size="11">GLM-4 EXTRACTION</text>
    <text x="18" y="64" fill="#F2F0EA" font-family="monospace" font-size="22" font-weight="bold">60 FPS</text>
    <text x="18" y="86" fill="#A09E96" font-family="sans-serif" font-size="12">力导向拓扑画布渲染</text>

    <line x1="18" y1="112" x2="157" y2="112" stroke="rgba(255,255,255,0.08)"/>
    <text x="18" y="140" fill="#C8A97E" font-family="monospace" font-size="11">SCHEMA // 5 TABLES</text>
    <text x="18" y="166" fill="#E5E2DC" font-family="monospace" font-size="11">• dream_records</text>
    <text x="18" y="188" fill="#E5E2DC" font-family="monospace" font-size="11">• dream_symbols</text>
    <text x="18" y="210" fill="#E5E2DC" font-family="monospace" font-size="11">• topology_edges</text>
    <text x="18" y="232" fill="#E5E2DC" font-family="monospace" font-size="11">• physio_metrics</text>

    <rect x="18" y="268" width="139" height="46" rx="8" fill="#25211A" stroke="#8A6F48"/>
    <text x="87" y="295" fill="#C8A97E" font-family="monospace" font-size="11" text-anchor="middle">4 WEEKS 0→1 LIVE</text>
  </g>
</svg>
`);

export const OUTBOUNDS_BLUEPRINT_SVG = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" width="960" height="600">
  <rect width="960" height="600" fill="#141413"/>
  <g stroke="rgba(255,255,255,0.06)" stroke-width="1">
    <line x1="0" y1="76" x2="960" y2="76"/>
    <line x1="0" y1="524" x2="960" y2="524"/>
    <line x1="76" y1="0" x2="76" y2="600"/>
    <line x1="884" y1="0" x2="884" y2="600"/>
  </g>
  <text x="96" y="50" fill="#C8A97E" font-family="monospace" font-size="14" letter-spacing="2">PLATE // 03 · OUTBOUNDS MULTI-UNIVERSE HUB</text>
  <text x="864" y="50" fill="#8E8C84" font-family="monospace" font-size="13" text-anchor="end">NEXT.JS 16 · REACT 19 · TRAE CSU 2ND PRIZE</text>

  <!-- 3 Parallel Universe Columns -->
  <g transform="translate(96, 118)">
    <!-- Universe 01: HACKER -->
    <rect x="0" y="0" width="236" height="364" rx="14" fill="#1A1B18" stroke="#8A6F48" stroke-width="1.5"/>
    <text x="22" y="36" fill="#C8A97E" font-family="monospace" font-size="12">UNIVERSE 01 // HACKER</text>
    <text x="22" y="66" fill="#F2F0EA" font-family="sans-serif" font-size="18" font-weight="bold">极客代码宇宙</text>
    <rect x="22" y="92" width="192" height="84" rx="8" fill="#121311" stroke="rgba(255,255,255,0.08)"/>
    <text x="36" y="120" fill="#8E8C84" font-family="monospace" font-size="11">&gt; git push origin main</text>
    <text x="36" y="142" fill="#C8A97E" font-family="monospace" font-size="11">&gt; AI Companion: Online</text>
    <text x="36" y="162" fill="#A09E96" font-family="monospace" font-size="10">0-Flicker Context Sync</text>
    <rect x="22" y="196" width="192" height="142" rx="8" fill="#151513" stroke="rgba(200,169,126,0.2)"/>
    <text x="36" y="226" fill="#F2F0EA" font-family="sans-serif" font-size="13" font-weight="bold">卡片手势交互流</text>
    <text x="36" y="252" fill="#A09E96" font-family="sans-serif" font-size="12">Framer Motion 物理弹簧</text>
    <text x="36" y="276" fill="#A09E96" font-family="sans-serif" font-size="12">跨宇宙状态无缝持久化</text>
    <text x="36" y="314" fill="#C8A97E" font-family="monospace" font-size="11">ZOD + VITEST VERIFIED</text>

    <!-- Universe 02: ART -->
    <rect x="266" y="0" width="236" height="364" rx="14" fill="#1F1C18" stroke="#C8A97E" stroke-width="2"/>
    <text x="288" y="36" fill="#C8A97E" font-family="monospace" font-size="12">UNIVERSE 02 // ART</text>
    <text x="288" y="66" fill="#F2F0EA" font-family="sans-serif" font-size="18" font-weight="bold">先锋视觉画廊</text>
    <rect x="288" y="92" width="192" height="120" rx="8" fill="#151310" stroke="rgba(200,169,126,0.35)"/>
    <circle cx="345" cy="152" r="28" fill="none" stroke="#C8A97E" stroke-width="1.5"/>
    <circle cx="385" cy="152" r="28" fill="none" stroke="#8A6F48" stroke-width="1.5"/>
    <circle cx="425" cy="152" r="28" fill="none" stroke="#F2F0EA" stroke-opacity="0.4" stroke-width="1.5"/>
    <rect x="288" y="230" width="192" height="108" rx="8" fill="#151310" stroke="rgba(255,255,255,0.08)"/>
    <text x="304" y="262" fill="#F2F0EA" font-family="sans-serif" font-size="13" font-weight="bold">URL 参数 + Context 同步</text>
    <text x="304" y="288" fill="#A09E96" font-family="sans-serif" font-size="12">三套视觉 Token 瞬时切换</text>
    <text x="304" y="316" fill="#C8A97E" font-family="monospace" font-size="11">TAILWIND CSS V4 ENGINE</text>

    <!-- Universe 03: ACG -->
    <rect x="532" y="0" width="236" height="364" rx="14" fill="#1A1A19" stroke="#8A6F48" stroke-width="1.5"/>
    <text x="554" y="36" fill="#C8A97E" font-family="monospace" font-size="12">UNIVERSE 03 // ACG</text>
    <text x="554" y="66" fill="#F2F0EA" font-family="sans-serif" font-size="18" font-weight="bold">次元即时通讯</text>
    <rect x="554" y="92" width="192" height="84" rx="8" fill="#121211" stroke="rgba(255,255,255,0.08)"/>
    <text x="570" y="122" fill="#F2F0EA" font-family="sans-serif" font-size="12">✦ 跨宇宙 AI 伴侣常驻</text>
    <text x="570" y="148" fill="#C8A97E" font-family="monospace" font-size="11">Real-Time Chat Stream</text>
    <rect x="554" y="196" width="192" height="142" rx="8" fill="#141412" stroke="rgba(200,169,126,0.2)"/>
    <text x="570" y="226" fill="#F2F0EA" font-family="sans-serif" font-size="13" font-weight="bold">字节跳动 Trae 校园赛</text>
    <text x="570" y="254" fill="#C8A97E" font-family="sans-serif" font-size="15" font-weight="bold">中南大学场次 · 二等奖</text>
    <text x="570" y="284" fill="#A09E96" font-family="monospace" font-size="11">Next.js 16 App Router</text>
    <text x="570" y="314" fill="#A09E96" font-family="monospace" font-size="11">Prisma + SQLite Edge</text>
  </g>
</svg>
`);

export const FANDINGLE_BLUEPRINT_SVG = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" width="960" height="600">
  <rect width="960" height="600" fill="#141413"/>
  <g stroke="rgba(255,255,255,0.06)" stroke-width="1">
    <line x1="0" y1="76" x2="960" y2="76"/>
    <line x1="0" y1="524" x2="960" y2="524"/>
    <line x1="76" y1="0" x2="76" y2="600"/>
    <line x1="884" y1="0" x2="884" y2="600"/>
  </g>
  <text x="96" y="50" fill="#C8A97E" font-family="monospace" font-size="14" letter-spacing="2">PLATE // 04 · FANDINGLE GROUP DINING CONVERGENCE</text>
  <text x="864" y="50" fill="#8E8C84" font-family="monospace" font-size="13" text-anchor="end">LEV0 HACKATHON · BEST CREATIVITY AWARD</text>

  <!-- 3-Stage Decision Pipeline -->
  <g transform="translate(96, 125)">
    <!-- Step 1: Room & Taste -->
    <rect x="0" y="0" width="230" height="350" rx="14" fill="#1B1B18" stroke="#8A6F48" stroke-width="1.5"/>
    <text x="22" y="36" fill="#C8A97E" font-family="monospace" font-size="12">01 // ROOM &amp; PROFILES</text>
    <text x="22" y="66" fill="#F2F0EA" font-family="sans-serif" font-size="18" font-weight="bold">室友建房填口味</text>
    <rect x="22" y="94" width="186" height="62" rx="8" fill="#131311" stroke="rgba(255,255,255,0.08)"/>
    <text x="36" y="122" fill="#F2F0EA" font-family="sans-serif" font-size="13">室友 A · 湘菜微辣 / 预算 ¥35</text>
    <text x="36" y="142" fill="#C8A97E" font-family="monospace" font-size="11">VETO: 忌香菜</text>
    <rect x="22" y="170" width="186" height="62" rx="8" fill="#131311" stroke="rgba(255,255,255,0.08)"/>
    <text x="36" y="198" fill="#F2F0EA" font-family="sans-serif" font-size="13">室友 B · 粉面烤肉 / 预算 ¥40</text>
    <text x="36" y="218" fill="#C8A97E" font-family="monospace" font-size="11">VETO: 忌海鲜</text>
    <rect x="22" y="246" width="186" height="80" rx="8" fill="#221F1A" stroke="#8A6F48"/>
    <text x="36" y="278" fill="#F2F0EA" font-family="monospace" font-size="20" font-weight="bold">50+ 门店池</text>
    <text x="36" y="304" fill="#A09E96" font-family="sans-serif" font-size="12">湖南农大周边一线实测</text>

    <!-- Arrow -->
    <line x1="230" y1="175" x2="268" y2="175" stroke="#C8A97E" stroke-width="2"/>

    <!-- Step 2: Convergence Engine -->
    <rect x="268" y="0" width="230" height="350" rx="14" fill="#211E18" stroke="#C8A97E" stroke-width="2"/>
    <text x="290" y="36" fill="#C8A97E" font-family="monospace" font-size="12">02 // CONVERGENCE</text>
    <text x="290" y="66" fill="#F2F0EA" font-family="sans-serif" font-size="18" font-weight="bold">忌口一票否决算法</text>
    <rect x="290" y="96" width="186" height="105" rx="8" fill="#141310" stroke="rgba(200,169,126,0.3)"/>
    <text x="306" y="128" fill="#C8A97E" font-family="monospace" font-size="12">HARD CONSTRAINT FILTER</text>
    <text x="306" y="154" fill="#F2F0EA" font-family="sans-serif" font-size="13">1. 负向忌口硬过滤剔除</text>
    <text x="306" y="180" fill="#F2F0EA" font-family="sans-serif" font-size="13">2. 多维口味向量加权排序</text>
    <rect x="290" y="220" width="186" height="106" rx="8" fill="#141310" stroke="rgba(255,255,255,0.08)"/>
    <text x="383" y="268" fill="#C8A97E" font-family="monospace" font-size="30" font-weight="bold" text-anchor="middle">30 Sec</text>
    <text x="383" y="298" fill="#A09E96" font-family="sans-serif" font-size="13" text-anchor="middle">快速收敛定店 · 零纠结</text>

    <!-- Arrow -->
    <line x1="498" y1="175" x2="536" y2="175" stroke="#C8A97E" stroke-width="2"/>

    <!-- Step 3: Final Match -->
    <rect x="536" y="0" width="232" height="350" rx="14" fill="#1B1B18" stroke="#8A6F48" stroke-width="1.5"/>
    <text x="558" y="36" fill="#C8A97E" font-family="monospace" font-size="12">03 // TOP 1 MATCHED</text>
    <text x="558" y="66" fill="#F2F0EA" font-family="sans-serif" font-size="18" font-weight="bold">协同翻牌定店</text>
    <rect x="558" y="96" width="188" height="135" rx="10" fill="#141412" stroke="#C8A97E" stroke-width="1.5"/>
    <text x="576" y="128" fill="#C8A97E" font-family="monospace" font-size="11">98% GROUP MATCH</text>
    <text x="576" y="158" fill="#F2F0EA" font-family="sans-serif" font-size="16" font-weight="bold">笨萝卜浏阳菜馆</text>
    <text x="576" y="186" fill="#A09E96" font-family="sans-serif" font-size="12">醋蒸鸡 · 酸菜炒粉皮</text>
    <text x="576" y="212" fill="#C8A97E" font-family="monospace" font-size="11">人均 ¥36 · 农大东门</text>
    <rect x="558" y="250" width="188" height="76" rx="8" fill="#221E18"/>
    <text x="652" y="284" fill="#F2F0EA" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">LEV0 黑客松最佳创意奖</text>
    <text x="652" y="308" fill="#C8A97E" font-family="monospace" font-size="11" text-anchor="middle">eat.hyxhhh.site</text>
  </g>
</svg>
`);

export const ONION_FDE_BLUEPRINT_SVG = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" width="960" height="600">
  <rect width="960" height="600" fill="#141413"/>
  <g stroke="rgba(255,255,255,0.06)" stroke-width="1">
    <line x1="0" y1="74" x2="960" y2="74"/>
    <line x1="0" y1="526" x2="960" y2="526"/>
    <line x1="74" y1="0" x2="74" y2="600"/>
    <line x1="886" y1="0" x2="886" y2="600"/>
  </g>
  <text x="96" y="48" fill="#C8A97E" font-family="monospace" font-size="14" letter-spacing="2">RESIDENCY // 01 · ONION EDUCATION FDE ARCHITECTURE</text>
  <text x="864" y="48" fill="#8E8C84" font-family="monospace" font-size="13" text-anchor="end">15 WEEKS ON-SITE · 8 TEAMS · 45 DOCS</text>

  <g transform="translate(96, 110)">
    <rect x="0" y="0" width="365" height="175" rx="12" fill="#1C1B18" stroke="#C8A97E" stroke-width="1.8"/>
    <text x="24" y="36" fill="#C8A97E" font-family="monospace" font-size="12">01 // OPERATIONS AGENT (35 READ-ONLY TOOLS)</text>
    <text x="24" y="70" fill="#F2F0EA" font-family="sans-serif" font-size="20" font-weight="bold">到账 / 退费 / 课消 / 转化同口径直问</text>
    <text x="24" y="104" fill="#A09E96" font-family="sans-serif" font-size="14">异常仅生成派任务草稿 → 人工确认后才写入数据库</text>
    <rect x="24" y="124" width="245" height="32" rx="6" fill="#28231B" stroke="#8A6F48"/>
    <text x="38" y="145" fill="#C8A97E" font-family="monospace" font-size="12">HUMAN-IN-THE-LOOP WRITE GATE</text>

    <rect x="395" y="0" width="373" height="175" rx="12" fill="#1C1B18" stroke="#8A6F48" stroke-width="1.5"/>
    <text x="419" y="36" fill="#C8A97E" font-family="monospace" font-size="12">02 // DUAL-LINE MIDDLE PLATFORM (100+ ROUTES)</text>
    <text x="419" y="70" fill="#F2F0EA" font-family="sans-serif" font-size="20" font-weight="bold">家教 &amp; 雅思双线全链路 (表前缀隔离)</text>
    <text x="419" y="104" fill="#A09E96" font-family="sans-serif" font-size="14">消课三级审批 + 课酬按日指派 + 电子合同签审硬闸</text>
    <rect x="419" y="124" width="245" height="32" rx="6" fill="#141413" stroke="rgba(255,255,255,0.12)"/>
    <text x="433" y="145" fill="#A09E96" font-family="monospace" font-size="12">FASTAPI + POSTGRESQL HARD GATES</text>

    <rect x="0" y="205" width="768" height="175" rx="12" fill="#1A1A17" stroke="rgba(200,169,126,0.35)" stroke-width="1.5"/>
    <text x="24" y="242" fill="#C8A97E" font-family="monospace" font-size="12">03 // OCEAN ENGINE 19 OFFICIAL APIS · 4-TIER AD ATTRIBUTION PIPELINE</text>
    <text x="24" y="276" fill="#F2F0EA" font-family="sans-serif" font-size="19" font-weight="bold">账户 (Account) → 计划 (Campaign) → 广告 (Ad) → 素材 (Creative) 按日拉回消耗与线索成本</text>
    <text x="24" y="312" fill="#A09E96" font-family="sans-serif" font-size="14">统一转化率分母、课时 0.1 精度、同单号收款去重；改预算须人工点确认，单次硬限不超过 ±20%</text>
    <text x="24" y="352" fill="#C8A97E" font-family="monospace" font-size="13">REACT + VITE + TYPESCRIPT + FASTAPI + LANGGRAPH + POSTGRESQL</text>
  </g>
</svg>
`);
