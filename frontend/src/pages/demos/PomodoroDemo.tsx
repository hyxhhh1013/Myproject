import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ArrowLeft, CheckCircle, Settings, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const PomodoroDemo = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [showSettings, setShowSettings] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: '完成项目报告', completed: false },
    { id: 2, title: '回复重要邮件', completed: true },
  ]);
  const [newTask, setNewTask] = useState('');
  
  const timerRef = useRef<number | null>(null);

  const MODES = {
    focus: { time: 25 * 60, label: '专注模式', color: 'bg-rose-500', text: 'text-rose-500', bgSoft: 'bg-rose-50' },
    short: { time: 5 * 60, label: '短休息', color: 'bg-teal-500', text: 'text-teal-500', bgSoft: 'bg-teal-50' },
    long: { time: 15 * 60, label: '长休息', color: 'bg-indigo-500', text: 'text-indigo-500', bgSoft: 'bg-indigo-50' },
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // Play sound here
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  };

  const changeMode = (newMode: 'focus' | 'short' | 'long') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }]);
    setNewTask('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const progress = ((MODES[mode].time - timeLeft) / MODES[mode].time) * 100;

  return (
    <div className={`min-h-screen transition-colors duration-700 ${MODES[mode].color} flex items-center justify-center p-4 md:p-8 font-sans`}>
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl p-8 relative overflow-hidden">
         <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-gray-800 transition-colors z-10">
            <ArrowLeft className="w-6 h-6" />
        </Link>
        
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors z-10"
        >
           <Settings className="w-6 h-6" />
        </button>

        {/* Mode Selector */}
        <div className="flex justify-center space-x-2 mb-12 mt-4 relative z-0">
          <div className="bg-gray-100 p-1.5 rounded-full flex relative">
            {Object.keys(MODES).map((m) => (
              <button
                key={m}
                onClick={() => changeMode(m as any)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all relative z-10 ${
                  mode === m 
                    ? 'text-gray-800 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {MODES[m as keyof typeof MODES].label}
                {mode === m && (
                   <motion.div 
                     layoutId="activeMode"
                     className="absolute inset-0 bg-white rounded-full shadow-sm -z-10"
                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
                   />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative w-72 h-72 mx-auto mb-12 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
             {/* Background Circle */}
             <circle
               cx="50" cy="50" r="45"
               fill="none"
               stroke="#f3f4f6"
               strokeWidth="3"
             />
             {/* Progress Circle */}
             <motion.circle
               cx="50" cy="50" r="45"
               fill="none"
               stroke="currentColor"
               strokeWidth="3"
               strokeLinecap="round"
               className={MODES[mode].text}
               strokeDasharray="283"
               animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
               transition={{ duration: 1, ease: "linear" }}
             />
          </svg>
          
          <div className="text-center z-10">
            <motion.h1 
               key={timeLeft}
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className={`text-7xl font-bold ${MODES[mode].text} font-mono tracking-tighter`}
            >
              {formatTime(timeLeft)}
            </motion.h1>
            <p className="text-gray-400 font-medium mt-2 uppercase tracking-[0.2em] text-sm">
              {isActive ? '专注中...' : '已暂停'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-6 mb-12">
          <button
            onClick={toggleTimer}
            className={`h-20 w-20 rounded-3xl ${MODES[mode].color} text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center`}
          >
            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
          <button
            onClick={resetTimer}
            className="h-20 w-20 rounded-3xl bg-gray-100 text-gray-500 shadow-lg hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center"
          >
            <RotateCcw className="w-8 h-8" />
          </button>
        </div>

        {/* Tasks Section */}
        <div className="mt-8 border-t border-gray-100 pt-8">
          <h3 className="text-center text-gray-400 font-bold uppercase tracking-wider text-xs mb-6">当前任务</h3>
          
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {tasks.map(task => (
               <motion.div 
                 key={task.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`flex items-center p-4 rounded-2xl border transition-all cursor-pointer ${
                    task.completed 
                      ? 'bg-gray-50 border-gray-100 opacity-60' 
                      : `bg-white border-gray-100 shadow-sm hover:border-${MODES[mode].text.split('-')[1]}-200`
                 }`}
                 onClick={() => toggleTask(task.id)}
               >
                 <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                    task.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300'
                 }`}>
                    {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                 </div>
                 <span className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {task.title}
                 </span>
               </motion.div>
            ))}
          </div>

          <form onSubmit={addTask} className="mt-4 relative">
             <input
               type="text"
               value={newTask}
               onChange={(e) => setNewTask(e.target.value)}
               placeholder="添加新任务..."
               className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
             />
             <button type="submit" className="absolute right-2 top-2 p-1.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors">
                <Plus className="w-4 h-4" />
             </button>
          </form>
        </div>

        {/* Settings Overlay (Simulated) */}
        <AnimatePresence>
          {showSettings && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col p-8"
             >
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-bold text-gray-800">设置</h2>
                   <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X className="w-6 h-6 text-gray-500" />
                   </button>
                </div>
                
                <div className="space-y-6">
                   <div>
                      <label className="block text-gray-500 font-medium mb-2">计时时长 (分钟)</label>
                      <div className="grid grid-cols-3 gap-4">
                         <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <span className="block text-2xl font-bold text-gray-800">25</span>
                            <span className="text-xs text-gray-400">专注</span>
                         </div>
                         <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <span className="block text-2xl font-bold text-gray-800">5</span>
                            <span className="text-xs text-gray-400">短休</span>
                         </div>
                         <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <span className="block text-2xl font-bold text-gray-800">15</span>
                            <span className="text-xs text-gray-400">长休</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">自动开始休息</span>
                      <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                         <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">音效</span>
                      <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                         <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PomodoroDemo;