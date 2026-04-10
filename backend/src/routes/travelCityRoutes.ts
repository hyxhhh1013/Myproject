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
import { upload } from '../controllers/photoController';

const router = Router();

// 使用upload.fields()中间件同时处理封面图片和相册图片
const uploadMiddleware = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 20 }
]);

router.get('/', getTravelCities);
router.post('/', protect, uploadMiddleware, createTravelCity);
router.put('/:id', protect, uploadMiddleware, updateTravelCity);
router.delete('/:id', protect, deleteTravelCity);
router.put('/order', protect, updateTravelCityOrder);
router.post('/:id/want', updateWantCount);
router.post('/:id/been', updateBeenCount);

export default router;
