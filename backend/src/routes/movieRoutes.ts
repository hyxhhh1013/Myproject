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

const router = Router();

router.get('/', getMovies);
router.post('/', protect, createMovie);
router.put('/:id', protect, updateMovie);
router.delete('/:id', protect, deleteMovie);
router.put('/order', protect, updateMovieOrder);
router.post('/:id/likes', updateMovieLikes);

export default router;
