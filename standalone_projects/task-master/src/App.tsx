import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, Edit2, Check, X, Server, Wifi, WifiOff } from 'lucide-react';

// API URL
const API_URL = 'http://localhost:3001/api/tasks';

// 类型定义
type TaskStatus = 'todo' | 'inProgress' | 'done';

interface Task {
  id: string;
  content: string;
  status: TaskStatus;
}

// 可排序任务组件
const SortableItem = ({ id, task, onDelete, onEdit }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.content);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onEdit(id, editValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-white p-3 rounded-lg shadow-sm border border-blue-200 mb-3">
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full mb-2 p-1 border-b border-gray-200 outline-none text-sm"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={() => setIsEditing(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={14} /></button>
          <button onClick={handleSave} className="p-1 text-green-500 hover:text-green-700"><Check size={14} /></button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-3 flex items-start justify-between group hover:shadow-md transition-shadow cursor-default"
    >
      <div className="flex items-start flex-1 min-w-0">
        <button {...attributes} {...listeners} className="mt-1 mr-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0">
          <GripVertical size={16} />
        </button>
        <span className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed break-words">{task.content}</span>
      </div>
      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
        <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-blue-500">
          <Edit2 size={14} />
        </button>
        <button onClick={() => onDelete(id)} className="p-1 text-gray-400 hover:text-red-500">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// 状态列组件
const Column = ({ title, status, tasks, onDelete, onEdit, color }: any) => {
  return (
    <div className="flex-1 min-w-[300px] bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex flex-col h-full max-h-full">
      <div className={`flex items-center justify-between mb-4 px-2 ${color}`}>
        <h2 className="font-bold text-gray-700 dark:text-gray-200">{title}</h2>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-[100px]">
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          {tasks.map((task: Task) => (
            <SortableItem key={task.id} id={task.id} task={task} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-xs">
            空空如也
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        setIsOnline(true);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error) {
      console.error('API Error:', error);
      setIsOnline(false);
      // Fallback to local storage if API fails
      const saved = localStorage.getItem('kanban-tasks');
      if (saved) setTasks(JSON.parse(saved));
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000); // Polling for updates
    return () => clearInterval(interval);
  }, []);

  // Save to local storage as backup
  useEffect(() => {
    if (!isOnline) {
      localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
    }
  }, [tasks, isOnline]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;

    const newTask = { content: newTaskContent, status: 'todo' as TaskStatus };

    if (isOnline) {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
        const savedTask = await res.json();
        setTasks([...tasks, savedTask]);
      } catch (err) {
        console.error(err);
      }
    } else {
      setTasks([...tasks, { id: Date.now().toString(), ...newTask }]);
    }
    
    setNewTaskContent('');
    setIsAdding(false);
  };

  const deleteTask = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id)); // Optimistic update
    if (isOnline) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    }
  };

  const editTask = async (id: string, newContent: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, content: newContent } : t));
    if (isOnline) {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
    }
  };

  const moveTask = async (id: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (isOnline) {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    }
  };

  // Group tasks by status
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'inProgress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 pt-20 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-end mb-8">
          <div>
             <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
               任务看板
               {isOnline ? (
                 <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center font-normal">
                   <Wifi size={12} className="mr-1" /> 在线 (Node.js API)
                 </span>
               ) : (
                 <span className="ml-3 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full flex items-center font-normal">
                   <WifiOff size={12} className="mr-1" /> 离线模式
                 </span>
               )}
             </h1>
             <p className="text-gray-500 dark:text-gray-400">高效管理你的项目进度</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center font-medium transition-colors shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5 mr-2" /> 新建任务
          </button>
        </div>

        {isAdding && (
          <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-blue-100 animate-in fade-in slide-in-from-top-4">
            <form onSubmit={addTask} className="flex gap-4">
              <input
                autoFocus
                type="text"
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                placeholder="输入任务内容..."
                className="flex-1 bg-gray-50 border-none rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">添加</button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg font-medium">取消</button>
            </form>
          </div>
        )}

        {/* Board Layout */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-6 h-full min-h-[500px]">
             <ColumnSection 
               title="待处理" 
               status="todo" 
               tasks={todoTasks} 
               color="text-gray-600" 
               onDelete={deleteTask} 
               onEdit={editTask}
               onMove={moveTask}
               nextStatus="inProgress"
             />
             <ColumnSection 
               title="进行中" 
               status="inProgress" 
               tasks={inProgressTasks} 
               color="text-blue-600" 
               onDelete={deleteTask} 
               onEdit={editTask}
               onMove={moveTask}
               prevStatus="todo"
               nextStatus="done"
             />
             <ColumnSection 
               title="已完成" 
               status="done" 
               tasks={doneTasks} 
               color="text-green-600" 
               onDelete={deleteTask} 
               onEdit={editTask}
               onMove={moveTask}
               prevStatus="inProgress"
             />
          </div>
        </div>
      </div>
    </div>
  );
};

const ColumnSection = ({ title, status, tasks, color, onDelete, onEdit, onMove, nextStatus, prevStatus }: any) => {
  return (
    <div className="flex-1 min-w-[320px] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 className={`font-bold ${color} flex items-center`}>
          <div className={`w-2 h-2 rounded-full mr-2 bg-current opacity-75`}></div>
          {title}
        </h3>
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-bold">{tasks.length}</span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {tasks.map((task: Task) => (
           <div key={task.id} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl group hover:shadow-md transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
             <div className="mb-3 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{task.content}</div>
             <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700/50">
               <div className="flex space-x-1">
                 <button onClick={() => onDelete(task.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors">
                   <Trash2 size={14} />
                 </button>
               </div>
               <div className="flex space-x-2 text-xs font-medium">
                 {prevStatus && (
                   <button onClick={() => onMove(task.id, prevStatus)} className="px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50">
                     ← 后退
                   </button>
                 )}
                 {nextStatus && (
                   <button onClick={() => onMove(task.id, nextStatus)} className="px-2 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded hover:bg-blue-100">
                     推进 →
                   </button>
                 )}
               </div>
             </div>
           </div>
        ))}
        {tasks.length === 0 && (
          <div className="py-8 text-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
            暂无任务
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
