import { Request, Response } from 'express';
import { prisma } from '../index';
import multer from 'multer';
import logger from '../utils/logger';
import { FileUploadRequest } from '../types/express';
import cache from '../utils/cache';
import { optimizeImage } from '../utils/imageUtils';
import { asyncHandler } from '../middleware/asyncHandler';

const PROJECT_CACHE_KEY = 'projects_list';
const CLEAR_PROJECT_CACHE = () => cache.del(PROJECT_CACHE_KEY);

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/', 'video/', 'application/zip', 'application/pdf', 'text/html'];
  const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('不允许的文件类型'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

export { upload };

export const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const cacheKey = `${PROJECT_CACHE_KEY}_p${page}_l${limit}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limitNum,
    }),
    prisma.project.count(),
  ]);

  const responseData = {
    status: 'success',
    data: projects,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  };

  cache.set(cacheKey, responseData);
  res.status(200).json(responseData);
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await prisma.project.findUnique({
    where: { id: parseInt(id) },
    include: { user: true },
  });

  if (!project) {
    return res.status(404).json({ status: 'error', message: 'Project not found' });
  }

  res.status(200).json(project);
});

export const createProject = asyncHandler(async (req: FileUploadRequest, res: Response) => {
  const {
    userId, title, description, intro, startDate, endDate, technologies,
    responsibilities, challengesProblem, challengesSolution, githubUrl, demoUrl,
    orderIndex, isVisible, isFeatured,
  } = req.body;

  let images: string[] = [];
  let imageUrl = '';

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    images = await Promise.all(
      req.files.map(async (file: Express.Multer.File) => {
        if (file.mimetype.startsWith('image/')) {
          return await optimizeImage(file.buffer);
        }
        return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }),
    );
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
      technologies: typeof technologies === 'string' && !technologies.startsWith('[')
        ? JSON.stringify(technologies.split(',').map((t: string) => t.trim()))
        : technologies,
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
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title, description, intro, startDate, endDate, technologies,
    responsibilities, challengesProblem, challengesSolution, githubUrl, demoUrl,
    orderIndex, isVisible, isFeatured, existingImages,
  } = req.body;

  let finalImages: string[] = [];

  if (existingImages) {
    try {
      const parsed = JSON.parse(existingImages);
      if (Array.isArray(parsed)) finalImages = parsed;
    } catch (e) { /* ignore */ }
  }

  if ((req as any).files && (req as any).files.length > 0) {
    const newImages = await Promise.all(
      (req as any).files.map(async (file: Express.Multer.File) => {
        if (file.mimetype.startsWith('image/')) {
          return await optimizeImage(file.buffer);
        }
        return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }),
    );
    finalImages = [...finalImages, ...newImages];
  }

  const dataToUpdate: any = {};
  if (title !== undefined) dataToUpdate.title = title;
  if (description !== undefined) dataToUpdate.description = description;
  if (intro !== undefined) dataToUpdate.intro = intro || null;
  if (startDate !== undefined) dataToUpdate.startDate = new Date(startDate);
  if (endDate !== undefined) dataToUpdate.endDate = endDate ? new Date(endDate) : null;
  if (technologies !== undefined) {
    dataToUpdate.technologies = typeof technologies === 'string'
      ? JSON.stringify(technologies.split(',').map((t: string) => t.trim()))
      : technologies;
  }
  if (responsibilities !== undefined) dataToUpdate.responsibilities = responsibilities || null;
  if (challengesProblem !== undefined) dataToUpdate.challengesProblem = challengesProblem || null;
  if (challengesSolution !== undefined) dataToUpdate.challengesSolution = challengesSolution || null;
  if (githubUrl !== undefined) dataToUpdate.githubUrl = githubUrl || null;
  if (demoUrl !== undefined) dataToUpdate.demoUrl = demoUrl || null;
  if (orderIndex !== undefined) dataToUpdate.orderIndex = parseInt(orderIndex);
  if (isVisible !== undefined) dataToUpdate.isVisible = isVisible === 'true' || isVisible === true;
  if (isFeatured !== undefined) dataToUpdate.isFeatured = isFeatured === 'true' || isFeatured === true;

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
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.project.delete({ where: { id: parseInt(id) } });
  CLEAR_PROJECT_CACHE();
  res.status(200).json({ status: 'success', message: 'Project deleted successfully' });
});

export const uploadProjectDemo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = (req as any).file;
  if (!file) {
    return res.status(400).json({ error: '请上传Demo文件' });
  }

  const demoUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  const project = await prisma.project.update({
    where: { id: parseInt(id) },
    data: { demoUrl },
  });

  CLEAR_PROJECT_CACHE();
  res.json({ status: 'success', message: 'Demo上传成功', data: project });
});
