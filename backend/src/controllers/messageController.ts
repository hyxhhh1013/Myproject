import { Request, Response } from 'express';
import { prisma } from '../index';
import logger from '../utils/logger';
import { asyncHandler } from '../middleware/asyncHandler';
import { PrismaWhereInput, PrismaOrderByInput, PrismaSelectInput } from '../types/express';

export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, subject, content } = req.body;

  if (!name || !email || !subject || !content) {
    return res.status(400).json({ status: 'error', message: 'All fields are required' });
  }

  const message = await prisma.message.create({
    data: { name, email, subject, content },
  });

  logger.info('Message created successfully', { messageId: message.id, email });
  res.status(201).json({ status: 'success', message: 'Message sent successfully', data: message });
});

export const getAllMessages = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', isRead, search, sort, fields } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: PrismaWhereInput = {};

  if (isRead !== undefined) {
    where.isRead = isRead === 'true';
  }

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' as const } },
      { email: { contains: search as string, mode: 'insensitive' as const } },
      { subject: { contains: search as string, mode: 'insensitive' as const } },
      { content: { contains: search as string, mode: 'insensitive' as const } },
    ];
  }

  let orderBy: PrismaOrderByInput = { createdAt: 'desc' };
  if (sort === 'created_asc') {
    orderBy = { createdAt: 'asc' };
  } else if (sort === 'created_desc') {
    orderBy = { createdAt: 'desc' };
  }

  const fieldList = fields
    ? (fields as string).split(',')
    : ['id', 'name', 'email', 'subject', 'content', 'isRead', 'createdAt'];

  const select: PrismaSelectInput = {};
  fieldList.forEach((field: string) => {
    select[field] = true;
  });

  const [messages, total] = await Promise.all([
    prisma.message.findMany({ where, select, orderBy, skip, take: limitNum }),
    prisma.message.count({ where }),
  ]);

  logger.info('Messages retrieved successfully', { count: messages.length, total });
  res.status(200).json({
    status: 'success',
    data: messages,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.message.delete({ where: { id: parseInt(id) } });
  logger.info('Message deleted successfully', { messageId: id });
  res.status(200).json({ status: 'success', message: 'Message deleted successfully' });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isRead } = req.body;

  const message = await prisma.message.update({
    where: { id: parseInt(id) },
    data: { isRead: isRead !== undefined ? isRead : true },
  });

  logger.info(`Message marked as ${isRead ? 'read' : 'unread'}`, { messageId: message.id });
  res.status(200).json({ status: 'success', message: `Message marked as ${isRead ? 'read' : 'unread'}`, data: message });
});

export const batchMarkAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ status: 'error', message: 'No IDs provided' });
  }

  await prisma.message.updateMany({
    where: { id: { in: ids } },
    data: { isRead: true },
  });

  logger.info('Messages marked as read', { ids, count: ids.length });
  res.status(200).json({ status: 'success', message: 'Messages marked as read' });
});

export const batchDeleteMessages = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ status: 'error', message: 'No IDs provided' });
  }

  await prisma.message.deleteMany({ where: { id: { in: ids } } });

  logger.info('Messages deleted successfully', { ids, count: ids.length });
  res.status(200).json({ status: 'success', message: 'Messages deleted successfully' });
});
