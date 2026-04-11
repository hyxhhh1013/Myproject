import { Router } from 'express';
import { upload } from '../controllers/photoController';
import { protect } from '../middleware/authMiddleware';
import { handleUploadToDb, handleMultipleUploadToDb } from '../controllers/dbUploadController';

const router = Router();

router.post('/upload', protect, upload.single('image'), handleUploadToDb);

router.post('/upload/multiple', protect, upload.array('images', 9), handleMultipleUploadToDb);

export default router;
