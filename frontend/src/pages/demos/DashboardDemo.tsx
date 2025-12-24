import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Package, 
  Bell,
  Search
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock Data
const SALES_DATA = [
  { name: '00:00', value: 4000 },
  { name: '04:00', value: 3000 },
  { name: '08:00', value: 2000 },
  { name: '12:00', value: 2780 },
  { name: '16:00', value: 1890 },
  { name: '20:00', value: 2390 },
  { name: '23:59', value: 3490 },
];

const CATEGORY_DATA = [
  { name: '电子产品', value: 400 },
  { name: '服装', value: 300 },
  { name: '家居', value: 300 },
  { name: '美妆', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard = ({ title, value, change, isPositive, icon: Icon }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
        <Icon size={24} />
      </div>
      <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {change}
        {isPositive ? <ArrowUpRight size={16} className="ml-1" /> : <ArrowDownRight size={16} className="ml-1" />}
      </span>
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
  </motion.div>
);

export default function DashboardDemo() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DataView
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium">
            <LayoutDashboard size={20} className="mr-3" />
            总览看板
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
            <ShoppingBag size={20} className="mr-3" />
            商品管理
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
            <Users size={20} className="mr-3" />
            用户分析
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
            <DollarSign size={20} className="mr-3" />
            财务报表
          </a>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium">
            ← 返回作品集
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center text-gray-500 text-sm">
            <span className="mr-4">{currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-bold flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              实时数据
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="搜索..." className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </button>
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full"></div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="今日总销售额" value="¥ 124,592" change="+12.5%" isPositive={true} icon={DollarSign} />
            <StatCard title="活跃用户数" value="8,549" change="+5.2%" isPositive={true} icon={Users} />
            <StatCard title="订单转化率" value="3.24%" change="-0.8%" isPositive={false} icon={TrendingUp} />
            <StatCard title="待处理订单" value="45" change="+2" isPositive={false} icon={Package} />
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Line Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">实时销售趋势</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SALES_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `¥${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Pie Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">销售品类占比</h3>
              <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CATEGORY_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {CATEGORY_DATA.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="text-center">
                     <p className="text-sm text-gray-500">总单量</p>
                     <p className="text-xl font-bold text-gray-900 dark:text-white">1,200</p>
                   </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {CATEGORY_DATA.map((item, index) => (
                  <div key={item.name} className="flex items-center text-sm">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></span>
                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Orders Table (Simplified) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
               <h3 className="font-bold text-gray-800 dark:text-white">最近订单</h3>
               <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">查看全部</button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                   <tr>
                     <th className="px-6 py-3 font-medium">订单编号</th>
                     <th className="px-6 py-3 font-medium">商品</th>
                     <th className="px-6 py-3 font-medium">客户</th>
                     <th className="px-6 py-3 font-medium">状态</th>
                     <th className="px-6 py-3 font-medium">金额</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                   {[1, 2, 3, 4, 5].map((i) => (
                     <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                       <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">#ORD-00{890 + i}</td>
                       <td className="px-6 py-4 text-gray-600 dark:text-gray-300">无线降噪耳机 Pro</td>
                       <td className="px-6 py-4 text-gray-600 dark:text-gray-300">张三丰</td>
                       <td className="px-6 py-4">
                         <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-bold">
                           已完成
                         </span>
                       </td>
                       <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">¥ 1,299.00</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
