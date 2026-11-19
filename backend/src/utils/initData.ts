import { PrismaClient } from '@prisma/client';
import logger from './logger';

export const initData = async (prisma: PrismaClient) => {
  try {
    const userCount = await prisma.user.count();

    // Default password: password123
    const defaultPassword = '$2a$10$FMpLeCpxWqAUFjvTw5Os2eGA6JIdYQxD42vWHv88Yhy7WLAV6FR5e';

    if (userCount === 0) {
      await prisma.user.create({
        data: {
          email: 'hyxhhh1013@gmail.com',
          password: defaultPassword,
          name: '黄奕轩',
          title: 'FDE / AI 全栈实习生 · 湖南农业大学计算机科学与技术 2024 级',
          bio: '湖南农业大学信息与智能科学技术学院 · 计算机科学与技术专业 2024 级本科在读（预计 2028 年 6 月毕业）。目前在湖南洋葱教育担任驻场 FDE，对接教育培训经营中台；同时独立负责 AIFA 实验室重点项目「禾书耕文」，并推进智慧农业创新中心一线调研。',
          avatar: 'https://avatars.githubusercontent.com/hyxhhh1013',
          phone: '',
          location: '中国 · 湖南长沙',
        },
      });
      logger.info('Default user (Huang Yixuan) created');
    }

    const categories = ['风景', '城市', '生活', '人像', '日常'];
    const slugMap: Record<string, string> = {
      '风景': 'scenery',
      '城市': 'city',
      '生活': 'life',
      '人像': 'portrait',
      '日常': 'daily',
    };
    for (const name of categories) {
      await prisma.photoCategory.upsert({
        where: { name },
        update: {},
        create: {
          name,
          slug: slugMap[name] || name,
          description: `${name}系列`,
        },
      });
    }
  } catch (error) {
    logger.error('Failed to initialize data:', { error });
  }
};
