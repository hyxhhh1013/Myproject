"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const photoController_1 = require("../controllers/photoController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// User routes
router.get('/', userController_1.getAllUsers);
router.get('/:id', userController_1.getUserById);
router.post('/', authMiddleware_1.protect, userController_1.createUser);
router.put('/:id', authMiddleware_1.protect, userController_1.updateUser);
router.delete('/:id', authMiddleware_1.protect, userController_1.deleteUser);
router.post('/:id/avatar', authMiddleware_1.protect, photoController_1.upload.single('image'), userController_1.uploadAvatar);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map