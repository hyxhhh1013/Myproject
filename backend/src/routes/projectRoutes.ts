import { Router } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectDemo,
  upload
} from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';
import { clearCache, cacheMiddleware } from '../middleware/cache';

const router = Router();

// Get all projects
router.get('/', cacheMiddleware(300), getAllProjects);

// Get project by ID
router.get('/:id', cacheMiddleware(600), getProjectById);

// Create, update, delete operations with cache clearing
router.post('/', protect, upload.array('demoFile', 5), async (req, res, next) => {
  await createProject(req as any, res, next);
  clearCache('/api/projects');
});

router.put('/:id', protect, upload.array('demoFile', 5), async (req, res, next) => {
  await updateProject(req, res, next);
  clearCache('/api/projects');
  clearCache(`/api/projects/${req.params.id}`);
});

router.delete('/:id', protect, async (req, res, next) => {
  await deleteProject(req, res, next);
  clearCache('/api/projects');
  clearCache(`/api/projects/${req.params.id}`);
});

router.post('/:id/upload-demo', protect, upload.single('demoFile'), async (req, res, next) => {
  await uploadProjectDemo(req, res, next);
  clearCache('/api/projects');
  clearCache(`/api/projects/${req.params.id}`);
});

export default router;