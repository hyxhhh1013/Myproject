import { useState, useEffect } from 'react';
import { Trash2, Search, Loader2, Edit, Plus, X, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { message } from 'antd';
import axios from '../../utils/axiosConfig';
import RowsEditor, {
  METRIC_COLUMNS,
  METRIC_KEYS,
  parseJsonRows,
  parseJsonStringList,
  serializeCommaList,
  serializeRows,
  type RowValue,
  type RowsEditorColumn,
} from '../../components/Admin/RowsEditor';

/** The homepage Skills section renders only rows with this category ("capability cards"). */
const CAPABILITY = 'capability';

interface Skill {
  id: number;
  name: string;
  level: number;
  category: string;
  isVisible?: boolean;
  orderIndex?: number;
  createdAt?: string;
  // Capability-card fields
  nameEn?: string | null;
  shortLabel?: string | null;
  badge?: string | null;
  badgeEn?: string | null;
  metrics?: string | Record<string, unknown>[] | null; // JSON string (or already-parsed array)
  stack?: string | string[] | null;
  linkedProjects?: string | Record<string, unknown>[] | null; // JSON string (or already-parsed array)
  highlight?: string | null;
  highlightEn?: string | null;
}

// linkedProjects rows: [{ zh, en }]
const LINKED_PROJECT_COLUMNS: RowsEditorColumn[] = [
  { key: 'zh', label: '项目名（中文）', placeholder: '例如：禾书耕文 (AI4Science)', span: 3 },
  { key: 'en', label: '项目名（英文）', placeholder: 'e.g. HeShu AI4Science', span: 3 },
];
const LINKED_PROJECT_KEYS = LINKED_PROJECT_COLUMNS.map(col => col.key);

const initialCapabilityForm = {
  name: '',
  nameEn: '',
  shortLabel: '',
  badge: '',
  badgeEn: '',
  metrics: [] as RowValue[],
  stack: '',
  linkedProjects: [] as RowValue[],
  highlight: '',
  highlightEn: '',
  orderIndex: '0',
  isVisible: true,
};

const initialLegacyForm = {
  name: '',
  level: 80,
  category: '前端开发',
  isVisible: true,
};

const legacyCategories = [
  { value: '前端开发', label: '前端开发' },
  { value: '后端开发', label: '后端开发' },
  { value: '移动开发', label: '移动开发' },
  { value: '数据库', label: '数据库' },
  { value: 'DevOps', label: 'DevOps' },
  { value: '设计工具', label: '设计工具' },
  { value: '其他', label: '其他' },
];

const inputClass =
  'w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
const hintClass = 'text-xs text-gray-500 dark:text-gray-400 mt-1';

// Same order as the homepage: orderIndex asc, then id asc.
const byHomepageOrder = (a: Skill, b: Skill) =>
  (a.orderIndex ?? 0) - (b.orderIndex ?? 0) || a.id - b.id;

const SkillsManagement = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Capability cards (main list)
  const [showCapabilityModal, setShowCapabilityModal] = useState(false);
  const [editingCapability, setEditingCapability] = useState<Skill | null>(null);
  const [capabilityForm, setCapabilityForm] = useState(initialCapabilityForm);

  // Legacy percentage skills (collapsed section)
  const [legacyOpen, setLegacyOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showLegacyModal, setShowLegacyModal] = useState(false);
  const [editingLegacy, setEditingLegacy] = useState<Skill | null>(null);
  const [legacyForm, setLegacyForm] = useState(initialLegacyForm);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/skills');
      const data: Skill[] = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setSkills([...data].sort(byHomepageOrder));
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      message.error('获取技能失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const notifyHomepage = () => {
    // 更新localStorage，触发首页数据刷新（与项目/经历页一致）
    localStorage.setItem('skillsUpdated', Date.now().toString());
  };

  const capabilities = skills.filter(s => s.category === CAPABILITY);
  const legacySkills = skills.filter(s => s.category !== CAPABILITY);
  const visibleCapabilityIds = capabilities.filter(s => s.isVisible !== false).map(s => s.id);

  /* ---------------- Capability cards ---------------- */

  const handleOpenCapabilityModal = (skill?: Skill) => {
    if (skill) {
      setEditingCapability(skill);
      setCapabilityForm({
        name: skill.name || '',
        nameEn: skill.nameEn || '',
        shortLabel: skill.shortLabel || '',
        badge: skill.badge || '',
        badgeEn: skill.badgeEn || '',
        metrics: parseJsonRows(skill.metrics, METRIC_KEYS),
        stack: parseJsonStringList(skill.stack).join(', '),
        linkedProjects: parseJsonRows(skill.linkedProjects, LINKED_PROJECT_KEYS),
        highlight: skill.highlight || '',
        highlightEn: skill.highlightEn || '',
        orderIndex: String(skill.orderIndex ?? 0),
        isVisible: skill.isVisible ?? true,
      });
    } else {
      setEditingCapability(null);
      // New cards go to the end of the homepage list.
      const nextOrder = capabilities.length > 0 ? Math.max(...capabilities.map(s => s.orderIndex ?? 0)) + 1 : 0;
      setCapabilityForm({ ...initialCapabilityForm, orderIndex: String(nextOrder) });
    }
    setShowCapabilityModal(true);
  };

  const handleCloseCapabilityModal = () => {
    setShowCapabilityModal(false);
    setEditingCapability(null);
    setCapabilityForm(initialCapabilityForm);
  };

  const handleSubmitCapability = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!capabilityForm.name.trim()) {
      message.warning('请填写能力名称');
      return;
    }

    try {
      setSubmitting(true);
      const isUpdate = !!editingCapability;
      const payload: Record<string, string | number | boolean> = {
        name: capabilityForm.name.trim(),
        category: CAPABILITY,
        orderIndex: Math.max(0, parseInt(capabilityForm.orderIndex, 10) || 0),
        isVisible: capabilityForm.isVisible,
      };
      // Optional fields: on create send only filled ones; on update always send them,
      // so a cleared field goes out as '' (backend: empty = null, absent = unchanged).
      const optional: Record<string, string> = {
        nameEn: capabilityForm.nameEn.trim(),
        shortLabel: capabilityForm.shortLabel.trim(),
        badge: capabilityForm.badge.trim(),
        badgeEn: capabilityForm.badgeEn.trim(),
        metrics: serializeRows(capabilityForm.metrics, METRIC_KEYS),
        stack: serializeCommaList(capabilityForm.stack),
        linkedProjects: serializeRows(capabilityForm.linkedProjects, LINKED_PROJECT_KEYS),
        highlight: capabilityForm.highlight.trim(),
        highlightEn: capabilityForm.highlightEn.trim(),
      };
      Object.entries(optional).forEach(([key, value]) => {
        if (isUpdate || value !== '') payload[key] = value;
      });

      if (editingCapability) {
        await axios.put(`/api/skills/${editingCapability.id}`, payload);
      } else {
        await axios.post('/api/skills', payload);
      }
      await fetchSkills();
      handleCloseCapabilityModal();
      notifyHomepage();
    } catch (error: any) {
      console.error('Failed to save capability:', error);
      message.error(`保存失败: ${error.response?.data?.message || '未知错误'}`);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Legacy skills ---------------- */

  const handleOpenLegacyModal = (skill: Skill) => {
    setEditingLegacy(skill);
    setLegacyForm({
      name: skill.name,
      level: skill.level,
      category: skill.category,
      isVisible: skill.isVisible ?? true,
    });
    setShowLegacyModal(true);
  };

  const handleCloseLegacyModal = () => {
    setShowLegacyModal(false);
    setEditingLegacy(null);
    setLegacyForm(initialLegacyForm);
  };

  const handleSubmitLegacy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingLegacy) return;
    if (!legacyForm.name.trim()) {
      message.warning('请填写技能名称');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: legacyForm.name.trim(),
        level: legacyForm.level,
        category: legacyForm.category,
        isVisible: legacyForm.isVisible,
      };
      await axios.put(`/api/skills/${editingLegacy.id}`, payload);
      await fetchSkills();
      handleCloseLegacyModal();
    } catch (error: any) {
      console.error('Failed to save skill:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      message.error(`保存失败: ${error.response?.data?.message || '未知错误'}`);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Shared actions ---------------- */

  const handleDelete = async (skill: Skill) => {
    const label = skill.category === CAPABILITY ? '这张能力卡片' : '这个技能';
    if (!window.confirm(`确定要删除${label}吗？`)) return;

    try {
      setDeletingId(skill.id);
      await axios.delete(`/api/skills/${skill.id}`);
      setSkills(prev => prev.filter(s => s.id !== skill.id));
      if (skill.category === CAPABILITY) notifyHomepage();
    } catch (error) {
      console.error('Failed to delete skill:', error);
      message.error('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisible = async (skill: Skill) => {
    const currentState = skill.isVisible ?? true;
    try {
      // Partial update: send only isVisible.
      await axios.put(`/api/skills/${skill.id}`, { isVisible: !currentState });
      setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, isVisible: !currentState } : s));
      if (skill.category === CAPABILITY) notifyHomepage();
    } catch (error) {
      console.error('Failed to update skill:', error);
      message.error('更新失败，请重试');
    }
  };

  const legacyCategoryOptions = Array.from(new Set(legacySkills.map(s => s.category).filter(Boolean)));

  const filteredLegacySkills = legacySkills.filter(skill => {
    const matchesSearch = (skill.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || skill.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const legacyFormCategories = legacyCategories.some(c => c.value === legacyForm.category)
    ? legacyCategories
    : [{ value: legacyForm.category, label: legacyForm.category }, ...legacyCategories];

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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">技能管理 · 核心能力卡片</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            首页「技能」区只显示这里的能力卡片，按排序数字从小到大，编号 01、02… 按此顺序生成
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">共 {capabilities.length} 张卡片</span>
          <button
            onClick={() => handleOpenCapabilityModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>添加能力卡片</span>
          </button>
        </div>
      </div>

      {/* Capability cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {capabilities.map((skill) => {
          const position = visibleCapabilityIds.indexOf(skill.id);
          const stack = parseJsonStringList(skill.stack);
          const metrics = parseJsonRows(skill.metrics, METRIC_KEYS);
          const linked = parseJsonRows(skill.linkedProjects, LINKED_PROJECT_KEYS);
          return (
            <div
              key={skill.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 p-4 flex flex-col ${
                skill.isVisible === false ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">
                      {position >= 0 ? String(position + 1).padStart(2, '0') : '—'} · 排序 {skill.orderIndex ?? 0}
                    </span>
                    {skill.shortLabel && (
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                        {skill.shortLabel}
                      </span>
                    )}
                    {skill.isVisible === false && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">已隐藏</span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {skill.name || '未命名'}
                  </h3>
                  {skill.nameEn && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{skill.nameEn}</p>
                  )}
                </div>
                <button
                  onClick={() => handleToggleVisible(skill)}
                  className={`p-1.5 rounded-full transition-colors shrink-0 ${
                    skill.isVisible !== false
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}
                  title={skill.isVisible !== false ? '点击隐藏' : '点击显示'}
                >
                  {skill.isVisible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {(skill.badge || skill.badgeEn) && (
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  徽标：{[skill.badge, skill.badgeEn].filter(Boolean).join(' / ')}
                </p>
              )}

              {metrics.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {metrics.slice(0, 3).map((m, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-700/40 rounded-lg px-2 py-1.5">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{m.value || '—'}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{m.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {stack.map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {skill.highlight && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">{skill.highlight}</p>
              )}

              {linked.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  关联项目：{linked.map(p => p.zh || p.en).filter(Boolean).join('、')}
                </p>
              )}

              <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleOpenCapabilityModal(skill)}
                  className="flex-1 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors text-sm"
                >
                  <Edit className="w-4 h-4 inline mr-1" /> 编辑
                </button>
                <button
                  onClick={() => handleDelete(skill)}
                  disabled={deletingId === skill.id}
                  className="flex-1 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 text-sm"
                >
                  {deletingId === skill.id ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : <Trash2 className="w-4 h-4 inline mr-1" />}
                  删除
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {capabilities.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p>暂无能力卡片</p>
          <p className="text-xs mt-1">在数据库同步首页内容之前，首页会继续显示内置的默认卡片。</p>
        </div>
      )}

      {/* Legacy skills — collapsed */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setLegacyOpen(open => !open)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {legacyOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            旧版技能（首页不显示）
          </span>
          <span className="text-xs text-gray-400">{legacySkills.length} 项</span>
        </button>

        {legacyOpen && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              这些是旧版的百分比技能，新首页不再读取，仅保留以便编辑或删除。
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
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
                {legacyCategoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLegacySkills.map((skill) => (
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
                      onClick={() => handleToggleVisible(skill)}
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
                      onClick={() => handleOpenLegacyModal(skill)}
                      className="flex-1 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4 inline mr-1" /> 编辑
                    </button>
                    <button
                      onClick={() => handleDelete(skill)}
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

            {filteredLegacySkills.length === 0 && (
              <p className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">暂无旧版技能</p>
            )}
          </div>
        )}
      </div>

      {/* Capability modal */}
      {showCapabilityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingCapability ? '编辑能力卡片' : '添加能力卡片'}
              </h3>
              <button
                onClick={handleCloseCapabilityModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitCapability} className="p-6 space-y-5">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                首页中英文切换时分别显示中文 / 英文字段；英文留空时首页可能回退显示中文。
              </p>

              {/* 排序与显示 */}
              <div className="p-4 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/40 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div>
                    <label className={labelClass}>排序</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={capabilityForm.orderIndex}
                      onChange={(e) => setCapabilityForm(prev => ({ ...prev, orderIndex: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2 md:pt-7 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={capabilityForm.isVisible}
                        onChange={(e) => setCapabilityForm(prev => ({ ...prev, isVisible: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      在首页显示
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">数字越小越靠前（相同时按创建先后）。</p>
                  </div>
                </div>
              </div>

              {/* 名称 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>能力名称（中文）*</label>
                  <input
                    type="text"
                    value={capabilityForm.name}
                    onChange={(e) => setCapabilityForm(prev => ({ ...prev, name: e.target.value }))}
                    className={inputClass}
                    placeholder="例如：LangGraph / Multi-Agent 编排"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>能力名称（英文）</label>
                  <input
                    type="text"
                    value={capabilityForm.nameEn}
                    onChange={(e) => setCapabilityForm(prev => ({ ...prev, nameEn: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. LangGraph / Multi-Agent Orchestration"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>短标签</label>
                  <input
                    type="text"
                    value={capabilityForm.shortLabel}
                    onChange={(e) => setCapabilityForm(prev => ({ ...prev, shortLabel: e.target.value }))}
                    className={inputClass}
                    placeholder="例如：LangGraph"
                  />
                  <p className={hintClass}>卡片上的简短名称（中英文通用）。</p>
                </div>
              </div>

              {/* 徽标 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>徽标（中文）</label>
                  <input
                    type="text"
                    value={capabilityForm.badge}
                    onChange={(e) => setCapabilityForm(prev => ({ ...prev, badge: e.target.value }))}
                    className={inputClass}
                    placeholder="例如：46 工具"
                  />
                </div>
                <div>
                  <label className={labelClass}>徽标（英文）</label>
                  <input
                    type="text"
                    value={capabilityForm.badgeEn}
                    onChange={(e) => setCapabilityForm(prev => ({ ...prev, badgeEn: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. 46 Tools"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>关键指标</label>
                <RowsEditor
                  columns={METRIC_COLUMNS}
                  value={capabilityForm.metrics}
                  onChange={(rows) => setCapabilityForm(prev => ({ ...prev, metrics: rows }))}
                  addLabel="添加指标"
                  emptyText="暂无指标"
                />
              </div>

              <div>
                <label className={labelClass}>技术栈（逗号分隔）</label>
                <input
                  type="text"
                  value={capabilityForm.stack}
                  onChange={(e) => setCapabilityForm(prev => ({ ...prev, stack: e.target.value }))}
                  className={inputClass}
                  placeholder="例如：LangGraph, StateGraph, HITL Gate, SSE"
                />
              </div>

              <div>
                <label className={labelClass}>关联项目</label>
                <RowsEditor
                  columns={LINKED_PROJECT_COLUMNS}
                  value={capabilityForm.linkedProjects}
                  onChange={(rows) => setCapabilityForm(prev => ({ ...prev, linkedProjects: rows }))}
                  addLabel="添加关联项目"
                  emptyText="暂无关联项目"
                />
              </div>

              {/* 亮点 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>亮点说明（中文）</label>
                  <textarea
                    value={capabilityForm.highlight}
                    onChange={(e) => setCapabilityForm(prev => ({ ...prev, highlight: e.target.value }))}
                    className={inputClass}
                    placeholder="一两句话说明这项能力做成了什么"
                    rows={3}
                  />
                </div>
                <div>
                  <label className={labelClass}>亮点说明（英文）</label>
                  <textarea
                    value={capabilityForm.highlightEn}
                    onChange={(e) => setCapabilityForm(prev => ({ ...prev, highlightEn: e.target.value }))}
                    className={inputClass}
                    placeholder="English highlight"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseCapabilityModal}
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
                    editingCapability ? '保存修改' : '添加卡片'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legacy modal */}
      {showLegacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                编辑旧版技能
              </h3>
              <button
                onClick={handleCloseLegacyModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitLegacy} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>技能名称 *</label>
                <input
                  type="text"
                  value={legacyForm.name}
                  onChange={(e) => setLegacyForm(prev => ({ ...prev, name: e.target.value }))}
                  className={inputClass}
                  placeholder="例如：React"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>分类</label>
                <select
                  value={legacyForm.category}
                  onChange={(e) => setLegacyForm(prev => ({ ...prev, category: e.target.value }))}
                  className={inputClass}
                >
                  {legacyFormCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  熟练程度: {legacyForm.level}% ({getLevelLabel(legacyForm.level)})
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={legacyForm.level}
                  onChange={(e) => setLegacyForm(prev => ({ ...prev, level: parseInt(e.target.value) }))}
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
                  checked={legacyForm.isVisible}
                  onChange={(e) => setLegacyForm(prev => ({ ...prev, isVisible: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="skillIsVisible" className="text-sm text-gray-700 dark:text-gray-300">
                  在前端显示
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseLegacyModal}
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
                    '保存修改'
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
