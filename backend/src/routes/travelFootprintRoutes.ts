import { Router } from 'express';
import { 
  getTravelFootprints, 
  createTravelFootprint, 
  updateTravelFootprint, 
  deleteTravelFootprint
} from '../controllers/travelFootprintController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getTravelFootprints);
router.post('/', protect, createTravelFootprint);
router.put('/:id', protect, updateTravelFootprint);
router.delete('/:id', protect, deleteTravelFootprint);

export default router;