import { Request, Response } from 'express';
import { prisma } from '../index';

export const getAdminStats = async (_req: Request, res: Response) => {
  const [
    siteConfig,
    photosCount,
    projectsCount,
    experiencesCount,
    skillsCount,
    messagesCount,
    unreadMessagesCount,
    danmakuCount,
    momentsCount,
    musicCount,
    moviesCount,
    travelCitiesCount,
    recentMessages,
    recentDanmaku,
    recentVisitorStats,
  ] = await Promise.all([
    prisma.siteConfig.findFirst({ select: { viewCount: true, siteTitle: true, updatedAt: true } }),
    prisma.photo.count(),
    prisma.project.count(),
    prisma.experience.count(),
    prisma.skill.count(),
    prisma.message.count(),
    prisma.message.count({ where: { isRead: false } }),
    prisma.danmaku.count(),
    prisma.moment.count(),
    prisma.music.count(),
    prisma.movie.count(),
    prisma.travelCity.count(),
    prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        content: true,
        isRead: true,
        createdAt: true,
      },
    }),
    prisma.danmaku.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        content: true,
        color: true,
        isVisible: true,
        createdAt: true,
      },
    }),
    prisma.visitorStat.findMany({
      orderBy: { date: 'desc' },
      take: 7,
      select: {
        date: true,
        count: true,
      },
    }),
  ]);

  const mem = process.memoryUsage();

  res.status(200).json({
    status: 'success',
    data: {
      counts: {
        views: siteConfig?.viewCount || 0,
        photos: photosCount,
        projects: projectsCount,
        experiences: experiencesCount,
        skills: skillsCount,
        messages: messagesCount,
        unreadMessages: unreadMessagesCount,
        danmaku: danmakuCount,
        moments: momentsCount,
        music: musicCount,
        movies: moviesCount,
        travelCities: travelCitiesCount,
      },
      siteTitle: siteConfig?.siteTitle || 'Personal Portal',
      recentMessages,
      recentDanmaku,
      recentVisitorStats: recentVisitorStats.reverse(),
      server: {
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        memoryMB: Math.round(mem.rss / 1024 / 1024),
        timestamp: new Date().toISOString(),
      },
    },
  });
};
