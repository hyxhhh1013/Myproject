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
import { clearCache } from '../middleware/cache';

const router = Router();

// Get all projects
router.get('/', getAllProjects);

// Get project by ID
router.get('/:id', getProjectById);

// Create, update, delete operations with cache clearing
router.post('/', protect, upload.array('demoFile', 5), async (req, res) => {
  await createProject(req as any, res);
  clearCache('/api/projects');
});

router.put('/:id', protect, upload.array('demoFile', 5), async (req, res) => {
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