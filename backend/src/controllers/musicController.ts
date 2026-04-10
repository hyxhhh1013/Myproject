import { Request, Response } from 'express';
import { prisma } from '../index';
import logger from '../utils/logger';
import { PrismaWhereInput, PrismaOrderByInput, PrismaSelectInput } from '../types/express';

/**
 * 解析网易云音乐链接获取直链
 */
export const resolveNeteaseMusic = async (req: Request, res: Response) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    // 处理 QQ 音乐链接解析
    if (url.includes('y.qq.com') || url.includes('qq.com')) {
      let songId = '';
      
      // 尝试匹配 songmid，例如：https://y.qq.com/n/ryqq/songDetail/0039MnYb0qxYhV
      const songmidMatch = url.match(/songDetail\/([a-zA-Z0-9]+)/);
      if (songmidMatch) {
        songId = songmidMatch[1];
      } else {
        // 其他格式可能需要不同的正则匹配，目前主要支持这种标准网页链接
        const idMatch = url.match(/songmid=([a-zA-Z0-9]+)/);
        if (idMatch) songId = idMatch[1];
      }

      if (songId) {
        try {
          const response = await fetch(`https://api.vvhan.com/api/wyMusic/QQ音乐?type=json&id=${songId}`);
          if (response.ok) {
            const result = await response.json() as any;
            if (result.success) {
              return res.json({
                success: true,
                platform: 'qq',
                url: result.info.url,
                title: result.info.name,
                artist: result.info.auther,
                cover: result.info.pic,
                lyrics: '', 
              });
            }
          }
        } catch (e) {
          console.error('[Music] QQ Music API failed:', e);
        }
      }
      
      return res.status(400).json({ error: '无法解析 QQ 音乐链接或获取直链失败' });
    }

    // 原有的网易云音乐解析逻辑
    const neteaseIdMatch = url.match(/id=(\d+)/);
    if (!neteaseIdMatch) {
      return res.status(400).json({ error: 'Invalid music URL. Please provide a valid Netease or QQ Music URL.' });
    }

    const songId = neteaseIdMatch[1];

    try {
      const response = await fetch(`https://api.vvhan.com/api/wyMusic/网易云音乐?type=json&id=${songId}`);
      if (response.ok) {
        const result = await response.json() as any;
        if (result.success) {
          return res.json({
            success: true,
            platform: 'netease',
            url: result.info.url,
            title: result.info.name,
            artist: result.info.auther,
            cover: result.info.pic,
            lyrics: '', // 这个API不返回歌词，前端做一下兼容即可
          });
        }
      }
    } catch (e) {
      console.error('[Music] API failed:', e);
    }

    // 备用：直接使用网易云的外链
    // 网易云音乐直链解析通常会遇到防盗链(403)或重定向(302)的问题
    // 使用外链播放器接口通常更稳定
    return res.json({
      success: true,
      platform: 'netease',
      url: `https://music.163.com/song/media/outer/url?id=${songId}.mp3`,
      title: `网易云音乐 ${songId}`,
      artist: '未知歌手',
      cover: '',
      lyrics: ''
    });

  } catch (error: any) {
    logger.error('Error resolving music', { error: error instanceof Error ? error.message : 'Unknown error' });
    
    // Check for string length errors from Prisma/database limits
    if (error?.message && error.message.includes('String too long')) {
      return res.status(400).json({ error: '解析到的歌词或其他数据太长，超出了数据库限制' });
    }
    
    res.status(500).json({ error: '解析音乐链接失败' });
  }
};

/**
 * 获取所有音乐配置
 */
export const getMusic = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, isVisible, platform, search, sort, fields } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: PrismaWhereInput = {};
    
    // 添加过滤条件
    if (isVisible !== undefined) {
      where.isVisible = isVisible === 'true';
    }
    
    if (platform) {
      where.platform = platform as string;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { artist: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    // 添加排序
    let orderBy: PrismaOrderByInput = { orderIndex: 'asc' };
    if (sort === 'title_asc') {
      orderBy = { title: 'asc' };
    } else if (sort === 'title_desc') {
      orderBy = { title: 'desc' };
    } else if (sort === 'created_asc') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'created_desc') {
      orderBy = { createdAt: 'desc' };
    }
    
    // 动态字段选择
    const fieldList = fields ? (fields as string).split(',') : ['id', 'title', 'artist', 'coverUrl', 'platform', 'url', 'lyrics', 'description', 'isVisible', 'orderIndex', 'createdAt'];
    
    // 构建select对象
    const select: PrismaSelectInput = {};
    fieldList.forEach((field: string) => {
      select[field] = true;
    });
    
    // 使用Promise.all并行查询，提高性能
    const [musicList, total] = await Promise.all([
      prisma.music.findMany({
        where,
        select,
        orderBy,
        skip,
        take: parseInt(limit as string),
      }),
      prisma.music.count({ where }),
    ]);
    
    res.json({
      status: 'success',
      data: musicList,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    logger.error('Failed to get music list', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: '获取音乐配置失败' });
  }
};

/**
 * 创建音乐配置
 */
export const createMusic = async (req: Request, res: Response) => {
  try {
    const { title, artist, coverUrl, platform, url, lyrics, description, isVisible, orderIndex } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ error: '音乐标题不能为空' });
    }
    
    const music = await prisma.music.create({
      data: {
        title: title.trim(),
        artist: artist?.trim() || null,
        coverUrl: coverUrl?.trim() || null,
        platform: platform || 'netease',
        url: url?.trim() || null,
        lyrics: lyrics?.trim() || null,
        description: description?.trim() || null,
        orderIndex: orderIndex || 0,
        isVisible: isVisible !== false
      }
    });
    
    logger.info('Music created successfully', { musicId: music.id, title });
    res.status(201).json({ status: 'success', data: music });
  } catch (error) {
    logger.error('Failed to create music', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: '创建音乐配置失败' });
  }
};

/**
 * 更新音乐配置
 */
export const updateMusic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, artist, coverUrl, platform, url, lyrics, description, isVisible, orderIndex } = req.body;
    
    const dataToUpdate: any = {};
    
    if (title !== undefined) dataToUpdate.title = title?.trim() || '';
    if (artist !== undefined) dataToUpdate.artist = artist?.trim() || null;
    if (coverUrl !== undefined) dataToUpdate.coverUrl = coverUrl?.trim() || null;
    if (platform !== undefined) dataToUpdate.platform = platform;
    if (url !== undefined) dataToUpdate.url = url?.trim() || null;
    if (lyrics !== undefined) dataToUpdate.lyrics = lyrics?.trim() || null;
    if (description !== undefined) dataToUpdate.description = description?.trim() || null;
    if (isVisible !== undefined) dataToUpdate.isVisible = isVisible;
    if (orderIndex !== undefined) dataToUpdate.orderIndex = orderIndex;
    
    const music = await prisma.music.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });
    
    logger.info('Music updated successfully', { musicId: music.id, title });
    res.json({ status: 'success', data: music });
  } catch (error) {
    logger.error('Failed to update music', { musicId: parseInt(req.params.id), error: error instanceof Error ? error.message : 'Unknown error' });
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
    
    logger.info('Music deleted successfully', { musicId: parseInt(id) });
    res.json({ status: 'success', message: '删除成功' });
  } catch (error) {
    logger.error('Failed to delete music', { musicId: parseInt(req.params.id), error: error instanceof Error ? error.message : 'Unknown error' });
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
    
    logger.info('Music order updated successfully', { updatedCount: musicIds.length });
    res.json({ status: 'success', message: '排序更新成功' });
  } catch (error) {
    logger.error('Failed to update music order', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: '更新音乐排序失败' });
  }
};
