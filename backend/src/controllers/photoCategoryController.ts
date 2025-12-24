import { Request, Response } from 'express';
import { prisma } from '../index';

// 获取所有分类
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.photoCategory.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { photos: true },
        },
      },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: '获取分类失败' });
  }
};

// 创建分类
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description } = req.body;
    const category = await prisma.photoCategory.create({
      data: { name, slug, description },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: '创建分类失败' });
  }
};

// 更新分类
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;
    const category = await prisma.photoCategory.update({
      where: { id: parseInt(id) },
      data: { name, slug, description },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: '更新分类失败' });
  }
};

// 删除分类
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.photoCategory.delete({ where: { id: parseInt(id) } });
    res.json({ message: '分类删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除分类失败' });
  }
};

// 获取单个分类
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // 使用Promise.all并行查询分类信息和照片总数，提高性能
    const [category, totalPhotos] = await Promise.all([
      prisma.photoCategory.findUnique({
        where: { id: parseInt(id) },
        include: {
          photos: {
            where: { isVisible: true },
            orderBy: [{ isFeatured: 'desc' }, { orderIndex: 'asc' }, { takenAt: 'desc' }],
            skip,
            take: parseInt(limit as string),
          },
          _count: {
            select: { photos: true },
          },
        },
      }),
      prisma.photo.count({
        where: {
          categoryId: parseInt(id),
          isVisible: true,
        },
      }),
    ]);
    
    // 如果分类不存在，返回404
    if (!category) {
      return res.status(404).json({ error: '分类不存在' });
    }
    
    // 返回分页信息
    res.json({
      ...category,
      totalPhotos,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(totalPhotos / parseInt(limit as string)),
    });
  } catch (error) {
    res.status(500).json({ error: '获取分类失败' });
  }
};
