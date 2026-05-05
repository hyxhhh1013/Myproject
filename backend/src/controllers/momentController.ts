import { Request, Response } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/asyncHandler';

export const getMoments = asyncHandler(async (req: Request, res: Response) => {
  const { isVisible } = req.query;
  const where = isVisible !== undefined ? { isVisible: isVisible === 'true' } : {};

  const moments = await prisma.moment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: moments });
});

export const createMoment = asyncHandler(async (req: Request, res: Response) => {
  const { content, images, location, isVisible } = req.body;

  const moment = await prisma.moment.create({
    data: {
      content,
      images,
      location,
      isVisible: isVisible !== undefined ? isVisible : true,
    },
  });

  res.status(201).json({ success: true, data: moment, message: '创建动态成功' });
});

export const updateMoment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, images, location, isVisible, likes } = req.body;

  const moment = await prisma.moment.update({
    where: { id: Number(id) },
    data: { content, images, location, isVisible, likes },
  });

  res.json({ success: true, data: moment, message: '更新动态成功' });
});

export const deleteMoment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.moment.delete({ where: { id: Number(id) } });
  res.json({ success: true, message: '删除动态成功' });
});

export const likeMoment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const moment = await prisma.moment.update({
    where: { id: Number(id) },
    data: { likes: { increment: 1 } },
  });

  res.json({ success: true, data: moment, message: '点赞成功' });
});
