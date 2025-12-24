"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const siteConfigController_1 = require("../controllers/siteConfigController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', siteConfigController_1.getSiteConfig);
router.post('/view', siteConfigController_1.incrementViewCount);
router.put('/', authMiddleware_1.protect, siteConfigController_1.updateSiteConfig);
exports.default = router;
//# sourceMappingURL=siteConfigRoutes.js.map