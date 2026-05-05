import { Request, Response } from 'express';
import { prisma } from '../index';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import exifr from 'exifr';
import { generateThumbnail, optimizeImage, readExifData } from '../utils/imageUtils';
import fs from 'fs';
import logger from '../utils/logger';
import { FileUploadRequest, PrismaWhereInput } from '../types/express';
import { AppError } from '../middleware/errorHandler';
import { asyncHandler } from '../middleware/asyncHandler';
import cache from '../utils/cache';

const PHOTO_CACHE_KEY = 'photos_list';
const CLEAR_PHOTO_CACHE = () => {
  const keys = cache.keys();
  const photoKeys = keys.filter(key => key.startsWith(PHOTO_CACHE_KEY));
  cache.del(photoKeys);
};

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 40 * 1024 * 1024 },
});

export { upload };

export const getAllPhotos = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId, isFeatured, page = '1', limit = '20', search, sort, fields } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const cacheKey = `${PHOTO_CACHE_KEY}_${JSON.stringify(req.query)}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const where: PrismaWhereInput = { isVisible: true };

  if (categoryId) {
    where.categoryId = parseInt(categoryId as string);
  }

  if (isFeatured === 'true') {
    where.isFeatured = true;
  }

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' as const } },
      { description: { contains: search as string, mode: 'insensitive' as const } },
      { tag: { some: { name: { contains: search as string, mode: 'insensitive' as const } } } },
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

  const fieldList = fields ? (fields as string).split(',') : [
    'id', 'title', 'imageUrl', 'thumbnailUrl', 'isFeatured', 'takenAt', 'categoryId', 'orderIndex',
    'location', 'cameraModel', 'lens', 'focalLength', 'aperture', 'shutterSpeed', 'iso', 'description', 'isVisible',
  ];

  const select: any = {};
  fieldList.forEach((field: string) => {
    select[field] = true;
  });

  const include: any = {};
  if (fieldList.includes('category') || fieldList.includes('categoryId')) {
    include.category = { select: { id: true, name: true, slug: true } };
  }
  if (fieldList.includes('tag')) {
    include.tag = true;
  }

  const useInclude = Object.keys(include).length > 0;
  const [photos, total] = await Promise.all([
    useInclude
      ? prisma.photo.findMany({ where, orderBy, skip, take: limitNum, include })
      : prisma.photo.findMany({ where, orderBy, skip, take: limitNum, select }),
    prisma.photo.count({ where }),
  ]);

  const responseData = { photos, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  cache.set(cacheKey, responseData);
  res.json(responseData);
});

export const createPhoto = asyncHandler(async (req: any, res: Response) => {
  const file: Express.Multer.File | undefined = req.file;

  if (!file) {
    throw new AppError('请上传图片文件', 400);
  }

  const {
    title, description, categoryId, isFeatured = false, isVisible = true,
    orderIndex = 0, tag, location, cameraModel, lens, focalLength,
    aperture, shutterSpeed, iso,
  } = req.body;

  if (categoryId && categoryId !== '') {
    const category = await prisma.photoCategory.findUnique({
      where: { id: parseInt(categoryId) },
    });
    if (!category) {
      throw new AppError(`分类ID ${categoryId} 不存在`, 404);
    }
  }

  const imageUrl = await optimizeImage(file.buffer);
  const thumbnailUrl = await generateThumbnail(file.buffer);
  const exifData = await readExifData(file.buffer);
  const metadata = await sharp(file.buffer).metadata();

  const takenAt = exifData.takenAt ? new Date(exifData.takenAt) : new Date();
  const finalCameraModel = exifData.cameraModel || cameraModel;
  const finalMake = exifData.make;
  const finalLens = exifData.LensModel || lens;
  const finalFocalLength = exifData.focalLength ? String(exifData.focalLength) : (focalLength ? String(focalLength) : undefined);
  const finalAperture = exifData.aperture ? String(exifData.aperture) : (aperture ? String(aperture) : undefined);
  const finalShutterSpeed = exifData.shutterSpeed || shutterSpeed;
  const finalIso = exifData.iso ? String(exifData.iso) : (iso ? String(iso) : undefined);
  const fullCameraModel = finalMake ? `${finalMake} ${finalCameraModel}`.trim() : finalCameraModel;

  let tagConnect: any[] = [];
  if (tag) {
    const parsedTags = typeof tag === 'string' ? JSON.parse(tag) : tag;
    if (Array.isArray(parsedTags)) {
      tagConnect = parsedTags.map((tagName: string) => ({
        where: { name: tagName },
        create: { name: tagName },
      }));
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
      size: file.size,
      tag: { connectOrCreate: tagConnect },
    },
    include: { tag: true },
  });

  CLEAR_PHOTO_CACHE();
  res.json(photo);
});

export const bulkUploadPhotos = asyncHandler(async (req: any, res: Response) => {
  let files: Express.Multer.File[] = [];

  if (req.files) {
    const filesObj = req.files as any;
    if (Array.isArray(filesObj)) {
      files = filesObj;
    } else if (typeof filesObj === 'object') {
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

  const { categoryId, tag } = req.body;

  if (!categoryId) {
    return res.status(400).json({ error: '请选择分类' });
  }

  const maxOrderIndexResult = await prisma.photo.aggregate({ _max: { orderIndex: true } });
  let currentOrderIndex = maxOrderIndexResult._max.orderIndex || 0;

  let tagConnect: any[] = [];
  if (tag) {
    const parsedTags = typeof tag === 'string' ? JSON.parse(tag) : tag;
    if (Array.isArray(parsedTags)) {
      tagConnect = parsedTags.map((tagName: string) => ({
        where: { name: tagName },
        create: { name: tagName },
      }));
    }
  }

  const uploadResults = await Promise.all(
    files.map(async (file: Express.Multer.File) => {
      try {
        const imageUrl = await optimizeImage(file.buffer);
        const thumbnailUrl = await generateThumbnail(file.buffer);
        const exifData = await readExifData(file.buffer);
        const metadata = await sharp(file.buffer).metadata();

        currentOrderIndex++;
        const takenAt = exifData.takenAt ? new Date(exifData.takenAt) : new Date();
        const finalCameraModel = exifData.cameraModel;
        const finalMake = exifData.make;
        const finalLens = exifData.LensModel;
        const fullCameraModel = finalMake ? `${finalMake} ${finalCameraModel || ''}`.trim() : finalCameraModel;

        return prisma.photo.create({
          data: {
            title: `照片_${Date.now()}_${Math.round(Math.random() * 1E6)}`,
            categoryId: parseInt(categoryId),
            orderIndex: currentOrderIndex,
            takenAt,
            imageUrl,
            thumbnailUrl,
            cameraModel: fullCameraModel,
            lens: finalLens,
            focalLength: exifData.focalLength ? String(exifData.focalLength) : undefined,
            aperture: exifData.aperture ? String(exifData.aperture) : undefined,
            shutterSpeed: exifData.shutterSpeed ? String(exifData.shutterSpeed) : undefined,
            iso: exifData.iso ? String(exifData.iso) : undefined,
            exifData: JSON.stringify(exifData),
            width: metadata.width,
            height: metadata.height,
            size: file.size,
            tag: { connectOrCreate: tagConnect },
          },
          include: { tag: true },
        });
      } catch (error) {
        logger.error(`Upload failed for ${file.originalname}`, { error });
        return null;
      }
    }),
  );

  const successfulUploads = uploadResults.filter((result): result is NonNullable<typeof result> => result !== null);

  if (successfulUploads.length > 0) {
    CLEAR_PHOTO_CACHE();
  }

  res.json({
    message: `批量上传完成，成功${successfulUploads.length}张，失败${uploadResults.length - successfulUploads.length}张`,
    photos: successfulUploads,
  });
});

export const updatePhoto = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  let {
    title, description, imageUrl, thumbnailUrl, categoryId, isFeatured,
    isVisible, orderIndex, takenAt, exifData, cameraModel, lens,
    focalLength, aperture, shutterSpeed, iso,
  } = req.body;

  const photoId = parseInt(id);
  const existingPhoto = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!existingPhoto) {
    throw new AppError(`作品ID ${id} 不存在`, 404);
  }

  if (categoryId !== undefined && categoryId !== '') {
    const category = await prisma.photoCategory.findUnique({
      where: { id: parseInt(categoryId) },
    });
    if (!category) {
      throw new AppError(`分类ID ${categoryId} 不存在`, 404);
    }
  }

  let width: number | undefined;
  let height: number | undefined;
  let size: number | undefined;
  const file: Express.Multer.File | undefined = req.file;

  if (file) {
    imageUrl = await optimizeImage(file.buffer);
    thumbnailUrl = await generateThumbnail(file.buffer);
    const newExifData = await readExifData(file.buffer);
    const metadata = await sharp(file.buffer).metadata();
    width = metadata.width;
    height = metadata.height;
    size = file.size;

    if (!takenAt) {
      takenAt = newExifData.takenAt ? new Date(newExifData.takenAt) : new Date();
    }

    cameraModel = cameraModel || (newExifData.make ? `${newExifData.make} ${newExifData.cameraModel || ''}`.trim() : newExifData.cameraModel) || existingPhoto.cameraModel;
    lens = lens || newExifData.LensModel || existingPhoto.lens;
    focalLength = focalLength || (newExifData.focalLength ? String(newExifData.focalLength) : undefined) || existingPhoto.focalLength;
    aperture = aperture || (newExifData.aperture ? String(newExifData.aperture) : undefined) || existingPhoto.aperture;
    shutterSpeed = shutterSpeed || (newExifData.shutterSpeed ? String(newExifData.shutterSpeed) : undefined) || existingPhoto.shutterSpeed;
    iso = iso || (newExifData.iso ? String(newExifData.iso) : undefined) || existingPhoto.iso;
    exifData = JSON.stringify(newExifData);
  }

  const processedExifData = exifData && typeof exifData === 'object' ? JSON.stringify(exifData) : exifData;

  const photo = await prisma.photo.update({
    where: { id: photoId },
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
      cameraModel, lens, focalLength, aperture, shutterSpeed, iso,
      width: width || existingPhoto.width,
      height: height || existingPhoto.height,
      size: size || existingPhoto.size,
    },
  });

  CLEAR_PHOTO_CACHE();
  logger.info('Photo updated successfully', { photoId: photo.id });
  res.json(photo);
});

export const deletePhoto = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const photoId = parseInt(id as string);

  const existingPhoto = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!existingPhoto) {
    throw new AppError(`作品ID ${id} 不存在`, 404);
  }

  await prisma.photo.delete({ where: { id: photoId } });
  CLEAR_PHOTO_CACHE();
  logger.info('Photo deleted successfully', { photoId: id });
  res.json({ message: '作品删除成功' });
});

export const getPhoto = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const photo = await prisma.photo.findUnique({
    where: { id: parseInt(id as string) },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  res.json(photo);
});

export const updatePhotosOrder = asyncHandler(async (req: Request, res: Response) => {
  const { photos } = req.body;

  const updatedPhotos = await Promise.all(
    photos.map((photo: { id: number; orderIndex: number }) =>
      prisma.photo.update({
        where: { id: photo.id },
        data: { orderIndex: photo.orderIndex },
      }),
    ),
  );

  CLEAR_PHOTO_CACHE();
  res.json(updatedPhotos);
});

export const batchDeletePhotos = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请提供要删除的作品ID列表' });
  }

  const photoIds = ids.map((id: any) => parseInt(id));

  const photosToDelete = await prisma.photo.findMany({ where: { id: { in: photoIds } } });

  const uploadDir = path.join(process.cwd(), 'uploads');
  photosToDelete.forEach((photo) => {
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
      logger.error(`Failed to delete files for photo ${photo.id}`, { error: err });
    }
  });

  await prisma.photo.deleteMany({ where: { id: { in: photoIds } } });
  CLEAR_PHOTO_CACHE();
  res.json({ message: '批量删除成功' });
});

export const batchUpdateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { ids, categoryId } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请提供要更新的作品ID列表' });
  }

  if (!categoryId) {
    return res.status(400).json({ error: '请提供新的分类ID' });
  }

  const category = await prisma.photoCategory.findUnique({
    where: { id: parseInt(categoryId) },
  });

  if (!category) {
    return res.status(404).json({ error: '分类不存在' });
  }

  await prisma.photo.updateMany({
    where: { id: { in: ids.map((id: any) => parseInt(id)) } },
    data: { categoryId: parseInt(categoryId) },
  });

  CLEAR_PHOTO_CACHE();
  res.json({ message: '批量分类成功' });
});
