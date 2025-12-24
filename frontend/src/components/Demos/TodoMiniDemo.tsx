import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TodoMiniDemo = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Design System', done: true },
    { id: 2, text: 'API Integration', done: false },
    { id: 3, text: 'Unit Tests', done: false },
  ]);
  const [input, setInput] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input, done: false }]);
    setInput('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="h-full bg-green-50 dark:bg-gray-800 p-4 flex flex-col">
      <h3 className="font-bold text-gray-800 dark:text-white mb-3">Tasks</h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600"
            >
              <input 
                type="checkbox" 
                checked={task.done}
                onChange={() => toggleTask(task.id)}
                className="mr-3 h-4 w-4 text-green-500 rounded focus:ring-green-500"
              />
              <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                {task.text}
              </span>
              <button 
                onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={addTask} className="relative">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add task..."
          className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
        />
        <button type="submit" className="absolute right-2 top-2 text-green-500 hover:text-green-600">
          <Plus className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default TodoMiniDemo;
