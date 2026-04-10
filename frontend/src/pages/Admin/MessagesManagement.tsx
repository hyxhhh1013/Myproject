import { useState, useEffect } from 'react';
import { Trash2, Search, Filter, Loader2, Eye, EyeOff, X, User, Calendar, EyeOff as EyeOffIcon } from 'lucide-react';
import axios from '../../utils/axiosConfig';

interface Message {
  id: number;
  name: string;
  email: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

const MessagesManagement = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/messages');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      alert('获取留言失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这条留言吗？')) return;
    
    try {
      setDeletingId(id);
      await axios.delete(`/api/messages/${id}`);
      setMessages(messages.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleRead = async (id: number | undefined, currentState: boolean | undefined) => {
    if (id === undefined || currentState === undefined) return;
    
    try {
      await axios.patch(`/api/messages/${id}/read`, { isRead: !currentState });
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: !currentState } : m));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, isRead: !currentState });
      }
    } catch (error) {
      console.error('Failed to update message:', error);
      alert('更新失败，请重试');
    }
  };

  const handleOpenDetail = async (message: Message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
    
    // 如果消息是未读的，点击查看详情时自动标记为已读
    if (!message.isRead) {
      await handleToggleRead(message.id, false);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch =
      (message.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterRead === 'all' || 
      (filterRead === 'unread' && !message.isRead) ||
      (filterRead === 'read' && message.isRead);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">留言管理</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">管理网站留言和反馈</p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          共 {messages.length} 条留言，未读 {messages.filter(m => !m.isRead).length} 条
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索留言内容、名字或邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value as any)}
            className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex-1"
          >
            <option value="all">全部留言</option>
            <option value="unread">未读</option>
            <option value="read">已读</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <div key={message.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-all ${!message.isRead ? 'border-l-4 border-blue-500 dark:border-blue-400' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => handleToggleRead(message.id, message.isRead)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                    title={message.isRead ? '标记为未读' : '标记为已读'}
                  >
                    {message.isRead ? (
                      <Eye className="w-5 h-5 text-green-600" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{message?.name || '匿名'}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{message?.email || ''}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="点击查看详情" onClick={(e) => { e.stopPropagation(); handleOpenDetail(message); }}>
                  {message?.content || ''}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{new Date(message.createdAt).toLocaleDateString('zh-CN')} {new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`px-2 py-0.5 rounded ${message.isRead ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {message.isRead ? '已读' : '未读'}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleDelete(message.id)}
                  disabled={deletingId === message.id}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                  title="删除留言"
                >
                  {deletingId === message.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p>暂无留言</p>
        </div>
      )}

      {showDetailModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[95vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                留言详情
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedMessage(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedMessage?.name || '匿名'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedMessage?.email || ''}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={16} />
                <span>{new Date(selectedMessage?.createdAt || '').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${selectedMessage?.isRead ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                  {selectedMessage?.isRead ? '已读' : '未读'}
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">留言内容</p>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">{selectedMessage?.content || ''}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => handleToggleRead(selectedMessage?.id, selectedMessage?.isRead)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  selectedMessage?.isRead
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {selectedMessage?.isRead ? (
                  <>
                    <EyeOffIcon size={18} />
                    <span className="hidden sm:inline">标记为未读</span>
                    <span className="sm:hidden">标记未读</span>
                  </>
                ) : (
                  <>
                    <Eye size={18} />
                    <span className="hidden sm:inline">标记为已读</span>
                    <span className="sm:hidden">标记已读</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedMessage(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedMessage?.id);
                  setShowDetailModal(false);
                  setSelectedMessage(null);
                }}
                disabled={deletingId === selectedMessage?.id}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId === selectedMessage?.id ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                <span className="hidden sm:inline">删除</span>
                <span className="sm:hidden">删</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesManagement;
