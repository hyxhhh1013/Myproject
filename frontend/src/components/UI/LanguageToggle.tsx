import React from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { Globe } from 'lucide-react';
import { playToggleSwitch } from '../../utils/soundEffects';

interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    playToggleSwitch(language === 'zh');
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <button
      type="button"
      data-sfx="custom"
      onClick={toggleLanguage}
      className={`h-8 inline-flex items-center justify-center gap-1.5 px-2.5 rounded-md text-xs transition-colors hover:bg-[#141413]/[0.05] dark:hover:bg-white/[0.06] whitespace-nowrap shrink-0 group ${className}`}
      aria-label={language === 'zh' ? 'Switch to English' : '切换到中文'}
      title={language === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <Globe className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E] shrink-0 transition-transform duration-300 group-hover:rotate-12" />
      <span className="text-[11px] font-mono font-medium designer-text-secondary group-hover:designer-text-primary whitespace-nowrap">
        {language === 'zh' ? 'EN' : '中文'}
      </span>
    </button>
  );
};
