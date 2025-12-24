import { Request, Response } from 'express';
import { prisma } from '../index';

/**
 * 获取所有旅行城市
 */
export const getTravelCities = async (req: Request, res: Response) => {
  try {
    const cities = await prisma.travelCity.findMany({
      where: { isVisible: true },
      orderBy: { orderIndex: 'asc' }
    });
    res.json(cities);
  } catch (error) {
    console.error('获取旅行城市失败:', error);
    res.status(500).json({ error: '获取旅行城市失败' });
  }
};

/**
 * 创建旅行城市
 */
export const createTravelCity = async (req: Request, res: Response) => {
  try {
    const { name, longitude, latitude, note, wantCount, beenCount, orderIndex, isVisible } = req.body;
    
    const city = await prisma.travelCity.create({
      data: {
        name,
        longitude,
        latitude,
        note,
        wantCount: wantCount || 0,
        beenCount: beenCount || 0,
        orderIndex: orderIndex || 0,
        isVisible: isVisible !== false
      }
    });
    
    res.status(201).json(city);
  } catch (error) {
    console.error('创建旅行城市失败:', error);
    res.status(500).json({ error: '创建旅行城市失败' });
  }
};

/**
 * 更新旅行城市
 */
export const updateTravelCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, longitude, latitude, note, wantCount, beenCount, orderIndex, isVisible } = req.body;
    
    const city = await prisma.travelCity.update({
      where: { id: parseInt(id) },
      data: {
        name,
        longitude,
        latitude,
        note,
        wantCount,
        beenCount,
        orderIndex,
        isVisible
      }
    });
    
    res.json(city);
  } catch (error) {
    console.error('更新旅行城市失败:', error);
    res.status(500).json({ error: '更新旅行城市失败' });
  }
};

/**
 * 删除旅行城市
 */
export const deleteTravelCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.travelCity.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ status: 'success', message: '删除成功' });
  } catch (error) {
    console.error('删除旅行城市失败:', error);
    res.status(500).json({ error: '删除旅行城市失败' });
  }
};

/**
 * 更新旅行城市排序
 */
export const updateTravelCityOrder = async (req: Request, res: Response) => {
  try {
    const { cityIds } = req.body;
    
    // 使用事务确保所有更新都成功
    await prisma.$transaction(
      cityIds.map((id: number, index: number) =>
        prisma.travelCity.update({
          where: { id },
          data: { orderIndex: index }
        })
      )
    );
    
    res.json({ status: 'success', message: '排序更新成功' });
  } catch (error) {
    console.error('更新旅行城市排序失败:', error);
    res.status(500).json({ error: '更新旅行城市排序失败' });
  }
};

/**
 * 更新旅行城市想去人数
 */
export const updateWantCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { increment } = req.body;
    
    const city = await prisma.travelCity.update({
      where: { id: parseInt(id) },
      data: {
        wantCount: { increment: increment || 0 }
      }
    });
    
    res.json(city);
  } catch (error) {
    console.error('更新旅行城市想去人数失败:', error);
    res.status(500).json({ error: '更新旅行城市想去人数失败' });
  }
};

/**
 * 更新旅行城市去过人数
 */
export const updateBeenCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { increment } = req.body;
    
    const city = await prisma.travelCity.update({
      where: { id: parseInt(id) },
      data: {
        beenCount: { increment: increment || 0 }
      }
    });
    
    res.json(city);
  } catch (error) {
    console.error('更新旅行城市去过人数失败:', error);
    res.status(500).json({ error: '更新旅行城市去过人数失败' });
  }
};
