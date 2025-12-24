"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const cache_1 = require("../middleware/cache");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Project routes with cache
router.get('/', (0, cache_1.cacheMiddleware)(300), projectController_1.getAllProjects);
router.get('/:id', (0, cache_1.cacheMiddleware)(600), projectController_1.getProjectById);
// Create, update, delete operations with cache clearing
router.post('/', authMiddleware_1.protect, projectController_1.upload.array('images'), async (req, res) => {
    await (0, projectController_1.createProject)(req, res);
    (0, cache_1.clearCache)('/api/projects');
});
router.put('/:id', authMiddleware_1.protect, projectController_1.upload.array('images'), async (req, res) => {
    await (0, projectController_1.updateProject)(req, res);
    (0, cache_1.clearCache)('/api/projects');
    (0, cache_1.clearCache)(`/api/projects/${req.params.id}`);
});
router.delete('/:id', authMiddleware_1.protect, async (req, res) => {
    await (0, projectController_1.deleteProject)(req, res);
    (0, cache_1.clearCache)('/api/projects');
    (0, cache_1.clearCache)(`/api/projects/${req.params.id}`);
});
router.post('/:id/upload-demo', authMiddleware_1.protect, projectController_1.upload.single('demoFile'), async (req, res) => {
    await (0, projectController_1.uploadProjectDemo)(req, res);
    (0, cache_1.clearCache)('/api/projects');
    (0, cache_1.clearCache)(`/api/projects/${req.params.id}`);
});
exports.default = router;
//# sourceMappingURL=projectRoutes.js.map