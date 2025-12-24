import { Router } from 'express';
import { getSiteConfig, updateSiteConfig, incrementViewCount } from '../controllers/siteConfigController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getSiteConfig);
router.post('/view', incrementViewCount);
router.put('/', protect, updateSiteConfig);

export default router;
