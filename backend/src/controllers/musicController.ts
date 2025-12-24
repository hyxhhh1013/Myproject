import { Request, Response } from 'express';
import { prisma } from '../index';

/**
 * 获取所有音乐配置
 */
export const getMusic = async (req: Request, res: Response) => {
  try {
    const musicList = await prisma.music.findMany({
      where: { isVisible: true },
      orderBy: { orderIndex: 'asc' }
    });
    res.json(musicList);
  } catch (error) {
    console.error('获取音乐配置失败:', error);
    res.status(500).json({ error: '获取音乐配置失败' });
  }
};

/**
 * 创建音乐配置
 */
export const createMusic = async (req: Request, res: Response) => {
  try {
    const { title, description, playlistId, playlistType, orderIndex, isVisible } = req.body;
    
    const music = await prisma.music.create({
      data: {
        title,
        description,
        playlistId,
        playlistType,
        orderIndex: orderIndex || 0,
        isVisible: isVisible !== false
      }
    });
    
    res.status(201).json(music);
  } catch (error) {
    console.error('创建音乐配置失败:', error);
    res.status(500).json({ error: '创建音乐配置失败' });
  }
};

/**
 * 更新音乐配置
 */
export const updateMusic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, playlistId, playlistType, orderIndex, isVisible } = req.body;
    
    const music = await prisma.music.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        playlistId,
        playlistType,
        orderIndex,
        isVisible
      }
    });
    
    res.json(music);
  } catch (error) {
    console.error('更新音乐配置失败:', error);
    res.status(500).json({ error: '更新音乐配置失败' });
  }
};

/**
 * 删除音乐配置
 */
export const deleteMusic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.music.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ status: 'success', message: '删除成功' });
  } catch (error) {
    console.error('删除音乐配置失败:', error);
    res.status(500).json({ error: '删除音乐配置失败' });
  }
};

/**
 * 更新音乐排序
 */
export const updateMusicOrder = async (req: Request, res: Response) => {
  try {
    const { musicIds } = req.body;
    
    // 使用事务确保所有更新都成功
    await prisma.$transaction(
      musicIds.map((id: number, index: number) =>
        prisma.music.update({
          where: { id },
          data: { orderIndex: index }
        })
      )
    );
    
    res.json({ status: 'success', message: '排序更新成功' });
  } catch (error) {
    console.error('更新音乐排序失败:', error);
    res.status(500).json({ error: '更新音乐排序失败' });
  }
};
