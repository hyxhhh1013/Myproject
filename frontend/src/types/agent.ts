import { AgentPersonaMode, SkinTheme } from '../store/useAppStore';

export type { AgentPersonaMode };

export type AgentToolCategory = 'read_only' | 'ui_action' | 'hitl_gate';

export type AgentStateNode =
  | 'IDLE'
  | 'GUARDRAIL'
  | 'PLAN'
  | 'TOOL_EXEC'
  | 'HITL_GATE'
  | 'SYNTHESIS';

export interface AgentToolDefinition {
  name: string;
  category: AgentToolCategory;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  schemaSummary: string;
  samplePromptZh: string;
  samplePromptEn: string;
}

export interface AgentToolCallRecord {
  id: string;
  toolName: string;
  category: AgentToolCategory;
  status: 'running' | 'completed';
  args: Record<string, unknown>;
  summaryZh: string;
  summaryEn: string;
  durationMs: number;
}

export interface ProjectDossierCardData {
  indexCode: string;
  slug: 'heshu' | 'fandingle' | 'dreamtop' | 'outbounds';
  titleZh: string;
  titleEn: string;
  badgeZh: string;
  badgeEn: string;
  metrics: Array<{
    value: string;
    labelZh: string;
    labelEn: string;
  }>;
  stack: string[];
  highlightZh: string;
  highlightEn: string;
  architectureNoteZh: string;
  architectureNoteEn: string;
  demoUrl?: string;
  githubUrl?: string;
}

export interface JdMatchCardData {
  overallScore: number;
  roleTitleZh: string;
  roleTitleEn: string;
  jdSnippet?: string;
  dimensions: Array<{
    nameZh: string;
    nameEn: string;
    score: number;
    evidenceZh: string;
    evidenceEn: string;
  }>;
  availabilityZh: string;
  availabilityEn: string;
  recruiterPitchZh: string;
  recruiterPitchEn: string;
}

export interface FdeTelemetryCardData {
  companyZh: string;
  companyEn: string;
  roleZh: string;
  roleEn: string;
  period: string;
  metrics: Array<{
    value: string;
    labelZh: string;
    labelEn: string;
  }>;
  pillars: Array<{
    code: string;
    titleZh: string;
    titleEn: string;
    detailZh: string;
    detailEn: string;
  }>;
}

export interface HitlContactDraftData {
  draftId: string;
  intentType: 'interview' | 'collaboration' | 'greeting';
  senderName: string;
  senderEmail: string;
  subject: string;
  content: string;
  status: 'pending_approval' | 'approved_sent' | 'cancelled';
}

export interface MusicNowPlayingCardData {
  actionPerformed: 'play' | 'pause' | 'next' | 'prev' | 'status';
  noteZh: string;
  noteEn: string;
}

export type AgentGenerativeCard =
  | { type: 'project_dossier'; data: ProjectDossierCardData }
  | { type: 'jd_match'; data: JdMatchCardData }
  | { type: 'fde_telemetry'; data: FdeTelemetryCardData }
  | { type: 'contact_approval'; data: HitlContactDraftData }
  | { type: 'music_now_playing'; data: MusicNowPlayingCardData };

export type AgentUiAction =
  | {
      type: 'navigate_section';
      section:
        | 'hero'
        | 'about'
        | 'skills'
        | 'projects'
        | 'experience'
        | 'photos'
        | 'contact'
        | 'interests';
      projectCode?: string;
      projectTab?: 'overview' | 'architecture';
    }
  | {
      type: 'filter_skill';
      skill: string | null;
    }
  | {
      type: 'music_control';
      command: 'play' | 'pause' | 'next' | 'prev';
    }
  | {
      type: 'switch_skin';
      skin?: SkinTheme;
      darkMode?: boolean;
    };

export interface AgentMessage {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: Date;
  persona?: AgentPersonaMode;
  isStreaming?: boolean;
  thoughtTitleZh?: string;
  thoughtTitleEn?: string;
  toolCalls?: AgentToolCallRecord[];
  cards?: AgentGenerativeCard[];
  suggestions?: string[];
  totalDurationMs?: number;
}

export type AgentSseEvent =
  | {
      type: 'step_start';
      node: AgentStateNode;
      titleZh: string;
      titleEn: string;
    }
  | {
      type: 'tool_call';
      tool: AgentToolCallRecord;
    }
  | {
      type: 'ui_action';
      action: AgentUiAction;
    }
  | {
      type: 'generative_card';
      card: AgentGenerativeCard;
    }
  | {
      type: 'delta';
      content: string;
    }
  | {
      type: 'suggestions';
      itemsZh: string[];
      itemsEn: string[];
    }
  | {
      type: 'done';
      totalDurationMs: number;
    };
