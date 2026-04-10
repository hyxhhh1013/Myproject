import { Request, Response } from 'express';
import { prisma } from '../index';

export const getSiteConfig = async (req: Request, res: Response) => {
  try {
    // There should be only one config, if not create one
    let config = await prisma.siteConfig.findFirst();
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {}
      });
    }
    
    // Also get the owner user's bio for "About Me"
    const user = await prisma.user.findFirst();
    
    res.json({
      ...config,
      aboutMe: user?.bio || ''
    });
  } catch (error) {
    console.error('获取站点配置失败:', error);
    res.status(500).json({ error: '获取站点配置失败' });
  }
};

export const updateSiteConfig = async (req: Request, res: Response) => {
  try {
    const { siteTitle, seoKeywords, seoDescription, icpCode, aboutMe } = req.body;
    
    // Update User bio if provided
    if (aboutMe !== undefined) {
      const user = await prisma.user.findFirst();
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { bio: aboutMe }
        });
      }
    }

    let config = await prisma.siteConfig.findFirst();
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          siteTitle,
          seoKeywords,
          seoDescription,
          icpCode
        }
      });
    } else {
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          siteTitle,
          seoKeywords,
          seoDescription,
          icpCode
        }
      });
    }
    
    res.json({
      ...config,
      aboutMe // return back the new aboutMe
    });
  } catch (error) {
    console.error('更新站点配置失败:', error);
    res.status(500).json({ error: '更新站点配置失败' });
  }
};

export const incrementViewCount = async (req: Request, res: Response) => {
  try {
    // 开始事务
    await prisma.$transaction(async (prisma) => {
      // 更新总访问量
      const config = await prisma.siteConfig.findFirst();
      if (config) {
        await prisma.siteConfig.update({
          where: { id: config.id },
          data: { viewCount: { increment: 1 } }
        });
      }

      // 更新每日访问量
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingStat = await prisma.visitorStat.findFirst({
        where: {
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (existingStat) {
        // 如果今天已有记录，增加计数
        await prisma.visitorStat.update({
          where: { id: existingStat.id },
          data: { count: { increment: 1 } }
        });
      } else {
        // 如果今天没有记录，创建新记录
        await prisma.visitorStat.create({
          data: { date: today }
        });
      }
    });

    res.json({ status: 'success' });
  } catch (error) {
    console.error('更新访问量失败:', error);
    // Silent fail
    res.json({ status: 'error' });
  }
};

// 获取访客统计数据
export const getVisitorStats = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));
    daysAgo.setHours(0, 0, 0, 0);

    // 获取指定天数内的统计数据
    const stats = await prisma.visitorStat.findMany({
      where: {
        date: {
          gte: daysAgo
        }
      },
      orderBy: {
        date: 'asc'
      },
      select: {
        date: true,
        count: true
      }
    });

    // 获取总访问量
    const config = await prisma.siteConfig.findFirst();
    const totalViews = config?.viewCount || 0;

    // 获取今日访问量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStats = await prisma.visitorStat.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      select: {
        count: true
      }
    });
    const todayViews = todayStats?.count || 0;

    res.json({
      totalViews,
      todayViews,
      dailyStats: stats,
      period: Number(days)
    });
  } catch (error) {
    console.error('获取访客统计失败:', error);
    res.status(500).json({ error: '获取访客统计失败' });
  }
};
