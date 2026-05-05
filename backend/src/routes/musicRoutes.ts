import { Router } from 'express';
import {
  getMusic,
  createMusic,
  updateMusic,
  deleteMusic,
  updateMusicOrder,
  resolveNeteaseMusic
} from '../controllers/musicController';
import { protect } from '../middleware/authMiddleware';
import { cacheMiddleware, clearCache } from '../middleware/cache';

const router = Router();

router.get('/resolve', resolveNeteaseMusic);
router.get('/', cacheMiddleware(300), getMusic);
router.post('/', protect, (req, res, next) => { createMusic(req, res, next); clearCache('/api/music'); });
router.put('/:id', protect, (req, res, next) => { updateMusic(req, res, next); clearCache('/api/music'); });
router.delete('/:id', protect, (req, res, next) => { deleteMusic(req, res, next); clearCache('/api/music'); });
router.put('/order', protect, (req, res, next) => { updateMusicOrder(req, res, next); clearCache('/api/music'); });

export default router;
