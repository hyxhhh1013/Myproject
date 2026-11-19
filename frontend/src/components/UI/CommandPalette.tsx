import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { scroller } from 'react-scroll';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  User,
  Code,
  FolderGit2,
  Briefcase,
  Camera,
  Mail,
  Sparkles,
  Music,
  Moon,
  Sun,
  Globe,
  Copy,
  FileText,
  Compass,
  Check,
  Award,
  Volume2,
  VolumeX,
  CornerDownLeft,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/i18nContext';
import { useMusic } from '../../context/MusicContext';
import {
  isSfxEnabled,
  toggleSfx,
  subscribeSfx,
  playSoftTick,
  playTactileClick,
  playSuccessChime,
  playPaletteWhoosh,
} from '../../utils/soundEffects';

interface CommandItem {
  id: string;
  group: string;
  title: string;
  subtitle: string;
  keywords: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCommandOpen, setCommandOpen, openAiWithPrompt } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, td } = useI18n();
  const { isPlaying, togglePlay, currentMusic } = useMusic();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [sfxOn, setSfxOn] = useState<boolean>(() => isSfxEnabled());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeSfx((enabled) => setSfxOn(enabled));
  }, []);

  const jumpToSection = (sectionId: string) => {
    playTactileClick();
    setCommandOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        scroller.scrollTo(sectionId, { smooth: true, duration: 500, offset: -70 });
      }, 250);
    } else {
      scroller.scrollTo(sectionId, { smooth: true, duration: 500, offset: -70 });
    }
  };

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'ai-projects',
        group: td('01 // AI 小轩智能导览', '01 // AI GUIDED TOUR'),
        title: td('让 AI 小轩介绍最硬核的落地项目', 'Ask AI about Flagship Projects'),
        subtitle: td('解读「禾书耕文」(46工具/2749文献)、「梦境拓扑」、「界外」、「饭定了」', 'Deep-dive into HeShu, DreamTop, Outbounds & FanDingLe'),
        keywords: 'ai agent rag project 禾书耕文 梦境拓扑 饭定了 界外',
        icon: <Sparkles className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'AI',
        action: () => {
          playTactileClick();
          setCommandOpen(false);
          openAiWithPrompt('🚀 介绍最硬核的 AI 项目');
        },
      },
      {
        id: 'ai-fde',
        group: td('01 // AI 小轩智能导览', '01 // AI GUIDED TOUR'),
        title: td('了解洋葱教育 FDE 驻场工程师实习经历', 'Ask AI about FDE Residency at Onion Edu'),
        subtitle: td('连续驻场 15 周 · 35 个只读工具经营 Agent · 19 条巨量投流 API', '15 weeks on-site · 35-tool Operations Agent · 19 Ocean Engine APIs'),
        keywords: 'fde intern experience 洋葱教育 实习 驻场 经历',
        icon: <Briefcase className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'AI',
        action: () => {
          playTactileClick();
          setCommandOpen(false);
          openAiWithPrompt('💼 洋葱教育 FDE 驻场做了什么？');
        },
      },
      {
        id: 'ai-awards',
        group: td('01 // AI 小轩智能导览', '01 // AI GUIDED TOUR'),
        title: td('询问 5 项竞赛荣誉、个人优势与求职到岗状态', 'Ask AI about Awards, Strengths & Availability'),
        subtitle: td('字节跳动 Trae 二/三等奖 · LEV0 最佳创意奖 · 可立即到岗 (深/杭/长)', 'ByteDance Trae Awards · 200M tokens/day · Immediate availability'),
        keywords: 'award hire available 奖项 荣誉 优势 到岗 求职 城市 深圳 杭州',
        icon: <Award className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'AI',
        action: () => {
          playTactileClick();
          setCommandOpen(false);
          openAiWithPrompt('🏆 拿过哪些奖项与个人优势？');
        },
      },
      {
        id: 'ai-jd-match',
        group: td('01 // AI 小轩智能导览', '01 // AI GUIDED TOUR'),
        title: td('启动 HR 岗位 JD 智能匹配度评估器 (Recruiter Mode)', 'Run Recruiter JD Match Evaluator (96%+ Fit)'),
        subtitle: td('生成 3 维契合度实证卡片 · 一键复制内推评估词 · 人工确认约面草稿', '3D fit score card · One-click recruiter pitch · HITL interview gate'),
        keywords: 'jd hr match recruiter 招聘 岗位 匹配 评估 面试 简历',
        icon: <Sparkles className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'JD',
        action: () => {
          playTactileClick();
          setCommandOpen(false);
          openAiWithPrompt('🎯 评估岗位匹配度：AI Agent / 全栈研发实习生', 'recruiter');
        },
      },
      {
        id: 'ai-workbench',
        group: td('01 // AI 小轩智能导览', '01 // AI GUIDED TOUR'),
        title: td('打开全屏 Agent 工程工作台 (HYX // AGENT WORKBENCH)', 'Open Fullscreen Agent Engineering Workbench'),
        subtitle: td('12 个挂载工具注册表 · 实时 LangGraph 状态机流转图 · JSON 遥测检查器', '12-tool registry · Live state machine graph · JSON telemetry inspector'),
        keywords: 'workbench agent console studio 工作台 控制台 工具 状态机',
        icon: <Code className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'G W',
        action: () => {
          playTactileClick();
          setCommandOpen(false);
          navigate('/demo/ai-assistant');
        },
      },
      {
        id: 'nav-projects',
        group: td('02 // 章节快速导航', '02 // SECTION NAVIGATION'),
        title: td('跳转到：项目案例 (03 // SELECTED WORKS)', 'Go to: Featured Projects'),
        subtitle: td('禾书耕文 · 饭定了 · 梦境拓扑 · 界外 Outbounds', 'Explore full-stack & AI systems'),
        keywords: 'projects 项目 作品 案例',
        icon: <FolderGit2 className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'G P',
        action: () => jumpToSection('projects'),
      },
      {
        id: 'nav-skills',
        group: td('02 // 章节快速导航', '02 // SECTION NAVIGATION'),
        title: td('跳转到：技能图谱与互动彩蛋 (02 // CAPABILITY MATRIX)', 'Go to: Skill Graph & Easter Eggs'),
        subtitle: td('React 19 · Next.js 16 · LangGraph/RAG · 真实木吉他和弦彩蛋', 'Interactive skill nodes, 6-axis radar & acoustic guitar'),
        keywords: 'skills 技能 技术栈 雷达图 吉他 美食',
        icon: <Code className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'G S',
        action: () => jumpToSection('skills'),
      },
      {
        id: 'nav-experience',
        group: td('02 // 章节快速导航', '02 // SECTION NAVIGATION'),
        title: td('跳转到：经历与实践 (04 // CHRONICLE & RESIDENCY)', 'Go to: Experiences & Timeline'),
        subtitle: td('洋葱教育 FDE · AIFA 实验室 · 智慧农业创新中心 · 联通沃创计划', 'Timeline of internships & research'),
        keywords: 'experience 经历 实习 时间轴',
        icon: <Briefcase className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'G E',
        action: () => jumpToSection('experience'),
      },
      {
        id: 'nav-about',
        group: td('02 // 章节快速导航', '02 // SECTION NAVIGATION'),
        title: td('跳转到：关于我 (01 // PROFILE & TELEMETRY)', 'Go to: About Me (Bento Grid)'),
        subtitle: td('个人简介 · 长沙实时时钟 · GitHub 暖铜金开源热力图', 'Bio, live clock, and GitHub stats'),
        keywords: 'about 关于 简介 github',
        icon: <User className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'G A',
        action: () => jumpToSection('about'),
      },
      {
        id: 'nav-photos',
        group: td('02 // 章节快速导航', '02 // SECTION NAVIGATION'),
        title: td('跳转到：摄影作品集 (05 // 35MM ARCHIVE)', 'Go to: Photography Gallery'),
        subtitle: td('风景 · 城市 · 生活 · 人像 · 日常', 'Masonry gallery with EXIF & lightbox'),
        keywords: 'photos photography 摄影 照片 相册',
        icon: <Camera className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'G O',
        action: () => jumpToSection('photos'),
      },
      {
        id: 'nav-interests',
        group: td('02 // 章节快速导航', '02 // SECTION NAVIGATION'),
        title: td('打开：日常与兴趣 (数字花园 & 黑胶唱机 & 弹幕墙)', 'Open: Digital Garden & Cultural Archive'),
        subtitle: td('黑胶唱机 · 光影放映室 · 游艺书架 · 旅行足迹地图 · 访客留言流', 'Vinyl turntable, film notes, travel map & guestbook stream'),
        keywords: 'interests media music movies travel 兴趣 音乐 电影 旅行 弹幕',
        icon: <Compass className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'G I',
        action: () => {
          playTactileClick();
          setCommandOpen(false);
          navigate('/interests');
        },
      },
      {
        id: 'nav-contact',
        group: td('02 // 章节快速导航', '02 // SECTION NAVIGATION'),
        title: td('跳转到：联系我 & 在线留言 (06 // INITIATE DIALOGUE)', 'Go to: Contact & Message Form'),
        subtitle: td('发送合作或实习邀请，直达 hyxhhh1013@gmail.com', 'Send a direct message'),
        keywords: 'contact email 联系 留言 邮件',
        icon: <Mail className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'G C',
        action: () => jumpToSection('contact'),
      },
      {
        id: 'nav-home',
        group: td('02 // 章节快速导航', '02 // SECTION NAVIGATION'),
        title: td('回到首页顶部 (00 // HERO & 3D MONOGRAPH ID)', 'Back to Top (Hero & 3D Monograph Card)'),
        subtitle: td('回到 Hero 首屏区域', 'Scroll to top of home page'),
        keywords: 'home top 首页 顶部',
        icon: <Home className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'G H',
        action: () => jumpToSection('hero'),
      },
      {
        id: 'act-sfx',
        group: td('03 // 系统控制与快捷操作', '03 // SYSTEM CONTROLS'),
        title: sfxOn
          ? td('关闭全局交互音效 (Mute Tactile UI Sounds)', 'Mute Tactile UI Sounds (SFX OFF)')
          : td('开启全局交互音效 (Enable Tactile UI Sounds)', 'Enable Tactile UI Sounds (SFX ON)'),
        subtitle: td('控制按钮微动开关声、旋钮刻度声与和弦反馈', 'Toggle WebAudio mechanical click & chime feedback'),
        keywords: 'sfx sound audio mute 音效 声音 静音',
        icon: sfxOn ? (
          <Volume2 className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />
        ) : (
          <VolumeX className="w-4 h-4 text-[#8E8C84]" />
        ),
        shortcut: 'S',
        action: () => {
          toggleSfx();
          setCommandOpen(false);
        },
      },
      {
        id: 'act-music',
        group: td('03 // 系统控制与快捷操作', '03 // SYSTEM CONTROLS'),
        title: isPlaying
          ? td(`暂停背景黑胶音乐 (${currentMusic?.title || 'Lofi'})`, `Pause Vinyl Music (${currentMusic?.title || 'Lofi'})`)
          : td(`播放背景 Lofi 音乐 (${currentMusic?.title || '如果呢'})`, `Play Lofi Music (${currentMusic?.title || 'Lofi'})`),
        subtitle: td('随时开启或暂停全站 WebAudio Lofi 电钢琴伴奏', 'Toggle background music playback'),
        keywords: 'music play pause audio 音乐 播放 暂停 歌',
        icon: <Music className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'M',
        action: () => {
          playTactileClick();
          togglePlay();
          setCommandOpen(false);
        },
      },
      {
        id: 'act-theme',
        group: td('03 // 系统控制与快捷操作', '03 // SYSTEM CONTROLS'),
        title:
          theme === 'dark'
            ? td('切换到极简沙白日间模式 (Light Mode)', 'Switch to Warm Sand Light Mode')
            : td('切换到曜石暗黑夜间模式 (Dark Mode)', 'Switch to Obsidian Dark Mode'),
        subtitle: td('切换全站日间 / 夜间视觉主题', 'Toggle color scheme'),
        keywords: 'theme dark light 主题 深色 浅色 白天 夜间',
        icon:
          theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#C8A97E]" />
          ) : (
            <Moon className="w-4 h-4 text-[#8A6F48]" />
          ),
        shortcut: 'T',
        action: () => {
          playTactileClick();
          toggleTheme();
          setCommandOpen(false);
        },
      },
      {
        id: 'act-lang',
        group: td('03 // 系统控制与快捷操作', '03 // SYSTEM CONTROLS'),
        title:
          language === 'zh'
            ? 'Switch Language to English (EN)'
            : '切换站点语言为简体中文 (ZH)',
        subtitle: td('中英文双语无缝切换', 'Instant bilingual switch'),
        keywords: 'language english chinese 语言 英文 中文 翻译',
        icon: <Globe className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'L',
        action: () => {
          playTactileClick();
          setLanguage(language === 'zh' ? 'en' : 'zh');
          setCommandOpen(false);
        },
      },
      {
        id: 'act-email',
        group: td('03 // 系统控制与快捷操作', '03 // SYSTEM CONTROLS'),
        title: copiedEmail
          ? td('已复制邮箱：hyxhhh1013@gmail.com', 'Copied: hyxhhh1013@gmail.com!')
          : td('复制联系邮箱：hyxhhh1013@gmail.com', 'Copy Email: hyxhhh1013@gmail.com'),
        subtitle: td('复制到剪贴板', 'Copy email address to clipboard'),
        keywords: 'copy email 邮箱 复制 gmail',
        icon: copiedEmail ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <Copy className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />
        ),
        shortcut: 'C',
        action: () => {
          navigator.clipboard.writeText('hyxhhh1013@gmail.com');
          playSuccessChime();
          setCopiedEmail(true);
          setTimeout(() => {
            setCopiedEmail(false);
            setCommandOpen(false);
          }, 800);
        },
      },
      {
        id: 'act-resume',
        group: td('03 // 系统控制与快捷操作', '03 // SYSTEM CONTROLS'),
        title: td('查看 / 下载 PDF 简历 (CV.pdf)', 'View / Download PDF Resume (CV.pdf)'),
        subtitle: td('在新标签页打开 resume.pdf', 'Open resume.pdf in new tab'),
        keywords: 'resume cv pdf 简历 下载',
        icon: <FileText className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />,
        shortcut: 'R',
        action: () => {
          playTactileClick();
          setCommandOpen(false);
          window.open('/resume.pdf', '_blank', 'noopener,noreferrer');
        },
      },
    ],
    [td, isPlaying, currentMusic, theme, language, sfxOn, copiedEmail, location.pathname],
  );

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.subtitle.toLowerCase().includes(q) ||
        cmd.keywords.toLowerCase().includes(q) ||
        cmd.group.toLowerCase().includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, isCommandOpen]);

  useEffect(() => {
    if (isCommandOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        const nextOpen = !isCommandOpen;
        playPaletteWhoosh(nextOpen);
        setCommandOpen(nextOpen);
        return;
      }

      if (!isCommandOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        playPaletteWhoosh(false);
        setCommandOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        playSoftTick();
        setSelectedIndex((prev) => (filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        playSoftTick();
        setSelectedIndex((prev) =>
          filteredCommands.length > 0 ? (prev - 1 + filteredCommands.length) % filteredCommands.length : 0,
        );
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, filteredCommands, selectedIndex, setCommandOpen]);

  return (
    <AnimatePresence>
      {isCommandOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[11vh] px-4 bg-[#141413]/55 backdrop-blur-sm"
          onClick={() => {
            playPaletteWhoosh(false);
            setCommandOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: -12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="w-full max-w-xl rounded-2xl bg-[#FAF9F5] dark:bg-[#141413] border designer-hairline shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b designer-hairline bg-[#F3F1EC]/70 dark:bg-[#1A1A17]">
              <Search className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={td(
                  '输入指令或搜索（如：项目、FDE、奖项、音效、音乐、简历）...',
                  'Type a command or search (e.g. projects, FDE, awards, SFX, music)...',
                )}
                className="w-full bg-transparent text-sm sm:text-base designer-text-primary placeholder-[#8E8C84] focus:outline-none"
              />
              <button
                type="button"
                data-sfx="custom"
                onClick={() => {
                  playPaletteWhoosh(false);
                  setCommandOpen(false);
                }}
                className="px-2 py-0.5 text-[10px] font-mono designer-pill rounded shrink-0"
              >
                ESC
              </button>
            </div>

            {/* Command List */}
            <div className="max-h-[56vh] overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-4 text-center space-y-3">
                  <div className="text-xs font-mono designer-text-muted">
                    {td('没有匹配的静态指令，可直接交给 AI 小轩 Agent 执行：', 'No static command matched. Delegate directly to AI Agent Co-Pilot:')}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      const qText = query.trim();
                      setCommandOpen(false);
                      openAiWithPrompt(qText);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] text-xs font-mono font-semibold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#C8A97E] dark:text-[#8A6F48]" />
                    <span className="truncate">
                      {td(`让 AI 小轩处理：「${query}」`, `Ask Agent Co-Pilot: "${query}"`)}
                    </span>
                  </button>
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex;
                  const showGroupHeader = idx === 0 || filteredCommands[idx - 1].group !== cmd.group;
                  return (
                    <React.Fragment key={cmd.id}>
                      {showGroupHeader && (
                        <div className="px-3 pt-2.5 pb-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#8A6F48] dark:text-[#C8A97E]">
                          {cmd.group}
                        </div>
                      )}
                      <button
                        type="button"
                        data-sfx="custom"
                        onMouseEnter={() => {
                          if (selectedIndex !== idx) {
                            setSelectedIndex(idx);
                          }
                        }}
                        onClick={cmd.action}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] shadow-sm'
                            : 'designer-text-primary hover:bg-[#F3F1EC] dark:hover:bg-[#1E1E1B]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-lg shrink-0 border ${
                              isSelected
                                ? 'bg-white/10 dark:bg-black/10 border-white/15 dark:border-black/15'
                                : 'bg-[#F3F1EC] dark:bg-[#1E1E1B] designer-hairline'
                            }`}
                          >
                            {cmd.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold truncate">{cmd.title}</div>
                            <div
                              className={`text-[11px] truncate ${
                                isSelected
                                  ? 'text-[#FAF9F5]/75 dark:text-[#141413]/75'
                                  : 'designer-text-muted'
                              }`}
                            >
                              {cmd.subtitle}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {cmd.shortcut && (
                            <span
                              className={`hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded border ${
                                isSelected
                                  ? 'bg-white/15 dark:bg-black/15 border-white/20 dark:border-black/20 text-current'
                                  : 'bg-[#F3F1EC] dark:bg-[#1E1E1B] designer-hairline designer-text-muted'
                              }`}
                            >
                              {cmd.shortcut}
                            </span>
                          )}
                          {isSelected && <CornerDownLeft className="w-3.5 h-3.5 opacity-80" />}
                        </div>
                      </button>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-[#F3F1EC] dark:bg-[#181816] border-t designer-hairline flex items-center justify-between text-[11px] font-mono designer-text-muted">
              <div className="flex items-center gap-3">
                <span>↑↓ {td('选择', 'Navigate')}</span>
                <span>↵ {td('执行', 'Execute')}</span>
                <span>ESC {td('关闭', 'Close')}</span>
              </div>
              <span className="text-[#8A6F48] dark:text-[#C8A97E]">HYX.DEV // COMMAND INDEX</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
