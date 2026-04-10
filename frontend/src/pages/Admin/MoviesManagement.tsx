import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { Plus, Trash2, Loader2, Edit, X, Star, Eye, EyeOff } from 'lucide-react';

type Movie = {
  id: number;
  title: string;
  director?: string | null;
  year?: number | null;
  posterUrl?: string | null;
  rating?: number | null;
  review?: string | null;
  watchedAt?: string | null;
  likes?: number;
  orderIndex?: number;
  isVisible?: boolean;
  createdAt?: string;
};

const initialForm = {
  title: '',
  director: '',
  year: '',
  posterUrl: '',
  rating: '',
  review: '',
  watchedAt: '',
  isVisible: true,
};

const MoviesManagement = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...initialForm });
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const sortedMovies = useMemo(
    () =>
      [...movies].sort((a, b) => {
        const aIdx = a.orderIndex ?? 0;
        const bIdx = b.orderIndex ?? 0;
        return aIdx - bIdx;
      }),
    [movies]
  );

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/movies');
      const data: Movie[] = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMovies(data);
    } catch (e: any) {
      console.error('Failed to load movies', e);
      setError('加载电影列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm({ ...initialForm });

  const handleOpenModal = (movie?: Movie) => {
    if (movie) {
      setEditingMovie(movie);
      setForm({
        title: movie.title,
        director: movie.director || '',
        year: movie.year?.toString() || '',
        posterUrl: movie.posterUrl || '',
        rating: movie.rating?.toString() || '',
        review: movie.review || '',
        watchedAt: movie.watchedAt ? movie.watchedAt.split('T')[0] : '',
        isVisible: movie.isVisible ?? true,
      });
    } else {
      setEditingMovie(null);
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMovie(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('标题为必填项');
      return;
    }
    setError(null);
    try {
      setSubmitting(true);
      const payload: any = {
        title: form.title.trim(),
        director: form.director?.trim() || undefined,
        year: form.year ? parseInt(form.year, 10) : undefined,
        posterUrl: form.posterUrl?.trim() || undefined,
        rating: form.rating ? parseFloat(form.rating) : undefined,
        review: form.review?.trim() || undefined,
        watchedAt: form.watchedAt ? new Date(form.watchedAt).toISOString() : undefined,
        isVisible: form.isVisible,
      };

      if (editingMovie) {
        await axios.put(`/api/movies/${editingMovie.id}`, payload);
      } else {
        await axios.post('/api/movies', payload);
      }

      handleCloseModal();
      await fetchMovies();
    } catch (e: any) {
      console.error('Failed to save movie', e);
      setError(e?.response?.data?.error || '保存电影失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这部电影吗？')) return;
    try {
      setDeletingId(id);
      await axios.delete(`/api/movies/${id}`);
      await fetchMovies();
    } catch (e: any) {
      console.error('Failed to delete movie', e);
      setError(e?.response?.data?.error || '删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisible = async (id: number, currentState: boolean) => {
    try {
      await axios.put(`/api/movies/${id}`, { isVisible: !currentState });
      setMovies(movies.map(m => m.id === id ? { ...m, isVisible: !currentState } : m));
    } catch (e: any) {
      console.error('Failed to update movie visibility', e);
      setError('更新显示状态失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">电影管理</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">新增并管理你的观影记录</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto self-start"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">添加电影</span>
          <span className="sm:hidden">添加</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">电影列表</h3>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>
        <div className="space-y-4">
          {sortedMovies.map((m) => (
            <div key={m.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex-shrink-0">
                {m.posterUrl ? (
                  <img src={m.posterUrl} alt={m.title} className="w-16 h-24 object-cover rounded" />
                ) : (
                  <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400">无海报</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <h3 className="text-gray-800 dark:text-gray-100 font-medium">{m.title}</h3>
                    {m.review && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        "{m.review}"
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleVisible(m.id, m.isVisible ?? true)}
                    className={`p-2 rounded-full transition-colors ${
                      m.isVisible !== false
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }`}
                    title={m.isVisible !== false ? '点击隐藏' : '点击显示'}
                  >
                    {m.isVisible !== false ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                  <span>导演: {m.director || '-'}</span>
                  <span>年份: {m.year ?? '-'}</span>
                  {m.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      {m.rating}
                    </span>
                  )}
                  <span>点赞: {m.likes ?? 0}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleOpenModal(m)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-sm"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4" />
                    <span>编辑</span>
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    disabled={deletingId === m.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-sm"
                    title="删除"
                  >
                    {deletingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span>删除</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {sortedMovies.length === 0 && !loading && (
            <div className="py-10 text-center text-gray-500 dark:text-gray-400">
              暂无电影记录
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {editingMovie ? '编辑电影' : '添加电影'}
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
                  标题*
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100"
                  placeholder="例如：肖申克的救赎"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  导演
                </label>
                <input
                  name="director"
                  value={form.director}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-100"
                  placeholder="例如：弗兰克·德拉邦特"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    年份
                  </label>
                  <input
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-100"
                    placeholder="例如：1994"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    评分
                  </label>
                  <input
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-100"
                    placeholder="例如：9.5"
                    inputMode="decimal"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  海报图片链接
                </label>
                <input
                  name="posterUrl"
                  value={form.posterUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-100"
                  placeholder="https://example.com/poster.jpg"
                />
                {form.posterUrl && (
                  <div className="mt-2">
                    <img 
                      src={form.posterUrl} 
                      alt="预览" 
                      className="w-20 h-28 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  短评
                </label>
                <textarea
                  name="review"
                  value={form.review}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-100"
                  placeholder="写点观后感吧…"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  观看日期
                </label>
                <input
                  type="date"
                  name="watchedAt"
                  value={form.watchedAt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="movieIsVisible"
                  checked={form.isVisible}
                  onChange={(e) => setForm(prev => ({ ...prev, isVisible: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="movieIsVisible" className="text-sm text-gray-700 dark:text-gray-300">
                  在前端显示
                </label>
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

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
                    editingMovie ? (
                      <>
                        <span className="hidden sm:inline">保存修改</span>
                        <span className="sm:hidden">保存</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">添加电影</span>
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

export default MoviesManagement;
