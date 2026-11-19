import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from '../utils/axiosConfig';

export interface Music {
  id: number;
  title: string;
  artist: string;
  coverUrl: string;
  url: string;
  lyrics?: string;
}

interface MusicContextType {
  musicList: Music[];
  currentMusicIndex: number;
  currentMusic: Music | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seekTo: (time: number) => void;
  selectMusic: (index: number) => void;
  setCurrentTime: (time: number) => void;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(SYNTH_DURATION);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [useSynthFallback, setUseSynthFallback] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<number | null>(null);
  const chordStepRef = useRef<number>(0);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await axios.get('/api/music');
        const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        if (Array.isArray(data) && data.length > 0) {
          setMusicList(data);
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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
          [220.0, 261.63, 329.63, 392.0],  // Am7
          [174.61, 220.0, 261.63, 329.63], // Fmaj7
          [130.81, 164.81, 196.0, 261.63], // C
          [196.0, 246.94, 293.66, 349.23], // G7
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

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.025 / (idx + 1), now + 0.08 + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 2.2);

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

  const playNext = useCallback(() => {
    if (musicList.length > 0) {
      setCurrentMusicIndex((prev) => (prev + 1) % musicList.length);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  }, [musicList.length]);

  const playPrev = useCallback(() => {
    if (musicList.length > 0) {
      setCurrentMusicIndex((prev) => (prev - 1 + musicList.length) % musicList.length);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  }, [musicList.length]);

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
            playNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => stopSynthLoop();
  }, [isPlaying, useSynthFallback, currentMusicIndex, playLofiChordStep, stopSynthLoop, playNext]);

  // Manage real <audio> element when a valid audio URL is present
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || useSynthFallback) return;

    setAudioError(null);

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
    const handleEnded = () => playNext();
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
  }, [currentMusicIndex, useSynthFallback, playNext]);

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

  const togglePlay = () => setIsPlaying((prev) => !prev);

  const seekTo = (time: number) => {
    const clamped = Math.max(0, Math.min(duration || SYNTH_DURATION, time));
    setCurrentTime(clamped);
    if (!useSynthFallback && audioRef.current) {
      audioRef.current.currentTime = clamped;
    }
  };

  const selectMusic = (index: number) => {
    setCurrentMusicIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <MusicContext.Provider
      value={{
        musicList,
        currentMusicIndex,
        currentMusic,
        isPlaying,
        currentTime,
        duration,
        audioRef,
        togglePlay,
        playNext,
        playPrev,
        seekTo,
        selectMusic,
        setCurrentTime,
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
