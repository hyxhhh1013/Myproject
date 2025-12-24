"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// 初始化数据
const initData = async () => {
    try {
        console.log('开始同步数据...');
        // 1. 创建或更新默认用户
        console.log('同步用户数据...');
        const defaultPassword = await bcryptjs_1.default.hash('password123', 10);
        const user = await prisma.user.upsert({
            where: { email: 'admin@example.com' },
            update: {
                name: 'Admin',
                title: '全栈开发工程师',
                bio: '欢迎访问我的个人网站。',
                password: defaultPassword,
            },
            create: {
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
        console.log('用户数据同步完成:', user.email);
        // 2. 创建默认的照片分类
        console.log('同步照片分类数据...');
        const photoCategories = ['风景', '城市', '日常'];
        const slugMap = { '风景': 'landscape', '城市': 'city', '日常': 'daily' };
        for (const name of photoCategories) {
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
        console.log('照片分类数据同步完成');
        // 3. 初始化网站配置
        console.log('同步网站配置数据...');
        await prisma.siteConfig.upsert({
            where: { id: 1 },
            update: {
                siteTitle: '奕轩.Dev',
                seoKeywords: '个人网站,全栈开发,前端开发,后端开发,React,Node.js,TypeScript',
                seoDescription: '奕轩的个人网站，展示个人作品、技术栈和生活兴趣',
                icpCode: '豫ICP备12345678号',
                viewCount: 0,
            },
            create: {
                siteTitle: '奕轩.Dev',
                seoKeywords: '个人网站,全栈开发,前端开发,后端开发,React,Node.js,TypeScript',
                seoDescription: '奕轩的个人网站，展示个人作品、技术栈和生活兴趣',
                icpCode: '豫ICP备12345678号',
                viewCount: 0,
            }
        });
        console.log('网站配置数据同步完成');
        console.log('所有数据同步完成！');
    }
    catch (error) {
        console.error('数据同步失败:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
};
// 执行数据同步
initData();
//# sourceMappingURL=syncData.js.map