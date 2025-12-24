import express from 'express';
import { getAllEducation, getEducationById, createEducation, updateEducation, deleteEducation } from '../controllers/educationController';
import { cacheMiddleware, clearCache } from '../middleware/cache';

const router = express.Router();

// Education routes with cache
router.get('/', cacheMiddleware(300), getAllEducation);
router.get('/:id', cacheMiddleware(600), getEducationById);

// Create, update, delete operations with cache clearing
router.post('/', async (req, res) => {
  await createEducation(req, res);
  clearCache('/api/education');
});

router.put('/:id', async (req, res) => {
  await updateEducation(req, res);
  clearCache('/api/education');
  clearCache(`/api/education/${req.params.id}`);
});

router.delete('/:id', async (req, res) => {
  await deleteEducation(req, res);
  clearCache('/api/education');
  clearCache(`/api/education/${req.params.id}`);
});

export default router;