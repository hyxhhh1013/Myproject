import { useState, useEffect, useRef } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../UI/ThemeToggle';
import { Menu, X, Home, Briefcase, Code, User, Calendar, Camera, Mail, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = () => {
    // 只有在用户主动交互时才显示导航栏
    if (window.scrollY > 50 && !isMobileMenuOpen) {
      setIsVisible(true);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      // Only hide automatically when scrolled down
      inactivityTimer.current = setTimeout(() => {
        setIsVisible(false);
      }, 3000); // Hide after 3 seconds of inactivity
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      
      // Show header when scrolling up, hide when scrolling down quickly
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 10 && currentScrollY > 50) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
      resetInactivityTimer();
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Show header if mouse moves near the top of the screen
      if (e.clientY < 100) {
        setIsVisible(true);
        if (inactivityTimer.current) {
          clearTimeout(inactivityTimer.current);
        }
        // 鼠标移动到顶部时，设置一个定时器，3秒后隐藏导航栏
        inactivityTimer.current = setTimeout(() => {
          if (window.scrollY > 50 && !isMobileMenuOpen) {
            setIsVisible(false);
          }
        }, 3000);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    
    // Initial timer setup - 页面加载时，如果滚动位置大于50，直接隐藏导航栏
    if (window.scrollY > 50 && !isMobileMenuOpen) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [lastScrollY, isMobileMenuOpen]);

  // Keep visible when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsVisible(true);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    } else {
      // 当菜单关闭时，延迟一下再隐藏导航栏，确保菜单关闭动画完成
      setTimeout(() => {
        if (window.scrollY > 50) {
          setIsVisible(false);
        }
      }, 300); // 与菜单关闭动画时间匹配
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    }
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: '首页', to: 'hero', type: 'scroll', icon: Home },
    { name: '项目', to: 'projects', type: 'scroll', icon: Briefcase },
    { name: '技能', to: 'skills', type: 'scroll', icon: Code },
    { name: '关于', to: 'about', type: 'scroll', icon: User },
    { name: '经历', to: 'experience', type: 'scroll', icon: Calendar },
    { name: '摄影', to: 'photos', type: 'scroll', icon: Camera },
    { name: '联系', to: 'contact', type: 'scroll', icon: Mail },
    { name: '日常与兴趣', to: '/interests', type: 'route', icon: Heart },
  ];

  return (
    <header
      className={clsx(
        'fixed top-0 w-full z-50 transition-all duration-500 ease-in-out',
        !isVisible && '-translate-y-full',
        isScrolled
          ? 'bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-primary-700 dark:text-white tracking-tight cursor-pointer">
          {!isHomePage ? (
            <Link to="/#hero" onClick={() => setIsMobileMenuOpen(false)}>
              奕轩.Dev
            </Link>
          ) : (
            <ScrollLink to="hero" smooth={true} duration={500} onClick={() => setIsMobileMenuOpen(false)}>
              奕轩.Dev
            </ScrollLink>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            link.type === 'scroll' ? (
              !isHomePage ? (
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
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 rounded-b-3xl absolute w-full shadow-xl z-40"
          >
            <div className="flex flex-col px-6 py-6 space-y-3">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                return link.type === 'scroll' ? (
                  !isHomePage ? (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Link
                        to={`/#${link.to}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </div>
                        <span className="text-base font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {link.name}
                        </span>
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <ScrollLink
                        to={link.to}
                        smooth={true}
                        duration={500}
                        offset={-70}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </div>
                        <span className="text-base font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {link.name}
                        </span>
                      </ScrollLink>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Link
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                      <span className="text-base font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {link.name}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>奕轩.Dev</span>
                <span>© 2026</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
