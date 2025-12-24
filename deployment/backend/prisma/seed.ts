import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create User
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {
      password: '$2a$10$FMpLeCpxWqAUFjvTw5Os2eGA6JIdYQxD42vWHv88Yhy7WLAV6FR5e',
    },
    create: {
      name: '张三',
      title: '全栈开发工程师',
      bio: '热爱编程，专注于Web开发和人工智能。拥有5年全栈开发经验，擅长React、Node.js和Python。',
      avatar: 'https://ui-avatars.com/api/?name=Zhang+San&background=random',
      email: 'demo@example.com',
      // Default password: password123
      password: '$2a$10$FMpLeCpxWqAUFjvTw5Os2eGA6JIdYQxD42vWHv88Yhy7WLAV6FR5e',
      phone: '+86 138 0000 0000',
      location: '中国，北京',
      
      // 2. Education
      education: {
        create: [
          {
            school: '北京大学',
            degree: '硕士',
            major: '计算机科学与技术',
            startDate: new Date('2018-09-01'),
            endDate: new Date('2021-06-30'),
            description: '专注于人工智能和机器学习研究。',
          },
          {
            school: '清华大学',
            degree: '学士',
            major: '软件工程',
            startDate: new Date('2014-09-01'),
            endDate: new Date('2018-06-30'),
            description: '主修软件工程，辅修工商管理。',
          },
        ],
      },
      
      // 3. Experience
      experience: {
        create: [
          {
            company: '科技创新有限公司',
            position: '高级全栈工程师',
            startDate: new Date('2021-07-01'),
            description: '负责公司核心产品的架构设计和开发，带领5人团队完成多个关键项目。',
          },
          {
            company: '互联网初创企业',
            position: '前端开发工程师',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2021-06-30'),
            description: '负责公司官网和移动端H5页面的开发，优化前端性能。',
          },
        ],
      },
      
      // 4. Skills
      skills: {
        create: [
          { name: 'React', level: 90, category: 'Frontend' },
          { name: 'Vue', level: 85, category: 'Frontend' },
          { name: 'TypeScript', level: 88, category: 'Frontend' },
          { name: 'Node.js', level: 85, category: 'Backend' },
          { name: 'Python', level: 80, category: 'Backend' },
          { name: 'Docker', level: 75, category: 'DevOps' },
          { name: 'AWS', level: 70, category: 'Cloud' },
        ],
      },
      
      // 5. Projects
      projects: {
        create: [
          {
            title: '个人作品集网站',
            description: '使用React和Node.js构建的个人作品集网站，展示个人简历、项目经验和摄影作品。',
            startDate: new Date('2023-01-01'),
            technologies: JSON.stringify(['React', 'Node.js', 'Prisma', 'SQLite']),
            githubUrl: 'https://github.com/example/portfolio',
            demoUrl: 'https://portfolio.example.com',
          },
          {
            title: '智能天气助手',
            description: '基于AI的天气预测和建议助手，提供穿衣指数和出行建议。',
            startDate: new Date('2022-06-01'),
            endDate: new Date('2022-12-31'),
            technologies: JSON.stringify(['Python', 'Flask', 'TensorFlow', 'React']),
            githubUrl: 'https://github.com/example/weather-ai',
          },
        ],
      },
      
      // 6. Contacts
      contacts: {
        create: [
          { type: 'email', value: 'demo@example.com' },
          { type: 'phone', value: '+86 138 0000 0000' },
          { type: 'location', value: '北京，朝阳区' },
        ],
      },
      
      // 7. Social Media
      socialMedia: {
        create: [
          { platform: 'github', url: 'https://github.com' },
          { platform: 'linkedin', url: 'https://linkedin.com' },
          { platform: 'twitter', url: 'https://twitter.com' },
        ],
      },
    },
  });

  console.log(`Created user with id: ${user.id}`);

  // 8. Photo Categories
  const categories = ['风景', '人像', '城市', '生活', '黑白'];
  for (const name of categories) {
    await prisma.photoCategory.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: name.toLowerCase(), // In real app, might want pinyin or english slug
        description: `${name}摄影作品集`,
      },
    });
  }
  console.log('Created photo categories');

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
