import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  Settings
} from 'lucide-react';

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Close sidebar on route change (mobile)
  React.useEffect(() => {
    setIsSidebarOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-gray-900 transition-colors duration-300">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-[#e5e5ea] dark:border-gray-700
        transform transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen md:sticky md:top-0
        lg:w-72
      `}>
        <div className="h-full flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    A
                  </div>
                  管理后台
                </h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <nav className="space-y-1">
                  <AdminNavLink 
                    to="/admin/settings" 
                    current={location.pathname.startsWith('/admin/settings')} 
                    icon={<Settings size={18} />}
                  >
                      设置
                  </AdminNavLink>
                  <AdminNavLink 
                    to="/admin/projects" 
                    current={location.pathname.startsWith('/admin/projects')} 
                    icon={<FolderKanban size={18} />}
                  >
                      项目管理
                  </AdminNavLink>
                  <AdminNavLink 
                    to="/admin/skills" 
                    current={location.pathname.startsWith('/admin/skills')} 
                    icon={<Code size={18} />}
                  >
                      技能管理
                  </AdminNavLink>
                  <AdminNavLink 
                    to="/admin/profile" 
                    current={location.pathname.startsWith('/admin/profile')} 
                    icon={<User size={18} />}
                  >
                      个人信息
                  </AdminNavLink>
                  <AdminNavLink 
                    to="/admin/experience" 
                    current={location.pathname.startsWith('/admin/experience')} 
                    icon={<Briefcase size={18} />}
                  >
                      工作经历
                  </AdminNavLink>
                  <AdminNavLink 
                    to="/admin/photos" 
                    current={location.pathname.startsWith('/admin/photos')} 
                    icon={<Image size={18} />}
                  >
                      摄影作品
                  </AdminNavLink>
                  <AdminNavLink 
                    to="/admin/messages" 
                    current={location.pathname.startsWith('/admin/messages')} 
                    icon={<MessageSquare size={18} />}
                  >
                      留言管理
                  </AdminNavLink>
                  <AdminNavLink 
                    to="/admin/music" 
                    current={location.pathname.startsWith('/admin/music')} 
                    icon={<Music size={18} />}
                  >
                      音乐管理
                  </AdminNavLink>
                  <AdminNavLink 
                    to="/admin/movies" 
                    current={location.pathname.startsWith('/admin/movies')} 
                    icon={<Film size={18} />}
                  >
                      电影管理
                  </AdminNavLink>
                  <AdminNavLink 
                    to="/admin/travel" 
                    current={location.pathname.startsWith('/admin/travel')} 
                    icon={<Map size={18} />}
                  >
                      旅行足迹
                  </AdminNavLink>
                  <AdminNavLink 
                    to="/admin/moments" 
                    current={location.pathname.startsWith('/admin/moments')} 
                    icon={<MessageSquare size={18} />}
                  >
                      动态管理
                  </AdminNavLink>
                  <AdminNavLink 
                    to="/admin/danmaku" 
                    current={location.pathname.startsWith('/admin/danmaku')} 
                    icon={<Sparkles size={18} />}
                  >
                      弹幕管理
                  </AdminNavLink>

              </nav>
            </div>

            {/* User Profile Dropdown (Bottom) - Removed as moved to header */}
            {/* <div className="p-4 border-t border-gray-100 bg-gray-50 md:bg-white relative">...</div> */}
        </div>
      </aside>
      
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Navigation Bar */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-[#e5e5ea] dark:border-gray-700 sticky top-0 z-30 px-4 py-3 md:px-6 flex items-center justify-between">
            <div className="flex flex-col">
                <div className="flex items-center">
                    <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="mr-3 md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Menu size={24} />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {getPageTitle(location.pathname)}
                    </h1>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden md:block">
                    首页 &gt; {getPageTitle(location.pathname)}
                </div>
            </div>
            
            <div className="flex items-center gap-4">
               <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Toggle Dark Mode"
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-gray-300" />
                  )}
               </button>
               <div className="relative">
                   <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors"
                   >
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || '管理员'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">管理员</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm border border-blue-200 dark:border-blue-700">
                        {user?.name?.charAt(0) || 'A'}
                      </div>
                      <ChevronUp size={16} className={`text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                   </button>

                   {isUserMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2">
                        <button 
                          onClick={logout}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut size={16} className="mr-2" />
                          退出登录
                        </button>
                      </div>
                    )}
               </div>
            </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden bg-[#f5f5f7] dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function AdminNavLink({ to, children, current, icon }: { to: string; children: React.ReactNode; current: boolean; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`
        flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
        ${current 
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-100 dark:ring-blue-800' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
        }
      `}
    >
      <span className={`${current ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'} mr-3`}>
        {icon}
      </span>
      {children}
    </Link>
  )
}

function getPageTitle(pathname: string): string {
  if (pathname.includes('/photos')) return '摄影作品管理';
  if (pathname.includes('/projects')) return '项目管理';
  if (pathname.includes('/moments')) return '动态管理';
  if (pathname.includes('/messages')) return '留言管理';
  if (pathname.includes('/danmaku')) return '弹幕管理';
  if (pathname.includes('/music')) return '音乐管理';
  if (pathname.includes('/movies')) return '电影管理';
  if (pathname.includes('/travel')) return '旅行足迹管理';
  if (pathname.includes('/settings')) return '设置';
  if (pathname.includes('/profile')) return '个人信息';
  if (pathname.includes('/skills')) return '技能管理';
  if (pathname.includes('/experience')) return '工作经历';
  return '管理后台';
}
