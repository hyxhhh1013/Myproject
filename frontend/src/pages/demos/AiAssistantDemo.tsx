import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, RefreshCw, Paperclip, Mic, Image } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: '你好！我是你的智能助手。我可以帮你解答问题、编写代码或者处理文档。请问今天有什么可以帮你的？',
  timestamp: new Date()
};

export default function AiAssistantDemo() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response stream
    setTimeout(() => {
      const responseContent = "这是一个模拟的 AI 响应。在真实项目中，这里会连接到 LLM 后端，通过流式传输（Streaming）实时返回内容。这个 Demo 展示了 Markdown 渲染、打字机效果以及多模态交互界面的设计。";
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMsg]);

      let i = 0;
      const interval = setInterval(() => {
        if (i < responseContent.length) {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMsg.id 
              ? { ...msg, content: responseContent.slice(0, i + 1) }
              : msg
          ));
          i++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI 智能助手</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              Online • GPT-4 Turbo
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 font-medium">
            返回首页
          </Link>
          <button 
            onClick={() => setMessages([INITIAL_MESSAGE])}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="重置对话"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.content === '' && isTyping && (
                      <span className="inline-block w-2 h-4 bg-blue-500 dark:bg-blue-400 ml-1 animate-pulse"></span>
                    )}
                    <span className={`text-[10px] mt-2 block opacity-60 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex space-x-2 text-gray-400">
               <button type="button" className="hover:text-blue-600 transition-colors"><Paperclip size={20} /></button>
               <button type="button" className="hover:text-blue-600 transition-colors"><Image size={20} /></button>
            </div>
            
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入消息..."
              className="w-full pl-24 pr-14 py-4 bg-gray-100 dark:bg-gray-700/50 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl outline-none transition-all text-gray-900 dark:text-white shadow-inner"
              disabled={isTyping}
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              {inputValue ? (
                <button
                  type="submit"
                  disabled={isTyping}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <Mic size={20} />
                </button>
              )}
            </div>
          </form>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
            AI 可能会产生错误信息，请核对重要事实。
          </p>
        </div>
      </footer>
    </div>
  );
}
