import { Request, Response } from 'express';
import { prisma } from '../index';
import { FileUploadRequest } from '../types/express';
import path from 'path';
import fs from 'fs/promises';
import { saveFileToDb, saveBufferToDb } from '../utils/dbStorage';
import { optimizeImageBuffer } from '../utils/imageOptimizer';

const CDN_BASE_URL = process.env.CDN_BASE_URL || '';

// Get all experience records
export const getAllExperience = async (req: Request, res: Response) => {
  try {
    const experience = await prisma.experience.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        user: true,
      },
    });
    
    // Parse images array if it exists
    const processedExperience = experience.map(exp => ({
      ...exp,
      images: exp.images ? JSON.parse(exp.images) : []
    }));
    
    res.status(200).json(processedExperience);
  } catch (error) {
    console.error('Error getting experience records:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get experience records' });
  }
};

// Get experience by ID
export const getExperienceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const experience = await prisma.experience.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
      },
    });

    if (!experience) {
      return res.status(404).json({ status: 'error', message: 'Experience record not found' });
    }

    const processedExperience = {
      ...experience,
      images: experience.images ? JSON.parse(experience.images) : []
    };

    res.status(200).json(processedExperience);
  } catch (error) {
    console.error('Error getting experience record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get experience record' });
  }
};

// Create experience record
export const createExperience = async (req: FileUploadRequest, res: Response) => {
  try {
    const { userId, company, position, startDate, endDate, description, isVisible, orderIndex, existingImages } = req.body;

    let imageUrls: string[] = [];
    
    // Handle existing images passed from frontend (if any)
    if (existingImages) {
      imageUrls = Array.isArray(existingImages) ? existingImages : JSON.parse(existingImages);
    }
    
    // Handle newly uploaded files
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const newUrls = await Promise.all(files.map(async (file: Express.Multer.File) => {
        // 优化经历图片 (内存处理)
        const { buffer } = await optimizeImageBuffer(file.path, 1600, 75);
        const baseFilename = path.basename(file.path, path.extname(file.path));
        const filename = `${baseFilename}-opt.webp`;
        
        await saveBufferToDb(buffer, filename);
        // 清理原始文件
        await fs.unlink(file.path).catch(() => {});
        return `/uploads/${filename}`;
      }));
      imageUrls = [...imageUrls, ...newUrls];
    }

    const experience = await prisma.experience.create({
      data: {
        userId: userId ? parseInt(userId) : 1, // Default to 1 if not provided
        company,
        position,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
        images: JSON.stringify(imageUrls),
        isVisible: isVisible !== undefined ? (isVisible === 'true' || isVisible === true) : true,
        orderIndex: orderIndex ? parseInt(orderIndex) : 0,
      },
    });

    res.status(201).json({ status: 'success', message: 'Experience record created successfully', data: { ...experience, images: imageUrls } });
  } catch (error) {
    console.error('Error creating experience record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create experience record' });
  }
};

// Update experience record
export const updateExperience = async (req: FileUploadRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { company, position, startDate, endDate, description, isVisible, orderIndex, existingImages } = req.body;

    let imageUrls: string[] = [];
    
    // Handle existing images passed from frontend (if any)
    if (existingImages) {
      imageUrls = Array.isArray(existingImages) ? existingImages : JSON.parse(existingImages);
    }
    
    // Handle newly uploaded files
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const newUrls = await Promise.all(files.map(async (file: Express.Multer.File) => {
        // 优化经历图片 (内存处理)
        const { buffer } = await optimizeImageBuffer(file.path, 1600, 75);
        const baseFilename = path.basename(file.path, path.extname(file.path));
        const filename = `${baseFilename}-opt.webp`;
        
        await saveBufferToDb(buffer, filename);
        // 清理原始文件
        await fs.unlink(file.path).catch(() => {});
        return `/uploads/${filename}`;
      }));
      imageUrls = [...imageUrls, ...newUrls];
    }

    const updateData: any = {
      company,
      position,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description,
      images: JSON.stringify(imageUrls),
    };

    if (isVisible !== undefined) {
      updateData.isVisible = isVisible === 'true' || isVisible === true;
    }
    
    if (orderIndex !== undefined) {
      updateData.orderIndex = parseInt(orderIndex);
    }

    const experience = await prisma.experience.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({ status: 'success', message: 'Experience record updated successfully', data: { ...experience, images: imageUrls } });
  } catch (error) {
    console.error('Error updating experience record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update experience record' });
  }
};

// Delete experience record
export const deleteExperience = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.experience.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ status: 'success', message: 'Experience record deleted successfully' });
  } catch (error) {
    console.error('Error deleting experience record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete experience record' });
  }
};