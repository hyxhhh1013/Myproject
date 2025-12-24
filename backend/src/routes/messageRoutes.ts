import express from 'express';
import { createMessage, getAllMessages, deleteMessage, markAsRead, batchMarkAsRead, batchDeleteMessages } from '../controllers/messageController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public route to send message
router.post('/', createMessage);

// Admin routes
router.get('/', protect, getAllMessages);
router.post('/batch/read', protect, batchMarkAsRead);
router.post('/batch/delete', protect, batchDeleteMessages);
router.delete('/:id', protect, deleteMessage);
router.patch('/:id/read', protect, markAsRead);

export default router;
