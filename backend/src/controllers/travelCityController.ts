import { Request, Response } from 'express';
import { prisma } from '../index';
import logger from '../utils/logger';
import { FileUploadRequest } from '../types/express';
import path from 'path';
import fs from 'fs/promises';
import { saveFileToDb, saveBufferToDb } from '../utils/dbStorage';
import { optimizeImageBuffer } from '../utils/imageOptimizer';

const CDN_BASE_URL = process.env.CDN_BASE_URL || '';

/**
 * 获取所有旅行城市
 */
export const getTravelCities = async (req: Request, res: Response) => {
  try {
    const { isVisible } = req.query;
    
    const where: any = {};
    if (isVisible !== undefined) {
      where.isVisible = isVisible === 'true';
    }
    
    const cities = await prisma.travelCity.findMany({
      where,
      orderBy: { orderIndex: 'asc' }
    });
    
    const processedCities = cities.map(city => ({
      ...city,
      photos: city.photos ? JSON.parse(city.photos) : []
    }));

    res.json({
      status: 'success',
      data: processedCities
    });
  } catch (error) {
    logger.error('获取旅行城市失败:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: '获取旅行城市失败' });
  }
};

/**
 * 创建旅行城市
 */
export const createTravelCity = async (req: any, res: Response) => {
  try {
    const { 
      city, province, country, location, latitude, longitude, 
      visitedAt, description, imageUrl, highlights, tips, rating, 
      isVisible, orderIndex, note, existingImages 
    } = req.body;
    
    if (!city || !city.trim()) {
      return res.status(400).json({ error: '城市名称不能为空' });
    }

    let imageUrls: string[] = [];
    let coverImageUrl = imageUrl?.trim() || null;
    
    // Handle existing images passed from frontend (if any)
    if (existingImages) {
      imageUrls = Array.isArray(existingImages) ? existingImages : JSON.parse(existingImages);
    }
    
    // Handle cover image upload
    const coverFile = req.files?.coverImage?.[0];
    if (coverFile) {
      // 优化封面图 (内存处理)
      const { buffer } = await optimizeImageBuffer(coverFile.path, 1920, 75);
      const baseFilename = path.basename(coverFile.path, path.extname(coverFile.path));
      const filename = `${baseFilename}-opt.webp`;
      
      await saveBufferToDb(buffer, filename);
      // 清理原始文件
      await fs.unlink(coverFile.path).catch(() => {});
      coverImageUrl = `/uploads/${filename}`;
    }
    
    // Handle newly uploaded files
    const imageFiles = req.files?.images;
    if (imageFiles && Array.isArray(imageFiles) && imageFiles.length > 0) {
      const newUrls = await Promise.all(imageFiles.map(async (file: Express.Multer.File) => {
        // 优化旅行照片 (内存处理)
        const { buffer } = await optimizeImageBuffer(file.path, 1920, 75);
        const baseFilename = path.basename(file.path, path.extname(file.path));
        const filename = `${baseFilename}-opt.webp`;
        
        await saveBufferToDb(buffer, filename);
        // 清理原始文件
        await fs.unlink(file.path).catch(() => {});
        return `/uploads/${filename}`;
      }));
      imageUrls = [...imageUrls, ...newUrls];
    }
    
    const travelCity = await prisma.travelCity.create({
      data: {
        name: city.trim(),
        city: city.trim(),
        province: province?.trim() || null,
        country: country?.trim() || '中国',
        location: location?.trim() || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        visitedAt: visitedAt ? new Date(visitedAt) : null,
        description: description?.trim() || null,
        imageUrl: coverImageUrl,
        highlights: highlights?.trim() || null,
        tips: tips?.trim() || null,
        rating: rating ? parseFloat(rating) : null,
        photos: JSON.stringify(imageUrls),
        note: note?.trim() || null,
        isVisible: isVisible !== false && isVisible !== 'false',
        orderIndex: orderIndex ? parseInt(orderIndex) : 0,
      }
    });
    
    logger.info('Travel city created successfully', { id: travelCity.id, city });
    res.status(201).json({ status: 'success', data: { ...travelCity, photos: imageUrls } });
  } catch (error) {
    logger.error('创建旅行城市失败:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: '创建旅行城市失败' });
  }
};

/**
 * 更新旅行城市
 */
export const updateTravelCity = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      city, province, country, location, latitude, longitude, 
      visitedAt, description, imageUrl, highlights, tips, rating, 
      isVisible, orderIndex, note, existingImages 
    } = req.body;
    
    const dataToUpdate: any = {};
    
    if (city !== undefined) {
      dataToUpdate.name = city?.trim() || '';
      dataToUpdate.city = city?.trim() || '';
    }
    if (province !== undefined) dataToUpdate.province = province?.trim() || null;
    if (country !== undefined) dataToUpdate.country = country?.trim() || '中国';
    if (location !== undefined) dataToUpdate.location = location?.trim() || null;
    if (latitude !== undefined) dataToUpdate.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) dataToUpdate.longitude = longitude ? parseFloat(longitude) : null;
    if (visitedAt !== undefined) dataToUpdate.visitedAt = visitedAt ? new Date(visitedAt) : null;
    if (description !== undefined) dataToUpdate.description = description?.trim() || null;
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl?.trim() || null;
    if (highlights !== undefined) dataToUpdate.highlights = highlights?.trim() || null;
    if (tips !== undefined) dataToUpdate.tips = tips?.trim() || null;
    if (rating !== undefined) dataToUpdate.rating = rating ? parseFloat(rating) : null;
    if (note !== undefined) dataToUpdate.note = note?.trim() || null;
    if (isVisible !== undefined) dataToUpdate.isVisible = isVisible === true || isVisible === 'true';
    if (orderIndex !== undefined) dataToUpdate.orderIndex = parseInt(orderIndex);
    
    // Handle cover image upload
    const coverFile = req.files?.coverImage?.[0];
    if (coverFile) {
      // 优化封面图 (内存处理)
      const { buffer } = await optimizeImageBuffer(coverFile.path, 1920, 75);
      const baseFilename = path.basename(coverFile.path, path.extname(coverFile.path));
      const filename = `${baseFilename}-opt.webp`;
      
      await saveBufferToDb(buffer, filename);
      // 清理原始文件
      await fs.unlink(coverFile.path).catch(() => {});
      dataToUpdate.imageUrl = `/uploads/${filename}`;
    }
    
    let imageUrls: string[] = [];
    let shouldUpdatePhotos = false;
    
    if (existingImages !== undefined) {
      imageUrls = Array.isArray(existingImages) ? existingImages : JSON.parse(existingImages);
      shouldUpdatePhotos = true;
    }
    
    // Handle newly uploaded files
    const imageFiles = req.files?.images;
    if (imageFiles && Array.isArray(imageFiles) && imageFiles.length > 0) {
      const newUrls = await Promise.all(imageFiles.map(async (file: Express.Multer.File) => {
        // 优化旅行照片 (内存处理)
        const { buffer } = await optimizeImageBuffer(file.path, 1920, 75);
        const baseFilename = path.basename(file.path, path.extname(file.path));
        const filename = `${baseFilename}-opt.webp`;
        
        await saveBufferToDb(buffer, filename);
        // 清理原始文件
        await fs.unlink(file.path).catch(() => {});
        return `/uploads/${filename}`;
      }));
      imageUrls = [...imageUrls, ...newUrls];
      shouldUpdatePhotos = true;
    }

    if (shouldUpdatePhotos) {
      dataToUpdate.photos = JSON.stringify(imageUrls);
    }
    
    const travelCity = await prisma.travelCity.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });
    
    logger.info('Travel city updated successfully', { id: travelCity.id });
    res.json({ status: 'success', data: { ...travelCity, photos: shouldUpdatePhotos ? imageUrls : travelCity.photos ? JSON.parse(travelCity.photos) : [] } });
  } catch (error) {
    logger.error('更新旅行城市失败:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: '更新旅行城市失败' });
  }
};

/**
 * 删除旅行城市
 */
export const deleteTravelCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.travelCity.delete({
      where: { id: parseInt(id) }
    });
    
    logger.info('Travel city deleted successfully', { id: parseInt(id) });
    res.json({ status: 'success', message: '删除成功' });
  } catch (error) {
    logger.error('删除旅行城市失败:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: '删除旅行城市失败' });
  }
};

/**
 * 更新旅行城市排序
 */
export const updateTravelCityOrder = async (req: Request, res: Response) => {
  try {
    const { cityIds } = req.body;
    
    await prisma.$transaction(
      cityIds.map((id: number, index: number) =>
        prisma.travelCity.update({
          where: { id },
          data: { orderIndex: index }
        })
      )
    );
    
    logger.info('Travel city order updated successfully', { count: cityIds.length });
    res.json({ status: 'success', message: '排序更新成功' });
  } catch (error) {
    logger.error('更新旅行城市排序失败:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: '更新旅行城市排序失败' });
  }
};

/**
 * 更新旅行城市想去人数
 */
export const updateWantCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { increment } = req.body;
    
    const city = await prisma.travelCity.update({
      where: { id: parseInt(id) },
      data: {
        wantCount: { increment: increment || 0 }
      }
    });
    
    res.json(city);
  } catch (error) {
    logger.error('更新旅行城市想去人数失败:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: '更新旅行城市想去人数失败' });
  }
};

/**
 * 更新旅行城市去过人数
 */
export const updateBeenCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { increment } = req.body;
    
    const city = await prisma.travelCity.update({
      where: { id: parseInt(id) },
      data: {
        beenCount: { increment: increment || 0 }
      }
    });
    
    res.json(city);
  } catch (error) {
    logger.error('更新旅行城市去过人数失败:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: '更新旅行城市去过人数失败' });
  }
};
