import { Router } from 'express';
import { chat, chatStream, translate, getAgentTools, getGithubTelemetry } from '../controllers/aiController';

const router = Router();

router.post('/chat', chat);
router.post('/chat/stream', chatStream);
router.post('/translate', translate);
router.get('/agent/tools', getAgentTools);
router.get('/github-telemetry', getGithubTelemetry);

export default router;
