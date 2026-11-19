import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { BookOpen, ChevronLeft, ChevronRight, RotateCcw, Hand } from 'lucide-react';
import { useI18n } from '../../i18n/i18nContext';

// ============================================================================
// WebAudio Procedural Crisp Cotton-Paper Page-Turn Sound
// ============================================================================
function playPageTurnSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const duration = 0.28;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const env = Math.sin(t * Math.PI) ** 1.25;
      data[i] = (Math.random() * 2 - 1) * env * 0.24;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + duration);
    filter.Q.value = 1.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {
    // Ignore audio restriction
  }
}

// ============================================================================
// Curated Books Data
// ============================================================================
interface BookData {
  id: string;
  code: string;
  isbn: string;
  titleZh: string;
  titleEn: string;
  author: string;
  year: string;
  categoryZh: string;
  categoryEn: string;
  coverBg: string;
  spineColor: string;
  foilColor: string;
  ribbonColor: string;
  rating: string;
  quoteZh: string;
  marginaliaZh: string;
  takeawaysZh: { title: string; body: string }[];
  impactZh: string;
}

const CURATED_BOOKS: BookData[] = [
  {
    id: 'thinking-fast-slow',
    code: 'VOL. 01',
    isbn: 'ISBN 978-0-374-53355-7',
    titleZh: '思考，快与慢',
    titleEn: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    year: '2011',
    categoryZh: '认知心理学 · 决策模型',
    categoryEn: 'Cognitive Psychology',
    coverBg: '#1D2C24',
    spineColor: '#121D18',
    foilColor: '#DFBF84',
    ribbonColor: '#8B3A2F',
    rating: '★★★★★',
    quoteZh:
      '系统 1 的直觉反应与系统 2 的慢思考推理，恰似大模型直觉式 Token 生成与 Agent 慢思考推理链（Reasoning Loop）的镜像。',
    marginaliaZh:
      '读完这本书后，我对大模型幻觉（Hallucination）有了全新的直觉：单次补全本质上是“系统 1”在高速联想，而引入工具调用、检索溯源（Hybrid RAG）与多步反思状态图，正是在工程上为 AI 补齐“系统 2”的慢思考能力。',
    takeawaysZh: [
      {
        title: '锚定效应与上下文窗口',
        body: '人脑极易被最初看到的数字或信息锚定；同样，Prompt 开头与检索召回的 Top-3 证据块会强烈锚定模型的后续推演方向。',
      },
      {
        title: '可得性启发与检索偏差',
        body: '人们误把“容易想起的”当成“最常见的”。做科研 RAG 时必须引入 BM25 + 向量双路召回与重排，打破单一语义偏差。',
      },
      {
        title: '事前验尸（Pre-mortem）机制',
        body: '在项目上线前先假设系统已经失败，倒推所有薄弱环节——这套方法让我提前在洋葱教育 FDE 交付中设计了写库硬闸。',
      },
    ],
    impactZh:
      '这本书直接塑造了我在「禾书耕文」中设计 LangGraph 分章节验证与引文溯源状态机的底层思路——永远不要盲信直觉，给关键结论加上可观测的核验步骤。',
  },
  {
    id: 'atomic-habits',
    code: 'VOL. 02',
    isbn: 'ISBN 978-0-7352-1129-2',
    titleZh: '原子习惯',
    titleEn: 'Atomic Habits',
    author: 'James Clear',
    year: '2018',
    categoryZh: '行为科学 · 复利系统',
    categoryEn: 'Behavioral Systems',
    coverBg: '#32251D',
    spineColor: '#1E1610',
    foilColor: '#E5B87B',
    ribbonColor: '#8C3B2B',
    rating: '★★★★★',
    quoteZh: '你不会升到你目标的高度，你会落到你系统（Systems）的高度。',
    marginaliaZh:
      '做独立开发和长期科研项目时，单靠一时兴起的热情很难走远。把大工程拆成每天可验证的小提交（Micro-commits）、自动化脚本和清晰的工作流，才是持续产出的真正护城河。',
    takeawaysZh: [
      {
        title: '1% 的每日复利曲线',
        body: '每天优化 1%，一年后是 37 倍的跃迁。前端体验的打磨也是如此：微交互、阴影层次、音效反馈叠加起来就是质变。',
      },
      {
        title: '降低好行为的启动摩擦',
        body: '把开发环境、快捷指令（⌘K）和自动化部署做成一键触发，阻力越低，创意落地越快。',
      },
      {
        title: '身份认同驱动行为',
        body: '不要说“我想写一个好项目”，而是以“造物者与工匠”的身份标准去审视每一行代码与每一个像素。',
      },
    ],
    impactZh:
      '从日均 2 亿 Token 的工程迭代速度，到这套个人门户不断打磨的细节，本质上都是在用“系统”而非“意志力”推动每一次版本进化。',
  },
  {
    id: 'design-of-everyday-things',
    code: 'VOL. 03',
    isbn: 'ISBN 978-0-465-05065-9',
    titleZh: '设计心理学',
    titleEn: 'The Design of Everyday Things',
    author: 'Don Norman',
    year: '1988',
    categoryZh: '人机交互 · 工业设计',
    categoryEn: 'HCI & Industrial Design',
    coverBg: '#1F2835',
    spineColor: '#131922',
    foilColor: '#DBBE90',
    ribbonColor: '#984638',
    rating: '★★★★★',
    quoteZh: '好的设计应当具备清晰的可感知性（Affordance）与意符，无需说明书即可自然交互。',
    marginaliaZh:
      '每次写完一个新组件（比如这本可以弯曲翻页的 3D 精装书，或者黑胶唱机），我都会问自己：访客第一次看到它，不看文字提示就知道可以点哪里、会有什么反馈吗？',
    takeawaysZh: [
      {
        title: '可感知性（Affordance）与意符',
        body: '微微翘起的柔性纸角暗示“可拖拽翻页”，唱片上的唱针暗示“点击播放”，好界面用物理隐喻说话。',
      },
      {
        title: '即时多感官反馈',
        body: '按钮按下时的清脆机械声、翻页时的纸张沙沙声、快门按下的咔嚓声，让数字界面拥有真实触感。',
      },
      {
        title: '防错约束（Constraints）',
        body: '与其指责用户点错，不如通过视觉层级和硬闸确认（如 Agent 写库确认卡片）让误操作不可能发生。',
      },
    ],
    impactZh:
      '它是我做前端视觉和交互设计时的案头圣经——技术负责让系统跑通，而设计心理学负责让系统“好用且让人会心一笑”。',
  },
  {
    id: 'sapiens',
    code: 'VOL. 04',
    isbn: 'ISBN 978-0-06-231609-7',
    titleZh: '人类简史',
    titleEn: 'Sapiens',
    author: 'Yuval Noah Harari',
    year: '2014',
    categoryZh: '历史人类学 · 宏大叙事',
    categoryEn: 'History & Anthropology',
    coverBg: '#38211E',
    spineColor: '#221311',
    foilColor: '#E8C28E',
    ribbonColor: '#B88D52',
    rating: '★★★★☆',
    quoteZh: '语言与共同想象构建了人类协作网络；而在 AI 时代，自然语言正在直接构建软件系统。',
    marginaliaZh:
      '从认知革命到农业革命再到人工智能时代，人类每一次跨越边界都源于“新叙事工具”的诞生。今天我们用自然语言编排多智能体协作，某种意义上也是在续写这场认知革命。',
    takeawaysZh: [
      {
        title: '跨学科的广角视野',
        body: '把生物学、经济学、历史与计算机放在同一张画布上观察，往往能在学科交叉处发现最有趣的课题（如 AI4Science）。',
      },
      {
        title: '虚构故事与产品叙事',
        body: '一个优秀的产品不只是功能的堆砌，更是一个让用户愿意走进其中的“世界观”。',
      },
      {
        title: '保持对未知的谦卑',
        body: '科学革命的起点不是“我们全都知道”，而是勇敢承认“我们不知道”，然后用实验去验证。',
      },
    ],
    impactZh:
      '提醒我在埋头写代码之余，始终抬头看历史、人文与真实世界——也是我热爱摄影、记录城市烟火气的精神底色。',
  },
];

// ============================================================================
// Procedural Textures: Woven Linen Cloth, Stacked Paper Edges, Crisp 1024px Pages
// ============================================================================
function createLinenClothTexture(baseHex: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  // Fine woven linen threads
  for (let i = 0; i < 256; i += 3) {
    ctx.fillStyle = i % 6 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(i, 0, 1, 256);
    ctx.fillRect(0, i, 256, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPaperEdgeStriationTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#EFE9D8';
  ctx.fillRect(0, 0, 128, 256);

  // Hundreds of fine stacked paper sheet edge lines
  for (let y = 0; y < 256; y += 3) {
    const shade = y % 6 === 0 ? '#D5CBB3' : '#E5DEC9';
    ctx.fillStyle = shade;
    ctx.fillRect(0, y, 128, 1.2);
  }
  // Soft top-to-bottom ambient darkening near hardcover boards
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(30,22,12,0.16)');
  grad.addColorStop(0.12, 'rgba(30,22,12,0)');
  grad.addColorStop(0.88, 'rgba(30,22,12,0)');
  grad.addColorStop(1, 'rgba(30,22,12,0.22)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 256);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  let line = '';
  let currY = y;
  for (let i = 0; i < text.length; i++) {
    const testLine = line + text[i];
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currY);
      line = text[i];
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currY);
    currY += lineHeight;
  }
  return currY;
}

function drawCottonPaperBase(ctx: CanvasRenderingContext2D, w: number, h: number, isLeftPage: boolean) {
  ctx.fillStyle = isLeftPage ? '#FBF7EE' : '#FDF9F0';
  ctx.fillRect(0, 0, w, h);

  // Subtle cotton paper fiber speckles
  for (let i = 0; i < 4800; i++) {
    const gx = Math.random() * w;
    const gy = Math.random() * h;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(135, 115, 82, 0.04)' : 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // Deep organic spine gutter ambient occlusion
  const gutterGrad = isLeftPage
    ? ctx.createLinearGradient(w, 0, w - 140, 0)
    : ctx.createLinearGradient(0, 0, 140, 0);
  gutterGrad.addColorStop(0, 'rgba(35, 25, 14, 0.28)');
  gutterGrad.addColorStop(0.25, 'rgba(35, 25, 14, 0.08)');
  gutterGrad.addColorStop(1, 'rgba(35, 25, 14, 0)');
  ctx.fillStyle = gutterGrad;
  ctx.fillRect(0, 0, w, h);
}

function createHardcoverFrontTexture(book: BookData): THREE.CanvasTexture {
  const w = 1024;
  const h = 1360;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, book.coverBg);
  grad.addColorStop(1, book.spineColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Fine woven linen threads
  ctx.strokeStyle = 'rgba(255,255,255,0.032)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Bookbinding spine hinge indentation
  const hingeGrad = ctx.createLinearGradient(0, 0, 84, 0);
  hingeGrad.addColorStop(0, 'rgba(0,0,0,0.48)');
  hingeGrad.addColorStop(0.55, 'rgba(255,255,255,0.09)');
  hingeGrad.addColorStop(0.76, 'rgba(0,0,0,0.52)');
  hingeGrad.addColorStop(0.88, 'rgba(255,255,255,0.14)');
  hingeGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = hingeGrad;
  ctx.fillRect(0, 0, 84, h);

  // Debossed Gold-Foil Double Frame
  ctx.strokeStyle = book.foilColor;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 3.5;
  ctx.strokeRect(122, 88, w - 196, h - 176);
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(140, 106, w - 232, h - 212);
  ctx.globalAlpha = 1;

  ctx.fillStyle = book.foilColor;
  ctx.font = 'bold 26px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(book.code, 174, 178);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.fillText(`${book.year} EDITION`, w - 114, 178);

  const cx = (122 + w - 74) / 2;
  ctx.strokeStyle = book.foilColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 110, 480);
  ctx.lineTo(cx - 28, 480);
  ctx.moveTo(cx + 28, 480);
  ctx.lineTo(cx + 110, 480);
  ctx.stroke();

  ctx.save();
  ctx.translate(cx, 480);
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-9, -9, 18, 18);
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FAF6EE';
  ctx.font = 'normal 84px Georgia, "Songti SC", "SimSun", serif';
  ctx.fillText(book.titleZh, cx, 625);

  ctx.fillStyle = book.foilColor;
  ctx.font = 'italic 36px Georgia, serif';
  ctx.fillText(book.titleEn, cx, 705);

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '26px ui-monospace, SFMono-Regular, monospace';
  ctx.fillText(`BY  ${book.author.toUpperCase()}`, cx, 805);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(174, h - 205);
  ctx.lineTo(w - 114, h - 205);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '25px ui-monospace, sans-serif';
  ctx.fillText(book.categoryZh, 174, h - 148);

  ctx.textAlign = 'right';
  ctx.fillStyle = book.foilColor;
  ctx.font = 'bold 26px ui-monospace, sans-serif';
  ctx.fillText('拖拽 / 点击翻开 →', w - 114, h - 148);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function createContentPageTexture(
  book: BookData,
  pageNumber: 1 | 2 | 3 | 4 | 5 | 6
): THREE.CanvasTexture {
  const w = 1024;
  const h = 1360;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const isLeft = pageNumber % 2 === 1;
  drawCottonPaperBase(ctx, w, h, isLeft);

  const padL = isLeft ? 96 : 126;
  const padR = isLeft ? 126 : 96;
  const textW = w - padL - padR;

  // Running Header
  ctx.fillStyle = '#8A6F48';
  ctx.font = 'bold 24px ui-monospace, SFMono-Regular, monospace';
  const headerTitles: Record<number, string> = {
    1: 'EX LIBRIS · 藏书摘录',
    2: 'MARGINALIA · 读后眉批',
    3: 'MENTAL MODELS · 思维模型',
    4: 'PRACTICE · 实践映射',
    5: 'BOOKPLATE · 私人藏书票',
    6: 'COLOPHON · 终章回响',
  };
  ctx.textAlign = 'left';
  ctx.fillText(isLeft ? `0${pageNumber}` : headerTitles[pageNumber], padL, 112);
  ctx.textAlign = 'right';
  ctx.fillText(isLeft ? headerTitles[pageNumber] : `0${pageNumber}`, w - padR, 112);

  ctx.strokeStyle = '#DDD2BC';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padL, 144);
  ctx.lineTo(w - padR, 144);
  ctx.stroke();

  // Body Typography (High-contrast Editorial Ink)
  ctx.textAlign = 'left';
  if (pageNumber === 1) {
    ctx.fillStyle = '#8A6F48';
    ctx.font = 'bold 23px ui-monospace, monospace';
    ctx.fillText(`${book.titleEn.toUpperCase()}`, padL, 330);

    ctx.fillStyle = '#8A6F48';
    ctx.fillRect(padL, 385, 6, 390);

    ctx.fillStyle = 'rgba(138, 111, 72, 0.25)';
    ctx.font = '126px Georgia, serif';
    ctx.fillText('“', padL + 28, 460);

    ctx.fillStyle = '#141311';
    ctx.font = '44px Georgia, "Songti SC", "SimSun", serif';
    wrapText(ctx, book.quoteZh, padL + 38, 505, textW - 44, 76);

    ctx.fillStyle = '#8A6F48';
    ctx.font = 'bold 28px ui-monospace, sans-serif';
    ctx.fillText(`—— ${book.author}`, padL + 38, 880);
    ctx.fillText(book.rating, padL + 38, 936);
  } else if (pageNumber === 2) {
    ctx.fillStyle = '#8A6F48';
    ctx.font = 'bold 23px ui-monospace, monospace';
    ctx.fillText('CHAPTER I · REFLECTION', padL, 275);

    ctx.fillStyle = '#141311';
    ctx.font = 'bold 48px Georgia, "Songti SC", serif';
    ctx.fillText('为什么常翻这本书', padL, 355);

    ctx.fillStyle = '#2B2823';
    ctx.font = '34px Georgia, "Songti SC", serif';
    const nextY = wrapText(ctx, book.marginaliaZh, padL, 455, textW, 64);

    ctx.strokeStyle = '#DDD2BC';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(padL, nextY + 46);
    ctx.lineTo(w - padR, nextY + 46);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#756F65';
    ctx.font = '25px ui-monospace, sans-serif';
    ctx.fillText(`✎ 眉批手记 · 记于长沙书桌 (${book.year})`, padL, nextY + 102);
  } else if (pageNumber === 3) {
    let currY = 265;
    book.takeawaysZh.slice(0, 2).forEach((item, idx) => {
      ctx.fillStyle = '#8A6F48';
      ctx.font = 'bold 27px ui-monospace, monospace';
      ctx.fillText(`§ 0${idx + 1}`, padL, currY);

      ctx.fillStyle = '#141311';
      ctx.font = 'bold 38px Georgia, "Songti SC", serif';
      ctx.fillText(item.title, padL + 96, currY);

      ctx.fillStyle = '#2F2C26';
      ctx.font = '32px Georgia, "Songti SC", serif';
      currY = wrapText(ctx, item.body, padL + 96, currY + 64, textW - 96, 58);
      currY += 76;

      if (idx === 0) {
        ctx.strokeStyle = '#E0D6C1';
        ctx.beginPath();
        ctx.moveTo(padL, currY - 38);
        ctx.lineTo(w - padR, currY - 38);
        ctx.stroke();
        currY += 28;
      }
    });
  } else if (pageNumber === 4) {
    const item = book.takeawaysZh[2];
    let currY = 290;
    if (item) {
      ctx.fillStyle = '#8A6F48';
      ctx.font = 'bold 27px ui-monospace, monospace';
      ctx.fillText('§ 03', padL, currY);

      ctx.fillStyle = '#141311';
      ctx.font = 'bold 38px Georgia, "Songti SC", serif';
      ctx.fillText(item.title, padL + 96, currY);

      ctx.fillStyle = '#2F2C26';
      ctx.font = '33px Georgia, "Songti SC", serif';
      currY = wrapText(ctx, item.body, padL + 96, currY + 66, textW - 96, 60);
    }

    const boxY = Math.max(720, currY + 56);
    ctx.fillStyle = '#F2EBDC';
    ctx.fillRect(padL, boxY, textW, 240);
    ctx.strokeStyle = '#D6CBB3';
    ctx.lineWidth = 2;
    ctx.strokeRect(padL, boxY, textW, 240);

    ctx.fillStyle = '#8A6F48';
    ctx.font = 'bold 23px ui-monospace, monospace';
    ctx.fillText('NOTE TO SELF', padL + 36, boxY + 58);

    ctx.fillStyle = '#2B2823';
    ctx.font = '31px Georgia, "Songti SC", serif';
    wrapText(
      ctx,
      '好书的价值不在于读完的速度，而在于它能否沉淀为自己构建系统时的默认直觉。',
      padL + 36,
      boxY + 118,
      textW - 72,
      52
    );
  } else if (pageNumber === 5) {
    const bx = padL + 84;
    const by = 310;
    const bw = textW - 168;
    const bh = 660;
    ctx.fillStyle = '#FFFDF7';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#C2B08E';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.strokeStyle = '#E0D6C1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx + 16, by + 16, bw - 32, bh - 32);

    const cx = bx + bw / 2;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8A6F48';
    ctx.font = 'bold 22px ui-monospace, monospace';
    ctx.fillText('PRIVATE LIBRARY', cx, by + 92);

    ctx.fillStyle = book.coverBg;
    ctx.beginPath();
    ctx.arc(cx, by + 235, 76, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FAF6EE';
    ctx.font = '68px Georgia, "Songti SC", serif';
    ctx.fillText(book.titleZh.charAt(0), cx, by + 258);

    ctx.fillStyle = '#141311';
    ctx.font = 'bold 42px Georgia, "Songti SC", serif';
    ctx.fillText(`《${book.titleZh}》`, cx, by + 408);

    ctx.fillStyle = '#756F65';
    ctx.font = '25px ui-monospace, monospace';
    ctx.fillText(`${book.author} · ${book.year}`, cx, by + 468);

    ctx.strokeStyle = '#DDD2BC';
    ctx.beginPath();
    ctx.moveTo(bx + 64, by + 528);
    ctx.lineTo(bx + bw - 64, by + 528);
    ctx.stroke();

    ctx.fillStyle = '#8A6F48';
    ctx.font = 'bold 24px ui-monospace, monospace';
    ctx.fillText('EX LIBRIS · HUANG YIXUAN', cx, by + 590);
  } else if (pageNumber === 6) {
    ctx.fillStyle = '#8A6F48';
    ctx.font = 'bold 23px ui-monospace, monospace';
    ctx.fillText('ENGINEERING RESONANCE', padL, 280);

    ctx.fillStyle = '#141311';
    ctx.font = 'bold 44px Georgia, "Songti SC", serif';
    ctx.fillText('这本书如何塑造了我的工程观', padL, 365);

    ctx.fillStyle = '#2B2823';
    ctx.font = '34px Georgia, "Songti SC", serif';
    const nextY = wrapText(ctx, book.impactZh, padL, 465, textW, 64);

    ctx.save();
    ctx.translate(padL + 175, Math.max(820, nextY + 95));
    ctx.rotate(-0.05);
    ctx.strokeStyle = 'rgba(158, 70, 56, 0.85)';
    ctx.lineWidth = 4;
    ctx.strokeRect(-165, -38, 330, 76);
    ctx.fillStyle = 'rgba(158, 70, 56, 0.9)';
    ctx.font = 'bold 29px ui-monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`藏书印 · ${book.rating}`, 0, 10);
    ctx.restore();
  }

  // Running Footer
  ctx.strokeStyle = '#DDD2BC';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padL, h - 132);
  ctx.lineTo(w - padR, h - 132);
  ctx.stroke();

  ctx.fillStyle = '#8C867B';
  ctx.font = '22px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(isLeft ? `《${book.titleZh}》` : book.isbn, padL, h - 84);
  ctx.textAlign = 'right';
  ctx.fillText(isLeft ? '← 拖拽 / 点击回翻' : pageNumber === 6 ? 'FIN.' : '拖拽 / 点击翻页 →', w - padR, h - 84);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// ============================================================================
// Sculpted Arched Paper-Block & Rounded Hardcover Board Builders
// ============================================================================
/**
 * Builds a rounded-corner beveled hardcover board using ExtrudeGeometry
 * so the book cover has smooth, luxury bookbinding edges instead of sharp 90° box corners!
 */
function createRoundedBoardMesh(
  width: number,
  depth: number,
  thickness: number,
  radius: number,
  mat: THREE.Material
): THREE.Mesh {
  const shape = new THREE.Shape();
  const x = 0;
  const y = -depth / 2;
  shape.moveTo(x, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + depth - radius);
  shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
  shape.lineTo(x, y + depth);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.02,
  });
  // Lay flat in XZ plane
  geo.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Builds an arched 3D paper-block stack whose top surface matches the exact open-book
 * catenary curvature (`sin(u * PI) * archHeight`) so there is ZERO hollow gap under the curved pages!
 */
function createArchedPaperBlock(
  pageW: number,
  pageH: number,
  blockThickness: number,
  archHeight: number,
  isLeftSide: boolean,
  edgeTex: THREE.CanvasTexture
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(pageW - 0.04, blockThickness, pageH - 0.06, 24, 1, 1);
  // Shift so spine is at x = 0
  geo.translate(isLeftSide ? -(pageW - 0.04) / 2 : (pageW - 0.04) / 2, -blockThickness / 2, 0);

  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const u = Math.min(1, Math.abs(vx) / pageW);
    const arch = Math.sin(u * Math.PI) * archHeight;
    // Top vertices follow the arch curve; bottom vertices stay seated flat on the hardcover board
    if (vy > -blockThickness * 0.4) {
      pos.setY(i, vy + arch);
    } else {
      // Gentle taper down at spine
      pos.setY(i, vy + arch * 0.12);
    }
  }
  geo.computeVertexNormals();

  const edgeMat = new THREE.MeshStandardMaterial({
    map: edgeTex,
    roughness: 0.9,
    metalness: 0.02,
  });
  const topMat = new THREE.MeshStandardMaterial({
    color: '#F5EFE0',
    roughness: 0.92,
  });

  // BoxGeometry material groups: [+x, -x, +y, -y, +z, -z]
  const mesh = new THREE.Mesh(geo, [edgeMat, edgeMat, topMat, topMat, edgeMat, edgeMat]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Builds a gracefully draped 3D Silk Bookmark Ribbon that curves smoothly down the spine
 * and drapes over the bottom edge onto the desk (no rigid straight stick!).
 */
function createDrapedSilkRibbon(pageH: number, colorHex: string): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(0.16, pageH + 0.72, 2, 32);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vz = pos.getZ(i);
    const t = (vz + (pageH + 0.72) / 2) / (pageH + 0.72); // 0 = top of spine, 1 = dangling tail at bottom

    let y = 0.06;
    let xWave = Math.sin(t * Math.PI * 1.4) * 0.05;

    if (t > 0.82) {
      // Gently drape down off the bottom edge of the book onto the desk surface
      const dt = (t - 0.82) / 0.18;
      y = 0.06 - dt * 0.34;
      xWave += dt * 0.14;
    } else {
      // Follow gentle spine valley curve
      y = 0.05 + Math.sin(t * Math.PI) * 0.03;
    }

    // Swallowtail V-notch at the very tip
    if (t > 0.96 && Math.abs(vx) < 0.03) {
      pos.setZ(i, vz - 0.1);
    }

    pos.setX(i, vx + xWave);
    pos.setY(i, y);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.42,
    metalness: 0.12,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

// ============================================================================
// Flexible Curved-Paper Vertex Deformation Math
// ============================================================================
function deformFlexiblePaperMesh(
  geo: THREE.PlaneGeometry,
  basePositions: Float32Array,
  pageWidth: number,
  pageHeight: number,
  progress: number,
  stackYRight: number,
  stackYLeft: number,
  cornerCurlAmount: number
) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const p = Math.max(0, Math.min(1, progress));
  const turnActivity = Math.sin(p * Math.PI);

  for (let i = 0; i < pos.count; i++) {
    const bx = basePositions[i * 3];
    const bz = basePositions[i * 3 + 2];

    const u = bx / pageWidth;
    const v = (bz + pageHeight / 2) / pageHeight;

    // Progressive phase lag creates authentic soft-paper wave bending
    const lag = turnActivity * 0.25 * u ** 1.35;
    const localP = Math.max(0, Math.min(1, p - lag * (p < 0.5 ? 1 : -1) * 0.46));
    const theta = localP * Math.PI;

    // Natural open-book arch (matches createArchedPaperBlock height = 0.24!)
    const restingArch = Math.sin(u * Math.PI) * 0.24 * (1 - turnActivity * 0.5);
    const midAirBow = Math.sin(u * Math.PI) * turnActivity * 0.46;

    // Bottom-right corner hover dog-ear curl
    let curlLift = 0;
    let curlPullX = 0;
    if (cornerCurlAmount > 0.001 && p < 0.05) {
      const cornerProximity = Math.max(0, (u - 0.56) / 0.44) * Math.max(0, (v - 0.54) / 0.46);
      const curlPower = cornerProximity ** 1.65 * cornerCurlAmount;
      curlLift = curlPower * 0.44;
      curlPullX = -curlPower * 0.22;
    }

    const r = bx + curlPullX;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const x = r * cosT - midAirBow * sinT;
    const yBase = stackYRight * (1 - p) + stackYLeft * p;
    const y = yBase + r * sinT + restingArch + curlLift + midAirBow * 0.24 * (1 - Math.abs(cosT));
    const zWave = turnActivity * Math.sin(u * Math.PI) * (v - 0.5) * 0.08;

    pos.setXYZ(i, x, y, bz + zWave);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

// ============================================================================
// Main Component: Refined WebGL Flexible-Paper 3D Book
// ============================================================================
export const InteractiveReadingRoom: React.FC = () => {
  const { td } = useI18n();
  const [selectedBookIdx, setSelectedBookIdx] = useState<number>(0);
  const [targetSpread, setTargetSpread] = useState<number>(1);
  const [showFlipHint, setShowFlipHint] = useState<boolean>(false);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const book = CURATED_BOOKS[selectedBookIdx];
  const totalSheets = 3;

  const simRef = useRef({
    targetSpread: 1,
    sheetProgress: [1, 0, 0],
    hoverCorner: 0,
    targetHoverCorner: 0,
    isDragging: false,
    dragMoved: false,
    dragStartX: 0,
    dragSheetIdx: -1,
    dragDirection: 1 as 1 | -1,
    mouseParallaxX: 0,
    mouseParallaxY: 0,
  });

  useEffect(() => {
    simRef.current.targetSpread = targetSpread;
  }, [targetSpread]);

  const handleSelectBook = (idx: number) => {
    if (idx === selectedBookIdx) return;
    playPageTurnSound();
    setSelectedBookIdx(idx);
    setTargetSpread(1);
    simRef.current.targetSpread = 1;
  };

  const flipNext = useCallback(() => {
    setTargetSpread((prev) => {
      if (prev < totalSheets) {
        playPageTurnSound();
        return prev + 1;
      }
      return prev;
    });
  }, []);

  const flipPrev = useCallback(() => {
    setTargetSpread((prev) => {
      if (prev > 0) {
        playPageTurnSound();
        return prev - 1;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 860;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(33, width / height, 0.1, 100);
    camera.position.set(0, 6.85, 4.15);
    camera.lookAt(0, 0.08, 0.12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm Editorial Reading-Lamp Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#FFFDF8', '#D6CAB5', 1.25);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF7E8', 1.45);
    keyLight.position.set(3.8, 10.5, 4.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 26;
    const s = 6.0;
    keyLight.shadow.camera.left = -s;
    keyLight.shadow.camera.right = s;
    keyLight.shadow.camera.top = s;
    keyLight.shadow.camera.bottom = -s;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#FFEED4', 0.45);
    rimLight.position.set(-5.5, 5.5, -3.5);
    scene.add(rimLight);

    // Soft Shadow-Receiving Desk Surface
    const deskPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 16),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    deskPlane.rotation.x = -Math.PI / 2;
    deskPlane.position.y = -0.31;
    deskPlane.receiveShadow = true;
    scene.add(deskPlane);

    const bookRoot = new THREE.Group();
    scene.add(bookRoot);

    const pageW = 3.15;
    const pageH = 4.2;

    // 1. Textured Beveled Rounded-Corner Hardcover Boards + Endpaper Lining
    const linenTex = createLinenClothTexture(book.coverBg);
    const coverMat = new THREE.MeshStandardMaterial({
      map: linenTex,
      roughness: 0.84,
      metalness: 0.06,
    });

    const rightBoard = createRoundedBoardMesh(pageW + 0.16, pageH + 0.2, 0.065, 0.14, coverMat);
    rightBoard.position.set(0.02, -0.22, 0);
    bookRoot.add(rightBoard);

    const leftBoard = createRoundedBoardMesh(pageW + 0.16, pageH + 0.2, 0.065, 0.14, coverMat);
    leftBoard.scale.x = -1; // Mirror nicely to the left side
    leftBoard.position.set(-0.02, -0.22, 0);
    bookRoot.add(leftBoard);

    // Curved Cloth Spine Cradle at Center
    const spineMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, pageH + 0.22, 18, 1, false, Math.PI / 2, Math.PI),
      new THREE.MeshStandardMaterial({ color: book.spineColor, roughness: 0.88 })
    );
    spineMesh.rotation.x = Math.PI / 2;
    spineMesh.position.set(0, -0.18, 0);
    bookRoot.add(spineMesh);

    // 2. Sculpted Arched Paper-Block Stacks (Hugs the curved open pages seamlessly with zero gaps!)
    const paperEdgeTex = createPaperEdgeStriationTexture();
    const rightPaperBlock = createArchedPaperBlock(pageW, pageH, 0.21, 0.22, false, paperEdgeTex);
    rightPaperBlock.position.y = -0.01;
    bookRoot.add(rightPaperBlock);

    const leftPaperBlock = createArchedPaperBlock(pageW, pageH, 0.21, 0.22, true, paperEdgeTex);
    leftPaperBlock.position.y = -0.01;
    bookRoot.add(leftPaperBlock);

    // 3. Static Base Right Page (P.06 Colophon)
    const basePageGeo = new THREE.PlaneGeometry(pageW, pageH, 32, 10);
    basePageGeo.rotateX(-Math.PI / 2);
    basePageGeo.translate(pageW / 2, 0, 0);
    const basePageOrig = new Float32Array(basePageGeo.attributes.position.array);
    deformFlexiblePaperMesh(basePageGeo, basePageOrig, pageW, pageH, 0, 0.005, 0.005, 0);

    const texP6 = createContentPageTexture(book, 6);
    const basePageMesh = new THREE.Mesh(
      basePageGeo,
      new THREE.MeshStandardMaterial({ map: texP6, roughness: 0.88, metalness: 0.02 })
    );
    basePageMesh.receiveShadow = true;
    bookRoot.add(basePageMesh);

    // 4. Three Flexible Double-Sided 3D Turning Sheets
    const sheetTextures: [THREE.CanvasTexture, THREE.CanvasTexture][] = [
      [createHardcoverFrontTexture(book), createContentPageTexture(book, 1)],
      [createContentPageTexture(book, 2), createContentPageTexture(book, 3)],
      [createContentPageTexture(book, 4), createContentPageTexture(book, 5)],
    ];

    const buildFlexibleSheet = (frontTex: THREE.CanvasTexture, backTex: THREE.CanvasTexture, isCover: boolean) => {
      const geoFront = new THREE.PlaneGeometry(pageW, pageH, 36, 12);
      geoFront.rotateX(-Math.PI / 2);
      geoFront.translate(pageW / 2, 0, 0);
      const basePos = new Float32Array(geoFront.attributes.position.array);

      const geoBack = geoFront.clone();
      const uvBack = geoBack.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uvBack.count; i++) {
        uvBack.setX(i, 1 - uvBack.getX(i));
      }
      uvBack.needsUpdate = true;

      const matFront = new THREE.MeshStandardMaterial({
        map: frontTex,
        roughness: isCover ? 0.78 : 0.86,
        metalness: isCover ? 0.08 : 0.02,
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });

      const matBack = new THREE.MeshStandardMaterial({
        map: backTex,
        roughness: 0.86,
        metalness: 0.02,
        side: THREE.BackSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });

      const frontMesh = new THREE.Mesh(geoFront, matFront);
      frontMesh.castShadow = true;
      frontMesh.receiveShadow = true;

      const backMesh = new THREE.Mesh(geoBack, matBack);
      backMesh.castShadow = true;
      backMesh.receiveShadow = true;

      const group = new THREE.Group();
      group.add(frontMesh, backMesh);
      bookRoot.add(group);

      return { geoFront, geoBack, basePos };
    };

    const sheets = sheetTextures.map(([ft, bt], idx) => buildFlexibleSheet(ft, bt, idx === 0));

    // 5. Gracefully Draped 3D Silk Bookmark Ribbon
    const ribbonMesh = createDrapedSilkRibbon(pageH, book.ribbonColor);
    bookRoot.add(ribbonMesh);

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const sim = simRef.current;

      for (let i = 0; i < totalSheets; i++) {
        if (sim.isDragging && sim.dragSheetIdx === i) continue;
        const desired = sim.targetSpread > i ? 1 : 0;
        sim.sheetProgress[i] += (desired - sim.sheetProgress[i]) * 0.11;
        if (Math.abs(desired - sim.sheetProgress[i]) < 0.001) {
          sim.sheetProgress[i] = desired;
        }
      }

      sim.hoverCorner += (sim.targetHoverCorner - sim.hoverCorner) * 0.14;

      const topRightSheetIdx = sim.targetSpread;
      sheets.forEach((sh, idx) => {
        const p = sim.sheetProgress[idx];
        const stackYRight = 0.015 + (totalSheets - idx) * 0.022;
        const stackYLeft = 0.015 + (idx + 1) * 0.022;
        const curlAmt = !sim.isDragging && idx === topRightSheetIdx ? sim.hoverCorner : 0;

        deformFlexiblePaperMesh(
          sh.geoFront,
          sh.basePos,
          pageW,
          pageH,
          p,
          stackYRight,
          stackYLeft,
          curlAmt
        );
        (sh.geoBack.attributes.position as THREE.BufferAttribute).copy(
          sh.geoFront.attributes.position as THREE.BufferAttribute
        );
        sh.geoBack.attributes.position.needsUpdate = true;
        (sh.geoBack.attributes.normal as THREE.BufferAttribute).copy(
          sh.geoFront.attributes.normal as THREE.BufferAttribute
        );
        sh.geoBack.attributes.normal.needsUpdate = true;
      });

      const openFactor = sim.sheetProgress[0];
      bookRoot.position.x = THREE.MathUtils.lerp(-pageW * 0.48, 0, openFactor);
      bookRoot.rotation.y =
        THREE.MathUtils.lerp(-0.24, 0, openFactor) + sim.mouseParallaxX * 0.07;
      bookRoot.rotation.x =
        THREE.MathUtils.lerp(0.08, 0.02, openFactor) + sim.mouseParallaxY * 0.04;

      leftBoard.visible = openFactor > 0.05;
      leftPaperBlock.visible = openFactor > 0.12;
      ribbonMesh.visible = openFactor > 0.25;

      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 860;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      linenTex.dispose();
      paperEdgeTex.dispose();
      texP6.dispose();
      sheetTextures.forEach(([a, b]) => {
        a.dispose();
        b.dispose();
      });
      renderer.dispose();
    };
  }, [book]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const sim = simRef.current;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    sim.isDragging = true;
    sim.dragMoved = false;
    sim.dragStartX = e.clientX;

    if (relX >= 0.48 && sim.targetSpread < totalSheets) {
      sim.dragSheetIdx = sim.targetSpread;
      sim.dragDirection = 1;
    } else if (relX < 0.48 && sim.targetSpread > 0) {
      sim.dragSheetIdx = sim.targetSpread - 1;
      sim.dragDirection = -1;
    } else {
      sim.dragSheetIdx = -1;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    const sim = simRef.current;

    sim.mouseParallaxX = (relX - 0.5) * 2;
    sim.mouseParallaxY = (relY - 0.5) * 2;

    if (!sim.isDragging) {
      sim.targetHoverCorner = relX > 0.56 && relY > 0.35 && sim.targetSpread < totalSheets ? 1 : 0;
      return;
    }

    const dx = e.clientX - sim.dragStartX;
    if (Math.abs(dx) > 6) sim.dragMoved = true;

    if (sim.dragMoved && sim.dragSheetIdx >= 0) {
      const span = rect.width * 0.46;
      if (sim.dragDirection === 1) {
        sim.sheetProgress[sim.dragSheetIdx] = Math.max(0, Math.min(1, -dx / span));
      } else {
        sim.sheetProgress[sim.dragSheetIdx] = Math.max(0, Math.min(1, 1 - dx / span));
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const sim = simRef.current;
    if (!sim.isDragging) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    if (!sim.dragMoved) {
      if (sim.dragDirection === 1 && sim.dragSheetIdx >= 0) flipNext();
      else if (sim.dragDirection === -1 && sim.dragSheetIdx >= 0) flipPrev();
    } else if (sim.dragSheetIdx >= 0) {
      const currentP = sim.sheetProgress[sim.dragSheetIdx];
      if (sim.dragDirection === 1 && currentP > 0.32) {
        flipNext();
      } else if (sim.dragDirection === -1 && currentP < 0.68) {
        flipPrev();
      }
    }

    sim.isDragging = false;
    sim.dragSheetIdx = -1;
  };

  return (
    <div className="space-y-8">
      {/* 1. Tactile Cloth-Bound Bookshelf Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {CURATED_BOOKS.map((b, idx) => {
          const active = idx === selectedBookIdx;
          return (
            <button
              key={b.id}
              type="button"
              data-sfx="custom"
              onClick={() => handleSelectBook(idx)}
              className={`group relative text-left rounded-xl p-4 border transition-all duration-300 overflow-hidden ${
                active
                  ? 'border-[#8A6F48] shadow-md -translate-y-0.5 bg-white dark:bg-[#1A1916]'
                  : 'designer-card hover:-translate-y-0.5 hover:border-[#8A6F48]/50'
              }`}
            >
              <div
                className="absolute inset-y-0 left-0 w-3 flex flex-col justify-between py-2.5 items-center"
                style={{ backgroundColor: b.coverBg }}
              >
                <span className="w-1.5 h-[1px] opacity-60" style={{ backgroundColor: b.foilColor }} />
                <span className="w-1.5 h-[1px] opacity-60" style={{ backgroundColor: b.foilColor }} />
              </div>

              <div className="pl-3.5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#8A6F48] dark:text-[#C8A97E] font-bold">{b.code}</span>
                  <span className="designer-text-muted">{b.year}</span>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-semibold designer-text-primary truncate">
                    《{b.titleZh}》
                  </h3>
                  <p className="text-[11px] font-mono designer-text-muted truncate mt-0.5">
                    {b.author}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t designer-hairline flex items-center justify-between text-[10px] font-mono">
                  <span className="designer-text-muted truncate">{td(b.categoryZh, b.categoryEn)}</span>
                  {active && (
                    <span className="text-[#8A6F48] dark:text-[#C8A97E] font-bold shrink-0 ml-1">
                      ● {td('在读', 'OPEN')}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. WebGL Flexible-Paper 3D Studio Reading Desk */}
      <div
        className="designer-card rounded-3xl p-5 sm:p-7 relative overflow-hidden select-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 75% 65% at 50% 45%, rgba(216,183,124,0.14), transparent 72%)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-2 border-b designer-hairline text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />
            <span className="font-semibold designer-text-primary">
              《{book.titleZh}》 · {book.author}
            </span>
            <span className="hidden sm:inline text-[#8A6F48] dark:text-[#C8A97E] text-[11px]">
              {book.rating}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowFlipHint((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full designer-pill text-[11px] designer-text-muted hover:designer-text-primary transition-colors"
          >
            <Hand className="w-3 h-3 text-[#8A6F48]" />
            <span>{showFlipHint ? td('收起提示', 'Hide Tip') : td('翻页提示', 'Tip')}</span>
          </button>
        </div>

        {showFlipHint && (
          <div className="mb-2 px-3 py-1.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1A1916] border designer-hairline text-[11px] font-mono designer-text-muted text-center">
            {td('按住鼠标左右拖拽即可弯曲翻页，或直接点击左右书页翻阅', 'Drag horizontally to bend & turn pages, or click left/right side')}
          </div>
        )}

        {/* True WebGL 3D Curved-Mesh Book Canvas */}
        <div
          ref={mountRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            simRef.current.targetHoverCorner = 0;
            simRef.current.mouseParallaxX = 0;
            simRef.current.mouseParallaxY = 0;
          }}
          className="w-full h-[440px] sm:h-[530px] cursor-grab active:cursor-grabbing"
        />

        {/* Bottom Controls */}
        <div className="mt-2 pt-4 border-t designer-hairline flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            data-sfx="custom"
            onClick={flipPrev}
            disabled={targetSpread === 0}
            className="px-4 py-2 rounded-full designer-btn-secondary font-mono text-xs flex items-center gap-1.5 disabled:opacity-35 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{td('向前翻页', 'Prev')}</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[11px]">
            {[
              { idx: 0, label: td('精装封面', 'Cover') },
              { idx: 1, label: td('金句 · 眉批', 'Quote') },
              { idx: 2, label: td('思维模型', 'Models') },
              { idx: 3, label: td('藏书印 · 回响', 'Colophon') },
            ].map((sp) => (
              <button
                key={sp.idx}
                type="button"
                data-sfx="custom"
                onClick={() => {
                  if (sp.idx !== targetSpread) {
                    playPageTurnSound();
                    setTargetSpread(sp.idx);
                  }
                }}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  targetSpread === sp.idx
                    ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F0EFEA] dark:text-[#141413] font-semibold shadow-xs'
                    : 'text-[#8C877E] hover:text-[#141413] dark:hover:text-[#F0EFEA]'
                }`}
              >
                <span className="hidden sm:inline">{sp.label}</span>
                <span className="sm:hidden">{sp.idx + 1}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {targetSpread === totalSheets && (
              <button
                type="button"
                data-sfx="custom"
                onClick={() => {
                  playPageTurnSound();
                  setTargetSpread(0);
                }}
                className="px-3.5 py-2 rounded-full designer-btn-secondary font-mono text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{td('合上封面', 'Close')}</span>
              </button>
            )}
            <button
              type="button"
              data-sfx="custom"
              onClick={flipNext}
              disabled={targetSpread === totalSheets}
              className="px-4 py-2 rounded-full designer-btn-primary font-mono text-xs flex items-center gap-1.5 disabled:opacity-35 transition-all"
            >
              <span>{td('向后翻页', 'Next')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
