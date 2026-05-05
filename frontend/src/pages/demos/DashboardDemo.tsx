import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
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

export default function DashboardDemo() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/60">实时数据可视化面板</p>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: '今日总销售额', 
              value: '¥ 124,592', 
              change: '+12.5%', 
              isPositive: true, 
              icon: DollarSign 
            }, 
            {
              title: '活跃用户数', 
              value: '8,549', 
              change: '+5.2%', 
              isPositive: true, 
              icon: Users 
            }, 
            {
              title: '订单转化率', 
              value: '3.24%', 
              change: '-0.8%', 
              isPositive: false, 
              icon: TrendingUp 
            }, 
            {
              title: '待处理订单', 
              value: '45', 
              change: '+2', 
              isPositive: false, 
              icon: Package 
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6" rounded="xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <stat.icon size={24} />
                  </div>
                  <span className={`flex items-center text-sm font-medium ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                    {stat.isPositive ? <ArrowUpRight size={16} className="ml-1" /> : <ArrowDownRight size={16} className="ml-1" />}
                  </span>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Line Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6" rounded="xl">
              <h3 className="text-lg font-bold mb-6 text-white">实时销售趋势</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SALES_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `¥${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: '8px', border: 'none', color: 'white' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Pie Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6" rounded="xl">
              <h3 className="text-lg font-bold mb-6 text-white">销售品类占比</h3>
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
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: '8px', border: 'none', color: 'white' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="text-center">
                     <p className="text-sm text-white/60">总订单</p>
                     <p className="text-xl font-bold text-white">1,200</p>
                   </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {CATEGORY_DATA.map((item, index) => (
                  <div key={item.name} className="flex items-center text-sm">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></span>
                    <span className="text-white/60">{item.name}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Recent Orders Table */}
        <GlassCard className="rounded-xl overflow-hidden" bordered={false}>
           <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
             <h3 className="font-bold text-white">最近订单</h3>
             <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">查看全部</button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="bg-white/5 text-white/60">
                 <tr>
                   <th className="px-6 py-3 font-medium">订单编号</th>
                   <th className="px-6 py-3 font-medium">商品</th>
                   <th className="px-6 py-3 font-medium">客户</th>
                   <th className="px-6 py-3 font-medium">状态</th>
                   <th className="px-6 py-3 font-medium">金额</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/10">
                 {[1, 2, 3, 4, 5].map((i) => (
                   <tr key={i} className="hover:bg-white/5 transition-colors">
                     <td className="px-6 py-4 text-white font-medium">#ORD-00{890 + i}</td>
                     <td className="px-6 py-4 text-white/70">无线降噪耳机 Pro</td>
                     <td className="px-6 py-4 text-white/70">张三</td>
                     <td className="px-6 py-4">
                       <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-bold">
                         已完成
                       </span>
                     </td>
                     <td className="px-6 py-4 text-white font-bold">¥ 1,299.00</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </GlassCard>
      </div>
    </div>
  );
}
