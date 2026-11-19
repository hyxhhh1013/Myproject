import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { useMusic } from '../../context/MusicContext';
import { Disc } from 'lucide-react';

interface NowComponentProps {
  status?: string;
  statusEn?: string;
  isBusy?: boolean;
  listeningTo?: string;
}

const TRACK_TITLE_EN_MAP: Record<string, string> = {
  '如果呢': 'What If (Ru Guo Ne)',
  '于是': 'And So (Yu Shi)',
  '锁': 'Locked (Suo)',
  '罗生门（Follow）': 'Rashomon (Follow)',
  '一直很安静': 'Always Quiet',
  '形容': 'Describe (Xing Rong)',
  '富士山下': 'Under Mount Fuji',
};

export const NowComponent: React.FC<NowComponentProps> = ({
  status = '正在探索 AI Agent 工作流、RAG 工程化落地与克制的设计美学...',
  statusEn = 'Building AI Agent workflows, production RAG systems & tactile web interfaces...',
  isBusy = false,
  listeningTo = 'Chill Lofi',
}) => {
  const { language } = useI18n();
  const { currentMusic, isPlaying, togglePlay } = useMusic();

  const targetText = language === 'en' ? statusEn : status;
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [targetText]);

  useEffect(() => {
    if (currentIndex < targetText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + targetText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 36);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, targetText]);

  const rawTitle = currentMusic?.title || '';
  const badgeLabel = rawTitle
    ? language === 'en'
      ? TRACK_TITLE_EN_MAP[rawTitle] || rawTitle
      : rawTitle
    : listeningTo;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 w-full">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isBusy ? 'bg-[#B45309]' : 'bg-[#2E6F4E]'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isBusy ? 'bg-[#B45309]' : 'bg-[#2E6F4E]'
            }`}
          />
        </span>
        <div className="text-xs sm:text-sm text-[#5F5E58] dark:text-[#A09E96] font-normal line-clamp-2 sm:truncate">
          {displayedText}
          <span className="inline-block w-1 h-3.5 ml-0.5 bg-[#8A6F48] animate-pulse align-middle" />
        </div>
      </div>

      <button
        type="button"
        onClick={togglePlay}
        className="text-[11px] font-mono bg-[#F3F1EC] hover:bg-[#EAE6DD] dark:bg-[#22221F] dark:hover:bg-[#2C2C28] text-[#4A4943] dark:text-[#C8C5BC] px-2.5 py-1 rounded-full border border-[#E4E0D6] dark:border-[#33322E] transition-colors shrink-0 flex items-center gap-1.5"
        title={language === 'en' ? 'Click to Play / Pause Lofi' : '点击播放 / 暂停背景音乐'}
      >
        <Disc className={`w-3 h-3 text-[#8A6F48] ${isPlaying ? 'animate-spin' : ''}`} />
        <span>{isPlaying ? 'PLAYING · ' : ''}{badgeLabel}</span>
      </button>
    </div>
  );
};
