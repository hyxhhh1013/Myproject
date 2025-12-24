import { PrismaClient } from '@prisma/client';

export const initData = async (prisma: PrismaClient) => {
  try {
    const userCount = await prisma.user.count();
    
    // Default password: password123
    const defaultPassword = '$2a$10$FMpLeCpxWqAUFjvTw5Os2eGA6JIdYQxD42vWHv88Yhy7WLAV6FR5e';
    
    if (userCount === 0) {
      // 1. Create Default User
      await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: defaultPassword,
          name: 'Admin',
          title: '全栈开发工程师',
          bio: '欢迎访问我的个人网站。',
          avatar: '',
          phone: '',
          location: '',
        }
      });
    } else {
      // Update existing user to use default credentials
      await prisma.user.updateMany({
        where: {},
        data: {
          email: 'admin@example.com',
          password: defaultPassword,
          name: 'Admin',
          title: '全栈开发工程师',
          bio: '欢迎访问我的个人网站。',
        }
      });
    }
    
    // 2. Create Default Photo Categories
    const categories = ['风景', '城市', '日常'];
    for (const name of categories) {
        const slugMap: Record<string, string> = { '风景': 'landscape', '城市': 'city', '日常': 'daily' };
        await prisma.photoCategory.upsert({
            where: { name },
            update: {},
            create: {
                name,
                slug: slugMap[name] || name,
                description: `${name}系列`
            }
        });
    }
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
};
