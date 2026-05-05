import { useState, useRef } from 'react';
import { PlusCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
}

interface Column {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  color: string;
}

const TaskMasterMiniDemo = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: '设计项目架构', status: 'todo' },
    { id: '2', title: '实现核心功能', status: 'doing' },
    { id: '3', title: '编写测试用例', status: 'doing' },
    { id: '4', title: '优化用户界面', status: 'done' },
    { id: '5', title: '部署到生产环境', status: 'done' }
  ]);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [draggingTask, setDraggingTask] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const columns: Column[] = [
    { id: 'col-todo', title: '待办', status: 'todo', color: '#4F46E5' },
    { id: 'col-doing', title: '进行中', status: 'doing', color: '#F59E0B' },
    { id: 'col-done', title: '已完成', status: 'done', color: '#10B981' }
  ];

  const handleDragStart = (taskId: string) => {
    setDraggingTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnStatus: 'todo' | 'doing' | 'done') => {
    if (!draggingTask) return;
    
    setTasks(tasks.map(task => 
      task.id === draggingTask ? { ...task, status: columnStatus } : task
    ));
    
    setDraggingTask(null);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: 'todo'
    };
    
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    inputRef.current?.focus();
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 p-3 flex flex-col">
      {/* 顶部标题 */}
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2">TaskMaster 看板</h3>
        <form onSubmit={addTask} className="flex gap-2 mb-3">
          <input
            ref={inputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="添加新任务..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-3 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <PlusCircle size={14} />
            添加
          </button>
        </form>
      </div>

      {/* 看板列 */}
      <div className="flex-1 flex gap-3 overflow-x-auto pb-2">
        {columns.map(column => (
          <div 
            key={column.id}
            className="flex-1 min-w-[140px] max-w-[140px] bg-gray-50 dark:bg-gray-800 rounded-lg p-2"
          >
            <div 
              className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.status)}
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: column.color }}
              ></div>
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {column.title}
              </h4>
              <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                {tasks.filter(task => task.status === column.status).length}
              </span>
            </div>
            
            <div 
              className="space-y-2 min-h-[60px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.status)}
            >
              {tasks
                .filter(task => task.status === column.status)
                .map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={`p-2 rounded-md shadow-sm cursor-move transition-all duration-200 hover:shadow-md ${draggingTask === task.id ? 'opacity-50 scale-105' : ''}`}
                    style={{
                      backgroundColor: column.status === 'done' ? '#F0FDF4' : 
                                       column.status === 'doing' ? '#FEF3C7' : '#EEF2FF',
                      border: `1px solid ${column.color}33`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {column.status === 'todo' && <Clock size={12} className="text-gray-400" />}
                        {column.status === 'doing' && <Clock size={12} className="text-amber-500" />}
                        {column.status === 'done' && <CheckCircle size={12} className="text-green-500" />}
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {task.title}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 拖拽任务卡片在不同列之间移动
        </p>
      </div>
    </div>
  );
};

export default TaskMasterMiniDemo;