import { Request, Response } from 'express';
import { prisma } from '../index';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/demos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// 文件过滤
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 允许上传的文件类型
  const allowedTypes = [
    'image/',
    'video/',
    'application/zip',
    'application/pdf',
    'text/html'
  ];
  
  const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('不允许的文件类型'));
  }
};

// 配置multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

export { upload };

// Get all projects
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // 使用Promise.all并行查询项目和总数，提高性能
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        include: {
          // 只选择必要的用户字段，减少数据传输
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }], // 添加排序
        skip,
        take: parseInt(limit as string),
      }),
      prisma.project.count(), // 获取项目总数
    ]);
    
    // 返回分页信息
    res.status(200).json({
      status: 'success',
      data: projects,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get projects' });
  }
};

// Get project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
      },
    });

    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get project' });
  }
};

// Create project
export const createProject = async (req: Request, res: Response) => {
  try {
    const { userId, title, description, startDate, endDate, technologies, githubUrl, demoUrl, orderIndex } = req.body;
    
    // Handle image upload if present
    const CDN_BASE_URL = process.env.CDN_BASE_URL || '';
    let images: string[] = [];
    let imageUrl = '';

    if ((req as any).files && (req as any).files.length > 0) {
      images = (req as any).files.map((file: any) => `${CDN_BASE_URL}/uploads/demos/${path.basename(file.path)}`);
      imageUrl = images[0];
    }

    const project = await prisma.project.create({
      data: {
        userId: parseInt(userId),
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        technologies,
        githubUrl,
        demoUrl,
        imageUrl,
        images: JSON.stringify(images),
        orderIndex: orderIndex ? parseInt(orderIndex) : 0,
      },
    });

    res.status(201).json({ status: 'success', message: 'Project created successfully', data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create project' });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, technologies, githubUrl, demoUrl, orderIndex, existingImages } = req.body;

    const CDN_BASE_URL = process.env.CDN_BASE_URL || '';
    let finalImages: string[] = [];
    
    // Parse existing images
    if (existingImages) {
      try {
        const parsed = JSON.parse(existingImages);
        if (Array.isArray(parsed)) finalImages = parsed;
      } catch (e) {
        // ignore error
      }
    }

    // Handle new uploads
    if ((req as any).files && (req as any).files.length > 0) {
      const newImages = (req as any).files.map((file: any) => `${CDN_BASE_URL}/uploads/demos/${path.basename(file.path)}`);
      finalImages = [...finalImages, ...newImages];
    } else if (!existingImages && !(req as any).files) {
       // If no existingImages sent and no files, maybe we should keep original?
       // But usually update sends all fields.
       // Let's fetch original to be safe if we want to support partial updates without sending images?
       // But for now, let's assume client sends everything.
       // If client sends NOTHING about images, we shouldn't overwrite images with empty array.
       // Check if `existingImages` was in body (even if empty string/array).
       // If undefined, don't update images.
    }

    const dataToUpdate: any = {
      title,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      technologies,
      githubUrl,
      demoUrl,
      orderIndex: orderIndex ? parseInt(orderIndex) : undefined,
    };
    
    // Only update images if we have changes or explicit existingImages
    if (existingImages !== undefined || ((req as any).files && (req as any).files.length > 0)) {
        dataToUpdate.images = JSON.stringify(finalImages);
        dataToUpdate.imageUrl = finalImages.length > 0 ? finalImages[0] : null;
    }

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.status(200).json({ status: 'success', message: 'Project updated successfully', data: project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update project' });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ status: 'success', message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete project' });
  }
};

// 上传项目Demo
export const uploadProjectDemo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = (req as any).file;
    
    if (!file) {
      return res.status(400).json({ error: '请上传Demo文件' });
    }
    
    // 模拟CDN地址
    const CDN_BASE_URL = process.env.CDN_BASE_URL || '';
    
    // 构建Demo文件URL
    const demoUrl = `${CDN_BASE_URL}/uploads/demos/${path.basename(file.path)}`;
    
    // 更新项目信息
    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { demoUrl },
    });
    
    res.json({ status: 'success', message: 'Demo上传成功', data: project });
  } catch (error) {
    console.error('上传Demo失败:', error);
    res.status(500).json({ error: '上传Demo失败' });
  }
};