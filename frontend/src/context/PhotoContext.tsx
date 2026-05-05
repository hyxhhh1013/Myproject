import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { getImageUrl } from '../utils/imageUtils';

// 定义Photo类型
export interface Photo {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  isVisible: boolean;
  orderIndex: number;
  takenAt: string;
  createdAt: string;
  updatedAt: string;
  cameraModel?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  exifData?: any;
}

// 定义PhotoCategory类型
export interface PhotoCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  _count: {
    photos: number;
  };
}

// 定义Context类型
interface PhotoContextType {
  photos: Photo[];
  categories: PhotoCategory[];
  loading: boolean;
  error: string | null;
  refreshPhotos: (params?: any) => Promise<void>;
  getPhotosByCategory: (categoryId: number | null) => Photo[];
}

// 创建Context
const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

// --- Local Photos Logic ---
// Fallback local photos when API is not available
const CATEGORY_KEYS = ['风景', '城市', '日常'];
const LOCAL_CATEGORY_MAP: Record<string, {id: number, name: string, slug: string}> = {
    '风景': { id: -1, name: '风景', slug: 'landscape' },
    '城市': { id: -2, name: '城市', slug: 'city' },
    '日常': { id: -3, name: '日常', slug: 'daily' }
};

// Generate mock local photos
const localPhotos: Photo[] = Array.from({ length: 6 }, (_, index) => {
    const categoryIndex = index % CATEGORY_KEYS.length;
    const categoryName = CATEGORY_KEYS[categoryIndex];
    const category = LOCAL_CATEGORY_MAP[categoryName];
    
    const cameras = ['Sony A7M4', 'Fujifilm X-T4', 'Canon R6', 'Nikon Zf'];
    const lens = ['35mm f/1.4', '50mm f/1.2', '85mm f/1.8', '24-70mm f/2.8'];
    
    // Use placeholder images from picsum.photos
    const imageUrl = `https://picsum.photos/800/600?random=${index + 1}`;
    const thumbnailUrl = `https://picsum.photos/300/300?random=${index + 1}`;
    
    return {
      id: -(index + 1000), // Negative ID to avoid collision
      imageUrl,
      thumbnailUrl,
      category,
      title: `${categoryName} 照片 ${index + 1}`,
      description: `这是一张${categoryName}类别的测试照片`,
      isFeatured: index === 0,
      isVisible: true,
      orderIndex: 1000 + index,
      takenAt: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toISOString(),
      cameraModel: cameras[index % cameras.length],
      lens: lens[index % lens.length],
      focalLength: lens[index % lens.length].split(' ')[0],
      aperture: lens[index % lens.length].split(' ')[1].replace('f/', ''),
      shutterSpeed: '1/1000',
      iso: '100',
      exifData: {
        cameraModel: cameras[index % cameras.length],
        aperture: lens[index % lens.length].split(' ')[1].replace('f/', ''),
        iso: 100,
        focalLength: lens[index % lens.length].split(' ')[0]
      }
    };
});
// ---------------------------

// 创建Provider组件
interface PhotoProviderProps {
  children: ReactNode;
}

export const PhotoProvider: React.FC<PhotoProviderProps> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<PhotoCategory[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 加载照片数据
  const loadPhotos = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      let apiPhotos: Photo[] = [];
      try {
        const response = await axios.get('/api/photos', { params });
        apiPhotos = Array.isArray(response.data.photos) ? response.data.photos : [];
        
        // 确保照片 URL 是完整的，包含后端服务器地址
        apiPhotos = apiPhotos.map(photo => {
          if (photo.imageUrl) {
            photo.imageUrl = getImageUrl(photo.imageUrl);
          }
          if (photo.thumbnailUrl) {
            photo.thumbnailUrl = getImageUrl(photo.thumbnailUrl);
          }
          return photo;
        });
      } catch (e) {
        console.warn('API load failed, using local only', e);
      }
      
      // Only use API photos, don't merge with local mock photos
      setPhotos(apiPhotos);
    } catch (err) {
      setError('Failed to load photos');
      console.error('Failed to load photos:', err);
      setPhotos(localPhotos); // Fallback
    } finally {
      setLoading(false);
    }
  };

  // 加载分类数据
  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/photo-categories');
      // Only use API categories
      const apiCats = Array.isArray(response.data) ? response.data : [];
      setCategories(apiCats);
    } catch (err) {
      console.warn('Failed to load categories:', err);
      // Fallback
      setCategories(Object.values(LOCAL_CATEGORY_MAP).map(c => ({
          ...c,
          _count: { photos: 0 }
      })));
    }
  };

  // 初始加载数据
  useEffect(() => {
    loadPhotos({ limit: 100 }); 
    loadCategories();
    
    // 监听localStorage变化，当照片数据更新时刷新
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'photosUpdated') {
        loadPhotos({ limit: 100 });
        loadCategories();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 刷新照片数据
  const refreshPhotos = async (params?: any) => {
    await loadPhotos(params);
    await loadCategories();
  };

  // 根据分类获取照片
  const getPhotosByCategory = (categoryId: number | null): Photo[] => {
    if (categoryId === null) {
      return photos;
    }
    // Handle local negative IDs
    return photos.filter(photo => photo.category?.id === categoryId);
  };

  const value: PhotoContextType = {
    photos,
    categories,
    loading,
    error,
    refreshPhotos,
    getPhotosByCategory,
  };

  return <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>;
};

// 创建自定义Hook
export const usePhotoContext = () => {
  const context = useContext(PhotoContext);
  if (context === undefined) {
    throw new Error('usePhotoContext must be used within a PhotoProvider');
  }
  return context;
};
