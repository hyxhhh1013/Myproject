import express from 'express';
import { createMessage, getAllMessages, deleteMessage, markAsRead, batchMarkAsRead, batchDeleteMessages } from '../controllers/messageController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest, validateRequests } from '../middleware/validateRequest';
import { createMessageSchema, batchMarkAsReadSchema, batchDeleteMessagesSchema, messageQuerySchema, messageIdSchema, markAsReadSchema } from '../validations/messageValidation';

const router = express.Router();

// Public route to send message with validation
router.post('/', validateRequest(createMessageSchema, 'body'), createMessage);

// Admin routes
router.get('/', protect, validateRequest(messageQuerySchema, 'query'), getAllMessages);
router.post('/batch/read', protect, validateRequest(batchMarkAsReadSchema, 'body'), batchMarkAsRead);
router.post('/batch/delete', protect, validateRequest(batchDeleteMessagesSchema, 'body'), batchDeleteMessages);
router.delete('/:id', protect, validateRequest(messageIdSchema, 'params'), deleteMessage);
router.patch('/:id/read', protect, validateRequests({ params: messageIdSchema, body: markAsReadSchema }), markAsRead);

export default router;
