import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ListMusic, Disc, X } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import axios from '../../utils/axiosConfig';

// Ensure useMusic imports type if needed, otherwise removed the duplicate interface

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Use relative path or dynamic base URL
  const baseUrl = axios.defaults.baseURL || '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

interface ParsedLyric {
  time: number;
  text: string;
}

const parseLyrics = (lrcString: string): ParsedLyric[] => {
  const lines = lrcString.split('\n');
  const parsedLyrics: ParsedLyric[] = [];
  // Updated regex to support 2 or 3 decimal places for milliseconds
  const timeExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  let hasTimeTags = false;

  lines.forEach(line => {
    // We shouldn't strip all brackets immediately because we might have multiple time tags in one line
    // e.g. [00:15.00][00:16.00] Lyric text
    // Instead, we extract text after tags
    const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
    if (!text && !line.match(timeExp)) return;

    let match;
    const timeExpGlobal = new RegExp(timeExp); // Reset global regex state
    
    while ((match = timeExpGlobal.exec(line)) !== null) {
      hasTimeTags = true;
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      // Handle both 2 and 3 digits for milliseconds
      // If 2 digits (e.g. .23), it's 230ms. If 3 digits (e.g. .234), it's 234ms.
      const millisecondsStr = match[3];
      const milliseconds = parseInt(millisecondsStr, 10) / (millisecondsStr.length === 2 ? 100 : 1000);
      const time = minutes * 60 + seconds + milliseconds;
      if (text) {
        parsedLyrics.push({ time, text });
      }
    }
  });

  if (!hasTimeTags) {
    return lines
      .filter(line => line.trim())
      .map(line => ({
        time: -1,
        text: line.trim()
      }));
  }

  return parsedLyrics.sort((a, b) => a.time - b.time);
};

// Removed local FloatingPlayer components as we'll use a global one
// This file only contains the MusicSection layout and logic now

export const MusicSection = () => {
  const {
    musicList,
    currentMusicIndex,
    currentMusic,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    selectMusic,
    audioError
  } = useMusic();

  const [showPlaylist, setShowPlaylist] = useState(false);
  const [parsedLyrics, setParsedLyrics] = useState<ParsedLyric[]>([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const progressRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const [lyricsContainerHeight, setLyricsContainerHeight] = useState(250); // Default height
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    if (currentMusic?.lyrics) {
      setParsedLyrics(parseLyrics(currentMusic.lyrics));
    } else {
      setParsedLyrics([]);
    }
    setCurrentLyricIndex(-1);
  }, [currentMusic, musicList]);

  // Update lyrics container height on mount and window resize
  useEffect(() => {
    const updateHeight = () => {
      if (lyricsContainerRef.current) {
        setLyricsContainerHeight(lyricsContainerRef.current.clientHeight);
      }
      setIsMobile(window.innerWidth < 768);
    };

    // Initial height update
    updateHeight();

    // Update on window resize
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      seekTo(newTime);
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    handleProgressClick(e);
  };

  useEffect(() => {
    if (!isDragging.current) return;

    const handleMouseMove = () => {
      if (isDragging.current && progressRef.current && duration > 0) {
        // Just update local time while dragging for visual feedback
        // Not calling seekTo to avoid audio stutter
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging.current) {
        isDragging.current = false;
        if (progressRef.current && duration > 0) {
          const rect = progressRef.current.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const percentage = Math.max(0, Math.min(1, clickX / rect.width));
          const newTime = percentage * duration;
          seekTo(newTime);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging.current, duration, currentTime]);

  useEffect(() => {
    const updateCurrentLyricIndex = (time: number) => {
      if (parsedLyrics.length === 0) return;
      
      // Some lyric files might just be raw text without time tags (time = -1)
      if (parsedLyrics[0]?.time === -1) {
        if (duration === 0) return;
        const avgTimePerLine = duration / parsedLyrics.length;
        const index = Math.min(Math.floor(time / avgTimePerLine), parsedLyrics.length - 1);
        if (index !== currentLyricIndex) {
          setCurrentLyricIndex(index);
        }
        return;
      }

      // Normal LRC with time tags
      let newIndex = -1;
      for (let i = 0; i < parsedLyrics.length; i++) {
        // Find the last lyric that has a time less than or equal to current time
        if (time >= parsedLyrics[i].time) {
          newIndex = i;
        } else {
          break;
        }
      }
      
      // Always update state to ensure歌词滚动正常
      if (newIndex !== currentLyricIndex) {
        setCurrentLyricIndex(newIndex);
      }
    };
    
    updateCurrentLyricIndex(currentTime);
  }, [currentTime, parsedLyrics, duration, currentLyricIndex]);

  // We'll let MusicContext handle the audio element.
  const formatTime = (time: number) => {
    if (Number.isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.section
      id="music"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 transition-colors rounded-3xl"
    >
      {/* Global Audio Element moved to Context */}

      {/* Floating Player is now handled by the global floating assistant */}

      <div className="px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">音乐时光</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="relative p-3 md:p-6 lg:p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Disc className={`w-5 h-5 text-blue-500 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                    正在播放
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {musicList.length > 0 ? `${currentMusicIndex + 1} / ${musicList.length}` : '暂无音乐'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    <ListMusic className="w-4 h-4" />
                    歌单
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex flex-col lg:flex-row gap-6 md:gap-12 items-center lg:items-stretch">
                {/* Album Art and Controls */}
                <div className="flex-shrink-0 flex flex-col items-center w-full lg:w-80">
                  <div className="relative w-36 h-36 md:w-48 md:h-48 lg:w-72 lg:h-72">
                    <AnimatePresence mode='wait'>
                      <motion.div
                        key={currentMusic?.id || 'empty'}
                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                        transition={{ duration: 0.4, ease: "backOut" }}
                        className="w-full h-full rounded-2xl shadow-2xl overflow-hidden ring-4 ring-blue-100 dark:ring-blue-900"
                      >
                        {currentMusic && currentMusic.coverUrl ? (
                          <img src={getImageUrl(currentMusic.coverUrl)} alt={currentMusic.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                            <Disc className="w-20 h-20 text-white/50" />
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Song Info */}
                  <div className="mt-3 md:mt-4 text-center px-4 w-full">
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">{currentMusic?.title || '未选择音乐'}</h4>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 truncate text-sm">{currentMusic?.artist || '-'}</p>
                  </div>

                  {/* Controls */}
                  <div className="mt-4 md:mt-8 flex items-center justify-center gap-4 md:gap-6">
                    <button onClick={playPrev} className="p-2 md:p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <SkipBack className="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="p-3 md:p-4 bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6 ml-1" />}
                    </button>
                    <button onClick={playNext} className="p-2 md:p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <SkipForward className="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* Draggable Progress Bar */}
                  <div className="mt-3 md:mt-4 w-full px-2">
                    <div
                      ref={progressRef}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer overflow-visible group"
                      onMouseDown={handleProgressMouseDown}
                    >
                      <div
                        className="h-full bg-blue-500 rounded-full relative transition-all"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity" />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Audio Error Display */}
                  {audioError && (
                    <div className="mt-4 p-3 w-full bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">{audioError}</p>
                    </div>
                  )}
                </div>

                {/* Lyrics */}
                <div className="flex-1 w-full flex flex-col min-h-[250px] md:min-h-[400px]">
                  <div className="bg-gray-50/80 dark:bg-gray-900/40 rounded-3xl flex-1 overflow-hidden relative flex flex-col border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
                    <div className="p-4 pb-2 z-10 bg-gray-50 dark:bg-gray-900/50">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Disc className="w-4 h-4" />
                        歌词
                      </h4>
                    </div>
                    
                    <div ref={lyricsContainerRef} className="flex-1 relative overflow-hidden mt-2">
                      {/* Gradient Masks */}
                      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-50/80 to-transparent dark:from-gray-900/80 z-10 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50/80 to-transparent dark:from-gray-900/80 z-10 pointer-events-none" />

                      {parsedLyrics.length > 0 ? (
                        <div 
                          className="absolute w-full transition-transform duration-700 ease-out"
                          style={{
                            transform: `translateY(${(isMobile ? (lyricsContainerHeight / 2) : (lyricsContainerHeight / 3)) - ((isMobile ? 30 : 36) / 2) - Math.max(0, currentLyricIndex) * (isMobile ? 30 : 36)}px)`
                          }}
                        >
                          {parsedLyrics.map((lyric, index) => (
                            <p
                              key={index}
                              className={`h-[30px] md:h-[36px] flex items-center justify-center text-center px-4 md:px-8 w-full transition-all duration-500 cursor-default ${
                                index === currentLyricIndex
                                  ? 'text-blue-600 dark:text-blue-400 font-bold text-base md:text-lg scale-105 drop-shadow-md'
                                  : index < currentLyricIndex
                                  ? 'text-gray-400 dark:text-gray-500/50 text-xs md:text-sm'
                                  : 'text-gray-600 dark:text-gray-300 text-xs md:text-sm hover:text-gray-800 dark:hover:text-gray-100'
                              }`}
                            >
                              <span className="truncate w-full">{lyric.text}</span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 pb-12 gap-3">
                          <Disc className="w-12 h-12 opacity-20" />
                          <p className="text-sm">暂无歌词</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Playlist Modal */}
              <AnimatePresence>
                {showPlaylist && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowPlaylist(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white">播放列表</h3>
                        <button onClick={() => setShowPlaylist(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {musicList.map((music, index) => (
                          <div
                            key={music.id}
                            onClick={() => selectMusic(index)}
                            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              index === currentMusicIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-600 flex-shrink-0 overflow-hidden">
                              {music.coverUrl && (
                                <img src={getImageUrl(music.coverUrl)} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${index === currentMusicIndex ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                {music.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{music.artist}</p>
                            </div>
                            {index === currentMusicIndex && isPlaying && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
