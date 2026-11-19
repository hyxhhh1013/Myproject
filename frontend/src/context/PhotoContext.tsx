import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { getImageUrl } from '../utils/imageUtils';

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
  width?: number;
  height?: number;
}

export interface PhotoCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  _count: {
    photos: number;
  };
}

interface PhotoContextType {
  photos: Photo[];
  categories: PhotoCategory[];
  loading: boolean;
  error: string | null;
  refreshPhotos: (params?: any) => Promise<void>;
  getPhotosByCategory: (categoryId: number | null) => Photo[];
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

const CATEGORY_KEYS = ['风景', '城市', '生活', '人像', '日常'];
const LOCAL_CATEGORY_MAP: Record<string, { id: number; name: string; slug: string }> = {
  '风景': { id: -1, name: '风景', slug: 'scenery' },
  '城市': { id: -2, name: '城市', slug: 'city' },
  '生活': { id: -3, name: '生活', slug: 'life' },
  '人像': { id: -4, name: '人像', slug: 'portrait' },
  '日常': { id: -5, name: '日常', slug: 'daily' },
};

const PHOTO_TITLES = [
  '湘江落日余晖',
  '长沙街头霓虹',
  '岳麓山晨雾',
  '图书馆窗外的光',
  '老街巷弄光影',
  '雨后天桥倒影',
  '深夜自习室',
  '橘子洲头江风',
  '城市天际线',
  '秋日银杏步道',
  '胶片质感人像',
  '周末咖啡角落',
];

const localPhotos: Photo[] = Array.from({ length: 12 }, (_, index) => {
  const categoryIndex = index % CATEGORY_KEYS.length;
  const categoryName = CATEGORY_KEYS[categoryIndex];
  const category = LOCAL_CATEGORY_MAP[categoryName];

  const cameras = [
    'Sony Alpha 7C II (ILCE-7CM2)',
    'Sony ZV-E10',
    'Xiaomi 14 · Leica Summilux',
    'Sony ZV-E10',
  ];
  const lens = [
    'FE 28-60mm F4-5.6',
    'E PZ 16-50mm F3.5-5.6 OSS',
    '23mm f/1.6 ASPH.',
    'YN50mm f/1.8',
  ];

  const imageUrl = `https://picsum.photos/seed/hyx-photo-${index + 1}/800/600`;
  const thumbnailUrl = `https://picsum.photos/seed/hyx-photo-${index + 1}/400/300`;

  return {
    id: -(index + 1000),
    imageUrl,
    thumbnailUrl,
    category,
    title: PHOTO_TITLES[index % PHOTO_TITLES.length],
    description: `${categoryName}摄影记录`,
    isFeatured: index < 3,
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
    iso: String(100 * ((index % 4) + 1)),
    exifData: {
      cameraModel: cameras[index % cameras.length],
      aperture: lens[index % lens.length].split(' ')[1].replace('f/', ''),
      iso: 100 * ((index % 4) + 1),
      focalLength: lens[index % lens.length].split(' ')[0],
    },
  };
});

interface PhotoProviderProps {
  children: ReactNode;
}

export const PhotoProvider: React.FC<PhotoProviderProps> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>(localPhotos);
  const [categories, setCategories] = useState<PhotoCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/photos', { params });
      let apiPhotos: Photo[] = Array.isArray(response.data?.photos)
        ? response.data.photos
        : Array.isArray(response.data)
          ? response.data
          : [];

      apiPhotos = apiPhotos
        .filter((photo) => photo && photo.imageUrl)
        .map((photo) => ({
          ...photo,
          imageUrl: getImageUrl(photo.imageUrl),
          thumbnailUrl: photo.thumbnailUrl ? getImageUrl(photo.thumbnailUrl) : getImageUrl(photo.imageUrl),
        }));

      setPhotos(apiPhotos.length > 0 ? apiPhotos : localPhotos);
    } catch {
      setPhotos(localPhotos);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/photo-categories');
      const apiCats = Array.isArray(response.data) ? response.data : [];
      if (apiCats.length > 0) {
        setCategories(apiCats);
      } else {
        setCategories(
          Object.values(LOCAL_CATEGORY_MAP).map((c) => ({
            ...c,
            _count: { photos: localPhotos.filter((p) => p.category.name === c.name).length },
          })),
        );
      }
    } catch {
      setCategories(
        Object.values(LOCAL_CATEGORY_MAP).map((c) => ({
          ...c,
          _count: { photos: localPhotos.filter((p) => p.category.name === c.name).length },
        })),
      );
    }
  };

  useEffect(() => {
    loadPhotos({ limit: 100 });
    loadCategories();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'photosUpdated') {
        loadPhotos({ limit: 100 });
        loadCategories();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const refreshPhotos = async (params?: any) => {
    await loadPhotos(params);
    await loadCategories();
  };

  const getPhotosByCategory = (categoryId: number | null): Photo[] => {
    if (categoryId === null) {
      return photos;
    }
    return photos.filter((photo) => photo.category?.id === categoryId);
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

export const usePhotoContext = () => {
  const context = useContext(PhotoContext);
  if (context === undefined) {
    throw new Error('usePhotoContext must be used within a PhotoProvider');
  }
  return context;
};
