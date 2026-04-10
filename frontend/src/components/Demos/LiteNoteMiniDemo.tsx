import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bold, Italic, Code, List, Link as LinkIcon, Image as ImageIcon, Eye, Edit3 } from 'lucide-react';

const LiteNoteMiniDemo = () => {
  const [content, setContent] = useState(`# 欢迎使用 LiteNote

这是一个简单的 **Markdown** 笔记应用。

## 功能特性
- ✨ 实时预览
- 📝 多种格式支持
- 📱 响应式设计
- 🌓 明暗主题

\`\`\`javascript
// 代码示例
console.log('Hello, LiteNote!');
\`\`\`

> "简单是终极的复杂。" - 达芬奇`);
  
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // 插入 Markdown 格式化
  const insertMarkdown = (format: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = '';

    switch (format) {
      case 'bold':
        newText = selectedText ? `**${selectedText}**` : '**粗体文本**';
        break;
      case 'italic':
        newText = selectedText ? `*${selectedText}*` : '*斜体文本*';
        break;
      case 'code':
        newText = selectedText ? `\`${selectedText}\`` : '\`代码\`';
        break;
      case 'list':
        newText = selectedText ? `- ${selectedText}` : '- 列表项';
        break;
      case 'link':
        newText = selectedText ? `[${selectedText}](https://)` : '[链接文本](https://)';
        break;
      case 'image':
        newText = `![图片描述](https://)`;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    
    // 设置光标位置
    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + newText.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* 顶部工具栏 */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1 items-center">
        <button onClick={() => insertMarkdown('bold')} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors" title="粗体">
          <Bold size={14} />
        </button>
        <button onClick={() => insertMarkdown('italic')} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors" title="斜体">
          <Italic size={14} />
        </button>
        <button onClick={() => insertMarkdown('code')} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors" title="行内代码">
          <Code size={14} />
        </button>
        <button onClick={() => insertMarkdown('list')} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors" title="列表">
          <List size={14} />
        </button>
        <button onClick={() => insertMarkdown('link')} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors" title="链接">
          <LinkIcon size={14} />
        </button>
        <button onClick={() => insertMarkdown('image')} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors" title="图片">
          <ImageIcon size={14} />
        </button>
        
        <div className="h-3 w-px bg-gray-300 dark:bg-gray-500 mx-1"></div>
        
        <button 
          onClick={() => setActiveTab('edit')} 
          className={`p-1.5 rounded transition-colors ${activeTab === 'edit' ? 'bg-gray-200 dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
          title="编辑模式"
        >
          <Edit3 size={14} />
        </button>
        <button 
          onClick={() => setActiveTab('preview')} 
          className={`p-1.5 rounded transition-colors ${activeTab === 'preview' ? 'bg-gray-200 dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
          title="预览模式"
        >
          <Eye size={14} />
        </button>
      </div>

      {/* 主要内容区 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'edit' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-3 resize-none outline-none font-mono text-xs leading-relaxed text-gray-800 dark:text-gray-200 bg-transparent"
            placeholder="在此输入 Markdown 内容..."
            spellCheck={false}
          />
        ) : (
          <div className="p-3 overflow-auto h-full text-xs prose dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <span>LiteNote - 轻量级 Markdown 编辑器</span>
          <span>{activeTab === 'edit' ? '编辑模式' : '预览模式'}</span>
        </div>
      </div>
    </div>
  );
};

export default LiteNoteMiniDemo;