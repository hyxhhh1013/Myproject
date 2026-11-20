import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  CloudSun,
  MapPin,
  Aperture,
  X,
  Download,
  Volume2,
  VolumeX,
  Send,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Film,
  ArrowUpRight,
  ArrowLeft,
  Info,
  Briefcase,
  Flame,
  Mail,
  Music,
  Lock,
  Unlock,
  KeyRound,
  Bookmark,
} from 'lucide-react';
import { usePhotoContext, Photo } from '../context/PhotoContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n/i18nContext';
import {
  PERSONAL_MEMORIES,
  PersonalMemoryNode,
  MEMORY_PASSPHRASE_HINT_ZH,
  MEMORY_PASSPHRASE_HINT_EN,
} from '../data/islandMemories';
import { buildPersonalMemoryModel, BuiltMemoryModel } from '../utils/islandMemoryModels';
import { resolvePhotoExif } from '../components/Sections/Photos';

// ============================================================================
// Built-in Projects & Procedural Audio Helpers
// ============================================================================
interface IslandProject {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  year: string;
  role: string;
  stack: string[];
  summary: string;
  link?: string;
}

const LAB_PROJECTS: IslandProject[] = [
  {
    id: 'heshu',
    num: '01',
    title: '禾书耕文 · AI4Science',
    subtitle: '农业科研多智能体辅助写作系统',
    year: '2025 — 2026',
    role: '核心架构 & 全栈研发',
    stack: ['LangGraph', 'Hybrid RAG', 'FastAPI', 'React 18'],
    summary:
      '面向农学与生命科学学者的垂直领域文献综述工作台，将文献检索、大纲推演与多源引文核验编排为可观测的 Agent 状态图。',
    link: 'https://ai4science.hyxhhh.site/',
  },
  {
    id: 'dreamtopo',
    num: '02',
    title: '梦境拓扑 · DreamTopology',
    subtitle: '潜意识符号抽取与力导向图谱系统',
    year: '2025',
    role: '独立设计与全栈开发',
    stack: ['TypeScript', 'React', 'Prisma', 'Force-Graph'],
    summary:
      '把非结构化的碎片梦境文本转化为可交互的意象拓扑网络，自动抽取高频意象、情绪张力与跨日逻辑边。',
    link: '/demo/ai-assistant',
  },
  {
    id: 'fandingle',
    num: '03',
    title: '饭定了 · FanDingLe',
    subtitle: '源自 50+ 商户一线市调的餐饮协同决策产品',
    year: '2025',
    role: '团队负责人 & 全栈开发',
    stack: ['React', 'TypeScript', 'Node.js', 'WebSocket'],
    summary:
      '结合忌口一票否决、预算距离约束与多人实时同步投票房间，30 秒收敛出最优聚餐方案。',
    link: '/demo/dashboard',
  },
  {
    id: 'outbounds',
    num: '04',
    title: '界外 Outbounds',
    subtitle: '跨学科灵感策展与数字花园系统',
    year: '2025 — 2026',
    role: '全栈工程与视觉架构',
    stack: ['React', 'TypeScript', 'Sharp WebP', 'Express'],
    summary:
      '集成自适应瀑布流画廊、EXIF 胶片解析、WebP 自动化图像管线与实时互动墙的创作者社区。',
    link: '/demo/notes',
  },
];

function playTactileClick(pitch = 800) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.025);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch {
    // Ignore
  }
}

function playCameraShutterSound(muted = false) {
  if (muted) return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.exponentialRampToValueAtTime(140, now + 0.018);
    gain1.gain.setValueAtTime(0.14, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.022);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(920, now + 0.045);
    osc2.frequency.exponentialRampToValueAtTime(110, now + 0.07);
    gain2.gain.setValueAtTime(0.11, now + 0.045);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.045);
    osc2.stop(now + 0.08);
  } catch {
    // Ignore
  }
}

function playWindChimeNote(noteIdx = 0, muted = false) {
  if (muted) return;
  try {
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const freq = pentatonic[noteIdx % pentatonic.length];
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.45);
  } catch {
    // Ignore
  }
}

function playGuitarChord(chordIndex = 0): string {
  const chords = [
    { name: 'Gmaj7', freqs: [196.0, 246.94, 293.66, 369.99, 493.88] },
    { name: 'Cmaj9', freqs: [130.81, 164.81, 246.94, 293.66, 392.0] },
    { name: 'Fmaj7', freqs: [174.61, 220.0, 261.63, 329.63, 440.0] },
    { name: 'Em7', freqs: [164.81, 196.0, 246.94, 293.66, 392.0] },
  ];
  const chord = chords[chordIndex % chords.length];
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return chord.name;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    chord.freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.04);
      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.055, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.04 + 1.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 1.35);
    });
    return chord.name;
  } catch {
    return chord.name;
  }
}

// ============================================================================
// 3D World Zones, Easels & Stations Configuration
// ============================================================================
interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface IslandZone {
  id: string;
  nameZh: string;
  nameEn: string;
  subtitleZh: string;
  subtitleEn: string;
  center: Vec3;
  radius: number;
  badgeColor: string;
}

export interface EaselNode {
  id: string;
  photoIndex: number;
  zoneId: string;
  pos: Vec3;
  facingYaw: number;
  frameStyle: 'forest' | 'darkroom' | 'starlight' | 'meadow';
  storyZh: string;
  storyEn: string;
  locationZh: string;
  weatherZh: string;
}

export interface SpecialStation {
  id: 'gear-bag' | 'drift-bottle' | 'campfire-projects';
  nameZh: string;
  nameEn: string;
  hintZh: string;
  hintEn: string;
  pos: Vec3;
}

const ISLAND_ZONES: IslandZone[] = [
  {
    id: 'meadow',
    nameZh: '01 · 拾光主岛 · 风车花海',
    nameEn: '01 · Windmill Flower Meadow',
    subtitleZh: '荷兰白风车、溪流瀑布与繁花草坡',
    subtitleEn: 'Dutch windmill, cascading waterfall & wildflower hills',
    center: { x: 0, y: 0.6, z: 0 },
    radius: 10.5,
    badgeColor: '#34D399',
  },
  {
    id: 'forest',
    nameZh: '02 · 森之画廊 · 丁达尔林间',
    nameEn: '02 · Tyndall Forest Gallery',
    subtitleZh: '金秋银杏、松林晨雾与林间实木画架',
    subtitleEn: 'Golden ginkgo, misty pines & timber photo easels',
    center: { x: 17.5, y: 0.9, z: -4.0 },
    radius: 8.2,
    badgeColor: '#10B981',
  },
  {
    id: 'coast',
    nameZh: '03 · 海岸灯塔 · 胶片暗房',
    nameEn: '03 · Coastal Lighthouse & Darkroom',
    subtitleZh: '红白灯塔、暖光木屋、户外串灯与街拍展',
    subtitleEn: 'Striped lighthouse, cozy log darkroom & festoon lights',
    center: { x: -17.5, y: 0.7, z: -3.5 },
    radius: 8.2,
    badgeColor: '#F59E0B',
  },
  {
    id: 'summit',
    nameZh: '04 · 云端观星台 · 篝火露营',
    nameEn: '04 · Starlight Summit & Glamping',
    subtitleZh: '黄铜天文望远镜、露营帐篷、篝火与工程手稿',
    subtitleEn: 'Brass telescope, glamping tent, campfire & projects',
    center: { x: 0, y: 2.5, z: -18.5 },
    radius: 7.6,
    badgeColor: '#818CF8',
  },
  {
    id: 'pier',
    nameZh: '05 · 浅滩木栈道 · 漂流瓶码头',
    nameEn: '05 · Sunset Pier & Drift Bottles',
    subtitleZh: '复古红邮筒、木划艇与海面发光漂流瓶',
    subtitleEn: 'Vintage postbox, wooden rowboat & glowing drift bottles',
    center: { x: 0, y: 0.35, z: 12.2 },
    radius: 5.0,
    badgeColor: '#F472B6',
  },
];

const EASEL_CONFIGS: EaselNode[] = [
  {
    id: 'easel-1',
    photoIndex: 0,
    zoneId: 'meadow',
    pos: { x: -4.4, y: 0.72, z: -2.6 },
    facingYaw: 0.38,
    frameStyle: 'meadow',
    storyZh:
      '傍晚六点十七分，湘江水面上最后一抹金橘色余晖把远处的桥影拉得很长。没有用滤镜，只把色温调暖了 200K。',
    storyEn:
      '6:17 PM by the Xiangjiang River. The last tangerine glow stretched the distant bridge silhouettes across the water.',
    locationZh: '长沙 · 湘江风光带',
    weatherZh: '日落微风 · 21°C',
  },
  {
    id: 'easel-2',
    photoIndex: 3,
    zoneId: 'meadow',
    pos: { x: 4.8, y: 0.72, z: 2.4 },
    facingYaw: -0.45,
    frameStyle: 'meadow',
    storyZh:
      '午后四点的图书馆三楼，阳光刚好斜切过木质长桌，尘埃在光束里像缓慢游动的星群。',
    storyEn:
      '4 PM on the 3rd floor of the library. Sunlight sliced across the oak desk like floating stardust.',
    locationZh: '农大图书馆 · 三楼南窗',
    weatherZh: '晴朗 · 丁达尔光',
  },
  {
    id: 'easel-3',
    photoIndex: 2,
    zoneId: 'forest',
    pos: { x: 14.2, y: 1.02, z: -7.2 },
    facingYaw: 0.5,
    frameStyle: 'forest',
    storyZh:
      '清晨五点半爬上岳麓山，山谷间的乳白色晨雾还没有散尽，第一缕阳光穿透枫香树冠。',
    storyEn:
      '5:30 AM on Yuelu Mountain. Milky morning mist lingered in the valley as the first sunbeams pierced the canopy.',
    locationZh: '岳麓山 · 爱晚亭上方山径',
    weatherZh: '晨雾 · 湿度 86%',
  },
  {
    id: 'easel-4',
    photoIndex: 7,
    zoneId: 'forest',
    pos: { x: 19.8, y: 1.02, z: -7.5 },
    facingYaw: -0.35,
    frameStyle: 'forest',
    storyZh:
      '江风吹过橘子洲头的芦苇与樟树林，按下 1/1000 秒快门，把风的形状凝固在画面里。',
    storyEn:
      'River breeze sweeping through Orange Isle reeds. 1/1000s shutter froze the invisible contour of the wind.',
    locationZh: '长沙 · 橘子洲头南端',
    weatherZh: '江风晴空 · 能见度极佳',
  },
  {
    id: 'easel-5',
    photoIndex: 9,
    zoneId: 'forest',
    pos: { x: 21.0, y: 1.02, z: -1.0 },
    facingYaw: -2.4,
    frameStyle: 'forest',
    storyZh:
      '十一月中旬的银杏步道，满地金黄像铺了一层厚实的绒毯，踩上去有清脆的沙沙声。',
    storyEn:
      'Mid-November ginkgo boulevard carpeted in gold leaves that rustled softly underfoot.',
    locationZh: '校园银杏林 · 第七教学楼旁',
    weatherZh: '深秋暖阳 · 17°C',
  },
  {
    id: 'easel-6',
    photoIndex: 11,
    zoneId: 'forest',
    pos: { x: 14.8, y: 1.02, z: 0.5 },
    facingYaw: 2.5,
    frameStyle: 'forest',
    storyZh:
      '周末午后躲进巷子深处的独立咖啡馆，手冲壶腾起的热气刚好穿过窗边的绿植阴影。',
    storyEn:
      'Weekend afternoon in a tucked-away indie café. Steam from the pour-over kettle rose through monstera shadows.',
    locationZh: '白果园巷 · 独立咖啡角落',
    weatherZh: '慵懒多云 · 手冲埃塞俄比亚',
  },
  {
    id: 'easel-7',
    photoIndex: 1,
    zoneId: 'coast',
    pos: { x: -14.2, y: 0.82, z: -7.2 },
    facingYaw: -0.4,
    frameStyle: 'darkroom',
    storyZh:
      '刚下过阵雨的解放西路，潮湿的柏油路面把霓虹招牌染成了赛博与烟火气交织的调色盘。',
    storyEn:
      'Fresh rain on Jiefang West Road turned the wet asphalt into a neon mirror of city life.',
    locationZh: '长沙 · 解放西 / 太平街口',
    weatherZh: '夜雨初歇 · 霓虹倒影',
  },
  {
    id: 'easel-8',
    photoIndex: 4,
    zoneId: 'coast',
    pos: { x: -20.2, y: 0.82, z: -6.8 },
    facingYaw: 0.45,
    frameStyle: 'darkroom',
    storyZh:
      '老街青石板巷弄里，晾衣绳、竹椅与斑驳砖墙上的斜阳，藏着老城最温柔的慢时光。',
    storyEn:
      'Slanting sunlight over cobblestone alleys, bamboo chairs, and weathered brick walls.',
    locationZh: '苏家巷 · 老街深处',
    weatherZh: '夕照斜阳 · 胶片模拟 Classic Neg',
  },
  {
    id: 'easel-9',
    photoIndex: 5,
    zoneId: 'coast',
    pos: { x: -20.5, y: 0.82, z: 0.2 },
    facingYaw: 2.35,
    frameStyle: 'darkroom',
    storyZh:
      '用积水倒影做对称构图，天桥上匆匆走过的行人像跨过另一片颠倒的天空。',
    storyEn:
      'Symmetrical puddle reflection on the overpass — pedestrians stepping across an inverted sky.',
    locationZh: '五一广场 · 环形人行天桥',
    weatherZh: '雨后阴天 · 低机位倒影',
  },
  {
    id: 'easel-10',
    photoIndex: 10,
    zoneId: 'coast',
    pos: { x: -14.6, y: 0.82, z: 0.4 },
    facingYaw: -2.4,
    frameStyle: 'darkroom',
    storyZh:
      '大光圈定焦下的逆光发丝与颗粒感，保留了数字时代难得的呼吸感与情绪温度。',
    storyEn:
      'Backlit hair glow and subtle silver-halide grain captured wide open at f/1.2.',
    locationZh: '后湖艺术园 · 湖畔草坡',
    weatherZh: '黄金逆光 · 50mm f/1.2',
  },
  {
    id: 'easel-11',
    photoIndex: 6,
    zoneId: 'summit',
    pos: { x: -3.8, y: 2.6, z: -21.0 },
    facingYaw: 0.25,
    frameStyle: 'starlight',
    storyZh:
      '晚上十一点的自习室，只剩几盏暖黄台灯还亮着。那些安静伏案的剪影，是青春里最踏实的微光。',
    storyEn:
      '11 PM in the study hall. Only a few warm desk lamps remained lit — quiet silhouettes of dedication.',
    locationZh: '综合教学楼 · 深夜自习室',
    weatherZh: '静谧夜晚 · ISO 800',
  },
  {
    id: 'easel-12',
    photoIndex: 8,
    zoneId: 'summit',
    pos: { x: 4.0, y: 2.6, z: -20.8 },
    facingYaw: -0.25,
    frameStyle: 'starlight',
    storyZh:
      '蓝调时刻俯瞰整座城市的灯火渐次亮起，远处的摩天大楼与近处的万家灯火交汇成星河。',
    storyEn:
      'Blue hour overlooking the city skyline as thousands of windows ignited into an urban galaxy.',
    locationZh: '岳麓山观景台 · 俯瞰湘江两岸',
    weatherZh: '蓝调时刻 · 长曝光 4s',
  },
];

const SPECIAL_STATIONS: SpecialStation[] = [
  {
    id: 'gear-bag',
    nameZh: '摄影师长椅 & 器材手账',
    nameEn: 'Photographer Bench & Gear Bag',
    hintZh: '查看我的相机镜头清单与关于我',
    hintEn: 'Inspect camera gear list & creator profile',
    pos: { x: 3.4, y: 0.72, z: -3.5 },
  },
  {
    id: 'campfire-projects',
    nameZh: '山顶篝火 & 数字造物手稿',
    nameEn: 'Summit Campfire & Built Projects',
    hintZh: '围炉查看「禾书耕文」「梦境拓扑」等工程代表作',
    hintEn: 'Explore HeShu AI4Science, DreamTopology & projects',
    pos: { x: 0, y: 2.6, z: -17.2 },
  },
  {
    id: 'drift-bottle',
    nameZh: '海边红邮筒 & 漂流瓶留言',
    nameEn: 'Coastal Postbox & Drift Bottles',
    hintZh: '捡起海面上的漂流瓶，或投递你的小岛寄语',
    hintEn: 'Read or toss a glowing drift bottle into the sea',
    pos: { x: 0, y: 0.45, z: 11.2 },
  },
];

// ============================================================================
// Terrain Walkability & Exact Height Lookup (Main Islands + All Bridges + Memory Islands)
// ============================================================================
function getTerrainHeightAt(x: number, z: number): { walkable: boolean; y: number; zoneId: string } {
  // 1. Main 5 Archipelago Islands
  for (const zone of ISLAND_ZONES) {
    const dx = x - zone.center.x;
    const dz = z - zone.center.z;
    const dist = Math.hypot(dx, dz);
    if (dist <= zone.radius + 0.15) {
      const norm = Math.min(1, dist / zone.radius);
      const dome = Math.max(0, Math.cos(norm * Math.PI * 0.5)) * 0.42;
      const ripple = Math.sin(x * 0.55) * Math.cos(z * 0.55) * 0.08 * (1 - norm);
      return { walkable: true, y: zone.center.y + dome + ripple, zoneId: zone.id };
    }
  }

  // 2. 5 Dedicated Satellite Personal Memory Islands (including M01 Floating Pontoon)
  for (const mem of PERSONAL_MEMORIES) {
    if (mem.id === 'freedive-crimson') {
      // Walkable floating teak pontoon on the right side of the diving buoy
      const px = mem.pos.x + 4.6;
      const pz = mem.pos.z - 0.4;
      if (Math.abs(x - px) <= 2.4 && Math.abs(z - pz) <= 3.1) {
        return { walkable: true, y: 0.25, zoneId: mem.zoneId };
      }
      // Allow walking right up to the dive buoy area along the pontoon approach
      const distBuoy = Math.hypot(x - mem.islandCenter.x, z - mem.islandCenter.z);
      if (distBuoy <= mem.islandRadius) {
        return { walkable: true, y: 0.22, zoneId: mem.zoneId };
      }
    } else {
      const dx = x - mem.islandCenter.x;
      const dz = z - mem.islandCenter.z;
      const dist = Math.hypot(dx, dz);
      if (dist <= mem.islandRadius + 0.15) {
        return { walkable: true, y: mem.islandCenter.y + 0.14, zoneId: mem.zoneId };
      }
    }
  }

  // 3. Main Archipelago Bridges (generous width for smooth, non-sticking crossings)
  if (x >= 7.0 && x <= 12.2 && z >= -5.2 && z <= 0.8) {
    const t = Math.max(0, Math.min(1, (x - 7.5) / 4.3));
    const arch = Math.sin(t * Math.PI) * 0.45;
    return { walkable: true, y: 0.65 + t * 0.25 + arch, zoneId: 'forest' };
  }

  if (x >= -12.2 && x <= -7.0 && z >= -5.2 && z <= 0.8) {
    const t = Math.max(0, Math.min(1, (-x - 7.5) / 4.3));
    const arch = Math.sin(t * Math.PI) * 0.4;
    return { walkable: true, y: 0.62 + t * 0.12 + arch, zoneId: 'coast' };
  }

  if (Math.abs(x) <= 3.4 && z >= -13.5 && z <= -7.0) {
    const t = Math.max(0, Math.min(1, (-z - 7.5) / 5.5));
    return { walkable: true, y: 0.7 + t * 1.85, zoneId: 'summit' };
  }

  if (Math.abs(x) <= 2.8 && z >= 6.8 && z <= 15.2) {
    return { walkable: true, y: 0.42, zoneId: 'pier' };
  }

  // 4. Stepping-Stone Walkways connecting Parent Islands -> All 5 Dedicated Memory Islands
  for (const mem of PERSONAL_MEMORIES) {
    const parentZone = ISLAND_ZONES.find((zObj) => zObj.id === mem.zoneId);
    if (!parentZone) continue;
    const ax = parentZone.center.x;
    const az = parentZone.center.z;
    const bx = mem.islandCenter.x;
    const bz = mem.islandCenter.z;
    const abx = bx - ax;
    const abz = bz - az;
    const abLenSq = abx * abx + abz * abz;
    if (abLenSq < 0.01) continue;

    const proj = Math.max(0, Math.min(1, ((x - ax) * abx + (z - az) * abz) / abLenSq));
    const closestX = ax + abx * proj;
    const closestZ = az + abz * proj;
    const perpDist = Math.hypot(x - closestX, z - closestZ);

    if (perpDist <= 1.75) {
      const yInterp =
        parentZone.center.y +
        (mem.islandCenter.y - parentZone.center.y) * proj +
        Math.sin(proj * Math.PI) * 0.32;
      return { walkable: true, y: yInterp + 0.14, zoneId: mem.zoneId };
    }
  }

  return { walkable: false, y: 0, zoneId: 'meadow' };
}

// ============================================================================
// Atmosphere Palette Interpolation (24-Hour Cycle)
// ============================================================================
interface AtmosphereColors {
  skyTop: THREE.Color;
  skyBottom: THREE.Color;
  fogColor: THREE.Color;
  waterColor: THREE.Color;
  waterDeepColor: THREE.Color;
  sunColor: THREE.Color;
  sunIntensity: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  sunPosition: THREE.Vector3;
  nightFactor: number;
  goldenFactor: number;
  labelZh: string;
}

function computeAtmosphere(hour: number): AtmosphereColors {
  if (hour >= 5.2 && hour < 8.5) {
    const t = (hour - 5.2) / 3.3;
    return {
      skyTop: new THREE.Color('#3B5284').lerp(new THREE.Color('#64A6E8'), t),
      skyBottom: new THREE.Color('#F5A891').lerp(new THREE.Color('#FFE8C8'), t),
      fogColor: new THREE.Color('#F2C6B6').lerp(new THREE.Color('#D8EFFF'), t),
      waterColor: new THREE.Color('#397A9E').lerp(new THREE.Color('#42B6B5'), t),
      waterDeepColor: new THREE.Color('#1F3A60').lerp(new THREE.Color('#1E6B8C'), t),
      sunColor: new THREE.Color('#FFB27D'),
      sunIntensity: 1.65 + t * 0.5,
      hemiSky: new THREE.Color('#FFD9C4'),
      hemiGround: new THREE.Color('#4D6B53'),
      hemiIntensity: 0.95,
      sunPosition: new THREE.Vector3(28, 14 + t * 14, -18),
      nightFactor: Math.max(0, 1 - t * 1.8),
      goldenFactor: 0.85,
      labelZh: '晨雾微光 · Misty Dawn',
    };
  }
  if (hour >= 8.5 && hour < 16.0) {
    return {
      skyTop: new THREE.Color('#3A89DF'),
      skyBottom: new THREE.Color('#CAEBF9'),
      fogColor: new THREE.Color('#C4E8F8'),
      waterColor: new THREE.Color('#38B6B2'),
      waterDeepColor: new THREE.Color('#1B6B93'),
      sunColor: new THREE.Color('#FFF8E7'),
      sunIntensity: 2.25,
      hemiSky: new THREE.Color('#E3F4FF'),
      hemiGround: new THREE.Color('#588157'),
      hemiIntensity: 1.15,
      sunPosition: new THREE.Vector3(18, 36, 14),
      nightFactor: 0,
      goldenFactor: 0.15,
      labelZh: '晴空微风 · Breezy Day',
    };
  }
  if (hour >= 16.0 && hour < 18.8) {
    const t = (hour - 16.0) / 2.8;
    return {
      skyTop: new THREE.Color('#3A89DF').lerp(new THREE.Color('#3D2E5E'), t),
      skyBottom: new THREE.Color('#FFE0B5').lerp(new THREE.Color('#FF7A45'), t),
      fogColor: new THREE.Color('#FAD4B8').lerp(new THREE.Color('#E88D67'), t),
      waterColor: new THREE.Color('#38B6B2').lerp(new THREE.Color('#C97A63'), t),
      waterDeepColor: new THREE.Color('#1B6B93').lerp(new THREE.Color('#28335C'), t),
      sunColor: new THREE.Color('#FF8B3D'),
      sunIntensity: 2.4 - t * 0.5,
      hemiSky: new THREE.Color('#FFB988'),
      hemiGround: new THREE.Color('#4A3B32'),
      hemiIntensity: 1.0,
      sunPosition: new THREE.Vector3(-32, 16 - t * 6, -16),
      nightFactor: t * 0.4,
      goldenFactor: 1.0,
      labelZh: '黄金时刻 · Golden Hour',
    };
  }
  if (hour >= 18.8 && hour < 20.6) {
    const t = (hour - 18.8) / 1.8;
    return {
      skyTop: new THREE.Color('#2D2754').lerp(new THREE.Color('#0E152C'), t),
      skyBottom: new THREE.Color('#DF6E56').lerp(new THREE.Color('#243B6B'), t),
      fogColor: new THREE.Color('#474375').lerp(new THREE.Color('#19274A'), t),
      waterColor: new THREE.Color('#464B7A').lerp(new THREE.Color('#1B3258'), t),
      waterDeepColor: new THREE.Color('#1E2448').lerp(new THREE.Color('#0E172E'), t),
      sunColor: new THREE.Color('#B5C6FF'),
      sunIntensity: 1.1 - t * 0.45,
      hemiSky: new THREE.Color('#7C96D6'),
      hemiGround: new THREE.Color('#222B45'),
      hemiIntensity: 0.75,
      sunPosition: new THREE.Vector3(-26, 12, -24),
      nightFactor: 0.55 + t * 0.4,
      goldenFactor: 0.4 * (1 - t),
      labelZh: '蓝调时刻 · Blue Hour',
    };
  }
  return {
    skyTop: new THREE.Color('#070B19'),
    skyBottom: new THREE.Color('#19274C'),
    fogColor: new THREE.Color('#111B36'),
    waterColor: new THREE.Color('#14284A'),
    waterDeepColor: new THREE.Color('#091124'),
    sunColor: new THREE.Color('#9BB8FF'),
    sunIntensity: 0.75,
    hemiSky: new THREE.Color('#4F6BA8'),
    hemiGround: new THREE.Color('#141E30'),
    hemiIntensity: 0.65,
    sunPosition: new THREE.Vector3(-18, 28, -22),
    nightFactor: 1.0,
    goldenFactor: 0,
    labelZh: '星野篝火 · Starlight Night',
  };
}

// ============================================================================
// High-Detail Stylized 3D Model Builders
// ============================================================================
function buildSculptedIslandMesh(
  center: Vec3,
  radius: number,
  rockDepth: number,
  topGrassHex: string,
  beachRimHex: string
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(center.x, center.y, center.z);

  const grassGeo = new THREE.CylinderGeometry(radius * 0.94, radius * 1.0, 0.7, 48, 8);
  const posAttr = grassGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    const dist = Math.hypot(vx, vz);
    const norm = Math.min(1, dist / radius);

    const angle = Math.atan2(vz, vx);
    const coastWave =
      1 +
      Math.sin(angle * 5 + center.x) * 0.035 +
      Math.cos(angle * 8 - center.z) * 0.025;

    posAttr.setX(i, vx * coastWave);
    posAttr.setZ(i, vz * coastWave);

    if (vy > 0) {
      const dome = Math.cos(norm * Math.PI * 0.5) * 0.42;
      const hill =
        Math.sin((vx + center.x) * 0.55) *
        Math.cos((vz + center.z) * 0.55) *
        0.09 *
        (1 - norm);
      posAttr.setY(i, vy + dome + hill);
    }
  }
  grassGeo.computeVertexNormals();

  const grassMat = new THREE.MeshStandardMaterial({
    color: topGrassHex,
    roughness: 0.84,
    metalness: 0.04,
  });
  const grassMesh = new THREE.Mesh(grassGeo, grassMat);
  grassMesh.castShadow = true;
  grassMesh.receiveShadow = true;
  grassMesh.position.y = -0.32;
  group.add(grassMesh);

  const rimGeo = new THREE.CylinderGeometry(radius * 1.0, radius * 0.95, 0.55, 40, 2);
  const rimPos = rimGeo.attributes.position;
  for (let i = 0; i < rimPos.count; i++) {
    const vx = rimPos.getX(i);
    const vz = rimPos.getZ(i);
    const angle = Math.atan2(vz, vx);
    const w = 1 + Math.sin(angle * 5 + center.x) * 0.035 + Math.cos(angle * 8 - center.z) * 0.025;
    rimPos.setX(i, vx * w);
    rimPos.setZ(i, vz * w);
  }
  rimGeo.computeVertexNormals();
  const rimMat = new THREE.MeshStandardMaterial({
    color: beachRimHex,
    roughness: 0.9,
    metalness: 0.02,
  });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.position.y = -0.85;
  rimMesh.castShadow = true;
  rimMesh.receiveShadow = true;
  group.add(rimMesh);

  const cliffGeo = new THREE.ConeGeometry(radius * 0.94, rockDepth, 22, 6);
  cliffGeo.rotateX(Math.PI);
  const cliffPos = cliffGeo.attributes.position;
  for (let i = 0; i < cliffPos.count; i++) {
    const vx = cliffPos.getX(i);
    const vy = cliffPos.getY(i);
    const vz = cliffPos.getZ(i);
    const angle = Math.atan2(vz, vx);
    const crag =
      1 +
      Math.sin(angle * 6 + vy * 1.3) * 0.08 +
      Math.cos(angle * 11 - vy * 0.9) * 0.05;
    cliffPos.setX(i, vx * crag);
    cliffPos.setZ(i, vz * crag);
  }
  cliffGeo.computeVertexNormals();
  const cliffMat = new THREE.MeshStandardMaterial({
    color: '#7E6F64',
    roughness: 0.94,
    metalness: 0.05,
    flatShading: true,
  });
  const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
  cliffMesh.position.y = -1.1 - rockDepth * 0.5;
  cliffMesh.castShadow = true;
  cliffMesh.receiveShadow = true;
  group.add(cliffMesh);

  return group;
}

function buildDetailedTree(
  pos: Vec3,
  scale: number,
  type: 'pine' | 'ginkgo' | 'sakura' | 'oak',
  palette: [string, string, string]
): THREE.Group {
  const tree = new THREE.Group();
  tree.position.set(pos.x, pos.y, pos.z);
  tree.scale.setScalar(scale);

  const trunkMat = new THREE.MeshStandardMaterial({
    color: '#6E4F3A',
    roughness: 0.92,
  });

  const trunkGeo = new THREE.CylinderGeometry(0.14, 0.26, 1.35, 10);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.65;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  if (type === 'pine') {
    const tiers = [
      { y: 1.35, r: 1.15, h: 1.15, c: palette[2] },
      { y: 2.0, r: 0.92, h: 1.05, c: palette[1] },
      { y: 2.6, r: 0.68, h: 0.95, c: palette[0] },
      { y: 3.1, r: 0.42, h: 0.75, c: palette[0] },
    ];
    tiers.forEach((t, idx) => {
      const coneGeo = new THREE.ConeGeometry(t.r, t.h, 12);
      const coneMat = new THREE.MeshStandardMaterial({
        color: t.c,
        roughness: 0.82,
        flatShading: true,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = t.y;
      cone.rotation.y = idx * 0.4;
      cone.castShadow = true;
      cone.receiveShadow = true;
      tree.add(cone);
    });
  } else {
    const branchGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.75, 8);
    const branchL = new THREE.Mesh(branchGeo, trunkMat);
    branchL.position.set(-0.28, 1.3, 0.1);
    branchL.rotation.z = 0.55;
    tree.add(branchL);

    const branchR = new THREE.Mesh(branchGeo, trunkMat);
    branchR.position.set(0.3, 1.25, -0.1);
    branchR.rotation.z = -0.5;
    tree.add(branchR);

    const puffs: { x: number; y: number; z: number; r: number; c: string }[] = [
      { x: 0, y: 2.25, z: 0, r: 0.95, c: palette[0] },
      { x: -0.62, y: 1.85, z: 0.25, r: 0.72, c: palette[1] },
      { x: 0.65, y: 1.8, z: -0.2, r: 0.74, c: palette[1] },
      { x: 0.15, y: 1.9, z: 0.62, r: 0.68, c: palette[2] },
      { x: -0.2, y: 1.95, z: -0.6, r: 0.66, c: palette[2] },
      { x: 0, y: 2.75, z: 0, r: 0.62, c: palette[0] },
    ];

    puffs.forEach((pf) => {
      const puffGeo = new THREE.IcosahedronGeometry(pf.r, 2);
      const puffMat = new THREE.MeshStandardMaterial({
        color: pf.c,
        roughness: 0.78,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(puffGeo, puffMat);
      mesh.position.set(pf.x, pf.y, pf.z);
      mesh.scale.set(1.08, 0.88, 1.08);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      tree.add(mesh);
    });
  }

  return tree;
}

function buildDetailedWindmill(pos: Vec3): { group: THREE.Group; rotor: THREE.Group } {
  const group = new THREE.Group();
  group.position.set(pos.x, pos.y, pos.z);

  const stoneMat = new THREE.MeshStandardMaterial({ color: '#9E9589', roughness: 0.92, flatShading: true });
  const whiteWallMat = new THREE.MeshStandardMaterial({ color: '#FAF6EE', roughness: 0.78 });
  const timberMat = new THREE.MeshStandardMaterial({ color: '#8C5A32', roughness: 0.85 });
  const roofMat = new THREE.MeshStandardMaterial({ color: '#C84B31', roughness: 0.75 });
  const sailClothMat = new THREE.MeshStandardMaterial({
    color: '#FFF8E7',
    roughness: 0.65,
    side: THREE.DoubleSide,
  });

  const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.62, 1.15, 8), stoneMat);
  baseMesh.position.y = 0.55;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  const deckMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.78, 1.78, 0.12, 16), timberMat);
  deckMesh.position.y = 1.15;
  deckMesh.castShadow = true;
  group.add(deckMesh);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 6), timberMat);
    post.position.set(Math.cos(a) * 1.68, 1.38, Math.sin(a) * 1.68);
    group.add(post);
  }
  const railRing = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.04, 8, 24), timberMat);
  railRing.rotation.x = Math.PI / 2;
  railRing.position.y = 1.6;
  group.add(railRing);

  const towerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 1.35, 2.65, 12), whiteWallMat);
  towerMesh.position.y = 2.45;
  towerMesh.castShadow = true;
  towerMesh.receiveShadow = true;
  group.add(towerMesh);

  const windowMat = new THREE.MeshStandardMaterial({
    color: '#FFE082',
    emissive: '#FF9800',
    emissiveIntensity: 0.6,
  });
  const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.12), windowMat);
  win1.position.set(0, 2.2, 1.15);
  group.add(win1);

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.85, 0.12), timberMat);
  door.position.set(0, 0.55, 1.48);
  group.add(door);

  const capMesh = new THREE.Mesh(new THREE.ConeGeometry(1.12, 1.25, 12), roofMat);
  capMesh.position.y = 4.35;
  capMesh.castShadow = true;
  group.add(capMesh);

  const rotor = new THREE.Group();
  rotor.position.set(0, 3.45, 1.12);

  const hubMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.45, 12), timberMat);
  hubMesh.rotation.x = Math.PI / 2;
  rotor.add(hubMesh);

  for (let i = 0; i < 4; i++) {
    const bladeGroup = new THREE.Group();
    bladeGroup.rotation.z = (i * Math.PI) / 2;

    const spar = new THREE.Mesh(new THREE.BoxGeometry(0.11, 2.75, 0.11), timberMat);
    spar.position.y = 1.38;
    spar.castShadow = true;
    bladeGroup.add(spar);

    const sail = new THREE.Mesh(new THREE.BoxGeometry(0.58, 2.15, 0.03), sailClothMat);
    sail.position.set(0.34, 1.58, 0.02);
    sail.rotation.y = 0.14;
    sail.castShadow = true;
    bladeGroup.add(sail);

    for (let r = 0; r < 5; r++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 0.05), timberMat);
      rib.position.set(0.32, 0.65 + r * 0.45, 0.03);
      rib.rotation.y = 0.14;
      bladeGroup.add(rib);
    }

    rotor.add(bladeGroup);
  }

  group.add(rotor);
  return { group, rotor };
}

function buildLighthouseAndDarkroom(
  lighthousePos: Vec3,
  cabinPos: Vec3
): { group: THREE.Group; searchlightGroup: THREE.Group } {
  const group = new THREE.Group();

  const lh = new THREE.Group();
  lh.position.set(lighthousePos.x, lighthousePos.y, lighthousePos.z);

  const redMat = new THREE.MeshStandardMaterial({ color: '#D94E3B', roughness: 0.72 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: '#FAF8F5', roughness: 0.72 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: '#2B303A', roughness: 0.4, metalness: 0.6 });
  const glassGlowMat = new THREE.MeshStandardMaterial({
    color: '#FFF8D6',
    emissive: '#FFCA28',
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });

  const rockBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.38, 1.58, 0.8, 12),
    new THREE.MeshStandardMaterial({ color: '#7D746B', roughness: 0.92, flatShading: true })
  );
  rockBase.position.y = 0.4;
  rockBase.castShadow = true;
  lh.add(rockBase);

  const sections = [
    { y: 1.35, rTop: 1.18, rBot: 1.32, h: 1.1, mat: whiteMat },
    { y: 2.45, rTop: 1.04, rBot: 1.18, h: 1.1, mat: redMat },
    { y: 3.55, rTop: 0.9, rBot: 1.04, h: 1.1, mat: whiteMat },
    { y: 4.55, rTop: 0.8, rBot: 0.9, h: 0.9, mat: redMat },
  ];
  sections.forEach((s) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(s.rTop, s.rBot, s.h, 20), s.mat);
    m.position.y = s.y;
    m.castShadow = true;
    m.receiveShadow = true;
    lh.add(m);
  });

  const galleryDeck = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.05, 0.14, 20), darkMetalMat);
  galleryDeck.position.y = 5.05;
  lh.add(galleryDeck);

  const railTorus = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.035, 8, 24), darkMetalMat);
  railTorus.rotation.x = Math.PI / 2;
  railTorus.position.y = 5.42;
  lh.add(railTorus);

  const lanternCore = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.85, 16), glassGlowMat);
  lanternCore.position.y = 5.52;
  lh.add(lanternCore);

  const domeRoof = new THREE.Mesh(new THREE.ConeGeometry(0.84, 0.85, 16), redMat);
  domeRoof.position.y = 6.32;
  lh.add(domeRoof);

  const searchlightGroup = new THREE.Group();
  searchlightGroup.position.set(0, 5.52, 0);

  const coneGeo = new THREE.ConeGeometry(2.8, 14, 20, 1, true);
  coneGeo.translate(0, -7, 0);
  coneGeo.rotateZ(Math.PI / 2);
  const coneMat = new THREE.MeshBasicMaterial({
    color: '#FFE57F',
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lightConeMesh = new THREE.Mesh(coneGeo, coneMat);
  searchlightGroup.add(lightConeMesh);
  lh.add(searchlightGroup);

  group.add(lh);

  const cabin = new THREE.Group();
  cabin.position.set(cabinPos.x, cabinPos.y, cabinPos.z);
  cabin.rotation.y = 0.28;

  const logWallMat = new THREE.MeshStandardMaterial({ color: '#7D4E2D', roughness: 0.88 });
  const roofShingleMat = new THREE.MeshStandardMaterial({ color: '#3E2F28', roughness: 0.85 });
  const warmWindowMat = new THREE.MeshStandardMaterial({
    color: '#FFCC80',
    emissive: '#FF8F00',
    emissiveIntensity: 1.35,
  });

  const deck = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.2, 2.9), logWallMat);
  deck.position.y = 0.1;
  deck.castShadow = true;
  deck.receiveShadow = true;
  cabin.add(deck);

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.75, 2.2), logWallMat);
  body.position.y = 0.98;
  body.castShadow = true;
  body.receiveShadow = true;
  cabin.add(body);

  const roofGeo = new THREE.ConeGeometry(2.35, 1.35, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, roofShingleMat);
  roof.position.y = 2.52;
  roof.scale.set(1.08, 1, 0.95);
  roof.castShadow = true;
  cabin.add(roof);

  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 1.1, 0.42),
    new THREE.MeshStandardMaterial({ color: '#A84A3B', roughness: 0.9 })
  );
  chimney.position.set(0.75, 2.65, -0.45);
  cabin.add(chimney);

  const frontWin = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.62, 0.12), warmWindowMat);
  frontWin.position.set(-0.45, 1.05, 1.1);
  cabin.add(frontWin);

  const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 0.85), warmWindowMat);
  sideWin.position.set(1.35, 1.05, 0);
  cabin.add(sideWin);

  for (let b = 0; b < 7; b++) {
    const t = b / 6;
    const bx = THREE.MathUtils.lerp(cabinPos.x - 1.0, lighthousePos.x + 1.0, t);
    const bz = THREE.MathUtils.lerp(cabinPos.z + 0.8, lighthousePos.z + 0.8, t);
    const sag = Math.sin(t * Math.PI) * 0.45;
    const by = 2.35 - sag;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), warmWindowMat);
    bulb.position.set(bx, by, bz);
    group.add(bulb);
  }

  group.add(cabin);
  return { group, searchlightGroup };
}

function buildPhotoEaselMesh(easel: EaselNode): {
  group: THREE.Group;
  photoPlane: THREE.Mesh;
  frameMat: THREE.MeshStandardMaterial;
} {
  const group = new THREE.Group();
  group.position.set(easel.pos.x, easel.pos.y, easel.pos.z);
  group.rotation.y = easel.facingYaw;

  const woodColor =
    easel.frameStyle === 'darkroom'
      ? '#4A3525'
      : easel.frameStyle === 'starlight'
        ? '#5C6BC0'
        : '#C8925A';
  const woodMat = new THREE.MeshStandardMaterial({
    color: woodColor,
    roughness: 0.78,
  });

  const legGeo = new THREE.CylinderGeometry(0.045, 0.055, 2.25, 10);

  const leftLeg = new THREE.Mesh(legGeo, woodMat);
  leftLeg.position.set(-0.55, 1.05, 0.08);
  leftLeg.rotation.z = -0.14;
  leftLeg.rotation.x = -0.08;
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, woodMat);
  rightLeg.position.set(0.55, 1.05, 0.08);
  rightLeg.rotation.z = 0.14;
  rightLeg.rotation.x = -0.08;
  rightLeg.castShadow = true;
  group.add(rightLeg);

  const rearLeg = new THREE.Mesh(legGeo, woodMat);
  rearLeg.position.set(0, 1.0, -0.48);
  rearLeg.rotation.x = 0.34;
  rearLeg.castShadow = true;
  group.add(rearLeg);

  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.09, 0.22), woodMat);
  shelf.position.set(0, 0.82, 0.16);
  shelf.castShadow = true;
  group.add(shelf);

  const frameMat = new THREE.MeshStandardMaterial({
    color: '#FAF8F5',
    roughness: 0.6,
    emissive: '#F59E0B',
    emissiveIntensity: 0.05,
  });
  const frameBacking = new THREE.Mesh(new THREE.BoxGeometry(1.86, 1.38, 0.09), frameMat);
  frameBacking.position.set(0, 1.52, 0.12);
  frameBacking.rotation.x = -0.06;
  frameBacking.castShadow = true;
  frameBacking.receiveShadow = true;
  group.add(frameBacking);

  // Instant procedural painting texture so easels are never blank
  const artCanvas = document.createElement('canvas');
  artCanvas.width = 256;
  artCanvas.height = 180;
  const artCtx = artCanvas.getContext('2d');
  if (artCtx) {
    const grad = artCtx.createLinearGradient(0, 0, 0, 180);
    if (easel.frameStyle === 'forest') {
      grad.addColorStop(0, '#A7F3D0');
      grad.addColorStop(0.55, '#F6BD60');
      grad.addColorStop(1, '#2D6A4F');
    } else if (easel.frameStyle === 'darkroom') {
      grad.addColorStop(0, '#1E1B4B');
      grad.addColorStop(0.55, '#F43F5E');
      grad.addColorStop(1, '#0F172A');
    } else if (easel.frameStyle === 'starlight') {
      grad.addColorStop(0, '#090D16');
      grad.addColorStop(0.6, '#312E81');
      grad.addColorStop(1, '#1E293B');
    } else {
      grad.addColorStop(0, '#FDBA74');
      grad.addColorStop(0.5, '#F97316');
      grad.addColorStop(1, '#1E3A8A');
    }
    artCtx.fillStyle = grad;
    artCtx.fillRect(0, 0, 256, 180);

    artCtx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    artCtx.beginPath();
    artCtx.arc(180, 56, 22, 0, Math.PI * 2);
    artCtx.fill();

    artCtx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    artCtx.beginPath();
    artCtx.moveTo(0, 180);
    artCtx.lineTo(65, 105);
    artCtx.lineTo(135, 138);
    artCtx.lineTo(205, 95);
    artCtx.lineTo(256, 130);
    artCtx.lineTo(256, 180);
    artCtx.closePath();
    artCtx.fill();

    artCtx.fillStyle = '#FFFFFF';
    artCtx.font = 'bold 14px sans-serif';
    artCtx.fillText(easel.locationZh, 14, 164);
  }
  const fallbackTex = new THREE.CanvasTexture(artCanvas);
  fallbackTex.colorSpace = THREE.SRGBColorSpace;

  const photoMat = new THREE.MeshBasicMaterial({
    map: fallbackTex,
    color: '#FFFFFF',
  });
  const photoPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.66, 1.18), photoMat);
  photoPlane.position.set(0, 1.52, 0.175);
  photoPlane.rotation.x = -0.06;
  group.add(photoPlane);

  const clamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.12, 0.15),
    new THREE.MeshStandardMaterial({ color: '#D4AF37', roughness: 0.35, metalness: 0.7 })
  );
  clamp.position.set(0, 2.22, 0.08);
  group.add(clamp);

  return { group, photoPlane, frameMat };
}

function buildPhotographerAvatar(): {
  root: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
} {
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: '#FFE3D3', roughness: 0.65 });
  const ponchoMat = new THREE.MeshStandardMaterial({ color: '#E06348', roughness: 0.78 });
  const scarfMat = new THREE.MeshStandardMaterial({ color: '#F4D35E', roughness: 0.75 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: '#2F3E46', roughness: 0.85 });
  const hatMat = new THREE.MeshStandardMaterial({ color: '#F3C66F', roughness: 0.8 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: '#8A5229', roughness: 0.75 });
  const silverMetal = new THREE.MeshStandardMaterial({ color: '#E5E7EB', roughness: 0.3, metalness: 0.75 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: '#1F2937', roughness: 0.4, metalness: 0.5 });

  const legGeo = new THREE.CapsuleGeometry(0.09, 0.26, 6, 12);
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.14, 0.25, 0);
  leftLeg.castShadow = true;
  root.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.14, 0.25, 0);
  rightLeg.castShadow = true;
  root.add(rightLeg);

  const torso = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.76, 16), ponchoMat);
  torso.position.y = 0.72;
  torso.castShadow = true;
  root.add(torso);

  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.065, 10, 20), scarfMat);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.y = 1.05;
  root.add(scarf);

  const armGeo = new THREE.CapsuleGeometry(0.075, 0.28, 6, 10);
  const leftArm = new THREE.Mesh(armGeo, ponchoMat);
  leftArm.position.set(-0.34, 0.82, 0.06);
  leftArm.rotation.z = 0.28;
  leftArm.castShadow = true;
  root.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, ponchoMat);
  rightArm.position.set(0.34, 0.82, 0.06);
  rightArm.rotation.z = -0.28;
  rightArm.castShadow = true;
  root.add(rightArm);

  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.24), leatherMat);
  backpack.position.set(0, 0.78, -0.26);
  backpack.castShadow = true;
  root.add(backpack);

  const bedroll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.48, 12),
    new THREE.MeshStandardMaterial({ color: '#52B788', roughness: 0.8 })
  );
  bedroll.rotation.z = Math.PI / 2;
  bedroll.position.set(0, 1.06, -0.26);
  root.add(bedroll);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), skinMat);
  head.position.y = 1.28;
  head.castShadow = true;
  root.add(head);

  const eyeGeo = new THREE.SphereGeometry(0.032, 8, 8);
  const leftEye = new THREE.Mesh(eyeGeo, darkMetal);
  leftEye.position.set(-0.09, 1.3, 0.23);
  root.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, darkMetal);
  rightEye.position.set(0.09, 1.3, 0.23);
  root.add(rightEye);

  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.56, 0.04, 24), hatMat);
  hatBrim.position.y = 1.46;
  hatBrim.castShadow = true;
  root.add(hatBrim);

  const hatRibbon = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.3, 0.07, 20), ponchoMat);
  hatRibbon.position.y = 1.51;
  root.add(hatRibbon);

  const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.29, 0.22, 20), hatMat);
  hatCrown.position.y = 1.6;
  hatCrown.castShadow = true;
  root.add(hatCrown);

  const camGroup = new THREE.Group();
  camGroup.position.set(0, 0.84, 0.34);

  const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.14), darkMetal);
  camGroup.add(camBody);

  const camTopPlate = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.145), silverMetal);
  camTopPlate.position.y = 0.075;
  camGroup.add(camTopPlate);

  const camLens = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.12, 16), silverMetal);
  camLens.rotation.x = Math.PI / 2;
  camLens.position.z = 0.09;
  camGroup.add(camLens);

  root.add(camGroup);

  return { root, leftLeg, rightLeg, leftArm, rightArm };
}

// ============================================================================
// Main Component: ShutterIsland3D
// ============================================================================
interface ShutterIsland3DProps {
  embedded?: boolean;
  onExit?: () => void;
}

export const ShutterIsland3D: React.FC<ShutterIsland3DProps> = ({ embedded = false, onExit }) => {
  const { photos } = usePhotoContext();
  const { theme, toggleTheme } = useTheme();
  const { td } = useI18n();
  const navigate = useNavigate();

  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const filmstripRef = useRef<HTMLDivElement | null>(null);

  const [timeOfDay, setTimeOfDay] = useState<number>(17.4);
  const [viewfinderMode, setViewfinderMode] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [activeZoneId, setActiveZoneId] = useState<string>('meadow');
  const [showControlsHint, setShowControlsHint] = useState<boolean>(false);
  const [showTimePanel, setShowTimePanel] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [joyKnob, setJoyKnob] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const joyBaseRef = useRef<HTMLDivElement | null>(null);
  const joyPointerIdRef = useRef<number | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartCamDistRef = useRef<number>(17.5);

  const [selectedEasel, setSelectedEasel] = useState<EaselNode | null>(null);
  const [activeStation, setActiveStation] = useState<SpecialStation['id'] | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<PersonalMemoryNode | null>(null);
  const [memoryPhotoIdx, setMemoryPhotoIdx] = useState<number>(0);
  const [showMemoryIndex, setShowMemoryIndex] = useState<boolean>(false);
  const [underwaterMode, setUnderwaterMode] = useState<boolean>(false);
  const [discoveredMemoryIds, setDiscoveredMemoryIds] = useState<string[]>([]);
  const [unlockedMemoryIds, setUnlockedMemoryIds] = useState<string[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const raw = sessionStorage.getItem('shutter_island_unlocked_memories');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [passphraseInput, setPassphraseInput] = useState<string>('');
  const [passphraseError, setPassphraseError] = useState<boolean>(false);
  const [nearbyPrompt, setNearbyPrompt] = useState<{
    type: 'easel' | 'station' | 'memory';
    id: string;
    titleZh: string;
    subZh: string;
  } | null>(null);

  const [hoveredLabel, setHoveredLabel] = useState<{
    x: number;
    y: number;
    title: string;
    subtitle: string;
  } | null>(null);

  const [shutterFlash, setShutterFlash] = useState<boolean>(false);
  const [capturedPostcards, setCapturedPostcards] = useState<
    { id: number; dataUrl: string; timeLabel: string; zoneLabel: string }[]
  >([]);
  const [previewPostcard, setPreviewPostcard] = useState<{
    id: number;
    dataUrl: string;
    timeLabel: string;
    zoneLabel: string;
  } | null>(null);

  const [discoveredIds, setDiscoveredIds] = useState<string[]>(['easel-1']);

  const [driftBottles, setDriftBottles] = useState([
    {
      id: 1,
      author: '旅人 #104 · 杭州',
      text: '把黄金时刻调到 17:45，海面上的波光和森林画架太治愈了！',
      date: '2026.11',
    },
    {
      id: 2,
      author: '摄影同好 · 长沙',
      text: '湘江落日余晖那张的色调绝了，3D 小岛漫步看展的体验比传统网页舒服太多。',
      date: '2026.11',
    },
    {
      id: 3,
      author: 'AIFA Lab 访客',
      text: '在山顶篝火旁既看到了夜景摄影，又翻到了禾书耕文的技术架构，文理兼修！',
      date: '2026.11',
    },
  ]);
  const [newBottleText, setNewBottleText] = useState('');
  const [newBottleAuthor, setNewBottleAuthor] = useState('');

  const simRef = useRef({
    timeOfDay: 17.4,
    playerPos: new THREE.Vector3(0, 0.95, 3.2),
    playerYaw: Math.PI,
    playerWalkCycle: 0,
    playerTarget: null as THREE.Vector3 | null,

    camFocus: new THREE.Vector3(0, 1.3, 1.5),
    camTargetFocus: new THREE.Vector3(0, 1.3, 1.5),
    camYaw: -0.32,
    camTargetYaw: -0.32,
    camPitch: 0.42,
    camTargetPitch: 0.42,
    camDist: 17.5,
    camTargetDist: 17.5,

    keys: {} as Record<string, boolean>,
    joyX: 0,
    joyY: 0,
    isDragging: false,
    dragMoved: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartYaw: 0,
    dragStartPitch: 0,

    photoPlanes: [] as {
      easelId: string;
      photoIndex: number;
      mesh: THREE.Mesh;
      frameMat: THREE.MeshStandardMaterial;
    }[],
    interactiveMeshes: [] as {
      kind: 'easel' | 'station' | 'memory';
      id: string;
      mesh: THREE.Object3D;
      worldPos: Vec3;
    }[],
    terrainMeshes: [] as THREE.Object3D[],
    camera: null as THREE.PerspectiveCamera | null,
    underwaterMode: false,
    underwaterBlend: 0,
  });

  useEffect(() => {
    simRef.current.timeOfDay = timeOfDay;
  }, [timeOfDay]);

  useEffect(() => {
    simRef.current.underwaterMode = underwaterMode;
  }, [underwaterMode]);

  const surfaceFromUnderwater = useCallback(() => {
    playWindChimeNote(2, soundMuted);
    setUnderwaterMode(false);
    const freediveMem = PERSONAL_MEMORIES.find((m) => m.id === 'freedive-crimson');
    const sim = simRef.current;
    if (freediveMem) {
      sim.camTargetFocus.set(freediveMem.pos.x + 1.8, 0.8, freediveMem.pos.z);
      sim.camTargetPitch = 0.42;
      sim.camTargetDist = 14.5;
    }
  }, [soundMuted]);

  const inspectEasel = useCallback(
    (easel: EaselNode) => {
      playCameraShutterSound(soundMuted);
      setUnderwaterMode(false);
      setSelectedEasel(easel);
      setActiveStation(null);
      setSelectedMemory(null);
      setDiscoveredIds((prev) => (prev.includes(easel.id) ? prev : [...prev, easel.id]));

      const sim = simRef.current;
      sim.playerTarget = new THREE.Vector3(
        easel.pos.x + Math.sin(easel.facingYaw) * 2.1,
        easel.pos.y,
        easel.pos.z + Math.cos(easel.facingYaw) * 2.1
      );
      sim.camTargetFocus.set(easel.pos.x, easel.pos.y + 1.3, easel.pos.z);
      sim.camTargetDist = 11.5;
    },
    [soundMuted]
  );

  const inspectMemory = useCallback(
    (mem: PersonalMemoryNode, openModal = true) => {
      playWindChimeNote(3, soundMuted);
      setSelectedEasel(null);
      setActiveStation(null);
      setActiveZoneId(mem.zoneId);
      setMemoryPhotoIdx(0);
      setPassphraseError(false);
      setDiscoveredMemoryIds((prev) => (prev.includes(mem.id) ? prev : [...prev, mem.id]));
      if (openModal) {
        setSelectedMemory(mem);
      } else {
        setSelectedMemory(null);
      }

      const sim = simRef.current;
      if (mem.id === 'freedive-crimson') {
        // Dive directly underwater to experience the submerged freediving pool!
        setUnderwaterMode(true);
        sim.playerPos.set(mem.pos.x + 4.4, 0.2, mem.pos.z + 1.2);
        sim.playerYaw = -Math.PI / 2;
        sim.playerTarget = null;
        sim.camTargetFocus.set(mem.pos.x, -3.35, mem.pos.z);
        sim.camTargetYaw = mem.rotY + 0.08;
        sim.camTargetPitch = -0.08;
        sim.camTargetDist = 8.4;
      } else if (mem.id === 'yzfls-campus') {
        setUnderwaterMode(false);
        const standDist = Math.max(5.8, mem.islandRadius - 1.5);
        const tx = mem.islandCenter.x + Math.sin(mem.rotY) * standDist;
        const tz = mem.islandCenter.z + Math.cos(mem.rotY) * standDist;
        sim.playerPos.set(tx, mem.islandCenter.y + 0.14, tz);
        sim.playerYaw = mem.rotY + Math.PI;
        sim.playerTarget = null;
        sim.camTargetFocus.set(mem.pos.x, mem.pos.y + 3.05, mem.pos.z + 0.4);
        sim.camTargetYaw = mem.rotY + 0.04;
        sim.camTargetPitch = 0.2;
        sim.camTargetDist = 14.8;
      } else if (mem.id === 'gramophone-lounge') {
        setUnderwaterMode(false);
        const standDist = Math.max(4.8, mem.islandRadius - 1.5);
        const tx = mem.islandCenter.x + Math.sin(mem.rotY) * standDist;
        const tz = mem.islandCenter.z + Math.cos(mem.rotY) * standDist;
        sim.playerPos.set(tx, mem.islandCenter.y + 0.14, tz);
        sim.playerYaw = mem.rotY + Math.PI;
        sim.playerTarget = null;
        sim.camTargetFocus.set(mem.pos.x, mem.pos.y + 1.55, mem.pos.z);
        sim.camTargetYaw = mem.rotY - 0.24;
        sim.camTargetPitch = 0.26;
        sim.camTargetDist = 11.6;
      } else if (mem.id === 'winter-bros') {
        setUnderwaterMode(false);
        const standDist = Math.max(4.6, mem.islandRadius - 1.5);
        const tx = mem.islandCenter.x + Math.sin(mem.rotY) * standDist;
        const tz = mem.islandCenter.z + Math.cos(mem.rotY) * standDist;
        sim.playerPos.set(tx, mem.islandCenter.y + 0.14, tz);
        sim.playerYaw = mem.rotY + Math.PI;
        sim.playerTarget = null;
        sim.camTargetFocus.set(mem.pos.x, mem.pos.y + 1.85, mem.pos.z);
        sim.camTargetYaw = mem.rotY + 0.04;
        sim.camTargetPitch = 0.16;
        sim.camTargetDist = 9.8;
      } else {
        setUnderwaterMode(false);
        const standDist = Math.max(4.5, mem.islandRadius - 1.6);
        const tx = mem.islandCenter.x + Math.sin(mem.rotY) * standDist;
        const tz = mem.islandCenter.z + Math.cos(mem.rotY) * standDist;
        sim.playerPos.set(tx, mem.islandCenter.y + 0.14, tz);
        sim.playerYaw = mem.rotY + Math.PI;
        sim.playerTarget = null;
        sim.camTargetFocus.set(mem.pos.x, mem.pos.y + 2.2, mem.pos.z);
        sim.camTargetYaw = mem.rotY + 0.12;
        sim.camTargetPitch = 0.34;
        sim.camTargetDist = 15.5;
      }
    },
    [soundMuted]
  );

  const handleUnlockMemories = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedMemory) return;
      const answer = passphraseInput.trim().toLowerCase();
      const matched = selectedMemory.unlockAnswers.some((a) => a.toLowerCase() === answer);
      if (matched) {
        playWindChimeNote(4, soundMuted);
        setUnlockedMemoryIds((prev) => {
          const next = prev.includes(selectedMemory.id) ? prev : [...prev, selectedMemory.id];
          try {
            sessionStorage.setItem('shutter_island_unlocked_memories', JSON.stringify(next));
          } catch {
            // Ignore storage error
          }
          return next;
        });
        setPassphraseError(false);
        setPassphraseInput('');
      } else {
        playTactileClick(280);
        setPassphraseError(true);
      }
    },
    [passphraseInput, selectedMemory, soundMuted]
  );

  const handleLockMemories = useCallback(() => {
    if (!selectedMemory) return;
    playTactileClick(460);
    setUnlockedMemoryIds((prev) => {
      const next = prev.filter((id) => id !== selectedMemory.id);
      try {
        sessionStorage.setItem('shutter_island_unlocked_memories', JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  }, [selectedMemory]);

  const teleportToZone = useCallback(
    (zone: IslandZone, noteIdx = 0) => {
      playWindChimeNote(noteIdx, soundMuted);
      setUnderwaterMode(false);
      setActiveZoneId(zone.id);
      setSelectedEasel(null);
      setActiveStation(null);
      setSelectedMemory(null);

      const sim = simRef.current;
      const ground = getTerrainHeightAt(zone.center.x, zone.center.z + 2.0);
      sim.playerPos.set(zone.center.x, ground.y, zone.center.z + 2.0);
      sim.playerTarget = null;
      sim.camTargetFocus.set(zone.center.x, zone.center.y + 1.1, zone.center.z);
      sim.camTargetDist = zone.id === 'summit' ? 15.0 : 17.5;
      sim.camTargetPitch = 0.42;
    },
    [soundMuted]
  );

  const captureIslandPostcard = useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    playCameraShutterSound(soundMuted);
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 260);

    try {
      const dataUrl = renderer.domElement.toDataURL('image/png');
      const atmo = computeAtmosphere(timeOfDay);
      const zone = ISLAND_ZONES.find((z) => z.id === activeZoneId) || ISLAND_ZONES[0];
      const item = {
        id: Date.now(),
        dataUrl,
        timeLabel: `${Math.floor(timeOfDay).toString().padStart(2, '0')}:${Math.floor((timeOfDay % 1) * 60)
          .toString()
          .padStart(2, '0')} · ${atmo.labelZh.split(' · ')[0]}`,
        zoneLabel: zone.nameZh.replace(/^\d+\s*·\s*/, ''),
      };
      setCapturedPostcards((prev) => [item, ...prev.slice(0, 5)]);
      setPreviewPostcard(item);
    } catch {
      // Ignore
    }
  }, [soundMuted, timeOfDay, activeZoneId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      simRef.current.keys[key] = true;

      if (key === 'v') {
        playTactileClick(740);
        setViewfinderMode((v) => !v);
      } else if (key === 'e' && nearbyPrompt) {
        e.preventDefault();
        if (nearbyPrompt.type === 'easel') {
          const found = EASEL_CONFIGS.find((ea) => ea.id === nearbyPrompt.id);
          if (found) inspectEasel(found);
        } else if (nearbyPrompt.type === 'memory') {
          const foundMem = PERSONAL_MEMORIES.find((m) => m.id === nearbyPrompt.id);
          if (foundMem) inspectMemory(foundMem);
        } else if (nearbyPrompt.type === 'station') {
          playWindChimeNote(2, soundMuted);
          setActiveStation(nearbyPrompt.id as SpecialStation['id']);
        }
      } else if (e.code === 'Space' && viewfinderMode && !selectedEasel && !selectedMemory) {
        e.preventDefault();
        captureIslandPostcard();
      } else if (key === 'escape') {
        setSelectedEasel(null);
        setActiveStation(null);
        setSelectedMemory(null);
        setPreviewPostcard(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      simRef.current.keys[key] = false;
    };

    const handleWindowBlur = () => {
      simRef.current.keys = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [nearbyPrompt, viewfinderMode, selectedEasel, selectedMemory, inspectEasel, inspectMemory, captureIslandPostcard, soundMuted]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const fog = new THREE.FogExp2('#FAD4B8', 0.0046);
    scene.fog = fog;

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.5, 380);
    simRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const skyGeo = new THREE.SphereGeometry(210, 32, 20);
    const skyUniforms = {
      topColor: { value: new THREE.Color('#3D2E5E') },
      bottomColor: { value: new THREE.Color('#FF7A45') },
      sunDir: { value: new THREE.Vector3(-0.7, 0.35, -0.4).normalize() },
      sunColor: { value: new THREE.Color('#FF9E5E') },
    };
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: skyUniforms,
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 sunDir;
        uniform vec3 sunColor;
        varying vec3 vWorldPos;
        void main() {
          vec3 dir = normalize(vWorldPos);
          float h = clamp(dir.y * 1.4 + 0.15, 0.001, 1.0);
          vec3 col = mix(bottomColor, topColor, pow(h, 0.72));
          float sunAmt = max(dot(dir, normalize(sunDir)), 0.0001);
          col += sunColor * pow(sunAmt, 24.0) * 0.65;
          col += sunColor * pow(sunAmt, 256.0) * 1.2;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    const hemiLight = new THREE.HemisphereLight('#FFB988', '#4A3B32', 1.0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#FF8B3D', 2.2);
    sunLight.position.set(-32, 16, -16);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 160;
    const d = 58;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const campfireLight = new THREE.PointLight('#FF7B00', 3.5, 16, 1.5);
    campfireLight.position.set(0, 3.6, -17.2);
    scene.add(campfireLight);

    const cabinLight = new THREE.PointLight('#FFA726', 2.4, 14, 1.5);
    cabinLight.position.set(-16.2, 2.5, -2.5);
    scene.add(cabinLight);

    const waterGeo = new THREE.PlaneGeometry(360, 360, 112, 112);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#38B6B2',
      roughness: 0.22,
      metalness: 0.18,
      flatShading: true,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = -0.22;
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    const terrainMeshes: THREE.Object3D[] = [];

    const mainIsland = buildSculptedIslandMesh({ x: 0, y: 0.6, z: 0 }, 10.6, 5.2, '#74C365', '#E2C496');
    scene.add(mainIsland);
    terrainMeshes.push(mainIsland);

    const forestIsland = buildSculptedIslandMesh({ x: 17.5, y: 0.9, z: -4.0 }, 8.3, 4.6, '#58B06C', '#D6B585');
    scene.add(forestIsland);
    terrainMeshes.push(forestIsland);

    const coastIsland = buildSculptedIslandMesh({ x: -17.5, y: 0.7, z: -3.5 }, 8.3, 4.4, '#80BE70', '#E8CB9F');
    scene.add(coastIsland);
    terrainMeshes.push(coastIsland);

    const summitIsland = buildSculptedIslandMesh({ x: 0, y: 2.5, z: -18.5 }, 7.7, 6.2, '#62B382', '#C5B095');
    scene.add(summitIsland);
    terrainMeshes.push(summitIsland);

    const satelliteRocks: { mesh: THREE.Mesh; baseY: number; speed: number; phase: number }[] = [];
    const rockMat = new THREE.MeshStandardMaterial({ color: '#84756A', roughness: 0.9, flatShading: true });
    const satCoords: Vec3[] = [
      { x: 11.2, y: 0.2, z: 7.5 },
      { x: -11.5, y: 0.4, z: 7.2 },
      { x: 12.5, y: 1.8, z: -14.5 },
      { x: -12.0, y: 1.6, z: -14.0 },
      { x: 26.5, y: 1.2, z: -6.0 },
      { x: -26.5, y: 1.0, z: -5.5 },
    ];
    satCoords.forEach((sc, idx) => {
      const rMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9 + (idx % 3) * 0.35, 0), rockMat);
      rMesh.position.set(sc.x, sc.y, sc.z);
      rMesh.scale.set(1.2, 0.75, 1.1);
      rMesh.castShadow = true;
      scene.add(rMesh);
      satelliteRocks.push({ mesh: rMesh, baseY: sc.y, speed: 1.1 + idx * 0.15, phase: idx * 1.3 });
    });

    const plankMat = new THREE.MeshStandardMaterial({ color: '#C68B59', roughness: 0.85 });
    const postMat = new THREE.MeshStandardMaterial({ color: '#8A5A36', roughness: 0.9 });

    [-1, 1].forEach((dir) => {
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        const bx = dir * (7.6 + t * 4.0);
        const by = 0.65 + t * 0.18 + Math.sin(t * Math.PI) * 0.42;
        const bz = -2.4;
        const plank = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 2.1), plankMat);
        plank.position.set(bx, by, bz);
        plank.castShadow = true;
        plank.receiveShadow = true;
        scene.add(plank);
        terrainMeshes.push(plank);

        if (i % 2 === 0) {
          [-0.95, 0.95].forEach((zOff) => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.75, 8), postMat);
            post.position.set(bx, by + 0.38, bz + zOff);
            post.castShadow = true;
            scene.add(post);
          });
        }
      }
    });

    const stoneStepMat = new THREE.MeshStandardMaterial({ color: '#D6CEC2', roughness: 0.88, flatShading: true });
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const sz = -7.8 - t * 4.8;
      const sy = 0.75 + t * 1.82;
      const step = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.1, 0.32, 10), stoneStepMat);
      step.position.set(Math.sin(i * 0.8) * 0.35, sy, sz);
      step.castShadow = true;
      step.receiveShadow = true;
      scene.add(step);
      terrainMeshes.push(step);
    }

    for (let i = 0; i < 10; i++) {
      const pz = 7.4 + i * 0.68;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.56), plankMat);
      plank.position.set(0, 0.42, pz);
      plank.castShadow = true;
      plank.receiveShadow = true;
      scene.add(plank);
      terrainMeshes.push(plank);

      if (i % 3 === 0) {
        [-1.18, 1.18].forEach((xOff) => {
          const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.4, 8), postMat);
          piling.position.set(xOff, 0.15, pz);
          scene.add(piling);
        });
      }
    }

    const postboxGroup = new THREE.Group();
    postboxGroup.position.set(0.85, 0.48, 11.2);
    const pbBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.3, 1.05, 16),
      new THREE.MeshStandardMaterial({ color: '#D62828', roughness: 0.45 })
    );
    pbBody.position.y = 0.52;
    pbBody.castShadow = true;
    postboxGroup.add(pbBody);
    const pbCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 12),
      new THREE.MeshStandardMaterial({ color: '#B51717', roughness: 0.45 })
    );
    pbCap.position.y = 1.05;
    pbCap.scale.y = 0.45;
    postboxGroup.add(pbCap);
    scene.add(postboxGroup);

    const boatGroup = new THREE.Group();
    boatGroup.position.set(-2.4, -0.05, 12.2);
    boatGroup.rotation.y = 0.42;
    const hull = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.52, 2.2, 12),
      new THREE.MeshStandardMaterial({ color: '#BC6C25', roughness: 0.82 })
    );
    hull.rotation.z = Math.PI / 2;
    hull.scale.set(0.55, 1, 0.72);
    hull.castShadow = true;
    boatGroup.add(hull);
    scene.add(boatGroup);

    const waterfallGroup = new THREE.Group();
    const waterStreamMat = new THREE.MeshStandardMaterial({
      color: '#B2EBF2',
      emissive: '#4DD0E1',
      emissiveIntensity: 0.25,
      roughness: 0.2,
      transparent: true,
      opacity: 0.86,
    });
    const streamMesh = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.4, 0.25), waterStreamMat);
    streamMesh.position.set(-2.2, -0.25, 10.1);
    streamMesh.rotation.x = 0.15;
    waterfallGroup.add(streamMesh);
    scene.add(waterfallGroup);

    const { group: windmillGroup, rotor: windmillRotor } = buildDetailedWindmill({
      x: -2.8,
      y: 0.85,
      z: -5.2,
    });
    scene.add(windmillGroup);

    const { group: coastBuildings, searchlightGroup } = buildLighthouseAndDarkroom(
      { x: -20.8, y: 0.72, z: -4.2 },
      { x: -16.2, y: 0.78, z: -3.2 }
    );
    scene.add(coastBuildings);

    const benchGroup = new THREE.Group();
    benchGroup.position.set(3.4, 0.75, -3.5);
    benchGroup.rotation.y = -0.35;
    const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.1, 0.62), plankMat);
    benchSeat.position.y = 0.42;
    benchSeat.castShadow = true;
    benchGroup.add(benchSeat);
    const benchBack = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.45, 0.08), plankMat);
    benchBack.position.set(0, 0.72, -0.26);
    benchBack.rotation.x = -0.15;
    benchBack.castShadow = true;
    benchGroup.add(benchBack);
    const cameraBagMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.42, 0.38),
      new THREE.MeshStandardMaterial({ color: '#B8542C', roughness: 0.72 })
    );
    cameraBagMesh.position.set(0.25, 0.68, 0.02);
    cameraBagMesh.rotation.y = 0.25;
    cameraBagMesh.castShadow = true;
    benchGroup.add(cameraBagMesh);
    scene.add(benchGroup);

    const summitProps = new THREE.Group();
    summitProps.position.set(0, 2.65, -18.5);

    const tentGeo = new THREE.ConeGeometry(1.75, 2.1, 4);
    tentGeo.rotateY(Math.PI / 4);
    const tentMesh = new THREE.Mesh(
      tentGeo,
      new THREE.MeshStandardMaterial({
        color: '#F4A261',
        emissive: '#E76F51',
        emissiveIntensity: 0.22,
        roughness: 0.85,
      })
    );
    tentMesh.position.set(-2.9, 1.05, 1.2);
    tentMesh.rotation.y = 0.35;
    tentMesh.castShadow = true;
    summitProps.add(tentMesh);

    const teleGroup = new THREE.Group();
    teleGroup.position.set(2.8, 0, -0.8);
    const brassMat = new THREE.MeshStandardMaterial({ color: '#E5B84B', roughness: 0.3, metalness: 0.8 });
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 1.35, 16), brassMat);
    tube.position.y = 1.25;
    tube.rotation.x = 0.85;
    tube.rotation.z = -0.25;
    tube.castShadow = true;
    teleGroup.add(tube);
    for (let l = 0; l < 3; l++) {
      const a = (l / 3) * Math.PI * 2;
      const tLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.25, 8), postMat);
      tLeg.position.set(Math.cos(a) * 0.25, 0.58, Math.sin(a) * 0.25);
      teleGroup.add(tLeg);
    }
    summitProps.add(teleGroup);

    for (let s = 0; s < 10; s++) {
      const a = (s / 10) * Math.PI * 2;
      const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), rockMat);
      stone.position.set(Math.cos(a) * 0.72, 0.1, 1.3 + Math.sin(a) * 0.72);
      summitProps.add(stone);
    }
    const flameOuter = new THREE.Mesh(
      new THREE.ConeGeometry(0.48, 1.05, 8),
      new THREE.MeshBasicMaterial({ color: '#FF6D00' })
    );
    flameOuter.position.set(0, 0.52, 1.3);
    summitProps.add(flameOuter);

    const flameInner = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.85, 8),
      new THREE.MeshBasicMaterial({ color: '#FFD600' })
    );
    flameInner.position.set(0, 0.45, 1.32);
    summitProps.add(flameInner);

    scene.add(summitProps);

    const treeSpecs: {
      pos: Vec3;
      scale: number;
      type: 'pine' | 'ginkgo' | 'sakura' | 'oak';
      pal: [string, string, string];
    }[] = [
      { pos: { x: 6.4, y: 0.72, z: -4.2 }, scale: 1.15, type: 'oak', pal: ['#52B788', '#40916C', '#74C69D'] },
      { pos: { x: -6.8, y: 0.7, z: 3.4 }, scale: 1.05, type: 'sakura', pal: ['#FFB5A7', '#FCD5CE', '#F8AD9D'] },
      { pos: { x: 5.5, y: 0.72, z: -6.5 }, scale: 0.92, type: 'ginkgo', pal: ['#F6BD60', '#F5CAC3', '#E9C46A'] },
      { pos: { x: -6.2, y: 0.7, z: -6.2 }, scale: 1.1, type: 'pine', pal: ['#52B788', '#40916C', '#2D6A4F'] },

      { pos: { x: 17.5, y: 1.1, z: -4.0 }, scale: 1.55, type: 'ginkgo', pal: ['#F6BD60', '#F4A261', '#E9C46A'] },
      { pos: { x: 13.5, y: 1.0, z: -3.5 }, scale: 1.2, type: 'pine', pal: ['#52B788', '#40916C', '#2D6A4F'] },
      { pos: { x: 22.2, y: 0.95, z: -4.5 }, scale: 1.3, type: 'pine', pal: ['#74C69D', '#52B788', '#40916C'] },
      { pos: { x: 17.8, y: 1.0, z: -9.5 }, scale: 1.25, type: 'ginkgo', pal: ['#F6BD60', '#E9C46A', '#F4A261'] },
      { pos: { x: 18.2, y: 0.98, z: 1.8 }, scale: 1.15, type: 'oak', pal: ['#52B788', '#40916C', '#2D6A4F'] },
      { pos: { x: 21.5, y: 0.95, z: 1.2 }, scale: 1.0, type: 'sakura', pal: ['#FFB5A7', '#F8AD9D', '#F4978E'] },

      { pos: { x: -14.8, y: 0.8, z: 2.8 }, scale: 1.05, type: 'pine', pal: ['#52B788', '#40916C', '#2D6A4F'] },
      { pos: { x: -22.0, y: 0.75, z: 2.2 }, scale: 0.95, type: 'oak', pal: ['#74C69D', '#52B788', '#40916C'] },

      { pos: { x: -5.2, y: 2.65, z: -17.0 }, scale: 1.2, type: 'pine', pal: ['#40916C', '#2D6A4F', '#1B4332'] },
      { pos: { x: 5.4, y: 2.65, z: -17.2 }, scale: 1.1, type: 'pine', pal: ['#52B788', '#40916C', '#2D6A4F'] },
    ];

    treeSpecs.forEach((ts) => {
      scene.add(buildDetailedTree(ts.pos, ts.scale, ts.type, ts.pal));
    });

    const grassCount = 1600;
    const bladeGeo = new THREE.ConeGeometry(0.06, 0.34, 4);
    bladeGeo.translate(0, 0.17, 0);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: '#80D472',
      roughness: 0.75,
    });
    const instancedGrass = new THREE.InstancedMesh(bladeGeo, bladeMat, grassCount);
    instancedGrass.castShadow = false;
    instancedGrass.receiveShadow = true;

    const flowerCount = 260;
    const flowerGeo = new THREE.DodecahedronGeometry(0.09, 0);
    const flowerMat = new THREE.MeshStandardMaterial({
      color: '#FFF3B0',
      roughness: 0.5,
    });
    const instancedFlowers = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerCount);

    const dummy = new THREE.Object3D();
    const flowerColor = new THREE.Color();
    const flowerPalette = ['#FFF3B0', '#FFB5A7', '#A7F3D0', '#FDE047', '#FBCFE8'];

    let gIdx = 0;
    let fIdx = 0;
    for (let attempt = 0; attempt < 3200 && gIdx < grassCount; attempt++) {
      const zone = ISLAND_ZONES[attempt % 4];
      const r = Math.sqrt(Math.random()) * (zone.radius - 0.8);
      const theta = Math.random() * Math.PI * 2;
      const gx = zone.center.x + Math.cos(theta) * r;
      const gz = zone.center.z + Math.sin(theta) * r;
      const ground = getTerrainHeightAt(gx, gz);
      if (!ground.walkable) continue;

      dummy.position.set(gx, ground.y - 0.04, gz);
      dummy.rotation.set(
        (Math.random() - 0.5) * 0.25,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.25
      );
      const s = 0.7 + Math.random() * 0.75;
      dummy.scale.set(s, s * (0.8 + Math.random() * 0.5), s);
      dummy.updateMatrix();
      instancedGrass.setMatrixAt(gIdx++, dummy.matrix);

      if (fIdx < flowerCount && Math.random() < 0.18) {
        dummy.position.set(gx, ground.y + 0.22, gz);
        dummy.scale.setScalar(0.8 + Math.random() * 0.6);
        dummy.updateMatrix();
        instancedFlowers.setMatrixAt(fIdx, dummy.matrix);
        flowerColor.set(flowerPalette[fIdx % flowerPalette.length]);
        instancedFlowers.setColorAt(fIdx, flowerColor);
        fIdx++;
      }
    }
    instancedGrass.instanceMatrix.needsUpdate = true;
    instancedFlowers.instanceMatrix.needsUpdate = true;
    if (instancedFlowers.instanceColor) instancedFlowers.instanceColor.needsUpdate = true;
    scene.add(instancedGrass);
    scene.add(instancedFlowers);

    const cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.9,
      transparent: true,
      opacity: 0.88,
      flatShading: true,
    });
    for (let c = 0; c < 10; c++) {
      const singleCloud = new THREE.Group();
      const angle = (c / 10) * Math.PI * 2;
      const dist = 36 + (c % 3) * 12;
      singleCloud.position.set(Math.cos(angle) * dist, 12 + (c % 4) * 3.5, Math.sin(angle) * dist);
      for (let puff = 0; puff < 4; puff++) {
        const pMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8 + (puff % 2) * 0.7, 1), cloudMat);
        pMesh.position.set((puff - 1.5) * 1.4, (puff % 2) * 0.4, 0);
        pMesh.scale.set(1.3, 0.75, 1.0);
        singleCloud.add(pMesh);
      }
      cloudGroup.add(singleCloud);
    }
    scene.add(cloudGroup);

    const photoPlanes: typeof simRef.current.photoPlanes = [];
    const interactiveMeshes: typeof simRef.current.interactiveMeshes = [];

    EASEL_CONFIGS.forEach((easel) => {
      const ground = getTerrainHeightAt(easel.pos.x, easel.pos.z);
      const placedEasel = {
        ...easel,
        pos: { x: easel.pos.x, y: ground.y, z: easel.pos.z },
      };
      const { group, photoPlane, frameMat } = buildPhotoEaselMesh(placedEasel);
      scene.add(group);
      photoPlanes.push({
        easelId: easel.id,
        photoIndex: easel.photoIndex,
        mesh: photoPlane,
        frameMat,
      });
      interactiveMeshes.push({
        kind: 'easel',
        id: easel.id,
        mesh: group,
        worldPos: placedEasel.pos,
      });
    });

    interactiveMeshes.push(
      { kind: 'station', id: 'gear-bag', mesh: benchGroup, worldPos: SPECIAL_STATIONS[0].pos },
      { kind: 'station', id: 'campfire-projects', mesh: summitProps, worldPos: SPECIAL_STATIONS[1].pos },
      { kind: 'station', id: 'drift-bottle', mesh: postboxGroup, worldPos: SPECIAL_STATIONS[2].pos }
    );

    simRef.current.photoPlanes = photoPlanes;
    simRef.current.interactiveMeshes = interactiveMeshes;
    simRef.current.terrainMeshes = [waterMesh, ...terrainMeshes];

    const avatar = buildPhotographerAvatar();
    scene.add(avatar.root);

    const targetRing = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.48, 24),
      new THREE.MeshBasicMaterial({ color: '#FDE047', side: THREE.DoubleSide })
    );
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.visible = false;
    scene.add(targetRing);

    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 52;
      particlePositions[i * 3 + 1] = 1.0 + Math.random() * 7.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 48;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#FDE047',
      size: 0.24,
      transparent: true,
      opacity: 0.85,
    });
    const fireflyPoints = new THREE.Points(particleGeo, particleMat);
    scene.add(fireflyPoints);

    // 16. Starfield Dome (fades in smoothly during Blue Hour & Starlight Night)
    const starCount = 420;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(0.15 + Math.random() * 0.85);
      const r = 122;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: '#FFFBEB',
      size: 0.75,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const starDome = new THREE.Points(starGeo, starMat);
    scene.add(starDome);

    // 17. Warm Flagstone Garden Stepping Paths on Main Island
    const pathStoneMat = new THREE.MeshStandardMaterial({ color: '#E6DDD0', roughness: 0.9, flatShading: true });
    const pathCoords: [number, number][] = [
      [0, 6.2], [0.2, 4.6], [-0.1, 3.0], [0.1, 1.4], [0, -0.3],
      [1.8, -0.8], [3.6, -1.4], [5.4, -2.0], [6.8, -2.3],
      [-1.8, -0.8], [-3.6, -1.5], [-5.4, -2.0], [-6.8, -2.3],
      [0.2, -2.0], [-0.2, -3.8], [0.1, -5.6], [0, -7.0],
    ];
    pathCoords.forEach(([px, pz], idx) => {
      const g = getTerrainHeightAt(px, pz);
      const st = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42 + (idx % 2) * 0.08, 0.48, 0.08, 7),
        pathStoneMat
      );
      st.position.set(px, g.y + 0.01, pz);
      st.rotation.y = idx * 0.9;
      st.receiveShadow = true;
      scene.add(st);
    });

    // 18. Waterfall Splash Foam Ring & Darkroom Chimney Smoke Puffs
    const foamRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.14, 8, 20),
      new THREE.MeshBasicMaterial({ color: '#E0F7FA', transparent: true, opacity: 0.65 })
    );
    foamRing.rotation.x = Math.PI / 2;
    foamRing.position.set(-2.2, -0.15, 10.35);
    scene.add(foamRing);

    const smokePuffs: { mesh: THREE.Mesh; phase: number }[] = [];
    const smokeMat = new THREE.MeshStandardMaterial({
      color: '#F5EFE6',
      transparent: true,
      opacity: 0.45,
      roughness: 1,
    });
    for (let sm = 0; sm < 5; sm++) {
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), smokeMat);
      puff.position.set(-15.5, 4.2, -3.6);
      scene.add(puff);
      smokePuffs.push({ mesh: puff, phase: sm * 0.2 });
    }

    // 19. Glowing Glass Drift Bottles bobbing near South Pier
    const bottleMeshes: { group: THREE.Group; baseX: number; baseZ: number; phase: number }[] = [];
    const bottleGlassMat = new THREE.MeshStandardMaterial({
      color: '#A7F3D0',
      emissive: '#34D399',
      emissiveIntensity: 0.65,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const corkMat = new THREE.MeshStandardMaterial({ color: '#B07D4F', roughness: 0.9 });
    [
      { x: 2.4, z: 12.6 },
      { x: 3.5, z: 10.8 },
      { x: -1.4, z: 14.4 },
      { x: 1.9, z: 14.8 },
    ].forEach((b, idx) => {
      const bg = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.34, 10), bottleGlassMat);
      const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 8), corkMat);
      cork.position.y = 0.2;
      bg.add(body, cork);
      bg.rotation.z = 0.55;
      bg.position.set(b.x, -0.1, b.z);
      scene.add(bg);
      bottleMeshes.push({ group: bg, baseX: b.x, baseZ: b.z, phase: idx * 1.4 });
    });

    // 20. Flock of 6 Soaring White Seagulls with Flapping Wings
    const birds: {
      group: THREE.Group;
      leftWing: THREE.Mesh;
      rightWing: THREE.Mesh;
      radius: number;
      height: number;
      speed: number;
      phase: number;
    }[] = [];
    const birdMat = new THREE.MeshStandardMaterial({ color: '#FAF8F5', roughness: 0.6 });
    for (let bi = 0; bi < 6; bi++) {
      const bGroup = new THREE.Group();
      const wingGeo = new THREE.BoxGeometry(0.45, 0.03, 0.16);
      const lWing = new THREE.Mesh(wingGeo, birdMat);
      lWing.position.x = -0.22;
      const rWing = new THREE.Mesh(wingGeo, birdMat);
      rWing.position.x = 0.22;
      bGroup.add(lWing, rWing);
      scene.add(bGroup);
      birds.push({
        group: bGroup,
        leftWing: lWing,
        rightWing: rWing,
        radius: 11 + (bi % 3) * 5.5,
        height: 8.5 + (bi % 4) * 1.6,
        speed: 0.26 + (bi % 3) * 0.06,
        phase: (bi / 6) * Math.PI * 2,
      });
    }

    // 21. Dedicated Personal Memory Islands, Stepping-Stone Paths & Refined 3D Landmarks
    const memoryModels: BuiltMemoryModel[] = [];
    const memoryStoneMat = new THREE.MeshStandardMaterial({
      color: '#E5DFD3',
      roughness: 0.85,
      flatShading: true,
    });
    const memoryIslandStyles: Record<string, { top: string; rim: string }> = {
      'freedive-crimson': { top: '#63B8C8', rim: '#E8D5B7' },
      'yzfls-campus': { top: '#66B56A', rim: '#D8BA8E' },
      'redbrick-gate': { top: '#78B970', rim: '#DFC59C' },
      'gramophone-lounge': { top: '#5F9E78', rim: '#C9B393' },
      'winter-bros': { top: '#80B68A', rim: '#E2CCA4' },
      'hunau-campus': { top: '#8BA85A', rim: '#E0BE8A' },
    };

    PERSONAL_MEMORIES.forEach((mem) => {
      // M01 Freediving Sanctuary sits directly on the sea with its own architectural stone & teak deck
      if (mem.id !== 'freedive-crimson') {
        const palette = memoryIslandStyles[mem.id] || { top: '#74C365', rim: '#E2C496' };
        const memIsland = buildSculptedIslandMesh(
          mem.islandCenter,
          mem.islandRadius,
          4.4,
          palette.top,
          palette.rim
        );
        scene.add(memIsland);
        terrainMeshes.push(memIsland);
      }

      // Decorative floating stepping-stone bridge connecting parent island to this memory island
      const parentZone = ISLAND_ZONES.find((z) => z.id === mem.zoneId);
      if (parentZone) {
        const dx = mem.islandCenter.x - parentZone.center.x;
        const dz = mem.islandCenter.z - parentZone.center.z;
        const totalDist = Math.hypot(dx, dz);
        const startT = Math.min(0.45, (parentZone.radius + 0.6) / totalDist);
        const endT = Math.max(0.55, 1 - (mem.islandRadius + 0.6) / totalDist);
        const stoneCount = 6;
        for (let s = 0; s <= stoneCount; s++) {
          const t = startT + (endT - startT) * (s / stoneCount);
          const sx = parentZone.center.x + dx * t;
          const sz = parentZone.center.z + dz * t;
          const sy =
            parentZone.center.y +
            (mem.islandCenter.y - parentZone.center.y) * t +
            Math.sin((s / stoneCount) * Math.PI) * 0.35;
          const stepStone = new THREE.Mesh(
            new THREE.CylinderGeometry(0.95, 0.78, 0.26, 9),
            memoryStoneMat
          );
          stepStone.position.set(sx, sy, sz);
          stepStone.castShadow = true;
          stepStone.receiveShadow = true;
          scene.add(stepStone);
          terrainMeshes.push(stepStone);
        }
      }

      // Mount the refined 3D memory diorama centered cleanly on its own island
      const built = buildPersonalMemoryModel(mem.id);
      built.group.position.set(mem.pos.x, mem.id === 'freedive-crimson' ? mem.pos.y : mem.pos.y + 0.12, mem.pos.z);
      built.group.rotation.y = mem.rotY;
      scene.add(built.group);
      memoryModels.push(built);
      simRef.current.interactiveMeshes.push({
        kind: 'memory',
        id: mem.id,
        mesh: built.group,
        worldPos: mem.pos,
      });
    });

    let reqId: number;
    const clock = new THREE.Clock();
    let prevElapsed = 0;
    let clickWalkStuckFrames = 0;
    const baseWaterPos = waterGeo.attributes.position.clone();

    const tryMoveWithSliding = (
      curX: number,
      curZ: number,
      dx: number,
      dz: number
    ): { moved: boolean; x: number; y: number; z: number; moveDx: number; moveDz: number; zoneId: string } => {
      // 1. Direct desired step
      const direct = getTerrainHeightAt(curX + dx, curZ + dz);
      if (direct.walkable) {
        return { moved: true, x: curX + dx, y: direct.y, z: curZ + dz, moveDx: dx, moveDz: dz, zoneId: direct.zoneId };
      }

      // 2. Axis-aligned wall sliding (great for rectangular bridges & piers)
      const slideX = getTerrainHeightAt(curX + dx * 0.85, curZ);
      const slideZ = getTerrainHeightAt(curX, curZ + dz * 0.85);
      if (slideX.walkable && (!slideZ.walkable || Math.abs(dx) >= Math.abs(dz))) {
        return { moved: true, x: curX + dx * 0.85, y: slideX.y, z: curZ, moveDx: dx * 0.85, moveDz: 0, zoneId: slideX.zoneId };
      }
      if (slideZ.walkable) {
        return { moved: true, x: curX, y: slideZ.y, z: curZ + dz * 0.85, moveDx: 0, moveDz: dz * 0.85, zoneId: slideZ.zoneId };
      }

      // 3. Curved coastline tangent sliding (±25°, ±50°, ±72°) so circular islands NEVER trap the player!
      const baseAngle = Math.atan2(dz, dx);
      const stepLen = Math.hypot(dx, dz) * 0.82;
      const offsets = [0.44, -0.44, 0.88, -0.88, 1.26, -1.26];
      for (const off of offsets) {
        const a = baseAngle + off;
        const tx = Math.cos(a) * stepLen;
        const tz = Math.sin(a) * stepLen;
        const test = getTerrainHeightAt(curX + tx, curZ + tz);
        if (test.walkable) {
          return { moved: true, x: curX + tx, y: test.y, z: curZ + tz, moveDx: tx, moveDz: tz, zoneId: test.zoneId };
        }
      }

      return { moved: false, x: curX, y: 0, z: curZ, moveDx: 0, moveDz: 0, zoneId: 'meadow' };
    };

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const dt = Math.min(0.05, Math.max(0.004, elapsed - prevElapsed));
      prevElapsed = elapsed;
      const sim = simRef.current;

      const atmo = computeAtmosphere(sim.timeOfDay);
      const isSubmerged = sim.underwaterMode || camera.position.y < -0.28;
      sim.underwaterBlend += ((isSubmerged ? 1 : 0) - sim.underwaterBlend) * 0.08;
      const uw = sim.underwaterBlend;

      const uwSkyTop = new THREE.Color('#0369A1');
      const uwSkyBottom = new THREE.Color('#082F49');
      const uwFogColor = new THREE.Color('#03588C');

      skyUniforms.topColor.value.copy(atmo.skyTop).lerp(uwSkyTop, uw);
      skyUniforms.bottomColor.value.copy(atmo.skyBottom).lerp(uwSkyBottom, uw);
      skyUniforms.sunDir.value.copy(atmo.sunPosition).normalize();
      skyUniforms.sunColor.value.copy(atmo.sunColor);

      fog.color.copy(atmo.fogColor).lerp(uwFogColor, uw);
      fog.density = 0.0046 + uw * 0.021;
      waterMat.color.copy(atmo.waterColor).lerp(new THREE.Color('#0E87B4'), uw);

      sunLight.color.copy(atmo.sunColor);
      sunLight.intensity = atmo.sunIntensity;
      sunLight.position.copy(atmo.sunPosition);

      hemiLight.color.copy(atmo.hemiSky);
      hemiLight.groundColor.copy(atmo.hemiGround);
      hemiLight.intensity = atmo.hemiIntensity;

      searchlightGroup.visible = atmo.nightFactor > 0.15 || atmo.goldenFactor > 0.5;
      searchlightGroup.rotation.y = elapsed * 0.75;
      campfireLight.intensity = 2.5 + Math.sin(elapsed * 9) * 0.6 + atmo.nightFactor * 2.5;
      cabinLight.intensity = 1.4 + atmo.nightFactor * 2.2;

      // Star dome & fireflies visibility
      starMat.opacity = Math.max(0, (atmo.nightFactor - 0.15) * 1.15);
      starDome.rotation.y = elapsed * 0.008;
      particleMat.opacity = 0.35 + atmo.nightFactor * 0.6;
      fireflyPoints.position.y = Math.sin(elapsed * 0.9) * 0.35;

      windmillRotor.rotation.z = -elapsed * 0.65;
      cloudGroup.rotation.y = elapsed * 0.015;

      // Animate waterfall foam, chimney smoke, drift bottles & soaring birds
      foamRing.scale.setScalar(0.92 + Math.sin(elapsed * 4.5) * 0.12);
      smokePuffs.forEach((sp) => {
        const life = (elapsed * 0.28 + sp.phase) % 1;
        sp.mesh.position.set(
          -15.5 + Math.sin(life * 4 + sp.phase) * 0.35,
          4.1 + life * 2.6,
          -3.6 + life * 0.6
        );
        sp.mesh.scale.setScalar(0.6 + life * 1.4);
      });

      bottleMeshes.forEach((bm) => {
        bm.group.position.y = -0.12 + Math.sin(elapsed * 2.1 + bm.phase) * 0.07;
        bm.group.rotation.x = Math.sin(elapsed * 1.5 + bm.phase) * 0.18;
      });

      birds.forEach((b) => {
        const ang = elapsed * b.speed + b.phase;
        b.group.position.set(
          Math.cos(ang) * b.radius,
          b.height + Math.sin(elapsed * 1.8 + b.phase) * 0.6,
          Math.sin(ang) * b.radius - 4
        );
        b.group.rotation.y = -ang;
        const flap = Math.sin(elapsed * 7.5 + b.phase) * 0.45;
        b.leftWing.rotation.z = flap;
        b.rightWing.rotation.z = -flap;
      });

      satelliteRocks.forEach((sr) => {
        sr.mesh.position.y = sr.baseY + Math.sin(elapsed * sr.speed + sr.phase) * 0.22;
        sr.mesh.rotation.y = elapsed * 0.12;
      });

      memoryModels.forEach((mm) => mm.update(elapsed));

      flameOuter.scale.y = 0.9 + Math.sin(elapsed * 10) * 0.18;
      flameInner.scale.y = 0.9 + Math.cos(elapsed * 12) * 0.2;
      boatGroup.position.y = -0.05 + Math.sin(elapsed * 1.8) * 0.06;
      boatGroup.rotation.z = Math.sin(elapsed * 1.4) * 0.05;

      const wAttr = waterGeo.attributes.position;
      for (let i = 0; i < wAttr.count; i++) {
        const wx = baseWaterPos.getX(i);
        const wz = baseWaterPos.getZ(i);
        const wave =
          Math.sin(wx * 0.22 + elapsed * 1.6) * 0.09 +
          Math.cos(wz * 0.25 + elapsed * 1.3) * 0.08;
        wAttr.setY(i, wave);
      }
      wAttr.needsUpdate = true;

      let moveForward = sim.joyY;
      let moveRight = sim.joyX;
      if (sim.keys['w'] || sim.keys['arrowup']) moveForward += 1;
      if (sim.keys['s'] || sim.keys['arrowdown']) moveForward -= 1;
      if (sim.keys['d'] || sim.keys['arrowright']) moveRight += 1;
      if (sim.keys['a'] || sim.keys['arrowleft']) moveRight -= 1;

      const walkSpeed = 8.2 * dt;
      let isMoving = false;

      if (Math.hypot(moveForward, moveRight) > 0.08) {
        sim.playerTarget = null;
        clickWalkStuckFrames = 0;
        const rawLen = Math.hypot(moveForward, moveRight);
        const speedScale = Math.min(1, rawLen);
        const nf = moveForward / rawLen;
        const nr = moveRight / rawLen;

        const fwdX = -Math.sin(sim.camYaw);
        const fwdZ = -Math.cos(sim.camYaw);
        const rightX = Math.cos(sim.camYaw);
        const rightZ = -Math.sin(sim.camYaw);

        const dx = (fwdX * nf + rightX * nr) * walkSpeed * speedScale;
        const dz = (fwdZ * nf + rightZ * nr) * walkSpeed * speedScale;

        const res = tryMoveWithSliding(sim.playerPos.x, sim.playerPos.z, dx, dz);
        if (res.moved) {
          sim.playerPos.x = res.x;
          sim.playerPos.z = res.z;
          sim.playerPos.y += (res.y - sim.playerPos.y) * 0.25;
          sim.playerYaw = Math.atan2(res.moveDx, res.moveDz);
          isMoving = true;
          if (!sim.underwaterMode) {
            sim.camTargetFocus.set(res.x, sim.playerPos.y + 1.1, res.z);
          }
        }
      } else if (sim.playerTarget) {
        const dx = sim.playerTarget.x - sim.playerPos.x;
        const dz = sim.playerTarget.z - sim.playerPos.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.28) {
          const step = Math.min(walkSpeed, dist);
          const res = tryMoveWithSliding(
            sim.playerPos.x,
            sim.playerPos.z,
            (dx / dist) * step,
            (dz / dist) * step
          );
          if (res.moved) {
            clickWalkStuckFrames = 0;
            sim.playerPos.x = res.x;
            sim.playerPos.z = res.z;
            sim.playerPos.y += (res.y - sim.playerPos.y) * 0.25;
            sim.playerYaw = Math.atan2(res.moveDx, res.moveDz);
            isMoving = true;
            if (!sim.underwaterMode) {
              sim.camTargetFocus.set(res.x, sim.playerPos.y + 1.1, res.z);
            }
          } else {
            clickWalkStuckFrames += 1;
            if (clickWalkStuckFrames > 10) {
              sim.playerTarget = null;
              clickWalkStuckFrames = 0;
            }
          }
        } else {
          sim.playerTarget = null;
          clickWalkStuckFrames = 0;
        }
      }

      if (sim.playerTarget) {
        targetRing.visible = true;
        targetRing.position.set(sim.playerTarget.x, sim.playerTarget.y + 0.05, sim.playerTarget.z);
        targetRing.scale.setScalar(0.85 + Math.sin(elapsed * 6) * 0.15);
      } else {
        targetRing.visible = false;
      }

      if (isMoving) {
        sim.playerWalkCycle += 14.5 * dt;
        const swing = Math.sin(sim.playerWalkCycle) * 0.55;
        avatar.leftLeg.rotation.x = swing;
        avatar.rightLeg.rotation.x = -swing;
        avatar.leftArm.rotation.x = -swing * 0.7;
        avatar.rightArm.rotation.x = swing * 0.7;
        avatar.root.position.y = sim.playerPos.y + Math.abs(Math.sin(sim.playerWalkCycle)) * 0.08;
      } else {
        avatar.leftLeg.rotation.x *= 0.85;
        avatar.rightLeg.rotation.x *= 0.85;
        avatar.leftArm.rotation.x *= 0.85;
        avatar.rightArm.rotation.x *= 0.85;
        avatar.root.position.y += (sim.playerPos.y - avatar.root.position.y) * 0.25;
      }
      avatar.root.position.x = sim.playerPos.x;
      avatar.root.position.z = sim.playerPos.z;

      const diffYaw =
        ((sim.playerYaw - avatar.root.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      avatar.root.rotation.y += diffYaw * 0.18;

      let closestPrompt: {
        type: 'easel' | 'station' | 'memory';
        id: string;
        titleZh: string;
        subZh: string;
        dist: number;
      } | null = null;

      EASEL_CONFIGS.forEach((ea, idx) => {
        const d = Math.hypot(ea.pos.x - sim.playerPos.x, ea.pos.z - sim.playerPos.z);
        const planeInfo = sim.photoPlanes[idx];
        if (planeInfo) {
          planeInfo.frameMat.emissiveIntensity = d < 3.8 ? 0.45 + Math.sin(elapsed * 5) * 0.15 : 0.04;
        }
        if (d < 3.8 && (!closestPrompt || d < closestPrompt.dist)) {
          closestPrompt = {
            type: 'easel',
            id: ea.id,
            titleZh: `画架 #${idx + 1} · ${ea.locationZh}`,
            subZh: '按 [E] 或点击画架赏析高清大图与 EXIF 故事',
            dist: d,
          };
        }
      });

      SPECIAL_STATIONS.forEach((st) => {
        const d = Math.hypot(st.pos.x - sim.playerPos.x, st.pos.z - sim.playerPos.z);
        if (d < 3.8 && (!closestPrompt || d < closestPrompt.dist)) {
          closestPrompt = {
            type: 'station',
            id: st.id,
            titleZh: st.nameZh,
            subZh: `${st.hintZh} · 按 [E] 或点击打开`,
            dist: d,
          };
        }
      });

      PERSONAL_MEMORIES.forEach((mem) => {
        const d = Math.hypot(mem.pos.x - sim.playerPos.x, mem.pos.z - sim.playerPos.z);
        const triggerDist = mem.id === 'freedive-crimson' ? 5.2 : 4.2;
        if (d < triggerDist && (!closestPrompt || d < closestPrompt.dist)) {
          closestPrompt = {
            type: 'memory',
            id: mem.id,
            titleZh: `${mem.indexLabel} · ${mem.titleZh}`,
            subZh: `${mem.categoryZh} · 按 [E] 或点击打开记忆手账`,
            dist: d,
          };
        }
      });

      setNearbyPrompt((prev) => {
        if (!closestPrompt && !prev) return null;
        if (closestPrompt && prev && prev.id === closestPrompt.id) return prev;
        return closestPrompt
          ? {
              type: closestPrompt.type,
              id: closestPrompt.id,
              titleZh: closestPrompt.titleZh,
              subZh: closestPrompt.subZh,
            }
          : null;
      });

      const damp = 0.085;
      sim.camYaw += (sim.camTargetYaw - sim.camYaw) * damp;
      sim.camPitch += (sim.camTargetPitch - sim.camPitch) * damp;
      sim.camDist += (sim.camTargetDist - sim.camDist) * damp;
      sim.camFocus.lerp(sim.camTargetFocus, damp);

      const cp = Math.cos(sim.camPitch);
      const sp = Math.sin(sim.camPitch);
      const cy = Math.cos(sim.camYaw);
      const sy = Math.sin(sim.camYaw);

      camera.position.set(
        sim.camFocus.x + sim.camDist * cp * sy,
        sim.camFocus.y + sim.camDist * sp,
        sim.camFocus.z + sim.camDist * cp * cy
      );
      camera.lookAt(sim.camFocus);

      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    simRef.current.photoPlanes.forEach((item) => {
      const photo = photos[item.photoIndex % photos.length];
      if (!photo) return;
      const url = photo.thumbnailUrl || photo.imageUrl;
      loader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          const mat = item.mesh.material as THREE.MeshBasicMaterial;
          mat.map = tex;
          mat.needsUpdate = true;
        },
        undefined,
        () => {}
      );
    });
  }, [photos]);

  const raycasterRef = useRef(new THREE.Raycaster());

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const sim = simRef.current;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is unsupported
    }
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 2) {
      // Begin 2-finger pinch-to-zoom
      const pts = Array.from(activePointersRef.current.values());
      pinchStartDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartCamDistRef.current = sim.camTargetDist;
      sim.dragMoved = true;
      sim.isDragging = false;
      return;
    }

    sim.isDragging = true;
    sim.dragMoved = false;
    sim.dragStartX = e.clientX;
    sim.dragStartY = e.clientY;
    sim.dragStartYaw = sim.camTargetYaw;
    sim.dragStartPitch = sim.camTargetPitch;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const sim = simRef.current;
    const container = mountRef.current;
    if (!container || !sim.camera) return;

    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Two-finger pinch zoom on mobile
    if (activePointersRef.current.size === 2 && pinchStartDistRef.current !== null) {
      const pts = Array.from(activePointersRef.current.values());
      const curDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const delta = pinchStartDistRef.current - curDist;
      sim.camTargetDist = Math.max(7.5, Math.min(46, pinchStartCamDistRef.current + delta * 0.06));
      sim.dragMoved = true;
      setHoveredLabel(null);
      return;
    }

    if (sim.isDragging) {
      const dx = e.clientX - sim.dragStartX;
      const dy = e.clientY - sim.dragStartY;
      const threshold = e.pointerType === 'touch' ? 12 : 5;
      if (Math.hypot(dx, dy) > threshold) {
        sim.dragMoved = true;
      }
      sim.camTargetYaw = sim.dragStartYaw - dx * 0.0075;
      const minPitch = sim.underwaterMode ? -0.32 : 0.14;
      const maxPitch = sim.underwaterMode ? 0.65 : 1.18;
      sim.camTargetPitch = Math.max(minPitch, Math.min(maxPitch, sim.dragStartPitch + dy * 0.006));
      setHoveredLabel(null);
      return;
    }

    // Skip hover raycasting for touch pointers to save mobile GPU/CPU
    if (e.pointerType === 'touch') return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycasterRef.current.setFromCamera(mouse, sim.camera);

    const hitTarget = sim.interactiveMeshes.find((item) => {
      const hits = raycasterRef.current.intersectObject(item.mesh, true);
      return hits.length > 0;
    });

    if (hitTarget) {
      container.style.cursor = 'pointer';
      if (hitTarget.kind === 'easel') {
        const ea = EASEL_CONFIGS.find((x) => x.id === hitTarget.id);
        const p = ea ? photos[ea.photoIndex % photos.length] : null;
        setHoveredLabel({
          x: e.clientX,
          y: e.clientY,
          title: p?.title || '摄影画架',
          subtitle: `${ea?.locationZh || ''} · 点击赏析大图`,
        });
      } else if (hitTarget.kind === 'memory') {
        const mem = PERSONAL_MEMORIES.find((x) => x.id === hitTarget.id);
        setHoveredLabel({
          x: e.clientX,
          y: e.clientY,
          title: `${mem?.indexLabel || ''} · ${mem?.titleZh || '个人记忆'}`,
          subtitle: `${mem?.categoryZh || ''} · 点击翻阅记忆手账`,
        });
      } else {
        const st = SPECIAL_STATIONS.find((x) => x.id === hitTarget.id);
        setHoveredLabel({
          x: e.clientX,
          y: e.clientY,
          title: st?.nameZh || '',
          subtitle: st?.hintZh || '',
        });
      }
    } else {
      container.style.cursor = 'grab';
      setHoveredLabel(null);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchStartDistRef.current = null;
    }
    simRef.current.isDragging = false;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const sim = simRef.current;
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchStartDistRef.current = null;
    }
    const wasMoved = sim.dragMoved;
    sim.isDragging = false;
    if (wasMoved || !sim.camera || !mountRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycasterRef.current.setFromCamera(mouse, sim.camera);

    for (const item of sim.interactiveMeshes) {
      const hits = raycasterRef.current.intersectObject(item.mesh, true);
      if (hits.length > 0) {
        if (item.kind === 'easel') {
          const easel = EASEL_CONFIGS.find((ea) => ea.id === item.id);
          if (easel) inspectEasel(easel);
        } else if (item.kind === 'memory') {
          const mem = PERSONAL_MEMORIES.find((m) => m.id === item.id);
          if (mem) inspectMemory(mem);
        } else {
          playWindChimeNote(3, soundMuted);
          setActiveStation(item.id as SpecialStation['id']);
          sim.playerTarget = new THREE.Vector3(item.worldPos.x, item.worldPos.y, item.worldPos.z);
        }
        return;
      }
    }

    const terrainHits = raycasterRef.current.intersectObjects(sim.terrainMeshes, true);
    if (terrainHits.length > 0) {
      const pt = terrainHits[0].point;
      const ground = getTerrainHeightAt(pt.x, pt.z);
      if (ground.walkable) {
        playTactileClick(560);
        sim.playerTarget = new THREE.Vector3(pt.x, ground.y, pt.z);
        sim.camTargetFocus.set(pt.x, ground.y + 1.1, pt.z);
        setActiveZoneId(ground.zoneId);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const sim = simRef.current;
    const delta = e.deltaY > 0 ? 1.8 : -1.8;
    sim.camTargetDist = Math.max(7.5, Math.min(46, sim.camTargetDist + delta));
  };

  const selectedPhoto: Photo | null = useMemo(() => {
    if (!selectedEasel) return null;
    return photos[selectedEasel.photoIndex % photos.length] || null;
  }, [selectedEasel, photos]);

  const currentAtmo = useMemo(() => computeAtmosphere(timeOfDay), [timeOfDay]);

  const handleAddDriftBottle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBottleText.trim()) return;
    playWindChimeNote(4, soundMuted);
    setDriftBottles((prev) => [
      {
        id: Date.now(),
        author: newBottleAuthor.trim() || '远方旅人 · Anonymous',
        text: newBottleText.trim(),
        date: '2026.11 · 刚刚投递',
      },
      ...prev,
    ]);
    setNewBottleText('');
    setNewBottleAuthor('');
  };

  const updateJoystickFromClient = (clientX: number, clientY: number) => {
    const base = joyBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.36;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setJoyKnob({ x: dx, y: dy });
    simRef.current.joyX = dx / maxR;
    simRef.current.joyY = -dy / maxR;
  };

  const handleJoyPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    joyPointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    updateJoystickFromClient(e.clientX, e.clientY);
  };

  const handleJoyPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joyPointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    updateJoystickFromClient(e.clientX, e.clientY);
  };

  const handleJoyPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joyPointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    joyPointerIdRef.current = null;
    setJoyKnob({ x: 0, y: 0 });
    simRef.current.joyX = 0;
    simRef.current.joyY = 0;
  };

  const handleBack = () => {
    if (onExit) {
      onExit();
    } else {
      navigate('/interests');
    }
  };

  return (
    <div
      className={`relative ${
        embedded ? 'w-full h-[640px] rounded-2xl' : 'w-screen h-[100dvh]'
      } overflow-hidden select-none bg-[#F3F1EC] dark:bg-[#0D0D0C] font-sans`}
    >
      {/* 1. Three.js WebGL 3D Viewport Container (touch-none enables full mobile drag & pinch-zoom!) */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onWheel={handleWheel}
        className="w-full h-full block touch-none cursor-grab active:cursor-grabbing"
      />

      {/* Hover 3D Object Floating Tooltip */}
      {hoveredLabel && !selectedEasel && !activeStation && !selectedMemory && (
        <div
          style={{ left: hoveredLabel.x + 14, top: hoveredLabel.y - 18 }}
          className="fixed z-30 pointer-events-none px-3.5 py-2 rounded-xl bg-[#FAF9F5]/95 dark:bg-[#141413]/95 text-[#141413] dark:text-[#F0EFEA] border border-[#E6E2D8] dark:border-[#2A2925] backdrop-blur-xl shadow-lg"
        >
          <div className="text-xs font-serif font-semibold text-[#141413] dark:text-[#FAF9F5]">
            {hoveredLabel.title}
          </div>
          <div className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E] mt-0.5">
            {hoveredLabel.subtitle}
          </div>
        </div>
      )}

      {/* Camera Shutter White Flash Overlay */}
      <AnimatePresence>
        {shutterFlash && (
          <motion.div
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-50 bg-[#FAF9F5] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 2. Top-Left Back Button + Island Compass & Exploration Guide */}
      <div className="absolute top-3 left-3 md:top-4 md:left-4 z-30 flex flex-col gap-2 max-w-[72vw] md:max-w-xs pointer-events-auto">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#FAF9F5]/90 dark:bg-[#141413]/90 hover:bg-[#141413] hover:text-[#FAF9F5] dark:hover:bg-[#F0EFEA] dark:hover:text-[#141413] text-[#141413] dark:text-[#F0EFEA] border border-[#E6E2D8] dark:border-[#2A2925] backdrop-blur-xl shadow-sm text-xs font-mono tracking-wide flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="sm:hidden">{embedded ? td('收起', 'Close') : td('返回', 'Back')}</span>
            <span className="hidden sm:inline">
              {embedded ? td('收起 3D 预览', 'Collapse 3D') : td('返回日常与兴趣', 'Back to Digital Garden')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick(680);
              setShowMemoryIndex((v) => !v);
            }}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border backdrop-blur-xl shadow-sm text-xs font-mono flex items-center gap-1.5 transition-colors ${
              showMemoryIndex
                ? 'bg-[#8A6F48] text-[#FAF9F5] border-[#8A6F48]'
                : 'bg-[#FAF9F5]/90 dark:bg-[#141413]/90 text-[#8A6F48] dark:text-[#C8A97E] border-[#E6E2D8] dark:border-[#2A2925] hover:border-[#8A6F48]'
            }`}
            title={td('个人记忆与岛屿导览', 'Memory & Island Guide')}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>
              {td('记忆', 'Mem')} {discoveredMemoryIds.length}/{PERSONAL_MEMORIES.length}
            </span>
          </button>
        </div>

        <AnimatePresence>
          {showMemoryIndex && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-2.5 rounded-2xl bg-[#FAF9F5]/95 dark:bg-[#141413]/95 border border-[#E6E2D8] dark:border-[#2A2925] backdrop-blur-xl shadow-xl space-y-1 max-h-[65vh] overflow-y-auto"
            >
              {/* Mobile-only Island Quick Teleports inside drawer so main view stays uncluttered */}
              <div className="md:hidden pb-2 mb-1.5 border-b border-[#E6E2D8] dark:border-[#262522]">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-[#8C877E]">
                  {td('主群岛传送', 'ISLAND ZONES')}
                </div>
                <div className="flex flex-wrap gap-1 px-1">
                  {ISLAND_ZONES.map((zone, idx) => {
                    const active = activeZoneId === zone.id;
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => {
                          setShowMemoryIndex(false);
                          teleportToZone(zone, idx);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 border ${
                          active
                            ? 'bg-[#141413] text-[#FAF9F5] border-[#141413] dark:bg-[#F0EFEA] dark:text-[#141413]'
                            : 'bg-[#F3F1EC] dark:bg-[#1E1D1A] text-[#524E48] dark:text-[#B5B0A6] border-[#E6E2D8] dark:border-[#2A2925]'
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: active ? '#C8A97E' : zone.badgeColor }}
                        />
                        <span>{zone.nameZh.split(' · ')[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.16em] text-[#8A6F48] dark:text-[#C8A97E]">
                <span>
                  {td(`个人记忆地标 · ${PERSONAL_MEMORIES.length} 处`, `PERSONAL MEMORIES · ${PERSONAL_MEMORIES.length}`)}
                </span>
                <span className="flex items-center gap-1 text-[#8C877E]">
                  {unlockedMemoryIds.length > 0 ? (
                    <Unlock className="w-3 h-3 text-[#8A6F48]" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  {unlockedMemoryIds.length}/{PERSONAL_MEMORIES.length} {td('已显影', 'Unlocked')}
                </span>
              </div>
              {PERSONAL_MEMORIES.map((mem) => {
                const isMemUnlocked = unlockedMemoryIds.includes(mem.id);
                return (
                  <button
                    key={mem.id}
                    type="button"
                    onClick={() => {
                      setShowMemoryIndex(false);
                      inspectMemory(mem, false);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl hover:bg-[#F3F1EC] dark:hover:bg-[#1E1D1A] text-left flex items-center justify-between gap-2 transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-serif font-medium text-[#141413] dark:text-[#FAF9F5] group-hover:text-[#8A6F48] dark:group-hover:text-[#C8A97E] truncate flex items-center gap-1.5">
                        <span className="truncate">{mem.titleZh}</span>
                        {isMemUnlocked && <Unlock className="w-2.5 h-2.5 text-[#8A6F48] shrink-0" />}
                      </div>
                      <div className="text-[10px] font-mono text-[#8C877E] truncate">{mem.eraZh}</div>
                    </div>
                    <span className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E] shrink-0">
                      {mem.indexLabel} ↗
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden md:block px-4 py-3 rounded-2xl bg-[#FAF9F5]/90 dark:bg-[#141413]/90 text-[#141413] dark:text-[#F0EFEA] backdrop-blur-xl border border-[#E6E2D8]/90 dark:border-[#2A2925] shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8A6F48] dark:bg-[#C8A97E] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#8A6F48] dark:text-[#C8A97E]">
                {td('光影拾遗岛 · 3D', 'SHUTTER ISLAND · 3D')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[#F3F1EC] dark:bg-[#1E1D1A] border border-[#E6E2D8] dark:border-[#2C2B27] text-[#8A6F48] dark:text-[#C8A97E] text-[10px] font-mono">
                {discoveredIds.length}/{EASEL_CONFIGS.length} {td('画架', 'Frames')}
              </span>
              <button
                type="button"
                onClick={() => setShowControlsHint((v) => !v)}
                className={`p-1 rounded-full border transition-colors ${
                  showControlsHint
                    ? 'bg-[#141413] text-[#FAF9F5] border-[#141413] dark:bg-[#F0EFEA] dark:text-[#141413] dark:border-[#F0EFEA]'
                    : 'bg-[#F3F1EC] dark:bg-[#1E1D1A] text-[#8C877E] border-[#E6E2D8] dark:border-[#2C2B27] hover:text-[#141413] dark:hover:text-[#FAF9F5]'
                }`}
                title={td('操作说明', 'Controls Guide')}
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>

          <h1 className="mt-1.5 font-serif text-base font-medium tracking-tight text-[#141413] dark:text-[#FAF9F5]">
            {ISLAND_ZONES.find((z) => z.id === activeZoneId)?.nameZh || '01 · 拾光主岛'}
          </h1>
          <p className="text-[11px] text-[#6E6A63] dark:text-[#9E9A92] mt-0.5 leading-relaxed">
            {ISLAND_ZONES.find((z) => z.id === activeZoneId)?.subtitleZh}
          </p>

          <AnimatePresence>
            {showControlsHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2.5 pt-2.5 border-t border-[#E6E2D8] dark:border-[#262522] flex flex-wrap items-center gap-1.5 text-[10px] text-[#6E6A63] dark:text-[#9E9A92] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-[#F3F1EC] dark:bg-[#1E1D1A] border border-[#E6E2D8] dark:border-[#2C2B27] text-[#141413] dark:text-[#F0EFEA]">
                    WASD / 点击草地
                  </span>
                  <span>漫步</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F3F1EC] dark:bg-[#1E1D1A] border border-[#E6E2D8] dark:border-[#2C2B27] text-[#141413] dark:text-[#F0EFEA]">
                    拖拽
                  </span>
                  <span>环视</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F3F1EC] dark:bg-[#1E1D1A] border border-[#E6E2D8] dark:border-[#2C2B27] text-[#8A6F48] dark:text-[#C8A97E]">
                    点击 3D 画架
                  </span>
                  <span>看展</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden md:flex flex-wrap gap-1.5">
          {ISLAND_ZONES.map((zone, idx) => {
            const active = activeZoneId === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => teleportToZone(zone, idx)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono backdrop-blur-xl transition-all flex items-center gap-1.5 border ${
                  active
                    ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F0EFEA] dark:text-[#141413] border-[#141413] dark:border-[#F0EFEA] shadow-sm'
                    : 'bg-[#FAF9F5]/85 dark:bg-[#141413]/85 text-[#524E48] dark:text-[#B5B0A6] border-[#E6E2D8] dark:border-[#2A2925] hover:border-[#8A6F48] dark:hover:border-[#C8A97E] hover:text-[#141413] dark:hover:text-[#FAF9F5]'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: active ? '#C8A97E' : zone.badgeColor }}
                />
                <span>{zone.nameZh.split(' · ')[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Top-Right Golden Hour Time-of-Day Controller & Viewfinder Toggle */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-30 flex flex-col items-end gap-2 pointer-events-auto">
        {!showTimePanel ? (
          <button
            type="button"
            onClick={() => {
              playTactileClick(680);
              setShowTimePanel(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#FAF9F5]/90 dark:bg-[#141413]/90 text-[#8A6F48] dark:text-[#C8A97E] border border-[#E6E2D8] dark:border-[#2A2925] backdrop-blur-xl shadow-sm text-xs font-mono flex items-center gap-1.5"
            title={td('展开天时控制', 'Open Time of Day')}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>
              {Math.floor(timeOfDay).toString().padStart(2, '0')}:
              {Math.floor((timeOfDay % 1) * 60)
                .toString()
                .padStart(2, '0')}
            </span>
          </button>
        ) : (
          <div className="px-4 py-3 rounded-2xl bg-[#FAF9F5]/90 dark:bg-[#141413]/90 text-[#141413] dark:text-[#F0EFEA] backdrop-blur-xl border border-[#E6E2D8]/90 dark:border-[#2A2925] shadow-lg w-64 sm:w-72">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-mono text-[11px] text-[#8A6F48] dark:text-[#C8A97E] flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                {currentAtmo.labelZh}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[#6E6A63] dark:text-[#9E9A92]">
                  {Math.floor(timeOfDay).toString().padStart(2, '0')}:
                  {Math.floor((timeOfDay % 1) * 60)
                    .toString()
                    .padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => setShowTimePanel(false)}
                  className="md:hidden p-0.5 rounded text-[#8C877E] hover:text-[#141413] dark:hover:text-[#FAF9F5]"
                  title={td('收起', 'Collapse')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={23.9}
              step={0.1}
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
              className="w-full accent-[#8A6F48] dark:accent-[#C8A97E] cursor-pointer h-1.5 bg-[#E6E2D8] dark:bg-[#2A2925] rounded-lg"
            />

            <div className="mt-2.5 grid grid-cols-5 gap-1 text-[10px] font-mono">
              {[
                { label: '晨雾', hour: 6.5, icon: <CloudSun className="w-3 h-3" /> },
                { label: '晴空', hour: 13.0, icon: <Sun className="w-3 h-3" /> },
                { label: '黄金', hour: 17.5, icon: <Sunset className="w-3 h-3" /> },
                { label: '蓝调', hour: 19.4, icon: <Sparkles className="w-3 h-3" /> },
                { label: '星野', hour: 22.5, icon: <Moon className="w-3 h-3" /> },
              ].map((preset) => {
                const isCurrent = Math.abs(timeOfDay - preset.hour) < 1.1;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      playTactileClick(680);
                      setTimeOfDay(preset.hour);
                    }}
                    className={`py-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all border ${
                      isCurrent
                        ? 'bg-[#141413] text-[#FAF9F5] border-[#141413] dark:bg-[#F0EFEA] dark:text-[#141413] dark:border-[#F0EFEA]'
                        : 'bg-[#F3F1EC]/90 dark:bg-[#1C1B18] text-[#6E6A63] dark:text-[#9E9A92] border-transparent hover:border-[#E6E2D8] dark:hover:border-[#2C2B27] hover:text-[#141413] dark:hover:text-[#FAF9F5]'
                    }`}
                  >
                    {preset.icon}
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              playTactileClick(760);
              setViewfinderMode((v) => !v);
            }}
            className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 backdrop-blur-xl border transition-all shadow-sm ${
              viewfinderMode
                ? 'bg-[#8A6F48] text-[#FAF9F5] border-[#8A6F48]'
                : 'bg-[#FAF9F5]/90 dark:bg-[#141413]/90 text-[#141413] dark:text-[#F0EFEA] border-[#E6E2D8] dark:border-[#2A2925] hover:border-[#8A6F48] dark:hover:border-[#C8A97E]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{viewfinderMode ? '退出取景 [V]' : '取景器 [V]'}</span>
          </button>

          <button
            type="button"
            onClick={captureIslandPostcard}
            className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 bg-[#141413] hover:bg-[#8A6F48] text-[#FAF9F5] dark:bg-[#F0EFEA] dark:hover:bg-[#C8A97E] dark:text-[#141413] border border-transparent shadow-sm transition-colors"
            title="拍下当前 3D 小岛明信片"
          >
            <Aperture className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">拍明信片</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick(600);
              const sim = simRef.current;
              sim.camTargetYaw = -0.32;
              sim.camTargetPitch = 0.42;
              sim.camTargetDist = 17.5;
              sim.camTargetFocus.set(sim.playerPos.x, sim.playerPos.y + 1.1, sim.playerPos.z);
            }}
            className="p-2 rounded-xl bg-[#FAF9F5]/90 dark:bg-[#141413]/90 text-[#524E48] dark:text-[#B5B0A6] hover:text-[#141413] dark:hover:text-[#FAF9F5] border border-[#E6E2D8] dark:border-[#2A2925] hover:border-[#8A6F48] backdrop-blur-xl shadow-sm transition-colors"
            title="重置镜头视角"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSoundMuted((m) => !m)}
            className="p-2 rounded-xl bg-[#FAF9F5]/90 dark:bg-[#141413]/90 text-[#524E48] dark:text-[#B5B0A6] hover:text-[#141413] dark:hover:text-[#FAF9F5] border border-[#E6E2D8] dark:border-[#2A2925] hover:border-[#8A6F48] backdrop-blur-xl shadow-sm transition-colors"
            title={soundMuted ? '开启快门与风铃音效' : '静音'}
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4 text-[#9E553F]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />
            )}
          </button>

          {!embedded && (
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#FAF9F5]/90 dark:bg-[#141413]/90 text-[#524E48] dark:text-[#B5B0A6] hover:text-[#141413] dark:hover:text-[#FAF9F5] border border-[#E6E2D8] dark:border-[#2A2925] hover:border-[#8A6F48] backdrop-blur-xl shadow-sm transition-colors"
              title={theme === 'dark' ? '切换浅色纸面主题' : '切换深色暗房主题'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>

        {capturedPostcards.length > 0 && (
          <div className="px-3 py-2 rounded-2xl bg-[#FAF9F5]/90 dark:bg-[#141413]/90 border border-[#E6E2D8] dark:border-[#2A2925] backdrop-blur-xl shadow-sm flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E]">
              明信片夹
            </span>
            <div className="flex items-center gap-1.5">
              {capturedPostcards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setPreviewPostcard(card)}
                  className="w-10 h-7 rounded-md overflow-hidden border border-[#E6E2D8] dark:border-[#2A2925] hover:border-[#8A6F48] hover:scale-105 transition-all"
                >
                  <img src={card.dataUrl} alt={card.zoneLabel} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Retro SLR Optical Viewfinder HUD Overlay */}
      <AnimatePresence>
        {viewfinderMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-10"
          >
            <div className="absolute inset-12 border border-[#C8A97E]/45 rounded-lg">
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-[#C8A97E]/20" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-[#C8A97E]/20" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-[#C8A97E]/20" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-[#C8A97E]/20" />

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-[#C8A97E]/70 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 border border-[#E5D3B3]" />
              </div>
            </div>

            <div className="mt-auto mb-16 mx-auto px-5 py-2 rounded-full bg-[#141413]/90 border border-[#C8A97E]/35 text-[#E5D3B3] backdrop-blur-md font-mono text-xs flex items-center gap-5 pointer-events-auto shadow-xl">
              <span>AF-S · 35mm f/1.4</span>
              <span>SS 1/1000</span>
              <span>ISO {timeOfDay > 19 || timeOfDay < 6 ? '800' : '100'}</span>
              <span>EV -0.3</span>
              <button
                type="button"
                onClick={captureIslandPostcard}
                className="px-3.5 py-1 rounded-full bg-[#C8A97E] text-[#141413] font-medium hover:bg-[#DFC69E] transition-colors"
              >
                ● 按下快门 [Space]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4B. Underwater Freediving Immersion Vignette & Controls */}
      <AnimatePresence>
        {underwaterMode && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 42%, rgba(56,189,248,0.04) 35%, rgba(2,56,94,0.36) 100%)',
              }}
            />
            {!selectedMemory && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                className="absolute bottom-16 right-3 md:bottom-20 md:right-auto md:left-1/2 md:-translate-x-1/2 z-30 pointer-events-auto flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-2xl bg-[#082F49]/90 text-[#E0F2FE] border border-[#38BDF8]/35 backdrop-blur-xl shadow-xl"
              >
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                <span className="hidden sm:inline text-[11px] font-mono tracking-wide text-[#BAE6FD]">
                  {td('水下自由潜视角 · DEPTH -4.2M（可拖拽环视水底）', 'UNDERWATER · -4.2M (Drag to look around)')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const mem = PERSONAL_MEMORIES.find((m) => m.id === 'freedive-crimson');
                    if (mem) setSelectedMemory(mem);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[#38BDF8]/20 hover:bg-[#38BDF8]/35 border border-[#38BDF8]/40 text-[11px] font-mono text-[#E0F2FE] transition-colors"
                >
                  {td('记忆手账', 'Journal')}
                </button>
                <button
                  type="button"
                  onClick={surfaceFromUnderwater}
                  className="px-2.5 py-1 rounded-xl bg-[#FAF9F5] hover:bg-[#C8A97E] text-[#141413] text-[11px] font-mono transition-colors"
                >
                  {td('浮出水面 ↑', 'Surface ↑')}
                </button>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* 4C. Mobile Virtual Thumbstick for Smooth 360° Touch Walking */}
      {!selectedEasel && !activeStation && !selectedMemory && !previewPostcard && (
        <div
          ref={joyBaseRef}
          onPointerDown={handleJoyPointerDown}
          onPointerMove={handleJoyPointerMove}
          onPointerUp={handleJoyPointerEnd}
          onPointerCancel={handleJoyPointerEnd}
          className="md:hidden absolute bottom-16 left-3 z-30 w-20 h-20 rounded-full bg-[#FAF9F5]/65 dark:bg-[#141413]/65 opacity-80 active:opacity-100 border border-[#E6E2D8]/80 dark:border-[#2A2925]/80 backdrop-blur-md shadow-md touch-none flex items-center justify-center pointer-events-auto"
          aria-label="移动摇杆"
        >
          <div className="w-11 h-11 rounded-full border border-dashed border-[#8A6F48]/35 dark:border-[#C8A97E]/35 pointer-events-none" />
          <div
            style={{
              transform: `translate(${joyKnob.x}px, ${joyKnob.y}px)`,
            }}
            className="absolute w-8 h-8 rounded-full bg-[#141413]/85 dark:bg-[#C8A97E] border-2 border-[#FAF9F5] dark:border-[#141413] shadow-sm pointer-events-none transition-transform duration-75"
          />
        </div>
      )}

      {/* 5. Proximity Interaction Prompt Banner */}
      <AnimatePresence>
        {nearbyPrompt && !selectedEasel && !activeStation && !selectedMemory && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="absolute bottom-16 right-3 max-w-[66vw] md:max-w-none md:bottom-20 md:right-auto md:left-1/2 md:-translate-x-1/2 z-30 pointer-events-auto"
          >
            <button
              type="button"
              onClick={() => {
                if (nearbyPrompt.type === 'easel') {
                  const found = EASEL_CONFIGS.find((ea) => ea.id === nearbyPrompt.id);
                  if (found) inspectEasel(found);
                } else if (nearbyPrompt.type === 'memory') {
                  const foundMem = PERSONAL_MEMORIES.find((m) => m.id === nearbyPrompt.id);
                  if (foundMem) inspectMemory(foundMem);
                } else {
                  playWindChimeNote(2, soundMuted);
                  setActiveStation(nearbyPrompt.id as SpecialStation['id']);
                }
              }}
              className="px-3 py-2 md:px-4 md:py-2.5 rounded-2xl bg-[#FAF9F5]/95 dark:bg-[#141413]/95 hover:border-[#8A6F48] dark:hover:border-[#C8A97E] text-[#141413] dark:text-[#F0EFEA] border border-[#E6E2D8] dark:border-[#2A2925] backdrop-blur-xl shadow-xl flex items-center gap-2.5 md:gap-3 group transition-all"
            >
              <span className="hidden sm:inline-block px-2 py-1 rounded-lg bg-[#141413] text-[#FAF9F5] dark:bg-[#C8A97E] dark:text-[#141413] font-mono text-[11px] shrink-0">
                E / 点击
              </span>
              <div className="text-left min-w-0">
                <div className="font-serif text-xs md:text-sm font-medium text-[#141413] dark:text-[#FAF9F5] group-hover:text-[#8A6F48] dark:group-hover:text-[#C8A97E] flex items-center gap-1 transition-colors truncate">
                  <span className="truncate">{nearbyPrompt.titleZh}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                </div>
                <div className="hidden sm:block text-[11px] text-[#6E6A63] dark:text-[#9E9A92]">{nearbyPrompt.subZh}</div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Bottom 35mm Filmstrip Navigation Bar (Zero Native Scrollbar) */}
      <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 z-30 max-w-[96%] pointer-events-auto">
        <div className="px-2 py-1.5 md:px-2.5 md:py-2 rounded-2xl bg-[#FAF9F5]/95 dark:bg-[#141413]/90 backdrop-blur-xl border border-[#E6E2D8] dark:border-[#2A2925] shadow-lg flex items-center gap-1.5 md:gap-2">
          <div className="flex items-center gap-1.5 pl-1 pr-2 md:pr-2.5 border-r border-[#E6E2D8] dark:border-[#2A2925] shrink-0">
            <Film className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
            <span className="text-[11px] font-mono tracking-wide text-[#524E48] dark:text-[#B5B0A6] hidden md:inline">
              35mm 胶卷
            </span>
          </div>

          <button
            type="button"
            onClick={() => filmstripRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}
            className="hidden sm:inline-flex p-1 rounded-lg text-[#8C877E] hover:text-[#141413] dark:hover:text-[#FAF9F5] hover:bg-[#F3F1EC] dark:hover:bg-[#1E1D1A] transition-colors shrink-0"
            title="向左滚动胶卷"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div
            ref={filmstripRef}
            onWheel={(e) => {
              if (Math.abs(e.deltaY) > 0) {
                e.stopPropagation();
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            className="flex items-center gap-1.5 overflow-x-auto max-w-[54vw] sm:max-w-[52vw] lg:max-w-[60vw] py-0.5 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {EASEL_CONFIGS.map((easel, idx) => {
              const photo = photos[easel.photoIndex % photos.length];
              const isSelected = selectedEasel?.id === easel.id;
              const isDiscovered = discoveredIds.includes(easel.id);
              return (
                <button
                  key={easel.id}
                  type="button"
                  onClick={() => inspectEasel(easel)}
                  className={`group relative shrink-0 w-10 h-7 sm:w-12 sm:h-9 rounded-lg overflow-hidden border transition-all ${
                    isSelected
                      ? 'border-[#8A6F48] dark:border-[#C8A97E] ring-2 ring-[#8A6F48]/40 dark:ring-[#C8A97E]/40 scale-105'
                      : isDiscovered
                        ? 'border-[#8A6F48]/45 dark:border-[#C8A97E]/45 hover:border-[#141413] dark:hover:border-[#FAF9F5]'
                        : 'border-[#E6E2D8] dark:border-[#2A2925] opacity-85 hover:opacity-100'
                  }`}
                  title={`${idx + 1}. ${photo?.title || '摄影作品'} (${easel.locationZh})`}
                >
                  <img
                    src={photo?.thumbnailUrl || photo?.imageUrl}
                    alt={photo?.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141413]/75 via-transparent to-transparent flex items-end justify-between px-1 pb-0.5">
                    <span className="text-[9px] font-mono text-[#FAF9F5]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {isDiscovered && <span className="w-1.5 h-1.5 rounded-full bg-[#C8A97E]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => filmstripRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}
            className="hidden sm:inline-flex p-1 rounded-lg text-[#8C877E] hover:text-[#141413] dark:hover:text-[#FAF9F5] hover:bg-[#F3F1EC] dark:hover:bg-[#1E1D1A] transition-colors shrink-0"
            title="向右滚动胶卷"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-px bg-[#E6E2D8] dark:bg-[#2A2925] shrink-0" />

          <div className="flex items-center gap-1.5 shrink-0">
            {SPECIAL_STATIONS.map((st) => {
              const active = activeStation === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    playWindChimeNote(1, soundMuted);
                    setSelectedEasel(null);
                    setActiveStation(st.id);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono shrink-0 border transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#141413] text-[#FAF9F5] border-[#141413] dark:bg-[#F0EFEA] dark:text-[#141413] dark:border-[#F0EFEA]'
                      : 'bg-[#F3F1EC]/90 dark:bg-[#1C1B18] text-[#524E48] dark:text-[#B5B0A6] border-[#E6E2D8] dark:border-[#2A2925] hover:border-[#8A6F48] dark:hover:border-[#C8A97E] hover:text-[#141413] dark:hover:text-[#FAF9F5]'
                  }`}
                >
                  {st.id === 'gear-bag' ? (
                    <>
                      <Briefcase className="w-3 h-3" />
                      <span className="hidden sm:inline">器材包</span>
                    </>
                  ) : st.id === 'campfire-projects' ? (
                    <>
                      <Flame className="w-3 h-3" />
                      <span className="hidden sm:inline">篝火造物</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3 h-3" />
                      <span className="hidden sm:inline">漂流瓶</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. Optical Bokeh Photo Lightbox & EXIF Field Notes Modal */}
      <AnimatePresence>
        {selectedEasel && selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#141413]/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedEasel(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 18, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 18, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full bg-[#FAF9F5] dark:bg-[#141413] border border-[#E6E2D8] dark:border-[#2A2925] rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 text-[#141413] dark:text-[#F0EFEA]"
            >
              <div className="lg:col-span-7 bg-[#1A1917] dark:bg-[#0B0B0A] relative flex items-center justify-center min-h-[320px] sm:min-h-[460px] p-6">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl border border-white/10"
                />

                <button
                  type="button"
                  onClick={() => {
                    const idx = EASEL_CONFIGS.findIndex((e) => e.id === selectedEasel.id);
                    const prev = EASEL_CONFIGS[(idx - 1 + EASEL_CONFIGS.length) % EASEL_CONFIGS.length];
                    inspectEasel(prev);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#FAF9F5]/90 dark:bg-[#141413]/85 hover:bg-[#8A6F48] hover:text-[#FAF9F5] text-[#141413] dark:text-[#F0EFEA] border border-[#E6E2D8] dark:border-[#2A2925] transition-colors shadow-md"
                  title="上一幅作品"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const idx = EASEL_CONFIGS.findIndex((e) => e.id === selectedEasel.id);
                    const next = EASEL_CONFIGS[(idx + 1) % EASEL_CONFIGS.length];
                    inspectEasel(next);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#FAF9F5]/90 dark:bg-[#141413]/85 hover:bg-[#8A6F48] hover:text-[#FAF9F5] text-[#141413] dark:text-[#F0EFEA] border border-[#E6E2D8] dark:border-[#2A2925] transition-colors shadow-md"
                  title="下一幅作品"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#8A6F48] dark:text-[#C8A97E]">
                      {selectedPhoto.category?.name || '光影拾遗'} // {selectedEasel.id.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedEasel(null)}
                      className="p-1.5 rounded-full bg-[#F3F1EC] dark:bg-[#1E1D1A] hover:bg-[#E6E2D8] dark:hover:bg-[#2A2925] text-[#6E6A63] dark:text-[#9E9A92] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h2 className="mt-3 font-serif text-2xl font-medium tracking-tight text-[#141413] dark:text-[#FAF9F5]">
                    {selectedPhoto.title}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-[#6E6A63] dark:text-[#9E9A92] font-mono">
                    <span className="flex items-center gap-1 text-[#8A6F48] dark:text-[#C8A97E]">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedEasel.locationZh}
                    </span>
                    <span>·</span>
                    <span>{selectedEasel.weatherZh}</span>
                  </div>

                  <div className="mt-5 p-4 rounded-xl bg-[#F3F1EC]/85 dark:bg-[#1A1917] border border-[#E6E2D8] dark:border-[#2A2925]">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#8A6F48] dark:text-[#C8A97E] mb-1.5 flex items-center gap-1.5">
                      <Camera className="w-3 h-3" />
                      <span>FIELD NOTE · 快门手记</span>
                    </div>
                    <p className="text-sm text-[#4A4741] dark:text-[#C9C5BC] leading-relaxed">
                      {td(selectedEasel.storyZh, selectedEasel.storyEn)}
                    </p>
                  </div>

                  <div className="mt-5">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#8C877E] mb-2">
                      EXIF TELEMETRY · 光学参数
                    </div>
                    {(() => {
                      const ex = resolvePhotoExif(selectedPhoto);
                      return (
                        <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                          <div className="p-3 rounded-xl bg-[#F3F1EC]/70 dark:bg-[#1A1917] border border-[#E6E2D8] dark:border-[#2A2925]">
                            <div className="text-[10px] text-[#8C877E]">CAMERA BODY</div>
                            <div className="text-[#141413] dark:text-[#FAF9F5] font-medium mt-0.5">
                              {ex.cameraFull}
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-[#F3F1EC]/70 dark:bg-[#1A1917] border border-[#E6E2D8] dark:border-[#2A2925]">
                            <div className="text-[10px] text-[#8C877E]">LENS &amp; FOCAL</div>
                            <div className="text-[#141413] dark:text-[#FAF9F5] font-medium mt-0.5">
                              {ex.lens} · {ex.focalLength}
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-[#F3F1EC]/70 dark:bg-[#1A1917] border border-[#E6E2D8] dark:border-[#2A2925]">
                            <div className="text-[10px] text-[#8C877E]">APERTURE &amp; SHUTTER</div>
                            <div className="text-[#8A6F48] dark:text-[#C8A97E] font-medium mt-0.5">
                              f/{ex.aperture} · {ex.shutterSpeed}s
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-[#F3F1EC]/70 dark:bg-[#1A1917] border border-[#E6E2D8] dark:border-[#2A2925]">
                            <div className="text-[10px] text-[#8C877E]">ISO &amp; FORMAT</div>
                            <div className="text-[#141413] dark:text-[#FAF9F5] font-medium mt-0.5">
                              ISO {ex.iso} · RAW / WebP
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E6E2D8] dark:border-[#262522] flex items-center justify-between text-xs text-[#6E6A63] dark:text-[#9E9A92]">
                  <span className="font-mono">
                    所在岛屿：
                    <strong className="text-[#141413] dark:text-[#FAF9F5] font-medium ml-1">
                      {ISLAND_ZONES.find((z) => z.id === selectedEasel.zoneId)?.nameZh.split(' · ')[1]}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playCameraShutterSound(soundMuted);
                      const zone = ISLAND_ZONES.find((z) => z.id === selectedEasel.zoneId);
                      if (zone) setActiveZoneId(zone.id);
                      setSelectedEasel(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#141413] hover:bg-[#8A6F48] text-[#FAF9F5] dark:bg-[#F0EFEA] dark:hover:bg-[#C8A97E] dark:text-[#141413] font-mono text-xs transition-colors"
                  >
                    继续在岛上漫步
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Special Island Station Modals */}
      <AnimatePresence>
        {activeStation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#141413]/75 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveStation(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 18 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl w-full bg-[#FAF9F5] dark:bg-[#141413] border border-[#E6E2D8] dark:border-[#2A2925] rounded-2xl p-6 sm:p-8 text-[#141413] dark:text-[#F0EFEA] shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {activeStation === 'gear-bag' && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8A6F48] dark:text-[#C8A97E] flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>01 // 拾光主岛 · 摄影师长椅与器材包</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveStation(null)}
                      className="p-1.5 rounded-full bg-[#F3F1EC] dark:bg-[#1E1D1A] hover:bg-[#E6E2D8] dark:hover:bg-[#2A2925] text-[#6E6A63] dark:text-[#9E9A92] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h2 className="mt-3 font-serif text-2xl font-medium tracking-tight">
                    关于岛主 · 光影与代码皆是造物
                  </h2>
                  <p className="mt-2 text-sm text-[#524E48] dark:text-[#B5B0A6] leading-relaxed">
                    欢迎来到我的 3D 治愈摄影小岛。我是一名常驻长沙的全栈与 AI Agent 工程师，也是一名喜欢带着 35mm 定焦镜头在江边、山林与老街拾荒光影的摄影爱好者。
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-xl bg-[#F3F1EC]/85 dark:bg-[#1A1917] border border-[#E6E2D8] dark:border-[#2A2925]">
                      <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#8A6F48] dark:text-[#C8A97E] mb-2.5 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        <span>主力机身与镜头 · GEAR LIST</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#4A4741] dark:text-[#C9C5BC] font-mono">
                        <li>• Sony α7C II (ILCE-7CM2) + FE 28-60mm F4-5.6</li>
                        <li>• Sony ZV-E10 + E PZ 16-50mm OSS / YN50mm f/1.8</li>
                        <li>• Xiaomi 14 · Leica Summilux 23mm f/1.6（街拍/日常）</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F3F1EC]/85 dark:bg-[#1A1917] border border-[#E6E2D8] dark:border-[#2A2925]">
                      <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#8A6F48] dark:text-[#C8A97E] mb-2.5 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        <span>岛屿探索指南 · ISLAND TIPS</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#4A4741] dark:text-[#C9C5BC]">
                        <li>• 拖动右上角「太阳轨迹滑块」，体验清晨、黄金时刻与星野</li>
                        <li>
                          • 按{' '}
                          <code className="px-1.5 py-0.5 rounded bg-[#FAF9F5] dark:bg-[#141413] border border-[#E6E2D8] dark:border-[#2A2925] font-mono text-[11px]">
                            V
                          </code>{' '}
                          键开启单反取景器拍下小岛明信片
                        </li>
                        <li>• 走向山顶篝火可查看我的 AI 与全栈工程代表作</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeStation === 'campfire-projects' && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8A6F48] dark:text-[#C8A97E] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      <span>02 // 云端观星台 · 篝火旁的数字造物手稿</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveStation(null)}
                      className="p-1.5 rounded-full bg-[#F3F1EC] dark:bg-[#1E1D1A] hover:bg-[#E6E2D8] dark:hover:bg-[#2A2925] text-[#6E6A63] dark:text-[#9E9A92] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="font-serif text-2xl font-medium tracking-tight">
                        除了摄影，我还在构建这些数字系统
                      </h2>
                      <p className="text-xs text-[#6E6A63] dark:text-[#9E9A92] mt-1">
                        在山顶篝火旁弹一首吉他和弦，翻阅我的 4 个核心工程作品：
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => playGuitarChord(Math.floor(Math.random() * 4))}
                      className="px-3.5 py-1.5 rounded-xl bg-[#F3F1EC] dark:bg-[#1E1D1A] hover:border-[#8A6F48] dark:hover:border-[#C8A97E] border border-[#E6E2D8] dark:border-[#2A2925] text-[#8A6F48] dark:text-[#C8A97E] text-xs font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <Music className="w-3.5 h-3.5" />
                      <span>拨动篝火吉他和弦</span>
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {LAB_PROJECTS.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-xl bg-[#F3F1EC]/75 dark:bg-[#1A1917] hover:border-[#8A6F48] dark:hover:border-[#C8A97E] border border-[#E6E2D8] dark:border-[#2A2925] transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">
                            <span>
                              {proj.num} · {proj.year}
                            </span>
                            <span className="text-[#8C877E]">{proj.role}</span>
                          </div>
                          <h3 className="mt-1.5 font-serif text-base font-medium text-[#141413] dark:text-[#FAF9F5]">
                            {proj.title}
                          </h3>
                          <p className="text-xs text-[#6E6A63] dark:text-[#9E9A92] mt-0.5">{proj.subtitle}</p>
                          <p className="mt-2 text-xs text-[#4A4741] dark:text-[#C9C5BC] leading-relaxed line-clamp-3">
                            {proj.summary}
                          </p>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-[#E6E2D8] dark:border-[#262522] flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#8C877E]">
                            {proj.stack.slice(0, 3).join(' · ')}
                          </span>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target={proj.link.startsWith('http') ? '_blank' : '_self'}
                              rel="noreferrer"
                              className="text-xs font-mono text-[#8A6F48] dark:text-[#C8A97E] hover:underline flex items-center gap-1"
                            >
                              <span>访问项目</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStation === 'drift-bottle' && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8A6F48] dark:text-[#C8A97E] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>03 // 浅滩木栈道 · 漂流瓶与海边红邮筒</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveStation(null)}
                      className="p-1.5 rounded-full bg-[#F3F1EC] dark:bg-[#1E1D1A] hover:bg-[#E6E2D8] dark:hover:bg-[#2A2925] text-[#6E6A63] dark:text-[#9E9A92] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h2 className="mt-3 font-serif text-2xl font-medium tracking-tight">
                    海面漂流瓶 · 留下你的登岛足迹
                  </h2>
                  <p className="mt-1 text-xs text-[#6E6A63] dark:text-[#9E9A92]">
                    在南岸浅滩的红邮筒旁，写下你对这座小岛或摄影作品的寄语。
                  </p>

                  <form onSubmit={handleAddDriftBottle} className="mt-4 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="你的署名（如：旅人 · 深圳）"
                      value={newBottleAuthor}
                      onChange={(e) => setNewBottleAuthor(e.target.value)}
                      className="sm:w-44 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1917] border border-[#E6E2D8] dark:border-[#2A2925] text-xs text-[#141413] dark:text-[#FAF9F5] placeholder:text-[#8C877E] focus:outline-none focus:border-[#8A6F48] dark:focus:border-[#C8A97E]"
                    />
                    <input
                      type="text"
                      placeholder="写下给小岛或摄影作品的留言，装进漂流瓶..."
                      value={newBottleText}
                      onChange={(e) => setNewBottleText(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1917] border border-[#E6E2D8] dark:border-[#2A2925] text-xs text-[#141413] dark:text-[#FAF9F5] placeholder:text-[#8C877E] focus:outline-none focus:border-[#8A6F48] dark:focus:border-[#C8A97E]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#141413] hover:bg-[#8A6F48] text-[#FAF9F5] dark:bg-[#F0EFEA] dark:hover:bg-[#C8A97E] dark:text-[#141413] font-mono text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>投进大海</span>
                    </button>
                  </form>

                  <div className="mt-5 space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {driftBottles.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-xl bg-[#F3F1EC]/80 dark:bg-[#1A1917] border border-[#E6E2D8] dark:border-[#2A2925] flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">
                          <span>{b.author}</span>
                          <span className="text-[#8C877E]">{b.date}</span>
                        </div>
                        <p className="text-sm text-[#4A4741] dark:text-[#C9C5BC] leading-relaxed">{b.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. Captured Polaroid Postcard Preview & Download Modal */}
      <AnimatePresence>
        {previewPostcard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#141413]/75 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewPostcard(null)}
          >
            <motion.div
              initial={{ scale: 0.92, rotate: -1.5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FAF9F5] dark:bg-[#1A1917] text-[#141413] dark:text-[#F0EFEA] border border-[#E6E2D8] dark:border-[#2A2925] p-4 pb-6 rounded-2xl shadow-2xl max-w-lg w-full"
            >
              <div className="relative rounded-xl overflow-hidden border border-[#E6E2D8] dark:border-[#2A2925] aspect-video bg-[#141413]">
                <img
                  src={previewPostcard.dataUrl}
                  alt="Island Postcard"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 px-1 flex items-center justify-between gap-3">
                <div>
                  <div className="font-serif italic text-lg font-medium text-[#141413] dark:text-[#FAF9F5]">
                    The Shutter Island · 光影拾遗岛
                  </div>
                  <div className="text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E] mt-0.5">
                    {previewPostcard.zoneLabel} · {previewPostcard.timeLabel}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewPostcard.dataUrl}
                    download={`shutter-island-${previewPostcard.id}.png`}
                    className="px-3.5 py-2 rounded-xl bg-[#141413] hover:bg-[#8A6F48] text-[#FAF9F5] dark:bg-[#F0EFEA] dark:hover:bg-[#C8A97E] dark:text-[#141413] text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>保存明信片</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewPostcard(null)}
                    className="p-2 rounded-xl bg-[#F3F1EC] dark:bg-[#262522] hover:bg-[#E6E2D8] dark:hover:bg-[#32302C] text-[#524E48] dark:text-[#B5B0A6] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10. Personal Memory Hand-Journal Modal (Passcode-Gated Original Photos) */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#141413]/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 18, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 18, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-[#FAF9F5] dark:bg-[#141413] border border-[#E6E2D8] dark:border-[#2A2925] rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 text-[#141413] dark:text-[#F0EFEA]"
            >
              {/* Left Stage: Locked Question Card OR Unlocked Original Photo(s) */}
              <div className="lg:col-span-7 bg-[#1A1917] dark:bg-[#0B0B0A] relative flex flex-col items-center justify-center min-h-[320px] sm:min-h-[440px] p-6">
                {!unlockedMemoryIds.includes(selectedMemory.id) ? (
                  <div className="max-w-sm w-full text-center px-5 py-7 rounded-2xl bg-[#22211E]/90 border border-[#C8A97E]/25 shadow-xl">
                    <div className="w-11 h-11 mx-auto rounded-full bg-[#C8A97E]/15 border border-[#C8A97E]/40 flex items-center justify-center text-[#C8A97E]">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.22em] text-[#C8A97E]">
                      MEMORY QUESTION · 记忆问答
                    </div>
                    <h3 className="mt-2 font-serif text-lg font-medium text-[#FAF9F5] leading-snug">
                      {td(selectedMemory.unlockQuestionZh, selectedMemory.unlockQuestionEn)}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#A8A39A] leading-relaxed">
                      {td(
                        '答对这道专属小问题，即可显影查看这组封存的真实档案。',
                        'Answer this personal memory question to develop and view the original archive.'
                      )}
                    </p>

                    <form onSubmit={handleUnlockMemories} className="mt-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <KeyRound className="w-3.5 h-3.5 text-[#8C877E] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={passphraseInput}
                            onChange={(e) => {
                              setPassphraseInput(e.target.value);
                              setPassphraseError(false);
                            }}
                            placeholder={td(
                              selectedMemory.unlockPlaceholderZh,
                              selectedMemory.unlockPlaceholderEn
                            )}
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#141413] border border-[#32302C] focus:border-[#C8A97E] text-xs font-mono text-[#FAF9F5] placeholder:text-[#6E6A63] focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#C8A97E] hover:bg-[#DFC69E] text-[#141413] font-mono text-xs font-medium shrink-0 transition-colors"
                        >
                          {td('显影', 'Unlock')}
                        </button>
                      </div>

                      {passphraseError ? (
                        <div className="text-[11px] font-mono text-[#FB7185] text-left">
                          {td('回答不对哦，再回忆一下试试看', 'Not quite right, try again')}
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-[#8C877E] text-left">
                          {td(MEMORY_PASSPHRASE_HINT_ZH, MEMORY_PASSPHRASE_HINT_EN)}
                        </div>
                      )}
                    </form>
                  </div>
                ) : selectedMemory.photos.length === 0 ? (
                  <div className="max-w-sm w-full text-center px-6 py-8 rounded-2xl bg-[#22211E]/90 border border-[#C8A97E]/30 shadow-xl">
                    <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#E85D2A]">
                      {selectedMemory.indexLabel} // 3D LANDMARK ARCHIVE · UNLOCKED
                    </div>
                    <h3 className="mt-2 font-serif text-xl font-medium text-[#FAF9F5]">
                      {td(selectedMemory.titleZh, selectedMemory.titleEn)}
                    </h3>
                    <p className="mt-2 text-xs font-serif tracking-widest text-[#DFC69E]">
                      {td('朴诚 · 奋勉 · 求实 · 创新', 'Simplicity · Diligence · Pragmatism · Innovation')}
                    </p>
                    <p className="mt-3 text-xs text-[#A8A39A] leading-relaxed">
                      {td(
                        '回答正确！该校园地标已以 3D 实景微缩形态完整落成，后续随时可在胶片档案中补充真实校园摄影作品。',
                        'Correct! This campus landmark is live in 3D diorama form. Real campus film frames can be attached anytime.'
                      )}
                    </p>
                  </div>
                ) : (
                  <motion.div
                    key={`${selectedMemory.id}-${memoryPhotoIdx}`}
                    initial={{ opacity: 0, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.45 }}
                    className="w-full flex flex-col items-center"
                  >
                    <img
                      src={selectedMemory.photos[memoryPhotoIdx % selectedMemory.photos.length]?.url}
                      alt={selectedMemory.titleZh}
                      className="max-h-[62vh] w-auto object-contain rounded-lg shadow-2xl border border-white/10"
                    />
                    <div className="mt-3 w-full flex items-center justify-between gap-3 px-1">
                      <span className="text-[11px] font-mono text-[#C8A97E]">
                        {td(
                          selectedMemory.photos[memoryPhotoIdx % selectedMemory.photos.length]?.captionZh || '',
                          selectedMemory.photos[memoryPhotoIdx % selectedMemory.photos.length]?.captionEn || ''
                        )}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {selectedMemory.photos.length > 1 && (
                          <div className="flex items-center gap-1">
                            {selectedMemory.photos.map((_, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setMemoryPhotoIdx(pIdx)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-colors ${
                                  memoryPhotoIdx === pIdx
                                    ? 'bg-[#C8A97E] text-[#141413] border-[#C8A97E]'
                                    : 'bg-white/5 text-[#B5B0A6] border-white/10 hover:border-[#C8A97E]/60'
                                }`}
                              >
                                {`0${pIdx + 1}`}
                              </button>
                            ))}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleLockMemories}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-mono text-[#A8A39A] flex items-center gap-1 transition-colors"
                          title={td('重新封存所有原图', 'Re-seal private photos')}
                        >
                          <Lock className="w-2.5 h-2.5" />
                          <span>{td('重新封存', 'Seal')}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Column: Editorial Memory Story */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#8A6F48] dark:text-[#C8A97E]">
                      {selectedMemory.indexLabel} // {td(selectedMemory.categoryZh, selectedMemory.categoryEn)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedMemory(null)}
                      className="p-1.5 rounded-full bg-[#F3F1EC] dark:bg-[#1E1D1A] hover:bg-[#E6E2D8] dark:hover:bg-[#2A2925] text-[#6E6A63] dark:text-[#9E9A92] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h2 className="mt-3 font-serif text-2xl font-medium tracking-tight text-[#141413] dark:text-[#FAF9F5]">
                    {td(selectedMemory.titleZh, selectedMemory.titleEn)}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-[#8A6F48] dark:text-[#C8A97E]">
                    <span>{selectedMemory.eraZh}</span>
                    <span>·</span>
                    <span className="text-[#6E6A63] dark:text-[#9E9A92]">
                      {selectedMemory.photos.length} {td('张封存胶片', 'film frames')}
                    </span>
                  </div>

                  <div className="mt-5 p-4 rounded-xl bg-[#F3F1EC]/85 dark:bg-[#1A1917] border border-[#E6E2D8] dark:border-[#2A2925]">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#8A6F48] dark:text-[#C8A97E] mb-1.5 flex items-center gap-1.5">
                      <Bookmark className="w-3 h-3" />
                      <span>MEMORY JOURNAL · 记忆手账</span>
                    </div>
                    <p className="text-sm text-[#4A4741] dark:text-[#C9C5BC] leading-relaxed">
                      {td(selectedMemory.storyZh, selectedMemory.storyEn)}
                    </p>
                  </div>

                  {selectedMemory.preferredTime !== undefined && (
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick(700);
                        setTimeOfDay(selectedMemory.preferredTime!);
                      }}
                      className="mt-4 w-full px-3.5 py-2 rounded-xl bg-[#F3F1EC] dark:bg-[#1E1D1A] hover:border-[#8A6F48] dark:hover:border-[#C8A97E] border border-[#E6E2D8] dark:border-[#2A2925] text-xs font-mono text-[#524E48] dark:text-[#B5B0A6] flex items-center justify-center gap-2 transition-colors"
                    >
                      <Sun className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
                      <span>
                        {td(
                          `切换小岛光影至记忆时刻 (${Math.floor(selectedMemory.preferredTime)}:00)`,
                          `Switch Island Light to Memory Hour (${Math.floor(selectedMemory.preferredTime)}:00)`
                        )}
                      </span>
                    </button>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#E6E2D8] dark:border-[#262522] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const idx = PERSONAL_MEMORIES.findIndex((m) => m.id === selectedMemory.id);
                        const prev = PERSONAL_MEMORIES[(idx - 1 + PERSONAL_MEMORIES.length) % PERSONAL_MEMORIES.length];
                        inspectMemory(prev, true);
                      }}
                      className="p-2 rounded-xl bg-[#F3F1EC] dark:bg-[#1E1D1A] hover:border-[#8A6F48] border border-[#E6E2D8] dark:border-[#2A2925] text-[#524E48] dark:text-[#B5B0A6] transition-colors"
                      title={td('上一个记忆点', 'Previous Memory')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const idx = PERSONAL_MEMORIES.findIndex((m) => m.id === selectedMemory.id);
                        const next = PERSONAL_MEMORIES[(idx + 1) % PERSONAL_MEMORIES.length];
                        inspectMemory(next, true);
                      }}
                      className="p-2 rounded-xl bg-[#F3F1EC] dark:bg-[#1E1D1A] hover:border-[#8A6F48] border border-[#E6E2D8] dark:border-[#2A2925] text-[#524E48] dark:text-[#B5B0A6] transition-colors"
                      title={td('下一个记忆点', 'Next Memory')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedMemory(null)}
                    className="px-4 py-2 rounded-xl bg-[#141413] hover:bg-[#8A6F48] text-[#FAF9F5] dark:bg-[#F0EFEA] dark:hover:bg-[#C8A97E] dark:text-[#141413] font-mono text-xs transition-colors"
                  >
                    {td('继续漫步小岛', 'Continue Exploring')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShutterIsland3D;
