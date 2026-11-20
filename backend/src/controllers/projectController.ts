import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../index';
import multer from 'multer';
import logger from '../utils/logger';
import { FileUploadRequest } from '../types/express';
import cache from '../utils/cache';
import { optimizeImage } from '../utils/imageUtils';
import { asyncHandler } from '../middleware/asyncHandler';
import { parseProjectInput } from '../validations/projectValidation';
import { parseStringArray } from '../validations/contentFieldHelpers';

const PROJECT_CACHE_KEY = 'projects_list';
// List entries are cached as `projects_list_p{page}_l{limit}`, so clear by prefix.
const CLEAR_PROJECT_CACHE = () =>
  cache.del(cache.keys().filter((key) => key.startsWith(PROJECT_CACHE_KEY)));

// The homepage and the admin both want every row, so the default page holds them all;
// `?page=&limit=` still paginates (limit is clamped to 1..MAX_LIMIT).
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;

// Never ship the owner's password hash with a public list.
const PUBLIC_USER_SELECT = { select: { id: true, name: true, email: true } } as const;

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

const toPositiveInt = (raw: unknown, fallback: number) => {
  const value = parseInt(String(raw ?? ''), 10);
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

const uploadedFilesToUrls = async (files: unknown): Promise<string[]> => {
  if (!Array.isArray(files) || files.length === 0) return [];
  return Promise.all(
    (files as Express.Multer.File[]).map(async (file) => {
      if (file.mimetype.startsWith('image/')) {
        return await optimizeImage(file.buffer);
      }
      return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }),
  );
};

export const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
  const pageNum = toPositiveInt(req.query.page, 1);
  const limitNum = Math.min(toPositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
  const skip = (pageNum - 1) * limitNum;

  const cacheKey = `${PROJECT_CACHE_KEY}_p${pageNum}_l${limitNum}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      include: { user: PUBLIC_USER_SELECT },
      orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
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
    include: { user: PUBLIC_USER_SELECT },
  });

  if (!project) {
    return res.status(404).json({ status: 'error', message: 'Project not found' });
  }

  res.status(200).json(project);
});

export const createProject = asyncHandler(async (req: FileUploadRequest, res: Response) => {
  // Validate before touching uploads so a bad field never leaves orphaned image files.
  const input = parseProjectInput(req.body ?? {}, 'create') as Prisma.ProjectUncheckedCreateInput;
  const images = await uploadedFilesToUrls(req.files);

  const project = await prisma.project.create({
    data: {
      ...input,
      imageUrl: images[0] || null,
      images: JSON.stringify(images),
    },
  });

  CLEAR_PROJECT_CACHE();
  logger.info('Project created successfully', { projectId: project.id });
  res.status(201).json({ status: 'success', message: 'Project created successfully', data: project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body ?? {};
  // Partial update: absent = unchanged, '' = null (see contentFieldHelpers).
  const dataToUpdate = parseProjectInput(body, 'update') as Prisma.ProjectUncheckedUpdateInput;

  const existingImages =
    body.existingImages !== undefined ? parseStringArray(body.existingImages, 'existingImages') : [];
  const newImages = await uploadedFilesToUrls((req as any).files);

  if (body.existingImages !== undefined || newImages.length > 0) {
    const finalImages = [...existingImages, ...newImages];
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
