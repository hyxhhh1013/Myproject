import { Request, Response } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/asyncHandler';

export const getAllSocialMedia = asyncHandler(async (req: Request, res: Response) => {
  const socialMedia = await prisma.socialMedia.findMany({ include: { user: true } });
  res.status(200).json(socialMedia);
});

export const getSocialMediaById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const socialMedia = await prisma.socialMedia.findUnique({
    where: { id: parseInt(id) },
    include: { user: true },
  });

  if (!socialMedia) {
    return res.status(404).json({ status: 'error', message: 'Social media record not found' });
  }

  res.status(200).json(socialMedia);
});

export const createSocialMedia = asyncHandler(async (req: Request, res: Response) => {
  const { userId, platform, url } = req.body;

  const socialMedia = await prisma.socialMedia.create({
    data: { userId, platform, url },
  });

  res.status(201).json({ status: 'success', message: 'Social media record created successfully', data: socialMedia });
});

export const updateSocialMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { platform, url } = req.body;

  const socialMedia = await prisma.socialMedia.update({
    where: { id: parseInt(id) },
    data: { platform, url },
  });

  res.status(200).json({ status: 'success', message: 'Social media record updated successfully', data: socialMedia });
});

export const deleteSocialMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.socialMedia.delete({ where: { id: parseInt(id) } });
  res.status(200).json({ status: 'success', message: 'Social media record deleted successfully' });
});
