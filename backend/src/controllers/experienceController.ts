import { Request, Response } from 'express';
import { prisma } from '../index';
import { FileUploadRequest } from '../types/express';
import { optimizeImage } from '../utils/imageUtils';
import { asyncHandler } from '../middleware/asyncHandler';

export const getAllExperience = asyncHandler(async (req: Request, res: Response) => {
  const experience = await prisma.experience.findMany({
    orderBy: { orderIndex: 'asc' },
    include: { user: true },
  });

  const processedExperience = experience.map(exp => ({
    ...exp,
    images: exp.images ? JSON.parse(exp.images) : [],
  }));

  res.status(200).json(processedExperience);
});

export const getExperienceById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const experience = await prisma.experience.findUnique({
    where: { id: parseInt(id) },
    include: { user: true },
  });

  if (!experience) {
    return res.status(404).json({ status: 'error', message: 'Experience record not found' });
  }

  res.status(200).json({
    ...experience,
    images: experience.images ? JSON.parse(experience.images) : [],
  });
});

export const createExperience = asyncHandler(async (req: FileUploadRequest, res: Response) => {
  const { userId, company, position, startDate, endDate, description, isVisible, orderIndex, existingImages } = req.body;

  let imageUrls: string[] = [];

  if (existingImages) {
    imageUrls = Array.isArray(existingImages) ? existingImages : JSON.parse(existingImages);
  }

  const files = req.files as Express.Multer.File[];
  if (files && files.length > 0) {
    const newUrls = await Promise.all(files.map((file) => optimizeImage(file.buffer)));
    imageUrls = [...imageUrls, ...newUrls];
  }

  const experience = await prisma.experience.create({
    data: {
      userId: userId ? parseInt(userId) : 1,
      company,
      position,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description,
      images: JSON.stringify(imageUrls),
      isVisible: isVisible !== undefined ? (isVisible === 'true' || isVisible === true) : true,
      orderIndex: orderIndex ? parseInt(orderIndex) : 0,
    },
  });

  res.status(201).json({ status: 'success', message: 'Experience record created successfully', data: { ...experience, images: imageUrls } });
});

export const updateExperience = asyncHandler(async (req: FileUploadRequest, res: Response) => {
  const { id } = req.params;
  const { company, position, startDate, endDate, description, isVisible, orderIndex, existingImages } = req.body;

  let imageUrls: string[] = [];

  if (existingImages) {
    imageUrls = Array.isArray(existingImages) ? existingImages : JSON.parse(existingImages);
  }

  const files = req.files as Express.Multer.File[];
  if (files && files.length > 0) {
    const newUrls = await Promise.all(files.map((file) => optimizeImage(file.buffer)));
    imageUrls = [...imageUrls, ...newUrls];
  }

  const updateData: Record<string, unknown> = {
    company,
    position,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
    description,
    images: JSON.stringify(imageUrls),
  };

  if (isVisible !== undefined) {
    updateData.isVisible = isVisible === 'true' || isVisible === true;
  }

  if (orderIndex !== undefined) {
    updateData.orderIndex = parseInt(orderIndex);
  }

  const experience = await prisma.experience.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  res.status(200).json({ status: 'success', message: 'Experience record updated successfully', data: { ...experience, images: imageUrls } });
});

export const deleteExperience = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.experience.delete({ where: { id: parseInt(id) } });
  res.status(200).json({ status: 'success', message: 'Experience record deleted successfully' });
});
