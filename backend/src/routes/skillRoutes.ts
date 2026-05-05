import express from 'express';
import { getAllSkills, getSkillById, createSkill, updateSkill, deleteSkill } from '../controllers/skillController';

const router = express.Router();

// Skill routes
router.get('/', getAllSkills);
router.get('/:id', getSkillById);
router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

export default router;