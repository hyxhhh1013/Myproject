import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await axios.get('/api/music');
        const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        setMusicList(data);
      } catch (error) {
        console.error('Failed to fetch music:', error);
        setMusicList([]);
      }
    };
    fetchMusic();
  }, []);

  const currentMusic = musicList[currentMusicIndex] || null;

  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 清除之前的错误
    setAudioError(null);

    // 添加 play 事件监听，确保 isPlaying 状态与实际音频状态同步
    const handlePlay = () => {
      setIsPlaying(true);
      setAudioError(null); // 播放成功时清除错误
    };
    const handlePause = () => setIsPlaying(false);

    const handleTimeUpdate = () => {
      // 检查 isNaN 避免因为 duration 未加载完成时出现错误
      if (!Number.isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
        setAudioError(null); // 正常播放时清除错误
      }
      // If duration is not set but we have a valid audio.duration, update it.
      // This catches cases where loadedmetadata fired but duration was NaN initially.
      if (!Number.isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleLoadedMetadata = () => {
      if (!Number.isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setAudioError(null); // 加载元数据成功时清除错误
      }
    };
    const handleEnded = () => playNext();
    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      if (!target.error) return; // 确保有错误对象
      
      // 忽略常见的非致命错误
      const errorCode = target.error.code;
      if (errorCode === target.error.MEDIA_ERR_ABORTED || errorCode === target.error.MEDIA_ERR_NETWORK) {
        console.warn('Audio error (non-fatal):', target.error);
        return;
      }
      
      // 检查是否真的无法播放
      if (isPlaying && audio.currentTime > 0) {
        // 如果已经在播放，忽略错误
        console.warn('Audio error during playback (ignored):', target.error);
        return;
      }
      
      if (target.error) {
        console.error('Audio error:', target.error);
        setAudioError(`音频加载失败 (错误码: ${target.error.code})`);
      } else {
        console.error('Audio error: No error object available');
        setAudioError('音频加载失败');
      }
      setIsPlaying(false);
    };
    const handleCanPlay = () => {
      if (!Number.isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setAudioError(null); // 可以播放时清除错误
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('durationchange', handleLoadedMetadata); // Added durationchange
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('durationchange', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    }
  }, [currentMusicIndex, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentMusic?.url) {
      // 清除之前的错误
      setAudioError(null);
      
      if (isPlaying) {
        audio.play().catch(() => {
          // 很多浏览器会因为未交互而拒绝自动播放，如果报错则停止播放状态
          setIsPlaying(false);
        });
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, currentMusicIndex, currentMusic]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playNext = () => {
    if (musicList.length > 0) {
      setCurrentMusicIndex((prev) => (prev + 1) % musicList.length);
      setIsPlaying(true);
    }
  };

  const playPrev = () => {
    if (musicList.length > 0) {
      setCurrentMusicIndex((prev) => (prev - 1 + musicList.length) % musicList.length);
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const selectMusic = (index: number) => {
    setCurrentMusicIndex(index);
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
      {/* Global Audio Element */}
      <audio
        ref={audioRef}
        src={
          currentMusic?.url 
            ? currentMusic.url.startsWith('http') 
              ? currentMusic.url.replace('http://music.163.com', 'https://music.163.com')
              : `${axios.defaults.baseURL || ''}${currentMusic.url.startsWith('/') ? '' : '/'}${currentMusic.url}`
            : ''
        }
        preload="auto"
      />
    </MusicContext.Provider>
  );
};