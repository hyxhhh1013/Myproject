import express from 'express';
import { getAllContacts, getContactById, createContact, updateContact, deleteContact } from '../controllers/contactController';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Contact routes with cache
router.get('/', cacheMiddleware(300), getAllContacts);
router.get('/:id', cacheMiddleware(600), getContactById);

// Create, update, delete operations with cache clearing
router.post('/', protect, async (req, res) => {
  await createContact(req, res);
  clearCache('/api/contact');
});

router.put('/:id', protect, async (req, res) => {
  await updateContact(req, res);
  clearCache('/api/contact');
  clearCache(`/api/contact/${req.params.id}`);
});

router.delete('/:id', protect, async (req, res) => {
  await deleteContact(req, res);
  clearCache('/api/contact');
  clearCache(`/api/contact/${req.params.id}`);
});

export default router;