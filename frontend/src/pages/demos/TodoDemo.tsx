import { useState } from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, MoreHorizontal } from 'lucide-react';

// Types
type Status = 'todo' | 'in-progress' | 'done';

interface Task {
  id: string;
  content: string;
  status: Status;
}

// Helper for translations
const getStatusLabel = (status: Status) => {
  switch(status) {
    case 'todo': return '待办';
    case 'in-progress': return '进行中';
    case 'done': return '已完成';
    default: return status;
  }
};

// Sortable Item Component
const SortableItem = ({ id, task }: { id: string; task: Task }) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ 
    id,
    data: {
      type: 'Task',
      task,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-3 group hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start">
         <p className="text-gray-700 dark:text-gray-200 font-medium text-sm leading-relaxed">{task.content}</p>
         <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MoreHorizontal className="w-4 h-4" />
         </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
         <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
            task.status === 'todo' ? 'bg-gray-100 text-gray-500' :
            task.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
            'bg-green-100 text-green-600'
         }`}>
            {getStatusLabel(task.status)}
         </span>
         <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
            {task.content.charAt(0)}
         </div>
      </div>
    </div>
  );
};

// Column Component
const Column = ({ status, tasks }: { status: Status; tasks: Task[] }) => {
  const { setNodeRef } = useSortable({
    id: status,
    data: {
      type: 'Column',
      status,
    }
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 min-w-[280px] w-80 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-gray-700 dark:text-gray-200 capitalize flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
             status === 'todo' ? 'bg-gray-400' :
             status === 'in-progress' ? 'bg-blue-500' :
             'bg-green-500'
          }`} />
          {getStatusLabel(status)}
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-500 text-xs px-2 py-0.5 rounded-full ml-2">
            {tasks.length}
          </span>
        </h3>
        <button className="text-gray-400 hover:text-gray-600">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableItem key={task.id} id={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

const TodoDemo = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', content: '竞品调研分析', status: 'todo' },
    { id: '2', content: '设计系统初稿', status: 'todo' },
    { id: '3', content: '客户会议准备', status: 'in-progress' },
    { id: '4', content: '修复导航栏 Bug', status: 'in-progress' },
    { id: '5', content: '发布 v1.0.0 版本', status: 'done' },
  ]);
  
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Implemented simple drag over logic for changing columns
    if (isActiveTask && isOverTask) {
       setTasks((tasks) => {
          const activeIndex = tasks.findIndex((t) => t.id === activeId);
          const overIndex = tasks.findIndex((t) => t.id === overId);
          
          if (tasks[activeIndex].status !== tasks[overIndex].status) {
             const newTasks = [...tasks];
             newTasks[activeIndex].status = tasks[overIndex].status;
             return arrayMove(newTasks, activeIndex, overIndex - 1 >= 0 ? overIndex - 1 : overIndex); // Simple approximate position
          }
          
          return arrayMove(tasks, activeIndex, overIndex);
       });
    }

    if (isActiveTask && isOverColumn) {
       setTasks((tasks) => {
          const activeIndex = tasks.findIndex((t) => t.id === activeId);
          const newStatus = overId as Status;
          
          if (tasks[activeIndex].status !== newStatus) {
             const newTasks = [...tasks];
             newTasks[activeIndex].status = newStatus;
             return arrayMove(newTasks, activeIndex, activeIndex);
          }
          return tasks;
       });
    }
  };

  const handleDragEnd = () => {
     setActiveId(null);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8 pt-24 overflow-x-auto">
       <Link to="/" className="fixed top-6 left-6 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="mb-8">
         <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">项目看板</h1>
         <p className="text-gray-500">使用看板视图高效管理您的任务</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-8 h-[calc(100vh-200px)] min-w-fit pb-4">
          <SortableContext items={tasks.map(t => t.id)}> {/* Context needed for DND, though columns are static here */}
             <Column status="todo" tasks={tasks.filter(t => t.status === 'todo')} />
             <Column status="in-progress" tasks={tasks.filter(t => t.status === 'in-progress')} />
             <Column status="done" tasks={tasks.filter(t => t.status === 'done')} />
          </SortableContext>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeId ? (
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border-2 border-blue-500 w-full cursor-grabbing rotate-3">
                <p className="text-gray-800 dark:text-white font-medium">{tasks.find(t => t.id === activeId)?.content}</p>
             </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default TodoDemo;