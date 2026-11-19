import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import axios from '../../utils/axiosConfig';
import {
  Menu,
  X,
  LogOut,
  Image,
  FolderKanban,
  MessageSquare,
  ChevronUp,
  Music,
  Film,
  Map,
  User,
  Briefcase,
  Code,
  Sparkles,
  Moon,
  Sun,
  Settings,
  LayoutDashboard,
  ExternalLink,
  Compass,
  PenLine,
} from 'lucide-react';

interface NavGroup {
  code: string;
  label: string;
  items: {
    to: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[];
}

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const location = useLocation();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Fetch unread messages badge count quietly
  useEffect(() => {
    axios
      .get('/api/admin/stats')
      .then((res) => {
        const unread = res.data?.data?.counts?.unreadMessages;
        if (typeof unread === 'number') setUnreadCount(unread);
      })
      .catch(() => {});
  }, [location.pathname]);

  const navGroups: NavGroup[] = [
    {
      code: '00',
      label: '概览 · OVERVIEW',
      items: [
        { to: '/admin/dashboard', label: '数据总览', icon: <LayoutDashboard size={17} /> },
      ],
    },
    {
      code: '01',
      label: '门户核心 · PORTFOLIO',
      items: [
        { to: '/admin/profile', label: '个人信息', icon: <User size={17} /> },
        { to: '/admin/projects', label: '项目管理', icon: <FolderKanban size={17} /> },
        { to: '/admin/experience', label: '工作经历', icon: <Briefcase size={17} /> },
        { to: '/admin/skills', label: '技能管理', icon: <Code size={17} /> },
      ],
    },
    {
      code: '02',
      label: '视觉与花园 · GARDEN',
      items: [
        { to: '/admin/photos', label: '摄影作品', icon: <Image size={17} /> },
        { to: '/admin/moments', label: '日常动态', icon: <PenLine size={17} /> },
        { to: '/admin/music', label: '音乐歌单', icon: <Music size={17} /> },
        { to: '/admin/movies', label: '影单管理', icon: <Film size={17} /> },
        { to: '/admin/travel', label: '旅行足迹', icon: <Map size={17} /> },
      ],
    },
    {
      code: '03',
      label: '互动与系统 · SYSTEM',
      items: [
        {
          to: '/admin/messages',
          label: '访客留言',
          icon: <MessageSquare size={17} />,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { to: '/admin/danmaku', label: '弹幕留言墙', icon: <Sparkles size={17} /> },
        { to: '/admin/settings', label: '系统设置', icon: <Settings size={17} /> },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAF9F5] dark:bg-[#0D0D0C] text-[#141413] dark:text-[#F0EFEA] transition-colors duration-300 font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/45 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Editorial Studio Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#141412] border-r border-[#E6E2D8] dark:border-[#242320]
          transform transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:h-screen md:sticky md:top-0 lg:w-68
        `}
      >
        <div className="h-full flex flex-col">
          {/* Brand Masthead */}
          <div className="px-5 py-5 flex items-center justify-between border-b border-[#E6E2D8] dark:border-[#242320]">
            <Link to="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-[#141413] dark:bg-[#F0EFEA] text-[#FAF9F5] dark:text-[#141413] flex items-center justify-center font-mono text-xs font-bold">
                HYX
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-[#141413] dark:text-[#F0EFEA]">
                  Studio 后台
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E]">
                  EDITORIAL CMS
                </div>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 text-[#6E6A63] hover:bg-[#F3F1EC] dark:hover:bg-[#22211E] rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Grouped Navigation */}
          <div className="px-3 py-4 flex-1 overflow-y-auto space-y-5 [scrollbar-width:thin]">
            {navGroups.map((group) => (
              <div key={group.code}>
                <div className="px-3 mb-1.5 text-[10px] font-mono uppercase tracking-widest text-[#8C877E] dark:text-[#7A766E]">
                  {group.code} // {group.label}
                </div>
                <nav className="space-y-0.5">
                  {group.items.map((item) => (
                    <AdminNavLink
                      key={item.to}
                      to={item.to}
                      current={location.pathname.startsWith(item.to)}
                      icon={item.icon}
                      badge={item.badge}
                    >
                      {item.label}
                    </AdminNavLink>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          {/* Sidebar Bottom Quick Portal Links */}
          <div className="p-3 border-t border-[#E6E2D8] dark:border-[#242320] space-y-1.5">
            <Link
              to="/"
              target="_blank"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-[#524E48] dark:text-[#B5B0A6] hover:bg-[#FAF9F5] dark:hover:bg-[#1E1D1A] border border-transparent hover:border-[#E6E2D8] dark:hover:border-[#2B2A26] transition-all"
            >
              <span>访问门户首页</span>
              <ExternalLink size={13} className="text-[#8A6F48]" />
            </Link>
            <Link
              to="/shutter-island"
              target="_blank"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-[#524E48] dark:text-[#B5B0A6] hover:bg-[#FAF9F5] dark:hover:bg-[#1E1D1A] border border-transparent hover:border-[#E6E2D8] dark:hover:border-[#2B2A26] transition-all"
            >
              <span>3D 光影拾遗岛</span>
              <Compass size={13} className="text-[#8A6F48]" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Frosted Header Bar */}
        <header className="bg-[#FAF9F5]/85 dark:bg-[#0D0D0C]/85 backdrop-blur-md border-b border-[#E6E2D8] dark:border-[#242320] sticky top-0 z-30 px-4 py-3 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-[#524E48] dark:text-[#B5B0A6] hover:bg-[#EFECE4] dark:hover:bg-[#1E1D1A] rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-[#141413] dark:text-[#F0EFEA] truncate">
                {getPageTitle(location.pathname)}
              </h1>
              <div className="text-[11px] font-mono text-[#8C877E] hidden sm:block">
                STUDIO / {getPageTitle(location.pathname)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white dark:bg-[#181816] border border-[#E6E2D8] dark:border-[#2B2A26] hover:border-[#8A6F48] transition-colors"
              aria-label="Toggle Dark Mode"
              title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-[#524E48]" />
              ) : (
                <Sun className="w-4 h-4 text-[#C8A97E]" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 hover:bg-white dark:hover:bg-[#181816] p-1 pr-2.5 rounded-lg border border-transparent hover:border-[#E6E2D8] dark:hover:border-[#2B2A26] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[#141413] dark:bg-[#F0EFEA] text-[#FAF9F5] dark:text-[#141413] flex items-center justify-center font-mono font-bold text-xs">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-semibold text-[#141413] dark:text-[#F0EFEA] leading-none">
                    {user?.name || '管理员'}
                  </p>
                  <p className="text-[10px] font-mono text-[#8C877E] mt-0.5">ADMIN</p>
                </div>
                <ChevronUp
                  size={14}
                  className={`text-[#8C877E] transition-transform ${isUserMenuOpen ? 'rotate-180' : 'rotate-0'}`}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-[#181816] border border-[#E6E2D8] dark:border-[#2B2A26] rounded-xl shadow-lg overflow-hidden py-1 z-50">
                  <Link
                    to="/admin/settings"
                    className="w-full flex items-center px-4 py-2 text-xs text-[#524E48] dark:text-[#C8C3B8] hover:bg-[#FAF9F5] dark:hover:bg-[#22211E]"
                  >
                    <Settings size={14} className="mr-2 text-[#8A6F48]" />
                    账号与系统设置
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <LogOut size={14} className="mr-2" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-studio-scope flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminNavLink({
  to,
  children,
  current,
  icon,
  badge,
}: {
  to: string;
  children: React.ReactNode;
  current: boolean;
  icon: React.ReactNode;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      className={`
        flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150
        ${
          current
            ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F0EFEA] dark:text-[#141413] font-semibold shadow-xs'
            : 'text-[#524E48] dark:text-[#A8A39A] hover:bg-[#FAF9F5] dark:hover:bg-[#1E1D1A] hover:text-[#141413] dark:hover:text-[#F0EFEA]'
        }
      `}
    >
      <span className="flex items-center gap-2.5">
        <span className={current ? 'text-[#C8A97E] dark:text-[#8A6F48]' : 'text-[#8C877E]'}>
          {icon}
        </span>
        <span>{children}</span>
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="px-1.5 py-0.5 rounded-full bg-[#B8542C] text-white text-[10px] font-mono font-bold leading-none">
          {badge}
        </span>
      )}
    </Link>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname.includes('/dashboard')) return '数据总览';
  if (pathname.includes('/photos')) return '摄影作品管理';
  if (pathname.includes('/projects')) return '项目管理';
  if (pathname.includes('/moments')) return '日常动态管理';
  if (pathname.includes('/messages')) return '访客留言管理';
  if (pathname.includes('/danmaku')) return '弹幕留言墙';
  if (pathname.includes('/music')) return '音乐歌单管理';
  if (pathname.includes('/movies')) return '影单管理';
  if (pathname.includes('/travel')) return '旅行足迹管理';
  if (pathname.includes('/settings')) return '系统设置';
  if (pathname.includes('/profile')) return '个人信息';
  if (pathname.includes('/skills')) return '技能管理';
  if (pathname.includes('/experience')) return '工作经历';
  return 'Studio 管理后台';
}
