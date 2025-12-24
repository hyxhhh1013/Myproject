"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const movieController_1 = require("../controllers/movieController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', movieController_1.getMovies);
router.post('/', authMiddleware_1.protect, movieController_1.createMovie);
router.put('/:id', authMiddleware_1.protect, movieController_1.updateMovie);
router.delete('/:id', authMiddleware_1.protect, movieController_1.deleteMovie);
router.put('/order', authMiddleware_1.protect, movieController_1.updateMovieOrder);
router.post('/:id/likes', movieController_1.updateMovieLikes);
exports.default = router;
//# sourceMappingURL=movieRoutes.js.map