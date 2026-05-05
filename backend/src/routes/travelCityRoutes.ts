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
import { cacheMiddleware, clearCache } from '../middleware/cache';

const router = Router();

// 使用upload.fields()中间件同时处理封面图片和相册图片
const uploadMiddleware = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 20 }
]);

router.get('/', cacheMiddleware(300), getTravelCities);
router.post('/', protect, uploadMiddleware, (req, res, next) => { createTravelCity(req, res, next); clearCache('/api/travel-cities'); });
router.put('/:id', protect, uploadMiddleware, (req, res, next) => { updateTravelCity(req, res, next); clearCache('/api/travel-cities'); });
router.delete('/:id', protect, (req, res, next) => { deleteTravelCity(req, res, next); clearCache('/api/travel-cities'); });
router.put('/order', protect, (req, res, next) => { updateTravelCityOrder(req, res, next); clearCache('/api/travel-cities'); });
router.post('/:id/want', (req, res, next) => { updateWantCount(req, res, next); clearCache('/api/travel-cities'); });
router.post('/:id/been', (req, res, next) => { updateBeenCount(req, res, next); clearCache('/api/travel-cities'); });

export default router;
