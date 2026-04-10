import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, MapPin, Upload, X, Loader2 } from 'lucide-react';
import axios from '../../utils/axiosConfig';

interface Moment {
  id: number;
  content: string;
  images: string | null;
  location: string | null;
  likes: number;
  isVisible: boolean;
  createdAt: string;
}

export default function MomentsManagement() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMoment, setCurrentMoment] = useState<Partial<Moment>>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // 图片上传相关状态
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMoments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/moments');
      setMoments(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取动态失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, []);

  const handleOpenModal = (moment?: Moment) => {
    if (moment) {
      setCurrentMoment(moment);
      
      // 解析现有图片
      let existingImages: string[] = [];
      if (moment.images) {
        try {
          existingImages = JSON.parse(moment.images);
        } catch (e) {
          console.error("Failed to parse images:", e);
        }
      }
      setPreviewUrls(existingImages);
    } else {
      setCurrentMoment({ isVisible: true, content: '' });
      setPreviewUrls([]);
    }
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    // 假设 currentMoment 中的图片是通过 JSON 解析得来的数组长度
    let existingImagesCount = 0;
    if (currentMoment.images) {
      try {
        existingImagesCount = JSON.parse(currentMoment.images).length;
      } catch (e) { }
    }

    if (index < existingImagesCount) {
      // 移除现有图片
      try {
        const currentImages = JSON.parse(currentMoment.images || '[]');
        currentImages.splice(index, 1);
        setCurrentMoment(prev => ({ ...prev, images: JSON.stringify(currentImages) }));
      } catch (e) {}
      
      const newPreviewUrls = [...previewUrls];
      newPreviewUrls.splice(index, 1);
      setPreviewUrls(newPreviewUrls);
    } else {
      // 移除新添加的文件
      const fileIndex = index - existingImagesCount;
      const newFiles = [...selectedFiles];
      newFiles.splice(fileIndex, 1);
      setSelectedFiles(newFiles);
      
      const newPreviewUrls = [...previewUrls];
      newPreviewUrls.splice(index, 1);
      setPreviewUrls(newPreviewUrls);
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      let finalImageUrls: string[] = [];
      
      // 保留未被删除的现有图片
      if (currentMoment.images) {
        try {
          finalImageUrls = JSON.parse(currentMoment.images);
        } catch (e) { }
      }

      // 上传新图片
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });

        const uploadRes = await axios.post('/api/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data.urls) {
          finalImageUrls = [...finalImageUrls, ...uploadRes.data.urls];
        }
      }

      const payload = {
        ...currentMoment,
        images: finalImageUrls.length > 0 ? JSON.stringify(finalImageUrls) : null
      };

      if (currentMoment.id) {
        await axios.put(`/api/moments/${currentMoment.id}`, payload);
      } else {
        await axios.post('/api/moments', payload);
      }
      setIsModalOpen(false);
      fetchMoments();
    } catch (err: any) {
      alert(err.response?.data?.message || '保存失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这条动态吗？')) return;
    try {
      await axios.delete(`/api/moments/${id}`);
      fetchMoments();
    } catch (err: any) {
      alert(err.response?.data?.message || '删除失败');
    }
  };

  const toggleVisibility = async (moment: Moment) => {
    try {
      await axios.put(`/api/moments/${moment.id}`, {
        ...moment,
        isVisible: !moment.isVisible
      });
      fetchMoments();
    } catch (err: any) {
      alert(err.response?.data?.message || '更新失败');
    }
  };

  const filteredMoments = moments.filter(m => 
    m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.location && m.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">动态管理 (朋友圈)</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">发布新动态</span>
          <span className="sm:hidden">发布</span>
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="搜索动态内容或位置..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        />
      </div>

      <div className="space-y-4">
        {filteredMoments.map(moment => (
          <div key={moment.id} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-2">
                  {moment.content}
                </p>
                {moment.images && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {JSON.parse(moment.images).map((img: string, idx: number) => (
                      <img key={idx} src={img} alt="moment img" className="w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span>{new Date(moment.createdAt).toLocaleString()}</span>
                  {moment.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {moment.location}
                    </span>
                  )}
                  <span>点赞: {moment.likes}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  onClick={() => toggleVisibility(moment)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    moment.isVisible 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700'
                  }`}
                >
                  {moment.isVisible ? '已显示' : '已隐藏'}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(moment)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(moment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredMoments.length === 0 && (
          <div className="text-center text-gray-500 py-8">暂无动态数据</div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              {currentMoment.id ? '编辑动态' : '发布动态'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">内容</label>
                <textarea
                  value={currentMoment.content || ''}
                  onChange={e => setCurrentMoment({...currentMoment, content: e.target.value})}
                  className="w-full p-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-32"
                  placeholder="分享你的见解..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">图片上传</label>
                
                {/* 图片预览区域 */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {previewUrls.map((url, index) => {
                      let existingImagesCount = 0;
                      if (currentMoment.images) {
                        try { existingImagesCount = JSON.parse(currentMoment.images).length; } catch (e) {}
                      }
                      const isExisting = index < existingImagesCount;
                      
                      return (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                          <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
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
                
                {/* 上传按钮 */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">点击上传图片</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">位置 (选填)</label>
                <input
                  type="text"
                  value={currentMoment.location || ''}
                  onChange={e => setCurrentMoment({...currentMoment, location: e.target.value})}
                  className="w-full p-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="例如：北京市 朝阳区"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={currentMoment.isVisible !== false}
                  onChange={e => setCurrentMoment({...currentMoment, isVisible: e.target.checked})}
                />
                <label htmlFor="isVisible" className="dark:text-gray-300">公开显示</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
