import express from 'express';
import { getAllSocialMedia, getSocialMediaById, createSocialMedia, updateSocialMedia, deleteSocialMedia } from '../controllers/socialMediaController';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Social Media routes with cache
router.get('/', cacheMiddleware(300), getAllSocialMedia);
router.get('/:id', cacheMiddleware(600), getSocialMediaById);

// Create, update, delete operations with cache clearing
router.post('/', protect, async (req, res, next) => {
  await createSocialMedia(req, res, next);
  clearCache('/api/social-media');
});

router.put('/:id', protect, async (req, res, next) => {
  await updateSocialMedia(req, res, next);
  clearCache('/api/social-media');
  clearCache(`/api/social-media/${req.params.id}`);
});

router.delete('/:id', protect, async (req, res, next) => {
  await deleteSocialMedia(req, res, next);
  clearCache('/api/social-media');
  clearCache(`/api/social-media/${req.params.id}`);
});

export default router;