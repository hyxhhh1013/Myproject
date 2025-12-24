"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const travelCityController_1 = require("../controllers/travelCityController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', travelCityController_1.getTravelCities);
router.post('/', authMiddleware_1.protect, travelCityController_1.createTravelCity);
router.put('/:id', authMiddleware_1.protect, travelCityController_1.updateTravelCity);
router.delete('/:id', authMiddleware_1.protect, travelCityController_1.deleteTravelCity);
router.put('/order', authMiddleware_1.protect, travelCityController_1.updateTravelCityOrder);
router.post('/:id/want', travelCityController_1.updateWantCount);
router.post('/:id/been', travelCityController_1.updateBeenCount);
exports.default = router;
//# sourceMappingURL=travelCityRoutes.js.map