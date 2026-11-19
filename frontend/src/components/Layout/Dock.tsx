import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { Home, Briefcase, Code, User, Heart } from 'lucide-react';
import { useI18n } from '../../i18n/i18nContext';
import { useAppStore } from '../../store/useAppStore';

export const Dock: React.FC = () => {
  const location = useLocation();
  const { t, td } = useI18n();
  const { aiChatOpen, isCommandOpen } = useAppStore();

  if (aiChatOpen || isCommandOpen) {
    return null;
  }

  const isHomePage = location.pathname === '/';

  const items = [
    { name: t('header.home'), to: 'hero', route: '/', type: 'scroll', icon: Home },
    { name: t('header.about'), to: 'about', route: '/#about', type: 'scroll', icon: User },
    { name: t('header.skills'), to: 'skills', route: '/#skills', type: 'scroll', icon: Code },
    { name: t('header.projects'), to: 'projects', route: '/#projects', type: 'scroll', icon: Briefcase },
    { name: t('header.interests'), to: '/interests', route: '/interests', type: 'route', icon: Heart },
  ];

  return (
    <nav
      aria-label={td('移动端快捷导航', 'Mobile Quick Navigation')}
      className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#FAF9F5]/95 dark:bg-[#141413]/95 backdrop-blur-xl border designer-hairline rounded-2xl shadow-lg px-2 py-1.5 flex items-center justify-around"
    >
      {items.map((item) => {
        const Icon = item.icon;
        if (item.type === 'scroll' && isHomePage) {
          return (
            <ScrollLink
              key={item.to}
              to={item.to}
              smooth={true}
              duration={500}
              offset={-70}
              spy={true}
              activeClass="text-[#8A6F48] dark:text-[#C9A87C]"
              className="flex flex-col items-center justify-center py-1 px-2 text-[#6E6C66] dark:text-[#9E9C94] hover:text-[#141413] dark:hover:text-[#F0EFEA] cursor-pointer transition-colors"
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.name}</span>
            </ScrollLink>
          );
        }

        const isActive = location.pathname === item.route;
        return (
          <Link
            key={item.to}
            to={item.route}
            className={`flex flex-col items-center justify-center py-1 px-2 transition-colors ${
              isActive
                ? 'text-[#8A6F48] dark:text-[#C9A87C] font-semibold'
                : 'text-[#6E6C66] dark:text-[#9E9C94] hover:text-[#141413] dark:hover:text-[#F0EFEA]'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-medium whitespace-nowrap">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
