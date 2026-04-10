import express from 'express';
import { getAllSkills, getSkillById, createSkill, updateSkill, deleteSkill } from '../controllers/skillController';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Skill routes with cache
router.get('/', cacheMiddleware(300), getAllSkills);
router.get('/:id', cacheMiddleware(600), getSkillById);

// Create, update, delete operations with cache clearing
router.post('/', protect, async (req, res) => {
  await createSkill(req, res);
  clearCache('/api/skills');
});

router.put('/:id', protect, async (req, res) => {
  await updateSkill(req, res);
  clearCache('/api/skills');
  clearCache(`/api/skills/${req.params.id}`);
});

router.delete('/:id', protect, async (req, res) => {
  await deleteSkill(req, res);
  clearCache('/api/skills');
  clearCache(`/api/skills/${req.params.id}`);
});

export default router;