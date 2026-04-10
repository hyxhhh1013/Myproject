import express from 'express';
import {
  createDanmaku,
  getVisibleDanmaku,
  getAllDanmaku,
  updateDanmaku,
  deleteDanmaku,
  batchDeleteDanmaku,
  batchUpdateVisibility
} from '../controllers/danmakuController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createDanmakuSchema,
  updateDanmakuSchema,
  danmakuQuerySchema,
  danmakuIdSchema,
  batchDeleteDanmakuSchema,
  batchUpdateVisibilitySchema
} from '../validations/danmakuValidation';

const router = express.Router();

router.get('/visible', getVisibleDanmaku);
router.post('/', validateRequest(createDanmakuSchema, 'body'), createDanmaku);

router.get('/', protect, validateRequest(danmakuQuerySchema, 'query'), getAllDanmaku);
router.post('/batch/delete', protect, validateRequest(batchDeleteDanmakuSchema, 'body'), batchDeleteDanmaku);
router.post('/batch/visibility', protect, validateRequest(batchUpdateVisibilitySchema, 'body'), batchUpdateVisibility);
router.put('/:id', protect, validateRequest(danmakuIdSchema, 'params'), validateRequest(updateDanmakuSchema, 'body'), updateDanmaku);
router.delete('/:id', protect, validateRequest(danmakuIdSchema, 'params'), deleteDanmaku);

export default router;
