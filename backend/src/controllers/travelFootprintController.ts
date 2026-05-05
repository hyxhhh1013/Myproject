import { Request, Response } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/asyncHandler';

export const getTravelFootprints = asyncHandler(async (req: Request, res: Response) => {
  const footprints = await prisma.travelFootprint.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ data: footprints });
});

export const createTravelFootprint = asyncHandler(async (req: Request, res: Response) => {
  const { location, latitude, longitude, visitDate, description, photos } = req.body;

  const footprint = await prisma.travelFootprint.create({
    data: { location, latitude, longitude, visitedAt: visitDate, description, photos },
  });

  res.status(201).json(footprint);
});

export const updateTravelFootprint = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { location, latitude, longitude, visitDate, description, photos } = req.body;

  const footprint = await prisma.travelFootprint.update({
    where: { id: parseInt(id) },
    data: { location, latitude, longitude, visitedAt: visitDate, description, photos },
  });

  res.json(footprint);
});

export const deleteTravelFootprint = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.travelFootprint.delete({ where: { id: parseInt(id) } });
  res.json({ status: 'success', message: '删除成功' });
});
