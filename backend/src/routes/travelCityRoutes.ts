import { Router } from 'express';
import { 
  getTravelCities, 
  createTravelCity, 
  updateTravelCity, 
  deleteTravelCity, 
  updateTravelCityOrder,
  updateWantCount,
  updateBeenCount
} from '../controllers/travelCityController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getTravelCities);
router.post('/', protect, createTravelCity);
router.put('/:id', protect, updateTravelCity);
router.delete('/:id', protect, deleteTravelCity);
router.put('/order', protect, updateTravelCityOrder);
router.post('/:id/want', updateWantCount);
router.post('/:id/been', updateBeenCount);

export default router;
