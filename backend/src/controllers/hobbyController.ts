import { Request, Response } from 'express';
import { prisma } from '../index';

// --- Music Controllers ---

export const getMusicList = async (req: Request, res: Response) => {
  try {
    const music = await prisma.music.findMany({
      orderBy: { orderIndex: 'asc' },
    });
    res.json(music);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch music' });
  }
};

export const createMusic = async (req: Request, res: Response) => {
  try {
    const { title, artist, coverUrl, platform, url, lyrics, orderIndex } = req.body;
    const music = await prisma.music.create({
      data: { title, artist, coverUrl, platform, url, lyrics, orderIndex: orderIndex || 0 },
    });
    res.status(201).json(music);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create music' });
  }
};

export const updateMusic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const music = await prisma.music.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(music);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update music' });
  }
};

export const deleteMusic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.music.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Music deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete music' });
  }
};

// --- Movie Controllers ---

export const getMovieList = async (req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { watchedAt: 'desc' },
    });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

export const createMovie = async (req: Request, res: Response) => {
  try {
    const { title, director, year, posterUrl, rating, review, watchedAt } = req.body;
    const movie = await prisma.movie.create({
      data: { title, director, year: year ? parseInt(year) : null, posterUrl, rating: rating ? parseFloat(rating) : null, review, watchedAt: watchedAt ? new Date(watchedAt) : null },
    });
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create movie' });
  }
};

export const updateMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.year) data.year = parseInt(data.year);
    if (data.rating) data.rating = parseFloat(data.rating);
    if (data.watchedAt) data.watchedAt = new Date(data.watchedAt);

    const movie = await prisma.movie.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update movie' });
  }
};

export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.movie.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Movie deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete movie' });
  }
};

// --- Travel Controllers ---

export const getTravelList = async (req: Request, res: Response) => {
  try {
    const travels = await prisma.travelFootprint.findMany({
      orderBy: { visitedAt: 'desc' },
    });
    res.json(travels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch travel footprints' });
  }
};

export const createTravel = async (req: Request, res: Response) => {
  try {
    const { location, latitude, longitude, visitedAt, description, photos } = req.body;
    const travel = await prisma.travelFootprint.create({
      data: { 
        location, 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude), 
        visitedAt: visitedAt ? new Date(visitedAt) : null, 
        description, 
        photos 
      },
    });
    res.status(201).json(travel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create travel footprint' });
  }
};

export const updateTravel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.latitude) data.latitude = parseFloat(data.latitude);
    if (data.longitude) data.longitude = parseFloat(data.longitude);
    if (data.visitedAt) data.visitedAt = new Date(data.visitedAt);

    const travel = await prisma.travelFootprint.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(travel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update travel footprint' });
  }
};

export const deleteTravel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.travelFootprint.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Travel footprint deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete travel footprint' });
  }
};
