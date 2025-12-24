import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';

// 定义Photo类型
export interface Photo {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
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
// Dynamically import all images from the photography folder
// key is the relative path, value is the public URL (string)
const imageModules = import.meta.glob('../assets/images/photography/*.{jpg,jpeg,png}', {
    eager: true,
    import: 'default'
});
  
const CATEGORY_KEYS = ['风景', '城市', '日常'];
const LOCAL_CATEGORY_MAP: Record<string, {id: number, name: string, slug: string}> = {
    '风景': { id: -1, name: '风景', slug: 'landscape' },
    '城市': { id: -2, name: '城市', slug: 'city' },
    '日常': { id: -3, name: '日常', slug: 'daily' }
};

// Helper to generate deterministic mock metadata
const generateMetadata = (path: string, index: number) => {
    // Use simple hashing of path to determine category so it persists
    let hash = 0;
    for (let i = 0; i < path.length; i++) {
      hash = path.charCodeAt(i) + ((hash << 5) - hash);
    }
    const catIndex = Math.abs(hash) % CATEGORY_KEYS.length;
    const catName = CATEGORY_KEYS[catIndex];
    
    const cameras = ['Sony A7M4', 'Fujifilm X-T4', 'Canon R6', 'Nikon Zf'];
    const lens = ['35mm f/1.4', '50mm f/1.2', '85mm f/1.8', '24-70mm f/2.8'];
    
    return {
      category: LOCAL_CATEGORY_MAP[catName],
      title: `Untitled ${index + 1}`,
      exif: {
          cameraModel: cameras[index % cameras.length],
          aperture: lens[index % lens.length].split(' ')[1].replace('f/', ''),
          iso: 100 * ((index % 4) + 1),
          focalLength: lens[index % lens.length].split(' ')[0].replace('mm', '')
      }
    };
};

const localPhotos: Photo[] = Object.values(imageModules).map((src, index) => {
    const path = src as string;
    const meta = generateMetadata(path, index);
    return {
      id: -(index + 1000), // Negative ID to avoid collision
      imageUrl: path,
      thumbnailUrl: path, // Use same for thumbnail for local
      ...meta,
      description: '',
      isFeatured: false,
      isVisible: true,
      orderIndex: 1000 + index, // Put them at the end or mix?
      takenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exifData: meta.exif
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
        const response = await axios.get('/photos', { params });
        apiPhotos = response.data.photos;
      } catch (e) {
        console.warn('API load failed, using local only', e);
      }
      
      // Merge API photos with Local photos
      // We can decide order here. Let's put API photos first (newer).
      setPhotos([...apiPhotos, ...localPhotos]);
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
      const response = await axios.get('/photo-categories');
      // Merge API categories with local dummy categories
      const apiCats = response.data;
      const localCats = Object.values(LOCAL_CATEGORY_MAP);
      
      // De-duplicate by name
      const mergedCats = [...apiCats];
      localCats.forEach(lc => {
          if (!mergedCats.find(ac => ac.name === lc.name)) {
              mergedCats.push({
                  ...lc,
                  _count: { photos: localPhotos.filter(p => p.category.name === lc.name).length }
              });
          }
      });
      
      setCategories(mergedCats);
    } catch (err) {
      console.error('Failed to load categories:', err);
      // Fallback
      setCategories(Object.values(LOCAL_CATEGORY_MAP).map(c => ({
          ...c,
          _count: { photos: localPhotos.filter(p => p.category.name === c.name).length }
      })));
    }
  };

  // 初始加载数据
  useEffect(() => {
    loadPhotos({ limit: 100 }); 
    loadCategories();
    
    // 定时刷新数据，每60秒刷新一次
    const refreshInterval = setInterval(() => {
      loadPhotos({ limit: 100 });
      loadCategories();
    }, 60000);
    
    return () => clearInterval(refreshInterval);
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
    return photos.filter(photo => photo.category.id === categoryId);
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
