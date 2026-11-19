import { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../UI/ThemeToggle';
import { LanguageToggle } from '../UI/LanguageToggle';
import {
  Menu,
  X,
  Home,
  Briefcase,
  Code,
  User,
  Calendar,
  Camera,
  Mail,
  Heart,
  Command,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useI18n } from '../../i18n/i18nContext';
import { useAppStore } from '../../store/useAppStore';
import {
  isSfxEnabled,
  toggleSfx,
  subscribeSfx,
  playPaletteWhoosh,
} from '../../utils/soundEffects';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sfxOn, setSfxOn] = useState<boolean>(() => isSfxEnabled());
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();
  const { t, td } = useI18n();
  const { setCommandOpen } = useAppStore();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    return subscribeSfx((enabled) => setSfxOn(enabled));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollProgress(0);
      } else {
        setScrollProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: t('header.home'), to: 'hero', type: 'scroll', icon: Home },
    { name: t('header.about'), to: 'about', type: 'scroll', icon: User },
    { name: t('header.skills'), to: 'skills', type: 'scroll', icon: Code },
    { name: t('header.projects'), to: 'projects', type: 'scroll', icon: Briefcase },
    { name: t('header.experience'), to: 'experience', type: 'scroll', icon: Calendar },
    { name: t('header.photos'), to: 'photos', type: 'scroll', icon: Camera },
    { name: t('header.contact'), to: 'contact', type: 'scroll', icon: Mail },
    { name: t('header.interests'), to: '/interests', type: 'route', icon: Heart },
  ];

  const desktopNavLinks = [
    { name: t('header.projects'), to: 'projects', type: 'scroll', icon: Briefcase },
    { name: t('header.experience'), to: 'experience', type: 'scroll', icon: Calendar },
    { name: t('header.about'), to: 'about', type: 'scroll', icon: User },
    { name: t('header.photos'), to: 'photos', type: 'scroll', icon: Camera },
    { name: t('header.interests'), to: '/interests', type: 'route', icon: Heart },
  ];

  const handleOpenCommand = () => {
    playPaletteWhoosh(true);
    setCommandOpen(true);
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#FAF9F5]/97 dark:bg-[#0D0D0C]/97 backdrop-blur-md border-b designer-hairline transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-4 flex justify-between items-center gap-3 sm:gap-4">
        {/* Brand Wordmark */}
        <div className="text-base sm:text-[17px] font-mono font-semibold tracking-tight designer-text-primary cursor-pointer whitespace-nowrap shrink-0">
          {!isHomePage ? (
            <Link to="/#hero" className="inline-flex items-center gap-2.5 whitespace-nowrap group">
              <span className="w-2 h-2 rounded-full bg-[#8A6F48] dark:bg-[#C8A97E] transition-transform duration-300 group-hover:scale-125" />
              <span>{t('header.name')}</span>
            </Link>
          ) : (
            <ScrollLink
              to="hero"
              smooth={true}
              duration={500}
              className="inline-flex items-center gap-2.5 whitespace-nowrap group"
            >
              <span className="w-2 h-2 rounded-full bg-[#8A6F48] dark:bg-[#C8A97E] transition-transform duration-300 group-hover:scale-125" />
              <span>{t('header.name')}</span>
            </ScrollLink>
          )}
        </div>

        {/* Desktop Nav — Calm, Restrained Editorial Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {desktopNavLinks.map((link) =>
            link.type === 'scroll' ? (
              !isHomePage ? (
                <Link
                  key={link.to}
                  to={`/#${link.to}`}
                  className="text-[13px] font-normal designer-text-secondary hover:designer-text-primary cursor-pointer transition-colors whitespace-nowrap py-1"
                >
                  {link.name}
                </Link>
              ) : (
                <ScrollLink
                  key={link.to}
                  to={link.to}
                  smooth={true}
                  duration={500}
                  spy={true}
                  offset={-70}
                  activeClass="!text-[#141413] dark:!text-[#F2F0EA] !font-medium underline underline-offset-8 decoration-[#8A6F48]"
                  className="text-[13px] font-normal designer-text-secondary hover:designer-text-primary cursor-pointer transition-colors whitespace-nowrap py-1"
                >
                  {link.name}
                </ScrollLink>
              )
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className={clsx(
                  'text-[13px] cursor-pointer transition-colors whitespace-nowrap py-1',
                  location.pathname === link.to
                    ? 'designer-text-primary font-medium underline underline-offset-8 decoration-[#8A6F48]'
                    : 'designer-text-secondary hover:designer-text-primary',
                )}
              >
                {link.name}
              </Link>
            ),
          )}
        </nav>

        {/* Desktop Utility Controls — Borderless, Whisper-Quiet */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          <button
            type="button"
            data-sfx="custom"
            onClick={handleOpenCommand}
            className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-md text-xs font-mono designer-text-secondary hover:designer-text-primary hover:bg-[#141413]/[0.05] dark:hover:bg-white/[0.06] transition-colors whitespace-nowrap shrink-0"
            title={td('打开命令面板 (Ctrl+K / ⌘K)', 'Open Command Palette (Ctrl+K / ⌘K)')}
          >
            <Command className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
            <span className="text-[11px] font-medium">⌘K</span>
          </button>

          <button
            type="button"
            data-sfx="custom"
            onClick={() => toggleSfx()}
            className="w-8 h-8 rounded-md inline-flex items-center justify-center hover:bg-[#141413]/[0.05] dark:hover:bg-white/[0.06] transition-colors shrink-0"
            aria-label={sfxOn ? 'Mute UI Sound Effects' : 'Unmute UI Sound Effects'}
            title={
              sfxOn
                ? td('交互音效已开启（点击静音）', 'Tactile UI Sounds ON (Click to mute)')
                : td('交互音效已静音（点击开启）', 'Tactile UI Sounds OFF (Click to enable)')
            }
          >
            {sfxOn ? (
              <Volume2 className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 designer-text-muted" />
            )}
          </button>

          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Mobile & Tablet Action Bar */}
        <div className="flex lg:hidden items-center gap-1.5 shrink-0">
          <button
            type="button"
            data-sfx="custom"
            onClick={handleOpenCommand}
            className="w-8 h-8 rounded-full designer-pill flex items-center justify-center"
            aria-label="Open Command Palette"
          >
            <Command className="w-3.5 h-3.5 text-[#8A6F48]" />
          </button>
          <button
            type="button"
            data-sfx="custom"
            onClick={() => toggleSfx()}
            className="hidden sm:flex w-8 h-8 rounded-full designer-pill items-center justify-center"
            aria-label={sfxOn ? 'Mute UI Sound Effects' : 'Unmute UI Sound Effects'}
          >
            {sfxOn ? (
              <Volume2 className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 designer-text-muted" />
            )}
          </button>
          <LanguageToggle className="px-2" />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-8 h-8 rounded-full designer-pill flex items-center justify-center designer-text-primary"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Architectural 1.5px Reading Progress Hairline */}
      <div className="w-full h-[1.5px] bg-transparent overflow-hidden">
        <div
          className="h-full bg-[#8A6F48] dark:bg-[#C8A97E] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 top-[57px] bg-black/35 backdrop-blur-[2px] z-30"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="lg:hidden bg-[#FAF9F5] dark:bg-[#121210] border-b designer-hairline absolute w-full max-h-[calc(100dvh-64px)] overflow-y-auto shadow-lg z-40"
            >
              <div className="grid grid-cols-2 gap-2 px-4 py-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return link.type === 'scroll' && isHomePage ? (
                    <ScrollLink
                      key={link.to}
                      to={link.to}
                      smooth={true}
                      duration={500}
                      offset={-64}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#F3F1EC] dark:hover:bg-[#1E1E1B] active:bg-[#EFECE6] dark:active:bg-[#242420] transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full designer-pill flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[#8A6F48]" />
                      </div>
                      <span className="text-sm font-medium designer-text-primary truncate">
                        {link.name}
                      </span>
                    </ScrollLink>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.type === 'scroll' ? `/#${link.to}` : link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#F3F1EC] dark:hover:bg-[#1E1E1B] active:bg-[#EFECE6] dark:active:bg-[#242420] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full designer-pill flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[#8A6F48]" />
                      </div>
                      <span className="text-sm font-medium designer-text-primary truncate">
                        {link.name}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Compact Sound Toggle inside Mobile Menu */}
              <div className="sm:hidden px-4 pb-4 pt-2 border-t designer-hairline flex items-center justify-between">
                <span className="text-xs font-mono designer-text-muted">
                  {td('交互音效 (Tactile SFX)', 'Tactile UI Sounds')}
                </span>
                <button
                  type="button"
                  data-sfx="custom"
                  onClick={() => toggleSfx()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full designer-pill text-xs font-mono designer-text-primary"
                >
                  {sfxOn ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#8A6F48] dark:text-[#C8A97E]" />
                      <span>{td('已开启', 'ON')}</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 designer-text-muted" />
                      <span>{td('已静音', 'OFF')}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
