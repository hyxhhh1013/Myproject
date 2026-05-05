import express from 'express';
import { getAllSocialMedia, getSocialMediaById, createSocialMedia, updateSocialMedia, deleteSocialMedia } from '../controllers/socialMediaController';

const router = express.Router();

// Social Media routes
router.get('/', getAllSocialMedia);
router.get('/:id', getSocialMediaById);
router.post('/', createSocialMedia);
router.put('/:id', updateSocialMedia);
router.delete('/:id', deleteSocialMedia);

export default router;