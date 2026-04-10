import { Request, Response } from 'express';
import { prisma } from '../index';

export const getMoments = async (req: Request, res: Response) => {
  try {
    const { isVisible } = req.query;
    
    const where = isVisible !== undefined ? { isVisible: isVisible === 'true' } : {};
    
    const moments = await prisma.moment.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: moments
    });
  } catch (error) {
    console.error('获取动态失败:', error);
    res.status(500).json({ success: false, message: '获取动态失败' });
  }
};

export const createMoment = async (req: Request, res: Response) => {
  try {
    const { content, images, location, isVisible } = req.body;
    
    const moment = await prisma.moment.create({
      data: {
        content,
        images,
        location,
        isVisible: isVisible !== undefined ? isVisible : true
      }
    });

    res.status(201).json({
      success: true,
      data: moment,
      message: '创建动态成功'
    });
  } catch (error) {
    console.error('创建动态失败:', error);
    res.status(500).json({ success: false, message: '创建动态失败' });
  }
};

export const updateMoment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, images, location, isVisible, likes } = req.body;
    
    const moment = await prisma.moment.update({
      where: { id: Number(id) },
      data: {
        content,
        images,
        location,
        isVisible,
        likes
      }
    });

    res.json({
      success: true,
      data: moment,
      message: '更新动态成功'
    });
  } catch (error) {
    console.error('更新动态失败:', error);
    res.status(500).json({ success: false, message: '更新动态失败' });
  }
};

export const deleteMoment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.moment.delete({
      where: { id: Number(id) }
    });

    res.json({
      success: true,
      message: '删除动态成功'
    });
  } catch (error) {
    console.error('删除动态失败:', error);
    res.status(500).json({ success: false, message: '删除动态失败' });
  }
};

export const likeMoment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const moment = await prisma.moment.update({
      where: { id: Number(id) },
      data: {
        likes: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      data: moment,
      message: '点赞成功'
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ success: false, message: '点赞失败' });
  }
};
