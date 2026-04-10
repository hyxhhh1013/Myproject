import { Request, Response } from 'express';
import { prisma } from '../index';

/**
 * 获取所有旅行足迹
 */
export const getTravelFootprints = async (req: Request, res: Response) => {
  try {
    const footprints = await prisma.travelFootprint.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: footprints });
  } catch (error) {
    console.error('获取旅行足迹失败:', error);
    res.status(500).json({ error: '获取旅行足迹失败' });
  }
};

/**
 * 创建旅行足迹
 */
export const createTravelFootprint = async (req: Request, res: Response) => {
  try {
    const { location, latitude, longitude, visitDate, description, photos } = req.body;
    
    const footprint = await prisma.travelFootprint.create({
      data: {
        location,
        latitude,
        longitude,
        visitedAt: visitDate,
        description,
        photos
      }
    });
    
    res.status(201).json(footprint);
  } catch (error) {
    console.error('创建旅行足迹失败:', error);
    res.status(500).json({ error: '创建旅行足迹失败' });
  }
};

/**
 * 更新旅行足迹
 */
export const updateTravelFootprint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { location, latitude, longitude, visitDate, description, photos } = req.body;
    
    const footprint = await prisma.travelFootprint.update({
      where: { id: parseInt(id) },
      data: {
        location,
        latitude,
        longitude,
        visitedAt: visitDate,
        description,
        photos
      }
    });
    
    res.json(footprint);
  } catch (error) {
    console.error('更新旅行足迹失败:', error);
    res.status(500).json({ error: '更新旅行足迹失败' });
  }
};

/**
 * 删除旅行足迹
 */
export const deleteTravelFootprint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.travelFootprint.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ status: 'success', message: '删除成功' });
  } catch (error) {
    console.error('删除旅行足迹失败:', error);
    res.status(500).json({ error: '删除旅行足迹失败' });
  }
};