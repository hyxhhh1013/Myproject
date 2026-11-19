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

const QQ_HEADERS = {
  Referer: 'https://y.qq.com/',
  Origin: 'https://y.qq.com',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
};

async function extractQqPlaylistId(rawInput: string): Promise<string | null> {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // Direct numeric playlist ID
  if (/^\d{5,15}$/.test(trimmed)) {
    return trimmed;
  }

  // Extract first URL if user pasted a full QQ Music share text
  const urlMatch = trimmed.match(/https?:\/\/[^\s]+/i);
  let targetUrl = urlMatch ? urlMatch[0] : trimmed;

  const parseIdFromUrl = (u: string): string | null => {
    const patterns = [
      /playlist\/(\d{5,15})/i,
      /[?&]id=(\d{5,15})/i,
      /[?&]disstid=(\d{5,15})/i,
      /taoge\.html[^#]*?id=(\d{5,15})/i,
    ];
    for (const re of patterns) {
      const m = u.match(re);
      if (m?.[1]) return m[1];
    }
    return null;
  };

  const directId = parseIdFromUrl(targetUrl);
  if (directId) return directId;

  // Resolve short share link (e.g. https://c6.y.qq.com/base/fcgi-bin/u?__=xxxx)
  if (/^https?:\/\//i.test(targetUrl)) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const resp = await fetch(targetUrl, {
        redirect: 'follow',
        headers: QQ_HEADERS,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const finalId = parseIdFromUrl(resp.url);
      if (finalId) return finalId;

      const html = await resp.text();
      const htmlMatch = html.match(/(?:disstid|playlistId|taogeId)["':=\s]+(\d{5,15})/i);
      if (htmlMatch?.[1]) return htmlMatch[1];
    } catch (err) {
      logger.warn('Failed to resolve QQ Music short link', { targetUrl, err });
    }
  }

  return null;
}

async function fetchQqLyrics(songmid: string): Promise<string> {
  if (!songmid) return '';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(
      `https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid=${encodeURIComponent(songmid)}&format=json&nobase64=1`,
      { headers: QQ_HEADERS, signal: controller.signal },
    );
    clearTimeout(timeout);
    if (!resp.ok) return '';

    const text = await resp.text();
    const jsonStr = text.trim().replace(/^MusicJsonCallback\(/, '').replace(/\)\s*;?$/, '');
    const parsed = JSON.parse(jsonStr) as { lyric?: string };
    if (!parsed.lyric) return '';

    const rawLyric = parsed.lyric.trim();
    // If QQ still returned base64 despite nobase64=1, decode it
    if (!rawLyric.includes('[') && /^[A-Za-z0-9+/=\s]+$/.test(rawLyric)) {
      return Buffer.from(rawLyric, 'base64').toString('utf-8').trim();
    }
    return rawLyric;
  } catch {
    return '';
  }
}

export const syncQqPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlistInput, replaceExisting = true, limit = 20 } = req.body as {
    playlistInput?: string;
    replaceExisting?: boolean;
    limit?: number;
  };

  if (!playlistInput || typeof playlistInput !== 'string') {
    return res.status(400).json({ error: '请提供 QQ 音乐公开歌单链接或歌单 ID' });
  }

  const playlistId = await extractQqPlaylistId(playlistInput);
  if (!playlistId) {
    return res.status(400).json({
      error: '无法识别 QQ 音乐歌单 ID，请粘贴公开歌单分享链接（如 y.qq.com/n/ryqq/playlist/xxx）或纯数字歌单 ID',
    });
  }

  const maxTracks = Math.max(1, Math.min(50, Number(limit) || 20));

  const apiUrl = `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&disstid=${encodeURIComponent(
    playlistId,
  )}&format=json`;

  let cdData: any = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(apiUrl, { headers: QQ_HEADERS, signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) {
      return res.status(502).json({ error: `QQ 音乐接口响应异常 (${resp.status})` });
    }
    const rawText = await resp.text();
    const cleaned = rawText.trim().replace(/^playlistinfoCallback\(/, '').replace(/\)\s*;?$/, '');
    cdData = JSON.parse(cleaned);
  } catch (err) {
    logger.error('Failed to fetch QQ Music playlist', { playlistId, err });
    return res.status(502).json({ error: '拉取 QQ 音乐歌单失败，请检查网络或确认歌单已设为公开' });
  }

  const cd = Array.isArray(cdData?.cdlist) ? cdData.cdlist[0] : null;
  const rawSongs: any[] = Array.isArray(cd?.songlist) ? cd.songlist : [];
  if (!cd || rawSongs.length === 0) {
    return res.status(404).json({
      error: '未获取到歌单曲目，请确认该 QQ 音乐歌单已设为「公开」且包含歌曲',
    });
  }

  const playlistName = String(cd.dissname || `QQ 音乐歌单 ${playlistId}`);
  const selectedSongs = rawSongs.slice(0, maxTracks);

  // Preserve manually configured MP3 URLs for tracks with matching title+artist
  const existingTracks = await prisma.music.findMany();
  const existingUrlByKey = new Map<string, string>();
  for (const item of existingTracks) {
    if (item.url && item.url.trim()) {
      const key = `${item.title.trim().toLowerCase()}::${(item.artist || '').trim().toLowerCase()}`;
      existingUrlByKey.set(key, item.url.trim());
    }
  }

  // Fetch LRC lyrics in small concurrent batches (4 at a time)
  const preparedTracks: Array<{
    title: string;
    artist: string;
    coverUrl: string | null;
    platform: string;
    url: string | null;
    lyrics: string | null;
    description: string | null;
    playlistId: string;
    playlistType: string;
    orderIndex: number;
    isVisible: boolean;
  }> = [];

  for (let i = 0; i < selectedSongs.length; i += 4) {
    const batch = selectedSongs.slice(i, i + 4);
    const batchResults = await Promise.all(
      batch.map(async (song, batchOffset) => {
        const idx = i + batchOffset;
        const title = String(song.songname || song.name || '未命名歌曲').trim();
        const singers = Array.isArray(song.singer)
          ? song.singer.map((s: any) => s?.name).filter(Boolean).join(' / ')
          : '';
        const artist = singers || '未知歌手';
        const albummid = String(song.albummid || song.album?.mid || '').trim();
        const songmid = String(song.songmid || song.mid || '').trim();
        const coverUrl = albummid
          ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albummid}.jpg`
          : null;
        const detailUrl = songmid ? `https://y.qq.com/n/ryqq/songDetail/${songmid}` : null;
        const lyrics = await fetchQqLyrics(songmid);
        const key = `${title.toLowerCase()}::${artist.toLowerCase()}`;
        const preservedUrl = existingUrlByKey.get(key) || null;

        return {
          title,
          artist,
          coverUrl,
          platform: 'qq',
          url: preservedUrl,
          lyrics: lyrics || null,
          description: detailUrl,
          playlistId,
          playlistType: 'qq_playlist',
          orderIndex: idx,
          isVisible: true,
        };
      }),
    );
    preparedTracks.push(...batchResults);
  }

  const createdTracks = await prisma.$transaction(async (tx) => {
    if (replaceExisting) {
      await tx.music.deleteMany({
        where: {
          OR: [{ playlistType: 'qq_playlist' }, { platform: 'qq' }],
        },
      });
    }
    const inserted = [];
    for (const track of preparedTracks) {
      const row = await tx.music.create({ data: track });
      inserted.push(row);
    }
    return inserted;
  });

  logger.info('Synced QQ Music playlist successfully', {
    playlistId,
    playlistName,
    syncedCount: createdTracks.length,
  });

  res.json({
    status: 'success',
    message: `已同步 QQ 音乐歌单「${playlistName}」（共 ${createdTracks.length} 首）`,
    data: {
      playlistId,
      playlistName,
      syncedCount: createdTracks.length,
      tracks: createdTracks,
    },
  });
});
