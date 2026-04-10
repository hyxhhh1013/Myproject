import { useState, useEffect } from 'react';
import { Trash2, Search, Filter, Loader2, ExternalLink, Edit, Plus, X, Eye, EyeOff } from 'lucide-react';
import axios from '../../utils/axiosConfig';

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = axios.defaults.baseURL || '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

interface Music {
  id: number;
  platform: string;
  title: string;
  artist?: string;
  coverUrl?: string;
  url?: string;
  lyrics?: string;
  description?: string;
  isVisible: boolean;
  orderIndex?: number;
  updatedAt: string;
}

const initialFormData = {
  platform: 'netease',
  title: '',
  artist: '',
  coverUrl: '',
  url: '',
  lyrics: '',
  description: '',
  isVisible: true,
};

const MusicManagement = () => {
  const [musics, setMusics] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingMusic, setEditingMusic] = useState<Music | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const platforms = [
    { value: 'netease', label: '网易云音乐' },
    { value: 'qq', label: 'QQ音乐' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'other', label: '其他' },
  ];

  useEffect(() => {
    fetchMusics();
  }, []);

  const fetchMusics = async () => {
    try {
      setLoading(true);
      console.log('Fetching music list...');
      const response = await axios.get('/api/music');
      console.log('Music list response:', response.data);
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      console.log('Music list data:', data);
      setMusics(data);
      console.log('Musics state updated:', data);
    } catch (error) {
      console.error('Failed to fetch musics:', error);
      alert('获取音乐失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (music?: Music) => {
    if (music) {
      setEditingMusic(music);
      setFormData({
        platform: music.platform,
        title: music.title,
        artist: music.artist || '',
        coverUrl: music.coverUrl || '',
        url: music.url || '',
        lyrics: music.lyrics || '',
        description: music.description || '',
        isVisible: music.isVisible,
      });
    } else {
      setEditingMusic(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMusic(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('请填写音乐标题');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Submitting music form...', formData);
      const payload = {
        platform: formData.platform,
        title: formData.title.trim(),
        artist: formData.artist.trim() || undefined,
        coverUrl: formData.coverUrl.trim() || undefined,
        url: formData.url.trim() || undefined,
        lyrics: formData.lyrics.trim() || undefined,
        description: formData.description.trim() || undefined,
        isVisible: formData.isVisible,
      };
      console.log('Payload to send:', payload);

      if (editingMusic) {
        console.log('Updating existing music with ID:', editingMusic.id);
        await axios.put(`/api/music/${editingMusic.id}`, payload);
      } else {
        console.log('Creating new music...');
        const response = await axios.post('/api/music', payload);
        console.log('Create music response:', response.data);
      }

      await fetchMusics();
      handleCloseModal();
      alert('音乐添加成功！');
    } catch (error) {
      console.error('Failed to save music:', error);
      alert('保存失败: ' + JSON.stringify(error) + '\n请查看控制台获取详细信息');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个音乐吗？')) return;
    
    try {
      setDeletingId(id);
      await axios.delete(`/api/music/${id}`);
      setMusics(musics.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete music:', error);
      alert('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisible = async (id: number, currentState: boolean) => {
    try {
      await axios.put(`/api/music/${id}`, { isVisible: !currentState });
      setMusics(musics.map(m => m.id === id ? { ...m, isVisible: !currentState } : m));
    } catch (error) {
      console.error('Failed to update music:', error);
      alert('更新失败，请重试');
    }
  };

  const filteredMusics = musics.filter(music => {
    const matchesSearch = 
      (music.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (music.artist || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      music.platform.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterPlatform === 'all' || music.platform === filterPlatform;
    
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
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">音乐管理</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">管理音乐播放列表和配置</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 flex-1">
            共 {musics.length} 个音乐
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">添加音乐</span>
            <span className="sm:hidden">添加</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索音乐标题、歌手或平台..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex-1"
          >
            <option value="all">全部平台</option>
            {platforms.map(platform => (
              <option key={platform.value} value={platform.value}>{platform.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredMusics.map((music) => (
          <div key={music.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {music.coverUrl ? (
                    <img 
                      src={getImageUrl(music.coverUrl)} 
                      alt={music.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">无封面</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {music.title || '未命名'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {music.artist || '未知歌手'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleVisible(music.id, music.isVisible)}
                  className={`p-2 rounded-full transition-colors ${
                    music.isVisible 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}
                  title={music.isVisible ? '点击隐藏' : '点击显示'}
                >
                  {music.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              <div className="mb-3">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                  {platforms.find(p => p.value === music.platform)?.label || music.platform}
                </span>
              </div>

              {music.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {music.description}
                </p>
              )}

              {music.lyrics && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 line-clamp-2 italic">
                  "{music.lyrics.split('\n')[0]}"
                </p>
              )}

              {music.url && (
                <a
                  href={music.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 truncate"
                  title={music.url}
                >
                  <ExternalLink size={16} />
                  <span className="truncate">打开链接</span>
                </a>
              )}

              <div className="text-xs text-gray-400 mb-4">
                更新于 {new Date(music.updatedAt).toLocaleDateString('zh-CN')}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(music)}
                  className="flex-1 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="编辑音乐"
                >
                  <Edit className="w-5 h-5 inline" /> 编辑
                </button>
                <button
                  onClick={() => handleDelete(music.id)}
                  disabled={deletingId === music.id}
                  className="flex-1 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                  title="删除音乐"
                >
                  {deletingId === music.id ? <Loader2 className="w-5 h-5 animate-spin inline" /> : <Trash2 className="w-5 h-5 inline" />} 删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMusics.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p>暂无音乐</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {editingMusic ? '编辑音乐' : '添加音乐'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  音乐标题 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入音乐标题"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  歌手/艺术家
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入歌手名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  平台 *
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {platforms.map(platform => (
                    <option key={platform.value} value={platform.value}>{platform.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  封面图片链接
                </label>
                <input
                  type="url"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  音乐链接
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="填写 MP3 直链，或输入网易云链接自动解析"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.url || (!formData.url.includes('music.163.com') && !formData.url.includes('qq.com'))) {
                        alert('请先输入有效的网易云音乐或QQ音乐链接');
                        return;
                      }
                      try {
                        const res = await axios.get(`/api/music/resolve?url=${encodeURIComponent(formData.url)}`);
                        if (res.data.success) {
                          setFormData(prev => ({
                            ...prev,
                            platform: res.data.platform || prev.platform,
                            url: res.data.url,
                            title: res.data.title || prev.title,
                            artist: res.data.artist || prev.artist,
                            coverUrl: res.data.cover || prev.coverUrl,
                            lyrics: res.data.lyrics || prev.lyrics
                          }));
                          alert('解析成功！已自动填充信息。');
                        }
                      } catch (error) {
                        alert('解析失败，请检查链接是否正确或手动填写信息');
                      }
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors whitespace-nowrap w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">一键解析</span>
                    <span className="sm:hidden">解析</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  歌词 (LRC格式)
                </label>
                <textarea
                  value={formData.lyrics}
                  onChange={(e) => setFormData(prev => ({ ...prev, lyrics: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="[00:00.00] 歌曲名&#10;[00:03.00] 歌手名&#10;[00:15.23] 第一句歌词..."
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">请填入标准 LRC 格式的歌词，包含时间轴标签，例如：[00:15.23] 歌词内容</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="音乐描述（可选）"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isVisible" className="text-sm text-gray-700 dark:text-gray-300">
                  在前端显示
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
                      <span className="hidden sm:inline">保存中...</span>
                      <span className="sm:hidden">保存中</span>
                    </>
                  ) : (
                    editingMusic ? (
                      <>
                        <span className="hidden sm:inline">保存修改</span>
                        <span className="sm:hidden">保存</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">添加音乐</span>
                        <span className="sm:hidden">添加</span>
                      </>
                    )
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

export default MusicManagement;
