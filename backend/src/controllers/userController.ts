import { Request, Response } from 'express';
import { prisma } from '../index';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import logger from '../utils/logger';
import { FileUploadRequest, ApiResponse } from '../types/express';
import { saveFileToDb, saveBufferToDb } from '../utils/dbStorage';
import { optimizeImageBuffer } from '../utils/imageOptimizer';

// Upload avatar
export const uploadAvatar = async (req: FileUploadRequest, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ status: 'error', message: 'Please upload a file' });
    }

    // 优化头像：缩放到 512x512 并转换为 WebP (直接在内存中)
    const avatarFilename = `avatar-${id}-${Date.now()}.webp`;
    const { buffer } = await optimizeImageBuffer(file.path, 512, 80);

    const avatarUrl = `/uploads/${avatarFilename}`;
    
    // 保存到数据库
    await saveBufferToDb(buffer, avatarFilename);
    
    // 清理本地临时文件
    await fs.unlink(file.path).catch(() => {});

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { avatar: avatarUrl },
    });

    logger.info('Avatar uploaded successfully', { userId: user.id });
    res.json({ status: 'success', message: 'Avatar updated', data: { avatar: avatarUrl } });
  } catch (error) {
    logger.error('Error uploading avatar', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to upload avatar' });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        education: true,
        experience: true,
        skills: true,
        projects: true,
        contacts: true,
        socialMedia: true,
      },
    });
    logger.info('Retrieved all users', { count: users.length });
    res.status(200).json(users);
  } catch (error) {
    logger.error('Error getting users', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to get users' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        education: true,
        experience: true,
        skills: true,
        projects: true,
        contacts: true,
        socialMedia: true,
      },
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error('Error getting user', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to get user' });
  }
};

// Create user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, title, bio, avatar, email, phone, location } = req.body as any;

    const user = await prisma.user.create({
      data: {
        name,
        title,
        bio,
        avatar,
        email,
        phone,
        location,
      },
    });

    logger.info('User created successfully', { userId: user.id });
    res.status(201).json({ status: 'success', message: 'User created successfully', data: user });
  } catch (error) {
    logger.error('Error creating user', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to create user' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const { name, title, bio, avatar, email, phone, location } = req.body as any;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        title,
        bio,
        avatar,
        email,
        phone,
        location,
      },
    });

    logger.info('User updated successfully', { userId: parseInt(id) });
    res.status(200).json({ status: 'success', message: 'User updated successfully', data: user });
  } catch (error) {
    logger.error('Error updating user', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to update user' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    
    logger.info('User deleted successfully', { userId: id });
    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to delete user' });
  }
};