import { useState, useEffect, useRef } from 'react';
import { Trash2, Search, Loader2, Edit, Plus, X, Star, Eye, EyeOff, Upload } from 'lucide-react';
import { message } from 'antd';
import axios from '../../utils/axiosConfig';
import { getImageUrl } from '../../utils/imageUtils';

interface Travel {
  id: number;
  name: string;
  city?: string;
  province?: string;
  country: string;
  description?: string;
  imageUrl?: string;
  photos?: string[];
  rating?: number;
  highlights?: string;
  tips?: string;
  visitedAt?: string;
  latitude?: number;
  longitude?: number;
  isVisible: boolean;
  orderIndex?: number;
  createdAt: string;
}

const initialFormData = {
  city: '',
  province: '',
  country: '中国',
  description: '',
  imageUrl: '',
  photos: [] as string[],
  rating: '',
  highlights: '',
  tips: '',
  visitedAt: '',
  latitude: '',
  longitude: '',
  isVisible: true,
};

const TravelManagement = () => {
  const [travels, setTravels] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTravel, setEditingTravel] = useState<Travel | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTravels();
  }, []);

  const fetchTravels = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/travel-cities');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setTravels(data);
    } catch (error) {
      console.error('Failed to fetch travels:', error);
      message.error('获取旅行记录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (travel?: Travel) => {
    if (travel) {
      setEditingTravel(travel);
      setFormData({
        city: travel.city || travel.name || '',
        province: travel.province || '',
        country: travel.country,
        description: travel.description || '',
        imageUrl: travel.imageUrl || '',
        photos: travel.photos || [],
        rating: travel.rating?.toString() || '',
        highlights: travel.highlights || '',
        tips: travel.tips || '',
        visitedAt: travel.visitedAt ? travel.visitedAt.split('T')[0] : '',
        latitude: travel.latitude?.toString() || '',
        longitude: travel.longitude?.toString() || '',
        isVisible: travel.isVisible,
      });
      setPreviewUrls(travel.photos?.map(img => getImageUrl(img)) || []);
      setCoverPreview(travel.imageUrl ? getImageUrl(travel.imageUrl) : '');
    } else {
      setEditingTravel(null);
      setFormData(initialFormData);
      setPreviewUrls([]);
      setCoverPreview('');
    }
    setSelectedFiles([]);
    setCoverFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTravel(null);
    setFormData(initialFormData);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setCoverFile(null);
    setCoverPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
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

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.warning('请选择图片文件');
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    // 清除封面图片链接，使用上传的文件
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const newImages = [...formData.photos];
      newImages.splice(index, 1);
      setFormData(prev => ({ ...prev, photos: newImages }));
      
      const newPreviewUrls = [...previewUrls];
      newPreviewUrls.splice(index, 1);
      setPreviewUrls(newPreviewUrls);
    } else {
      const existingCount = formData.photos.length;
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
    
    if (!formData.city.trim() || !formData.country.trim()) {
      message.warning('请填写城市和国家');
      return;
    }

    try {
      setSubmitting(true);
      const payloadData = new FormData();
      payloadData.append('city', formData.city.trim());
      if (formData.province.trim()) payloadData.append('province', formData.province.trim());
      payloadData.append('country', formData.country.trim());
      if (formData.description.trim()) payloadData.append('description', formData.description.trim());
      if (formData.imageUrl.trim()) payloadData.append('imageUrl', formData.imageUrl.trim());
      if (formData.rating) payloadData.append('rating', formData.rating.toString());
      if (formData.highlights.trim()) payloadData.append('highlights', formData.highlights.trim());
      if (formData.tips.trim()) payloadData.append('tips', formData.tips.trim());
      if (formData.visitedAt) payloadData.append('visitedAt', new Date(formData.visitedAt).toISOString());
      if (formData.latitude) payloadData.append('latitude', formData.latitude.toString());
      if (formData.longitude) payloadData.append('longitude', formData.longitude.toString());
      payloadData.append('isVisible', formData.isVisible.toString());

      // Append existing images that weren't removed
      payloadData.append('existingImages', JSON.stringify(formData.photos));

      // Append cover image file if uploaded
      if (coverFile) {
        payloadData.append('coverImage', coverFile);
      }

      // Append new files
      selectedFiles.forEach(file => {
        payloadData.append('images', file);
      });

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      if (editingTravel) {
        await axios.put(`/api/travel-cities/${editingTravel.id}`, payloadData, config);
      } else {
        await axios.post('/api/travel-cities', payloadData, config);
      }

      await fetchTravels();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save travel:', error);
      message.error('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个旅行记录吗？')) return;
    
    try {
      setDeletingId(id);
      await axios.delete(`/api/travel-cities/${id}`);
      setTravels(travels.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete travel:', error);
      message.error('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisible = async (id: number, currentState: boolean) => {
    try {
      await axios.put(`/api/travel-cities/${id}`, { isVisible: !currentState });
      setTravels(travels.map(t => t.id === id ? { ...t, isVisible: !currentState } : t));
    } catch (error) {
      console.error('Failed to update travel:', error);
      message.error('更新失败，请重试');
    }
  };

  const filteredTravels = travels.filter(travel =>
    (travel.name || travel.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (travel.province || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (travel.country || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (travel.description || '').toLowerCase().includes(searchTerm.toLowerCase())
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">旅行管理</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理您的旅行足迹</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">共 {travels.length} 个地点</span>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>添加地点</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索城市、省份或国家..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTravels.map((travel) => (
          <div key={travel.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 overflow-hidden">
            {travel.imageUrl && (
              <div className="relative h-40">
                <img 
                  src={travel.imageUrl} 
                  alt={travel.name || travel.city || ''}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white">
                    {travel.name || travel.city || '未命名'}
                  </h3>
                  <p className="text-sm text-white/80">
                    {travel.province && `${travel.province} · `}{travel.country}
                  </p>
                </div>
              </div>
            )}
            <div className="p-4">
              {!travel.imageUrl && (
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {travel.name || travel.city || '未命名'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {travel.province && `${travel.province} · `}{travel.country}
                  </p>
                </div>
              )}
              
              {travel.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {travel.description}
                </p>
              )}

              <div className="flex items-center justify-between mb-3">
                {travel.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{travel.rating}</span>
                  </div>
                )}
                {travel.visitedAt && (
                  <span className="text-xs text-gray-400">
                    {new Date(travel.visitedAt).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>

              {travel.highlights && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">亮点：</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{travel.highlights}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleToggleVisible(travel.id, travel.isVisible)}
                  className={`p-2 rounded-full transition-colors ${
                    travel.isVisible 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}
                  title={travel.isVisible ? '点击隐藏' : '点击显示'}
                >
                  {travel.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(travel)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(travel.id)}
                    disabled={deletingId === travel.id}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                    title="删除"
                  >
                    {deletingId === travel.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTravels.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p>暂无旅行记录</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingTravel ? '编辑旅行记录' : '添加旅行记录'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    城市 *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：北京"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    省份
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：北京市"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    国家 *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：中国"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    评分
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0-5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="旅行描述"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  封面图片
                </label>
                <div className="space-y-3">
                  {coverPreview && (
                    <div className="relative w-full max-w-xs mx-auto">
                      <img 
                        src={coverPreview} 
                        alt="封面预览" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview('');
                          if (coverInputRef.current) {
                            coverInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        上传封面图片
                      </label>
                      <div
                        onClick={() => coverInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                      >
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileSelect}
                          className="hidden"
                        />
                        <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">点击上传封面</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        或输入图片链接
                      </label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
                          if (e.target.value) {
                            setCoverPreview(e.target.value);
                            setCoverFile(null);
                          }
                        }}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  旅行照片集
                </label>
                <div className="space-y-4">
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {previewUrls.map((url, index) => {
                        const isExisting = index < formData.photos.length;
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">点击上传旅行照片</p>
                    <p className="text-xs text-gray-400 mt-1">支持多选，用于详细弹窗展示</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  旅行亮点（每行一个）
                </label>
                <textarea
                  value={formData.highlights}
                  onChange={(e) => setFormData(prev => ({ ...prev, highlights: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="故宫博物院&#10;长城&#10;天坛"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  旅行小贴士
                </label>
                <textarea
                  value={formData.tips}
                  onChange={(e) => setFormData(prev => ({ ...prev, tips: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="给其他旅行者的建议"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    纬度
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="39.9042"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    经度
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="116.4074"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  访问日期
                </label>
                <input
                  type="date"
                  value={formData.visitedAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, visitedAt: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="travelIsVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="travelIsVisible" className="text-sm text-gray-700 dark:text-gray-300">
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
                    editingTravel ? '保存修改' : '添加地点'
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

export default TravelManagement;
