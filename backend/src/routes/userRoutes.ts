import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, uploadAvatar } from '../controllers/userController';
import { upload } from '../controllers/photoController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// User routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', protect, createUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);
router.post('/:id/avatar', protect, upload.single('image'), uploadAvatar);

export default router;