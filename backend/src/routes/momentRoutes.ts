import express from 'express';
import * as momentController from '../controllers/momentController';
import { protect } from '../middleware/authMiddleware';
import * as momentValidation from '../validations/momentValidation';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

router.get('/', momentController.getMoments);
router.post('/:id/likes', momentController.likeMoment);

// 保护路由
router.use(protect);
router.post('/', validateRequest(momentValidation.createMomentSchema), momentController.createMoment);
router.put('/:id', validateRequest(momentValidation.updateMomentSchema), momentController.updateMoment);
router.delete('/:id', momentController.deleteMoment);

export default router;
