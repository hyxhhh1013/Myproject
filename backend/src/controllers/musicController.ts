import { Request, Response } from 'express';
import { prisma } from '../index';
import logger from '../utils/logger';
import { asyncHandler } from '../middleware/asyncHandler';

export const resolveNeteaseMusic = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (url.includes('y.qq.com') || url.includes('qq.com')) {
    let songId = '';

    const songmidMatch = url.match(/songDetail\/([a-zA-Z0-9]+)/);
    if (songmidMatch) {
      songId = songmidMatch[1];
    } else {
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
              success: true, platform: 'qq', url: result.info.url,
              title: result.info.name, artist: result.info.auther,
              cover: result.info.pic, lyrics: '',
            });
          }
        }
      } catch (e) {
        console.error('[Music] QQ Music API failed:', e);
      }
    }

    return res.status(400).json({ error: '无法解析 QQ 音乐链接或获取直链失败' });
  }

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
          success: true, platform: 'netease',
          url: result.info.url, title: result.info.name,
          artist: result.info.auther, cover: result.info.pic, lyrics: '',
        });
      }
    }
  } catch (e) {
    console.error('[Music] API failed:', e);
  }

  return res.json({
    success: true, platform: 'netease',
    url: `https://music.163.com/song/media/outer/url?id=${songId}.mp3`,
    title: `网易云音乐 ${songId}`, artist: '未知歌手', cover: '', lyrics: '',
  });
});

export const getMusic = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '50', isVisible, platform, search, sort, fields } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (isVisible !== undefined) {
    where.isVisible = isVisible === 'true';
  }

  if (platform) {
    where.platform = platform as string;
  }

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' as const } },
      { artist: { contains: search as string, mode: 'insensitive' as const } },
      { description: { contains: search as string, mode: 'insensitive' as const } },
    ];
  }

  let orderBy: any = { orderIndex: 'asc' };
  if (sort === 'title_asc') orderBy = { title: 'asc' };
  else if (sort === 'title_desc') orderBy = { title: 'desc' };
  else if (sort === 'created_asc') orderBy = { createdAt: 'asc' };
  else if (sort === 'created_desc') orderBy = { createdAt: 'desc' };

  const fieldList = fields
    ? (fields as string).split(',')
    : ['id', 'title', 'artist', 'coverUrl', 'platform', 'url', 'lyrics', 'description', 'isVisible', 'orderIndex', 'createdAt'];

  const [musicList, total] = await Promise.all([
    prisma.music.findMany({ where, skip, take: limitNum, orderBy }),
    prisma.music.count({ where }),
  ]);

  res.json({
    status: 'success',
    data: musicList,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

export const createMusic = asyncHandler(async (req: Request, res: Response) => {
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
      isVisible: isVisible !== false,
    },
  });

  logger.info('Music created successfully', { musicId: music.id, title });
  res.status(201).json({ status: 'success', data: music });
});

export const updateMusic = asyncHandler(async (req: Request, res: Response) => {
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
    data: dataToUpdate,
  });

  logger.info('Music updated successfully', { musicId: music.id, title });
  res.json({ status: 'success', data: music });
});

export const deleteMusic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.music.delete({ where: { id: parseInt(id) } });
  logger.info('Music deleted successfully', { musicId: parseInt(id) });
  res.json({ status: 'success', message: '删除成功' });
});

export const updateMusicOrder = asyncHandler(async (req: Request, res: Response) => {
  const { musicIds } = req.body;

  await prisma.$transaction(
    musicIds.map((id: number, index: number) =>
      prisma.music.update({ where: { id }, data: { orderIndex: index } }),
    ),
  );

  logger.info('Music order updated successfully', { updatedCount: musicIds.length });
  res.json({ status: 'success', message: '排序更新成功' });
});
