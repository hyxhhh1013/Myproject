import express from 'express';
import { login, getMe, changePassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema, changePasswordSchema } from '../validations/authValidation';

const router = express.Router();

// Login endpoint with validation
router.post('/login', validateRequest(loginSchema, 'body'), login);

// Get current user info
router.get('/me', protect, getMe);

// Change password with validation
router.put('/change-password', protect, validateRequest(changePasswordSchema, 'body'), changePassword);

export default router;
