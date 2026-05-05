import { Router } from 'express';
import { getSiteConfig, updateSiteConfig, incrementViewCount, getVisitorStats } from '../controllers/siteConfigController';
import { protect } from '../middleware/authMiddleware';
import { cacheMiddleware, clearCache } from '../middleware/cache';

const router = Router();

router.get('/', cacheMiddleware(600), getSiteConfig);
router.get('/stats', protect, getVisitorStats);
router.post('/view', (req, res, next) => { incrementViewCount(req, res, next); clearCache('/api/siteConfig'); });
router.put('/', protect, (req, res, next) => { updateSiteConfig(req, res, next); clearCache('/api/siteConfig'); });

export default router;
