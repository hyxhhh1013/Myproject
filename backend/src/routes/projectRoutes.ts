import { Router } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  upload,
  uploadProjectDemo
} from '../controllers/projectController';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Project routes with cache
router.get('/', cacheMiddleware(300), getAllProjects);
router.get('/:id', cacheMiddleware(600), getProjectById);

// Create, update, delete operations with cache clearing
router.post('/', protect, upload.array('images'), async (req, res) => {
  await createProject(req, res);
  clearCache('/api/projects');
});

router.put('/:id', protect, upload.array('images'), async (req, res) => {
  await updateProject(req, res);
  clearCache('/api/projects');
  clearCache(`/api/projects/${req.params.id}`);
});

router.delete('/:id', protect, async (req, res) => {
  await deleteProject(req, res);
  clearCache('/api/projects');
  clearCache(`/api/projects/${req.params.id}`);
});

router.post('/:id/upload-demo', protect, upload.single('demoFile'), async (req, res) => {
  await uploadProjectDemo(req, res);
  clearCache('/api/projects');
  clearCache(`/api/projects/${req.params.id}`);
});

export default router;