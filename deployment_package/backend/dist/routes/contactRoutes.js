"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contactController_1 = require("../controllers/contactController");
const cache_1 = require("../middleware/cache");
const router = express_1.default.Router();
// Contact routes with cache
router.get('/', (0, cache_1.cacheMiddleware)(300), contactController_1.getAllContacts);
router.get('/:id', (0, cache_1.cacheMiddleware)(600), contactController_1.getContactById);
// Create, update, delete operations with cache clearing
router.post('/', async (req, res) => {
    await (0, contactController_1.createContact)(req, res);
    (0, cache_1.clearCache)('/api/contact');
});
router.put('/:id', async (req, res) => {
    await (0, contactController_1.updateContact)(req, res);
    (0, cache_1.clearCache)('/api/contact');
    (0, cache_1.clearCache)(`/api/contact/${req.params.id}`);
});
router.delete('/:id', async (req, res) => {
    await (0, contactController_1.deleteContact)(req, res);
    (0, cache_1.clearCache)('/api/contact');
    (0, cache_1.clearCache)(`/api/contact/${req.params.id}`);
});
exports.default = router;
//# sourceMappingURL=contactRoutes.js.map