import { Request, Response } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/asyncHandler';

export const getAllEducation = asyncHandler(async (req: Request, res: Response) => {
  const education = await prisma.education.findMany({ include: { user: true } });
  res.status(200).json(education);
});

export const getEducationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const education = await prisma.education.findUnique({
    where: { id: parseInt(id) },
    include: { user: true },
  });

  if (!education) {
    return res.status(404).json({ status: 'error', message: 'Education record not found' });
  }

  res.status(200).json(education);
});

export const createEducation = asyncHandler(async (req: Request, res: Response) => {
  const { userId, school, degree, major, startDate, endDate, description } = req.body;

  const education = await prisma.education.create({
    data: {
      userId,
      school,
      degree,
      major,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description,
    },
  });

  res.status(201).json({ status: 'success', message: 'Education record created successfully', data: education });
});

export const updateEducation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { school, degree, major, startDate, endDate, description } = req.body;

  const education = await prisma.education.update({
    where: { id: parseInt(id) },
    data: {
      school,
      degree,
      major,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description,
    },
  });

  res.status(200).json({ status: 'success', message: 'Education record updated successfully', data: education });
});

export const deleteEducation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.education.delete({ where: { id: parseInt(id) } });
  res.status(200).json({ status: 'success', message: 'Education record deleted successfully' });
});
