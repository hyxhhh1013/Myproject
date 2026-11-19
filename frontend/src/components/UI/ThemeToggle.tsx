import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { playToggleSwitch } from '../../utils/soundEffects';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    playToggleSwitch(theme === 'light');
    toggleTheme();
  };

  return (
    <button
      type="button"
      data-sfx="custom"
      onClick={handleToggle}
      className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors hover:bg-[#141413]/[0.05] dark:hover:bg-white/[0.06] group"
      aria-label="Toggle Dark Mode"
      title={theme === 'light' ? '切换深色模式 (Dark Mode)' : '切换浅色模式 (Light Mode)'}
    >
      {theme === 'light' ? (
        <Moon className="w-3.5 h-3.5 text-[#141413] group-hover:text-[#8A6F48] transition-transform duration-300 group-hover:-rotate-12" />
      ) : (
        <Sun className="w-3.5 h-3.5 text-[#C8A97E] group-hover:text-[#F2F0EA] transition-transform duration-300 group-hover:rotate-45" />
      )}
    </button>
  );
};
