"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hobbyController_1 = require("../controllers/hobbyController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Music
router.get('/music', hobbyController_1.getMusicList);
router.post('/music', authMiddleware_1.protect, hobbyController_1.createMusic);
router.put('/music/:id', authMiddleware_1.protect, hobbyController_1.updateMusic);
router.delete('/music/:id', authMiddleware_1.protect, hobbyController_1.deleteMusic);
// Movies
router.get('/movies', hobbyController_1.getMovieList);
router.post('/movies', authMiddleware_1.protect, hobbyController_1.createMovie);
router.put('/movies/:id', authMiddleware_1.protect, hobbyController_1.updateMovie);
router.delete('/movies/:id', authMiddleware_1.protect, hobbyController_1.deleteMovie);
// Travel
router.get('/travel', hobbyController_1.getTravelList);
router.post('/travel', authMiddleware_1.protect, hobbyController_1.createTravel);
router.put('/travel/:id', authMiddleware_1.protect, hobbyController_1.updateTravel);
router.delete('/travel/:id', authMiddleware_1.protect, hobbyController_1.deleteTravel);
exports.default = router;
//# sourceMappingURL=hobbyRoutes.js.map