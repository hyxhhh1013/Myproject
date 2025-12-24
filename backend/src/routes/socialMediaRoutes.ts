import express from 'express';
import { getAllSocialMedia, getSocialMediaById, createSocialMedia, updateSocialMedia, deleteSocialMedia } from '../controllers/socialMediaController';
import { cacheMiddleware, clearCache } from '../middleware/cache';

const router = express.Router();

// Social Media routes with cache
router.get('/', cacheMiddleware(300), getAllSocialMedia);
router.get('/:id', cacheMiddleware(600), getSocialMediaById);

// Create, update, delete operations with cache clearing
router.post('/', async (req, res) => {
  await createSocialMedia(req, res);
  clearCache('/api/social-media');
});

router.put('/:id', async (req, res) => {
  await updateSocialMedia(req, res);
  clearCache('/api/social-media');
  clearCache(`/api/social-media/${req.params.id}`);
});

router.delete('/:id', async (req, res) => {
  await deleteSocialMedia(req, res);
  clearCache('/api/social-media');
  clearCache(`/api/social-media/${req.params.id}`);
});

export default router;