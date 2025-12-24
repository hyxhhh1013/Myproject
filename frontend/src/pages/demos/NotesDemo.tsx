import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Trash, Search, Menu } from 'lucide-react';

interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
}

const INITIAL_NOTES: Note[] = [
  {
    id: 1,
    title: '欢迎使用 LiteNote',
    content: `# 欢迎使用 LiteNote!

在左侧编辑器开始输入，右侧预览将实时更新。

## 功能特性
- **实时预览**: 所见即所得
- **Markdown 支持**: 
  - *斜体* 和 **粗体**
  - 列表和 [链接](https://github.com)
  - 代码块

\`\`\`javascript
console.log('Hello World!');
\`\`\`

> "简约是极致的复杂。" - 达·芬奇`,
    date: '2023-10-24'
  },
  {
    id: 2,
    title: '项目灵感',
    content: `# 项目灵感
1. AI 驱动的待办事项应用
2. 具有毛玻璃特效的天气仪表盘
3. 个人作品集网站`,
    date: '2023-10-25'
  }
];

const NotesDemo = () => {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit'); // Mobile only
  const [showSidebar, setShowSidebar] = useState(true); // Mobile toggle

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const updateNote = (content: string) => {
    setNotes(notes.map(n => n.id === activeNoteId ? { ...n, content } : n));
  };

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: '新建笔记',
      content: '# 新建笔记\n开始写作...',
      date: new Date().toISOString().split('T')[0]
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    if(window.innerWidth < 768) setShowSidebar(false);
  };

  const deleteNote = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    if (activeNoteId === id && newNotes.length > 0) {
      setActiveNoteId(newNotes[0].id);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside 
        className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 z-30 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
           <div className="flex items-center justify-between mb-6">
              <Link to="/" className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                 <ArrowLeft className="w-5 h-5 mr-2" />
                 返回
              </Link>
              <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-white">
                 <FileText className="w-5 h-5 text-blue-600" />
                 LiteNote
              </div>
           </div>
           
           <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索笔记..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
           </div>

           <button 
             onClick={createNote}
             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center font-medium transition-colors"
           >
              <Plus className="w-4 h-4 mr-2" /> 新建笔记
           </button>
        </div>

        <div className="flex-1 overflow-y-auto">
           {filteredNotes.map(note => (
             <div 
               key={note.id}
               onClick={() => {
                 setActiveNoteId(note.id);
                 if(window.innerWidth < 768) setShowSidebar(false);
               }}
               className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${activeNoteId === note.id ? 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-600 shadow-sm' : 'border-l-4 border-l-transparent'}`}
             >
                <div className="flex justify-between items-start mb-1">
                   <h3 className={`font-semibold text-sm truncate pr-2 ${activeNoteId === note.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {note.title}
                   </h3>
                   <button 
                     onClick={(e) => deleteNote(e, note.id)}
                     className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                      <Trash className="w-3 h-3" />
                   </button>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{note.content.replace(/[#*`]/g, '')}</p>
                <span className="text-[10px] text-gray-300 mt-2 block">{note.date}</span>
             </div>
           ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
           <button onClick={() => setShowSidebar(!showSidebar)}>
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
           </button>
           <span className="font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{activeNote.title}</span>
           <button className="text-blue-600 font-medium text-sm">保存</button>
        </header>

        {/* Toolbar */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
           <div className="flex items-center text-gray-400 text-sm">
              最后编辑于今天
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'edit' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                 编辑
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                 预览
              </button>
           </div>
        </div>

        {/* Editor/Preview Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Editor */}
          <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
             <input 
               type="text"
               value={activeNote.title}
               onChange={(e) => setNotes(notes.map(n => n.id === activeNoteId ? { ...n, title: e.target.value } : n))}
               className="text-3xl font-bold px-8 pt-8 pb-4 border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-300"
               placeholder="笔记标题"
             />
             <textarea
               value={activeNote.content}
               onChange={(e) => updateNote(e.target.value)}
               className="flex-1 w-full px-8 pb-8 resize-none outline-none font-mono text-base leading-relaxed text-gray-700 dark:text-gray-300 bg-transparent"
               placeholder="开始写作..."
             />
          </div>

          {/* Preview */}
          <div className={`flex-1 bg-gray-50 dark:bg-gray-800/50 overflow-auto px-8 py-8 border-l border-gray-200 dark:border-gray-800 ${activeTab === 'edit' ? 'hidden md:block' : 'block'}`}>
             <article className="prose dark:prose-invert max-w-none">
                <h1>{activeNote.title}</h1>
                <ReactMarkdown>{activeNote.content}</ReactMarkdown>
             </article>
          </div>
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};

export default NotesDemo;