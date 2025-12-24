"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const educationRoutes_1 = __importDefault(require("./routes/educationRoutes"));
const experienceRoutes_1 = __importDefault(require("./routes/experienceRoutes"));
const skillRoutes_1 = __importDefault(require("./routes/skillRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const socialMediaRoutes_1 = __importDefault(require("./routes/socialMediaRoutes"));
const photoCategoryRoutes_1 = __importDefault(require("./routes/photoCategoryRoutes"));
const photoRoutes_1 = __importDefault(require("./routes/photoRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const siteConfigRoutes_1 = __importDefault(require("./routes/siteConfigRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const initData_1 = require("./utils/initData");
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
// Create Prisma client
exports.prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});
// Middleware
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
// Security headers middleware
app.use((req, res, next) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Add cache control headers for static assets
    if (req.path.startsWith('/uploads')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        // Ensure SVG files have correct content-type
        if (req.path.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        }
    }
    // Ensure UTF-8 charset for all JSON responses
    if (req.path.startsWith('/api')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    // Remove unnecessary headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('X-XSS-Protection');
    res.removeHeader('Expires');
    next();
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Static file serving for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// API Routes
app.use('/api/users', userRoutes_1.default);
app.use('/api/education', educationRoutes_1.default);
app.use('/api/experience', experienceRoutes_1.default);
app.use('/api/skills', skillRoutes_1.default);
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/contacts', contactRoutes_1.default);
app.use('/api/social-media', socialMediaRoutes_1.default);
app.use('/api/photo-categories', photoCategoryRoutes_1.default);
app.use('/api/photos', photoRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/site-config', siteConfigRoutes_1.default);
// Serve static files in production
// if (process.env.NODE_ENV === 'production') { // Remove environment check, always serve static files if folder exists
const publicPath = path_1.default.join(__dirname, 'public');
// Check if public folder exists
const fs = require('fs');
if (fs.existsSync(publicPath)) {
    console.log('Serving static files from:', publicPath);
    app.use(express_1.default.static(publicPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path_1.default.join(publicPath, 'index.html'));
    });
}
else {
    console.warn('Public folder not found at:', publicPath);
}
// }
// 404 Not Found Handler
app.use(errorHandler_1.notFoundHandler);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
// Start server
const PORT = process.env.PORT || 3001;
// Initialize data before starting server
(0, initData_1.initData)(exports.prisma).then(() => {
    const portNum = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
    app.listen(portNum, '0.0.0.0', () => {
        console.log(`Server is running on port ${portNum} in ${process.env.NODE_ENV || 'development'} mode`);
        console.log(`Health check: http://localhost:${portNum}/health`);
    });
});
//# sourceMappingURL=index.js.map