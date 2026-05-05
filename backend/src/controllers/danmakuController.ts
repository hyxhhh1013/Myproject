import { Request, Response } from 'express';
import { prisma } from '../index';
import logger from '../utils/logger';
import { asyncHandler } from '../middleware/asyncHandler';
import { PrismaWhereInput, PrismaOrderByInput, PrismaSelectInput } from '../types/express';

export const createDanmaku = asyncHandler(async (req: Request, res: Response) => {
  const { content, color = 'blue' } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ status: 'error', message: 'Content is required' });
  }

  const danmaku = await prisma.danmaku.create({
    data: { content: content.trim(), color, isVisible: true },
  });

  logger.info('Danmaku created successfully', { danmakuId: danmaku.id });
  res.status(201).json({ status: 'success', message: 'Danmaku sent successfully', data: danmaku });
});

export const getVisibleDanmaku = asyncHandler(async (req: Request, res: Response) => {
  const danmaku = await prisma.danmaku.findMany({
    where: { isVisible: true },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, content: true, color: true, orderIndex: true },
  });

  logger.info('Visible danmaku retrieved successfully', { count: danmaku.length });
  res.status(200).json({ status: 'success', data: danmaku });
});

export const getAllDanmaku = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', isVisible, search, sort, fields } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: PrismaWhereInput = {};

  if (isVisible !== undefined) {
    where.isVisible = isVisible === 'true';
  }

  if (search) {
    where.content = { contains: search as string, mode: 'insensitive' as const };
  }

  let orderBy: PrismaOrderByInput = { createdAt: 'desc' };
  if (sort === 'created_asc') {
    orderBy = { createdAt: 'asc' };
  } else if (sort === 'created_desc') {
    orderBy = { createdAt: 'desc' };
  } else if (sort === 'order_asc') {
    orderBy = { orderIndex: 'asc' };
  } else if (sort === 'order_desc') {
    orderBy = { orderIndex: 'desc' };
  }

  const fieldList = fields
    ? (fields as string).split(',')
    : ['id', 'content', 'color', 'isVisible', 'orderIndex', 'createdAt'];

  const select: PrismaSelectInput = {};
  fieldList.forEach((field: string) => {
    select[field] = true;
  });

  const [danmaku, total] = await Promise.all([
    prisma.danmaku.findMany({ where, select, orderBy, skip, take: limitNum }),
    prisma.danmaku.count({ where }),
  ]);

  logger.info('Danmaku retrieved successfully', { count: danmaku.length, total });
  res.status(200).json({
    status: 'success',
    data: danmaku,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

export const updateDanmaku = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, color, isVisible, orderIndex } = req.body;

  const updateData: any = {};
  if (content !== undefined) updateData.content = content;
  if (color !== undefined) updateData.color = color;
  if (isVisible !== undefined) updateData.isVisible = isVisible;
  if (orderIndex !== undefined) updateData.orderIndex = orderIndex;

  const danmaku = await prisma.danmaku.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  logger.info('Danmaku updated successfully', { danmakuId: danmaku.id });
  res.status(200).json({ status: 'success', message: 'Danmaku updated successfully', data: danmaku });
});

export const deleteDanmaku = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.danmaku.delete({ where: { id: parseInt(id) } });
  logger.info('Danmaku deleted successfully', { danmakuId: id });
  res.status(200).json({ status: 'success', message: 'Danmaku deleted successfully' });
});

export const batchDeleteDanmaku = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ status: 'error', message: 'No IDs provided' });
  }

  await prisma.danmaku.deleteMany({ where: { id: { in: ids } } });

  logger.info('Danmaku deleted successfully', { ids, count: ids.length });
  res.status(200).json({ status: 'success', message: 'Danmaku deleted successfully' });
});

export const batchUpdateVisibility = asyncHandler(async (req: Request, res: Response) => {
  const { ids, isVisible } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ status: 'error', message: 'No IDs provided' });
  }

  await prisma.danmaku.updateMany({ where: { id: { in: ids } }, data: { isVisible } });

  logger.info('Danmaku visibility updated', { ids, isVisible, count: ids.length });
  res.status(200).json({ status: 'success', message: 'Danmaku visibility updated successfully' });
});
