import express from 'express';
import { getAllExperience, getExperienceById, createExperience, updateExperience, deleteExperience } from '../controllers/experienceController';
import { cacheMiddleware, clearCache } from '../middleware/cache';

const router = express.Router();

// Experience routes with cache
router.get('/', cacheMiddleware(300), getAllExperience);
router.get('/:id', cacheMiddleware(600), getExperienceById);

// Create, update, delete operations with cache clearing
router.post('/', async (req, res) => {
  await createExperience(req, res);
  clearCache('/api/experience');
});

router.put('/:id', async (req, res) => {
  await updateExperience(req, res);
  clearCache('/api/experience');
  clearCache(`/api/experience/${req.params.id}`);
});

router.delete('/:id', async (req, res) => {
  await deleteExperience(req, res);
  clearCache('/api/experience');
  clearCache(`/api/experience/${req.params.id}`);
});

export default router;