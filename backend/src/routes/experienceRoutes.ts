import express from 'express';
import { getAllExperience, getExperienceById, createExperience, updateExperience, deleteExperience } from '../controllers/experienceController';

const router = express.Router();

// Experience routes
router.get('/', getAllExperience);
router.get('/:id', getExperienceById);
router.post('/', createExperience);
router.put('/:id', updateExperience);
router.delete('/:id', deleteExperience);

export default router;