"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const experienceController_1 = require("../controllers/experienceController");
const cache_1 = require("../middleware/cache");
const router = express_1.default.Router();
// Experience routes with cache
router.get('/', (0, cache_1.cacheMiddleware)(300), experienceController_1.getAllExperience);
router.get('/:id', (0, cache_1.cacheMiddleware)(600), experienceController_1.getExperienceById);
// Create, update, delete operations with cache clearing
router.post('/', async (req, res) => {
    await (0, experienceController_1.createExperience)(req, res);
    (0, cache_1.clearCache)('/api/experience');
});
router.put('/:id', async (req, res) => {
    await (0, experienceController_1.updateExperience)(req, res);
    (0, cache_1.clearCache)('/api/experience');
    (0, cache_1.clearCache)(`/api/experience/${req.params.id}`);
});
router.delete('/:id', async (req, res) => {
    await (0, experienceController_1.deleteExperience)(req, res);
    (0, cache_1.clearCache)('/api/experience');
    (0, cache_1.clearCache)(`/api/experience/${req.params.id}`);
});
exports.default = router;
//# sourceMappingURL=experienceRoutes.js.map