import { useState, useEffect } from 'react';
import { Trash2, Search, Loader2, Edit, Plus, X, Eye, EyeOff } from 'lucide-react';
import { message } from 'antd';
import axios from '../../utils/axiosConfig';

interface Skill {
  id: number;
  name: string;
  level: number;
  category: string;
  isVisible?: boolean;
  orderIndex?: number;
  createdAt?: string;
}

const initialFormData = {
  name: '',
  level: 80,
  category: '前端开发',
  isVisible: true,
};

const categories = [
  { value: '前端开发', label: '前端开发' },
  { value: '后端开发', label: '后端开发' },
  { value: '移动开发', label: '移动开发' },
  { value: '数据库', label: '数据库' },
  { value: 'DevOps', label: 'DevOps' },
  { value: '设计工具', label: '设计工具' },
  { value: '其他', label: '其他' },
];

const SkillsManagement = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/skills');
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setSkills(data);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      message.error('获取技能失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        name: skill.name,
        level: skill.level,
        category: skill.category,
        isVisible: skill.isVisible ?? true,
      });
    } else {
      setEditingSkill(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSkill(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      message.warning('请填写技能名称');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        level: formData.level,
        category: formData.category,
        isVisible: formData.isVisible,
      };

      if (editingSkill) {
        await axios.put(`/api/skills/${editingSkill.id}`, payload);
      } else {
        await axios.post('/api/skills', payload);
      }
      await fetchSkills();
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save skill:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      message.error(`保存失败: ${error.response?.data?.message || '未知错误'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个技能吗？')) return;
    
    try {
      setDeletingId(id);
      await axios.delete(`/api/skills/${id}`);
      setSkills(skills.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete skill:', error);
      message.error('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisible = async (id: number, currentState: boolean) => {
    try {
      await axios.put(`/api/skills/${id}`, { isVisible: !currentState });
      setSkills(skills.map(s => s.id === id ? { ...s, isVisible: !currentState } : s));
    } catch (error) {
      console.error('Failed to update skill:', error);
      message.error('更新失败，请重试');
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = (skill.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || skill.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const getLevelColor = (level: number) => {
    if (level >= 90) return 'bg-green-500';
    if (level >= 70) return 'bg-blue-500';
    if (level >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getLevelLabel = (level: number) => {
    if (level >= 90) return '精通';
    if (level >= 70) return '熟练';
    if (level >= 50) return '掌握';
    return '了解';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">技能管理</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理您的专业技能</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">共 {skills.length} 项技能</span>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>添加技能</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索技能名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="all">全部分类</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => (
          <div key={skill.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {skill?.name || '未命名'}
                </h3>
                <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  {skill.category}
                </span>
              </div>
              <button
                onClick={() => handleToggleVisible(skill.id, skill.isVisible ?? true)}
                className={`p-1.5 rounded-full transition-colors ${
                  skill.isVisible !== false
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}
                title={skill.isVisible !== false ? '点击隐藏' : '点击显示'}
              >
                {skill.isVisible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getLevelLabel(skill.level)}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {skill.level}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getLevelColor(skill.level)}`}
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleOpenModal(skill)}
                className="flex-1 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors text-sm"
              >
                <Edit className="w-4 h-4 inline mr-1" /> 编辑
              </button>
              <button
                onClick={() => handleDelete(skill.id)}
                disabled={deletingId === skill.id}
                className="flex-1 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 text-sm"
              >
                {deletingId === skill.id ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : <Trash2 className="w-4 h-4 inline mr-1" />}
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p>暂无技能</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingSkill ? '编辑技能' : '添加技能'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  技能名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：React"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  分类
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  熟练程度: {formData.level}% ({getLevelLabel(formData.level)})
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>了解</span>
                  <span>掌握</span>
                  <span>熟练</span>
                  <span>精通</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="skillIsVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="skillIsVisible" className="text-sm text-gray-700 dark:text-gray-300">
                  在前端显示
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    editingSkill ? '保存修改' : '添加技能'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsManagement;
