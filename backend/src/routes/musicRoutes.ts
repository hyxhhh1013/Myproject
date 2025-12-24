import { Router } from 'express';
import { 
  getMusic, 
  createMusic, 
  updateMusic, 
  deleteMusic, 
  updateMusicOrder 
} from '../controllers/musicController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getMusic);
router.post('/', protect, createMusic);
router.put('/:id', protect, updateMusic);
router.delete('/:id', protect, deleteMusic);
router.put('/order', protect, updateMusicOrder);

export default router;
