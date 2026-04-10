import { Router } from 'express';
import { chat, chatStream } from '../controllers/aiController';

const router = Router();

router.post('/chat', chat);
router.post('/chat/stream', chatStream);

export default router;
