import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Disc,
  Heart,
  MapPin,
  Send,
  Film,
  Sparkles,
  Camera,
  Compass,
  Maximize2,
  Sun,
  ListMusic,
  AlignLeft,
  Info,
  ChevronDown,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Crosshair,
  ExternalLink,
} from 'lucide-react';
import { useMusic, getQqMusicLink } from '../context/MusicContext';
import { useI18n } from '../i18n/i18nContext';
import { ImageWithFallback } from '../components/UI/ImageWithFallback';
import { getImageUrl } from '../utils/imageUtils';
import { TravelMap } from '../components/Sections/TravelMap';
import { ShutterIsland3D } from './ShutterIsland3D';
import { InteractiveReadingRoom } from '../components/UI/InteractiveReadingRoom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import './Interests.css';
import {
  playVinylNeedle,
  playToggleSwitch,
  playSuccessChime,
} from '../utils/soundEffects';

type FilterTab = 'all' | 'island3d' | 'audio' | 'cinema' | 'play_read' | 'footprints' | 'danmaku';

interface DanmakuItem {
  id: number;
  content: string;
  color: string;
  orderIndex: number;
}

const DEFAULT_DANMAKU: DanmakuItem[] = [
  { id: 101, content: '欢迎来到奕轩的数字花园 · 极简沙白质感太舒服了', color: 'primary', orderIndex: 1 },
  { id: 102, content: '禾书耕文的 AI4Science 架构拆解很硬核！', color: 'darkblue', orderIndex: 2 },
  { id: 103, content: '长沙笨萝卜醋蒸鸡永远的神', color: 'pink', orderIndex: 3 },
  { id: 104, content: '黑胶唱机点播放真的有 Lofi 电钢琴和弦伴奏 ♪', color: 'slate', orderIndex: 4 },
  { id: 105, content: '祝早日拿到心仪的 AI Agent / 全栈 Offer', color: 'primary', orderIndex: 5 },
  { id: 106, content: '同为农大学子前来打卡支持！', color: 'blue', orderIndex: 6 },
];

/**
 * Danmaku colours. Keys are the values the backend accepts
 * (backend/src/validations/danmakuValidation.ts) — the page renders them in the site palette.
 * Older rows may carry the retired page tones (bronze/ink/moss/terracotta), so those still render.
 */
const DANMAKU_TONE_STYLES: Record<string, string> = {
  primary: 'bg-[#8A6F48] text-[#FAF9F5]',
  pink: 'bg-[#A35566] text-[#FFF7F8]',
  blue: 'bg-[#3F5A78] text-[#F4F6F8]',
  darkblue: 'bg-[#22324A] text-[#F4F6F8]',
  slate: 'bg-[#4B5560] text-[#F4F6F8]',
  gray: 'bg-[#6B6A64] text-[#FAF9F5]',
  bronze: 'bg-[#8A6F48] text-[#FAF9F5]',
  ink: 'bg-[#141413] text-[#FAF9F5]',
  moss: 'bg-[#1E3329] text-[#FAF9F5]',
  terracotta: 'bg-[#9E553F] text-[#FAF9F5]',
};

type DanmakuTone = 'primary' | 'pink' | 'blue' | 'darkblue' | 'slate';

const DANMAKU_TONE_PICKER: { id: DanmakuTone; labelZh: string; labelEn: string; swatch: string }[] = [
  { id: 'primary', labelZh: '暖铜', labelEn: 'Bronze', swatch: 'bg-[#8A6F48]' },
  { id: 'pink', labelZh: '豆沙粉', labelEn: 'Rose', swatch: 'bg-[#A35566]' },
  { id: 'blue', labelZh: '雾霾蓝', labelEn: 'Mist blue', swatch: 'bg-[#3F5A78]' },
  { id: 'darkblue', labelZh: '墨蓝', labelEn: 'Ink blue', swatch: 'bg-[#22324A]' },
  { id: 'slate', labelZh: '石板灰', labelEn: 'Slate', swatch: 'bg-[#4B5560]' },
];

const isTestDanmaku = (content: string) => {
  const c = content.trim().toLowerCase();
  return !c || c === 'test' || c.includes('测试');
};

// Rough rendered width of a note (text-xs mono + px-4), used to size the marquee loop.
const estimateDanmakuWidth = (text: string) => {
  let w = 34;
  for (const ch of text) w += /[\u0000-ɏ]/.test(ch) ? 7.3 : 12.5;
  return w;
};

const DANMAKU_LANES = 4;
const DANMAKU_LANE_SPEEDS = [34, 27, 38, 30]; // px per second — lanes drift at different paces
const DANMAKU_MIN_LOOP_PX = 1280; // each half of a lane's track must outrun the widest canvas

// Books on the reading-room shelf (CURATED_BOOKS in components/UI/InteractiveReadingRoom.tsx).
const READING_SHELF_SIZE = 4;

interface ParsedLyricLine {
  time: number;
  text: string;
}

// Credit lines ("作词 : 郑润泽", "制作人：李淘") that streaming LRCs prepend to the lyrics.
const LRC_CREDIT_RE =
  /^(作词|作曲|编曲|制作人|制作|出品|监制|混音|母带|和声|吉他|贝斯|鼓|弦乐|录音|配唱|原唱|发行|策划|统筹|OP|SP|词|曲|Lyricist|Lyrics|Composer|Arranger|Producer|Mixing|Mastering)\s*[:：]\s*(.+)$/i;

function extractLrcCredits(lrcString?: string): string[] {
  if (!lrcString) return [];
  return lrcString
    .split(/\r?\n/)
    .map((line) => line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim())
    .map((text) => text.match(LRC_CREDIT_RE))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => `${m[1]} ${m[2].trim()}`);
}

function parseLrcLyrics(lrcString?: string): ParsedLyricLine[] {
  if (!lrcString || !lrcString.trim()) return [];
  const lines = lrcString.split(/\r?\n/);
  const parsed: ParsedLyricLine[] = [];
  const timeExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
  let hasTimeTags = false;

  lines.forEach((line) => {
    const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
    if (!text && !line.match(timeExp)) return;
    if (LRC_CREDIT_RE.test(text)) {
      hasTimeTags = hasTimeTags || /\[\d{2}:\d{2}\.\d{2,3}\]/.test(line);
      return;
    }

    let match: RegExpExecArray | null;
    const regex = new RegExp(timeExp);
    while ((match = regex.exec(line)) !== null) {
      hasTimeTags = true;
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const msStr = match[3];
      const ms = parseInt(msStr, 10) / (msStr.length === 2 ? 100 : 1000);
      const time = minutes * 60 + seconds + ms;
      if (text) {
        parsed.push({ time, text });
      }
    }
  });

  if (!hasTimeTags) {
    return lines
      .map((l) => l.trim())
      .filter((text) => text && !LRC_CREDIT_RE.test(text))
      .map((text) => ({ time: -1, text }));
  }

  return parsed.sort((a, b) => a.time - b.time);
}

const FALLBACK_TRACK_LYRICS: Record<string, string> = {
  '如果呢': `[00:00.00]如果呢 · 郑润泽
[00:12.00]在深夜的屏幕光影里 敲下一行行思绪
[00:24.00]耳机里的旋律 伴随指针缓缓转动
[00:36.00]如果时间能停留在 最温柔的黄昏里
[00:48.00]那些没说出口的话 是否还会有回音
[01:02.00]风吹过湘江岸边的街灯 与晚霞交汇
[01:16.00]我们在各自的轨道 追逐着遥远的星辰`,
  '于是': `[00:00.00]于是 · 郑润泽
[00:14.00]于是我们学会在喧嚣里 保持安静的步调
[00:28.00]把遗憾折成纸飞机 投进夏夜的晚风`,
  '锁': `[00:00.00]锁 · 张子墨z!mooo
[00:14.00]锁住落日余晖与晚风的节拍`,
  '罗生门（Follow）': `[00:00.00]罗生门 (Follow) · 梨冻紧 / Wiz_H张子豪
[00:15.00]Follow the rhythm through the neon rain`,
  '一直很安静': `[00:00.00]一直很安静 · 阿桑
[00:14.00]给你的爱一直很安静 来交换你偶尔给的关心`,
  '形容': `[00:00.00]形容 · 沈以诚
[00:14.00]穿过四季的风与光影 用一首歌形容此刻`,
  '富士山下': `[00:00.00]富士山下 · 陈奕迅
[00:15.00]拦路雨偏似雪花 饮泣的你冻吗 这风褛我给你磨到有襟花`,
};

const TRACK_EN_META: Record<string, { titleEn: string; artistEn: string }> = {
  '如果呢': { titleEn: 'What If (Ru Guo Ne)', artistEn: 'Zheng Runze' },
  '于是': { titleEn: 'And So (Yu Shi)', artistEn: 'Zheng Runze' },
  '锁': { titleEn: 'Locked (Suo)', artistEn: 'Zhang Zimo (z!mooo)' },
  '罗生门（Follow）': { titleEn: 'Rashomon (Follow)', artistEn: 'Li Dongjin / Wiz_H' },
  '一直很安静': { titleEn: 'Always Quiet', artistEn: 'Asang' },
  '形容': { titleEn: 'Describe (Xing Rong)', artistEn: 'Shen Yicheng' },
  '富士山下': { titleEn: 'Under Mount Fuji', artistEn: 'Eason Chan' },
};

const MOVIE_EN_META: Record<
  string,
  { titleEn: string; directorEn: string; noteEn: string; noteZh?: string }
> = {
  '肖申克的救赎': {
    titleEn: 'The Shawshank Redemption',
    directorEn: 'Frank Darabont',
    noteEn: 'Fear can hold you prisoner; hope can set you free. A monument to patience and freedom.',
  },
  '海上钢琴师': {
    titleEn: 'The Legend of 1900',
    directorEn: 'Giuseppe Tornatore',
    noteEn: 'The 88 keys are finite, but you are infinite — a metaphor for software craftsmanship.',
  },
  '唐人街探案': {
    titleEn: 'Detective Chinatown',
    directorEn: 'Chen Sicheng',
    noteEn: 'Clever locked-room deduction paired with vibrant Bangkok street energy and dual-character chemistry.',
    noteZh: '密室推理的巧思，配上曼谷街头的烟火气和一对搭档的默契，轻松又烧脑。',
  },
  '让子弹飞': {
    titleEn: 'Let the Bullets Fly',
    directorEn: 'Jiang Wen',
    noteEn: 'Razor-sharp dialogue density and pacing — a modern classic of Chinese cinema.',
  },
  '默杀': {
    titleEn: 'A Place Called Silence',
    directorEn: 'Sam Quah (Ke Wenli)',
    noteEn: 'A tense, rain-soaked thriller examining collective silence and moral reckoning.',
    noteZh: '雨夜里压抑紧绷的悬疑，追问集体沉默的代价与迟来的清算。',
  },
  '你的婚礼': {
    titleEn: 'My Love',
    directorEn: 'Han Tian',
    noteEn: 'Fifteen years of youth, growth, and bittersweet timing — a nostalgic coming-of-age story.',
    noteZh: '十五年的青春、成长与总差一点的时机，一部带着怀旧滤镜的成长故事。',
  },
};

const MOMENT_EN_META: Record<string, { contentEn: string; locationEn: string }> = {
  '嗯，改了一版又一版': {
    contentEn: 'Iterated on my resume draft again and again — polishing every single engineering metric.',
    locationEn: 'Hunan Agricultural Univ. · Changsha',
  },
  '学吉他手真痛': {
    contentEn: 'Fingertips are sore from acoustic guitar practice, but the chord progressions are finally clicking.',
    locationEn: 'Hunan Agricultural Univ. · Changsha',
  },
  '咋这样。。。我都睡了，我减脂呢': {
    contentEn: 'Late-night green qingtuan snacks arrived right after I went to bed during my cut...',
    locationEn: 'Dormitory · Changsha',
  },
  '希望长沙每天出太阳🙃': {
    contentEn: 'Nothing beats a sunny spring afternoon in Changsha with good friends.',
    locationEn: 'Hunan Agricultural Univ. · Changsha',
  },
  '昨天去永州吃了血鸭，跟之前吃的还不太一样': {
    contentEn: 'Tried authentic Yongzhou Duck with Crispy Blood yesterday — distinct local spice profile!',
    locationEn: 'Yongzhou · Hunan',
  },
  '今天依旧健身': {
    contentEn: 'Another consistent strength training session at the gym today.',
    locationEn: 'Changsha · Hunan',
  },
};

const LOCATION_EN_MAP: Record<string, string> = {
  '湖南农业大学': 'Hunan Agricultural Univ.',
  '湖南农业大学 · 长沙': 'Hunan Agricultural Univ. · Changsha',
  '我的床上': 'Dormitory · Changsha',
  '永州市': 'Yongzhou · Hunan',
  '长沙': 'Changsha · Hunan',
};

const CURATED_MOVIES = [
  {
    id: 1,
    code: '01',
    title: '星际穿越',
    titleEn: 'Interstellar',
    director: 'Christopher Nolan',
    year: '2014',
    rating: '9.4',
    poster: 'https://picsum.photos/seed/film-interstellar/500/700',
    noteZh: '“不要温顺地走进那个良夜。”硬核天体物理与跨越五维空间的情感共鸣。',
    noteEn: '"Do not go gentle into that good night." Astrophysics meets timeless human love.',
    likes: 142,
  },
  {
    id: 2,
    code: '02',
    title: '肖申克的救赎',
    titleEn: 'The Shawshank Redemption',
    director: 'Frank Darabont',
    year: '1994',
    rating: '9.7',
    poster: 'https://picsum.photos/seed/film-shawshank/500/700',
    noteZh: '强者自救，圣者渡人。关于长期主义、耐心与精神自由的终极寓言。',
    noteEn: 'Fear can hold you prisoner; hope can set you free. A monument to patience and freedom.',
    likes: 186,
  },
  {
    id: 3,
    code: '03',
    title: '沙丘 2',
    titleEn: 'Dune: Part Two',
    director: 'Denis Villeneuve',
    year: '2024',
    rating: '8.9',
    poster: 'https://picsum.photos/seed/film-dune2/500/700',
    noteZh: '极致的巨物美学与荒漠沙白光影构图，配乐与画面张力堪称教科书。',
    noteEn: 'Monumental desert Brutalism, sand-and-shadow composition, and Hans Zimmer\'s score.',
    likes: 98,
  },
  {
    id: 4,
    code: '04',
    title: '蜘蛛侠：纵横宇宙',
    titleEn: 'Spider-Man: Across the Spider-Verse',
    director: 'Joaquim Dos Santos',
    year: '2023',
    rating: '9.1',
    poster: 'https://picsum.photos/seed/film-spider/500/700',
    noteZh: '每一帧都是突破媒介边界的视觉实验，分镜与色彩节奏极具启发性。',
    noteEn: 'Every frame is a fearless visual experiment pushing the boundaries of animation.',
    likes: 115,
  },
  {
    id: 5,
    code: '05',
    title: '海上钢琴师',
    titleEn: 'The Legend of 1900',
    director: 'Giuseppe Tornatore',
    year: '1998',
    rating: '9.3',
    poster: 'https://picsum.photos/seed/film-1900/500/700',
    noteZh: '88 个琴键是有限的，但你是无限的。在有限的技术栈里创造无限的产品可能。',
    noteEn: 'The 88 keys are finite, but you are infinite — a metaphor for software craftsmanship.',
    likes: 109,
  },
  {
    id: 6,
    code: '06',
    title: '让子弹飞',
    titleEn: 'Let the Bullets Fly',
    director: '姜文',
    directorEn: 'Jiang Wen',
    year: '2010',
    rating: '9.0',
    poster: 'https://picsum.photos/seed/film-bullets/500/700',
    noteZh: '台词密度与叙事节奏的巅峰之作，每次重温都有新的细节发现。',
    noteEn: 'Razor-sharp dialogue density and pacing — a modern classic of Chinese cinema.',
    likes: 134,
  },
];

const CURATED_MOMENTS = [
  {
    id: 1,
    date: '2026.11',
    location: '湖南农业大学 · AIFA Lab',
    contentZh:
      '把「禾书耕文」的 Hybrid RAG 重排链路又压测了一遍，看着万字农学综述能精准溯源到每一篇真实 DOI 文献，成就感拉满。',
    contentEn:
      'Stress-tested the Hybrid RAG reranking pipeline for HeShu today. Watching a 10,000-word agronomic review trace every claim to verified DOIs feels rewarding.',
    image: 'https://picsum.photos/seed/moment-lab/700/460',
    likes: 38,
  },
  {
    id: 2,
    date: '2026.10',
    location: '长沙 · 岳麓山 & 湘江风光带',
    contentZh:
      '周末背着相机去湘江边和老街走了一下午。写代码久了，去捕捉真实世界的光影和街角烟火气是最好的充电方式。',
    contentEn:
      'Spent the afternoon walking along the Xiangjiang River with my camera. Street photography is the best way to recharge after a week of coding.',
    image: 'https://picsum.photos/seed/moment-xiangjiang/700/460',
    likes: 52,
  },
  {
    id: 3,
    date: '2026.09',
    location: '湖南洋葱教育 · FDE 驻场工作台',
    contentZh:
      '作为 FDE 驻场工程师和教研老师们坐在一起改工作流，才真正理解“技术指标好”和“业务一线好用”之间那最后 1 公里的工程价值。',
    contentEn:
      'Sitting right next to curriculum teachers as an FDE taught me the crucial last mile between raw model benchmarks and real-world product usability.',
    image: 'https://picsum.photos/seed/moment-fde/700/460',
    likes: 46,
  },
];

/** A note clamped to 3 lines that offers "展开全文" only when the text actually overflows. */
function ClampedNote({
  text,
  className,
  moreLabel,
  lessLabel,
  onToggle,
}: {
  text: string;
  className?: string;
  moreLabel: string;
  lessLabel: string;
  onToggle?: (expanded: boolean) => void;
}) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const measure = () => setOverflows(el.scrollHeight - el.clientHeight > 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, expanded]);

  return (
    <>
      <p ref={ref} className={`${className ?? ''} ${expanded ? '' : 'line-clamp-3'}`}>
        {text}
      </p>
      {(overflows || expanded) && (
        <button
          type="button"
          data-sfx="custom"
          aria-expanded={expanded}
          onClick={() => {
            onToggle?.(!expanded);
            setExpanded((v) => !v);
          }}
          className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E] hover:underline underline-offset-2"
        >
          <span>{expanded ? lessLabel : moreLabel}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </>
  );
}

export default function Interests() {
  const { language, t, td } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    musicList,
    currentMusicIndex,
    currentMusic,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playMode,
    isSynthFallback,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    selectMusic,
    setVolume,
    toggleMute,
    cyclePlayMode,
  } = useMusic();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [audioRightPane, setAudioRightPane] = useState<'lyrics' | 'playlist'>('lyrics');
  const lyricsViewportRef = useRef<HTMLDivElement | null>(null);
  const lyricsLineRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const userScrollTimerRef = useRef<number | null>(null);
  const [isUserScrollingLyrics, setIsUserScrollingLyrics] = useState(false);

  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPct, setHoverPct] = useState<number>(0);

  const [inline3DOpen, setInline3DOpen] = useState<boolean>(false);
  const [openSectionHints, setOpenSectionHints] = useState<Record<string, boolean>>({});
  const [showIslandDetails, setShowIslandDetails] = useState<boolean>(false);

  const toggleSectionHint = (key: string) => {
    playToggleSwitch(!openSectionHints[key]);
    setOpenSectionHints((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const [moviesList, setMoviesList] = useState<
    Array<{
      id: number;
      code: string;
      title: string;
      titleEn?: string;
      director: string;
      directorEn?: string;
      year: string;
      rating: string;
      poster: string;
      noteZh: string;
      noteEn: string;
      likes: number;
    }>
  >(CURATED_MOVIES);
  const [momentsList, setMomentsList] = useState<
    Array<{
      id: number;
      date: string;
      location: string;
      locationEn?: string;
      contentZh: string;
      contentEn: string;
      image: string;
      images?: string[];
      likes: number;
    }>
  >(CURATED_MOMENTS);
  const [momentLightboxOpen, setMomentLightboxOpen] = useState(false);
  const [momentLightboxSlides, setMomentLightboxSlides] = useState<{ src: string }[]>([]);
  const [momentLightboxIndex, setMomentLightboxIndex] = useState(0);
  const [likedMovies, setLikedMovies] = useState<Record<number, boolean>>({});
  const [likedMoments, setLikedMoments] = useState<Record<number, boolean>>({});
  const [danmakuList, setDanmakuList] = useState<DanmakuItem[]>(DEFAULT_DANMAKU);
  const [danmakuInput, setDanmakuInput] = useState('');
  const [danmakuTone, setDanmakuTone] = useState<DanmakuTone>('primary');
  const [submittingDanmaku, setSubmittingDanmaku] = useState(false);
  const [danmakuStatus, setDanmakuStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [freshDanmakuId, setFreshDanmakuId] = useState<number | null>(null);
  const danmakuStatusTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const visited = sessionStorage.getItem('visited_interests');
    if (!visited) {
      axios.post('/api/siteConfig/view').catch(() => {});
      sessionStorage.setItem('visited_interests', 'true');
    }

    // Fetch backend danmaku if available
    axios
      .get('/api/danmaku/visible')
      .then((res) => {
        if (res.data?.status === 'success' && Array.isArray(res.data?.data)) {
          const visible = (res.data.data as DanmakuItem[]).filter((d) => !isTestDanmaku(d.content || ''));
          if (visible.length > 0) setDanmakuList(visible);
        }
      })
      .catch(() => {});

    // Fetch backend movies & merge with curated film notes
    axios
      .get('/api/movies')
      .then((res) => {
        const rawMovies = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (Array.isArray(rawMovies) && rawMovies.length > 0) {
          const mergedMovies = rawMovies
            .filter((m: any) => m.isVisible !== false)
            .map((m: any, idx: number) => {
              const rawTitle = String(m.title || '').trim();
              const matchedCurated = CURATED_MOVIES.find(
                (cm) => rawTitle && (cm.title.includes(rawTitle) || rawTitle.includes(cm.title)),
              );
              const metaEn =
                Object.entries(MOVIE_EN_META).find(
                  ([k]) => rawTitle && (rawTitle.includes(k) || k.includes(rawTitle)),
                )?.[1] || undefined;
              const posterSrc = m.posterUrl || m.poster;
              return {
                id: m.id,
                code: `0${idx + 1}`.slice(-2),
                title: rawTitle || matchedCurated?.title || '',
                titleEn: metaEn?.titleEn || matchedCurated?.titleEn || rawTitle,
                director: m.director || matchedCurated?.director || '',
                directorEn: metaEn?.directorEn || matchedCurated?.directorEn || m.director || '',
                year: String(m.year || matchedCurated?.year || ''),
                rating: String(m.rating || matchedCurated?.rating || ''),
                poster: posterSrc ? getImageUrl(posterSrc) : matchedCurated?.poster || 'https://picsum.photos/seed/film/500/700',
                noteZh:
                  m.review ||
                  matchedCurated?.noteZh ||
                  metaEn?.noteZh ||
                  '光影留存，值得反复细品的银幕佳作。',
                noteEn: metaEn?.noteEn || matchedCurated?.noteEn || 'A memorable cinematic work worth revisiting.',
                likes: typeof m.likes === 'number' ? m.likes : matchedCurated?.likes || 88,
              };
            });
          if (mergedMovies.length > 0) {
            setMoviesList(mergedMovies);
          }
        }
      })
      .catch(() => {});

    // Fetch backend moments & combine real non-test moments with curated field notes
    axios
      .get('/api/moments?isVisible=true')
      .then((res) => {
        const rawMoments = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (Array.isArray(rawMoments) && rawMoments.length > 0) {
          const validServerMoments = rawMoments
            .filter(
              (m: any) =>
                m.content &&
                !m.content.toLowerCase().includes('test') &&
                !m.content.includes('测试'),
            )
            .slice(0, 6)
            .map((m: any) => {
              let parsedImages: string[] = [];
              if (Array.isArray(m.images) && m.images.length > 0) {
                parsedImages = m.images.map((img: string) => getImageUrl(img));
              } else if (typeof m.images === 'string' && m.images.trim().startsWith('[')) {
                try {
                  const parsed = JSON.parse(m.images);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    parsedImages = parsed.map((img: string) => getImageUrl(img));
                  }
                } catch {
                  // fallback
                }
              }
              const firstImg =
                parsedImages[0] || 'https://picsum.photos/seed/moment-default/700/460';
              const dt = m.createdAt ? new Date(m.createdAt) : new Date();
              const dateStr = `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;
              const rawContent = (m.content || '').trim();
              const rawLoc = (m.location || '').trim() || '湖南农业大学 · 长沙';
              const momentMeta = MOMENT_EN_META[rawContent];
              const locEn =
                momentMeta?.locationEn ||
                LOCATION_EN_MAP[rawLoc] ||
                'Changsha · Hunan';
              return {
                id: m.id,
                date: dateStr,
                location: rawLoc,
                locationEn: locEn,
                contentZh: rawContent,
                contentEn:
                  momentMeta?.contentEn ||
                  'Campus life & daily photography field note in Changsha.',
                image: firstImg,
                images: parsedImages.length > 0 ? parsedImages : [firstImg],
                likes: typeof m.likes === 'number' ? m.likes : 12,
              };
            });
          if (validServerMoments.length > 0) {
            setMomentsList(validServerMoments);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (location.hash === '#music') {
      const el = document.getElementById('section-audio');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  const formatTime = (sec: number) => {
    if (!sec || Number.isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Parse LRC lyrics for current track (with fallback if DB lyrics is empty)
  const rawTrackLrc =
    currentMusic?.lyrics ||
    (currentMusic?.title ? FALLBACK_TRACK_LYRICS[currentMusic.title] : '') ||
    FALLBACK_TRACK_LYRICS['如果呢'];
  const parsedLyrics = useMemo(() => parseLrcLyrics(rawTrackLrc), [rawTrackLrc]);
  const lyricCredits = useMemo(() => extractLrcCredits(rawTrackLrc), [rawTrackLrc]);

  const trackStripRef = useRef<HTMLDivElement | null>(null);
  // Keep the active track pill in view when the track changes (next/prev/auto-advance).
  useEffect(() => {
    const strip = trackStripRef.current;
    const pill = strip?.querySelector<HTMLElement>('[data-active-track="true"]');
    if (!strip || !pill) return;
    const target = pill.offsetLeft - strip.clientWidth / 2 + pill.clientWidth / 2;
    strip.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [currentMusicIndex, audioRightPane]);

  const currentLyricIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    if (parsedLyrics[0]?.time === -1) {
      const totalDur = duration > 0 ? duration : 165;
      const avg = totalDur / parsedLyrics.length;
      return Math.min(Math.floor(currentTime / avg), parsedLyrics.length - 1);
    }
    let idx = 0;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [parsedLyrics, currentTime, duration]);

  const scrollLyricsToActive = (behavior: ScrollBehavior = 'smooth') => {
    const container = lyricsViewportRef.current;
    const activeEl = lyricsLineRefs.current[currentLyricIndex];
    if (!container || !activeEl) return;
    const targetTop = activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, targetTop), behavior });
  };

  useEffect(() => {
    if (audioRightPane !== 'lyrics' || isUserScrollingLyrics || currentLyricIndex < 0) return;
    scrollLyricsToActive('smooth');
  }, [currentLyricIndex, audioRightPane, isUserScrollingLyrics, activeFilter]);

  useEffect(() => {
    // Reset scroll state when switching tracks
    setIsUserScrollingLyrics(false);
    if (userScrollTimerRef.current) {
      window.clearTimeout(userScrollTimerRef.current);
      userScrollTimerRef.current = null;
    }
    const raf = window.requestAnimationFrame(() => scrollLyricsToActive('auto'));
    return () => window.cancelAnimationFrame(raf);
  }, [currentMusicIndex]);

  useEffect(() => {
    return () => {
      if (userScrollTimerRef.current) {
        window.clearTimeout(userScrollTimerRef.current);
      }
    };
  }, []);

  const handleLyricsUserScroll = () => {
    setIsUserScrollingLyrics(true);
    if (userScrollTimerRef.current) {
      window.clearTimeout(userScrollTimerRef.current);
    }
    userScrollTimerRef.current = window.setTimeout(() => {
      setIsUserScrollingLyrics(false);
    }, 3200);
  };

  const calcTimeFromClientX = (clientX: number) => {
    const bar = progressBarRef.current;
    const total = duration || 165;
    if (!bar) return { time: 0, pct: 0 };
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return { time: ratio * total, pct: ratio * 100 };
  };

  const handleProgressPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { time, pct } = calcTimeFromClientX(e.clientX);
    setIsScrubbing(true);
    setScrubTime(time);
    setHoverTime(time);
    setHoverPct(pct);
  };

  const handleProgressPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { time, pct } = calcTimeFromClientX(e.clientX);
    setHoverTime(time);
    setHoverPct(pct);
    if (isScrubbing) {
      setScrubTime(time);
    }
  };

  const handleProgressPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const { time } = calcTimeFromClientX(e.clientX);
    setIsScrubbing(false);
    setScrubTime(null);
    seekTo(time);
  };

  const effectiveDisplayTime = isScrubbing && scrubTime !== null ? scrubTime : currentTime;
  const effectiveProgressPct = duration > 0 ? Math.min(100, (effectiveDisplayTime / duration) * 100) : 0;

  const playModeLabel =
    playMode === 'single'
      ? td('单曲循环', 'Repeat One')
      : playMode === 'shuffle'
      ? td('随机播放', 'Shuffle')
      : td('列表循环', 'Repeat All');

  const handleSendDanmaku = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = danmakuInput.trim();
    if (!content || submittingDanmaku) return;

    const newItem: DanmakuItem = {
      id: Date.now(),
      content,
      color: danmakuTone,
      orderIndex: danmakuList.length + 1,
    };

    const flashStatus = (status: { kind: 'ok' | 'error'; text: string }) => {
      setDanmakuStatus(status);
      if (danmakuStatusTimerRef.current) window.clearTimeout(danmakuStatusTimerRef.current);
      danmakuStatusTimerRef.current = window.setTimeout(() => setDanmakuStatus(null), 4200);
    };

    setSubmittingDanmaku(true);
    setDanmakuList((prev) => [...prev, newItem]);
    setFreshDanmakuId(newItem.id);
    setDanmakuInput('');

    try {
      await axios.post('/api/danmaku', { content, color: danmakuTone });
      playSuccessChime();
      flashStatus({ kind: 'ok', text: td('已上墙，稍后会从右侧飘过来', 'Posted — it will drift in from the right') });
    } catch (err: any) {
      // Don't pretend it was saved: take the note back down and give the text back.
      setDanmakuList((prev) => prev.filter((d) => d.id !== newItem.id));
      setFreshDanmakuId(null);
      setDanmakuInput(content);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
      flashStatus({
        kind: 'error',
        text: td(
          `发送失败${serverMsg ? `（${serverMsg}）` : ''}，请稍后再试`,
          `Couldn't post${serverMsg ? ` (${serverMsg})` : ''} — please try again`,
        ),
      });
    } finally {
      setSubmittingDanmaku(false);
    }
  };

  useEffect(
    () => () => {
      if (danmakuStatusTimerRef.current) window.clearTimeout(danmakuStatusTimerRef.current);
    },
    [],
  );

  const getDanmakuBadgeStyle = (color: string) => DANMAKU_TONE_STYLES[color] || DANMAKU_TONE_STYLES.primary;

  // Split notes into lanes; each lane is a seamless marquee (two identical halves translating -50%).
  // Lanes get staggered gaps, speeds and start offsets so the wall never reads as a grid.
  const danmakuLanes = useMemo(() => {
    return Array.from({ length: DANMAKU_LANES }, (_, laneIdx) => {
      const base = danmakuList
        .map((msg, i) => ({ msg, i }))
        .filter(({ i }) => i % DANMAKU_LANES === laneIdx)
        .map(({ msg, i }) => ({ msg, gap: 44 + ((i * 53 + laneIdx * 31) % 72) }));
      if (base.length === 0) return { items: [], duration: 30, delay: 0 };
      const baseWidth = base.reduce((sum, it) => sum + estimateDanmakuWidth(it.msg.content) + it.gap, 0);
      const repeats = Math.max(1, Math.ceil(DANMAKU_MIN_LOOP_PX / baseWidth));
      const items = Array.from({ length: repeats }, (_, r) =>
        base.map((it) => ({ ...it, key: `${it.msg.id}-${r}` })),
      ).flat();
      const halfWidth = baseWidth * repeats;
      const duration = halfWidth / DANMAKU_LANE_SPEEDS[laneIdx % DANMAKU_LANE_SPEEDS.length];
      return { items, duration, delay: -duration * ((laneIdx * 0.37) % 1) };
    });
  }, [danmakuList]);

  const filterTabs: { id: FilterTab; code: string; labelZh: string; labelEn: string }[] = [
    { id: 'all', code: 'ALL', labelZh: '全部', labelEn: 'Everything' },
    { id: 'audio', code: '01', labelZh: '听 · 黑胶', labelEn: 'Listen' },
    { id: 'cinema', code: '02', labelZh: '看 · 影单', labelEn: 'Watch' },
    { id: 'play_read', code: '03', labelZh: '读 · 书房', labelEn: 'Read' },
    { id: 'footprints', code: '04', labelZh: '行 · 足迹', labelEn: 'Wander' },
    { id: 'island3d', code: '05', labelZh: '游 · 光影岛', labelEn: 'Island' },
    { id: 'danmaku', code: '06', labelZh: '言 · 留言墙', labelEn: 'Guestbook' },
  ];

  const archiveStats = [
    { label: td('歌单', 'VINYL & LOFI'), value: musicList.length, unit: td('首', 'tracks') },
    { label: td('影单 · 书单', 'FILMS & BOOKS'), value: moviesList.length + READING_SHELF_SIZE, unit: td('部', 'titles') },
    { label: td('访客留言', 'GUEST NOTES'), value: danmakuList.length, unit: td('条', 'notes') },
  ];

  const showSection = (sec: FilterTab) => activeFilter === 'all' || activeFilter === sec;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-28 md:pb-24 transition-colors duration-300">
      {/* ================= TOP EDITORIAL MASTHEAD ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8 sm:pb-12 border-b designer-hairline">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full designer-pill text-[10px] sm:text-[11px] font-mono uppercase tracking-widest mb-4 sm:mb-5">
              <Sparkles className="w-3 h-3 text-[#8A6F48]" />
              <span>00 // DIGITAL GARDEN &amp; CULTURAL ARCHIVE</span>
            </div>
            <h1 className="designer-heading text-3xl sm:text-5xl font-normal tracking-[-0.03em] leading-tight">
              <span>{t('interests.title')}</span>
            </h1>
            <p className="designer-text-secondary text-sm sm:text-base mt-2.5 sm:mt-3 max-w-2xl leading-relaxed">
              {t('interests.subtitle')}
            </p>
          </div>

          {/* Archive Telemetry Summary — live counts, number first, unit second */}
          <dl className="grid grid-cols-3 pt-4 md:pt-0 border-t md:border-t-0 designer-hairline text-left shrink-0">
            {archiveStats.map((stat, i) => (
              <div
                key={stat.label}
                className={`min-w-0 ${i === 0 ? 'pr-4 sm:pr-6' : 'px-4 sm:px-6 border-l designer-hairline'}`}
              >
                <dt className="text-[10px] font-mono tracking-widest designer-text-muted uppercase truncate">
                  {stat.label}
                </dt>
                <dd className="mt-1 flex items-baseline gap-1">
                  <span className="designer-heading text-2xl sm:text-[28px] leading-none tabular-nums">
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-mono designer-text-muted">{stat.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Filter Navigation Bar — one row; horizontally scrollable with an edge fade on small screens */}
        <div
          role="tablist"
          aria-label={td('筛选板块', 'Filter sections')}
          className="flex flex-nowrap overflow-x-auto items-center gap-2 mt-7 sm:mt-10 pb-1 -mx-4 pl-4 pr-10 sm:mx-0 sm:pl-0 lg:pr-0 ix-fade-end-compact [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filterTabs.map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                data-sfx="custom"
                onClick={() => {
                  playToggleSwitch(true);
                  setActiveFilter(tab.id);
                }}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 ${
                  active
                    ? 'designer-btn-primary font-semibold'
                    : 'designer-btn-secondary designer-text-secondary'
                }`}
              >
                <span className="opacity-55 tabular-nums">{tab.code}</span>
                <span>{td(tab.labelZh, tab.labelEn)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 sm:space-y-20 pt-10 sm:pt-14">
        {/* ================= 01 // VINYL TURNTABLE & SOUNDTRACK ================= */}
        {showSection('audio') && (
          <section id="section-audio">
            <div className="mb-8 pb-4 border-b designer-hairline">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest designer-accent-text mb-1.5">
                    01 // VINYL &amp; LYRICS
                  </div>
                  <h2 className="designer-heading text-2xl sm:text-3xl font-normal tracking-[-0.02em]">
                    {td('黑胶唱机与编码歌单', 'Vinyl Turntable & Coding Soundtrack')}
                  </h2>
                </div>
                <button
                  type="button"
                  data-sfx="custom"
                  onClick={() => toggleSectionHint('audio')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full designer-pill text-[11px] font-mono designer-text-muted hover:designer-text-primary transition-colors shrink-0"
                >
                  <Info className="w-3 h-3 text-[#8A6F48]" />
                  <span>{td('说明', 'Info')}</span>
                </button>
              </div>
              {openSectionHints.audio && (
                <p className="mt-3 text-xs font-mono designer-text-muted bg-[#F6F4EF] dark:bg-[#181815] px-3.5 py-2 rounded-xl border designer-hairline">
                  {td(
                    '内置 WebAudio 电钢琴 Lofi 合成器，点击黑胶唱片播放/暂停；右侧支持点击任意 LRC 歌词行跳转进度。',
                    'Built-in WebAudio Lofi synth. Click the vinyl platter to play/pause, or click any LRC lyric line to seek.'
                  )}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left 5 Cols: Tactile Vinyl Turntable Card — Fixed Balanced Height */}
              <div className="lg:col-span-5 lg:h-[520px] designer-card rounded-2xl p-5 sm:p-7 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-mono designer-text-muted pb-3 border-b designer-hairline shrink-0">
                  <span>TURNTABLE // MODEL HYX-LP01</span>
                  <span className="inline-flex items-center gap-2 text-[#8A6F48] dark:text-[#C8A97E]">
                    {isPlaying ? (
                      <>
                        <span className="inline-flex items-end gap-[2px] h-3" aria-hidden="true">
                          <span className="w-[2px] h-full rounded-full bg-current eq-bar" />
                          <span
                            className="w-[2px] h-full rounded-full bg-current eq-bar"
                            style={{ animationDelay: '0.18s' }}
                          />
                          <span
                            className="w-[2px] h-full rounded-full bg-current eq-bar"
                            style={{ animationDelay: '0.36s' }}
                          />
                          <span
                            className="w-[2px] h-full rounded-full bg-current eq-bar"
                            style={{ animationDelay: '0.52s' }}
                          />
                        </span>
                        <span>33⅓ RPM</span>
                      </>
                    ) : (
                      <span>○ STANDBY</span>
                    )}
                  </span>
                </div>

                {/* Spinning Vinyl Platter + Precision Bronze Tonearm */}
                <div className="relative my-3 flex-1 flex items-center justify-center select-none">
                  {/* Subtle recessed platter deck */}
                  <div className="relative p-2 rounded-full bg-[#EFECE6]/70 dark:bg-[#1C1B19] border designer-hairline shadow-inner">
                    <div
                      role="button"
                      tabIndex={0}
                      data-sfx="custom"
                      onClick={() => {
                        playVinylNeedle(!isPlaying);
                        togglePlay();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          playVinylNeedle(!isPlaying);
                          togglePlay();
                        }
                      }}
                      title={td('点击或按空格播放 / 暂停', 'Click or press Space to Play / Pause')}
                      aria-label={isPlaying ? td('暂停黑胶', 'Pause vinyl') : td('播放黑胶', 'Play vinyl')}
                      className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[3px] border-[#262522] shadow-[0_14px_32px_rgba(15,15,14,0.28)] dark:shadow-[0_16px_38px_rgba(0,0,0,0.65)] flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.018] active:scale-[0.985] overflow-hidden"
                    >
                      {/* Rotating Disc Layer (animationPlayState freezes smoothly without angle snap) */}
                      <div
                        className="absolute inset-0 rounded-full vinyl-grooves flex items-center justify-center vinyl-spin"
                        style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                      >
                        {/* Subtle pressed track bands */}
                        <div className="absolute inset-[18px] rounded-full border border-white/[0.06] pointer-events-none" />
                        <div className="absolute inset-[36px] rounded-full border border-white/[0.08] pointer-events-none" />
                        <div className="absolute inset-[54px] rounded-full border border-white/[0.05] pointer-events-none" />

                        {/* Album Center Label */}
                        <div className="w-[68px] h-[68px] sm:w-[78px] sm:h-[78px] rounded-full overflow-hidden border-[2.5px] border-[#8A6F48] shadow-md relative bg-[#1C1B18]">
                          {currentMusic?.coverUrl ? (
                            <img
                              src={getImageUrl(currentMusic.coverUrl)}
                              alt={currentMusic.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#8A6F48] flex items-center justify-center">
                              <Disc className="w-7 h-7 text-white" />
                            </div>
                          )}
                          {/* Inner bronze ring */}
                          <div className="pointer-events-none absolute inset-1.5 rounded-full border border-white/25" />
                        </div>
                      </div>

                      {/* Stationary Silk Specular Sheen Reflection */}
                      <div className="pointer-events-none absolute inset-0 rounded-full vinyl-sheen" />

                      {/* Center Metallic Spindle */}
                      <div className="pointer-events-none relative z-10 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#FAF9F5] to-[#B8B2A6] border border-black/40 shadow-sm" />
                    </div>
                  </div>

                  {/* Precision Machined Bronze Tonearm */}
                  <div
                    className="pointer-events-none absolute top-1 sm:top-2 right-2 sm:right-5 w-16 h-32 origin-[48px_16px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: isPlaying ? 'rotate(24deg)' : 'rotate(2deg)' }}
                  >
                    {/* Pivot Base Housing */}
                    <div className="absolute top-1 right-1 w-7 h-7 rounded-full bg-[#E6E2D8] dark:bg-[#2A2925] border border-[#8A6F48]/45 shadow-md flex items-center justify-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#C8A97E] to-[#7D623D] border border-black/20" />
                    </div>
                    {/* Counterweight */}
                    <div className="absolute top-0 right-[15px] w-2 h-2.5 rounded-sm bg-[#5F5E58] dark:bg-[#9E9C94]" />
                    {/* Tonearm Tube */}
                    <div className="absolute top-6 right-[17px] w-[2.5px] h-[74px] bg-gradient-to-b from-[#C8A97E] via-[#8A6F48] to-[#6E5634] rounded-full shadow-sm" />
                    {/* Angled Headshell + Cartridge */}
                    <div className="absolute top-[94px] right-[14px] w-3.5 h-6 bg-[#1F1E1C] dark:bg-[#E8E4DA] border border-[#8A6F48] rounded-[3px] rotate-[18deg] shadow-md flex flex-col items-center justify-end pb-0.5">
                      <div className="w-1.5 h-1 rounded-full bg-[#C8A97E]" />
                    </div>
                  </div>
                </div>

                {/* Track Info, Interactive Scrubbing Progress & Full Control Deck */}
                <div>
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-lg font-serif font-medium designer-text-primary truncate">
                          {td(
                            currentMusic?.title || '如果呢',
                            TRACK_EN_META[currentMusic?.title || '如果呢']?.titleEn ||
                              currentMusic?.title ||
                              'What If (Ru Guo Ne)',
                          )}
                        </h3>
                        <a
                          href={getQqMusicLink(currentMusic)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={td('前往 QQ 音乐收听完整原曲', 'Listen to full track on QQ Music')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full designer-pill text-[10px] font-mono text-[#8A6F48] dark:text-[#D2B488] hover:designer-text-primary shrink-0 transition-colors"
                        >
                          <span>{td('QQ原曲', 'QQ Music')}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <p className="text-xs font-mono designer-text-muted truncate">
                        {td(
                          currentMusic?.artist || '郑润泽',
                          TRACK_EN_META[currentMusic?.title || '如果呢']?.artistEn ||
                            currentMusic?.artist ||
                            'Zheng Runze',
                        )}
                      </p>
                    </div>
                    <span className="text-xs font-mono designer-text-muted shrink-0 tabular-nums">
                      {formatTime(effectiveDisplayTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Interactive Scrubbable Progress Bar with Hover Time Preview */}
                  <div
                    ref={progressBarRef}
                    role="slider"
                    tabIndex={0}
                    aria-label={td('播放进度', 'Playback progress')}
                    aria-valuemin={0}
                    aria-valuemax={Math.round(duration || 165)}
                    aria-valuenow={Math.round(effectiveDisplayTime)}
                    onPointerDown={handleProgressPointerDown}
                    onPointerMove={handleProgressPointerMove}
                    onPointerUp={handleProgressPointerUp}
                    onPointerLeave={() => {
                      if (!isScrubbing) setHoverTime(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        seekTo(currentTime + 5);
                      } else if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        seekTo(currentTime - 5);
                      }
                    }}
                    className="group relative py-2.5 mb-2.5 cursor-pointer touch-none select-none"
                  >
                    {/* Hover / Scrub Timestamp Tooltip */}
                    {hoverTime !== null && (
                      <div
                        className="pointer-events-none absolute -top-5 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] text-[10px] font-mono tabular-nums shadow-sm whitespace-nowrap"
                        style={{ left: `${Math.max(8, Math.min(92, hoverPct))}%` }}
                      >
                        {formatTime(hoverTime)}
                      </div>
                    )}

                    {/* Track Rail */}
                    <div className="relative h-1.5 bg-[#E6E2D8] dark:bg-[#2A2925] rounded-full overflow-visible">
                      <div
                        className={`h-full bg-[#8A6F48] dark:bg-[#C8A97E] rounded-full ${
                          isScrubbing ? '' : 'transition-[width] duration-200 ease-linear'
                        }`}
                        style={{ width: `${effectiveProgressPct}%` }}
                      />
                      {/* Tactile Thumb Dot */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#FAF9F5] dark:bg-[#171715] border-2 border-[#8A6F48] dark:border-[#D2B488] shadow-sm transition-transform duration-150 ${
                          isScrubbing
                            ? 'scale-110 opacity-100'
                            : 'scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100'
                        }`}
                        style={{ left: `${effectiveProgressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Full Control Deck: Mode | Prev / Play / Next | Volume */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Play Mode Switcher */}
                    <button
                      type="button"
                      onClick={() => {
                        playToggleSwitch(true);
                        cyclePlayMode();
                      }}
                      title={`${td('播放模式', 'Play Mode')}: ${playModeLabel}`}
                      aria-label={playModeLabel}
                      className={`p-2 rounded-full border transition-colors ${
                        playMode === 'list'
                          ? 'border-transparent designer-text-muted hover:designer-text-primary hover:bg-[#EFECE6] dark:hover:bg-[#242420]'
                          : 'border-[#8A6F48]/40 bg-[#EFECE6]/80 dark:bg-[#24231F] text-[#8A6F48] dark:text-[#D2B488]'
                      }`}
                    >
                      {playMode === 'single' ? (
                        <Repeat1 className="w-4 h-4" />
                      ) : playMode === 'shuffle' ? (
                        <Shuffle className="w-4 h-4" />
                      ) : (
                        <Repeat className="w-4 h-4" />
                      )}
                    </button>

                    {/* Center Transport Controls */}
                    <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={playPrev}
                        aria-label={td('上一首', 'Previous track')}
                        className="p-2.5 rounded-full designer-btn-secondary"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        data-sfx="custom"
                        onClick={() => {
                          playVinylNeedle(!isPlaying);
                          togglePlay();
                        }}
                        aria-label={isPlaying ? td('暂停', 'Pause') : td('播放', 'Play')}
                        className="min-w-[96px] px-4 sm:px-5 py-2.5 rounded-full designer-btn-primary font-mono text-xs font-medium flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={playNext}
                        aria-label={td('下一首', 'Next track')}
                        className="p-2.5 rounded-full designer-btn-secondary"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Volume Mute + Compact Slider */}
                    <div className="flex items-center gap-1.5 group/vol">
                      <button
                        type="button"
                        onClick={toggleMute}
                        title={
                          isMuted || volume === 0
                            ? td('取消静音', 'Unmute')
                            : `${td('音量', 'Volume')} ${Math.round(volume * 100)}%`
                        }
                        aria-label={isMuted || volume === 0 ? td('取消静音', 'Unmute') : td('静音', 'Mute')}
                        className="p-2 rounded-full designer-text-muted hover:designer-text-primary hover:bg-[#EFECE6] dark:hover:bg-[#242420] transition-colors"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />
                        ) : volume < 0.5 ? (
                          <Volume1 className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.02}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        aria-label={td('调节音量', 'Volume control')}
                        className="hidden sm:block w-14 h-1 accent-[#8A6F48] dark:accent-[#C8A97E] bg-[#E6E2D8] dark:bg-[#2A2925] rounded-full cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: Synchronized Scrolling Lyrics + Curated Tracklist Switcher */}
              <div className="lg:col-span-7 lg:h-[520px] designer-card rounded-2xl p-5 sm:p-7 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono designer-text-muted pb-3 mb-3 border-b designer-hairline shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
                      {audioRightPane === 'lyrics'
                        ? td('SYNCHRONIZED LYRICS // 实时滚动歌词', 'SYNCHRONIZED LYRICS // LIVE LRC')
                        : td('PLAYLIST // 编码与深夜歌单', 'PLAYLIST // CODING & LATE NIGHT')}
                    </span>
                  </div>

                  {/* Segmented Switcher: Scrolling Lyrics vs Tracklist */}
                  <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-[#F3F1EC] dark:bg-[#1E1E1B] border designer-hairline">
                    <button
                      type="button"
                      onClick={() => {
                        playToggleSwitch(true);
                        setAudioRightPane('lyrics');
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                        audioRightPane === 'lyrics'
                          ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] font-semibold shadow-2xs'
                          : 'designer-text-secondary hover:designer-text-primary'
                      }`}
                    >
                      <AlignLeft className="w-3 h-3" />
                      <span>{td('滚动歌词', 'LYRICS')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playToggleSwitch(false);
                        setAudioRightPane('playlist');
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                        audioRightPane === 'playlist'
                          ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] font-semibold shadow-2xs'
                          : 'designer-text-secondary hover:designer-text-primary'
                      }`}
                    >
                      <ListMusic className="w-3 h-3" />
                      <span>
                        {td(`播放歌单 (${musicList.length})`, `PLAYLIST (${musicList.length})`)}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Quick Horizontal Track Pill Strip (Always visible above lyrics so switching tracks takes 1 click) */}
                {audioRightPane === 'lyrics' && (
                  <div
                    ref={trackStripRef}
                    className="relative flex items-center gap-1.5 overflow-x-auto pb-1 pr-8 shrink-0 ix-fade-end [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {musicList.map((track, idx) => {
                      const active = idx === currentMusicIndex;
                      return (
                        <button
                          key={track.id || idx}
                          type="button"
                          data-active-track={active ? 'true' : undefined}
                          aria-current={active ? 'true' : undefined}
                          onClick={() => selectMusic(idx)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-mono whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 border ${
                            active
                              ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] border-transparent font-semibold'
                              : 'bg-[#F6F4EF] dark:bg-[#1C1B18] designer-text-secondary designer-hairline hover:border-[#8A6F48]'
                          }`}
                        >
                          <span className="opacity-65">{String(idx + 1).padStart(2, '0')}</span>
                          <span>
                            {td(track.title, TRACK_EN_META[track.title]?.titleEn || track.title)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="relative flex-1 min-h-0">
                  {audioRightPane === 'lyrics' ? (
                    <div className="h-[320px] lg:h-full relative overflow-hidden">
                      {/* Return-to-active-lyric floating pill when user scrolls manually */}
                      {isUserScrollingLyrics && parsedLyrics.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserScrollingLyrics(false);
                            if (userScrollTimerRef.current) {
                              window.clearTimeout(userScrollTimerRef.current);
                              userScrollTimerRef.current = null;
                            }
                            scrollLyricsToActive('smooth');
                          }}
                          className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141413]/90 text-[#FAF9F5] dark:bg-[#F2F0EA]/90 dark:text-[#141413] text-[11px] font-mono shadow-md hover:scale-[1.03] transition-transform cursor-pointer"
                        >
                          <Crosshair className="w-3 h-3" />
                          <span>{td('回到当前句', 'Sync Line')}</span>
                        </button>
                      )}

                      {parsedLyrics.length > 0 ? (
                        <div
                          ref={lyricsViewportRef}
                          onWheel={handleLyricsUserScroll}
                          onTouchMove={handleLyricsUserScroll}
                          className="relative h-full overflow-y-auto px-2 sm:px-8 py-[140px] space-y-1.5 scroll-smooth ix-fade-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                          {lyricCredits.length > 0 && (
                            <p className="pb-4 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-mono designer-text-muted opacity-75">
                              {lyricCredits.slice(0, 4).map((credit) => (
                                <span key={credit} className="whitespace-nowrap">
                                  {credit}
                                </span>
                              ))}
                            </p>
                          )}
                          {parsedLyrics.map((line, index) => {
                            const isActive = index === currentLyricIndex;
                            const distance = Math.abs(index - currentLyricIndex);
                            const isPassed = index < currentLyricIndex;
                            return (
                              <button
                                key={index}
                                type="button"
                                ref={(el) => {
                                  lyricsLineRefs.current[index] = el;
                                }}
                                onClick={() => {
                                  if (line.time >= 0) {
                                    setIsUserScrollingLyrics(false);
                                    seekTo(line.time);
                                  }
                                }}
                                title={
                                  line.time >= 0
                                    ? td('点击跳转到该句歌词进度', 'Click to seek to this lyric line')
                                    : undefined
                                }
                                className={`block w-full text-center px-3 py-1.5 rounded-lg transition-all duration-500 whitespace-normal leading-relaxed ${
                                  line.time >= 0 ? 'cursor-pointer hover:bg-[#EFECE6]/60 dark:hover:bg-[#1E1E1B]/70' : 'cursor-default'
                                } ${
                                  isActive
                                    ? 'text-[#8A6F48] dark:text-[#D2B488] font-serif font-medium text-[15px] sm:text-[17px] scale-[1.02]'
                                    : distance === 1
                                    ? 'designer-text-secondary opacity-85 text-xs sm:text-sm'
                                    : isPassed
                                    ? 'designer-text-muted opacity-40 text-xs sm:text-[13px]'
                                    : 'designer-text-muted opacity-55 text-xs sm:text-[13px] hover:opacity-90'
                                }`}
                              >
                                {line.text}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center designer-text-muted gap-2">
                          <Disc className="w-8 h-8 opacity-30" />
                          <span className="text-xs font-mono">
                            {td('纯音乐 / 暂无歌词', 'Instrumental / No Lyrics Available')}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full max-h-[340px] lg:max-h-none overflow-y-auto pr-1.5 divide-y designer-hairline [scrollbar-width:thin]">
                      {musicList.map((track, idx) => {
                        const isCurrent = idx === currentMusicIndex;
                        return (
                          <button
                            key={track.id || idx}
                            type="button"
                            onClick={() => {
                              selectMusic(idx);
                              setAudioRightPane('lyrics');
                            }}
                            className={`w-full py-3 px-3 text-left flex items-center justify-between gap-4 transition-colors rounded-xl ${
                              isCurrent
                                ? 'bg-[#F3F1EC] dark:bg-[#22211E]'
                                : 'hover:bg-[#F6F4EF]/70 dark:hover:bg-[#1C1B18]'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span className="text-xs font-mono text-[#8A6F48] dark:text-[#C8A97E] w-6 shrink-0">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <div className="w-10 h-10 rounded-lg overflow-hidden border designer-hairline shrink-0 bg-[#141413]">
                                {track.coverUrl ? (
                                  <ImageWithFallback
                                    src={getImageUrl(track.coverUrl)}
                                    alt={track.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Disc className="w-5 h-5 text-white m-2.5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium designer-text-primary truncate">
                                  {td(
                                    track.title,
                                    TRACK_EN_META[track.title]?.titleEn || track.title,
                                  )}
                                </div>
                                <div className="text-xs font-mono designer-text-muted truncate">
                                  {td(
                                    track.artist || 'Chill Session',
                                    TRACK_EN_META[track.title]?.artistEn ||
                                      track.artist ||
                                      'Chill Session',
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                              {isCurrent && isPlaying ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8A6F48] text-white text-[10px]">
                                  <span className="inline-flex items-end gap-[1.5px] h-2.5" aria-hidden="true">
                                    <span className="w-[1.5px] h-full rounded-full bg-white eq-bar" />
                                    <span
                                      className="w-[1.5px] h-full rounded-full bg-white eq-bar"
                                      style={{ animationDelay: '0.2s' }}
                                    />
                                    <span
                                      className="w-[1.5px] h-full rounded-full bg-white eq-bar"
                                      style={{ animationDelay: '0.4s' }}
                                    />
                                  </span>
                                  <span>PLAYING</span>
                                </span>
                              ) : (
                                <span className="designer-text-muted text-[11px]">PLAY →</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t designer-hairline flex items-center justify-between gap-3 text-[11px] font-mono designer-text-muted shrink-0">
                  <span className="tabular-nums">
                    TRACK {String(currentMusicIndex + 1).padStart(2, '0')} / {String(musicList.length).padStart(2, '0')}
                    <span className="mx-1.5 opacity-50">·</span>
                    {isSynthFallback ? 'LOFI SYNTH' : 'HI-FI STEREO'}
                  </span>
                  <span className="truncate">{playModeLabel}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= 02 // CURATED CINEMA ARCHIVE ================= */}
        {showSection('cinema') && (
          <section id="section-cinema">
            <div className="mb-8 pb-4 border-b designer-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest designer-accent-text mb-1.5">
                  02 // SCREENING ROOM &amp; FILM NOTES
                </div>
                <h2 className="designer-heading text-2xl sm:text-3xl font-normal tracking-[-0.02em]">
                  {td('光影收藏与私人影评', 'Curated Cinema & Film Notes')}
                </h2>
              </div>
              <span className="text-xs font-mono designer-text-muted tabular-nums">
                01 — {String(moviesList.length).padStart(2, '0')} SELECTED FILMS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {moviesList.map((movie) => {
                const liked = !!likedMovies[movie.id];
                const primaryTitle = td(movie.title, movie.titleEn || movie.title);
                const secondaryTitle = td(movie.titleEn || '', movie.title);
                const director = td(movie.director, movie.directorEn || movie.director);
                const note = td(movie.noteZh, movie.noteEn);
                const ratingNum = Number(movie.rating);
                return (
                  <article
                    key={movie.id}
                    className="designer-card rounded-2xl overflow-hidden flex flex-col group"
                  >
                    {/* Native 2:3 poster beside the entry */}
                    <div className="p-4 sm:p-5 flex gap-4 items-start flex-1">
                      <div className="w-24 sm:w-28 aspect-[2/3] rounded-lg overflow-hidden bg-[#141413] border designer-hairline shrink-0 shadow-xs">
                        <ImageWithFallback
                          src={movie.poster}
                          alt={primaryTitle}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                          <span className="text-[#8A6F48] dark:text-[#C8A97E]">FILM // {movie.code}</span>
                          {movie.year && <span className="designer-text-muted tabular-nums">{movie.year}</span>}
                        </div>
                        <h3 className="mt-2 text-[15px] sm:text-base font-semibold designer-text-primary leading-snug">
                          {primaryTitle}
                        </h3>
                        {secondaryTitle && secondaryTitle !== primaryTitle && (
                          <p className="mt-0.5 text-[11px] designer-text-muted truncate" title={secondaryTitle}>
                            {secondaryTitle}
                          </p>
                        )}
                        {director && (
                          <p className="mt-1.5 inline-flex max-w-full items-center gap-1 text-[10px] font-mono designer-text-muted">
                            <Film className="w-3 h-3 shrink-0 text-[#8A6F48] dark:text-[#C8A97E]" />
                            <span className="truncate">DIR. {director}</span>
                          </p>
                        )}

                        <ClampedNote
                          key={`${movie.id}-${language}`}
                          text={note}
                          className={`mt-2.5 text-xs designer-text-secondary leading-relaxed font-serif ${
                            language === 'en' ? 'italic' : 'not-italic'
                          }`}
                          moreLabel={td('展开全文', 'More')}
                          lessLabel={td('收起', 'Less')}
                          onToggle={(open) => playToggleSwitch(open)}
                        />
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 py-2.5 border-t designer-hairline flex items-center justify-between text-xs font-mono">
                      <span className="inline-flex items-baseline gap-1 designer-text-secondary tabular-nums">
                        {Number.isFinite(ratingNum) && ratingNum > 0 ? (
                          <>
                            <span className="text-[#8A6F48] dark:text-[#C8A97E]">★</span>
                            <span className="font-semibold designer-text-primary">{ratingNum.toFixed(1)}</span>
                            <span className="designer-text-muted text-[10px]">/ 10</span>
                          </>
                        ) : (
                          <span className="designer-text-muted">—</span>
                        )}
                      </span>
                      <button
                        aria-pressed={liked}
                        aria-label={td('喜欢这部电影', 'Like this film')}
                        type="button"
                        data-sfx="custom"
                        onClick={() => {
                          if (!liked) {
                            playSuccessChime();
                            axios.post(`/api/movies/${movie.id}/like`).catch(() => {});
                          } else {
                            playToggleSwitch(false);
                          }
                          setLikedMovies((prev) => ({ ...prev, [movie.id]: !prev[movie.id] }));
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all active:scale-95 ${
                          liked
                            ? 'bg-[#8A6F48] text-white border-transparent shadow-xs'
                            : 'designer-pill designer-text-secondary'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
                        <span className="tabular-nums">{movie.likes + (liked ? 1 : 0)}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= 03 // TACTILE 3D FLIPBOOK READING ROOM ================= */}
        {showSection('play_read') && (
          <section id="section-play-read">
            <div className="mb-8 pb-4 border-b designer-hairline">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest designer-accent-text mb-1.5">
                    03 // READING ROOM
                  </div>
                  <h2 className="designer-heading text-2xl sm:text-3xl font-normal tracking-[-0.02em]">
                    {td('常读书单 · 拟真翻页书房', 'Curated Reading Ledger · Interactive Flipbook')}
                  </h2>
                </div>
                <button
                  type="button"
                  data-sfx="custom"
                  onClick={() => toggleSectionHint('reading')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full designer-pill text-[11px] font-mono designer-text-muted hover:designer-text-primary transition-colors shrink-0"
                >
                  <Info className="w-3 h-3 text-[#8A6F48]" />
                  <span>{td('说明', 'Info')}</span>
                </button>
              </div>
              {openSectionHints.reading && (
                <p className="mt-3 text-xs font-mono designer-text-muted bg-[#F6F4EF] dark:bg-[#181815] px-3.5 py-2 rounded-xl border designer-hairline">
                  {td(
                    'WebGL 柔性纸张精装书：可按住鼠标左右拖拽弯曲翻页，或直接点击左右书页与底部页码切换。',
                    'WebGL flexible paper book: drag pages horizontally to bend and turn, or click left/right pages.'
                  )}
                </p>
              )}
            </div>

            <InteractiveReadingRoom />
          </section>
        )}

        {/* ================= 04 // FOOTPRINTS & FIELD MOMENTS ================= */}
        {showSection('footprints') && (
          <section id="section-footprints" className="space-y-10">
            <div className=" pb-4 border-b designer-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest designer-accent-text mb-1.5">
                  04 // FIELD NOTES &amp; FOOTPRINTS
                </div>
                <h2 className="designer-heading text-2xl sm:text-3xl font-normal tracking-[-0.02em]">
                  {td('日常随笔与旅行足迹', 'Field Moments & Travel Footprints')}
                </h2>
              </div>
              <span className="text-xs font-mono designer-text-muted">
                CHANGSHA &amp; BEYOND
              </span>
            </div>

            {/* Moments — even grid, every photo framed 4:3 so rows line up */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {momentsList.map((moment) => {
                const liked = !!likedMoments[moment.id];
                const imgs = moment.images && moment.images.length > 0 ? moment.images : [moment.image];
                const shownImgs = imgs.slice(0, 2);
                const placeLabel = td(moment.location, moment.locationEn || moment.location);
                const openMomentLightbox = (idx: number) => {
                  setMomentLightboxSlides(imgs.map((src) => ({ src })));
                  setMomentLightboxIndex(idx);
                  setMomentLightboxOpen(true);
                };
                return (
                  <article
                    key={moment.id}
                    className="designer-card rounded-2xl overflow-hidden flex flex-col group"
                  >
                    <div
                      className={`relative aspect-[4/3] overflow-hidden bg-[#F3F1EC] dark:bg-[#181815] border-b designer-hairline ${
                        shownImgs.length > 1 ? 'grid grid-cols-2 gap-0.5' : ''
                      }`}
                    >
                      {shownImgs.map((imgSrc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => openMomentLightbox(idx)}
                          aria-label={td(`查看大图 ${idx + 1}/${imgs.length}`, `View photo ${idx + 1} of ${imgs.length}`)}
                          className="relative block w-full h-full overflow-hidden cursor-zoom-in"
                        >
                          <ImageWithFallback
                            src={imgSrc}
                            alt={`${placeLabel} ${idx + 1}`}
                            className="w-full h-full object-cover !object-[50%_30%] group-hover:scale-[1.03] transition-transform duration-700"
                          />
                          {idx === shownImgs.length - 1 && imgs.length > shownImgs.length && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white text-sm font-mono">
                              +{imgs.length - shownImgs.length}
                            </span>
                          )}
                        </button>
                      ))}
                      <span className="pointer-events-none absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-3 h-3" />
                        {imgs.length > 1 && <span className="tabular-nums">{imgs.length}</span>}
                      </span>
                    </div>

                    <div className="p-5 flex-1">
                      <div className="text-[11px] font-mono tabular-nums text-[#8A6F48] dark:text-[#C8A97E] mb-2">
                        {moment.date}
                      </div>
                      <p className="text-sm designer-text-primary leading-relaxed">
                        {td(moment.contentZh, moment.contentEn)}
                      </p>
                    </div>

                    <div className="px-5 py-3 border-t designer-hairline flex items-center justify-between gap-3 text-xs font-mono">
                      <span className="designer-text-muted flex items-center gap-1 min-w-0">
                        <MapPin className="w-3 h-3 text-[#8A6F48] shrink-0" />
                        <span className="truncate">{placeLabel}</span>
                      </span>
                      <button
                        aria-pressed={liked}
                        aria-label={td('点赞', 'Like')}
                        type="button"
                        data-sfx="custom"
                        onClick={() => {
                          if (!liked) {
                            playSuccessChime();
                            axios.post(`/api/moments/${moment.id}/likes`).catch(() => {});
                          } else {
                            playToggleSwitch(false);
                          }
                          setLikedMoments((prev) => ({ ...prev, [moment.id]: !prev[moment.id] }));
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border transition-all active:scale-95 ${
                          liked
                            ? 'bg-[#8A6F48] text-white border-transparent shadow-xs'
                            : 'designer-pill designer-text-secondary'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
                        <span className="tabular-nums">{moment.likes + (liked ? 1 : 0)}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <Lightbox
              open={momentLightboxOpen}
              close={() => setMomentLightboxOpen(false)}
              index={momentLightboxIndex}
              slides={momentLightboxSlides}
            />

            {/* Travel Map Container */}
            <div className="designer-card rounded-2xl p-4 sm:p-6 overflow-hidden">
              <TravelMap />
            </div>
          </section>
        )}

        {/* ================= 05 // 3D SHUTTER ISLAND OPEN-WORLD PORTAL ================= */}
        {showSection('island3d') && (
          <section id="section-island3d">
            <div className="mb-8 pb-4 border-b designer-hairline">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest designer-accent-text mb-1.5">
                    05 // 3D OPEN WORLD
                  </div>
                  <h2 className="designer-heading text-2xl sm:text-3xl font-normal tracking-[-0.02em]">
                    {td('《光影拾遗岛》· 3D 摄影开放世界', 'The Shutter Island · 3D Open World')}
                  </h2>
                </div>
                <button
                  type="button"
                  data-sfx="custom"
                  onClick={() => toggleSectionHint('island3d')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full designer-pill text-[11px] font-mono designer-text-muted hover:designer-text-primary transition-colors shrink-0"
                >
                  <Info className="w-3 h-3 text-[#8A6F48]" />
                  <span>{td('说明', 'Info')}</span>
                </button>
              </div>
              {openSectionHints.island3d && (
                <p className="mt-3 text-xs font-mono designer-text-muted bg-[#F6F4EF] dark:bg-[#181815] px-3.5 py-2 rounded-xl border designer-hairline">
                  {td(
                    'Three.js WebGL 实时软阴影：5 座浮空岛与 12 座摄影画架，支持 WASD/点击漫步、24 小时太阳光影滑块与按 V 键单反取景器拍明信片。',
                    'Three.js WebGL world with 5 floating islands, 12 photo easels, 24h Golden Hour slider, and V-key SLR postcard viewfinder.'
                  )}
                </p>
              )}
            </div>

            {inline3DOpen ? (
              <div className="designer-card rounded-2xl p-3 sm:p-4 overflow-hidden">
                <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b designer-hairline text-xs font-mono">
                  <span className="text-[#8A6F48] dark:text-[#C8A97E] font-bold">
                    ● THE SHUTTER ISLAND
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/shutter-island')}
                      className="px-3 py-1 rounded-full designer-btn-primary text-[11px] flex items-center gap-1.5"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>{td('全屏漫游', 'Fullscreen')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInline3DOpen(false)}
                      className="px-3 py-1 rounded-full designer-btn-secondary text-[11px]"
                    >
                      {td('收起', 'Close')}
                    </button>
                  </div>
                </div>
                <ShutterIsland3D embedded onExit={() => setInline3DOpen(false)} />
              </div>
            ) : (
              <div className="designer-card rounded-2xl p-5 sm:p-8 overflow-hidden relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                  {/* Left 7 Cols: Minimalist Copy + Collapsible Gameplay Guide */}
                  <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                    <h3 className="designer-heading text-xl sm:text-3xl font-normal leading-snug">
                      {td(
                        '把摄影与故事，种进一座会随太阳流转光影的 3D 浮空群岛。',
                        'A living 3D archipelago where photography and Golden Hour light float above the sea.'
                      )}
                    </h3>

                    {/* Compact One-Line Island Tags */}
                    <ol className="flex flex-wrap gap-1.5 font-mono text-[11px]" aria-label={td('五座岛屿', 'Five islands')}>
                      {[
                        td('拾光风车岛', 'Windmill'),
                        td('丁达尔森林', 'Forest'),
                        td('海岸灯塔暗房', 'Lighthouse'),
                        td('云端观星台', 'Summit'),
                        td('漂流瓶码头', 'Sunset Pier'),
                      ].map((label, i) => (
                        <li
                          key={label}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F6F4EF] dark:bg-[#1A1917] border designer-hairline designer-text-secondary"
                        >
                          <span className="opacity-50 tabular-nums">{i + 1}</span>
                          {label}
                        </li>
                      ))}
                    </ol>

                    {/* Collapsible Details Toggle */}
                    <div>
                      <button
                        type="button"
                        data-sfx="custom"
                        onClick={() => {
                          playToggleSwitch(!showIslandDetails);
                          setShowIslandDetails((v) => !v);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-mono text-[#8A6F48] dark:text-[#C8A97E] hover:underline"
                      >
                        <span>{showIslandDetails ? td('收起岛屿介绍', 'Hide Details') : td('查看玩法与岛屿介绍', 'View Details')}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${showIslandDetails ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {showIslandDetails && (
                        <p className="mt-2.5 text-xs sm:text-sm designer-text-secondary leading-relaxed">
                          {td(
                            '化身背着旁轴相机的旅人，踏过石板小径与拱形木桥：拖动 24 小时太阳轨迹滑块切换「晨雾、晴空、黄金时刻、蓝调、星野」；按 V 键开启复古单反取景器拍下专属小岛明信片，或在山顶篝火与浅滩红邮筒旁投递发光漂流瓶。',
                            'Roam across flagstone paths and timber bridges, shift the 24-hour sun slider from Dawn to Starlight Night, press V for the SLR viewfinder to capture postcards, or toss a drift bottle at the pier.'
                          )}
                        </p>
                      )}
                    </div>

                    {/* Action CTA Buttons */}
                    <div className="pt-1 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('/shutter-island')}
                        className="px-6 py-2.5 rounded-full designer-btn-primary font-mono text-xs font-semibold flex items-center gap-2 shadow-sm hover:scale-[1.01] transition-transform"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{td('全屏登岛漫游 →', 'Enter 3D World →')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInline3DOpen(true)}
                        className="px-5 py-2.5 rounded-full designer-btn-secondary font-mono text-xs font-medium flex items-center gap-2"
                      >
                        <Sun className="w-4 h-4 text-[#8A6F48]" />
                        <span>{td('页内展开 3D 沙盘', 'Inline Sandbox')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right 5 Cols: Clean Viewfinder Poster Card */}
                  <div className="lg:col-span-5">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate('/shutter-island')}
                      className="group relative rounded-2xl overflow-hidden border border-[#8A6F48]/30 bg-[#141413] p-6 min-h-[250px] flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-xl transition-all"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 72% 28%, rgba(245, 158, 11, 0.42), transparent 52%), linear-gradient(180deg, #27223B 0%, #8C4E3A 54%, #1A2F4A 100%)',
                      }}
                    >
                      <div className="pointer-events-none absolute inset-4 border border-white/15 rounded-xl" />

                      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-amber-100/90">
                        <span className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-xs border border-white/15">
                          ● GOLDEN HOUR · 17:45
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-xs border border-white/15">
                          WEBGL 3D
                        </span>
                      </div>

                      <div className="relative z-10 my-5 flex flex-col items-center justify-center text-center">
                        <div className="w-13 h-13 p-3 rounded-full bg-[#FAF9F5]/95 text-[#141413] flex items-center justify-center shadow-2xl ring-4 ring-amber-400/25 group-hover:scale-110 transition-transform">
                          <Compass className="w-6 h-6 text-[#8A6F48]" />
                        </div>
                        <div className="mt-3.5 text-[#FAF9F5] font-serif text-lg tracking-wide drop-shadow">
                          {td('光影拾遗岛 · Shutter Island', 'The Shutter Island')}
                        </div>
                      </div>

                      <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-[10px] font-mono text-white/85">
                        <span>5 ISLANDS · 12 EASELS</span>
                        <span className="text-amber-300 font-bold group-hover:translate-x-1 transition-transform">
                          EXPLORE →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================= 06 // EDITORIAL DANMAKU GUESTBOOK WALL ================= */}
        {showSection('danmaku') && (
          <section id="section-danmaku">
            <div className="mb-8 pb-4 border-b designer-hairline">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest designer-accent-text mb-1.5">
                    06 // GUESTBOOK STREAM
                  </div>
                  <h2 className="designer-heading text-2xl sm:text-3xl font-normal tracking-[-0.02em]">
                    {td('弹幕留言墙', 'Interactive Guestbook Stream')}
                  </h2>
                </div>
                <button
                  type="button"
                  data-sfx="custom"
                  onClick={() => toggleSectionHint('danmaku')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full designer-pill text-[11px] font-mono designer-text-muted hover:designer-text-primary transition-colors shrink-0"
                >
                  <Info className="w-3 h-3 text-[#8A6F48]" />
                  <span>{td('说明', 'Info')}</span>
                </button>
              </div>
              {openSectionHints.danmaku && (
                <p className="mt-3 text-xs font-mono designer-text-muted bg-[#F6F4EF] dark:bg-[#181815] px-3.5 py-2 rounded-xl border designer-hairline">
                  {td('悬停任意一行可暂停滚动；选好颜色，写下留言即可上墙。', 'Hover a lane to pause it. Pick a colour and post your note below.')}
                </p>
              )}
            </div>

            <div className="designer-card rounded-2xl p-4 sm:p-8">
              {/* Danmaku Stream Canvas — Warm Sand & Architectural Grid */}
              <div
                className="relative overflow-hidden rounded-xl bg-[#F6F4EF] dark:bg-[#121210] border designer-hairline mb-5 sm:mb-6 h-[210px] sm:h-[260px]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(138,111,72,0.16) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              >
                {danmakuLanes.map((lane, laneIdx) => (
                  <div
                    key={laneIdx}
                    className="ix-danmaku-lane"
                    style={{ top: `${laneIdx * 22 + 9}%`, height: '38px' }}
                  >
                    <div
                      className="ix-danmaku-track"
                      style={
                        {
                          '--ix-dur': `${lane.duration.toFixed(1)}s`,
                          '--ix-delay': `${lane.delay.toFixed(1)}s`,
                        } as React.CSSProperties
                      }
                    >
                      {[0, 1].map((copy) =>
                        lane.items.map((it) => (
                          <span
                            key={`${copy}-${it.key}`}
                            aria-hidden={copy === 1 || undefined}
                            title={it.msg.content}
                            className={`ix-danmaku-note shrink-0 whitespace-nowrap text-xs font-mono px-4 py-2 rounded-full shadow-xs select-none dark:ring-1 dark:ring-white/10 ${getDanmakuBadgeStyle(
                              it.msg.color,
                            )} ${it.msg.id === freshDanmakuId ? 'ix-danmaku-note--fresh' : ''}`}
                            style={{ marginRight: `${it.gap}px` }}
                          >
                            {it.msg.content}
                          </span>
                        )),
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input & Tone Selector */}
              <form onSubmit={handleSendDanmaku} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div
                  role="radiogroup"
                  aria-label={td('留言颜色', 'Note colour')}
                  className="flex items-center gap-2.5 shrink-0"
                >
                  <span className="text-xs font-mono designer-text-muted">{td('颜色', 'Colour')}</span>
                  {DANMAKU_TONE_PICKER.map((tone) => {
                    const selected = danmakuTone === tone.id;
                    const label = td(tone.labelZh, tone.labelEn);
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setDanmakuTone(tone.id)}
                        className={`w-5 h-5 rounded-full ${tone.swatch} transition-all ring-offset-2 ring-offset-[color:var(--bg-card)] ${
                          selected
                            ? 'ring-2 ring-[#8A6F48] dark:ring-[#C8A97E]'
                            : 'opacity-70 hover:opacity-100 hover:scale-110 dark:ring-1 dark:ring-white/20 dark:ring-offset-0'
                        }`}
                        title={label}
                        aria-label={label}
                      />
                    );
                  })}
                </div>

                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    value={danmakuInput}
                    onChange={(e) => setDanmakuInput(e.target.value)}
                    maxLength={50}
                    aria-label={td('留言内容', 'Your note')}
                    placeholder={td('写下一句留言，让它飘过这面墙…', 'Write a note to float across the wall…')}
                    className="w-full pl-4 pr-14 py-2.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline focus:border-[#8A6F48] dark:focus:border-[#C8A97E] focus:ring-2 focus:ring-[#8A6F48]/15 outline-none text-base sm:text-sm designer-text-primary transition-colors"
                  />
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono tabular-nums ${
                      danmakuInput.length >= 45 ? 'text-[#9E553F]' : 'designer-text-muted'
                    }`}
                  >
                    {danmakuInput.length}/50
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!danmakuInput.trim() || submittingDanmaku}
                  className="px-6 py-2.5 rounded-xl designer-btn-primary font-mono text-xs font-medium flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingDanmaku ? td('发送中…', 'POSTING…') : td('发送上墙', 'POST NOTE')}</span>
                </button>
              </form>
              <p
                role="status"
                aria-live="polite"
                className={`mt-2.5 min-h-[1.25rem] text-[11px] font-mono transition-opacity ${
                  danmakuStatus ? 'opacity-100' : 'opacity-0'
                } ${danmakuStatus?.kind === 'error' ? 'text-[#9E553F] dark:text-[#E08B72]' : 'text-[#8A6F48] dark:text-[#C8A97E]'}`}
              >
                {danmakuStatus ? `${danmakuStatus.kind === 'error' ? '✕' : '✓'} ${danmakuStatus.text}` : ''}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
