import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Terminal,
  RotateCcw,
  Send,
  ArrowLeft,
  Cpu,
  Wrench,
  ShieldCheck,
  Activity,
  Zap,
  Target,
  ArrowUpRight,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '../../i18n/i18nContext';
import { useTheme } from '../../context/ThemeContext';
import { useMusic } from '../../context/MusicContext';
import { useAppStore, AgentPersonaMode } from '../../store/useAppStore';
import { playTactileClick } from '../../utils/soundEffects';
import { AGENT_TOOLS_REGISTRY, runAgentTurn } from '../../utils/agentEngine';
import {
  AgentCardRenderer,
  AgentMarkdown,
  AgentTraceAccordion,
} from '../../components/FloatingAIChatbot/AgentCards';
import {
  AgentMessage,
  AgentSseEvent,
  AgentStateNode,
  AgentToolCallRecord,
  AgentToolCategory,
  AgentUiAction,
} from '../../types/agent';

const STATE_MACHINE_NODES: Array<{
  id: AgentStateNode;
  code: string;
  labelZh: string;
  labelEn: string;
  descZh: string;
  descEn: string;
}> = [
  {
    id: 'IDLE',
    code: '00',
    labelZh: 'IDLE // 待命监听',
    labelEn: 'IDLE // Standby',
    descZh: '等待自然语言指令或 JD 输入',
    descEn: 'Awaiting user prompt or JD input',
  },
  {
    id: 'GUARDRAIL',
    code: '01',
    labelZh: 'GUARDRAIL // 隐私红线',
    labelEn: 'GUARDRAIL // PII Check',
    descZh: '校验敏感隐私红线与合规边界',
    descEn: 'Enforcing PII & privacy redlines',
  },
  {
    id: 'PLAN',
    code: '02',
    labelZh: 'PLAN // 意图与路由规划',
    labelEn: 'PLAN // Intent Router',
    descZh: '规划只读检索、页面动作或审批流',
    descEn: 'Routing across 12 registered tools',
  },
  {
    id: 'TOOL_EXEC',
    code: '03',
    labelZh: 'TOOL_EXEC // 工具链执行',
    labelEn: 'TOOL_EXEC // Tool Execution',
    descZh: '执行只读档案查询与页面协同动作',
    descEn: 'Running read-only & UI co-pilot tools',
  },
  {
    id: 'HITL_GATE',
    code: '04',
    labelZh: 'HITL_GATE // 人工审批硬闸',
    labelEn: 'HITL_GATE // Human Gate',
    descZh: '写库操作拦截，生成人工确认草稿卡',
    descEn: 'Hold DB writes until human approval',
  },
  {
    id: 'SYNTHESIS',
    code: '05',
    labelZh: 'SYNTHESIS // 流式合成推送',
    labelEn: 'SYNTHESIS // SSE Streaming',
    descZh: '多路 SSE 推送生成式卡片与回答',
    descEn: 'Streaming generative cards & markdown',
  },
];

export default function AiAssistantDemo() {
  const navigate = useNavigate();
  const { language, td } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { isPlaying, togglePlay, playNext, playPrev } = useMusic();
  const {
    agentPersona,
    setAgentPersona,
    setSkinTheme,
    setActiveSkillFilter,
    focusProjectCard,
  } = useAppStore();

  const [toolCategoryFilter, setToolCategoryFilter] = useState<'all' | AgentToolCategory>('all');
  const [activeStateNode, setActiveStateNode] = useState<AgentStateNode>('IDLE');
  const [visitedNodes, setVisitedNodes] = useState<AgentStateNode[]>(['IDLE']);
  const [latestToolCall, setLatestToolCall] = useState<AgentToolCallRecord | null>(null);
  const [sseLogs, setSseLogs] = useState<string[]>([
    '[SYSTEM] HYX Agent Engineering Workbench initialized (12 tools mounted)',
    '[POLICY] Human-in-the-Loop write gate: ENABLED (zero silent DB writes)',
  ]);

  const createInitialMsg = useCallback(
    (lang: 'zh' | 'en'): AgentMessage => ({
      id: 'wb-init-1',
      sender: 'ai',
      content:
        lang === 'en'
          ? `Welcome to **HYX // AGENT ENGINEERING WORKBENCH**.\n\nThis console exposes the internal state machine (\`GUARDRAIL → PLAN → TOOL_EXEC → HITL_GATE → SYNTHESIS\`) and **12 live tools** powering Huang Yixuan's portfolio.\n\n- Click any tool in the **left Tool Registry** to fire a live test invocation.\n- Inspect real-time state transitions and JSON tool payloads in the **right Telemetry Inspector**.\n- Switch to **Recruiter JD Mode** to test job description fit scoring or trigger the **Human-in-the-Loop Contact Gate**.`
          : `欢迎来到 **HYX // 智能体工程控制台 (Agent Engineering Workbench)**。\n\n本工作台完整复刻并可视化了黄奕轩在 **「禾书耕文（46工具/11路SSE）」** 与 **「洋葱教育 FDE 经营 Agent（35只读工具 + 人工审批硬闸）」** 中的核心工程范式：\n\n- 👈 **左侧工具注册表**：点击任意工具卡片即可直接发起实测调用；\n- 👉 **右侧状态机与遥测面板**：实时观测 \`GUARDRAIL → PLAN → TOOL_EXEC → HITL_GATE → SYNTHESIS\` 节点流转与原始 JSON 载荷；\n- 🎯 **顶部视角切换**：支持在「极速导览」「HR 岗位 JD 评估」与「架构深潜」模式间无缝切换。`,
      timestamp: new Date(),
    }),
    [],
  );

  const [messages, setMessages] = useState<AgentMessage[]>(() => [createInitialMsg(language)]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === 'wb-init-1' ? createInitialMsg(language) : m)),
    );
  }, [language, createInitialMsg]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const appendLog = useCallback((line: string) => {
    const ts = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSseLogs((prev) => [...prev.slice(-18), `[${ts}] ${line}`]);
  }, []);

  const executeUiAction = useCallback(
    (action: AgentUiAction) => {
      if (action.type === 'navigate_section') {
        const { section, projectCode, projectTab } = action;
        if (projectCode) {
          focusProjectCard(projectCode, projectTab || 'architecture');
        }
        navigate(`/#${section}`);
      } else if (action.type === 'filter_skill') {
        setActiveSkillFilter(action.skill);
      } else if (action.type === 'music_control') {
        if (action.command === 'play' && !isPlaying) togglePlay();
        else if (action.command === 'pause' && isPlaying) togglePlay();
        else if (action.command === 'next') playNext();
        else if (action.command === 'prev') playPrev();
      } else if (action.type === 'switch_skin') {
        if (action.skin) setSkinTheme(action.skin);
        if (action.darkMode !== undefined) {
          if ((action.darkMode && theme !== 'dark') || (!action.darkMode && theme === 'dark')) {
            toggleTheme();
          }
        }
      }
    },
    [
      focusProjectCard,
      navigate,
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

  const handleRunPrompt = useCallback(
    async (promptText: string, overridePersona?: AgentPersonaMode) => {
      const text = promptText.trim();
      if (!text || isLoading) return;

      const activePersona = overridePersona || agentPersona;
      setInputValue('');
      setVisitedNodes(['IDLE']);

      const userMsgId = `wb-user-${Date.now()}`;
      const aiMsgId = `wb-ai-${Date.now() + 1}`;

      const userMsg: AgentMessage = {
        id: userMsgId,
        sender: 'user',
        content: text,
        timestamp: new Date(),
        persona: activePersona,
      };

      const placeholderAi: AgentMessage = {
        id: aiMsgId,
        sender: 'ai',
        content: '',
        timestamp: new Date(),
        persona: activePersona,
        isStreaming: true,
        thoughtTitleZh: '启动状态机循环...',
        thoughtTitleEn: 'Starting recoverable agent loop...',
        toolCalls: [],
        cards: [],
      };

      setMessages((prev) => [...prev, userMsg, placeholderAi]);
      setIsLoading(true);
      appendLog(`USER_PROMPT (${activePersona.toUpperCase()}): "${text.slice(0, 48)}"`);

      const historyPayload = messages
        .filter((m) => m.id !== 'wb-init-1' && m.content.trim())
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.content,
        }));

      try {
        await runAgentTurn({
          userMessage: text,
          persona: activePersona,
          lang: language,
          history: historyPayload,
          onEvent: (event: AgentSseEvent) => {
            if (event.type === 'step_start') {
              setActiveStateNode(event.node);
              setVisitedNodes((prev) =>
                prev.includes(event.node) ? prev : [...prev, event.node],
              );
              appendLog(`STATE_TRANSITION -> ${event.node} (${event.titleEn})`);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, thoughtTitleZh: event.titleZh, thoughtTitleEn: event.titleEn }
                    : m,
                ),
              );
            } else if (event.type === 'tool_call') {
              setLatestToolCall(event.tool);
              appendLog(
                `TOOL_CALL [${event.tool.category.toUpperCase()}] ${event.tool.toolName}() (${event.tool.durationMs}ms)`,
              );
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, toolCalls: [...(m.toolCalls || []), event.tool] }
                    : m,
                ),
              );
            } else if (event.type === 'ui_action') {
              appendLog(`CLIENT_UI_ACTION -> ${event.action.type}`);
              executeUiAction(event.action);
            } else if (event.type === 'generative_card') {
              appendLog(`GENERATIVE_UI_CARD -> ${event.card.type}`);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, cards: [...(m.cards || []), event.card] }
                    : m,
                ),
              );
            } else if (event.type === 'delta') {
              setActiveStateNode('SYNTHESIS');
              setVisitedNodes((prev) =>
                prev.includes('SYNTHESIS') ? prev : [...prev, 'SYNTHESIS'],
              );
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, content: m.content + event.content } : m,
                ),
              );
            } else if (event.type === 'suggestions') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        suggestions: language === 'en' ? event.itemsEn : event.itemsZh,
                      }
                    : m,
                ),
              );
            } else if (event.type === 'done') {
              appendLog(`TURN_COMPLETE in ${event.totalDurationMs}ms`);
              setTimeout(() => setActiveStateNode('IDLE'), 600);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, isStreaming: false, totalDurationMs: event.totalDurationMs }
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
    [isLoading, agentPersona, messages, language, appendLog, executeUiAction],
  );

  const filteredTools = AGENT_TOOLS_REGISTRY.filter((t) =>
    toolCategoryFilter === 'all' ? true : t.category === toolCategoryFilter,
  );

  const handleReset = () => {
    playTactileClick();
    setMessages([createInitialMsg(language)]);
    setLatestToolCall(null);
    setVisitedNodes(['IDLE']);
    setActiveStateNode('IDLE');
    appendLog('SESSION_RESET: Cleared conversation & state graph');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0D0D0C] text-[#141413] dark:text-[#F2F0EA] flex flex-col">
      {/* Top Architectural Header */}
      <header className="bg-[#F3F1EC] dark:bg-[#141412] border-b designer-hairline px-4 sm:px-6 py-3 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-2.5 py-1.5 rounded-lg bg-[#FAF9F5] dark:bg-[#1C1C19] border designer-hairline text-xs font-mono designer-text-secondary hover:designer-text-primary flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{td('返回个人门户', 'Back to Portfolio')}</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413]">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xs sm:text-sm font-mono font-bold tracking-tight">
                    HYX // AGENT ENGINEERING WORKBENCH
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    12 TOOLS · HITL GATE ACTIVE
                  </span>
                </div>
                <p className="text-[11px] font-mono designer-text-muted hidden sm:block">
                  {td(
                    '复刻「禾书耕文 (LangGraph 46工具/11路SSE)」与「洋葱教育 FDE (35只读工具/人工确认写库)」核心架构',
                    'Live demonstration of HeShu (46-tool loop) & Onion Edu FDE (35 read-only tools + HITL gates)',
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Right Controls: Persona Mode Switcher + Reset */}
          <div className="flex items-center gap-2">
            <div className="flex bg-[#EAE6DC] dark:bg-[#1C1C19] p-1 rounded-xl border designer-hairline">
              {[
                {
                  id: 'guide' as AgentPersonaMode,
                  icon: <Zap className="w-3 h-3" />,
                  labelZh: '极速导览',
                  labelEn: 'Co-Pilot',
                },
                {
                  id: 'recruiter' as AgentPersonaMode,
                  icon: <Target className="w-3 h-3" />,
                  labelZh: 'HR / JD评估',
                  labelEn: 'Recruiter JD',
                },
                {
                  id: 'architect' as AgentPersonaMode,
                  icon: <Cpu className="w-3 h-3" />,
                  labelZh: '架构深潜',
                  labelEn: 'Architect',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setAgentPersona(m.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all ${
                    agentPersona === m.id
                      ? 'bg-[#FFFFFF] dark:bg-[#141413] designer-text-primary font-semibold shadow-2xs'
                      : 'designer-text-muted hover:designer-text-primary'
                  }`}
                >
                  {m.icon}
                  <span>{td(m.labelZh, m.labelEn)}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl bg-[#FAF9F5] dark:bg-[#1C1C19] border designer-hairline designer-text-secondary hover:designer-text-primary transition-colors"
              title={td('重置工作台会话', 'Reset Workbench')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main 3-Column Workbench Body */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x designer-hairline">
        {/* LEFT COLUMN (3 Cols): 12-Tool Registry & Prompt Playbook */}
        <aside className="lg:col-span-3 bg-[#F6F4EF]/70 dark:bg-[#11110F] flex flex-col max-h-[88vh]">
          <div className="p-3.5 border-b designer-hairline space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold">
                <Wrench className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
                <span>{td('01 // 挂载工具注册表 (12)', '01 // TOOL REGISTRY (12)')}</span>
              </div>
              <span className="text-[10px] font-mono designer-text-muted">CLICK TO RUN</span>
            </div>

            {/* Category Filter Pills */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
              {[
                { id: 'all', label: 'ALL (12)' },
                { id: 'read_only', label: 'READ (7)' },
                { id: 'ui_action', label: 'UI (4)' },
                { id: 'hitl_gate', label: 'HITL (1)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setToolCategoryFilter(cat.id as any)}
                  className={`py-1 rounded-md border text-center transition-colors ${
                    toolCategoryFilter === cat.id
                      ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] border-transparent font-semibold'
                      : 'bg-[#FAF9F5] dark:bg-[#181815] designer-hairline designer-text-secondary'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredTools.map((tool) => (
              <button
                key={tool.name}
                type="button"
                disabled={isLoading}
                onClick={() =>
                  handleRunPrompt(language === 'en' ? tool.samplePromptEn : tool.samplePromptZh)
                }
                className="w-full p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#171715] hover:border-[#8A6F48] border designer-hairline text-left transition-all group space-y-1.5 disabled:opacity-50"
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${
                      tool.category === 'hitl_gate'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        : tool.category === 'ui_action'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-[#EAE6DC] dark:bg-[#242420] text-[#8A6F48] dark:text-[#C8A97E]'
                    }`}
                  >
                    {tool.category.toUpperCase()}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 designer-text-muted group-hover:text-[#8A6F48] transition-colors" />
                </div>

                <div className="text-xs font-mono font-bold designer-text-primary truncate">
                  {tool.name}()
                </div>

                <div className="text-[11px] designer-text-secondary leading-snug">
                  {td(tool.descriptionZh, tool.descriptionEn)}
                </div>

                <div className="text-[9px] font-mono designer-text-muted break-words bg-[#F3F1EC] dark:bg-[#121210] px-2 py-1 rounded border designer-hairline">
                  {tool.schemaSummary}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* CENTER COLUMN (6 Cols): Streaming Multi-Modal Agent Console */}
        <main className="lg:col-span-6 flex flex-col max-h-[88vh] bg-[#FAF9F5] dark:bg-[#0D0D0C]">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.sender === 'user' ? (
                  <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-xs bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] text-xs sm:text-sm leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full max-w-[94%]">
                    <AgentTraceAccordion
                      toolCalls={msg.toolCalls || []}
                      totalDurationMs={msg.totalDurationMs}
                      isStreaming={msg.isStreaming}
                      thoughtTitleZh={msg.thoughtTitleZh}
                      thoughtTitleEn={msg.thoughtTitleEn}
                    />

                    {(msg.content || msg.isStreaming) && (
                      <div className="p-4 rounded-2xl rounded-bl-xs bg-[#F3F1EC] dark:bg-[#171715] border designer-hairline">
                        {msg.content ? (
                          <AgentMarkdown content={msg.content} />
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-mono designer-text-muted">
                            <span className="w-2 h-2 rounded-full bg-[#8A6F48] animate-ping" />
                            <span>
                              {td(
                                msg.thoughtTitleZh || '正在执行工具调用...',
                                msg.thoughtTitleEn || 'Running tool calls...',
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {msg.cards &&
                      msg.cards.map((card, idx) => (
                        <AgentCardRenderer
                          key={`${msg.id}-c-${idx}`}
                          card={card}
                          onTriggerUiAction={(section, projectCode, projectTab) =>
                            executeUiAction({
                              type: 'navigate_section',
                              section: section as any,
                              projectCode,
                              projectTab,
                            })
                          }
                          onQuickPrompt={(p) => handleRunPrompt(p)}
                        />
                      ))}

                    {msg.suggestions && msg.suggestions.length > 0 && !msg.isStreaming && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleRunPrompt(sug)}
                            className="px-3 py-1 rounded-full bg-[#FAF9F5] dark:bg-[#1D1D1A] hover:border-[#8A6F48] border designer-hairline text-[11px] font-mono designer-text-secondary transition-colors"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Prompt Input Bar */}
          <div className="p-4 bg-[#F3F1EC] dark:bg-[#141412] border-t designer-hairline">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunPrompt(inputValue);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                placeholder={td(
                  '输入指令、技术追问，或粘贴岗位 JD 测试 Agent 工具链...',
                  'Type a command, architecture query, or paste a Job Description (JD)...',
                )}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#1C1C19] border designer-hairline text-xs sm:text-sm designer-text-primary placeholder-[#8E8C84] focus:outline-none focus:border-[#8A6F48]"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-5 py-2.5 rounded-xl designer-btn-primary text-xs sm:text-sm font-mono font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{td('执行', 'Run')}</span>
              </button>
            </form>
          </div>
        </main>

        {/* RIGHT COLUMN (3 Cols): Live LangGraph State Machine & Telemetry Inspector */}
        <aside className="lg:col-span-3 bg-[#F6F4EF]/70 dark:bg-[#11110F] flex flex-col max-h-[88vh] overflow-y-auto p-3.5 space-y-4">
          {/* 1. Recoverable State Machine Graph */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold">
                <Activity className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
                <span>{td('02 // 状态机流转图', '02 // STATE MACHINE GRAPH')}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#EAE6DC] dark:bg-[#22221E] text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">
                {activeStateNode}
              </span>
            </div>

            <div className="space-y-1.5">
              {STATE_MACHINE_NODES.map((node) => {
                const isCurrent = activeStateNode === node.id;
                const wasVisited = visitedNodes.includes(node.id);
                return (
                  <div
                    key={node.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] border-transparent shadow-sm'
                        : wasVisited
                        ? 'bg-[#FAF9F5] dark:bg-[#1A1A17] border-[#8A6F48]/50'
                        : 'bg-[#FAF9F5]/50 dark:bg-[#161613]/50 designer-hairline opacity-65'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold">{td(node.labelZh, node.labelEn)}</span>
                      {isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-[#C8A97E] dark:bg-[#8A6F48] animate-ping" />
                      ) : wasVisited ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : null}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isCurrent ? 'opacity-80' : 'designer-text-muted'
                      }`}
                    >
                      {td(node.descZh, node.descEn)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Latest Tool Call JSON Payload Inspector */}
          <div className="space-y-2 pt-2 border-t designer-hairline">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold">
              <Code2 className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
              <span>{td('03 // 工具调用载荷检查器', '03 // TOOL PAYLOAD INSPECTOR')}</span>
            </div>

            {latestToolCall ? (
              <div className="p-3 rounded-xl bg-[#141413] text-[#F2F0EA] font-mono text-[10px] space-y-1.5 overflow-x-auto">
                <div className="flex items-center justify-between text-[#C8A97E]">
                  <span>{latestToolCall.toolName}()</span>
                  <span>{latestToolCall.durationMs}ms</span>
                </div>
                <pre className="text-[10px] text-emerald-300/90 whitespace-pre-wrap break-all">
                  {JSON.stringify(
                    {
                      category: latestToolCall.category,
                      status: latestToolCall.status,
                      args: latestToolCall.args,
                      result: td(latestToolCall.summaryZh, latestToolCall.summaryEn),
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#171715] border designer-hairline text-[11px] font-mono designer-text-muted text-center">
                {td('点击左侧任意工具或发送指令以捕获 JSON 载荷', 'Run any tool to inspect live JSON payload')}
              </div>
            )}
          </div>

          {/* 3. Live Multi-Channel SSE Event Log */}
          <div className="space-y-2 pt-2 border-t designer-hairline flex-1 flex flex-col">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
              <span>{td('04 // 实时事件流日志', '04 // LIVE SSE EVENT STREAM')}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141413] text-[#A09E96] font-mono text-[10px] space-y-1 overflow-y-auto max-h-48">
              {sseLogs.map((log, i) => (
                <div key={i} className="leading-relaxed break-words">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
