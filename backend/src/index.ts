import express from 'express';
import logger from './utils/logger';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import userRoutes from './routes/userRoutes';
import educationRoutes from './routes/educationRoutes';
import experienceRoutes from './routes/experienceRoutes';
import skillRoutes from './routes/skillRoutes';
import projectRoutes from './routes/projectRoutes';
import contactRoutes from './routes/contactRoutes';
import socialMediaRoutes from './routes/socialMediaRoutes';
import photoCategoryRoutes from './routes/photoCategoryRoutes';
import photoRoutes from './routes/photoRoutes';
import messageRoutes from './routes/messageRoutes';
import authRoutes from './routes/authRoutes';
import hobbyRoutes from './routes/hobbyRoutes';
import musicRoutes from './routes/musicRoutes';
import movieRoutes from './routes/movieRoutes';
import travelCityRoutes from './routes/travelCityRoutes';
import travelFootprintRoutes from './routes/travelFootprintRoutes';
import siteConfigRoutes from './routes/siteConfigRoutes';
import aiRoutes from './routes/aiRoutes';
import danmakuRoutes from './routes/danmakuRoutes';
import momentRoutes from './routes/momentRoutes';
import newsRoutes from './routes/newsRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initData } from './utils/initData';
import { rateLimit } from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Create Prisma client with optimized configuration
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : [],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Create Express app
const app = express();

// Trust proxy for express-rate-limit (works behind nginx)
app.set('trust proxy', true);

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    status: 429
  }
});

// Optimized middleware order
// 1. Compression (should be first to compress all responses)
app.use(compression());

// 2. CORS configuration with optimized settings
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  maxAge: 86400,
}));

// 3. Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https://* http://localhost:3001; " +
    "font-src 'self' https://cdn.jsdelivr.net; " +
    "connect-src 'self' http://localhost:3001 https://api.example.com https://open.bigmodel.cn https://api.vvhan.com https://api.yyua.com; " +
    "frame-src 'none'; " +
    "object-src 'none'"
  );
  res.setHeader('Permissions-Policy', 
    "geolocation=(self), " +
    "camera=(), " +
    "microphone=(), " +
    "payment=(), " +
    "usb=(), " +
    "accelerometer=(), " +
    "gyroscope=()"
  );
  
  if (req.path.startsWith('/uploads')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (req.path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    }
  }
  
  if (req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  
  res.removeHeader('X-Powered-By');
  res.removeHeader('Expires');
  
  next();
});

// 4. Body parsers with optimized settings
app.use(express.json({ 
  limit: '10mb',
  strict: true,
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
}));

// 5. Rate limiting for API routes
app.use('/api', apiLimiter);

// 6. Static file serving with caching
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
}));

// Fallback for missing uploads to prevent broken images
app.use('/uploads', (req, res) => {
  const fileName = path.basename(req.path);
  // Redirect to a placeholder service based on the filename to keep it consistent
  res.redirect(`https://picsum.photos/seed/${encodeURIComponent(fileName)}/800/600`);
});

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
app.use('/api/users', userRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/photo-categories', photoCategoryRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', hobbyRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/travel-cities', travelCityRoutes);
app.use('/api/travel/cities', travelCityRoutes);
app.use('/api/travels', travelCityRoutes);
app.use('/api/travel/footprints', travelFootprintRoutes);
app.use('/api/siteConfig', siteConfigRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/danmaku', danmakuRoutes);
app.use('/api/moments', momentRoutes);
app.use('/api', uploadRoutes);

// Serve static files in production
const publicPath = path.join(__dirname, 'public');
const indexPath = path.join(publicPath, 'index.html');
const fs = require('fs');
if (fs.existsSync(indexPath)) {
  logger.info('Serving static files from:', { path: publicPath });
  app.use(express.static(publicPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(indexPath);
  });
} else {
  logger.warn('Public index.html not found at:', { path: indexPath });
}

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

// Initialize data
initData(prisma).then(() => {
  const portNum = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
  app.listen(portNum, '0.0.0.0', () => {
    logger.info('Server is running', {
      port: portNum,
      mode: process.env.NODE_ENV || 'development',
      healthCheck: `http://localhost:${portNum}/health`,
      pid: process.pid
    });
  });
}).catch((error) => {
  logger.error('Failed to initialize data', { error: error.message, stack: error.stack });
  process.exit(1);
});
