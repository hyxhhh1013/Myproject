import { Request, Response } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/asyncHandler';

export const getMovies = asyncHandler(async (req: Request, res: Response) => {
  const movies = await prisma.movie.findMany({
    where: { isVisible: true },
    orderBy: { orderIndex: 'asc' },
  });
  res.json(movies);
});

export const createMovie = asyncHandler(async (req: Request, res: Response) => {
  const { title, director, year, posterUrl, rating, review, watchedAt, likes, orderIndex, isVisible } = req.body;

  const movie = await prisma.movie.create({
    data: {
      title, director, year, posterUrl,
      poster: posterUrl,
      rating, review, watchedAt,
      likes: likes || 0,
      orderIndex: orderIndex || 0,
      isVisible: isVisible !== false,
    },
  });

  res.status(201).json(movie);
});

export const updateMovie = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, director, year, posterUrl, rating, review, watchedAt, likes, orderIndex, isVisible } = req.body;

  const movie = await prisma.movie.update({
    where: { id: parseInt(id) },
    data: { title, director, year, posterUrl, poster: posterUrl, rating, review, watchedAt, likes, orderIndex, isVisible },
  });

  res.json(movie);
});

export const deleteMovie = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.movie.delete({ where: { id: parseInt(id) } });
  res.json({ status: 'success', message: '删除成功' });
});

export const updateMovieOrder = asyncHandler(async (req: Request, res: Response) => {
  const { movieIds } = req.body;

  await prisma.$transaction(
    movieIds.map((id: number, index: number) =>
      prisma.movie.update({ where: { id }, data: { orderIndex: index } }),
    ),
  );

  res.json({ status: 'success', message: '排序更新成功' });
});

export const updateMovieLikes = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { increment } = req.body;

  const movie = await prisma.movie.update({
    where: { id: parseInt(id) },
    data: { likes: { increment: increment || 0 } },
  });

  res.json(movie);
});
