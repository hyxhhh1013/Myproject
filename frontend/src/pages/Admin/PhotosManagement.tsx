import { useState, useEffect, useRef } from 'react';
import { Trash2, Search, Loader2, Edit, Plus, X, Eye, EyeOff, Upload } from 'lucide-react';
import axios from '../../utils/axiosConfig';
import exifr from 'exifr';

interface PhotoCategory {
  id: number;
  name: string;
  description?: string;
  coverUrl?: string;
  orderIndex?: number;
}

interface Photo {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  categoryId?: number;
  category?: PhotoCategory;
  location?: string;
  takenAt?: string;
  cameraModel?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  width?: number;
  height?: number;
  isVisible: boolean;
  orderIndex?: number;
  createdAt: string;
}

const initialFormData = {
  title: '',
  description: '',
  imageUrl: '',
  thumbnailUrl: '',
  categoryId: '',
  location: '',
  takenAt: '',
  cameraModel: '',
  lens: '',
  focalLength: '',
  aperture: '',
  shutterSpeed: '',
  iso: '',
  isVisible: true,
};

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${url}`;
};

const PhotosManagement = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<PhotoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
    fetchCategories();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/photos');
      const data = response.data?.photos || response.data?.data || [];
      setPhotos(data);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      alert('获取照片失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/photo-categories');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleOpenModal = (photo?: Photo) => {
    if (photo) {
      setEditingPhoto(photo);
      setFormData({
        title: photo.title,
        description: photo.description || '',
        imageUrl: photo.imageUrl,
        thumbnailUrl: photo.thumbnailUrl || '',
        categoryId: photo.categoryId?.toString() || '',
        location: photo.location || '',
        takenAt: photo.takenAt ? photo.takenAt.split('T')[0] : '',
        cameraModel: photo.cameraModel || '',
        lens: photo.lens || '',
        focalLength: photo.focalLength || '',
        aperture: photo.aperture || '',
        shutterSpeed: photo.shutterSpeed || '',
        iso: photo.iso || '',
        isVisible: photo.isVisible,
      });
      setPreviewUrl(photo.imageUrl ? `${photo.imageUrl}` : '');
    } else {
      setEditingPhoto(null);
      setFormData(initialFormData);
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPhoto(null);
    setFormData(initialFormData);
    setPreviewUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    
    // Automatically set title if it's empty and we are creating a new photo
    if (!formData.title && !editingPhoto) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setFormData(prev => ({ ...prev, title: fileName }));
    }

    // Parse EXIF data
    try {
      const exifData = await exifr.parse(file);
      if (exifData) {
        setFormData(prev => ({
          ...prev,
          cameraModel: exifData.Model || prev.cameraModel,
          lens: exifData.LensModel || exifData.Lens || prev.lens,
          focalLength: exifData.FocalLength ? `${exifData.FocalLength}mm` : prev.focalLength,
          aperture: exifData.FNumber ? `${exifData.FNumber}` : prev.aperture,
          shutterSpeed: exifData.ExposureTime ? `1/${Math.round(1 / exifData.ExposureTime)}` : prev.shutterSpeed,
          iso: exifData.ISO ? `${exifData.ISO}` : prev.iso,
          // Optional: Extract creation date
          takenAt: exifData.DateTimeOriginal ? new Date(exifData.DateTimeOriginal).toISOString().split('T')[0] : prev.takenAt
        }));
      }
    } catch (error) {
      console.error('Failed to parse EXIF data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('请填写标题');
      return;
    }

    if (!editingPhoto && !selectedFile) {
      alert('请上传照片');
      return;
    }

    try {
      setSubmitting(true);
      
      const payloadData = new FormData();
      if (selectedFile) {
        payloadData.append('image', selectedFile);
      }
      payloadData.append('title', formData.title.trim());
      if (formData.description.trim()) payloadData.append('description', formData.description.trim());
      if (formData.categoryId) payloadData.append('categoryId', formData.categoryId.toString());
      if (formData.location.trim()) payloadData.append('location', formData.location.trim());
      if (formData.takenAt) payloadData.append('takenAt', new Date(formData.takenAt).toISOString());
      if (formData.cameraModel.trim()) payloadData.append('cameraModel', formData.cameraModel.trim());
      if (formData.lens.trim()) payloadData.append('lens', formData.lens.trim());
      if (formData.focalLength.trim()) payloadData.append('focalLength', formData.focalLength.trim());
      if (formData.aperture.trim()) payloadData.append('aperture', formData.aperture.trim());
      if (formData.shutterSpeed.trim()) payloadData.append('shutterSpeed', formData.shutterSpeed.trim());
      if (formData.iso.trim()) payloadData.append('iso', formData.iso.trim());
      payloadData.append('isVisible', formData.isVisible.toString());

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      if (editingPhoto) {
        await axios.put(`/api/photos/${editingPhoto.id}`, payloadData, config);
      } else {
        await axios.post('/api/photos', payloadData, config);
      }

      await fetchPhotos();
      handleCloseModal();
      
      // 更新localStorage，触发前端展示部分刷新
      localStorage.setItem('photosUpdated', Date.now().toString());
      
      alert('保存成功！');
    } catch (error: any) {
      console.error('Failed to save photo:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || '保存失败，请重试';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这张照片吗？')) return;
    
    try {
      setDeletingId(id);
      await axios.delete(`/api/photos/${id}`);
      setPhotos(photos.filter(p => p.id !== id));
      
      // 更新localStorage，触发前端展示部分刷新
      localStorage.setItem('photosUpdated', Date.now().toString());
    } catch (error) {
      console.error('Failed to delete photo:', error);
      alert('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisible = async (id: number, currentState: boolean) => {
    try {
      await axios.put(`/api/photos/${id}`, { isVisible: !currentState });
      setPhotos(photos.map(p => p.id === id ? { ...p, isVisible: !currentState } : p));
      
      // 更新localStorage，触发前端展示部分刷新
      localStorage.setItem('photosUpdated', Date.now().toString());
    } catch (error) {
      console.error('Failed to update photo:', error);
      alert('更新失败，请重试');
    }
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = 
      photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (photo.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (photo.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterCategory === 'all' || photo.categoryId?.toString() === filterCategory;
    
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">照片管理</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">管理您的摄影作品</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <span className="text-sm text-gray-500">共 {photos.length} 张照片</span>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">添加照片</span>
            <span className="sm:hidden">添加</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索照片标题、描述或地点..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full"
        >
          <option value="all">全部分类</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredPhotos.map((photo) => (
          <div key={photo.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 overflow-hidden group">
            <div className="relative aspect-square">
              <img
                src={getImageUrl(photo.thumbnailUrl || photo.imageUrl)}
                alt={photo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(photo)}
                    className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors"
                    title="编辑"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleToggleVisible(photo.id, photo.isVisible)}
                    className={`p-2 rounded-full transition-colors ${
                      photo.isVisible 
                        ? 'bg-green-500/90 text-white'
                        : 'bg-gray-500/90 text-white'
                    }`}
                    title={photo.isVisible ? '隐藏' : '显示'}
                  >
                    {photo.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId === photo.id}
                    className="p-2 bg-red-500/90 rounded-full text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    title="删除"
                  >
                    {deletingId === photo.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {!photo.isVisible && (
                <div className="absolute top-2 right-2 bg-gray-800/80 text-white text-xs px-2 py-1 rounded">
                  已隐藏
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                {photo.title}
              </h3>
              {photo.location && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                  📍 {photo.location}
                </p>
              )}
              <div className="flex flex-wrap gap-1 text-xs text-gray-400">
                {photo.cameraModel && (
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {photo.cameraModel}
                  </span>
                )}
                {photo.aperture && (
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    f/{photo.aperture}
                  </span>
                )}
                {photo.iso && (
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    ISO {photo.iso}
                  </span>
                )}
              </div>
              {photo.category && (
                <div className="mt-2">
                  <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    {photo.category?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p>暂无照片</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingPhoto ? '编辑照片' : '添加照片'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    照片标题 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入照片标题"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    分类
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">无分类</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  照片描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="照片描述（可选）"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={editingPhoto ? '' : 'md:col-span-2'}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {editingPhoto ? '当前照片' : '照片 *'}
                  </label>
                  {!editingPhoto ? (
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {previewUrl ? (
                        <div className="relative">
                          <img src={previewUrl} alt="预览" className="w-full max-h-64 object-contain rounded-lg" />
                          <p className="text-xs text-green-600 mt-2">✓ 图片已选择</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600 dark:text-gray-400">点击选择照片</p>
                          <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP 等格式，将自动解析EXIF信息</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={previewUrl || getImageUrl(formData.imageUrl)}
                          alt="当前照片"
                          className="w-full h-48 object-contain"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <p className="text-sm text-gray-600 dark:text-gray-400">点击更换照片</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    拍摄地点
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：北京·故宫"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    拍摄日期
                  </label>
                  <input
                    type="date"
                    value={formData.takenAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, takenAt: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">EXIF 信息</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">相机型号</label>
                    <input
                      type="text"
                      value={formData.cameraModel}
                      onChange={(e) => setFormData(prev => ({ ...prev, cameraModel: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Sony A7III"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">镜头</label>
                    <input
                      type="text"
                      value={formData.lens}
                      onChange={(e) => setFormData(prev => ({ ...prev, lens: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="24-70mm f/2.8"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">焦距</label>
                    <input
                      type="text"
                      value={formData.focalLength}
                      onChange={(e) => setFormData(prev => ({ ...prev, focalLength: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="50mm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">光圈</label>
                    <input
                      type="text"
                      value={formData.aperture}
                      onChange={(e) => setFormData(prev => ({ ...prev, aperture: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="2.8"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">快门速度</label>
                    <input
                      type="text"
                      value={formData.shutterSpeed}
                      onChange={(e) => setFormData(prev => ({ ...prev, shutterSpeed: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="1/500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">ISO</label>
                    <input
                      type="text"
                      value={formData.iso}
                      onChange={(e) => setFormData(prev => ({ ...prev, iso: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="photoIsVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="photoIsVisible" className="text-sm text-gray-700 dark:text-gray-300">
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
                    editingPhoto ? '保存修改' : '添加照片'
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

export default PhotosManagement;
