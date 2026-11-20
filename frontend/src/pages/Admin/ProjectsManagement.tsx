import { useState, useEffect, useRef } from 'react';
import { Trash2, Search, Loader2, ExternalLink, Edit, Plus, X, Upload } from 'lucide-react';
import { message } from 'antd';
import axios from '../../utils/axiosConfig';
import { getImageUrl } from '../../utils/imageUtils';
import RowsEditor, {
  METRIC_COLUMNS,
  METRIC_KEYS,
  parseJsonRows,
  parseJsonStringList,
  serializeRows,
  type RowValue,
} from '../../components/Admin/RowsEditor';

interface Project {
  id: number;
  title: string;
  titleEn?: string | null;
  badge?: string | null;
  badgeEn?: string | null;
  description: string;
  descriptionEn?: string | null;
  intro?: string | null;
  technologies: string;
  responsibilities?: string | null;
  responsibilitiesEn?: string | null;
  challengesProblem?: string | null;
  challengesProblemEn?: string | null;
  challengesSolution?: string | null;
  challengesSolutionEn?: string | null;
  metrics?: string | Record<string, unknown>[] | null; // JSON string (or already-parsed array)
  githubUrl?: string | null;
  demoUrl?: string | null;
  imageUrl?: string | null;
  isFeatured?: boolean;
  isVisible?: boolean;
  orderIndex?: number;
  createdAt: string;
}

const initialFormData = {
  title: '',
  titleEn: '',
  badge: '',
  badgeEn: '',
  description: '',
  descriptionEn: '',
  intro: '',
  technologies: '',
  responsibilities: '',
  responsibilitiesEn: '',
  challengesProblem: '',
  challengesProblemEn: '',
  challengesSolution: '',
  challengesSolutionEn: '',
  metrics: [] as RowValue[],
  githubUrl: '',
  demoUrl: '',
  imageUrl: '',
  isFeatured: false,
  isVisible: true,
  orderIndex: '0',
};

const inputClass =
  'w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
const hintClass = 'text-xs text-gray-500 dark:text-gray-400 mt-1';

// Same order as the homepage: orderIndex asc, then id asc.
const byHomepageOrder = (a: Project, b: Project) =>
  (a.orderIndex ?? 0) - (b.orderIndex ?? 0) || a.id - b.id;

const ProjectsManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // The list endpoint pages at 10 by default; ask for all of them.
      const response = await axios.get('/api/projects', { params: { limit: 100 } });
      const data: Project[] = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setProjects([...data].sort(byHomepageOrder));
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      message.error('获取项目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        titleEn: project.titleEn || '',
        badge: project.badge || '',
        badgeEn: project.badgeEn || '',
        description: project.description,
        descriptionEn: project.descriptionEn || '',
        intro: project.intro || '',
        technologies: parseJsonStringList(project.technologies).join(', '),
        responsibilities: project.responsibilities || '',
        responsibilitiesEn: project.responsibilitiesEn || '',
        challengesProblem: project.challengesProblem || '',
        challengesProblemEn: project.challengesProblemEn || '',
        challengesSolution: project.challengesSolution || '',
        challengesSolutionEn: project.challengesSolutionEn || '',
        metrics: parseJsonRows(project.metrics, METRIC_KEYS),
        githubUrl: project.githubUrl || '',
        demoUrl: project.demoUrl || '',
        imageUrl: project.imageUrl || '',
        isFeatured: project.isFeatured || false,
        isVisible: project.isVisible !== false,
        orderIndex: String(project.orderIndex ?? 0),
      });
      setPreviewUrl(project.imageUrl ? getImageUrl(project.imageUrl) : '');
    } else {
      setEditingProject(null);
      // New projects go to the end so they never silently replace the flagship.
      const nextOrder = projects.length > 0 ? Math.max(...projects.map(p => p.orderIndex ?? 0)) + 1 : 0;
      setFormData({ ...initialFormData, orderIndex: String(nextOrder) });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData(initialFormData);
    setPreviewUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.warning('请选择图片文件');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    // 当选择文件时，清除imageUrl字段，避免浏览器验证
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.technologies.trim()) {
      message.warning('请填写标题、描述和技术栈');
      return;
    }

    try {
      setSubmitting(true);
      
      const payloadData = new FormData();
      if (selectedFile) {
        payloadData.append('demoFile', selectedFile);
      }
      
      // Optional fields: on create send only filled ones; on update always send them,
      // so a cleared field goes out as '' (backend: empty = null, absent = unchanged).
      const isUpdate = !!editingProject;
      const appendOptional = (key: string, value: string) => {
        if (isUpdate || value !== '') payloadData.append(key, value);
      };

      payloadData.append('title', formData.title.trim());
      appendOptional('titleEn', formData.titleEn.trim());
      appendOptional('badge', formData.badge.trim());
      appendOptional('badgeEn', formData.badgeEn.trim());
      payloadData.append('description', formData.description.trim());
      appendOptional('descriptionEn', formData.descriptionEn.trim());
      appendOptional('intro', formData.intro.trim());
      payloadData.append('technologies', formData.technologies.trim());
      appendOptional('responsibilities', formData.responsibilities.trim());
      appendOptional('responsibilitiesEn', formData.responsibilitiesEn.trim());
      appendOptional('challengesProblem', formData.challengesProblem.trim());
      appendOptional('challengesProblemEn', formData.challengesProblemEn.trim());
      appendOptional('challengesSolution', formData.challengesSolution.trim());
      appendOptional('challengesSolutionEn', formData.challengesSolutionEn.trim());
      appendOptional('metrics', serializeRows(formData.metrics, METRIC_KEYS));
      appendOptional('githubUrl', formData.githubUrl.trim());
      appendOptional('demoUrl', formData.demoUrl.trim());
      payloadData.append('orderIndex', String(Math.max(0, parseInt(formData.orderIndex, 10) || 0)));
      payloadData.append('isVisible', formData.isVisible.toString());
      payloadData.append('isFeatured', formData.isFeatured.toString());
      
      // If user typed a URL manually and didn't select a file, use it
      if (formData.imageUrl.trim() && !selectedFile) {
         payloadData.append('imageUrl', formData.imageUrl.trim());
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      if (editingProject) {
        await axios.put(`/api/projects/${editingProject.id}`, payloadData, config);
      } else {
        await axios.post('/api/projects', payloadData, config);
      }

      await fetchProjects();
      handleCloseModal();
      
      // 更新localStorage，触发首页数据刷新
      localStorage.setItem('projectUpdated', Date.now().toString());
    } catch (error) {
      console.error('Failed to save project:', error);
      message.error('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个项目吗？')) return;
    
    try {
      setDeletingId(id);
      await axios.delete(`/api/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
      message.error('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.titleEn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // The first visible project (homepage order) is the homepage flagship card.
  const flagshipId = projects.find(p => p.isVisible !== false)?.id;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Editorial Toolbar (Title is already in AdminLayout header) */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C877E] w-4 h-4" />
          <input
            type="text"
            placeholder="搜索项目名称、简介或技术栈..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#161614] border border-[#E6E2D8] dark:border-[#262522] rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs font-mono text-[#8C877E]">
            TOTAL // {filteredProjects.length} / {projects.length}
          </span>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center gap-1.5 bg-[#141413] dark:bg-[#F0EFEA] text-[#FAF9F5] dark:text-[#141413] hover:opacity-90 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-opacity"
          >
            <Plus size={16} />
            <span>新建项目</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const techs: string[] = parseJsonStringList(project.technologies);

          return (
            <div
              key={project.id}
              className="group bg-white dark:bg-[#161614] rounded-xl border border-[#E6E2D8] dark:border-[#262522] hover:border-[#8A6F48]/45 transition-all overflow-hidden flex flex-col"
            >
              {/* 16:9 Cover Image Preview + Featured Badge */}
              <div className="relative aspect-[16/9] w-full bg-[#F3F1EC] dark:bg-[#1D1D1A] border-b border-[#E6E2D8] dark:border-[#262522] overflow-hidden">
                {project.imageUrl ? (
                  <img
                    src={getImageUrl(project.imageUrl)}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] font-mono uppercase tracking-widest text-[#8C877E]/70">
                    NO COVER // PROJECT #{project.id}
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  {project.id === flagshipId && (
                    <span className="px-2 py-0.5 rounded bg-[#8A6F48]/90 text-[#FAF9F5] text-[10px] font-mono tracking-wider backdrop-blur-xs">
                      FLAGSHIP · 首页旗舰
                    </span>
                  )}
                  {project.isFeatured && (
                    <span className="px-2 py-0.5 rounded bg-[#141413]/85 text-[#FAF9F5] text-[10px] font-mono tracking-wider backdrop-blur-xs">
                      FEATURED · 精选
                    </span>
                  )}
                  {project.isVisible === false && (
                    <span className="px-2 py-0.5 rounded bg-gray-500/85 text-white text-[10px] font-mono tracking-wider backdrop-blur-xs">
                      HIDDEN · 已隐藏
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold text-[#141413] dark:text-[#F0EFEA] line-clamp-1">
                    {project.title}
                  </h3>
                  <span className="text-[11px] font-mono text-[#8C877E] shrink-0">
                    排序 {project.orderIndex ?? 0} · {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                {(project.titleEn || project.badge) && (
                  <p className="text-[11px] font-mono text-[#8C877E] mb-2 line-clamp-1">
                    {[project.titleEn, project.badge].filter(Boolean).join(' · ')}
                  </p>
                )}

                <p className="text-xs sm:text-[13px] text-[#6E6A63] dark:text-[#9E9A92] mb-4 line-clamp-2 leading-relaxed">
                  {project.intro || project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {techs.slice(0, 5).map((tech: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-[#FAF9F5] dark:bg-[#1E1E1B] border border-[#E6E2D8] dark:border-[#2B2A26] text-[#524E48] dark:text-[#C8C3B8] text-[11px] font-mono rounded"
                    >
                      {tech.trim()}
                    </span>
                  ))}
                  {techs.length > 5 && (
                    <span className="px-1.5 py-0.5 text-[11px] font-mono text-[#8C877E]">
                      +{techs.length - 5}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-[#E6E2D8] dark:border-[#262522] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#524E48] dark:text-[#B5B0A6] hover:text-[#8A6F48] transition-colors"
                      >
                        <ExternalLink size={13} />
                        <span>GitHub</span>
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#8A6F48] dark:text-[#C8A97E] hover:underline"
                      >
                        <ExternalLink size={13} />
                        <span>演示</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(project)}
                      className="p-1.5 text-[#524E48] dark:text-[#B5B0A6] hover:text-[#141413] dark:hover:text-[#F0EFEA] hover:bg-[#F3F1EC] dark:hover:bg-[#22211E] rounded-md transition-colors"
                      title="编辑项目"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="p-1.5 text-rose-600/80 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors disabled:opacity-50"
                      title="删除项目"
                    >
                      {deletingId === project.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p>暂无项目</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingProject ? '编辑项目' : '添加项目'}
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

              {/* 排序与显示 */}
              <div className="p-4 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/40 rounded-lg space-y-3">
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
                  <div className="md:col-span-2 md:pt-7 flex flex-wrap gap-x-6 gap-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.isVisible}
                        onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      在首页显示
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      精选标记
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  数字越小越靠前（相同时按创建先后）。<strong>排序最靠前的「可见」项目就是首页的旗舰大卡</strong>，其余依次为普通卡片，编号 01、02… 按此顺序生成。「精选标记」不影响首页排序。
                </p>
              </div>

              {/* 标题 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>项目名称（中文）*</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={inputClass}
                    placeholder="例如：禾书耕文 · AI4Science 写作系统"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>项目名称（英文）</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. HeShu · AI4Science Writing System"
                  />
                </div>
              </div>

              {/* 徽标 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>徽标（中文）</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    className={inputClass}
                    placeholder="例如：AIFA 实验室重点项目 · 2026.03–至今"
                  />
                </div>
                <div>
                  <label className={labelClass}>徽标（英文）</label>
                  <input
                    type="text"
                    value={formData.badgeEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, badgeEn: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. AIFA LAB FLAGSHIP · 2026.03–PRESENT"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>项目简介（用于卡片展示）</label>
                <textarea
                  value={formData.intro}
                  onChange={(e) => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                  className={inputClass}
                  placeholder="简短的项目介绍，用于卡片展示"
                  rows={2}
                />
              </div>

              {/* 描述 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>项目描述（中文）*</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={inputClass}
                    placeholder="输入项目详细描述"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>项目描述（英文）</label>
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
                <label className={labelClass}>技术栈 * (逗号分隔)</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                  className={inputClass}
                  placeholder="例如: React, Node.js, MongoDB"
                  required
                />
              </div>

              {/* 职责 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>我的职责（中文，每行一条）</label>
                  <textarea
                    value={formData.responsibilities}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                    className={inputClass}
                    placeholder="负责前端开发&#10;设计数据库结构&#10;实现用户认证"
                    rows={4}
                  />
                </div>
                <div>
                  <label className={labelClass}>我的职责（英文，每行一条）</label>
                  <textarea
                    value={formData.responsibilitiesEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsibilitiesEn: e.target.value }))}
                    className={inputClass}
                    placeholder="Built the frontend&#10;Designed the database schema&#10;Implemented auth"
                    rows={4}
                  />
                  <p className={hintClass}>建议与中文逐行对应，条数一致。</p>
                </div>
              </div>

              {/* 难点 / 方案 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>难点/问题（中文）</label>
                  <textarea
                    value={formData.challengesProblem}
                    onChange={(e) => setFormData(prev => ({ ...prev, challengesProblem: e.target.value }))}
                    className={inputClass}
                    placeholder="项目中遇到的主要问题"
                    rows={3}
                  />
                </div>
                <div>
                  <label className={labelClass}>难点/问题（英文）</label>
                  <textarea
                    value={formData.challengesProblemEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, challengesProblemEn: e.target.value }))}
                    className={inputClass}
                    placeholder="The main challenge"
                    rows={3}
                  />
                </div>
                <div>
                  <label className={labelClass}>解决方案（中文）</label>
                  <textarea
                    value={formData.challengesSolution}
                    onChange={(e) => setFormData(prev => ({ ...prev, challengesSolution: e.target.value }))}
                    className={inputClass}
                    placeholder="如何解决这个问题"
                    rows={3}
                  />
                </div>
                <div>
                  <label className={labelClass}>解决方案（英文）</label>
                  <textarea
                    value={formData.challengesSolutionEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, challengesSolutionEn: e.target.value }))}
                    className={inputClass}
                    placeholder="How it was solved"
                    rows={3}
                  />
                </div>
              </div>

              {/* 指标 */}
              <div>
                <label className={labelClass}>关键指标</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  显示在首页旗舰卡（排序最靠前的可见项目）的数据条中；其他项目可留空。
                </p>
                <RowsEditor
                  columns={METRIC_COLUMNS}
                  value={formData.metrics}
                  onChange={(rows) => setFormData(prev => ({ ...prev, metrics: rows }))}
                  addLabel="添加指标"
                  emptyText="暂无指标"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>GitHub 链接</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    className={inputClass}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div>
                  <label className={labelClass}>演示链接</label>
                  <input
                    type="url"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                    className={inputClass}
                    placeholder="https://demo.example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  项目展示图
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {previewUrl ? (
                      <div className="relative">
                        <img src={previewUrl} alt="预览" className="mx-auto max-h-64 object-contain rounded-lg" />
                        <div className="mt-4 flex justify-center">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-blue-600 hover:text-blue-500"
                          >
                            更换图片
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400 mt-4 justify-center">
                          <span className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            上传图片
                          </span>
                          <p className="pl-1">或拖拽文件到此处</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">支持 PNG, JPG, GIF 等格式</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">或者输入网络图片链接（注意：后端目前不保存此链接，请以上传图片为准）：</label>
                  <input
                    // Not type="url": it is prefilled with the stored image path, which is
                    // relative (/uploads/…), and the browser's URL check then blocked every save.
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
                      setSelectedFile(null);
                      setPreviewUrl(e.target.value);
                    }}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
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
                    editingProject ? '保存修改' : '添加项目'
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

export default ProjectsManagement;
