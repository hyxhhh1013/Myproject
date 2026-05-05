import { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../UI/ThemeToggle';
import { LanguageToggle } from '../UI/LanguageToggle';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useI18n } from '../../i18n/i18nContext';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('header.home'), to: 'hero', type: 'scroll', key: 'header.home' },
    { name: t('header.projects'), to: 'projects', type: 'scroll', key: 'header.projects' },
    { name: t('header.skills'), to: 'skills', type: 'scroll', key: 'header.skills' },
    { name: t('header.about'), to: 'about', type: 'scroll', key: 'header.about' },
    { name: t('header.experience'), to: '/experience', type: 'route', key: 'header.experience' }, // 修改为路由链接
    { name: t('header.photos'), to: 'photos', type: 'scroll', key: 'header.photos' },
    { name: t('header.contact'), to: 'contact', type: 'scroll', key: 'header.contact' },
    { name: t('header.interests'), to: '/interests', type: 'route', key: 'header.interests' }, // 已开发完成，显示链接
  ];

  return (
    <header
      className={clsx(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-primary-700 dark:text-white tracking-tight cursor-pointer">
            {location.pathname === '/interests' ? (
              <Link to="/#hero">
                {t('header.name')}
              </Link>
            ) : (
              <ScrollLink to="hero" smooth={true} duration={500}>
                {t('header.name')}
              </ScrollLink>
            )}
          </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            link.type === 'scroll' ? (
              location.pathname === '/interests' ? (
                <Link
                  key={link.to}
                  to={`/#${link.to}`}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors"
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
                  activeClass="text-primary-600 dark:text-primary-400 font-semibold"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors"
                >
                  {link.name}
                </ScrollLink>
              )
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors"
              >
                {link.name}
              </Link>
            )
          ))}
          <LanguageToggle />
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-3">
          <LanguageToggle className="hidden sm:flex" />
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 dark:text-gray-300 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/5 dark:bg-dark-surface border-t dark:border-gray-700 absolute w-full shadow-lg">
            <div className="flex flex-col px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                link.type === 'scroll' ? (
                  location.pathname === '/interests' ? (
                    <Link
                      key={link.to}
                      to={`/#${link.to}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <ScrollLink
                      key={link.to}
                      to={link.to}
                      smooth={true}
                      duration={500}
                      offset={-70}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
                    >
                      {link.name}
                    </ScrollLink>
                  )
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
    </header>
  );
};



