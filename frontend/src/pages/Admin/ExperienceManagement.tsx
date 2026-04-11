import { useState, useEffect, useRef } from 'react';
import { Trash2, Search, Loader2, Edit, Plus, X, Eye, EyeOff, Building2, Calendar, Upload } from 'lucide-react';
import axios from '../../utils/axiosConfig';

interface Experience {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  description?: string;
  images?: string[];
  isVisible?: boolean;
  orderIndex?: number;
  createdAt?: string;
}

const initialFormData = {
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  description: '',
  images: [] as string[],
  isVisible: true,
};

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
      setExperiences(data.sort((a: Experience, b: Experience) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ));
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
      alert('获取经历失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (experience?: Experience) => {
    if (experience) {
      setEditingExperience(experience);
      setFormData({
        company: experience.company,
        position: experience.position,
        startDate: experience.startDate.split('T')[0],
        endDate: experience.endDate ? experience.endDate.split('T')[0] : '',
        description: experience.description || '',
        images: experience.images || [],
        isVisible: experience.isVisible ?? true,
      });
      setPreviewUrls(experience.images?.map(img => img.startsWith('http') ? img : `${img}`) || []);
    } else {
      setEditingExperience(null);
      setFormData(initialFormData);
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
      alert('部分文件不是图片格式，已被忽略');
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
      alert('请填写公司名称、职位和开始日期');
      return;
    }

    try {
      setSubmitting(true);
      const payloadData = new FormData();
      payloadData.append('company', formData.company.trim());
      payloadData.append('position', formData.position.trim());
      payloadData.append('startDate', new Date(formData.startDate).toISOString());
      if (formData.endDate) {
        payloadData.append('endDate', new Date(formData.endDate).toISOString());
      }
      if (formData.description.trim()) {
        payloadData.append('description', formData.description.trim());
      }
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
      alert('保存失败，请重试');
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
      alert('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisible = async (id: number, currentState: boolean) => {
    try {
      await axios.put(`/api/experience/${id}`, { isVisible: !currentState });
      setExperiences(experiences.map(e => e.id === id ? { ...e, isVisible: !currentState } : e));
      
      // 更新localStorage，触发前端展示部分刷新
      localStorage.setItem('experienceUpdated', Date.now().toString());
    } catch (error) {
      console.error('Failed to update experience:', error);
      alert('更新失败，请重试');
    }
  };

  const filteredExperiences = experiences.filter(exp =>
    exp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exp.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理您的工作经历</p>
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {exp.position}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {exp.company}
                      </p>
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  公司名称 *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：阿里巴巴"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  职位名称 *
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：高级前端工程师"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    开始日期 *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    结束日期
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">留空表示至今</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  工作描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="描述您的工作内容和成就（每行一条）"
                  rows={4}
                />
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
