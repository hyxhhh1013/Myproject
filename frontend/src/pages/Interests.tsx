import React, { useEffect, useState, useRef, useMemo } from 'react';
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
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { useI18n } from '../i18n/i18nContext';
import { ImageWithFallback } from '../components/UI/ImageWithFallback';
import { getImageUrl } from '../utils/imageUtils';
import { TravelMap } from '../components/Sections/TravelMap';
import { ShutterIsland3D } from './ShutterIsland3D';
import { InteractiveReadingRoom } from '../components/UI/InteractiveReadingRoom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
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
  { id: 101, content: '欢迎来到奕轩的数字花园 · 极简沙白质感太舒服了', color: 'bronze', orderIndex: 1 },
  { id: 102, content: '禾书耕文的 AI4Science 架构拆解很硬核！', color: 'ink', orderIndex: 2 },
  { id: 103, content: '长沙笨萝卜醋蒸鸡永远的神', color: 'terracotta', orderIndex: 3 },
  { id: 104, content: '黑胶唱机点播放真的有 Lofi 电钢琴和弦伴奏 ♪', color: 'moss', orderIndex: 4 },
  { id: 105, content: '祝早日拿到心仪的 AI Agent / 全栈 Offer', color: 'bronze', orderIndex: 5 },
  { id: 106, content: '同为农大学子前来打卡支持！', color: 'ink', orderIndex: 6 },
];

interface ParsedLyricLine {
  time: number;
  text: string;
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
      .filter(Boolean)
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
  { titleEn: string; directorEn: string; noteEn: string }
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
  },
  '你的婚礼': {
    titleEn: 'My Love',
    directorEn: 'Han Tian',
    noteEn: 'Fifteen years of youth, growth, and bittersweet timing — a nostalgic coming-of-age story.',
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
    title: '星际穿越 Interstellar',
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
    title: '肖申克的救赎 The Shawshank Redemption',
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
    title: '沙丘 2 Dune: Part Two',
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
    title: '蜘蛛侠：纵横宇宙 Across the Spider-Verse',
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
    title: '海上钢琴师 The Legend of 1900',
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
    title: '让子弹飞 Let the Bullets Fly',
    director: '姜文 Jiang Wen',
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
    date: '2026.11 · CHANGSHA',
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
    date: '2026.10 · YUELU MOUNTAIN',
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
    date: '2026.09 · ONION EDU',
    location: '湖南洋葱教育 · FDE 驻场工作台',
    contentZh:
      '作为 FDE 驻场工程师和教研老师们坐在一起改工作流，才真正理解“技术指标好”和“业务一线好用”之间那最后 1 公里的工程价值。',
    contentEn:
      'Sitting right next to curriculum teachers as an FDE taught me the crucial last mile between raw model benchmarks and real-world product usability.',
    image: 'https://picsum.photos/seed/moment-fde/700/460',
    likes: 46,
  },
];

export default function Interests() {
  const { t, td } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    musicList,
    currentMusicIndex,
    currentMusic,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    selectMusic,
  } = useMusic();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [audioRightPane, setAudioRightPane] = useState<'lyrics' | 'playlist'>('lyrics');
  const lyricsViewportRef = useRef<HTMLDivElement | null>(null);
  const [lyricsViewportHeight, setLyricsViewportHeight] = useState<number>(320);
  const [inline3DOpen, setInline3DOpen] = useState<boolean>(false);
  const [openSectionHints, setOpenSectionHints] = useState<Record<string, boolean>>({});
  const [expandedMovieNotes, setExpandedMovieNotes] = useState<Record<number, boolean>>({});
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
      dateEn?: string;
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
  const [danmakuTone, setDanmakuTone] = useState<'ink' | 'bronze' | 'moss' | 'terracotta'>('bronze');
  const [submittingDanmaku, setSubmittingDanmaku] = useState(false);

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
        if (res.data?.status === 'success' && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setDanmakuList(res.data.data);
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
              const matchedCurated = CURATED_MOVIES.find(
                (cm) => cm.title.includes(m.title) || m.title.includes(cm.title.split(' ')[0]),
              );
              const metaEn =
                Object.entries(MOVIE_EN_META).find(
                  ([k]) => (m.title || '').includes(k) || k.includes(m.title || ''),
                )?.[1] || undefined;
              const posterSrc = m.posterUrl || m.poster;
              return {
                id: m.id,
                code: `0${idx + 1}`.slice(-2),
                title: matchedCurated ? matchedCurated.title : m.title,
                titleEn: metaEn?.titleEn || matchedCurated?.title || m.title,
                director: m.director || matchedCurated?.director || 'Director',
                directorEn: metaEn?.directorEn || matchedCurated?.director || m.director || 'Director',
                year: String(m.year || matchedCurated?.year || '2024'),
                rating: String(m.rating || matchedCurated?.rating || '9.0'),
                poster: posterSrc ? getImageUrl(posterSrc) : matchedCurated?.poster || 'https://picsum.photos/seed/film/500/700',
                noteZh: m.review || matchedCurated?.noteZh || '光影留存，值得反复细品的银幕佳作。',
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
                date: `${dateStr} · ${m.location || 'CHANGSHA'}`,
                dateEn: `${dateStr} · ${locEn.split('·')[0].trim().toUpperCase()}`,
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
  const parsedLyrics = useMemo(() => {
    const rawLrc =
      currentMusic?.lyrics ||
      (currentMusic?.title ? FALLBACK_TRACK_LYRICS[currentMusic.title] : '') ||
      FALLBACK_TRACK_LYRICS['如果呢'];
    return parseLrcLyrics(rawLrc);
  }, [currentMusic?.lyrics, currentMusic?.title]);

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

  useEffect(() => {
    const updateLyricsHeight = () => {
      if (lyricsViewportRef.current) {
        setLyricsViewportHeight(lyricsViewportRef.current.clientHeight || 320);
      }
    };
    updateLyricsHeight();
    window.addEventListener('resize', updateLyricsHeight);
    return () => window.removeEventListener('resize', updateLyricsHeight);
  }, [audioRightPane, activeFilter]);

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

    setSubmittingDanmaku(true);
    playSuccessChime();
    setDanmakuList((prev) => [...prev, newItem]);
    setDanmakuInput('');

    try {
      await axios.post('/api/danmaku', { content, color: danmakuTone });
    } catch {
      // Optimistically added
    } finally {
      setSubmittingDanmaku(false);
    }
  };

  const getDanmakuBadgeStyle = (color: string) => {
    switch (color) {
      case 'ink':
        return 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] border-[#141413]';
      case 'moss':
        return 'bg-[#1E3329] text-[#FAF9F5] border-[#1E3329]';
      case 'terracotta':
        return 'bg-[#9E553F] text-[#FAF9F5] border-[#9E553F]';
      default:
        return 'bg-[#8A6F48] text-[#FAF9F5] border-[#8A6F48]';
    }
  };

  const filterTabs: { id: FilterTab; code: string; labelZh: string; labelEn: string }[] = [
    { id: 'all', code: 'ALL', labelZh: '全部档案', labelEn: 'All Archives' },
    { id: 'audio', code: '01', labelZh: '听 · 黑胶与歌单', labelEn: 'Vinyl & Audio' },
    { id: 'cinema', code: '02', labelZh: '看 · 经典影单', labelEn: 'Curated Cinema' },
    { id: 'play_read', code: '03', labelZh: '读 · 拟真翻页书房', labelEn: 'Interactive Reading Room' },
    { id: 'footprints', code: '04', labelZh: '行 · 足迹与日常', labelEn: 'Footprints & Notes' },
    { id: 'island3d', code: '05', labelZh: '游 · 3D 光影拾遗岛', labelEn: '3D Shutter Island' },
    { id: 'danmaku', code: '06', labelZh: '言 · 弹幕留言墙', labelEn: 'Guestbook Wall' },
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

          {/* Archive Telemetry Summary */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 md:pt-0 border-t md:border-t-0 designer-hairline font-mono text-left">
            <div>
              <div className="text-[10px] designer-text-muted uppercase truncate">VINYL &amp; LOFI</div>
              <div className="text-base sm:text-lg font-semibold designer-text-primary mt-0.5">
                {musicList.length} Tracks
              </div>
            </div>
            <div>
              <div className="text-[10px] designer-text-muted uppercase truncate">CINEMA &amp; BOOKS</div>
              <div className="text-base sm:text-lg font-semibold designer-text-primary mt-0.5">10 Curated</div>
            </div>
            <div>
              <div className="text-[10px] designer-text-muted uppercase truncate">GUEST NOTES</div>
              <div className="text-base sm:text-lg font-semibold text-[#8A6F48] dark:text-[#C8A97E] mt-0.5">
                {danmakuList.length} Notes
              </div>
            </div>
          </div>
        </div>

        {/* Filter Navigation Bar — Horizontally scrollable on mobile */}
        <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap items-center gap-2 mt-7 sm:mt-10 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filterTabs.map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
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
                <span className="opacity-65">{tab.code}</span>
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
              <div className="lg:col-span-5 lg:h-[500px] designer-card rounded-2xl p-5 sm:p-7 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-mono designer-text-muted pb-3 border-b designer-hairline shrink-0">
                  <span>TURNTABLE // MODEL HYX-LP01</span>
                  <span className="text-[#8A6F48] dark:text-[#C8A97E]">
                    {isPlaying ? '● 33⅓ RPM SPINNING' : '○ STANDBY'}
                  </span>
                </div>

                {/* Spinning Vinyl Platter + Tonearm (Click Platter to Play/Pause) */}
                <div className="relative my-4 flex-1 flex items-center justify-center">
                  <div
                    role="button"
                    tabIndex={0}
                    data-sfx="custom"
                    onClick={() => {
                      playVinylNeedle(!isPlaying);
                      togglePlay();
                    }}
                    title={td('点击黑胶唱片播放 / 暂停', 'Click vinyl disc to Play / Pause')}
                    className={`relative w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-[#141413] border-4 border-[#2C2B28] shadow-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.99] ${
                      isPlaying ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: '10s' }}
                  >
                    {/* Vinyl Grooves */}
                    <div className="absolute inset-3 rounded-full border border-white/10 pointer-events-none" />
                    <div className="absolute inset-7 rounded-full border border-white/10 pointer-events-none" />
                    <div className="absolute inset-11 rounded-full border border-white/10 pointer-events-none" />

                    {/* Album Center Label */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#8A6F48] relative">
                      {currentMusic?.coverUrl ? (
                        <img
                          src={getImageUrl(currentMusic.coverUrl)}
                          alt={currentMusic.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#8A6F48] flex items-center justify-center">
                          <Disc className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-[#FAF9F5] border border-black/30" />
                    </div>
                  </div>

                  {/* Minimalist Tonearm */}
                  <div
                    className="pointer-events-none absolute top-1 sm:top-2 right-3 sm:right-6 w-14 sm:w-16 h-20 sm:h-24 origin-top-right transition-transform duration-500"
                    style={{ transform: isPlaying ? 'rotate(24deg)' : 'rotate(4deg)' }}
                  >
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#8A6F48] ml-auto" />
                    <div className="w-0.5 h-16 sm:h-20 bg-[#8A6F48] ml-auto mr-1.5" />
                  </div>
                </div>

                {/* Track Info & Progress */}
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold designer-text-primary truncate">
                        {td(
                          currentMusic?.title || '如果呢',
                          TRACK_EN_META[currentMusic?.title || '如果呢']?.titleEn ||
                            currentMusic?.title ||
                            'What If (Ru Guo Ne)',
                        )}
                      </h3>
                      <p className="text-xs font-mono designer-text-muted truncate">
                        {td(
                          currentMusic?.artist || '郑润泽',
                          TRACK_EN_META[currentMusic?.title || '如果呢']?.artistEn ||
                            currentMusic?.artist ||
                            'Zheng Runze',
                        )}
                      </p>
                    </div>
                    <span className="text-xs font-mono designer-text-muted shrink-0">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      seekTo(ratio * (duration || 165));
                    }}
                    className="h-1.5 bg-[#E6E2D8] dark:bg-[#2A2925] rounded-full cursor-pointer overflow-hidden mb-5"
                  >
                    <div
                      className="h-full bg-[#8A6F48] dark:bg-[#C8A97E] rounded-full transition-all"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={playPrev}
                      aria-label="Previous track"
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
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      className="px-6 py-2.5 rounded-full designer-btn-primary font-mono text-xs font-medium flex items-center gap-2"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlaying ? 'PAUSE' : 'PLAY LP'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={playNext}
                      aria-label="Next track"
                      className="p-2.5 rounded-full designer-btn-secondary"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: Synchronized Scrolling Lyrics + Curated Tracklist Switcher */}
              <div className="lg:col-span-7 lg:h-[500px] designer-card rounded-2xl p-5 sm:p-7 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono designer-text-muted pb-3 mb-3 border-b designer-hairline shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
                      {audioRightPane === 'lyrics'
                        ? td('SYNCHRONIZED LYRICS // 实时滚动歌词', 'SYNCHRONIZED LYRICS // LIVE LRC')
                        : 'PLAYLIST INDEX // CODING & LATE NIGHT'}
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
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 border-b designer-hairline shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {musicList.map((track, idx) => {
                      const active = idx === currentMusicIndex;
                      return (
                        <button
                          key={track.id || idx}
                          type="button"
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
                    <div
                      ref={lyricsViewportRef}
                      className="h-[310px] lg:h-full relative overflow-hidden rounded-xl bg-[#FAF9F5]/75 dark:bg-[#121210]/80 border designer-hairline"
                    >
                      {/* Top & Bottom Soft Fade Masks */}
                      <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#FAF9F5] dark:from-[#121210] to-transparent z-10" />
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FAF9F5] dark:from-[#121210] to-transparent z-10" />

                      {parsedLyrics.length > 0 ? (
                        <div
                          className="absolute w-full transition-transform duration-700 ease-out"
                          style={{
                            transform: `translateY(${
                              lyricsViewportHeight / 2 -
                              19 -
                              Math.max(0, currentLyricIndex) * 38
                            }px)`,
                          }}
                        >
                          {parsedLyrics.map((line, index) => {
                            const isActive = index === currentLyricIndex;
                            const isPassed = index < currentLyricIndex;
                            return (
                              <div
                                key={index}
                                onClick={() => {
                                  if (line.time >= 0) {
                                    seekTo(line.time);
                                  }
                                }}
                                title={
                                  line.time >= 0
                                    ? td('点击跳转到该句歌词进度', 'Click to seek to this lyric line')
                                    : undefined
                                }
                                className={`h-[38px] flex items-center justify-center text-center px-4 sm:px-8 w-full transition-all duration-500 ${
                                  line.time >= 0 ? 'cursor-pointer' : 'cursor-default'
                                } ${
                                  isActive
                                    ? 'text-[#8A6F48] dark:text-[#D2B488] font-semibold text-sm sm:text-base scale-[1.04]'
                                    : isPassed
                                    ? 'designer-text-muted opacity-50 text-xs sm:text-sm'
                                    : 'designer-text-secondary text-xs sm:text-sm hover:designer-text-primary'
                                }`}
                              >
                                <span className="truncate w-full">{line.text}</span>
                              </div>
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
                                <span className="px-2.5 py-0.5 rounded-full bg-[#8A6F48] text-white text-[10px]">
                                  PLAYING
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

                <div className="mt-4 pt-3.5 border-t designer-hairline flex items-center justify-between text-[11px] font-mono designer-text-muted shrink-0">
                  <span>LRC SYNC ENGINE</span>
                  <span>STEREO 44.1KHZ</span>
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
              <span className="text-xs font-mono designer-text-muted">
                01 — 06 SELECTED FILMS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moviesList.map((movie) => {
                const liked = !!likedMovies[movie.id];
                return (
                  <div
                    key={movie.id}
                    className="designer-card rounded-2xl overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      <div className="px-5 py-2.5 border-b designer-hairline flex items-center justify-between text-[11px] font-mono bg-[#FAF9F5] dark:bg-[#141412]">
                        <span className="text-[#8A6F48] dark:text-[#C8A97E]">
                          FILM // {movie.code}
                        </span>
                        <span className="designer-text-muted">
                          {movie.year} · ★ {movie.rating}
                        </span>
                      </div>

                      {/* Side-by-side layout with native 2:3 vertical cinema poster ratio */}
                      <div className="p-4 sm:p-5 flex gap-4 items-start">
                        <div className="w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden bg-[#141413] border designer-hairline shrink-0 shadow-xs">
                          <ImageWithFallback
                            src={movie.poster}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="inline-flex items-center gap-1 text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E] mb-1">
                              <Film className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                DIR. {td(movie.director, movie.directorEn || movie.director)}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-semibold designer-text-primary mb-2 leading-snug">
                              {td(movie.title, movie.titleEn || movie.title)}
                            </h3>

                            {/* Film review hidden by default — click to reveal */}
                            <button
                              type="button"
                              data-sfx="custom"
                              onClick={() => {
                                playToggleSwitch(!expandedMovieNotes[movie.id]);
                                setExpandedMovieNotes((prev) => ({
                                  ...prev,
                                  [movie.id]: !prev[movie.id],
                                }));
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E] hover:underline"
                            >
                              <span>
                                {expandedMovieNotes[movie.id]
                                  ? td('收起影评', 'Hide Note')
                                  : td('展开影评', 'Read Note')}
                              </span>
                              <ChevronDown
                                className={`w-3 h-3 transition-transform ${
                                  expandedMovieNotes[movie.id] ? 'rotate-180' : ''
                                }`}
                              />
                            </button>

                            {expandedMovieNotes[movie.id] && (
                              <p className="mt-2 text-xs designer-text-secondary leading-relaxed font-serif italic">
                                {td(movie.noteZh, movie.noteEn)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3 bg-[#FAF9F5] dark:bg-[#141412] border-t designer-hairline flex items-center justify-between text-xs font-mono">
                      <span className="designer-text-muted">ARCHIVE ENTRY</span>
                      <button
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
                        <span>{movie.likes + (liked ? 1 : 0)}</span>
                      </button>
                    </div>
                  </div>
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

            {/* Moments Cards — Natural Aspect Ratio Masonry without Black Bars */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {momentsList.map((moment) => {
                const liked = !!likedMoments[moment.id];
                const imgs = moment.images && moment.images.length > 0 ? moment.images : [moment.image];
                return (
                  <div
                    key={moment.id}
                    className="designer-card rounded-2xl overflow-hidden flex flex-col justify-between break-inside-avoid mb-6 group"
                  >
                    <div>
                      {imgs.length === 1 ? (
                        <div
                          onClick={() => {
                            setMomentLightboxSlides(imgs.map((src) => ({ src })));
                            setMomentLightboxIndex(0);
                            setMomentLightboxOpen(true);
                          }}
                          className="relative w-full overflow-hidden bg-[#F3F1EC] dark:bg-[#181815] border-b designer-hairline cursor-pointer"
                        >
                          <ImageWithFallback
                            src={imgs[0]}
                            alt={moment.location}
                            naturalAspect={true}
                            className="group-hover:scale-[1.02] transition-transform duration-700"
                          />
                          <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1 p-1.5 bg-[#F3F1EC] dark:bg-[#181815] border-b designer-hairline">
                          {imgs.map((imgSrc, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setMomentLightboxSlides(imgs.map((src) => ({ src })));
                                setMomentLightboxIndex(idx);
                                setMomentLightboxOpen(true);
                              }}
                              className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer bg-[#EAE6DC] dark:bg-[#22221E]"
                            >
                              <ImageWithFallback
                                src={imgSrc}
                                alt={`${moment.location} ${idx + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-5">
                        <div className="text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E] mb-2">
                          {td(moment.date, moment.dateEn || moment.date)}
                        </div>
                        <p className="text-xs sm:text-sm designer-text-secondary leading-relaxed">
                          {td(moment.contentZh, moment.contentEn)}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-3 bg-[#FAF9F5] dark:bg-[#141412] border-t designer-hairline flex items-center justify-between text-xs font-mono">
                      <span className="designer-text-muted flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-[#8A6F48] shrink-0" />
                        <span className="truncate">
                          {td(moment.location, moment.locationEn || moment.location)}
                        </span>
                      </span>
                      <button
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
                        <span>{moment.likes + (liked ? 1 : 0)}</span>
                      </button>
                    </div>
                  </div>
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
                    <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                      {[
                        td('01 拾光风车岛', '01 Windmill'),
                        td('02 丁达尔森林', '02 Forest'),
                        td('03 海岸灯塔暗房', '03 Lighthouse'),
                        td('04 云端观星台', '04 Summit'),
                        td('05 漂流瓶码头', '05 Sunset Pier'),
                      ].map((label) => (
                        <span
                          key={label}
                          className="px-3 py-1.5 rounded-full bg-[#F6F4EF] dark:bg-[#1A1917] border designer-hairline designer-text-secondary"
                        >
                          {label}
                        </span>
                      ))}
                    </div>

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
                  {td('悬停任意便签可暂停审阅，选择墨色后发送即刻上墙。', 'Hover any note to pause. Pick an ink color and post yours below.')}
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
                {Array.from({ length: 4 }, (_, laneIdx) => {
                  const laneItems = danmakuList.filter((_, i) => i % 4 === laneIdx);
                  return (
                    <div
                      key={laneIdx}
                      className="absolute w-full"
                      style={{ top: `${laneIdx * 22 + 10}%`, height: '38px' }}
                    >
                      {laneItems.map((msg, idx) => {
                        const animDuration = 22;
                        const delay = -(idx * (animDuration / Math.max(1, laneItems.length)));
                        return (
                          <div
                            key={`${msg.id}-${idx}`}
                            className={`danmaku-note absolute whitespace-nowrap text-xs font-mono px-4 py-2 rounded-full border shadow-xs cursor-pointer select-none ${getDanmakuBadgeStyle(
                              msg.color,
                            )}`}
                            style={{
                              animationDuration: `${animDuration}s`,
                              animationDelay: `${delay}s`,
                            }}
                          >
                            {msg.content}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                <style>{`
                  .danmaku-note {
                    animation-name: danmaku-slide;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    will-change: transform;
                    transform: translateX(105vw);
                  }
                  .danmaku-note:hover {
                    z-index: 40;
                    animation-play-state: paused;
                  }
                  @keyframes danmaku-slide {
                    from { transform: translateX(950px); }
                    to { transform: translateX(-950px); }
                  }
                `}</style>
              </div>

              {/* Input & Tone Selector */}
              <form onSubmit={handleSendDanmaku} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono designer-text-muted">
                    {td('墨色:', 'INK:')}
                  </span>
                  {(
                    [
                      { id: 'bronze', label: td('暖铜金', 'Bronze'), bg: 'bg-[#8A6F48]' },
                      { id: 'ink', label: td('碳墨黑', 'Carbon'), bg: 'bg-[#141413]' },
                      { id: 'moss', label: td('松墨绿', 'Moss'), bg: 'bg-[#1E3329]' },
                      { id: 'terracotta', label: td('赤陶棕', 'Rust'), bg: 'bg-[#9E553F]' },
                    ] as const
                  ).map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => setDanmakuTone(tone.id)}
                      className={`w-5 h-5 rounded-full ${tone.bg} transition-transform ${
                        danmakuTone === tone.id ? 'scale-125 ring-2 ring-[#8A6F48] ring-offset-2' : 'opacity-65'
                      }`}
                      title={tone.label}
                      aria-label={tone.label}
                    />
                  ))}
                </div>

                <input
                  type="text"
                  value={danmakuInput}
                  onChange={(e) => setDanmakuInput(e.target.value)}
                  maxLength={50}
                  placeholder={td('写下一句留言，让它飘过这面灵感便签墙...', 'Write a note to float across the guestbook wall...')}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#F6F4EF] dark:bg-[#1E1E1B] border designer-hairline focus:border-[#8A6F48] outline-none text-base sm:text-sm designer-text-primary"
                />

                <button
                  type="submit"
                  disabled={!danmakuInput.trim() || submittingDanmaku}
                  className="px-6 py-2.5 rounded-xl designer-btn-primary font-mono text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{td('发送上墙', 'POST NOTE')}</span>
                </button>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
