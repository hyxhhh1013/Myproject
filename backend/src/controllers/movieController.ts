import { Request, Response } from 'express';
import { prisma } from '../index';

/**
 * 获取所有电影
 */
export const getMovies = async (req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({
      where: { isVisible: true },
      orderBy: { orderIndex: 'asc' }
    });
    res.json(movies);
  } catch (error) {
    console.error('获取电影失败:', error);
    res.status(500).json({ error: '获取电影失败' });
  }
};

/**
 * 创建电影
 */
export const createMovie = async (req: Request, res: Response) => {
  try {
    const { title, year, poster, rating, likes, orderIndex, isVisible } = req.body;
    
    const movie = await prisma.movie.create({
      data: {
        title,
        year,
        poster,
        rating,
        likes: likes || 0,
        orderIndex: orderIndex || 0,
        isVisible: isVisible !== false
      }
    });
    
    res.status(201).json(movie);
  } catch (error) {
    console.error('创建电影失败:', error);
    res.status(500).json({ error: '创建电影失败' });
  }
};

/**
 * 更新电影
 */
export const updateMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, year, poster, rating, likes, orderIndex, isVisible } = req.body;
    
    const movie = await prisma.movie.update({
      where: { id: parseInt(id) },
      data: {
        title,
        year,
        poster,
        rating,
        likes,
        orderIndex,
        isVisible
      }
    });
    
    res.json(movie);
  } catch (error) {
    console.error('更新电影失败:', error);
    res.status(500).json({ error: '更新电影失败' });
  }
};

/**
 * 删除电影
 */
export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.movie.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ status: 'success', message: '删除成功' });
  } catch (error) {
    console.error('删除电影失败:', error);
    res.status(500).json({ error: '删除电影失败' });
  }
};

/**
 * 更新电影排序
 */
export const updateMovieOrder = async (req: Request, res: Response) => {
  try {
    const { movieIds } = req.body;
    
    // 使用事务确保所有更新都成功
    await prisma.$transaction(
      movieIds.map((id: number, index: number) =>
        prisma.movie.update({
          where: { id },
          data: { orderIndex: index }
        })
      )
    );
    
    res.json({ status: 'success', message: '排序更新成功' });
  } catch (error) {
    console.error('更新电影排序失败:', error);
    res.status(500).json({ error: '更新电影排序失败' });
  }
};

/**
 * 更新电影点赞数
 */
export const updateMovieLikes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { increment } = req.body;
    
    const movie = await prisma.movie.update({
      where: { id: parseInt(id) },
      data: {
        likes: { increment: increment || 0 }
      }
    });
    
    res.json(movie);
  } catch (error) {
    console.error('更新电影点赞数失败:', error);
    res.status(500).json({ error: '更新电影点赞数失败' });
  }
};
