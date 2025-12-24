"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socialMediaController_1 = require("../controllers/socialMediaController");
const cache_1 = require("../middleware/cache");
const router = express_1.default.Router();
// Social Media routes with cache
router.get('/', (0, cache_1.cacheMiddleware)(300), socialMediaController_1.getAllSocialMedia);
router.get('/:id', (0, cache_1.cacheMiddleware)(600), socialMediaController_1.getSocialMediaById);
// Create, update, delete operations with cache clearing
router.post('/', async (req, res) => {
    await (0, socialMediaController_1.createSocialMedia)(req, res);
    (0, cache_1.clearCache)('/api/social-media');
});
router.put('/:id', async (req, res) => {
    await (0, socialMediaController_1.updateSocialMedia)(req, res);
    (0, cache_1.clearCache)('/api/social-media');
    (0, cache_1.clearCache)(`/api/social-media/${req.params.id}`);
});
router.delete('/:id', async (req, res) => {
    await (0, socialMediaController_1.deleteSocialMedia)(req, res);
    (0, cache_1.clearCache)('/api/social-media');
    (0, cache_1.clearCache)(`/api/social-media/${req.params.id}`);
});
exports.default = router;
//# sourceMappingURL=socialMediaRoutes.js.map