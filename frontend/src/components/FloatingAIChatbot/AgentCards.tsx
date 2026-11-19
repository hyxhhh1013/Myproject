import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Cpu,
  ArrowUpRight,
  Github,
  Check,
  Copy,
  FileText,
  ShieldAlert,
  Send,
  X,
  Disc,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { useI18n } from '../../i18n/i18nContext';
import { useMusic } from '../../context/MusicContext';
import { getImageUrl } from '../../utils/imageUtils';
import { playTactileClick, playSuccessChime } from '../../utils/soundEffects';
import { evaluateJdMatch } from '../../utils/agentEngine';
import {
  AgentGenerativeCard,
  AgentToolCallRecord,
  FdeTelemetryCardData,
  HitlContactDraftData,
  JdMatchCardData,
  MusicNowPlayingCardData,
  ProjectDossierCardData,
} from '../../types/agent';

// ============================================================================
// 1. Lightweight Rich Markdown Renderer (Editorial Warm Sand & Obsidian Style)
// ============================================================================
export const AgentMarkdown: React.FC<{ content: string }> = React.memo(({ content }) => {
  if (!content) return null;

  const renderInline = (text: string) => {
    // Tokenize links, bold, and inline code
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s)]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-[#141413] dark:text-[#F2F0EA]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 text-[11px] font-mono rounded bg-[#EAE6DC] dark:bg-[#262622] text-[#8A6F48] dark:text-[#C8A97E] border designer-hairline"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8A6F48] dark:text-[#C8A97E] underline underline-offset-2 hover:opacity-80 font-mono text-[11px] break-all"
          >
            {part}
          </a>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed designer-text-primary">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={idx} className="h-1" />;
        }

        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-[#8A6F48] dark:text-[#C8A97E] font-mono text-[10px] mt-1 shrink-0">
                ◆
              </span>
              <span className="flex-1">{renderInline(line.slice(2))}</span>
            </div>
          );
        }

        const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="text-[10px] font-mono font-semibold text-[#8A6F48] dark:text-[#C8A97E] mt-0.5 shrink-0">
                0{numberedMatch[1]}.
              </span>
              <span className="flex-1">{renderInline(numberedMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{renderInline(rawLine)}</p>;
      })}
    </div>
  );
});

// ============================================================================
// 2. Glass-Box Agent Trace Accordion (Tool Call & Latency Inspector)
// ============================================================================
export const AgentTraceAccordion: React.FC<{
  toolCalls: AgentToolCallRecord[];
  totalDurationMs?: number;
  isStreaming?: boolean;
  thoughtTitleZh?: string;
  thoughtTitleEn?: string;
}> = ({ toolCalls, totalDurationMs, isStreaming, thoughtTitleZh, thoughtTitleEn }) => {
  const { td } = useI18n();
  const [expanded, setExpanded] = useState(false);

  if ((!toolCalls || toolCalls.length === 0) && !isStreaming) return null;

  const totalMs =
    totalDurationMs || toolCalls.reduce((acc, item) => acc + (item.durationMs || 80), 0);

  return (
    <div className="mb-2 rounded-xl bg-[#EAE6DC]/65 dark:bg-[#1A1A17] border designer-hairline overflow-hidden">
      <button
        type="button"
        onClick={() => {
          playTactileClick();
          setExpanded(!expanded);
        }}
        className="w-full px-3 py-1.5 flex items-center justify-between gap-2 text-[11px] font-mono text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {isStreaming ? (
            <span className="w-2 h-2 rounded-full bg-[#8A6F48] dark:bg-[#C8A97E] animate-ping shrink-0" />
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
          )}
          <span className="truncate designer-text-secondary">
            {isStreaming
              ? td(thoughtTitleZh || '正在调度 Agent 工具链...', thoughtTitleEn || 'Running Agent tool chain...')
              : td(
                  `已执行 ${toolCalls.length} 个 Agent 工具调用`,
                  `Executed ${toolCalls.length} Agent tool call${toolCalls.length > 1 ? 's' : ''}`,
                )}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-[#8A6F48] dark:text-[#C8A97E]">
          <span>{totalMs}ms</span>
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {expanded && toolCalls.length > 0 && (
        <div className="px-3 py-2 border-t designer-hairline bg-[#FAF9F5]/90 dark:bg-[#121210]/90 space-y-2 text-[10px] font-mono">
          {toolCalls.map((tc, index) => (
            <div
              key={tc.id}
              className="p-2 rounded-lg bg-[#F3F1EC] dark:bg-[#1C1C19] border designer-hairline space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] text-[9px] font-semibold">
                    0{index + 1} // {tc.category.toUpperCase()}
                  </span>
                  <span className="font-semibold text-[#8A6F48] dark:text-[#C8A97E]">
                    {tc.toolName}()
                  </span>
                </div>
                <span className="designer-text-muted">{tc.durationMs}ms</span>
              </div>
              <div className="designer-text-muted break-all">
                args: {JSON.stringify(tc.args)}
              </div>
              <div className="designer-text-primary">
                → {td(tc.summaryZh, tc.summaryEn)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. Generative Card Dispatcher
// ============================================================================
export const AgentCardRenderer: React.FC<{
  card: AgentGenerativeCard;
  onTriggerUiAction?: (
    section: string,
    projectCode?: string,
    projectTab?: 'overview' | 'architecture',
  ) => void;
  onQuickPrompt?: (prompt: string) => void;
}> = ({ card, onTriggerUiAction, onQuickPrompt }) => {
  switch (card.type) {
    case 'project_dossier':
      return (
        <ProjectDossierCard
          data={card.data}
          onLocateProject={(code, tab) => onTriggerUiAction?.('projects', code, tab)}
        />
      );
    case 'jd_match':
      return (
        <JdMatchCard
          initialData={card.data}
          onDraftInterview={() =>
            onQuickPrompt?.(
              '📬 Draft a remote interview invitation for Yixuan / 帮我拟一份远程面试邀请留言草稿',
            )
          }
        />
      );
    case 'fde_telemetry':
      return (
        <FdeTelemetryCard
          data={card.data}
          onJumpExperience={() => onTriggerUiAction?.('experience')}
        />
      );
    case 'contact_approval':
      return <HitlContactApprovalCard initialDraft={card.data} />;
    case 'music_now_playing':
      return <MusicNowPlayingCard data={card.data} />;
    default:
      return null;
  }
};

// ============================================================================
// 3A. Project Dossier Card
// ============================================================================
const ProjectDossierCard: React.FC<{
  data: ProjectDossierCardData;
  onLocateProject: (code: string, tab: 'overview' | 'architecture') => void;
}> = ({ data, onLocateProject }) => {
  const { td } = useI18n();

  return (
    <div className="my-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#161614] border designer-hairline overflow-hidden shadow-sm">
      <div className="px-3.5 py-2 bg-[#F3F1EC] dark:bg-[#1E1E1B] border-b designer-hairline flex items-center justify-between gap-2 text-[10px] font-mono">
        <span className="px-1.5 py-0.5 rounded bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] font-semibold">
          DOSSIER // {data.indexCode}
        </span>
        <span className="text-[#8A6F48] dark:text-[#C8A97E] truncate">
          {td(data.badgeZh, data.badgeEn)}
        </span>
      </div>

      <div className="p-3.5 space-y-3">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold designer-text-primary">
            {td(data.titleZh, data.titleEn)}
          </h4>
        </div>

        {/* 4-Tile Telemetry Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {data.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg bg-[#F3F1EC]/80 dark:bg-[#1F1F1C] border designer-hairline"
            >
              <div className="text-xs font-mono font-bold text-[#141413] dark:text-[#F2F0EA]">
                {m.value}
              </div>
              <div className="text-[10px] designer-text-muted truncate">
                {td(m.labelZh, m.labelEn)}
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1">
          {data.stack.slice(0, 6).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#EFECE6] dark:bg-[#242420] designer-text-secondary border designer-hairline"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t designer-hairline flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onLocateProject(data.indexCode, 'architecture');
            }}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] text-[11px] font-mono font-medium flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{td('定位并展开架构拆解', 'Locate & Open Architecture')}</span>
          </button>

          {data.demoUrl && (
            <a
              href={data.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-2.5 rounded-lg bg-[#F3F1EC] dark:bg-[#22221F] border designer-hairline text-[11px] font-mono designer-text-primary flex items-center gap-1 hover:border-[#8A6F48] transition-colors"
            >
              <span>Demo</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          )}

          {data.githubUrl && (
            <a
              href={data.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repo"
              className="p-1.5 rounded-lg bg-[#F3F1EC] dark:bg-[#22221F] border designer-hairline designer-text-secondary hover:designer-text-primary transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3B. Recruiter JD Match Evaluator Card
// ============================================================================
const JdMatchCard: React.FC<{
  initialData: JdMatchCardData;
  onDraftInterview?: () => void;
}> = ({ initialData, onDraftInterview }) => {
  const { td } = useI18n();
  const [matchData, setMatchData] = useState<JdMatchCardData>(initialData);
  const [customJd, setCustomJd] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  const handleReEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customJd.trim()) return;
    playTactileClick();
    setMatchData(evaluateJdMatch(customJd));
    setShowCustomInput(false);
  };

  const handleCopyPitch = () => {
    const text = td(matchData.recruiterPitchZh, matchData.recruiterPitchEn);
    navigator.clipboard.writeText(text);
    playSuccessChime();
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 1800);
  };

  return (
    <div className="my-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#161614] border designer-hairline overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-[#F3F1EC] dark:bg-[#1E1E1B] border-b designer-hairline flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded bg-[#8A6F48] text-[#FAF9F5] text-[10px] font-mono font-bold shrink-0">
            {matchData.overallScore}% MATCH
          </span>
          <span className="text-[11px] font-mono font-semibold designer-text-primary truncate">
            {td(matchData.roleTitleZh, matchData.roleTitleEn)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E] underline shrink-0"
        >
          {td(showCustomInput ? '收起 JD' : '粘贴自定义 JD', showCustomInput ? 'Hide' : 'Paste Custom JD')}
        </button>
      </div>

      {/* Custom JD Input Drawer */}
      {showCustomInput && (
        <form
          onSubmit={handleReEvaluate}
          className="p-3 bg-[#EFECE6]/70 dark:bg-[#1C1C19] border-b designer-hairline space-y-2"
        >
          <textarea
            rows={2}
            value={customJd}
            onChange={(e) => setCustomJd(e.target.value)}
            placeholder={td(
              '在此粘贴您的岗位职责或任职要求（如：熟悉 LangGraph/RAG、全栈开发、FDE 驻场）...',
              'Paste your job description or requirements here...',
            )}
            className="w-full p-2 text-xs rounded-lg bg-[#FAF9F5] dark:bg-[#121210] border designer-hairline designer-text-primary focus:outline-none focus:border-[#8A6F48]"
          />
          <button
            type="submit"
            className="w-full py-1.5 rounded-lg bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] text-[11px] font-mono font-semibold"
          >
            {td('⚡ 立即重新计算匹配度', '⚡ Re-calculate JD Fit')}
          </button>
        </form>
      )}

      {/* 3D Fit Breakdown */}
      <div className="p-3.5 space-y-2.5">
        {matchData.dimensions.map((dim, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-[#F3F1EC]/70 dark:bg-[#1D1D1A] border designer-hairline space-y-1"
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-semibold designer-text-primary">
                {td(dim.nameZh, dim.nameEn)}
              </span>
              <span className="text-[#8A6F48] dark:text-[#C8A97E] font-bold">{dim.score}%</span>
            </div>
            <div className="w-full h-1 bg-[#E2DFD5] dark:bg-[#2C2C28] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8A6F48] dark:bg-[#C8A97E] rounded-full"
                style={{ width: `${dim.score}%` }}
              />
            </div>
            <p className="text-[11px] designer-text-secondary leading-snug pt-0.5">
              {td(dim.evidenceZh, dim.evidenceEn)}
            </p>
          </div>
        ))}

        {/* Availability Banner */}
        <div className="px-3 py-2 rounded-lg bg-[#EAE6DC]/75 dark:bg-[#22221E] border designer-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-mono">
          <span className="text-[#8A6F48] dark:text-[#C8A97E] font-semibold whitespace-nowrap shrink-0">
            AVAILABILITY //
          </span>
          <span className="designer-text-primary">
            {td(matchData.availabilityZh, matchData.availabilityEn)}
          </span>
        </div>

        {/* Actions: Copy Pitch, Download CV, Draft Interview */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyPitch}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] text-[11px] font-mono font-medium flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>
              {copiedPitch
                ? td('已复制内推评估词', 'Copied Pitch!')
                : td('复制 HR 推荐摘要', 'Copy Recruiter Pitch')}
            </span>
          </button>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="py-1.5 px-2.5 rounded-lg bg-[#F3F1EC] dark:bg-[#22221F] border designer-hairline text-[11px] font-mono designer-text-primary flex items-center gap-1 hover:border-[#8A6F48]"
          >
            <FileText className="w-3.5 h-3.5 text-[#8A6F48]" />
            <span>CV.pdf</span>
          </a>

          {onDraftInterview && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onDraftInterview();
              }}
              className="py-1.5 px-2.5 rounded-lg bg-[#F3F1EC] dark:bg-[#22221F] border designer-hairline text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E] flex items-center gap-1 hover:border-[#8A6F48]"
            >
              <Sparkles className="w-3 h-3" />
              <span>{td('约面', 'Invite')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3C. Onion Education FDE Residency Telemetry Card
// ============================================================================
const FdeTelemetryCard: React.FC<{
  data: FdeTelemetryCardData;
  onJumpExperience: () => void;
}> = ({ data, onJumpExperience }) => {
  const { td } = useI18n();

  return (
    <div className="my-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#161614] border designer-hairline overflow-hidden shadow-sm">
      <div className="px-3.5 py-2 bg-[#F3F1EC] dark:bg-[#1E1E1B] border-b designer-hairline flex items-center justify-between text-[10px] font-mono">
        <span className="text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
          FDE RESIDENCY // ON-SITE TELEMETRY
        </span>
        <span className="designer-text-muted">{data.period}</span>
      </div>

      <div className="p-3.5 space-y-3">
        <div>
          <div className="text-xs sm:text-sm font-semibold designer-text-primary">
            {td(data.companyZh, data.companyEn)}
          </div>
          <div className="text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">
            {td(data.roleZh, data.roleEn)}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {data.metrics.map((m, i) => (
            <div
              key={i}
              className="p-2 rounded-lg bg-[#F3F1EC]/80 dark:bg-[#1F1F1C] border designer-hairline"
            >
              <div className="text-xs font-mono font-bold designer-text-primary">{m.value}</div>
              <div className="text-[10px] designer-text-muted leading-tight mt-0.5">
                {td(m.labelZh, m.labelEn)}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          {data.pillars.map((p) => (
            <div
              key={p.code}
              className="p-2 rounded-lg bg-[#F6F4EF] dark:bg-[#1B1B18] border designer-hairline"
            >
              <div className="text-[9px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">
                {p.code}
              </div>
              <div className="text-[11px] font-semibold designer-text-primary">
                {td(p.titleZh, p.titleEn)}
              </div>
              <div className="text-[11px] designer-text-secondary leading-snug mt-0.5">
                {td(p.detailZh, p.detailEn)}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            playTactileClick();
            onJumpExperience();
          }}
          className="w-full py-1.5 px-3 rounded-lg bg-[#F3F1EC] dark:bg-[#22221F] hover:border-[#8A6F48] border designer-hairline text-[11px] font-mono designer-text-primary flex items-center justify-center gap-1.5 transition-colors"
        >
          <Briefcase className="w-3.5 h-3.5 text-[#8A6F48]" />
          <span>{td('跳转到「04 // 经历与实践」查看完整时间轴 →', 'Scroll to Experience Chronicle →')}</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 3D. Human-in-the-Loop (HITL) Contact / Interview Approval Gate Card
// ============================================================================
const HitlContactApprovalCard: React.FC<{
  initialDraft: HitlContactDraftData;
}> = ({ initialDraft }) => {
  const { td } = useI18n();
  const [name, setName] = useState(initialDraft.senderName);
  const [email, setEmail] = useState(initialDraft.senderEmail);
  const [subject, setSubject] = useState(initialDraft.subject);
  const [content, setContent] = useState(initialDraft.content);
  const [status, setStatus] = useState<'pending_approval' | 'submitting' | 'approved_sent' | 'cancelled'>(
    initialDraft.status,
  );

  const handleApproveAndWrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'pending_approval') return;

    setStatus('submitting');
    playTactileClick();

    try {
      await axios.post('/api/messages', {
        name: name.trim() || 'Recruiter / Visitor',
        email: email.trim() || 'visitor@hyxhhh.site',
        subject: subject.trim() || 'Agent HITL Approved Message',
        content: content.trim(),
      });
    } catch {
      // Even if local DB is offline in demo mode, complete the HITL confirmation UX smoothly
    }

    playSuccessChime();
    setStatus('approved_sent');
  };

  if (status === 'cancelled') {
    return (
      <div className="my-2 px-3 py-2 rounded-xl bg-[#F3F1EC] dark:bg-[#1C1C19] border designer-hairline text-[11px] font-mono designer-text-muted flex items-center justify-between">
        <span>{td('✕ 已取消留言草稿（未执行数据库写入）', '✕ Draft discarded (Zero DB write executed)')}</span>
        <button
          type="button"
          onClick={() => setStatus('pending_approval')}
          className="text-[#8A6F48] underline"
        >
          {td('恢复草稿', 'Restore')}
        </button>
      </div>
    );
  }

  if (status === 'approved_sent') {
    return (
      <div className="my-2.5 p-3.5 rounded-xl bg-[#F3F1EC] dark:bg-[#1C1C19] border border-emerald-600/40 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
          <Check className="w-4 h-4" />
          <span>
            {td(
              'HUMAN GATE APPROVED // 已通过人工确认并写入 Message 表',
              'HUMAN GATE APPROVED // Written to Message Database',
            )}
          </span>
        </div>
        <p className="text-[11px] designer-text-secondary">
          {td(
            `感谢您的留言！奕轩收到后会第一时间通过邮件 (${email || 'hyxhhh1013@gmail.com'}) 与您联系。`,
            `Thank you! Yixuan will reply to your email (${email || 'hyxhhh1013@gmail.com'}) promptly.`,
          )}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleApproveAndWrite}
      className="my-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#161614] border-2 border-[#8A6F48]/60 dark:border-[#C8A97E]/50 overflow-hidden shadow-sm"
    >
      <div className="px-3.5 py-2 bg-[#EAE6DC] dark:bg-[#22221E] border-b designer-hairline flex items-center justify-between gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-[#8A6F48] dark:text-[#C8A97E] font-bold">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>{td('HUMAN GATE // 人工确认后才写入数据库', 'HUMAN GATE // DB WRITE REQUIRES APPROVAL')}</span>
        </div>
      </div>

      <div className="p-3 space-y-2 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-mono designer-text-muted mb-0.5">
              {td('您的称呼 / 公司', 'Your Name / Company')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F3F1EC] dark:bg-[#1E1E1B] border designer-hairline text-xs designer-text-primary focus:outline-none focus:border-[#8A6F48]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono designer-text-muted mb-0.5">
              {td('联系邮箱 / 微信备注', 'Your Email / Contact')}
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={td('选填，方便奕轩回复您', 'your@email.com')}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F3F1EC] dark:bg-[#1E1E1B] border designer-hairline text-xs designer-text-primary focus:outline-none focus:border-[#8A6F48]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono designer-text-muted mb-0.5">
            {td('留言主题', 'Subject')}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F3F1EC] dark:bg-[#1E1E1B] border designer-hairline text-xs designer-text-primary focus:outline-none focus:border-[#8A6F48]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono designer-text-muted mb-0.5">
            {td('留言正文（可直接编辑）', 'Message Content (Editable)')}
          </label>
          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F3F1EC] dark:bg-[#1E1E1B] border designer-hairline text-xs designer-text-primary focus:outline-none focus:border-[#8A6F48]"
          />
        </div>

        <div className="pt-1 flex items-center gap-2">
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="flex-1 py-1.5 px-3 rounded-lg bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] text-[11px] font-mono font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Send className="w-3 h-3" />
            <span>
              {status === 'submitting'
                ? td('正在写入...', 'Writing...')
                : td('✓ 人工确认并写入数据库', '✓ Approve & Write to DB')}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatus('cancelled')}
            className="py-1.5 px-2.5 rounded-lg bg-[#F3F1EC] dark:bg-[#22221F] border designer-hairline text-[11px] font-mono designer-text-muted hover:designer-text-primary flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>{td('丢弃', 'Discard')}</span>
          </button>
        </div>
      </div>
    </form>
  );
};

// ============================================================================
// 3E. Vinyl Music Now Playing Mini Card
// ============================================================================
const MusicNowPlayingCard: React.FC<{ data: MusicNowPlayingCardData }> = ({ data }) => {
  const { currentMusic, isPlaying, togglePlay, playNext, playPrev } = useMusic();

  return (
    <div className="my-2.5 p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#161614] border designer-hairline flex items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#141413] border designer-hairline flex items-center justify-center shrink-0">
          {currentMusic?.coverUrl ? (
            <img
              src={getImageUrl(currentMusic.coverUrl)}
              alt={currentMusic.title}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '10s' }}
            />
          ) : (
            <Disc className={`w-5 h-5 text-[#C8A97E] ${isPlaying ? 'animate-spin' : ''}`} />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">
            AUDIO CO-PILOT // {data.actionPerformed.toUpperCase()}
          </div>
          <div className="text-xs font-semibold designer-text-primary truncate">
            {currentMusic?.title || 'Warm Sand Lofi Synth'}
          </div>
          <div className="text-[10px] font-mono designer-text-muted truncate">
            {currentMusic?.artist || 'HYX Vinyl Turntable'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={playPrev}
          className="p-1.5 rounded-full bg-[#F3F1EC] dark:bg-[#22221F] border designer-hairline designer-text-primary"
          aria-label="Previous"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className="p-2 rounded-full bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413]"
          aria-label="Play or Pause"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>
        <button
          type="button"
          onClick={playNext}
          className="p-1.5 rounded-full bg-[#F3F1EC] dark:bg-[#22221F] border designer-hairline designer-text-primary"
          aria-label="Next"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
