import express from 'express';
import { 
  getMusicList, createMusic, updateMusic, deleteMusic,
  getMovieList, createMovie, updateMovie, deleteMovie,
  getTravelList, createTravel, updateTravel, deleteTravel
} from '../controllers/hobbyController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Music
router.get('/music', getMusicList);
router.post('/music', protect, createMusic);
router.put('/music/:id', protect, updateMusic);
router.delete('/music/:id', protect, deleteMusic);

// Movies
router.get('/movies', getMovieList);
router.post('/movies', protect, createMovie);
router.put('/movies/:id', protect, updateMovie);
router.delete('/movies/:id', protect, deleteMovie);

// Travel
router.get('/travel', getTravelList);
router.post('/travel', protect, createTravel);
router.put('/travel/:id', protect, updateTravel);
router.delete('/travel/:id', protect, deleteTravel);

export default router;
