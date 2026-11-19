import express from 'express';
import { getAllEducation, getEducationById, createEducation, updateEducation, deleteEducation } from '../controllers/educationController';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Education routes with cache
router.get('/', cacheMiddleware(300), getAllEducation);
router.get('/:id', cacheMiddleware(600), getEducationById);

// Create, update, delete operations with cache clearing
router.post('/', protect, async (req, res, next) => {
  await createEducation(req, res, next);
  clearCache('/api/education');
});

router.put('/:id', protect, async (req, res, next) => {
  await updateEducation(req, res, next);
  clearCache('/api/education');
  clearCache(`/api/education/${req.params.id}`);
});

router.delete('/:id', protect, async (req, res, next) => {
  await deleteEducation(req, res, next);
  clearCache('/api/education');
  clearCache(`/api/education/${req.params.id}`);
});

export default router;