import express from 'express';
import { getAdminStats } from '../controllers/adminStatsController';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// GET /api/admin/stats - Protected aggregated dashboard telemetry
router.get('/stats', protect, asyncHandler(getAdminStats));

export default router;
