import { useState, useEffect } from 'react';

export type SkinTheme = 'editorial' | 'forest' | 'titanium' | 'cobalt';
export type ViewMode = 'island3d' | 'classic2d';
export type AgentPersonaMode = 'guide' | 'recruiter' | 'architect';

export interface ProjectTabOverride {
  code: string;
  tab: 'overview' | 'architecture';
  tick: number;
}

export interface AppState {
  moodMode: 'coding' | 'chill';
  skinTheme: SkinTheme;
  viewMode: ViewMode;
  isCommandOpen: boolean;
  aiChatOpen: boolean;
  aiInitialPrompt: string | null;
  activeSkillFilter: string | null;
  agentPersona: AgentPersonaMode;
  highlightedProjectCode: string | null;
  projectTabOverride: ProjectTabOverride | null;
  toggleMoodMode: () => void;
  setSkinTheme: (skin: SkinTheme) => void;
  setViewMode: (mode: ViewMode) => void;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;
  openAiWithPrompt: (prompt?: string, persona?: AgentPersonaMode) => void;
  setAiChatOpen: (open: boolean) => void;
  clearAiInitialPrompt: () => void;
  setActiveSkillFilter: (skill: string | null) => void;
  setAgentPersona: (persona: AgentPersonaMode) => void;
  focusProjectCard: (code: string | null, tab?: 'overview' | 'architecture') => void;
}

type Listener = () => void;
const listeners = new Set<Listener>();

const getInitialSkin = (): SkinTheme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('hyx_skin_theme') as SkinTheme;
    if (saved && ['editorial', 'forest', 'titanium', 'cobalt'].includes(saved)) {
      return saved;
    }
  }
  return 'editorial';
};

let state: Omit<
  AppState,
  | 'toggleMoodMode'
  | 'setSkinTheme'
  | 'setViewMode'
  | 'setCommandOpen'
  | 'toggleCommand'
  | 'openAiWithPrompt'
  | 'setAiChatOpen'
  | 'clearAiInitialPrompt'
  | 'setActiveSkillFilter'
  | 'setAgentPersona'
  | 'focusProjectCard'
> = {
  moodMode: 'coding',
  skinTheme: getInitialSkin(),
  viewMode: 'classic2d',
  isCommandOpen: false,
  aiChatOpen: false,
  aiInitialPrompt: null,
  activeSkillFilter: null,
  agentPersona: 'guide',
  highlightedProjectCode: null,
  projectTabOverride: null,
};

if (typeof document !== 'undefined') {
  document.documentElement.dataset.skin = state.skinTheme;
}

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const actions = {
  toggleMoodMode: () => {
    state = { ...state, moodMode: state.moodMode === 'coding' ? 'chill' : 'coding' };
    emitChange();
  },
  setSkinTheme: (skin: SkinTheme) => {
    state = { ...state, skinTheme: skin };
    if (typeof window !== 'undefined') {
      localStorage.setItem('hyx_skin_theme', skin);
      document.documentElement.dataset.skin = skin;
    }
    emitChange();
  },
  setViewMode: (mode: ViewMode) => {
    state = { ...state, viewMode: mode };
    emitChange();
  },
  setCommandOpen: (open: boolean) => {
    state = { ...state, isCommandOpen: open };
    emitChange();
  },
  toggleCommand: () => {
    state = { ...state, isCommandOpen: !state.isCommandOpen };
    emitChange();
  },
  openAiWithPrompt: (prompt?: string, persona?: AgentPersonaMode) => {
    state = {
      ...state,
      aiChatOpen: true,
      aiInitialPrompt: prompt || null,
      agentPersona: persona || state.agentPersona,
    };
    emitChange();
  },
  setAiChatOpen: (open: boolean) => {
    state = { ...state, aiChatOpen: open };
    emitChange();
  },
  clearAiInitialPrompt: () => {
    state = { ...state, aiInitialPrompt: null };
    emitChange();
  },
  setActiveSkillFilter: (skill: string | null) => {
    state = { ...state, activeSkillFilter: skill };
    emitChange();
  },
  setAgentPersona: (persona: AgentPersonaMode) => {
    state = { ...state, agentPersona: persona };
    emitChange();
  },
  focusProjectCard: (code: string | null, tab?: 'overview' | 'architecture') => {
    state = {
      ...state,
      highlightedProjectCode: code,
      projectTabOverride:
        code && tab ? { code, tab, tick: Date.now() } : state.projectTabOverride,
    };
    emitChange();
  },
};

export const useAppStore = (): AppState => {
  const [, setTick] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.skin = state.skinTheme;
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    ...state,
    ...actions,
  };
};
