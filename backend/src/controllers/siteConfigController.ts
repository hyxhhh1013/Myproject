import { Request, Response } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/asyncHandler';

export const getSiteConfig = asyncHandler(async (req: Request, res: Response) => {
  let config = await prisma.siteConfig.findFirst();
  if (!config) {
    config = await prisma.siteConfig.create({ data: {} });
  }

  const user = await prisma.user.findFirst();

  res.json({ ...config, aboutMe: user?.bio || '' });
});

export const updateSiteConfig = asyncHandler(async (req: Request, res: Response) => {
  const { siteTitle, seoKeywords, seoDescription, icpCode, aboutMe } = req.body;

  if (aboutMe !== undefined) {
    const user = await prisma.user.findFirst();
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { bio: aboutMe },
      });
    }
  }

  let config = await prisma.siteConfig.findFirst();
  if (!config) {
    config = await prisma.siteConfig.create({
      data: { siteTitle, seoKeywords, seoDescription, icpCode },
    });
  } else {
    config = await prisma.siteConfig.update({
      where: { id: config.id },
      data: { siteTitle, seoKeywords, seoDescription, icpCode },
    });
  }

  res.json({ ...config, aboutMe });
});

export const incrementViewCount = asyncHandler(async (req: Request, res: Response) => {
  await prisma.$transaction(async (tx) => {
    const config = await tx.siteConfig.findFirst();
    if (config) {
      await tx.siteConfig.update({
        where: { id: config.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingStat = await tx.visitorStat.findFirst({
      where: { date: { gte: today, lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } },
    });

    if (existingStat) {
      await tx.visitorStat.update({
        where: { id: existingStat.id },
        data: { count: { increment: 1 } },
      });
    } else {
      await tx.visitorStat.create({ data: { date: today } });
    }
  });

  res.json({ status: 'success' });
});

export const getVisitorStats = asyncHandler(async (req: Request, res: Response) => {
  const { days = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(days));
  daysAgo.setHours(0, 0, 0, 0);

  const stats = await prisma.visitorStat.findMany({
    where: { date: { gte: daysAgo } },
    orderBy: { date: 'asc' },
    select: { date: true, count: true },
  });

  const config = await prisma.siteConfig.findFirst();
  const totalViews = config?.viewCount || 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStats = await prisma.visitorStat.findFirst({
    where: { date: { gte: today, lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } },
    select: { count: true },
  });
  const todayViews = todayStats?.count || 0;

  res.json({ totalViews, todayViews, dailyStats: stats, period: Number(days) });
});
