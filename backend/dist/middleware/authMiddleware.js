"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret123');
            // Add user to request
            req.user = decoded;
            next();
        }
        catch (error) {
            console.error(error);
            res.status(401).json({ status: 'fail', message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ status: 'fail', message: 'Not authorized, no token' });
    }
};
exports.protect = protect;
//# sourceMappingURL=authMiddleware.js.map