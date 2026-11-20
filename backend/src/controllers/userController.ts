import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import path from 'path';
import logger from '../utils/logger';
import { FileUploadRequest, ApiResponse } from '../types/express';
import { asyncHandler } from '../middleware/asyncHandler';

export const uploadAvatar = asyncHandler(async (req: FileUploadRequest, res: Response<ApiResponse>) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ status: 'error', message: 'Please upload a file' });
  }

  const CDN_BASE_URL = process.env.CDN_BASE_URL || '';
  const avatarUrl = `${CDN_BASE_URL}/uploads/${path.basename(file.path)}`;

  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data: { avatar: avatarUrl },
  });

  logger.info('Avatar uploaded successfully', { userId: user.id });
  res.json({ status: 'success', message: 'Avatar updated', data: { avatar: avatarUrl } });
});

// These GET routes are public (the homepage reads the profile). Never send the
// password hash; send the phone number only to a request carrying a valid admin
// token (the admin profile page edits it). The routes are not cached, so a
// token-bearing response can never be replayed to an anonymous visitor.
const hasValidAdminToken = (req: Request): boolean => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return false;
  try {
    jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'secret123');
    return true;
  } catch {
    return false;
  }
};

const toResponseUser = <T extends { password?: string; phone?: string }>(user: T, includePrivate: boolean) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, phone, ...publicFields } = user;
  return includePrivate ? { ...publicFields, phone } : publicFields;
};

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: { education: true, experience: true, skills: true, projects: true, contacts: true, socialMedia: true },
  });

  logger.info('Retrieved all users', { count: users.length });
  const includePrivate = hasValidAdminToken(req);
  res.status(200).json(users.map((user) => toResponseUser(user, includePrivate)));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    include: { education: true, experience: true, skills: true, projects: true, contacts: true, socialMedia: true },
  });

  if (!user) {
    return res.status(404).json({ status: 'error', message: 'User not found' });
  }

  res.status(200).json(toResponseUser(user, hasValidAdminToken(req)));
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, title, bio, avatar, email, phone, location } = req.body;

  const user = await prisma.user.create({
    data: { name, title, bio, avatar, email, phone, location },
  });

  logger.info('User created successfully', { userId: user.id });
  res.status(201).json({ status: 'success', message: 'User created successfully', data: user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, title, bio, avatar, email, phone, location } = req.body;

  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data: { name, title, bio, avatar, email, phone, location },
  });

  logger.info('User updated successfully', { userId: parseInt(id) });
  res.status(200).json({ status: 'success', message: 'User updated successfully', data: user });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.user.delete({ where: { id: parseInt(id) } });

  logger.info('User deleted successfully', { userId: id });
  res.status(200).json({ status: 'success', message: 'User deleted successfully' });
});
