import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../index';
import { FileUploadRequest } from '../types/express';
import { optimizeImage } from '../utils/imageUtils';
import { asyncHandler } from '../middleware/asyncHandler';
import { parseExperienceInput } from '../validations/experienceValidation';
import { parseStringArray } from '../validations/contentFieldHelpers';

// Never ship the owner's password hash with a public list (this used to be `user: true`).
const PUBLIC_USER_SELECT = { select: { id: true, name: true } } as const;

// `images` is returned parsed (string[]) as before; the newer JSON columns (tags, highlights,
// metrics) are returned as stored: a JSON string or null.
const storedImages = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const uploadImages = async (files: unknown): Promise<string[]> => {
  if (!Array.isArray(files) || files.length === 0) return [];
  return Promise.all((files as Express.Multer.File[]).map((file) => optimizeImage(file.buffer)));
};

export const getAllExperience = asyncHandler(async (req: Request, res: Response) => {
  const experience = await prisma.experience.findMany({
    orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
    include: { user: PUBLIC_USER_SELECT },
  });

  const processedExperience = experience.map(exp => ({
    ...exp,
    images: storedImages(exp.images),
  }));

  res.status(200).json(processedExperience);
});

export const getExperienceById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const experience = await prisma.experience.findUnique({
    where: { id: parseInt(id) },
    include: { user: PUBLIC_USER_SELECT },
  });

  if (!experience) {
    return res.status(404).json({ status: 'error', message: 'Experience record not found' });
  }

  res.status(200).json({
    ...experience,
    images: storedImages(experience.images),
  });
});

export const createExperience = asyncHandler(async (req: FileUploadRequest, res: Response) => {
  const body = req.body ?? {};
  const input = parseExperienceInput(body, 'create') as Prisma.ExperienceUncheckedCreateInput;

  const imageUrls = [
    ...parseStringArray(body.existingImages, 'existingImages'),
    ...(await uploadImages(req.files)),
  ];

  const experience = await prisma.experience.create({
    data: { ...input, images: JSON.stringify(imageUrls) },
  });

  res.status(201).json({ status: 'success', message: 'Experience record created successfully', data: { ...experience, images: imageUrls } });
});

export const updateExperience = asyncHandler(async (req: FileUploadRequest, res: Response) => {
  const { id } = req.params;
  const body = req.body ?? {};

  // Partial update: only write what the request actually sent. The admin's
  // show/hide toggle sends just { isVisible }; writing every field used to set
  // startDate to an invalid date and wipe the images. Absent = unchanged, '' = null.
  const updateData = parseExperienceInput(body, 'update') as Prisma.ExperienceUncheckedUpdateInput;

  const existingImages =
    body.existingImages !== undefined ? parseStringArray(body.existingImages, 'existingImages') : [];
  const newImages = await uploadImages(req.files);
  const touchesImages = body.existingImages !== undefined || newImages.length > 0;
  const imageUrls = [...existingImages, ...newImages];
  if (touchesImages) updateData.images = JSON.stringify(imageUrls);

  const experience = await prisma.experience.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  const responseImages = touchesImages ? imageUrls : storedImages(experience.images);

  res.status(200).json({ status: 'success', message: 'Experience record updated successfully', data: { ...experience, images: responseImages } });
});

export const deleteExperience = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.experience.delete({ where: { id: parseInt(id) } });
  res.status(200).json({ status: 'success', message: 'Experience record deleted successfully' });
});
