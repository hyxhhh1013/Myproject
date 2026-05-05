import express from 'express';
import { getAllEducation, getEducationById, createEducation, updateEducation, deleteEducation } from '../controllers/educationController';

const router = express.Router();

// Education routes
router.get('/', getAllEducation);
router.get('/:id', getEducationById);
router.post('/', createEducation);
router.put('/:id', updateEducation);
router.delete('/:id', deleteEducation);

export default router;