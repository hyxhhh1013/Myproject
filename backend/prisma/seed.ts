import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create User (Privacy-safe public profile)
  const user = await prisma.user.upsert({
    where: { email: 'hyxhhh1013@gmail.com' },
    update: {
      name: '黄奕轩',
      title: 'FDE / AI 全栈实习生',
      bio: '湖南农业大学计算机科学与技术 2024 级本科在读（预计 2028.06 毕业）。目前在湖南洋葱教育担任驻场 FDE，同时独立负责 AIFA 实验室「禾书耕文」农业科研 AI 写作系统。',
      location: '湖南长沙',
      phone: '',
    },
    create: {
      name: '黄奕轩',
      title: 'FDE / AI 全栈实习生',
      bio: '湖南农业大学计算机科学与技术 2024 级本科在读（预计 2028.06 毕业）。目前在湖南洋葱教育担任驻场 FDE，同时独立负责 AIFA 实验室「禾书耕文」农业科研 AI 写作系统。',
      avatar: 'https://avatars.githubusercontent.com/hyxhhh1013',
      email: 'hyxhhh1013@gmail.com',
      password: '$2a$10$FMpLeCpxWqAUFjvTw5Os2eGA6JIdYQxD42vWHv88Yhy7WLAV6FR5e',
      phone: '',
      location: '湖南长沙',

      // 2. Education
      education: {
        create: [
          {
            school: '湖南农业大学',
            degree: '本科',
            major: '计算机科学与技术（信息与智能科学技术学院）',
            startDate: new Date('2024-09-01'),
            endDate: new Date('2028-06-30'),
            description: '核心课程：数据结构、计算机网络、操作系统、数据库、网络安全。实验室：农业人工智能实验室（AIFA）、蝮蛇信息安全实验室、智慧农业创新中心。',
          },
        ],
      },

      // 3. Experience
      experience: {
        create: [
          {
            company: '湖南洋葱教育科技有限公司',
            position: 'FDE 驻场工程师',
            startDate: new Date('2026-05-01'),
            description: '2026 年 5 月入职，6 月起连续驻场 15 周。对接转化、教务、HR、财务等 8 个项目组，沉淀 39–45 份业务流程文档。经营中台覆盖家教和雅思全链路；消课三级审批和课酬按日指派做在服务端。另有 35 个只读工具的经营 Agent（写库必须人确认）和巨量本地推 19 条官方 API。',
            orderIndex: 1,
          },
          {
            company: 'AIFA 实验室',
            position: '农业科研 AI 辅助写作系统 · 独立全栈',
            startDate: new Date('2026-03-01'),
            description: '实验室重点项目。把论文初稿从手写约一个月缩短到约 3 天（已交出 10 余篇初稿）。用 LangGraph 做成可恢复写作循环（46 个工具 + 11 路 SSE），本地 RAG（BM25+向量，RRF）收录 2,749 篇文献、176,230 个知识块；支持 SCI/Nature/IEEE/GB/T 7713/CAS 五套模板导出。演示：https://ai4science.hyxhhh.site/',
            orderIndex: 2,
          },
          {
            company: '智慧农业创新中心',
            position: '学生团队负责人 · 一线调研',
            startDate: new Date('2026-03-01'),
            description: '2026 年 3–4 月撰写山姆会员店供应链调研，4 月汇报红星农批和东升农场，并参加编书与一线走访。暑假科创营上分享调研方法论。',
            orderIndex: 3,
          },
          {
            company: '个人项目',
            position: '全栈门户 & AI 助手',
            startDate: new Date('2025-12-01'),
            description: '作品展示 + 11 个 CMS 模块 + 智谱 GLM 服务端 SSE 流式对话的个人站，Nginx/PM2/SSL 生产部署。站点：https://hyxhhh.site/',
            orderIndex: 4,
          },
          {
            company: '中国联通长沙市分公司',
            position: '「沃·创计划」第五期实习',
            startDate: new Date('2025-07-01'),
            endDate: new Date('2025-08-31'),
            description: '2025 年暑期参加长沙联通「沃·创计划」第五期（星长沙联通快乐暑假营），实习单位为长沙联通芙蓉区分公司。',
            orderIndex: 5,
          },
        ],
      },

      // 4. Skills
      skills: {
        create: [
          { name: 'React / Next.js', level: 80, category: 'Frontend', orderIndex: 1 },
          { name: 'TypeScript', level: 78, category: 'Frontend', orderIndex: 2 },
          { name: 'Tailwind CSS', level: 74, category: 'Frontend', orderIndex: 3 },
          { name: 'Node.js / FastAPI', level: 74, category: 'Backend', orderIndex: 4 },
          { name: 'Prisma / PostgreSQL', level: 72, category: 'Backend', orderIndex: 5 },
          { name: 'LangGraph / RAG', level: 70, category: 'AI', orderIndex: 6 },
        ],
      },

      // 5. Projects
      projects: {
        create: [
          {
            title: '禾书耕文',
            description: 'Next.js 16 + LangGraph（46 个工具 + 11 路 SSE）+ Hybrid RAG（2,749 篇文献、176,230 知识块，BM25+向量 RRF 融合）+ 五套学术模板导出，把论文初稿从 1 个月缩短至约 3 天。',
            startDate: new Date('2026-03-01'),
            technologies: JSON.stringify(['Next.js 16', 'React 19', 'TypeScript', 'LangGraph', 'RAG', 'PostgreSQL', 'Playwright']),
            githubUrl: 'https://github.com/hyxhhh1013/AI-assisted-writing-system-for-agricultural-research',
            demoUrl: 'https://ai4science.hyxhhh.site/',
            isFeatured: true,
            orderIndex: 1,
          },
          {
            title: '饭定了',
            description: '校园选餐：室友建房、填口味，一起把店定下来。2026 年 6 月 14 日在湘江卓越工程师学院 LEV0 miniCamp 获最佳创意奖。',
            startDate: new Date('2026-06-01'),
            technologies: JSON.stringify(['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Prisma']),
            githubUrl: '',
            demoUrl: 'https://eat.hyxhhh.site/',
            isFeatured: true,
            orderIndex: 2,
          },
          {
            title: '梦境拓扑 DreamTop',
            description: '4 周从 0 上线，支持语音和文字输入，把梦境文本抽取成意象与情感结构化数据再做 60fps 拓扑可视化。字节跳动 Trae on Campus 湖南农业大学三等奖。',
            startDate: new Date('2026-03-01'),
            endDate: new Date('2026-04-30'),
            technologies: JSON.stringify(['React', 'Vite', 'Node.js', 'Express', 'Prisma', 'MySQL', 'Framer Motion', 'GLM-4 API']),
            githubUrl: 'https://github.com/hyxhhh1013/dream-topology',
            demoUrl: 'https://dream.hyxhhh.site/',
            isFeatured: true,
            orderIndex: 3,
          },
          {
            title: '界外 Outbounds',
            description: 'Next.js 16 全栈应用，独立做出 Hacker / Art / ACG 三个主题宇宙（卡片式内容流、即时通讯、跨宇宙 AI 对话）。字节跳动 Trae on Campus 中南大学二等奖。',
            startDate: new Date('2026-02-01'),
            endDate: new Date('2026-03-31'),
            technologies: JSON.stringify(['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Prisma', 'SQLite', 'Framer Motion', 'Zod']),
            githubUrl: 'https://github.com/hyxhhh1013/Outbounds',
            demoUrl: 'https://hyxhhh.site/outbounds',
            isFeatured: true,
            orderIndex: 4,
          },
        ],
      },

      // 6. Contacts (Privacy-safe: email & location only, no phone number)
      contacts: {
        create: [
          { type: 'email', value: 'hyxhhh1013@gmail.com' },
          { type: 'location', value: '湖南长沙' },
        ],
      },

      // 7. Social Media
      socialMedia: {
        create: [
          { platform: 'github', url: 'https://github.com/hyxhhh1013' },
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
