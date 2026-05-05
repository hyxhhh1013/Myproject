import { useState, useEffect, useRef } from 'react';
import { Trash2, Search, Loader2, ExternalLink, Edit, Plus, X, Upload } from 'lucide-react';
import { message } from 'antd';
import axios from '../../utils/axiosConfig';
import { getImageUrl } from '../../utils/imageUtils';

interface Project {
  id: number;
  title: string;
  description: string;
  intro?: string;
  technologies: string;
  responsibilities?: string;
  challengesProblem?: string;
  challengesSolution?: string;
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  isFeatured?: boolean;
  createdAt: string;
}

const initialFormData = {
  title: '',
  description: '',
  intro: '',
  technologies: '',
  responsibilities: '',
  challengesProblem: '',
  challengesSolution: '',
  githubUrl: '',
  demoUrl: '',
  imageUrl: '',
  isFeatured: false,
};

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
      const response = await axios.get('/api/projects');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setProjects(data);
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
        description: project.description,
        intro: project.intro || '',
        technologies: Array.isArray(project.technologies) 
          ? project.technologies.join(', ') 
          : (project.technologies.startsWith('[') ? JSON.parse(project.technologies).join(', ') : project.technologies),
        responsibilities: project.responsibilities || '',
        challengesProblem: project.challengesProblem || '',
        challengesSolution: project.challengesSolution || '',
        githubUrl: project.githubUrl || '',
        demoUrl: project.demoUrl || '',
        imageUrl: project.imageUrl || '',
        isFeatured: project.isFeatured || false,
      });
      setPreviewUrl(project.imageUrl ? getImageUrl(project.imageUrl) : '');
    } else {
      setEditingProject(null);
      setFormData(initialFormData);
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
      
      payloadData.append('title', formData.title.trim());
      payloadData.append('description', formData.description.trim());
      if (formData.intro.trim()) payloadData.append('intro', formData.intro.trim());
      payloadData.append('technologies', formData.technologies.trim());
      if (formData.responsibilities.trim()) payloadData.append('responsibilities', formData.responsibilities.trim());
      if (formData.challengesProblem.trim()) payloadData.append('challengesProblem', formData.challengesProblem.trim());
      if (formData.challengesSolution.trim()) payloadData.append('challengesSolution', formData.challengesSolution.trim());
      if (formData.githubUrl.trim()) payloadData.append('githubUrl', formData.githubUrl.trim());
      if (formData.demoUrl.trim()) payloadData.append('demoUrl', formData.demoUrl.trim());
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
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">项目管理</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">管理您的项目和作品</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <span className="text-sm text-gray-500">共 {projects.length} 个项目</span>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">添加项目</span>
            <span className="sm:hidden">添加</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索项目名称或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {project.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {project.intro || project.description}
              </p>
              
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">技术栈：</p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(project.technologies) 
                    ? project.technologies 
                    : (project.technologies?.startsWith('[') 
                        ? JSON.parse(project.technologies) 
                        : project.technologies?.split(',') || [])
                   ).map((tech: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {project.responsibilities && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">职责：</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{project.responsibilities}</p>
                </div>
              )}

              <div className="text-xs text-gray-400 mb-4">
                {new Date(project.createdAt).toLocaleDateString('zh-CN')}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink size={16} /> GitHub
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <ExternalLink size={16} /> 演示
                  </a>
                )}
                <button
                  onClick={() => handleOpenModal(project)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="编辑项目"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  disabled={deletingId === project.id}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                  title="删除项目"
                >
                  {deletingId === project.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p>暂无项目</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  项目名称 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入项目名称"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  项目简介（用于卡片展示）
                </label>
                <textarea
                  value={formData.intro}
                  onChange={(e) => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="简短的项目介绍，用于卡片展示"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  项目详细描述 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入项目详细描述"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  技术栈 * (逗号分隔)
                </label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: React, Node.js, MongoDB"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  我的职责（每行一条）
                </label>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="负责前端开发&#10;设计数据库结构&#10;实现用户认证"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    难点/问题
                  </label>
                  <textarea
                    value={formData.challengesProblem}
                    onChange={(e) => setFormData(prev => ({ ...prev, challengesProblem: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="项目中遇到的主要问题"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    解决方案
                  </label>
                  <textarea
                    value={formData.challengesSolution}
                    onChange={(e) => setFormData(prev => ({ ...prev, challengesSolution: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如何解决这个问题"
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GitHub 链接
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    演示链接
                  </label>
                  <input
                    type="url"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://demo.example.com"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  作为精选项目展示
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">选中后，该项目将在首页的精选项目预览中显示</p>
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
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">或者输入网络图片链接：</label>
                  <input
                    type="url"
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
