"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const musicController_1 = require("../controllers/musicController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', musicController_1.getMusic);
router.post('/', authMiddleware_1.protect, musicController_1.createMusic);
router.put('/:id', authMiddleware_1.protect, musicController_1.updateMusic);
router.delete('/:id', authMiddleware_1.protect, musicController_1.deleteMusic);
router.put('/order', authMiddleware_1.protect, musicController_1.updateMusicOrder);
exports.default = router;
//# sourceMappingURL=musicRoutes.js.map