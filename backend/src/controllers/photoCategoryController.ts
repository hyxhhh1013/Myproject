import { Request, Response } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/asyncHandler';

export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.photoCategory.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { photos: true } } },
  });
  res.json(categories);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug, description } = req.body;
  const category = await prisma.photoCategory.create({ data: { name, slug, description } });
  res.json(category);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug, description } = req.body;
  const category = await prisma.photoCategory.update({
    where: { id: parseInt(id) },
    data: { name, slug, description },
  });
  res.json(category);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.photoCategory.delete({ where: { id: parseInt(id) } });
  res.json({ message: '分类删除成功' });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [category, totalPhotos] = await Promise.all([
    prisma.photoCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        photos: {
          where: { isVisible: true },
          orderBy: [{ isFeatured: 'desc' }, { orderIndex: 'asc' }, { takenAt: 'desc' }],
          skip,
          take: limitNum,
        },
        _count: { select: { photos: true } },
      },
    }),
    prisma.photo.count({ where: { categoryId: parseInt(id), isVisible: true } }),
  ]);

  if (!category) {
    return res.status(404).json({ error: '分类不存在' });
  }

  res.json({ ...category, totalPhotos, page: pageNum, limit: limitNum, totalPages: Math.ceil(totalPhotos / limitNum) });
});
