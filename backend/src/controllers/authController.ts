import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import logger from '../utils/logger';
import { AuthRequest, ApiResponse } from '../types/express';
import { loginSchema, changePasswordSchema } from '../validations/authValidation';
import { asyncHandler } from '../middleware/asyncHandler';

const generateToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

export const login = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const validatedData = loginSchema.parse(req.body);
  const { email, password } = validatedData;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.password))) {
    logger.info('User login successful', { email });
    res.json({
      status: 'success',
      data: { id: user.id, name: user.name, email: user.email, token: generateToken(user.id) },
    });
  } else {
    logger.warn('User login failed - invalid credentials', { email });
    res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
  }
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user?.id },
    select: { id: true, name: true, email: true, title: true, bio: true, avatar: true },
  });

  if (user) {
    res.json({ status: 'success', data: user });
  } else {
    logger.warn('User not found', { userId: req.user?.id });
    res.status(404).json({ status: 'fail', message: 'User not found' });
  }
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const validatedData = changePasswordSchema.parse(req.body);
  const { oldPassword, newPassword } = validatedData;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ status: 'error', message: 'User not authenticated' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ status: 'fail', message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    logger.warn('Password change failed - incorrect old password', { userId });
    return res.status(400).json({ status: 'fail', message: 'Current password is incorrect' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  logger.info('Password changed successfully', { userId });
  res.json({ status: 'success', message: 'Password changed successfully' });
});
