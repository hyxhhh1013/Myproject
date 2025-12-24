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
    const config = await prisma.siteConfig.findFirst();
    if (config) {
      await prisma.siteConfig.update({
        where: { id: config.id },
        data: { viewCount: { increment: 1 } }
      });
    }
    res.json({ status: 'success' });
  } catch (error) {
    // Silent fail
    res.json({ status: 'error' });
  }
};
