import express from 'express';
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
import siteConfigRoutes from './routes/siteConfigRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initData } from './utils/initData';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create Prisma client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Middleware
app.use(compression());
app.use(cors({
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/site-config', siteConfigRoutes);

// Serve static files in production
// if (process.env.NODE_ENV === 'production') { // Remove environment check, always serve static files if folder exists
  const publicPath = path.join(__dirname, 'public');
  // Check if public folder exists
  const fs = require('fs');
  if (fs.existsSync(publicPath)) {
    console.log('Serving static files from:', publicPath);
    app.use(express.static(publicPath));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  } else {
    console.warn('Public folder not found at:', publicPath);
  }
// }

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

// Initialize data before starting server
initData(prisma).then(() => {
  const portNum = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
  app.listen(portNum, '0.0.0.0', () => {
    console.log(`Server is running on port ${portNum} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Health check: http://localhost:${portNum}/health`);
  });
});