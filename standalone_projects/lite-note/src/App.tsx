import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Save, FileText, Eye, Edit3, Plus, Trash2, File, Menu, X, Upload, Download } from 'lucide-react';

// 添加 Electron 类型声明
declare global {
  interface Window {
    electronAPI?: {
      saveFile: (content: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      openFile: () => Promise<{ canceled?: boolean; filePath?: string; content?: string; error?: string }>;
    };
  }
}

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const INITIAL_NOTE: Note = {
  id: '1',
  title: '欢迎使用简易笔记',
  content: `# 欢迎使用简易笔记！

在左侧编辑器输入，右侧即时预览。

## 桌面版功能 (Electron)
如果检测到运行在 Electron 环境中，您将可以使用以下功能：
- **打开本地文件**: 直接读取电脑上的 .md 文件
- **导出到本地**: 将笔记保存为本地文件

## 功能特性
- **多笔记管理**: 左侧侧边栏管理你的所有笔记
- **自动保存**: 所有更改会自动保存到本地
- **Markdown 支持**: 
  - *斜体* 和 **粗体**
  - 列表和 [链接](https://github.com)
  - 代码块

\`\`\`javascript
console.log('你好，世界！');
\`\`\`

> "简单是终极的复杂。" - 达芬奇`,
  updatedAt: Date.now()
};

const App = () => {
  const [notes, setNotes] = useState<Note[]>([INITIAL_NOTE]);
  const [activeNoteId, setActiveNoteId] = useState<string>('1');
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isElectron, setIsElectron] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedNotes = localStorage.getItem('lite-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    // Check if running in Electron
    if (window.electronAPI) {
      setIsElectron(true);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('lite-notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '新笔记',
      content: '# 新笔记\n\n开始写作...',
      updatedAt: Date.now()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const deleteNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (notes.length === 1) {
      alert('至少保留一个笔记');
      return;
    }
    if (confirm('确定删除这个笔记吗？')) {
      const newNotes = notes.filter(n => n.id !== id);
      setNotes(newNotes);
      if (activeNoteId === id) {
        setActiveNoteId(newNotes[0].id);
      }
    }
  };

  const updateNote = (content: string) => {
    const title = content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 20) || '无标题';
    setNotes(notes.map(n => 
      n.id === activeNoteId 
        ? { ...n, content, title, updatedAt: Date.now() } 
        : n
    ));
  };

  // Electron: Save to Disk
  const handleSaveToDisk = async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.saveFile(activeNote.content);
    if (result.success) {
      alert(`保存成功: ${result.filePath}`);
    } else if (result.error) {
      alert(`保存失败: ${result.error}`);
    }
  };

  // Electron: Open from Disk
  const handleOpenFromDisk = async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.openFile();
    if (!result.canceled && result.content) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: result.filePath ? result.filePath.split('\\').pop() || '导入的笔记' : '导入的笔记',
        content: result.content,
        updatedAt: Date.now()
      };
      setNotes([newNote, ...notes]);
      setActiveNoteId(newNote.id);
      alert('导入成功');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* Sidebar Overlay (Mobile) */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setShowSidebar(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-30 w-64 h-full bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div className="font-bold text-lg flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-400" />
            LiteNote {isElectron && <span className="text-[10px] bg-blue-600 px-1 rounded ml-2">Pro</span>}
          </div>
          <button onClick={() => setShowSidebar(false)} className="md:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-2">
          <button 
            onClick={createNote}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center font-medium transition-colors"
          >
            <Plus size={18} className="mr-2" /> 新建笔记
          </button>
          
          {isElectron && (
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleOpenFromDisk}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg flex items-center justify-center text-xs transition-colors"
                title="打开本地文件"
              >
                <Upload size={14} className="mr-1" /> 打开
              </button>
              <button 
                onClick={handleSaveToDisk}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg flex items-center justify-center text-xs transition-colors"
                title="保存到本地"
              >
                <Download size={14} className="mr-1" /> 导出
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {notes.map(note => (
            <div 
              key={note.id}
              onClick={() => { setActiveNoteId(note.id); setShowSidebar(false); }}
              className={`p-4 cursor-pointer border-b border-gray-800 hover:bg-gray-800 transition-colors group relative ${activeNoteId === note.id ? 'bg-gray-800 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
            >
              <h3 className="font-medium text-sm truncate pr-6 text-gray-200">{note.title || '无标题'}</h3>
              <p className="text-xs text-gray-500 mt-1 truncate">{note.content.replace(/[#*`]/g, '')}</p>
              <p className="text-[10px] text-gray-600 mt-2">
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
              
              <button 
                onClick={(e) => deleteNote(e, note.id)}
                className="absolute right-2 top-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center">
            <button onClick={() => setShowSidebar(true)} className="md:hidden mr-4 text-gray-600">
              <Menu size={20} />
            </button>
            <h2 className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
              {activeNote.title}
            </h2>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            {isElectron && (
              <button onClick={handleSaveToDisk} className="mr-4 text-blue-600 hover:text-blue-700 flex items-center font-medium">
                <Save size={14} className="mr-1" /> 保存到硬盘
              </button>
            )}
            <span className="hidden sm:inline">上次保存: {new Date(activeNote.updatedAt).toLocaleTimeString()}</span>
            <div className="ml-4 flex bg-gray-100 rounded-lg p-1 md:hidden">
              <button onClick={() => setActiveTab('edit')} className={`p-1.5 rounded ${activeTab === 'edit' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
                <Edit3 size={16} />
              </button>
              <button onClick={() => setActiveTab('preview')} className={`p-1.5 rounded ${activeTab === 'preview' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
                <Eye size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className={`flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
            <textarea
              value={activeNote.content}
              onChange={(e) => updateNote(e.target.value)}
              className="flex-1 w-full p-6 resize-none outline-none font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 bg-transparent"
              placeholder="在此输入 Markdown 内容..."
            />
          </div>

          {/* Preview */}
          <div className={`flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto p-8 ${activeTab === 'edit' ? 'hidden md:block' : 'block'}`}>
            <article className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600">
              <ReactMarkdown>{activeNote.content}</ReactMarkdown>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
