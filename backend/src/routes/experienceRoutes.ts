import express from 'express';
import { getAllExperience, getExperienceById, createExperience, updateExperience, deleteExperience } from '../controllers/experienceController';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../controllers/photoController';

const router = express.Router();

// Experience routes with cache
router.get('/', cacheMiddleware(300), getAllExperience);
router.get('/:id', cacheMiddleware(600), getExperienceById);

// Create, update, delete operations with cache clearing
router.post('/', protect, upload.array('images', 10), async (req, res) => {
  await createExperience(req, res);
  clearCache('/api/experience');
});

router.put('/:id', protect, upload.array('images', 10), async (req, res) => {
  await updateExperience(req, res);
  clearCache('/api/experience');
  clearCache(`/api/experience/${req.params.id}`);
});

router.delete('/:id', protect, async (req, res) => {
  await deleteExperience(req, res);
  clearCache('/api/experience');
  clearCache(`/api/experience/${req.params.id}`);
});

export default router;