"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const skillController_1 = require("../controllers/skillController");
const cache_1 = require("../middleware/cache");
const router = express_1.default.Router();
// Skill routes with cache
router.get('/', (0, cache_1.cacheMiddleware)(300), skillController_1.getAllSkills);
router.get('/:id', (0, cache_1.cacheMiddleware)(600), skillController_1.getSkillById);
// Create, update, delete operations with cache clearing
router.post('/', async (req, res) => {
    await (0, skillController_1.createSkill)(req, res);
    (0, cache_1.clearCache)('/api/skills');
});
router.put('/:id', async (req, res) => {
    await (0, skillController_1.updateSkill)(req, res);
    (0, cache_1.clearCache)('/api/skills');
    (0, cache_1.clearCache)(`/api/skills/${req.params.id}`);
});
router.delete('/:id', async (req, res) => {
    await (0, skillController_1.deleteSkill)(req, res);
    (0, cache_1.clearCache)('/api/skills');
    (0, cache_1.clearCache)(`/api/skills/${req.params.id}`);
});
exports.default = router;
//# sourceMappingURL=skillRoutes.js.map