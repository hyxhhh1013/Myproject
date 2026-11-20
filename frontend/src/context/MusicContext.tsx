import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from '../utils/axiosConfig';
import { getImageUrl } from '../utils/imageUtils';

export interface Music {
  id: number;
  title: string;
  artist: string;
  coverUrl: string;
  url: string;
  lyrics?: string;
  platform?: string;
  description?: string;
  playlistId?: string;
}

export function getQqMusicLink(track: Music | null): string {
  if (!track) return 'https://y.qq.com/';
  const desc = (track.description || '').trim();
  const qqUrlMatch = desc.match(/https?:\/\/(?:i\.)?y\.qq\.com\/[^\s]+/i);
  if (qqUrlMatch?.[0]) {
    return qqUrlMatch[0];
  }
  const keyword = `${track.title || ''} ${track.artist || ''}`.trim();
  return `https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(keyword)}`;
}

export type PlayMode = 'list' | 'single' | 'shuffle';

interface MusicContextType {
  musicList: Music[];
  currentMusicIndex: number;
  currentMusic: Music | null;
  isPlaying: boolean;
  hasActivated: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playMode: PlayMode;
  isSynthFallback: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seekTo: (time: number) => void;
  selectMusic: (index: number) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setPlayMode: (mode: PlayMode) => void;
  cyclePlayMode: () => void;
  audioError: string | null;
}

const DEFAULT_MUSIC_LIST: Music[] = [
  {
    id: 1,
    title: '如果呢',
    artist: '郑润泽',
    coverUrl: 'https://picsum.photos/seed/vinyl-track-01/400/400',
    url: '',
  },
  {
    id: 2,
    title: 'Midnight City (Lofi Synth)',
    artist: 'M83 · Chill Session',
    coverUrl: 'https://picsum.photos/seed/vinyl-track-02/400/400',
    url: '',
  },
  {
    id: 3,
    title: '晴天 (Acoustic Lofi)',
    artist: '周杰伦',
    coverUrl: 'https://picsum.photos/seed/vinyl-track-03/400/400',
    url: '',
  },
];

const SYNTH_DURATION = 165; // 2:45
const STORAGE_VOLUME_KEY = 'hyx_music_volume';
const STORAGE_MODE_KEY = 'hyx_music_mode';

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [musicList, setMusicList] = useState<Music[]>(DEFAULT_MUSIC_LIST);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(SYNTH_DURATION);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [useSynthFallback, setUseSynthFallback] = useState(false);

  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VOLUME_KEY);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return 0.8;
  });

  const [isMuted, setIsMuted] = useState(false);

  const [playMode, setPlayModeState] = useState<PlayMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MODE_KEY) as PlayMode | null;
      if (saved === 'list' || saved === 'single' || saved === 'shuffle') return saved;
    } catch {
      // ignore storage errors
    }
    return 'list';
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<number | null>(null);
  const chordStepRef = useRef<number>(0);
  const effectiveVolumeRef = useRef<number>(isMuted ? 0 : volume);

  useEffect(() => {
    effectiveVolumeRef.current = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (clamped > 0) {
      setIsMuted(false);
    }
    try {
      localStorage.setItem(STORAGE_VOLUME_KEY, String(clamped));
    } catch {
      // ignore
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const setPlayMode = useCallback((mode: PlayMode) => {
    setPlayModeState(mode);
    try {
      localStorage.setItem(STORAGE_MODE_KEY, mode);
    } catch {
      // ignore
    }
  }, []);

  const cyclePlayMode = useCallback(() => {
    setPlayModeState((prev) => {
      const next: PlayMode = prev === 'list' ? 'single' : prev === 'single' ? 'shuffle' : 'list';
      try {
        localStorage.setItem(STORAGE_MODE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await axios.get('/api/music');
        const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        // /api/music returns hidden songs too (the admin lists from the same
        // endpoint), so the public player must drop what the admin hid.
        const visible = Array.isArray(data)
          ? data.filter((m: { isVisible?: boolean }) => m?.isVisible !== false)
          : [];
        if (visible.length > 0) {
          setMusicList(visible);
        }
      } catch {
        // Keep DEFAULT_MUSIC_LIST fallback
      }
    };
    fetchMusic();
  }, []);

  const currentMusic = musicList[currentMusicIndex] || DEFAULT_MUSIC_LIST[0] || null;

  const resolvedAudioUrl = React.useMemo(() => {
    const raw = currentMusic?.url?.trim();
    if (!raw || raw === '#') return '';
    if (raw.startsWith('http')) {
      return raw.replace('http://music.163.com', 'https://music.163.com');
    }
    return `${axios.defaults.baseURL || ''}${raw.startsWith('/') ? '' : '/'}${raw}`;
  }, [currentMusic]);

  // WebAudio Lofi Electric Piano chord generator when no external MP3 URL is configured
  const playLofiChordStep = useCallback((songIdx: number) => {
    try {
      const gainScale = effectiveVolumeRef.current;
      if (gainScale <= 0.001) return;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!synthCtxRef.current) {
        synthCtxRef.current = new AudioCtx();
      }
      const ctx = synthCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Warm 7th chords (Fmaj7 - Em7 - Dm7 - Cmaj7)
      const progressions = [
        [
          [174.61, 220.0, 261.63, 329.63], // Fmaj7
          [164.81, 196.0, 246.94, 293.66], // Em7
          [146.83, 174.61, 220.0, 261.63], // Dm7
          [130.81, 164.81, 196.0, 246.94], // Cmaj7
        ],
        [
          [220.0, 261.63, 329.63, 392.0], // Am7
          [174.61, 220.0, 261.63, 329.63], // Fmaj7
          [130.81, 164.81, 196.0, 261.63], // C
          [196.0, 246.94, 329.66, 349.23], // G7
        ],
      ];

      const progression = progressions[songIdx % progressions.length];
      const chord = progression[chordStepRef.current % progression.length];
      chordStepRef.current += 1;

      const now = ctx.currentTime;
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const peak = Math.max(0.0002, (0.028 * gainScale) / (idx + 1));
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(peak, now + 0.08 + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.03);
        osc.stop(now + 2.3);
      });
    } catch {
      // Ignore WebAudio restrictions if not yet interacted
    }
  }, []);

  const stopSynthLoop = useCallback(() => {
    if (synthTimerRef.current) {
      window.clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
  }, []);

  // Determine whether we should use WebAudio Lofi synth fallback
  useEffect(() => {
    if (!resolvedAudioUrl) {
      setUseSynthFallback(true);
      setDuration(SYNTH_DURATION);
      setAudioError(null);
    } else {
      setUseSynthFallback(false);
    }
  }, [resolvedAudioUrl, currentMusicIndex]);

  const pickShuffleIndex = useCallback(
    (excludeIdx: number) => {
      if (musicList.length <= 1) return 0;
      let next = excludeIdx;
      while (next === excludeIdx) {
        next = Math.floor(Math.random() * musicList.length);
      }
      return next;
    },
    [musicList.length],
  );

  const playNext = useCallback(() => {
    if (musicList.length === 0) return;
    setHasActivated(true);
    setCurrentMusicIndex((prev) =>
      playMode === 'shuffle' ? pickShuffleIndex(prev) : (prev + 1) % musicList.length,
    );
    setCurrentTime(0);
    setIsPlaying(true);
  }, [musicList.length, playMode, pickShuffleIndex]);

  const playPrev = useCallback(() => {
    if (musicList.length === 0) return;
    setHasActivated(true);
    setCurrentMusicIndex((prev) =>
      playMode === 'shuffle'
        ? pickShuffleIndex(prev)
        : (prev - 1 + musicList.length) % musicList.length,
    );
    setCurrentTime(0);
    setIsPlaying(true);
  }, [musicList.length, playMode, pickShuffleIndex]);

  const handleTrackEnded = useCallback(() => {
    if (playMode === 'single') {
      setCurrentTime(0);
      if (!useSynthFallback && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
    } else {
      playNext();
    }
  }, [playMode, playNext, useSynthFallback]);

  // Manage synth fallback timer when playing without an external audio file
  useEffect(() => {
    stopSynthLoop();
    if (isPlaying && useSynthFallback) {
      playLofiChordStep(currentMusicIndex);
      let tickCount = 0;
      synthTimerRef.current = window.setInterval(() => {
        tickCount += 1;
        if (tickCount % 2 === 0) {
          playLofiChordStep(currentMusicIndex);
        }
        setCurrentTime((prev) => {
          if (prev + 1 >= SYNTH_DURATION) {
            handleTrackEnded();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => stopSynthLoop();
  }, [isPlaying, useSynthFallback, currentMusicIndex, playLofiChordStep, stopSynthLoop, handleTrackEnded]);

  // Manage real <audio> element when a valid audio URL is present
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || useSynthFallback) return;

    setAudioError(null);
    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;

    const handlePlay = () => {
      setIsPlaying(true);
      setAudioError(null);
    };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (!Number.isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
      if (!Number.isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const handleLoadedMetadata = () => {
      if (!Number.isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        setAudioError(null);
      }
    };
    const handleEnded = () => handleTrackEnded();
    const handleError = () => {
      // Seamlessly switch to Lofi Synth fallback instead of failing or spamming console errors
      setUseSynthFallback(true);
      setDuration(SYNTH_DURATION);
      setAudioError(null);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentMusicIndex, useSynthFallback, handleTrackEnded, isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || useSynthFallback || !resolvedAudioUrl) return;

    if (isPlaying) {
      audio.play().catch(() => {
        setUseSynthFallback(true);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, resolvedAudioUrl, useSynthFallback]);

  const togglePlay = useCallback(() => {
    setHasActivated(true);
    setIsPlaying((prev) => !prev);
  }, []);

  const seekTo = useCallback(
    (time: number) => {
      const maxDur = duration || SYNTH_DURATION;
      const clamped = Math.max(0, Math.min(maxDur, time));
      setCurrentTime(clamped);
      if (!useSynthFallback && audioRef.current) {
        audioRef.current.currentTime = clamped;
      }
    },
    [duration, useSynthFallback],
  );

  const selectMusic = useCallback((index: number) => {
    setHasActivated(true);
    setCurrentMusicIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  // Browser Media Session API integration (system media keys + lockscreen / OS media card)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !currentMusic) {
      return;
    }

    try {
      const artworkUrl = currentMusic.coverUrl ? getImageUrl(currentMusic.coverUrl) : '';
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentMusic.title || 'Untitled Track',
        artist: currentMusic.artist || 'Yixuan.Dev Session',
        album: 'HYX-LP01 · Vinyl & Coding Soundtrack',
        artwork: artworkUrl
          ? [{ src: artworkUrl, sizes: '400x400', type: 'image/jpeg' }]
          : [],
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {
      // Ignore browsers with partial MediaSession support
    }
  }, [currentMusic, isPlaying]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const safeSetHandler = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null,
    ) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Unsupported action
      }
    };

    safeSetHandler('play', () => {
      setHasActivated(true);
      setIsPlaying(true);
    });
    safeSetHandler('pause', () => setIsPlaying(false));
    safeSetHandler('previoustrack', () => playPrev());
    safeSetHandler('nexttrack', () => playNext());
    safeSetHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number') {
        seekTo(details.seekTime);
      }
    });

    return () => {
      safeSetHandler('play', null);
      safeSetHandler('pause', null);
      safeSetHandler('previoustrack', null);
      safeSetHandler('nexttrack', null);
      safeSetHandler('seekto', null);
    };
  }, [playNext, playPrev, seekTo]);

  useEffect(() => {
    if (
      typeof navigator === 'undefined' ||
      !('mediaSession' in navigator) ||
      typeof navigator.mediaSession.setPositionState !== 'function'
    ) {
      return;
    }
    if (!duration || !isFinite(duration) || duration <= 0) return;

    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: Math.max(0, Math.min(duration, currentTime)),
      });
    } catch {
      // Ignore invalid position state errors
    }
  }, [currentTime, duration]);

  return (
    <MusicContext.Provider
      value={{
        musicList,
        currentMusicIndex,
        currentMusic,
        isPlaying,
        hasActivated,
        currentTime,
        duration,
        volume,
        isMuted,
        playMode,
        isSynthFallback: useSynthFallback,
        audioRef,
        togglePlay,
        playNext,
        playPrev,
        seekTo,
        selectMusic,
        setCurrentTime,
        setVolume,
        toggleMute,
        setPlayMode,
        cyclePlayMode,
        audioError,
      }}
    >
      {children}
      {/* Only mount src when resolvedAudioUrl is non-empty so browser never throws MediaError on empty src="" */}
      <audio
        ref={audioRef}
        src={!useSynthFallback && resolvedAudioUrl ? resolvedAudioUrl : undefined}
        preload="none"
      />
    </MusicContext.Provider>
  );
};
