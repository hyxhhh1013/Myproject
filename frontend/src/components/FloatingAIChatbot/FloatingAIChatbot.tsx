import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { scroller } from 'react-scroll';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageCircle,
  Sparkles,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronUp,
  Disc,
  Send,
  Maximize2,
  Minimize2,
  Terminal,
  RotateCcw,
  Wrench,
  ArrowUpRight,
  Zap,
  Target,
  Cpu,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useTheme } from '../../context/ThemeContext';
import { getImageUrl } from '../../utils/imageUtils';
import { useAppStore, AgentPersonaMode } from '../../store/useAppStore';
import { useI18n } from '../../i18n/i18nContext';
import { playTactileClick } from '../../utils/soundEffects';
import { AGENT_TOOLS_REGISTRY, runAgentTurn } from '../../utils/agentEngine';
import { AgentCardRenderer, AgentMarkdown, AgentTraceAccordion } from './AgentCards';
import { AgentMessage, AgentSseEvent, AgentUiAction } from '../../types/agent';

const DEFAULT_SUGGESTIONS_ZH: Record<AgentPersonaMode, string[]> = {
  guide: [
    '🚀 介绍「禾书耕文」并带我去看架构',
    '💼 洋葱教育 FDE 驻场 35 个只读工具',
    '🎯 评估 AI Agent 实习岗位匹配度',
    '🎵 播放背景音乐',
    '📬 帮我拟一份面试邀请留言草稿',
  ],
  recruiter: [
    '🎯 评估岗位匹配度：AI Agent / 全栈实习生',
    '📅 到岗时间、实习时长与意向城市？',
    '🏆 拿过哪些竞赛奖项与日均 2 亿 Token 优势？',
    '📬 我是面试官，帮我拟一份远程面试邀请',
  ],
  architect: [
    '🛠 拆解「禾书耕文」46工具与11路SSE循环',
    '🔍 17.6万块混合 RAG 如何防止越界幻觉引用？',
    '🛡 洋葱教育 35 个只读工具与写库硬闸设计',
    '⚡ 筛选页面上所有使用了 LangGraph 的项目',
  ],
};

const DEFAULT_SUGGESTIONS_EN: Record<AgentPersonaMode, string[]> = {
  guide: [
    '🚀 Deep-dive HeShu & scroll to Architecture',
    '💼 Onion Edu FDE 35 Read-Only Agent Tools',
    '🎯 Evaluate Recruiter JD Fit',
    '🎵 Play background Lofi music',
    '📬 Draft an interview invitation (HITL Gate)',
  ],
  recruiter: [
    '🎯 Evaluate JD Fit: AI Agent / Full-Stack Intern',
    '📅 Immediate availability & preferred cities?',
    '🏆 5 Competition Awards & 200M tokens/day velocity',
    '📬 Draft a remote interview invitation for Yixuan',
  ],
  architect: [
    '🛠 Breakdown HeShu 46-tool LangGraph & 11-ch SSE',
    '🔍 How does 176k-chunk Hybrid RAG prevent hallucination?',
    '🛡 Onion Edu 35 read-only tools & HITL write gates',
    '⚡ Filter projects built with LangGraph on page',
  ],
};

export const FloatingAIChatbot: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, td } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const {
    aiChatOpen,
    setAiChatOpen,
    aiInitialPrompt,
    clearAiInitialPrompt,
    agentPersona,
    setAgentPersona,
    setSkinTheme,
    setActiveSkillFilter,
    focusProjectCard,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'ai' | 'music'>('ai');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToolsDrawer, setShowToolsDrawer] = useState(false);

  const createInitialMessage = useCallback(
    (lang: 'zh' | 'en'): AgentMessage => ({
      id: 'init-1',
      sender: 'ai',
      content:
        lang === 'en'
          ? `Hi! I'm **XiaoXuan**, your **Page-Aware Agent Co-Pilot** ✨\n\nMounted with **12 live tools** (Dossiers, UI Co-Pilot & HITL Write Gates). Ask me to break down **HeShu (46 tools)**, review **Onion Edu FDE**, evaluate a **JD**, or control music & page views.`
          : `你好！我是**小轩** ✨ 黄奕轩个人门户的 **Page-Aware 智能体副驾驶**。\n\n已挂载 **12 个实时工具**（档案检索 · 页面协同 · 写库硬闸）。你可以让我拆解 **禾书耕文（46工具/11路SSE）**、了解 **洋葱教育 FDE 驻场**、**评估岗位 JD 匹配度**，或直接操控页面滚动与放音乐。`,
      timestamp: new Date(),
    }),
    [],
  );

  const [messages, setMessages] = useState<AgentMessage[]>(() => [createInitialMessage(language)]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[] | null>(null);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === 'init-1' ? createInitialMessage(language) : m)),
    );
  }, [language, createInitialMessage]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    currentMusic,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
  } = useMusic();

  const progressRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    if (Number.isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (progressRef.current && duration > 0) {
        const rect = progressRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        seekTo(percentage * duration);
      }
    },
    [duration, seekTo],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (aiChatOpen && activeTab === 'ai') {
      setTimeout(() => inputRef.current?.focus(), 180);
    }
  }, [aiChatOpen, activeTab]);

  // Execute Client-Side Page Co-Pilot UI Actions
  const executeUiAction = useCallback(
    (action: AgentUiAction) => {
      if (action.type === 'navigate_section') {
        const { section, projectCode, projectTab } = action;
        if (section === 'interests') {
          navigate('/interests');
          return;
        }

        if (projectCode) {
          focusProjectCard(projectCode, projectTab || 'architecture');
        }

        const targetDomId = projectCode ? `project-card-${projectCode}` : section;

        const doScroll = () => {
          const el = document.getElementById(targetDomId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            scroller.scrollTo(section, { smooth: true, duration: 550, offset: -70 });
          }
        };

        if (location.pathname !== '/') {
          navigate('/');
          setTimeout(doScroll, 280);
        } else {
          doScroll();
        }
      } else if (action.type === 'filter_skill') {
        setActiveSkillFilter(action.skill);
      } else if (action.type === 'music_control') {
        if (action.command === 'play' && !isPlaying) togglePlay();
        else if (action.command === 'pause' && isPlaying) togglePlay();
        else if (action.command === 'next') playNext();
        else if (action.command === 'prev') playPrev();
      } else if (action.type === 'switch_skin') {
        if (action.skin) {
          setSkinTheme(action.skin);
        }
        if (action.darkMode !== undefined) {
          if ((action.darkMode && theme !== 'dark') || (!action.darkMode && theme === 'dark')) {
            toggleTheme();
          }
        }
      }
    },
    [
      navigate,
      location.pathname,
      focusProjectCard,
      setActiveSkillFilter,
      isPlaying,
      togglePlay,
      playNext,
      playPrev,
      setSkinTheme,
      theme,
      toggleTheme,
    ],
  );

  const sendQuestion = useCallback(
    async (questionText: string, overridePersona?: AgentPersonaMode) => {
      const userText = questionText.trim();
      if (!userText || isLoading) return;

      const activePersona = overridePersona || agentPersona;
      setInputValue('');
      setShowToolsDrawer(false);

      const userMsgId = `user-${Date.now()}`;
      const aiMsgId = `ai-${Date.now() + 1}`;

      const userMsg: AgentMessage = {
        id: userMsgId,
        sender: 'user',
        content: userText,
        timestamp: new Date(),
        persona: activePersona,
      };

      const placeholderAiMsg: AgentMessage = {
        id: aiMsgId,
        sender: 'ai',
        content: '',
        timestamp: new Date(),
        persona: activePersona,
        isStreaming: true,
        thoughtTitleZh: '正在初始化 Agent 状态机...',
        thoughtTitleEn: 'Initializing Agent state machine...',
        toolCalls: [],
        cards: [],
      };

      setMessages((prev) => [...prev.slice(-10), userMsg, placeholderAiMsg]);
      setIsLoading(true);

      const historyPayload = messages
        .filter((m) => m.id !== 'init-1' && m.content.trim())
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.content,
        }));

      try {
        await runAgentTurn({
          userMessage: userText,
          persona: activePersona,
          lang: language,
          history: historyPayload,
          onEvent: (event: AgentSseEvent) => {
            if (event.type === 'step_start') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        thoughtTitleZh: event.titleZh,
                        thoughtTitleEn: event.titleEn,
                      }
                    : m,
                ),
              );
            } else if (event.type === 'tool_call') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        toolCalls: [...(m.toolCalls || []), event.tool],
                      }
                    : m,
                ),
              );
            } else if (event.type === 'ui_action') {
              executeUiAction(event.action);
            } else if (event.type === 'generative_card') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        cards: [...(m.cards || []), event.card],
                      }
                    : m,
                ),
              );
            } else if (event.type === 'delta') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        content: m.content + event.content,
                      }
                    : m,
                ),
              );
            } else if (event.type === 'suggestions') {
              setDynamicSuggestions(language === 'en' ? event.itemsEn : event.itemsZh);
            } else if (event.type === 'done') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        isStreaming: false,
                        totalDurationMs: event.totalDurationMs,
                      }
                    : m,
                ),
              );
            }
          },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, agentPersona, messages, language, executeUiAction],
  );

  // Trigger initial prompt when opened from Hero, CommandPalette, or Project cards
  useEffect(() => {
    if (aiChatOpen && aiInitialPrompt) {
      setActiveTab('ai');
      const promptToRun = aiInitialPrompt;
      clearAiInitialPrompt();
      sendQuestion(promptToRun);
    }
  }, [aiChatOpen, aiInitialPrompt, clearAiInitialPrompt, sendQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(inputValue);
  };

  const handleResetChat = () => {
    playTactileClick();
    setMessages([createInitialMessage(language)]);
    setDynamicSuggestions(null);
  };

  const currentPrompts =
    dynamicSuggestions ||
    (language === 'en' ? DEFAULT_SUGGESTIONS_EN[agentPersona] : DEFAULT_SUGGESTIONS_ZH[agentPersona]);

  if (location.pathname === '/demo/ai-assistant') {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {aiChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.2 }}
            className="bg-[#FAF9F5] dark:bg-[#141413] rounded-2xl shadow-[0_20px_60px_rgba(20,20,19,0.16)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)] border border-[#E4DFD4] dark:border-[#2A2925] overflow-hidden mb-3 flex flex-col transition-all duration-200"
            style={{
              maxHeight: isExpanded ? '84vh' : '76vh',
              width: isExpanded ? '94vw' : '92vw',
              maxWidth: isExpanded ? '560px' : '432px',
            }}
          >
            {/* 1. Top Header Bar — Crisp Single-Line Layout */}
            <div className="bg-[#F3F1EC]/95 dark:bg-[#1A1A17]/95 backdrop-blur-md border-b border-[#E6E2D8] dark:border-[#282723] px-3.5 py-2.5 shrink-0">
              <div className="flex items-center justify-between gap-2">
                {/* AI / Music Segmented Switcher */}
                <div className="inline-flex items-center bg-[#E8E4DA] dark:bg-[#11110F] rounded-xl p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold whitespace-nowrap shrink-0 transition-all ${
                      activeTab === 'ai'
                        ? 'bg-[#FFFFFF] dark:bg-[#242420] text-[#141413] dark:text-[#F4F3EF] shadow-xs'
                        : 'text-[#6E6A63] dark:text-[#96928A] hover:text-[#141413] dark:hover:text-[#F4F3EF]'
                    }`}
                  >
                    <Sparkles size={12} className="text-[#8A6F48] dark:text-[#C8A97E] shrink-0" />
                    <span>{td('小轩 Agent', 'Co-Pilot')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('music')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold whitespace-nowrap shrink-0 transition-all ${
                      activeTab === 'music'
                        ? 'bg-[#FFFFFF] dark:bg-[#242420] text-[#141413] dark:text-[#F4F3EF] shadow-xs'
                        : 'text-[#6E6A63] dark:text-[#96928A] hover:text-[#141413] dark:hover:text-[#F4F3EF]'
                    }`}
                  >
                    <Music size={12} className="text-[#8A6F48] dark:text-[#C8A97E] shrink-0" />
                    <span>{td('随身听', 'Vinyl')}</span>
                  </button>
                </div>

                {/* Right Controls: Tools Badge, Workbench, Reset, Expand, Close */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {activeTab === 'ai' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setShowToolsDrawer(!showToolsDrawer);
                        }}
                        title={td('查看已挂载的 12 个 Agent 工具', 'Inspect 12 Mounted Agent Tools')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono border inline-flex items-center gap-1 whitespace-nowrap shrink-0 mr-0.5 transition-all ${
                          showToolsDrawer
                            ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] border-transparent font-semibold'
                            : 'bg-[#FAF9F5] dark:bg-[#141413] border-[#DFDAD0] dark:border-[#2C2B27] text-[#8A6F48] dark:text-[#C8A97E] hover:border-[#8A6F48]'
                        }`}
                      >
                        <Wrench className="w-2.5 h-2.5 shrink-0" />
                        <span>12 Tools</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setAiChatOpen(false);
                          navigate('/demo/ai-assistant');
                        }}
                        title={td('打开全屏 Agent 工程工作台', 'Open Fullscreen Agent Workbench')}
                        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-[#6E6A63] dark:text-[#9E9A92] hover:text-[#141413] dark:hover:text-white shrink-0"
                      >
                        <Terminal size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={handleResetChat}
                        title={td('重置会话', 'Reset session')}
                        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-[#6E6A63] dark:text-[#9E9A92] hover:text-[#141413] dark:hover:text-white shrink-0"
                      >
                        <RotateCcw size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={td(isExpanded ? '紧凑视图' : '展开工作台', isExpanded ? 'Compact' : 'Expand')}
                        className="hidden sm:flex p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-[#6E6A63] dark:text-[#9E9A92] hover:text-[#141413] dark:hover:text-white shrink-0"
                      >
                        {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setAiChatOpen(false)}
                    aria-label="Close popup"
                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-[#6E6A63] dark:text-[#9E9A92] hover:text-[#141413] dark:hover:text-white shrink-0"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* 2. Persona Mode Selector Bar (Guide / Recruiter / Architect) */}
              {activeTab === 'ai' && (
                <div className="mt-2.5 pt-2 border-t border-[#E6E2D8]/80 dark:border-[#282723]">
                  <div className="grid grid-cols-3 gap-1.5 w-full">
                    {[
                      {
                        id: 'guide' as AgentPersonaMode,
                        icon: <Zap className="w-3 h-3 shrink-0" />,
                        labelZh: '极速导览',
                        labelEn: 'Co-Pilot',
                      },
                      {
                        id: 'recruiter' as AgentPersonaMode,
                        icon: <Target className="w-3 h-3 shrink-0" />,
                        labelZh: 'HR / JD评估',
                        labelEn: 'Recruiter JD',
                      },
                      {
                        id: 'architect' as AgentPersonaMode,
                        icon: <Cpu className="w-3 h-3 shrink-0" />,
                        labelZh: '架构深潜',
                        labelEn: 'Architect',
                      },
                    ].map((mode) => {
                      const active = agentPersona === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            setAgentPersona(mode.id);
                            setDynamicSuggestions(null);
                            if (mode.id === 'recruiter' && messages.length <= 1) {
                              sendQuestion(
                                language === 'en'
                                  ? '🎯 Evaluate JD Fit: AI Agent / Full-Stack Intern'
                                  : '🎯 评估岗位匹配度：AI Agent / 全栈实习生',
                                'recruiter',
                              );
                            }
                          }}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-mono flex items-center justify-center gap-1.5 whitespace-nowrap transition-all border ${
                            active
                              ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] border-transparent font-semibold shadow-xs'
                              : 'bg-[#FAF9F5]/80 dark:bg-[#141413]/70 border-[#E2DDD2] dark:border-[#2A2925] text-[#66625B] dark:text-[#A39E95] hover:border-[#8A6F48]/60 hover:text-[#141413] dark:hover:text-[#F4F3EF]'
                          }`}
                        >
                          {mode.icon}
                          <span className="truncate">{td(mode.labelZh, mode.labelEn)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Optional 12-Tool Registry Drawer */}
            <AnimatePresence>
              {activeTab === 'ai' && showToolsDrawer && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-[#F6F4EF] dark:bg-[#181815] border-b designer-hairline overflow-y-auto max-h-56 p-3 space-y-2 shrink-0"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
                      {td(
                        'AGENT TOOL REGISTRY // 点击任意工具立即测试调用',
                        'AGENT TOOL REGISTRY // Click any tool to invoke',
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAiChatOpen(false);
                        navigate('/demo/ai-assistant');
                      }}
                      className="underline designer-text-secondary hover:designer-text-primary flex items-center gap-0.5"
                    >
                      <span>{td('全屏控制台', 'Full Workbench')}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {AGENT_TOOLS_REGISTRY.map((tool) => (
                      <button
                        key={tool.name}
                        type="button"
                        onClick={() =>
                          sendQuestion(language === 'en' ? tool.samplePromptEn : tool.samplePromptZh)
                        }
                        className="p-2 rounded-lg bg-[#FAF9F5] dark:bg-[#121210] hover:border-[#8A6F48] border designer-hairline text-left transition-colors flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono">
                            <span className="px-1.5 py-0.2 rounded bg-[#EAE6DC] dark:bg-[#242420] text-[#8A6F48] dark:text-[#C8A97E] text-[9px]">
                              {tool.category.toUpperCase()}
                            </span>
                            <span className="font-semibold designer-text-primary truncate">
                              {tool.name}()
                            </span>
                          </div>
                          <div className="text-[11px] designer-text-secondary truncate mt-0.5">
                            {td(tool.descriptionZh, tool.descriptionEn)}
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#8A6F48] shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4. Main Content Area */}
            {activeTab === 'ai' ? (
              <>
                <div
                  className="overflow-y-auto p-3.5 space-y-3 flex-1"
                  style={{ maxHeight: isExpanded ? '54vh' : '44vh' }}
                >
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {msg.sender === 'user' ? (
                        <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-br-xs bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="w-full max-w-[96%]">
                          {/* Glass-Box Tool Call Trace Accordion */}
                          <AgentTraceAccordion
                            toolCalls={msg.toolCalls || []}
                            totalDurationMs={msg.totalDurationMs}
                            isStreaming={msg.isStreaming}
                            thoughtTitleZh={msg.thoughtTitleZh}
                            thoughtTitleEn={msg.thoughtTitleEn}
                          />

                          {/* AI Markdown Content Bubble */}
                          {(msg.content || msg.isStreaming) && (
                            <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-xs bg-[#F3F1EC] dark:bg-[#1E1E1B] border designer-hairline">
                              {msg.content ? (
                                <AgentMarkdown content={msg.content} />
                              ) : (
                                <div className="flex items-center gap-2 text-xs font-mono designer-text-muted py-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A6F48] animate-ping" />
                                  <span>
                                    {td(
                                      msg.thoughtTitleZh || '小轩正在执行工具链...',
                                      msg.thoughtTitleEn || 'Running agent loop...',
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Embedded Generative UI Cards */}
                          {msg.cards &&
                            msg.cards.map((card, cIdx) => (
                              <AgentCardRenderer
                                key={`${msg.id}-card-${cIdx}`}
                                card={card}
                                onTriggerUiAction={(section, projectCode, projectTab) =>
                                  executeUiAction({
                                    type: 'navigate_section',
                                    section: section as any,
                                    projectCode,
                                    projectTab,
                                  })
                                }
                                onQuickPrompt={(prompt) => sendQuestion(prompt)}
                              />
                            ))}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>

                {/* Contextual Quick Prompt Chips with Smooth Edge Fade */}
                <div className="relative bg-[#F6F4EF] dark:bg-[#161614] border-t border-[#E6E2D8] dark:border-[#262522] shrink-0">
                  <div className="px-3.5 py-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-8">
                    {currentPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendQuestion(prompt)}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#22221F] hover:border-[#8A6F48] hover:text-[#141413] dark:hover:text-white text-[11px] font-mono text-[#5C5851] dark:text-[#A8A39A] border border-[#E2DDD2] dark:border-[#2C2B27] whitespace-nowrap shrink-0 transition-colors disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#F6F4EF] dark:from-[#161614] to-transparent" />
                </div>

                {/* Input Area — Clean Placeholder & Refined Focus Ring */}
                <div className="border-t border-[#E6E2D8] dark:border-[#262522] p-3 bg-[#FAF9F5] dark:bg-[#141413] shrink-0">
                  <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={
                        agentPersona === 'recruiter'
                          ? td(
                              '粘贴 JD 测匹配度，或输入“拟面试邀请”...',
                              'Paste JD to evaluate fit, or draft invite...',
                            )
                          : td(
                              '问项目架构、测 JD 匹配，或下达指令...',
                              'Ask about projects, JD fit, or page actions...',
                            )
                      }
                      disabled={isLoading}
                      className="flex-1 px-3.5 py-2.5 bg-[#F3F1EC] dark:bg-[#1E1E1B] border border-[#DFDAD0] dark:border-[#2C2B27] rounded-xl focus:outline-none focus:border-[#8A6F48] focus:ring-2 focus:ring-[#8A6F48]/15 text-[#141413] dark:text-[#F0EFEA] placeholder-[#8E8C84] text-xs sm:text-[13px] transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                      aria-label="Send message"
                      className="px-3.5 py-2 designer-btn-primary rounded-xl font-medium text-xs sm:text-sm disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Music Tab */
              <div className="p-4 bg-[#FAF9F5] dark:bg-[#141413]">
                {currentMusic ? (
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border designer-hairline bg-[#141413] flex items-center justify-center">
                        {currentMusic.coverUrl ? (
                          <img
                            src={getImageUrl(currentMusic.coverUrl)}
                            alt={currentMusic.title}
                            className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`}
                            style={{ animationDuration: '12s' }}
                          />
                        ) : (
                          <Disc className="w-6 h-6 text-[#C8A97E]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold designer-text-primary truncate text-sm">
                          {currentMusic.title}
                        </p>
                        <p className="text-xs font-mono designer-text-muted truncate">
                          {currentMusic.artist || 'Chill Lofi'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div
                        ref={progressRef}
                        className="w-full h-1.5 bg-[#E6E2D8] dark:bg-[#2A2925] rounded-full cursor-pointer overflow-hidden"
                        onMouseDown={handleProgressClick}
                        onTouchStart={handleProgressClick}
                      >
                        <div
                          className="h-full bg-[#8A6F48] dark:bg-[#C8A97E] rounded-full transition-all"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-mono designer-text-muted mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-5">
                      <button
                        type="button"
                        onClick={playPrev}
                        aria-label="Previous track"
                        className="p-2 designer-btn-secondary rounded-full transition-colors"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={togglePlay}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                        className="p-3 designer-btn-primary rounded-full shadow-sm transition-transform active:scale-95"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={playNext}
                        aria-label="Next track"
                        className="p-2 designer-btn-secondary rounded-full transition-colors"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAiChatOpen(false);
                        navigate('/interests#music-section');
                      }}
                      className="w-full py-2 text-xs font-mono text-[#8A6F48] dark:text-[#C8A97E] hover:bg-[#F3F1EC] dark:hover:bg-[#1E1E1B] border designer-hairline rounded-xl flex items-center justify-center gap-1 transition-colors"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>{td('前往黑胶音乐与精神角落', 'Open Full Vinyl Player & Media Hub')}</span>
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        type="button"
        onClick={() => setAiChatOpen(!aiChatOpen)}
        aria-label={td('打开 AI 助手与音乐播放器', 'Open AI Assistant & Music Player')}
        className="w-13 h-13 sm:w-14 sm:h-14 p-3.5 bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] rounded-full shadow-lg border designer-hairline hover:opacity-90 transition-opacity flex items-center justify-center relative"
        whileTap={{ scale: 0.94 }}
      >
        {aiChatOpen ? (
          <X size={20} />
        ) : (
          <div className="relative">
            {isPlaying ? (
              <Music size={20} className="text-[#C8A97E] animate-bounce" />
            ) : (
              <MessageCircle size={20} />
            )}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#8A6F48] rounded-full" />
          </div>
        )}
      </motion.button>
    </div>
  );
};
