"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initData = void 0;
const initData = async (prisma) => {
    try {
        const userCount = await prisma.user.count();
        if (userCount === 0) {
            console.log('No users found. Initializing default data...');
            // 1. Create Default User
            await prisma.user.create({
                data: {
                    email: 'admin@example.com',
                    // Default password: password123
                    password: '$2a$10$FMpLeCpxWqAUFjvTw5Os2eGA6JIdYQxD42vWHv88Yhy7WLAV6FR5e',
                    name: 'Admin',
                    title: '全栈开发工程师',
                    bio: '欢迎访问我的个人网站。',
                    avatar: '',
                    phone: '',
                    location: '',
                }
            });
            console.log('Default user created.');
            // 2. Create Default Photo Categories
            const categories = ['风景', '城市', '日常'];
            for (const name of categories) {
                const slugMap = { '风景': 'landscape', '城市': 'city', '日常': 'daily' };
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
            console.log('Default categories created.');
        }
    }
    catch (error) {
        console.error('Failed to initialize data:', error);
    }
};
exports.initData = initData;
//# sourceMappingURL=initData.js.map