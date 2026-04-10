import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, RefreshCw, Paperclip, Mic, Image, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: '你好！我是小智，你的智能助手。我可以帮你解答问题、编写代码或者处理文档。请问今天有什么可以帮你的？',
  timestamp: new Date()
};

export default function AiAssistantDemo() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const chatMessages = messages
        .filter(m => m.id !== '1')
        .map(m => ({
          role: m.role,
          content: m.content
        }));
      
      chatMessages.push({
        role: 'user',
        content: userMsg.content
      });

      const response = await axios.post('/api/ai/chat', {
        messages: chatMessages
      });

      if (response.data.success) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        setError(response.data.error || '获取AI回复失败');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.response?.data?.details || err.response?.data?.error || '网络错误，请稍后重试');
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI 智能助手</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              Online • 智谱AI GLM-4
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 font-medium">
            返回首页
          </Link>
          <button 
            onClick={handleReset}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="重置对话"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

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
                    <span className={`text-[10px] mt-2 block opacity-60 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-gray-500 dark:text-gray-400 text-sm">正在思考...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSendMessage(e);
                }
              }}
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
