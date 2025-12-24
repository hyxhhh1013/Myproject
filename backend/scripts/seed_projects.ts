import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const projects = [
  {
    title: 'WeatherCast (天气预报)',
    description: '一个优雅的天气预报应用，支持全球城市搜索与实时天气展示。',
    technologies: 'React, TypeScript, Chart.js, Axios',
    demoUrl: '/demo/weather',
    githubUrl: 'https://github.com/yourusername/weather-cast',
    orderIndex: 1,
    startDate: new Date('2024-01-01'),
  },
  {
    title: 'FocusFlow (番茄钟)',
    description: '基于番茄工作法的专注力工具，帮助你保持高效工作节奏。',
    technologies: 'React, Web Audio API, LocalStorage',
    demoUrl: '/demo/pomodoro',
    githubUrl: 'https://github.com/yourusername/focus-flow',
    orderIndex: 2,
    startDate: new Date('2024-02-01'),
  },
  {
    title: 'TaskMaster (待办清单)',
    description: '支持拖拽排序的看板式待办事项管理工具。',
    technologies: 'React, dnd-kit, Tailwind CSS',
    demoUrl: '/demo/todo',
    githubUrl: 'https://github.com/yourusername/task-master',
    orderIndex: 3,
    startDate: new Date('2024-03-01'),
  },
  {
    title: 'LiteNote (轻笔记)',
    description: '支持 Markdown 实时预览的极简笔记应用。',
    technologies: 'React, React-Markdown, Context API',
    demoUrl: '/demo/notes',
    githubUrl: 'https://github.com/yourusername/lite-note',
    orderIndex: 4,
    startDate: new Date('2024-04-01'),
  },
];

async function main() {
  console.log('Start seeding projects...');
  
  // Get the first user (usually admin)
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.error('No user found! Please run the initial setup first.');
    return;
  }

  for (const project of projects) {
    const existing = await prisma.project.findFirst({
      where: { 
        title: project.title,
        userId: user.id 
      }
    });

    if (!existing) {
      await prisma.project.create({
        data: {
          ...project,
          userId: user.id
        }
      });
      console.log(`Created project: ${project.title}`);
    } else {
      // Update demoUrl if it's missing or different, to ensure links work
      await prisma.project.update({
        where: { id: existing.id },
        data: {
            demoUrl: project.demoUrl,
            // Update description/tech if you want to enforce consistency
        }
      });
      console.log(`Updated project: ${project.title}`);
    }
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
