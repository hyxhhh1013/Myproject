import { Router } from 'express';
import {
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  updateMovieOrder,
  updateMovieLikes
} from '../controllers/movieController';
import { protect } from '../middleware/authMiddleware';
import { cacheMiddleware, clearCache } from '../middleware/cache';

const router = Router();

router.get('/', cacheMiddleware(300), getMovies);
router.post('/', protect, (req, res, next) => { createMovie(req, res, next); clearCache('/api/movies'); });
router.put('/:id', protect, (req, res, next) => { updateMovie(req, res, next); clearCache('/api/movies'); });
router.delete('/:id', protect, (req, res, next) => { deleteMovie(req, res, next); clearCache('/api/movies'); });
router.put('/order', protect, (req, res, next) => { updateMovieOrder(req, res, next); clearCache('/api/movies'); });
router.post('/:id/likes', (req, res, next) => { updateMovieLikes(req, res, next); clearCache('/api/movies'); });

export default router;
