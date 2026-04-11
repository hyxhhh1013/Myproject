import { Request, Response } from 'express';
import { prisma } from '../index';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';
import { FileUploadRequest } from '../types/express';
import cache from '../utils/cache';
import { saveFileToDb, saveBufferToDb } from '../utils/dbStorage';
import { optimizeImageBuffer } from '../utils/imageOptimizer';

const PROJECT_CACHE_KEY = 'projects_list';
const CLEAR_PROJECT_CACHE = () => cache.del(PROJECT_CACHE_KEY);

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
const fileFilter = (req: FileUploadRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
    
    // Check cache
    const cacheKey = `${PROJECT_CACHE_KEY}_p${page}_l${limit}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
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
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }], // Updated to orderIndex first
        skip,
        take: parseInt(limit as string),
      }),
      prisma.project.count(), // 获取项目总数
    ]);
    
    const responseData = {
      status: 'success',
      data: projects,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    };
    
    // Cache the response
    cache.set(cacheKey, responseData);
    
    // 返回分页信息
    res.status(200).json(responseData);
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
    logger.error('Error getting project', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to get project' });
  }
};

// Create project
export const createProject = async (req: FileUploadRequest, res: Response) => {
  try {
    const { 
      userId, title, description, intro, startDate, endDate, technologies, 
      responsibilities, challengesProblem, challengesSolution, githubUrl, demoUrl, 
      orderIndex, isVisible, isFeatured
    } = req.body as any;
    
    // Handle image upload if present
    const CDN_BASE_URL = process.env.CDN_BASE_URL || '';
    let images: string[] = [];
    let imageUrl = '';

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      images = await Promise.all(req.files.map(async (file) => {
        // 优化项目图片 (内存处理)
        const { buffer } = await optimizeImageBuffer(file.path, 1920, 75);
        const baseFilename = path.basename(file.path, path.extname(file.path));
        const filename = `${baseFilename}-opt.webp`;
        
        await saveBufferToDb(buffer, filename);
        // 清理原始上传文件
        fs.promises.unlink(file.path).catch(() => {});
        return `/uploads/${filename}`;
      }));
      imageUrl = images[0];
    }

    const project = await prisma.project.create({
      data: {
        userId: parseInt(userId) || 1,
        title,
        description,
        intro: intro || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        technologies: typeof technologies === 'string' && !technologies.startsWith('[') ? JSON.stringify(technologies.split(',').map((t: string) => t.trim())) : technologies,
        responsibilities: responsibilities || null,
        challengesProblem: challengesProblem || null,
        challengesSolution: challengesSolution || null,
        githubUrl: githubUrl || null,
        demoUrl: demoUrl || null,
        imageUrl: imageUrl || null,
        images: JSON.stringify(images),
        orderIndex: orderIndex ? parseInt(orderIndex) : 0,
        isVisible: isVisible !== undefined ? (isVisible === 'true' || isVisible === true) : true,
        isFeatured: isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : false,
      },
    });

    CLEAR_PROJECT_CACHE();
    logger.info('Project created successfully', { projectId: project.id });
    res.status(201).json({ status: 'success', message: 'Project created successfully', data: project });
  } catch (error) {
    logger.error('Error creating project', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to create project' });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, description, intro, startDate, endDate, technologies, 
      responsibilities, challengesProblem, challengesSolution, githubUrl, demoUrl, 
      orderIndex, isVisible, isFeatured, existingImages 
    } = req.body;

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
      const newImages = await Promise.all((req as any).files.map(async (file: any) => {
        // 优化项目图片 (内存处理)
        const { buffer } = await optimizeImageBuffer(file.path, 1920, 75);
        const baseFilename = path.basename(file.path, path.extname(file.path));
        const filename = `${baseFilename}-opt.webp`;
        
        await saveBufferToDb(buffer, filename);
        // 清理原始上传文件
        fs.promises.unlink(file.path).catch(() => {});
        return `/uploads/${filename}`;
      }));
      finalImages = [...finalImages, ...newImages];
    }

    const dataToUpdate: any = {};
    
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (intro !== undefined) dataToUpdate.intro = intro || null;
    if (startDate !== undefined) dataToUpdate.startDate = new Date(startDate);
    if (endDate !== undefined) dataToUpdate.endDate = endDate ? new Date(endDate) : null;
    if (technologies !== undefined) dataToUpdate.technologies = typeof technologies === 'string' ? JSON.stringify(technologies.split(',').map((t: string) => t.trim())) : technologies;
    if (responsibilities !== undefined) dataToUpdate.responsibilities = responsibilities || null;
    if (challengesProblem !== undefined) dataToUpdate.challengesProblem = challengesProblem || null;
    if (challengesSolution !== undefined) dataToUpdate.challengesSolution = challengesSolution || null;
    if (githubUrl !== undefined) dataToUpdate.githubUrl = githubUrl || null;
    if (demoUrl !== undefined) dataToUpdate.demoUrl = demoUrl || null;
    if (orderIndex !== undefined) dataToUpdate.orderIndex = parseInt(orderIndex);
    if (isVisible !== undefined) dataToUpdate.isVisible = isVisible === 'true' || isVisible === true;
    if (isFeatured !== undefined) dataToUpdate.isFeatured = isFeatured === 'true' || isFeatured === true;
    
    // Only update images if we have changes or explicit existingImages
    if (existingImages !== undefined || ((req as any).files && (req as any).files.length > 0)) {
        dataToUpdate.images = JSON.stringify(finalImages);
        dataToUpdate.imageUrl = finalImages.length > 0 ? finalImages[0] : null;
    }

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    CLEAR_PROJECT_CACHE();
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

    CLEAR_PROJECT_CACHE();
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
    const filename = path.basename(file.path);
    await saveFileToDb(file.path, filename);
    const demoUrl = `/uploads/${filename}`;
    
    // 清理临时文件 (如果是图片 demo 可能被存入 DB 了)
    // 注意：saveFileToDb 内部已经 unlink 了，所以这里不用重复处理
    
    // 更新项目信息
    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { demoUrl },
    });
    
    CLEAR_PROJECT_CACHE();
    res.json({ status: 'success', message: 'Demo上传成功', data: project });
  } catch (error) {
    console.error('上传Demo失败:', error);
    res.status(500).json({ error: '上传Demo失败' });
  }
};