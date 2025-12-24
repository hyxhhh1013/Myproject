import React, { useState, useMemo, useEffect } from 'react';
import { usePhotoContext, Photo } from '../context/PhotoContext';

// 使用React.memo优化组件，避免不必要的重渲染
const PhotoCard = React.memo(({ photo, viewMode }: { photo: Photo; viewMode: 'grid' | 'masonry' }) => {
  return (
    <div className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${viewMode === 'masonry' ? 'break-inside-avoid' : ''}`}>
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={photo.thumbnailUrl}
          alt={photo.title}
          loading="lazy"
          className={`w-full transition-transform duration-500 group-hover:scale-105 ${viewMode === 'grid' ? 'h-64' : 'h-auto object-contain'}`}
          // 添加响应式图片支持
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Featured Badge */}
        {photo.isFeatured && (
          <div className="absolute top-3 left-3 bg-[#0071e3] text-white text-xs font-medium px-3 py-1 rounded-full">
            置顶
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-black group-hover:text-[#0071e3] transition-colors">
            {photo.title}
          </h3>
          <span className="text-sm text-[#86868b]">
            {new Date(photo.takenAt).toLocaleDateString()}
          </span>
        </div>
        
        {photo.description && (
          <p className="text-[#6e6e73] text-sm mb-4 line-clamp-2">
            {photo.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-block bg-[#f2f2f7] text-[#6e6e73] text-xs font-medium px-3 py-1 rounded-full">
            {photo.category.name}
          </span>
        </div>

        {/* EXIF Info - Enhanced Display */}
        {photo.exifData && (
          <div className="mt-3 pt-3 border-t border-[#e5e5ea]">
            <h4 className="text-xs font-semibold text-[#86868b] mb-2">拍摄信息</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {photo.exifData.cameraModel && (
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b]">相机:</span>
                  <span className="text-[#6e6e73]">{photo.exifData.cameraModel}</span>
                </div>
              )}
              {photo.exifData.aperture && (
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b]">光圈:</span>
                  <span className="text-[#6e6e73]">f/{photo.exifData.aperture}</span>
                </div>
              )}
              {photo.exifData.focalLength && (
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b]">焦距:</span>
                  <span className="text-[#6e6e73]">{photo.exifData.focalLength}mm</span>
                </div>
              )}
              {photo.exifData.iso && (
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b]">ISO:</span>
                  <span className="text-[#6e6e73]">{photo.exifData.iso}</span>
                </div>
              )}
              {photo.exifData.shutterSpeed && (
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b]">快门:</span>
                  <span className="text-[#6e6e73]">{photo.exifData.shutterSpeed}s</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});


const Photos: React.FC = () => {
  // 使用PhotoContext获取数据
  const { photos, categories, loading, error, refreshPhotos } = usePhotoContext();
  
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry' | 'size'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'size_desc'>('date_desc');

  // 当筛选条件改变时刷新数据
  useEffect(() => {
    const params: any = {
      limit: 50,
      sort: sortBy
    };
    if (selectedCategory) params.categoryId = selectedCategory;
    if (searchQuery) params.search = searchQuery;

    // Debounce search
    const timeoutId = setTimeout(() => {
      refreshPhotos(params);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery, sortBy]); // Removed refreshPhotos from dependency to avoid loop if it's not stable

  // 切换分类
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  // 切换视图模式
  const toggleViewMode = () => {
    setViewMode(current => {
      if (current === 'grid') return 'masonry';
      if (current === 'masonry') return 'size';
      return 'grid';
    });
  };

  // Group photos by size for Size View Mode
  const photosBySize = useMemo<{ [key: string]: Photo[] }>(() => {
    if (viewMode !== 'size') return {} as { [key: string]: Photo[] };
    return {
      '大尺寸 (>5MB)': photos.filter(p => (p.exifData?.size || 0) > 5 * 1024 * 1024),
      '中等尺寸 (1-5MB)': photos.filter(p => {
        const size = p.exifData?.size || 0;
        return size > 1 * 1024 * 1024 && size <= 5 * 1024 * 1024;
      }),
      '小尺寸 (<1MB)': photos.filter(p => (p.exifData?.size || 0) <= 1 * 1024 * 1024)
    };
  }, [photos, viewMode]);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h2 className="section-title">摄影作品</h2>
        <p className="text-lg text-[#6e6e73] max-w-3xl mb-6">
          分享我的摄影作品，记录生活中的美好瞬间
        </p>
        
        {/* Search Bar */}
        <div className="max-w-md relative">
          <input
            type="text"
            placeholder="搜索照片 (标题, 描述, 标签, 相机型号...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-[#f2f2f7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0071e3] mx-auto mb-4"></div>
          <p className="text-xl text-[#86868b]">加载中...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <p className="text-xl text-[#ff453a]">{error}</p>
        </div>
      )}

      {/* Controls and Gallery - Only show when not loading (or show previous results while loading) */}
      {!error && (
        <>
          {/* Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === null ? 'bg-[#0071e3] text-white' : 'bg-[#f2f2f7] text-[#6e6e73] hover:bg-[#e5e5ea]'}`}
              >
                全部作品
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category.id ? 'bg-[#0071e3] text-white' : 'bg-[#f2f2f7] text-[#6e6e73] hover:bg-[#e5e5ea]'}`}
                >
                  {category.name} ({category._count.photos})
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort Select */}
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-[#f2f2f7] rounded-lg text-sm text-[#6e6e73] focus:outline-none cursor-pointer hover:bg-[#e5e5ea]"
              >
                <option value="date_desc">最新拍摄</option>
                <option value="date_asc">最早拍摄</option>
                <option value="size_desc">文件大小</option>
              </select>

              {/* View Toggle */}
              <button
                onClick={toggleViewMode}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f2f2f7] hover:bg-[#e5e5ea] transition-colors"
                title={`当前视图: ${viewMode === 'grid' ? '网格' : viewMode === 'masonry' ? '瀑布流' : '按大小'}`}
              >
                {viewMode === 'grid' && (
                  <svg className="w-5 h-5 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                )}
                {viewMode === 'masonry' && (
                  <svg className="w-5 h-5 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                )}
                {viewMode === 'size' && (
                  <svg className="w-5 h-5 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Photo Gallery */}
          {photos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-[#86868b]">暂无符合条件的作品</p>
            </div>
          ) : (
            <>
              {viewMode === 'size' ? (
                <div className="space-y-8">
                  {Object.entries(photosBySize).map(([sizeLabel, groupPhotos]) => (
                    groupPhotos.length > 0 && (
                      <div key={sizeLabel}>
                        <h3 className="text-xl font-bold mb-4 text-[#1d1d1f]">{sizeLabel} ({groupPhotos.length})</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {groupPhotos.map(photo => (
                             <PhotoCard key={photo.id} photo={photo} viewMode='grid' />
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div
                  className={`grid gap-6 ${viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto'}`}
                  style={viewMode === 'masonry' ? { gridAutoFlow: 'row dense' } : {}}
                >
                  {photos.map((photo) => (
                    <PhotoCard key={photo.id} photo={photo} viewMode={viewMode} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};



export default Photos;