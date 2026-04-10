import { Request, Response } from 'express';
import { prisma } from '../index';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import exifr from 'exifr';
import fs from 'fs';
import logger from '../utils/logger';
import { FileUploadRequest, PrismaWhereInput, PrismaOrderByInput, PrismaSelectInput } from '../types/express';
import { AppError } from '../middleware/errorHandler';
import cache from '../utils/cache';

const PHOTO_CACHE_KEY = 'photos_list';
const CLEAR_PHOTO_CACHE = () => {
  const keys = cache.keys();
  const photoKeys = keys.filter(key => key.startsWith(PHOTO_CACHE_KEY));
  cache.del(photoKeys);
};

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// 文件过滤
const fileFilter = (req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

// 配置multer
const upload = multer({
  storage,
  limits: {
    fileSize: 40 * 1024 * 1024, // 40MB
  },
});

// 模拟CDN地址
const CDN_BASE_URL = process.env.CDN_BASE_URL || '';

// 生成缩略图
export const generateThumbnail = async (imagePath: string): Promise<string> => {
  const thumbnailPath = imagePath.replace(/(\.[^.]+)$/, '-thumbnail$1');
  await sharp(imagePath)
    .resize(300, 300, { fit: 'cover' })
    .toFile(thumbnailPath);
  return thumbnailPath;
};

// EXIF数据类型
interface ExifData {
  cameraModel?: string;
  make?: string;
  LensModel?: string;
  focalLength?: number;
  aperture?: number;
  shutterSpeed?: number;
  iso?: number;
  takenAt?: Date;
}

// 读取EXIF信息
const readExifData = async (imagePath: string): Promise<ExifData> => {
  try {
    const exif = await exifr.parse(imagePath, {
      gps: false,
      mergeOutput: true,
    }) as any;
    
    // 如果没有解析到 exif，直接返回空对象
    if (!exif) return {};

    // 尝试不同的字段名，因为不同相机厂商存储 EXIF 的字段可能不同
    const cameraModel = exif.Model || exif.CameraModelName;
    const make = exif.Make;
    const LensModel = exif.LensModel || exif.Lens;
    const focalLength = exif.FocalLength || exif.FocalLengthIn35mmFormat;
    const aperture = exif.FNumber || exif.ApertureValue;
    const shutterSpeed = exif.ExposureTime || exif.ShutterSpeedValue;
    const iso = exif.ISO;
    const takenAt = exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate;

    // 将快门速度转换为分数形式（例如：0.002 -> 1/500）
    let formattedShutterSpeed = shutterSpeed;
    if (typeof shutterSpeed === 'number' && shutterSpeed > 0 && shutterSpeed < 1) {
      formattedShutterSpeed = `1/${Math.round(1 / shutterSpeed)}`;
    }

    return {
      cameraModel,
      make,
      LensModel,
      focalLength,
      aperture,
      shutterSpeed: formattedShutterSpeed,
      iso,
      takenAt,
    };
  } catch (error) {
    logger.warn('Failed to read EXIF data', { error: error instanceof Error ? error.message : 'Unknown error' });
    return {};
  }
};

// 暴露upload中间件
export { upload };

// 获取所有作品
export const getAllPhotos = async (req: Request, res: Response) => {
  try {
    const { categoryId, isFeatured, page = 1, limit = 20, search, sort, fields } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Check cache
    const cacheKey = `${PHOTO_CACHE_KEY}_${JSON.stringify(req.query)}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    const where: PrismaWhereInput = {
      isVisible: true,
    };
    
    if (categoryId) {
      where.categoryId = parseInt(categoryId as string);
    }
    
    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        // 简单的标签搜索
        { tags: { some: { name: { contains: search as string, mode: 'insensitive' } } } }
      ];
    }
    
    let orderBy: any = [{ isFeatured: 'desc' }, { orderIndex: 'asc' }, { takenAt: 'desc' }];
    if (sort === 'date_asc') {
      orderBy = { takenAt: 'asc' };
    } else if (sort === 'date_desc') {
      orderBy = { takenAt: 'desc' };
    } else if (sort === 'size_desc') {
      orderBy = { size: 'desc' };
    }

    // 动态字段选择
    const fieldList = fields ? (fields as string).split(',') : [
      'id', 'title', 'imageUrl', 'thumbnailUrl', 'isFeatured', 'takenAt', 'categoryId', 'orderIndex',
      'location', 'cameraModel', 'lens', 'focalLength', 'aperture', 'shutterSpeed', 'iso', 'description', 'isVisible'
    ];
    
    // 构建select对象
    const select: any = {};
    fieldList.forEach((field: string) => {
      select[field] = true;
    });

    // 构建include对象
    const include: any = {};
    if (fieldList.includes('category') || fieldList.includes('categoryId')) {
      include.category = {
        select: { id: true, name: true, slug: true },
      };
    }
    if (fieldList.includes('tags')) {
      include.tags = true;
    }

    const useInclude = Object.keys(include).length > 0;
    const [photos, total] = await Promise.all([
      useInclude
        ? prisma.photo.findMany({
            where,
            orderBy,
            skip,
            take: parseInt(limit as string),
            include,
          })
        : prisma.photo.findMany({
            where,
            orderBy,
            skip,
            take: parseInt(limit as string),
            select,
          }),
      prisma.photo.count({ where }),
    ]);
    
    const responseData = {
      photos,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    };
    
    // Cache the response
    cache.set(cacheKey, responseData);
    
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: '获取作品失败' });
  }
};

// 创建作品 - 支持文件上传
export const createPhoto = async (req: any, res: Response) => {
  try {
    // 注意：这个函数需要配合multer中间件使用
    // 实际的文件对象会在req.file中
    const file = req.file;
    
    if (!file) {
      throw new AppError('请上传图片文件', 400);
    }
    
    const {
      title,
      description,
      categoryId,
      isFeatured = false,
      isVisible = true,
      orderIndex = 0,
      tags,
      location,
      cameraModel,
      lens,
      focalLength,
      aperture,
      shutterSpeed,
      iso
    } = req.body as any;

    // 验证categoryId是否存在（如果提供了的话）
    if (categoryId && categoryId !== '') {
      const category = await prisma.photoCategory.findUnique({
        where: { id: parseInt(categoryId) },
      });

      if (!category) {
        throw new AppError(`分类ID ${categoryId} 不存在`, 404);
      }
    }
    
    // 生成缩略图
    const thumbnailPath = await generateThumbnail(file.path);
    
    // 读取EXIF信息
    const exifData = await readExifData(file.path);

    // 获取图片尺寸和大小
    const metadata = await sharp(file.path).metadata();
    
    // 构建CDN URL
    const imageUrl = `${CDN_BASE_URL}/uploads/${path.basename(file.path)}`;
    const thumbnailUrl = `${CDN_BASE_URL}/uploads/${path.basename(thumbnailPath)}`;
    
    // 使用EXIF中的拍摄日期，如果没有则使用当前时间
    const takenAt = exifData.takenAt ? new Date(exifData.takenAt) : new Date();

    // 使用EXIF中的相机型号，如果没有则使用请求中的值
    const finalCameraModel = exifData.cameraModel || cameraModel;
    const finalMake = exifData.make;
    const finalLens = exifData.LensModel || lens;
    const finalFocalLength = exifData.focalLength ? String(exifData.focalLength) : (focalLength ? String(focalLength) : undefined);
    const finalAperture = exifData.aperture ? String(exifData.aperture) : (aperture ? String(aperture) : undefined);
    const finalShutterSpeed = exifData.shutterSpeed || shutterSpeed;
    const finalIso = exifData.iso ? String(exifData.iso) : (iso ? String(iso) : undefined);

    // 组合相机型号（如果同时有Make和Model）
    const fullCameraModel = finalMake ? `${finalMake} ${finalCameraModel}`.trim() : finalCameraModel;

    // 处理标签
    let tagConnect = [];
    if (tags) {
      const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      if (Array.isArray(parsedTags)) {
        for (const tagName of parsedTags) {
          tagConnect.push({
            where: { name: tagName },
            create: { name: tagName }
          });
        }
      }
    }
    
    const photo = await prisma.photo.create({
      data: {
        title: title || `照片_${Date.now()}`,
        description,
        imageUrl,
        thumbnailUrl,
        categoryId: (categoryId && categoryId !== '') ? parseInt(categoryId) : undefined,
        location,
        cameraModel: fullCameraModel,
        lens: finalLens,
        focalLength: finalFocalLength,
        aperture: finalAperture,
        shutterSpeed: finalShutterSpeed,
        iso: finalIso,
        isFeatured: isFeatured === 'true' || isFeatured === true,
        isVisible: isVisible === 'true' || isVisible === true,
        orderIndex: parseInt(orderIndex),
        takenAt,
        exifData: JSON.stringify(exifData),
        width: metadata.width,
        height: metadata.height,
        size: metadata.size,
        tags: {
          connectOrCreate: tagConnect
        }
      },
      include: {
        tags: true
      }
    });
    
    CLEAR_PHOTO_CACHE();
    res.json(photo);
  } catch (error) {
    console.error('创建作品失败:', {
      timestamp: new Date().toISOString(),
      error,
      request: {
        path: req.path,
        method: req.method,
        body: req.body,
      },
    });
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    res.status(500).json({ error: '创建作品失败' });
  }
};

// 批量上传作品
export const bulkUploadPhotos = async (req: any, res: Response) => {
  try {
    // 注意：这个函数需要配合multer.array中间件使用
    let files: Express.Multer.File[] = [];
    
    // 处理不同类型的files
    if (req.files) {
      // 直接使用类型断言
      const filesObj = req.files as any;
      if (Array.isArray(filesObj)) {
        files = filesObj;
      } else if (typeof filesObj === 'object') {
        // 从files对象中提取所有文件
        for (const field in filesObj) {
          const fieldFiles = filesObj[field];
          if (Array.isArray(fieldFiles)) {
            files = files.concat(fieldFiles);
          }
        }
      }
    }
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: '请上传至少一张图片' });
    }
    
    const { title, description, categoryId, isFeatured = false, isVisible = true, tags } = req.body as any;
    
    if (!categoryId) {
      return res.status(400).json({ error: '请选择分类' });
    }
    
    // 一次获取当前最大的orderIndex，避免多次查询
    const maxOrderIndexResult = await prisma.photo.aggregate({
      _max: { orderIndex: true },
    });
    let currentOrderIndex = (maxOrderIndexResult._max.orderIndex || 0);
    
    const uploadResults = await Promise.all(
      files.map(async (file: Express.Multer.File, index: number) => {
        try {
          // 生成缩略图
          const thumbnailPath = await generateThumbnail(file.path);
          
          // 读取EXIF信息
          const exifData = await readExifData(file.path);

          // 获取图片尺寸和大小
          const metadata = await sharp(file.path).metadata();
          
          // 构建CDN URL
          const imageUrl = `${CDN_BASE_URL}/uploads/${path.basename(file.path)}`;
          const thumbnailUrl = `${CDN_BASE_URL}/uploads/${path.basename(thumbnailPath)}`;
          
          // 使用EXIF中的拍摄日期，如果没有则使用当前时间
          const takenAt = exifData.takenAt ? new Date(exifData.takenAt) : new Date();
          
          // 递增orderIndex，避免重复
          currentOrderIndex++;

          // 处理标签
          let tagConnect = [];
          if (tags) {
            const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            if (Array.isArray(parsedTags)) {
               for (const tagName of parsedTags) {
                 tagConnect.push({
                   where: { name: tagName },
                   create: { name: tagName }
                 });
               }
            }
          }
          
          const finalCameraModel = exifData.cameraModel;
          const finalMake = exifData.make;
          const finalLens = exifData.LensModel;
          const finalFocalLength = exifData.focalLength ? String(exifData.focalLength) : undefined;
          const finalAperture = exifData.aperture ? String(exifData.aperture) : undefined;
          const finalShutterSpeed = exifData.shutterSpeed ? String(exifData.shutterSpeed) : undefined;
          const finalIso = exifData.iso ? String(exifData.iso) : undefined;
          const fullCameraModel = finalMake ? `${finalMake} ${finalCameraModel || ''}`.trim() : finalCameraModel;

          return prisma.photo.create({
            data: {
              title: title || `照片_${Date.now()}_${Math.round(Math.random() * 1E6)}`,
              description,
              categoryId: (categoryId && categoryId !== '') ? parseInt(categoryId) : undefined,
              isFeatured: isFeatured === 'true' || isFeatured === true,
              isVisible: isVisible === 'true' || isVisible === true,
              orderIndex: currentOrderIndex,
              takenAt,
              imageUrl,
              thumbnailUrl,
              cameraModel: fullCameraModel,
              lens: finalLens,
              focalLength: finalFocalLength,
              aperture: finalAperture,
              shutterSpeed: finalShutterSpeed,
              iso: finalIso,
              exifData: JSON.stringify(exifData),
              width: metadata.width,
              height: metadata.height,
              size: metadata.size,
              tags: {
                connectOrCreate: tagConnect
              }
            },
            include: { tags: true }
          });
        } catch (error) {
          console.error(`上传文件失败 ${file.originalname}:`, error);
          return null;
        }
      })
    );
    
    // 过滤掉失败的上传
    const successfulUploads = uploadResults.filter((result) => result !== null);
    
    if (successfulUploads.length > 0) {
      CLEAR_PHOTO_CACHE();
    }

    res.json({
      message: `批量上传完成，成功${successfulUploads.length}张，失败${uploadResults.length - successfulUploads.length}张`,
      photos: successfulUploads,
    });
  } catch (error) {
    console.error('批量上传作品失败:', error);
    res.status(500).json({ error: '批量上传作品失败' });
  }
};

// 更新作品
export const updatePhoto = async (req: any, res: Response) => {
  try {
    const { id } = req.params as any;
    let {
      title,
      description,
      imageUrl,
      thumbnailUrl,
      categoryId,
      isFeatured,
      isVisible,
      orderIndex,
      takenAt,
      exifData,
      cameraModel,
      lens,
      focalLength,
      aperture,
      shutterSpeed,
      iso
    } = req.body as any;
    
    // 验证照片是否存在
    const existingPhoto = await prisma.photo.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingPhoto) {
      throw new AppError(`作品ID ${id} 不存在`, 404);
    }
    
    // 如果提供了categoryId，验证分类是否存在
    if (categoryId !== undefined && categoryId !== '') {
      const category = await prisma.photoCategory.findUnique({
        where: { id: parseInt(categoryId) },
      });
      
      if (!category) {
        throw new AppError(`分类ID ${categoryId} 不存在`, 404);
      }
    }

    // 处理新上传的图片
    let width, height, size;
    const file = req.file;
    if (file) {
      // 生成缩略图
      const thumbnailPath = await generateThumbnail(file.path);
      
      // 读取EXIF信息
      const newExifData = await readExifData(file.path);

      // 获取图片尺寸和大小
      const metadata = await sharp(file.path).metadata();
      width = metadata.width;
      height = metadata.height;
      size = metadata.size;
      
      // 构建CDN URL
      imageUrl = `${CDN_BASE_URL}/uploads/${path.basename(file.path)}`;
      thumbnailUrl = `${CDN_BASE_URL}/uploads/${path.basename(thumbnailPath)}`;
      
      // 如果没有传入 takenAt，则使用EXIF或当前时间
      if (!takenAt) {
        takenAt = newExifData.takenAt ? new Date(newExifData.takenAt) : new Date();
      }

      // 如果没有手动指定相机参数，使用EXIF数据
      cameraModel = cameraModel || (newExifData.make ? `${newExifData.make} ${newExifData.cameraModel || ''}`.trim() : newExifData.cameraModel) || existingPhoto.cameraModel;
      lens = lens || newExifData.LensModel || existingPhoto.lens;
      focalLength = focalLength || (newExifData.focalLength ? String(newExifData.focalLength) : undefined) || existingPhoto.focalLength;
      aperture = aperture || (newExifData.aperture ? String(newExifData.aperture) : undefined) || existingPhoto.aperture;
      shutterSpeed = shutterSpeed || (newExifData.shutterSpeed ? String(newExifData.shutterSpeed) : undefined) || existingPhoto.shutterSpeed;
      iso = iso || (newExifData.iso ? String(newExifData.iso) : undefined) || existingPhoto.iso;
      exifData = JSON.stringify(newExifData);
    }

    // 如果提供了exifData且是对象，转换为JSON字符串
    const processedExifData = exifData && typeof exifData === 'object' ? JSON.stringify(exifData) : exifData;
    
    const photo = await prisma.photo.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        imageUrl: imageUrl || existingPhoto.imageUrl,
        thumbnailUrl: thumbnailUrl || existingPhoto.thumbnailUrl,
        categoryId: categoryId ? parseInt(categoryId) : existingPhoto.categoryId,
        isFeatured: isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : existingPhoto.isFeatured,
        isVisible: isVisible !== undefined ? (isVisible === 'true' || isVisible === true) : existingPhoto.isVisible,
        orderIndex: orderIndex ? parseInt(orderIndex) : existingPhoto.orderIndex,
        takenAt: takenAt ? new Date(takenAt) : existingPhoto.takenAt,
        exifData: processedExifData || existingPhoto.exifData,
        cameraModel,
        lens,
        focalLength,
        aperture,
        shutterSpeed,
        iso,
        width: width || existingPhoto.width,
        height: height || existingPhoto.height,
        size: size || existingPhoto.size,
      },
    });

    CLEAR_PHOTO_CACHE();
    logger.info('Photo updated successfully', { photoId: photo.id });
    res.json(photo);
  } catch (error) {
    logger.error('Failed to update photo', { error: error instanceof Error ? error.message : 'Unknown error' });
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    res.status(500).json({ error: '更新作品失败' });
  }
};

// 删除作品
export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    
    // 验证照片是否存在
    const existingPhoto = await prisma.photo.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingPhoto) {
      throw new AppError(`作品ID ${id} 不存在`, 404);
    }
    
    await prisma.photo.delete({ where: { id: parseInt(id) } });
    CLEAR_PHOTO_CACHE();
    logger.info('Photo deleted successfully', { photoId: id });
    res.json({ message: '作品删除成功' });
  } catch (error) {
    logger.error('Failed to delete photo', {
      error: error instanceof Error ? error.message : 'Unknown error',
      photoId: (req.params as any).id,
    });
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    res.status(500).json({ error: '删除作品失败' });
  }
};

// 获取单个作品
export const getPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const photo = await prisma.photo.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: '获取作品失败' });
  }
};

// 批量更新作品排序
export const updatePhotosOrder = async (req: Request, res: Response) => {
  try {
    const { photos } = req.body as any;
    
    const updatedPhotos = await Promise.all(
      photos.map((photo: { id: number; orderIndex: number }) => {
        return prisma.photo.update({
          where: { id: photo.id },
          data: { orderIndex: photo.orderIndex },
        });
      })
    );
    
    CLEAR_PHOTO_CACHE();
    res.json(updatedPhotos);
  } catch (error) {
    res.status(500).json({ error: '更新作品排序失败' });
  }
};

// 批量删除作品
export const batchDeletePhotos = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请提供要删除的作品ID列表' });
    }

    const photoIds = ids.map((id: any) => parseInt(id));

    // Get all photos to be deleted to get their file paths
    const photosToDelete = await prisma.photo.findMany({
      where: {
        id: { in: photoIds }
      }
    });

    // Delete files from disk
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    photosToDelete.forEach(photo => {
      try {
        if (photo.imageUrl) {
          const filename = path.basename(photo.imageUrl);
          const filePath = path.join(uploadDir, filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        if (photo.thumbnailUrl) {
          const filename = path.basename(photo.thumbnailUrl);
          const filePath = path.join(uploadDir, filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`Failed to delete files for photo ${photo.id}:`, err);
      }
    });

    await prisma.photo.deleteMany({
      where: {
        id: { in: photoIds }
      }
    });
    
    CLEAR_PHOTO_CACHE();
    res.json({ message: '批量删除成功' });
  } catch (error) {
    console.error('批量删除作品失败:', error);
    res.status(500).json({ error: '批量删除作品失败' });
  }
};

// 批量分类作品
export const batchUpdateCategory = async (req: Request, res: Response) => {
  try {
    const { ids, categoryId } = req.body as any;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请提供要更新的作品ID列表' });
    }
    
    if (!categoryId) {
      return res.status(400).json({ error: '请提供新的分类ID' });
    }

    const category = await prisma.photoCategory.findUnique({
      where: { id: parseInt(categoryId) }
    });
    
    if (!category) {
      return res.status(404).json({ error: '分类不存在' });
    }

    await prisma.photo.updateMany({
      where: {
        id: { in: ids.map((id: any) => parseInt(id)) }
      },
      data: {
        categoryId: parseInt(categoryId)
      }
    });

    CLEAR_PHOTO_CACHE();
    res.json({ message: '批量分类成功' });
  } catch (error) {
    console.error('批量分类作品失败:', error);
    res.status(500).json({ error: '批量分类作品失败' });
  }
};
