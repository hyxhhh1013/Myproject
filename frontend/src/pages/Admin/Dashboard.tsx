import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import {
  Eye,
  MessageSquare,
  Image,
  FolderKanban,
  Sparkles,
  Music,
  Film,
  Map,
  ArrowUpRight,
  RefreshCw,
  Server,
  Compass,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AdminStats {
  counts: {
    views: number;
    photos: number;
    projects: number;
    experiences: number;
    skills: number;
    messages: number;
    unreadMessages: number;
    danmaku: number;
    moments: number;
    music: number;
    movies: number;
    travelCities: number;
  };
  siteTitle: string;
  recentMessages: {
    id: number;
    name: string;
    email: string;
    subject: string;
    content: string;
    isRead: boolean;
    createdAt: string;
  }[];
  recentDanmaku: {
    id: number;
    content: string;
    color: string;
    isVisible: boolean;
    createdAt: string;
  }[];
  server: {
    uptimeSeconds: number;
    nodeVersion: string;
    memoryMB: number;
    timestamp: string;
  };
}

const formatUptime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${seconds % 60}s`;
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/admin/stats');
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch {
      setError('无法连接到后端统计接口，请确认后端服务已启动。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const kpiCards = [
    {
      label: '全站总访问量',
      code: 'VIEWS',
      value: stats?.counts.views ?? '—',
      sub: 'Site Visits',
      icon: <Eye className="w-4 h-4 text-[#8A6F48]" />,
      to: '/admin/settings',
    },
    {
      label: '未读 / 全部留言',
      code: 'INBOX',
      value: stats ? `${stats.counts.unreadMessages} / ${stats.counts.messages}` : '—',
      sub: stats && stats.counts.unreadMessages > 0 ? '有待处理访客留言' : '全部已读',
      highlight: (stats?.counts.unreadMessages ?? 0) > 0,
      icon: <MessageSquare className="w-4 h-4 text-[#8A6F48]" />,
      to: '/admin/messages',
    },
    {
      label: '摄影画廊作品',
      code: 'PHOTOS',
      value: stats?.counts.photos ?? '—',
      sub: '同步展示于首页 & 3D 摄影岛',
      icon: <Image className="w-4 h-4 text-[#8A6F48]" />,
      to: '/admin/photos',
    },
    {
      label: '项目与工程档案',
      code: 'PROJECTS',
      value: stats?.counts.projects ?? '—',
      sub: `${stats?.counts.experiences ?? 0} 段经历 · ${stats?.counts.skills ?? 0} 项技能`,
      icon: <FolderKanban className="w-4 h-4 text-[#8A6F48]" />,
      to: '/admin/projects',
    },
    {
      label: '弹幕留言墙',
      code: 'DANMAKU',
      value: stats?.counts.danmaku ?? '—',
      sub: `${stats?.counts.moments ?? 0} 条日常动态`,
      icon: <Sparkles className="w-4 h-4 text-[#8A6F48]" />,
      to: '/admin/danmaku',
    },
    {
      label: '数字花园馆藏',
      code: 'GARDEN',
      value: stats
        ? stats.counts.music + stats.counts.movies + stats.counts.travelCities
        : '—',
      sub: `${stats?.counts.music ?? 0} 曲 · ${stats?.counts.movies ?? 0} 影 · ${stats?.counts.travelCities ?? 0} 城`,
      icon: <Map className="w-4 h-4 text-[#8A6F48]" />,
      to: '/admin/travel',
    },
  ];

  const quickActions = [
    { label: '上传摄影作品', to: '/admin/photos', icon: <Image className="w-4 h-4" /> },
    { label: '发布新项目', to: '/admin/projects', icon: <Plus className="w-4 h-4" /> },
    { label: '管理音乐歌单', to: '/admin/music', icon: <Music className="w-4 h-4" /> },
    { label: '更新影单档案', to: '/admin/movies', icon: <Film className="w-4 h-4" /> },
    { label: '进入 3D 摄影岛', to: '/shutter-island', icon: <Compass className="w-4 h-4" />, external: true },
    { label: '预览前台首页', to: '/', icon: <ArrowUpRight className="w-4 h-4" />, external: true },
  ];

  return (
    <div className="space-y-8">
      {/* Top Editorial Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E6E2D8] dark:border-[#262522]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#8A6F48] dark:text-[#C8A97E] mb-1.5">
            00 // STUDIO COMMAND OVERVIEW
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#141413] dark:text-[#F0EFEA]">
            工作台总览
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6A63] dark:text-[#9E9A92] mt-1">
            一屏掌握全站内容资产、访客互动与后端运行状态。
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141413] dark:bg-[#F0EFEA] text-[#FAF9F5] dark:text-[#141413] text-xs font-mono font-medium hover:opacity-90 transition-opacity disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? '同步中...' : '刷新实时数据'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-mono flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 6 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <Link
            key={card.code}
            to={card.to}
            className="group p-5 rounded-2xl bg-white dark:bg-[#161614] border border-[#E6E2D8] dark:border-[#262522] hover:border-[#8A6F48] dark:hover:border-[#C8A97E] transition-all flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C877E]">
                {card.code}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border border-[#E6E2D8] dark:border-[#2C2B27] flex items-center justify-center group-hover:scale-105 transition-transform">
                {card.icon}
              </div>
            </div>

            <div className="my-4">
              <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#141413] dark:text-[#F0EFEA] tracking-tight">
                {card.value}
              </div>
              <div className="text-xs font-medium text-[#524E48] dark:text-[#B5B0A6] mt-1">
                {card.label}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0ECE2] dark:border-[#22211E] flex items-center justify-between text-[11px] font-mono">
              <span
                className={
                  card.highlight
                    ? 'text-[#B8542C] dark:text-amber-400 font-semibold'
                    : 'text-[#8C877E]'
                }
              >
                {card.sub}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#8C877E] group-hover:text-[#8A6F48] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions Strip */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#161614] border border-[#E6E2D8] dark:border-[#262522]">
        <div className="text-[11px] font-mono uppercase tracking-widest text-[#8C877E] mb-3.5">
          QUICK DISPATCH // 快捷发布与预览
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {quickActions.map((act) => (
            <Link
              key={act.label}
              to={act.to}
              target={act.external ? '_blank' : undefined}
              className="px-3.5 py-3 rounded-xl bg-[#FAF9F5] dark:bg-[#1C1B18] hover:bg-[#141413] hover:text-[#FAF9F5] dark:hover:bg-[#F0EFEA] dark:hover:text-[#141413] border border-[#E6E2D8] dark:border-[#2B2A26] text-xs font-medium text-[#141413] dark:text-[#E6E2D8] flex items-center gap-2 transition-colors"
            >
              {act.icon}
              <span className="truncate">{act.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom 2-Column Live Feed: Recent Messages & Recent Danmaku */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Recent Visitor Messages */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#161614] border border-[#E6E2D8] dark:border-[#262522]">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E6E2D8] dark:border-[#262522]">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A6F48] dark:text-[#C8A97E]">
                RECENT INBOX
              </div>
              <h3 className="text-base font-semibold text-[#141413] dark:text-[#F0EFEA] mt-0.5">
                最新访客留言
              </h3>
            </div>
            <Link
              to="/admin/messages"
              className="text-xs font-mono text-[#8A6F48] dark:text-[#C8A97E] hover:underline flex items-center gap-1"
            >
              <span>全部管理</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!stats || stats.recentMessages.length === 0 ? (
            <div className="py-10 text-center text-xs font-mono text-[#8C877E]">
              暂无访客留言记录
            </div>
          ) : (
            <div className="divide-y divide-[#F0ECE2] dark:divide-[#22211E]">
              {stats.recentMessages.map((msg) => (
                <div key={msg.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!msg.isRead ? (
                        <span className="w-2 h-2 rounded-full bg-[#B8542C] shrink-0" title="未读" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600/80 shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-[#141413] dark:text-[#F0EFEA] truncate">
                        {msg.subject || '无主题留言'}
                      </span>
                      <span className="text-[11px] font-mono text-[#8C877E] shrink-0">
                        · {msg.name}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E6A63] dark:text-[#9E9A92] mt-1 line-clamp-1">
                      {msg.content}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#8C877E] shrink-0">
                    {new Date(msg.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Recent Danmaku + Server Telemetry */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161614] border border-[#E6E2D8] dark:border-[#262522] flex-1">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E6E2D8] dark:border-[#262522]">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A6F48] dark:text-[#C8A97E]">
                  DANMAKU STREAM
                </div>
                <h3 className="text-base font-semibold text-[#141413] dark:text-[#F0EFEA] mt-0.5">
                  最新弹幕便签
                </h3>
              </div>
              <Link
                to="/admin/danmaku"
                className="text-xs font-mono text-[#8A6F48] dark:text-[#C8A97E] hover:underline flex items-center gap-1"
              >
                <span>审核管理</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {!stats || stats.recentDanmaku.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#8C877E]">暂无弹幕数据</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.recentDanmaku.map((d) => (
                  <span
                    key={d.id}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono border ${
                      d.isVisible
                        ? 'bg-[#FAF9F5] dark:bg-[#1E1D1A] text-[#141413] dark:text-[#E6E2D8] border-[#E6E2D8] dark:border-[#2C2B27]'
                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-200 line-through opacity-70'
                    }`}
                  >
                    {d.content}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Server Telemetry Footer Card */}
          <div className="p-5 rounded-2xl bg-[#141413] text-[#FAF9F5] border border-[#2C2B27] font-mono text-xs space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-[#C8A97E]">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                BACKEND TELEMETRY
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px]">
              <div>
                <div className="text-neutral-400 text-[10px]">RUNTIME</div>
                <div className="mt-0.5 font-semibold">{stats?.server.nodeVersion || 'Node.js'}</div>
              </div>
              <div>
                <div className="text-neutral-400 text-[10px]">MEMORY</div>
                <div className="mt-0.5 font-semibold">{stats ? `${stats.server.memoryMB} MB` : '—'}</div>
              </div>
              <div>
                <div className="text-neutral-400 text-[10px]">UPTIME</div>
                <div className="mt-0.5 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#C8A97E]" />
                  {stats ? formatUptime(stats.server.uptimeSeconds) : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
