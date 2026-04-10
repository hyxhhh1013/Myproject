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

  // 9. Music
  const musicList = [
    { title: '晴天', artist: '周杰伦', coverUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', platform: 'netease', url: '', isVisible: true, orderIndex: 1 },
    { title: '稻香', artist: '周杰伦', coverUrl: 'https://p2.music.126.net/8SQn3b8U4KcVb2x4JgS1uw==/109951165087313309.jpg', platform: 'netease', url: '', isVisible: true, orderIndex: 2 },
    { title: '青花瓷', artist: '周杰伦', coverUrl: 'https://p2.music.126.net/4G8Wjmj7DlT24LbJx8nZJw==/109951163076649060.jpg', platform: 'netease', url: '', isVisible: true, orderIndex: 3 },
    { title: 'Shape of You', artist: 'Ed Sheeran', coverUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', platform: 'spotify', url: '', isVisible: true, orderIndex: 4 },
    { title: 'Blinding Lights', artist: 'The Weeknd', coverUrl: 'https://p2.music.126.net/8SQn3b8U4KcVb2x4JgS1uw==/109951165087313309.jpg', platform: 'spotify', url: '', isVisible: true, orderIndex: 5 },
  ];
  
  // 先删除现有数据
  await prisma.music.deleteMany({});
  for (const music of musicList) {
    await prisma.music.create({
      data: music,
    });
  }
  console.log('Created music data');

  // 10. Movies
  const movieList = [
    { title: '肖申克的救赎', director: '弗兰克·德拉邦特', year: 1994, posterUrl: '/肖申克的救赎.jpg', rating: 9.7, likes: 126, isVisible: true, orderIndex: 1 },
    { title: '海上钢琴师', director: '朱塞佩·托纳多雷', year: 1998, posterUrl: '/海上钢琴师.jpg', rating: 9.2, likes: 98, isVisible: true, orderIndex: 2 },
    { title: '唐人街探案', director: '陈思诚', year: 2015, posterUrl: '/唐人街探案.jpg', rating: 7.7, likes: 65, isVisible: true, orderIndex: 3 },
    { title: '让子弹飞', director: '姜文', year: 2010, posterUrl: '/让子弹飞.jpg', rating: 9.0, likes: 102, isVisible: true, orderIndex: 4 },
    { title: '默杀', director: '张艺谋', year: 2024, posterUrl: '/默杀.jpg', rating: 8.5, likes: 78, isVisible: true, orderIndex: 5 },
    { title: '你的婚礼', director: '韩天', year: 2021, posterUrl: '/你的婚礼.jpg', rating: 5.3, likes: 42, isVisible: true, orderIndex: 6 },
  ];
  
  // 先删除现有数据
  await prisma.movie.deleteMany({});
  for (const movie of movieList) {
    await prisma.movie.create({
      data: movie,
    });
  }
  console.log('Created movie data');

  // 11. Travel Cities
  const travelCities = [
    { name: '北京', location: '中国', latitude: 39.9042, longitude: 116.4074, isVisible: true, orderIndex: 1 },
    { name: '上海', location: '中国', latitude: 31.2304, longitude: 121.4737, isVisible: true, orderIndex: 2 },
    { name: '广州', location: '中国', latitude: 23.1291, longitude: 113.2644, isVisible: true, orderIndex: 3 },
    { name: '深圳', location: '中国', latitude: 22.5431, longitude: 114.0579, isVisible: true, orderIndex: 4 },
    { name: '杭州', location: '中国', latitude: 30.2741, longitude: 120.1551, isVisible: true, orderIndex: 5 },
  ];
  
  // 先删除现有数据
  await prisma.travelCity.deleteMany({});
  for (const city of travelCities) {
    await prisma.travelCity.create({
      data: city,
    });
  }
  console.log('Created travel city data');

  // 12. Site Config
  await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: {
      siteTitle: '个人作品集',
      seoKeywords: '个人作品集,全栈开发,Web开发,摄影',
      seoDescription: '一个展示个人作品、技能和经历的全栈开发网站',
      icpCode: '京ICP备12345678号',
    },
    create: {
      siteTitle: '个人作品集',
      seoKeywords: '个人作品集,全栈开发,Web开发,摄影',
      seoDescription: '一个展示个人作品、技能和经历的全栈开发网站',
      icpCode: '京ICP备12345678号',
    },
  });
  console.log('Created site config data');

  // 13. Photos
  const photoList = [
    {
      title: '测试照片 1',
      imageUrl: '/uploads/test1.jpg',
      thumbnailUrl: '/uploads/test1-thumbnail.jpg',
      categoryId: 1,
      isFeatured: true,
      isVisible: true,
      orderIndex: 1,
      takenAt: new Date('2024-01-01'),
      cameraModel: 'Sony A7M4',
      lens: '35mm f/1.4',
      focalLength: '35',
      aperture: '1.4',
      shutterSpeed: '1/1000',
      iso: '100',
      description: '测试照片 1 描述'
    },
    {
      title: '测试照片 2',
      imageUrl: '/uploads/test2.jpg',
      thumbnailUrl: '/uploads/test2-thumbnail.jpg',
      categoryId: 2,
      isFeatured: false,
      isVisible: true,
      orderIndex: 2,
      takenAt: new Date('2024-02-01'),
      cameraModel: 'Canon R6',
      lens: '50mm f/1.2',
      focalLength: '50',
      aperture: '1.2',
      shutterSpeed: '1/2000',
      iso: '200',
      description: '测试照片 2 描述'
    },
    {
      title: '测试照片 3',
      imageUrl: '/uploads/test3.jpg',
      thumbnailUrl: '/uploads/test3-thumbnail.jpg',
      categoryId: 3,
      isFeatured: false,
      isVisible: true,
      orderIndex: 3,
      takenAt: new Date('2024-03-01'),
      cameraModel: 'Fujifilm X-T4',
      lens: '23mm f/1.4',
      focalLength: '23',
      aperture: '1.4',
      shutterSpeed: '1/1500',
      iso: '160',
      description: '测试照片 3 描述'
    }
  ];
  
  // 先删除现有数据
  await prisma.photo.deleteMany({});
  for (const photo of photoList) {
    await prisma.photo.create({
      data: photo,
    });
  }
  console.log('Created photo data');

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
