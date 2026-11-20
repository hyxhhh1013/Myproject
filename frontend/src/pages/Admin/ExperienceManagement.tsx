import { useState, useEffect, useRef } from 'react';
import { Trash2, Search, Loader2, Edit, Plus, X, Eye, EyeOff, Building2, Calendar, Upload } from 'lucide-react';
import { message } from 'antd';
import axios from '../../utils/axiosConfig';
import { getImageUrl } from '../../utils/imageUtils';
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

interface Experience {
  id: number;
  company: string;
  companyEn?: string | null;
  position: string;
  positionEn?: string | null;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  tags?: string | string[] | null;
  linkUrl?: string | null;
  linkLabel?: string | null;
  highlights?: string | Record<string, unknown>[] | null; // JSON string (or already-parsed array)
  metrics?: string | Record<string, unknown>[] | null; // JSON string (or already-parsed array)
  images?: string[];
  isVisible?: boolean;
  orderIndex?: number;
  createdAt?: string;
}

// Featured-card modules: [{ code, title, titleEn, desc, descEn }]
const HIGHLIGHT_COLUMNS: RowsEditorColumn[] = [
  { key: 'code', label: '编号', placeholder: '例如：01 / AGENT', span: 2 },
  { key: 'title', label: '标题（中文）', placeholder: '例如：经营 Agent（35 个只读工具）', span: 2 },
  { key: 'titleEn', label: '标题（英文）', placeholder: 'e.g. Operations Agent', span: 2 },
  { key: 'desc', label: '描述（中文）', multiline: true, span: 3 },
  { key: 'descEn', label: '描述（英文）', multiline: true, span: 3 },
];
const HIGHLIGHT_KEYS = HIGHLIGHT_COLUMNS.map(col => col.key);

const initialFormData = {
  company: '',
  companyEn: '',
  position: '',
  positionEn: '',
  startDate: '',
  endDate: '',
  ongoing: false,
  description: '',
  descriptionEn: '',
  tags: '',
  linkUrl: '',
  linkLabel: '',
  highlights: [] as RowValue[],
  metrics: [] as RowValue[],
  orderIndex: '0',
  images: [] as string[],
  isVisible: true,
};

const inputClass =
  'w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

// Same order as the homepage: orderIndex asc, then id asc.
const byHomepageOrder = (a: Experience, b: Experience) =>
  (a.orderIndex ?? 0) - (b.orderIndex ?? 0) || a.id - b.id;

const ExperienceManagement = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/experience');
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setExperiences([...data].sort(byHomepageOrder));
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
      message.error('获取经历失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (experience?: Experience) => {
    if (experience) {
      setEditingExperience(experience);
      setFormData({
        company: experience.company,
        companyEn: experience.companyEn || '',
        position: experience.position,
        positionEn: experience.positionEn || '',
        startDate: experience.startDate.split('T')[0],
        endDate: experience.endDate ? experience.endDate.split('T')[0] : '',
        ongoing: !experience.endDate,
        description: experience.description || '',
        descriptionEn: experience.descriptionEn || '',
        tags: parseJsonStringList(experience.tags).join(', '),
        linkUrl: experience.linkUrl || '',
        linkLabel: experience.linkLabel || '',
        highlights: parseJsonRows(experience.highlights, HIGHLIGHT_KEYS),
        metrics: parseJsonRows(experience.metrics, METRIC_KEYS),
        orderIndex: String(experience.orderIndex ?? 0),
        images: experience.images || [],
        isVisible: experience.isVisible ?? true,
      });
      setPreviewUrls(experience.images?.map(img => getImageUrl(img)) || []);
    } else {
      setEditingExperience(null);
      // New entries go to the end so they never silently replace the featured card.
      const nextOrder = experiences.length > 0 ? Math.max(...experiences.map(e => e.orderIndex ?? 0)) + 1 : 0;
      setFormData({ ...initialFormData, orderIndex: String(nextOrder) });
      setPreviewUrls([]);
    }
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExperience(null);
    setFormData(initialFormData);
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      message.warning('部分文件不是图片格式，已被忽略');
    }

    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      setFormData(prev => ({ ...prev, images: newImages }));
      
      const newPreviewUrls = [...previewUrls];
      newPreviewUrls.splice(index, 1);
      setPreviewUrls(newPreviewUrls);
    } else {
      // Adjust index for new files since they come after existing images in the preview array
      const existingCount = formData.images.length;
      const fileIndex = index - existingCount;
      
      const newFiles = [...selectedFiles];
      newFiles.splice(fileIndex, 1);
      setSelectedFiles(newFiles);
      
      const newPreviewUrls = [...previewUrls];
      newPreviewUrls.splice(index, 1);
      setPreviewUrls(newPreviewUrls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company.trim() || !formData.position.trim() || !formData.startDate) {
      message.warning('请填写公司名称、职位和开始日期');
      return;
    }
    if (!formData.ongoing && !formData.endDate) {
      message.warning('请填写结束日期，或勾选「至今」');
      return;
    }
    if (!formData.ongoing && formData.endDate < formData.startDate) {
      message.warning('结束日期不能早于开始日期');
      return;
    }

    try {
      setSubmitting(true);
      const payloadData = new FormData();
      // Optional fields: on create send only filled ones; on update always send them,
      // so a cleared field goes out as '' (backend: empty = null, absent = unchanged).
      const isUpdate = !!editingExperience;
      const appendOptional = (key: string, value: string) => {
        if (isUpdate || value !== '') payloadData.append(key, value);
      };

      payloadData.append('company', formData.company.trim());
      appendOptional('companyEn', formData.companyEn.trim());
      payloadData.append('position', formData.position.trim());
      appendOptional('positionEn', formData.positionEn.trim());
      payloadData.append('startDate', new Date(formData.startDate).toISOString());
      // Ongoing (至今) = empty end date → stored as null.
      appendOptional('endDate', !formData.ongoing && formData.endDate ? new Date(formData.endDate).toISOString() : '');
      appendOptional('description', formData.description.trim());
      appendOptional('descriptionEn', formData.descriptionEn.trim());
      appendOptional('tags', serializeCommaList(formData.tags));
      appendOptional('linkUrl', formData.linkUrl.trim());
      appendOptional('linkLabel', formData.linkLabel.trim());
      appendOptional('highlights', serializeRows(formData.highlights, HIGHLIGHT_KEYS));
      appendOptional('metrics', serializeRows(formData.metrics, METRIC_KEYS));
      payloadData.append('orderIndex', String(Math.max(0, parseInt(formData.orderIndex, 10) || 0)));
      payloadData.append('isVisible', formData.isVisible.toString());

      // Append existing images that weren't removed
      payloadData.append('existingImages', JSON.stringify(formData.images));

      // Append new files
      selectedFiles.forEach(file => {
        payloadData.append('images', file);
      });

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      if (editingExperience) {
        await axios.put(`/api/experience/${editingExperience.id}`, payloadData, config);
      } else {
        await axios.post('/api/experience', payloadData, config);
      }

      await fetchExperiences();
      handleCloseModal();
      
      // 更新localStorage，触发前端展示部分刷新
      localStorage.setItem('experienceUpdated', Date.now().toString());
    } catch (error) {
      console.error('Failed to save experience:', error);
      message.error('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这段经历吗？')) return;
    
    try {
      setDeletingId(id);
      await axios.delete(`/api/experience/${id}`);
      setExperiences(experiences.filter(e => e.id !== id));
      
      // 更新localStorage，触发前端展示部分刷新
      localStorage.setItem('experienceUpdated', Date.now().toString());
    } catch (error) {
      console.error('Failed to delete experience:', error);
      message.error('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisible = async (id: number, currentState: boolean) => {
    try {
      // Partial update: send only isVisible so nothing else is touched.
      await axios.put(`/api/experience/${id}`, { isVisible: !currentState });
      setExperiences(experiences.map(e => e.id === id ? { ...e, isVisible: !currentState } : e));
      
      // 更新localStorage，触发前端展示部分刷新
      localStorage.setItem('experienceUpdated', Date.now().toString());
    } catch (error) {
      console.error('Failed to update experience:', error);
      message.error('更新失败，请重试');
    }
  };

  const filteredExperiences = experiences.filter(exp =>
    exp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exp.companyEn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exp.positionEn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exp.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // The first visible experience (homepage order) is the homepage featured card.
  const featuredId = experiences.find(e => e.isVisible !== false)?.id;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  };

  const calculateDuration = (startDate: string, endDate?: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years}年${remainingMonths}个月`;
    } else if (years > 0) {
      return `${years}年`;
    } else {
      return `${remainingMonths}个月`;
    }
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">工作经历</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理您的工作经历 · 按首页顺序排列（排序数字越小越靠前）</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">共 {experiences.length} 段经历</span>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>添加经历</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索公司、职位或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        
        <div className="space-y-6">
          {filteredExperiences.map((exp) => (
            <div key={exp.id} className="relative pl-12">
              <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900 z-10" />
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {exp.position}
                        </h3>
                        {exp.id === featuredId && (
                          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-blue-600 text-white">
                            首页主卡 · FEATURED
                          </span>
                        )}
                        <span className="text-xs font-mono text-gray-400">排序 {exp.orderIndex ?? 0}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {exp.company}
                      </p>
                      {(exp.positionEn || exp.companyEn) && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {[exp.positionEn, exp.companyEn].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleVisible(exp.id, exp.isVisible ?? true)}
                    className={`p-2 rounded-full transition-colors ${
                      exp.isVisible !== false
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }`}
                    title={exp.isVisible !== false ? '点击隐藏' : '点击显示'}
                  >
                    {exp.isVisible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : '至今'}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    {calculateDuration(exp.startDate, exp.endDate)}
                  </span>
                </div>

                {exp.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-line">
                    {exp.description}
                  </p>
                )}

                {parseJsonStringList(exp.tags).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {parseJsonStringList(exp.tags).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleOpenModal(exp)}
                    className="flex-1 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4 inline mr-1" /> 编辑
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    disabled={deletingId === exp.id}
                    className="flex-1 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 text-sm"
                  >
                    {deletingId === exp.id ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : <Trash2 className="w-4 h-4 inline mr-1" />}
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredExperiences.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p>暂无工作经历</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingExperience ? '编辑工作经历' : '添加工作经历'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                首页中英文切换时分别显示中文 / 英文字段；英文留空时首页可能回退显示中文。
              </p>

              {/* 排序 */}
              <div className="p-4 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/40 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div>
                    <label className={labelClass}>排序</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={formData.orderIndex}
                      onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <p className="md:col-span-2 md:pt-7 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    数字越小越靠前（相同时按创建先后）。<strong>排序最靠前的「可见」经历是首页的主卡</strong>（显示模块亮点与关键指标），其余按顺序显示在时间线中。
                    {editingExperience && editingExperience.id === featuredId && (
                      <span className="ml-1 text-blue-600 dark:text-blue-400 font-medium">当前这条就是首页主卡。</span>
                    )}
                  </p>
                </div>
              </div>

              {/* 职位 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>职位名称（中文）*</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className={inputClass}
                    placeholder="例如：FDE 驻场工程师"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>职位名称（英文）</label>
                  <input
                    type="text"
                    value={formData.positionEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, positionEn: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. Forward-Deployed Engineer"
                  />
                </div>
              </div>

              {/* 公司 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>公司名称（中文）*</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className={inputClass}
                    placeholder="例如：阿里巴巴"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>公司名称（英文）</label>
                  <input
                    type="text"
                    value={formData.companyEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyEn: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. Alibaba Group"
                  />
                </div>
              </div>

              {/* 日期 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>开始日期 *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className={inputClass}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    首页只显示到月份，例如「2026.06 — 至今」/「JUN 2026 — PRESENT」。
                  </p>
                </div>
                <div>
                  <label className={labelClass}>结束日期</label>
                  <input
                    type="date"
                    value={formData.ongoing ? '' : formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    disabled={formData.ongoing}
                    className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  <label className="mt-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.ongoing}
                      onChange={(e) => setFormData(prev => ({ ...prev, ongoing: e.target.checked, endDate: e.target.checked ? '' : prev.endDate }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    至今（仍在进行，不填结束日期）
                  </label>
                </div>
              </div>

              {/* 描述 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>工作描述（中文）</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={inputClass}
                    placeholder="描述您的工作内容和成就（每行一条）"
                    rows={4}
                  />
                </div>
                <div>
                  <label className={labelClass}>工作描述（英文）</label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                    className={inputClass}
                    placeholder="English description"
                    rows={4}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>标签（逗号分隔）</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className={inputClass}
                  placeholder="例如：LangGraph, FastAPI, React"
                />
              </div>

              {/* 链接 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>链接地址</label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                    className={inputClass}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className={labelClass}>链接文字</label>
                  <input
                    type="text"
                    value={formData.linkLabel}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkLabel: e.target.value }))}
                    className={inputClass}
                    placeholder="例如：example.com"
                  />
                </div>
              </div>

              {/* 主卡专属 */}
              <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  以下两项<strong>只在首页主卡（排序最靠前的可见经历）上显示</strong>，其他经历可留空。
                </p>
                <div>
                  <label className={labelClass}>模块亮点</label>
                  <RowsEditor
                    columns={HIGHLIGHT_COLUMNS}
                    value={formData.highlights}
                    onChange={(rows) => setFormData(prev => ({ ...prev, highlights: rows }))}
                    addLabel="添加模块"
                    emptyText="暂无模块亮点"
                  />
                </div>
                <div>
                  <label className={labelClass}>关键指标（建议 4 条）</label>
                  <RowsEditor
                    columns={METRIC_COLUMNS}
                    value={formData.metrics}
                    onChange={(rows) => setFormData(prev => ({ ...prev, metrics: rows }))}
                    addLabel="添加指标"
                    emptyText="暂无指标"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  相关图片
                </label>
                <div className="space-y-4">
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {previewUrls.map((url, index) => {
                        const isExisting = index < formData.images.length;
                        return (
                          <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(index, isExisting)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {isExisting && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                                已上传
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">点击上传更多图片</p>
                    <p className="text-xs text-gray-400 mt-1">支持多选</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="expIsVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="expIsVisible" className="text-sm text-gray-700 dark:text-gray-300">
                  在首页显示
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
                    editingExperience ? '保存修改' : '添加经历'
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

export default ExperienceManagement;
