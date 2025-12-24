"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const educationController_1 = require("../controllers/educationController");
const cache_1 = require("../middleware/cache");
const router = express_1.default.Router();
// Education routes with cache
router.get('/', (0, cache_1.cacheMiddleware)(300), educationController_1.getAllEducation);
router.get('/:id', (0, cache_1.cacheMiddleware)(600), educationController_1.getEducationById);
// Create, update, delete operations with cache clearing
router.post('/', async (req, res) => {
    await (0, educationController_1.createEducation)(req, res);
    (0, cache_1.clearCache)('/api/education');
});
router.put('/:id', async (req, res) => {
    await (0, educationController_1.updateEducation)(req, res);
    (0, cache_1.clearCache)('/api/education');
    (0, cache_1.clearCache)(`/api/education/${req.params.id}`);
});
router.delete('/:id', async (req, res) => {
    await (0, educationController_1.deleteEducation)(req, res);
    (0, cache_1.clearCache)('/api/education');
    (0, cache_1.clearCache)(`/api/education/${req.params.id}`);
});
exports.default = router;
//# sourceMappingURL=educationRoutes.js.map