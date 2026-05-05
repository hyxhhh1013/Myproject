import { create } from 'zustand';

// 定义应用状态接口
interface AppState {
  // 鼠标位置
  mousePosition: { x: number; y: number };
  // 心情模式
  moodMode: 'coding' | 'chill';
  // 音乐播放状态
  isPlaying: boolean;
  // 访客留言
  guestbookEntries: {
    id: string;
    text: string;
    color: string;
    position: { x: number; y: number };
    zIndex: number;
  }[];
  // 点赞数
  likes: number;
  // 搜索状态
  isSearchOpen: boolean;
  searchQuery: string;
  // 方法
  setMousePosition: (position: { x: number; y: number }) => void;
  toggleMoodMode: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  addGuestbookEntry: (entry: Omit<AppState['guestbookEntries'][0], 'id' | 'zIndex'>) => void;
  updateGuestbookEntryPosition: (id: string, position: { x: number; y: number }) => void;
  incrementLikes: () => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
}

// 创建状态管理store
export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  mousePosition: { x: 0, y: 0 },
  moodMode: 'coding',
  isPlaying: false,
  guestbookEntries: [],
  likes: 0,
  isSearchOpen: false,
  searchQuery: '',
  
  // 方法
  setMousePosition: (position) => set({ mousePosition: position }),
  toggleMoodMode: () => set((state) => ({
    moodMode: state.moodMode === 'coding' ? 'chill' : 'coding'
  })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  addGuestbookEntry: (entry) => set((state) => ({
    guestbookEntries: [...state.guestbookEntries, {
      ...entry,
      id: Date.now().toString(),
      zIndex: state.guestbookEntries.length + 1
    }]
  })),
  updateGuestbookEntryPosition: (id, position) => set((state) => ({
    guestbookEntries: state.guestbookEntries.map(entry =>
      entry.id === id ? { ...entry, position } : entry
    )
  })),
  incrementLikes: () => set((state) => ({ likes: state.likes + 1 })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
