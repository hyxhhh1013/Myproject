"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Public route to send message
router.post('/', messageController_1.createMessage);
// Admin routes
router.get('/', authMiddleware_1.protect, messageController_1.getAllMessages);
router.delete('/:id', authMiddleware_1.protect, messageController_1.deleteMessage);
router.patch('/:id/read', authMiddleware_1.protect, messageController_1.markAsRead);
exports.default = router;
//# sourceMappingURL=messageRoutes.js.map