// 语言切换组件

import { useI18n } from '../../i18n/i18nContext';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`px-3 py-2 rounded-full bg-white/5 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-label="Toggle Language"
      title={language === 'zh' ? '切换到英文' : 'Switch to Chinese'}
    >
      <div className="flex items-center justify-center">
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300 mr-2" />
        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
          {language === 'zh' ? 'EN' : '中文'}
        </span>
      </div>
    </button>
  );
};
