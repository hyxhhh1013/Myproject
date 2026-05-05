import { Request, Response } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/asyncHandler';

export const getMusicList = asyncHandler(async (req: Request, res: Response) => {
  const music = await prisma.music.findMany({ orderBy: { orderIndex: 'asc' } });
  res.json(music);
});

export const createMusic = asyncHandler(async (req: Request, res: Response) => {
  const { title, artist, coverUrl, platform, url, lyrics, orderIndex } = req.body;
  const music = await prisma.music.create({
    data: { title, artist, coverUrl, platform, url, lyrics, orderIndex: orderIndex || 0 },
  });
  res.status(201).json(music);
});

export const updateMusic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const music = await prisma.music.update({ where: { id: parseInt(id) }, data: req.body });
  res.json(music);
});

export const deleteMusic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.music.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Music deleted' });
});

export const getMovieList = asyncHandler(async (req: Request, res: Response) => {
  const movies = await prisma.movie.findMany({ orderBy: { watchedAt: 'desc' } });
  res.json(movies);
});

export const createMovie = asyncHandler(async (req: Request, res: Response) => {
  const { title, director, year, posterUrl, rating, review, watchedAt } = req.body;
  const movie = await prisma.movie.create({
    data: {
      title, director, year: year ? parseInt(year) : null, posterUrl,
      rating: rating ? parseFloat(rating) : null, review, watchedAt: watchedAt ? new Date(watchedAt) : null,
    },
  });
  res.status(201).json(movie);
});

export const updateMovie = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = { ...req.body };
  if (data.year) data.year = parseInt(data.year);
  if (data.rating) data.rating = parseFloat(data.rating);
  if (data.watchedAt) data.watchedAt = new Date(data.watchedAt);
  const movie = await prisma.movie.update({ where: { id: parseInt(id) }, data });
  res.json(movie);
});

export const deleteMovie = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.movie.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Movie deleted' });
});

export const getTravelList = asyncHandler(async (req: Request, res: Response) => {
  const travels = await prisma.travelFootprint.findMany({ orderBy: { visitedAt: 'desc' } });
  res.json(travels);
});

export const createTravel = asyncHandler(async (req: Request, res: Response) => {
  const { location, latitude, longitude, visitedAt, description, photos } = req.body;
  const travel = await prisma.travelFootprint.create({
    data: {
      location, latitude: parseFloat(latitude), longitude: parseFloat(longitude),
      visitedAt: visitedAt ? new Date(visitedAt) : null, description, photos,
    },
  });
  res.status(201).json(travel);
});

export const updateTravel = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = { ...req.body };
  if (data.latitude) data.latitude = parseFloat(data.latitude);
  if (data.longitude) data.longitude = parseFloat(data.longitude);
  if (data.visitedAt) data.visitedAt = new Date(data.visitedAt);
  const travel = await prisma.travelFootprint.update({ where: { id: parseInt(id) }, data });
  res.json(travel);
});

export const deleteTravel = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.travelFootprint.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Travel footprint deleted' });
});
