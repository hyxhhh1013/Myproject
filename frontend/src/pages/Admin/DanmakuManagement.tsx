import { useState, useEffect } from 'react';
import { Trash2, Search, Filter, Loader2, Eye, EyeOff, Plus, Edit2, X, Check, Sparkles } from 'lucide-react';
import { message } from 'antd';
import axios from '../../utils/axiosConfig';

interface Danmaku {
  id: number;
  content: string;
  color: string;
  isVisible: boolean;
  orderIndex: number;
  createdAt: string;
}

const colorOptions = [
  { value: 'blue', label: '蓝色', bg: 'rgba(59, 130, 246, 0.8)' },
  { value: 'gray', label: '灰色', bg: 'rgba(107, 114, 128, 0.8)' },
  { value: 'darkblue', label: '深蓝', bg: 'rgba(29, 78, 216, 0.8)' },
  { value: 'slate', label: '石板灰', bg: 'rgba(75, 85, 99, 0.8)' },
  { value: 'primary', label: '主色调', bg: 'rgba(37, 99, 235, 0.8)' },
  { value: 'pink', label: '粉色', bg: 'rgba(236, 72, 153, 0.8)' },
];

const DanmakuManagement = () => {
  const [danmakuList, setDanmakuList] = useState<Danmaku[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState<'all' | 'visible' | 'hidden'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    color: 'blue',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDanmaku();
  }, []);

  const fetchDanmaku = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/danmaku');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setDanmakuList(data);
    } catch (error) {
      console.error('Failed to fetch danmaku:', error);
      message.error('获取弹幕失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这条弹幕吗？')) return;
    
    try {
      setDeletingId(id);
      await axios.delete(`/api/danmaku/${id}`);
      setDanmakuList(danmakuList.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete danmaku:', error);
      message.error('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisibility = async (id: number, currentState: boolean) => {
    try {
      await axios.put(`/api/danmaku/${id}`, { isVisible: !currentState });
      setDanmakuList(danmakuList.map(d => d.id === id ? { ...d, isVisible: !currentState } : d));
    } catch (error) {
      console.error('Failed to update danmaku:', error);
      message.error('更新失败，请重试');
    }
  };

  const handleAddDanmaku = async () => {
    if (!formData.content.trim()) {
      message.warning('请输入弹幕内容');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post('/api/danmaku', formData);
      setDanmakuList([...danmakuList, response.data]);
      setShowAddModal(false);
      setFormData({ content: '', color: 'blue' });
    } catch (error) {
      console.error('Failed to add danmaku:', error);
      message.error('添加失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDanmaku = async () => {
    if (!editingId || !formData.content.trim()) {
      message.warning('请输入弹幕内容');
      return;
    }

    try {
      setSubmitting(true);
      await axios.put(`/api/danmaku/${editingId}`, formData);
      setDanmakuList(danmakuList.map(d => 
        d.id === editingId 
          ? { ...d, content: formData.content, color: formData.color }
          : d
      ));
      setEditingId(null);
      setFormData({ content: '', color: 'blue' });
    } catch (error) {
      console.error('Failed to edit danmaku:', error);
      message.error('编辑失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (danmaku: Danmaku) => {
    setEditingId(danmaku.id);
    setFormData({
      content: danmaku.content,
      color: danmaku.color,
    });
  };

  const filteredDanmaku = danmakuList.filter(danmaku => {
    const matchesSearch = danmaku.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterVisible === 'all' || 
      (filterVisible === 'visible' && danmaku.isVisible) ||
      (filterVisible === 'hidden' && !danmaku.isVisible);
    return matchesSearch && matchesFilter;
  });

  const getColorStyle = (color: string) => {
    const colorObj = colorOptions.find(c => c.value === color);
    return colorObj ? colorObj.bg : 'rgba(59, 130, 246, 0.8)';
  };

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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">弹幕管理</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">管理网站弹幕留言内容</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 flex-1">
            共 {danmakuList.length} 条弹幕，显示 {danmakuList.filter(d => d.isVisible).length} 条
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">添加弹幕</span>
            <span className="sm:hidden">添加</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索弹幕内容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={filterVisible}
            onChange={(e) => setFilterVisible(e.target.value as any)}
            className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex-1"
          >
            <option value="all">全部弹幕</option>
            <option value="visible">显示中</option>
            <option value="hidden">已隐藏</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDanmaku.map((danmaku) => (
          <div key={danmaku.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-all ${!danmaku.isVisible ? 'border-l-4 border-gray-400 dark:border-gray-600' : ''}`}>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1" title={danmaku.content}>
                    {danmaku.content}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ background: getColorStyle(danmaku.color) }}
                      />
                      <span>
                        {colorOptions.find(c => c.value === danmaku.color)?.label || danmaku.color}
                      </span>
                    </div>
                    <span>排序: {danmaku.orderIndex}</span>
                    <span>{new Date(danmaku.createdAt).toLocaleDateString('zh-CN')} {new Date(danmaku.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${danmaku.isVisible ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700'}`}>
                      {danmaku.isVisible ? '显示中' : '已隐藏'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleVisibility(danmaku.id, danmaku.isVisible)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                    title={danmaku.isVisible ? '点击隐藏' : '点击显示'}
                  >
                    {danmaku.isVisible ? (
                      <Eye className="w-5 h-5 text-green-600" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(danmaku)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors flex-shrink-0"
                    title="编辑弹幕"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(danmaku.id)}
                    disabled={deletingId === danmaku.id}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                    title="删除弹幕"
                  >
                    {deletingId === danmaku.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 h-8">
                <div
                  className="absolute whitespace-nowrap text-xs font-medium px-2 py-1 rounded-full text-white"
                  style={{
                    background: getColorStyle(danmaku.color),
                    top: '50%',
                    left: '10px',
                    transform: 'translateY(-50%)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {danmaku.content.length > 15 ? danmaku.content.slice(0, 15) + '...' : danmaku.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDanmaku.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>暂无弹幕</p>
        </div>
      )}

      {(showAddModal || editingId) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? '编辑弹幕' : '添加弹幕'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                  setFormData({ content: '', color: 'blue' });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  弹幕内容
                </label>
                <input
                  type="text"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="输入弹幕内容..."
                  maxLength={200}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">{formData.content.length}/200</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  弹幕颜色
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`relative p-2 rounded-lg border-2 transition-all ${
                        formData.color === color.value 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className="w-full h-6 rounded text-white text-xs font-medium flex items-center justify-center"
                        style={{ background: color.bg }}
                      >
                        {color.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  预览效果
                </label>
                <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700 h-12">
                  <div
                    className="absolute whitespace-nowrap text-sm font-medium px-3 py-1.5 rounded-full text-white"
                    style={{
                      background: getColorStyle(formData.color),
                      top: '50%',
                      left: '20px',
                      transform: 'translateY(-50%)',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {formData.content || '弹幕预览'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                  setFormData({ content: '', color: 'blue' });
                }}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={editingId ? handleEditDanmaku : handleAddDanmaku}
                disabled={submitting || !formData.content.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingId ? '保存' : '添加'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanmakuManagement;
