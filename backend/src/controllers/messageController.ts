import { Request, Response } from 'express';
import { prisma } from '../index';
import logger from '../utils/logger';
import { PrismaWhereInput, PrismaOrderByInput, PrismaSelectInput } from '../types/express';

// Create a new message (Public)
export const createMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, content } = req.body;

    if (!name || !email || !subject || !content) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    const message = await prisma.message.create({
      data: {
        name,
        email,
        subject,
        content,
      },
    });

    logger.info('Message created successfully', { messageId: message.id, email });
    res.status(201).json({ status: 'success', message: 'Message sent successfully', data: message });
  } catch (error) {
    logger.error('Failed to create message', { error: error instanceof Error ? error.message : 'Unknown error' });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'error', message: 'Failed to send message', error: errorMessage });
  }
};

// Get all messages (Admin)
export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, isRead, search, sort, fields } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: PrismaWhereInput = {};
    
    // 添加过滤条件
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { subject: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    // 添加排序
    let orderBy: PrismaOrderByInput = { createdAt: 'desc' };
    if (sort === 'created_asc') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'created_desc') {
      orderBy = { createdAt: 'desc' };
    }
    
    // 动态字段选择
    const fieldList = fields ? (fields as string).split(',') : ['id', 'name', 'email', 'subject', 'content', 'isRead', 'createdAt'];
    
    // 构建select对象
    const select: PrismaSelectInput = {};
    fieldList.forEach((field: string) => {
      select[field] = true;
    });
    
    // 使用Promise.all并行查询，提高性能
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        select,
        orderBy,
        skip,
        take: parseInt(limit as string),
      }),
      prisma.message.count({ where }),
    ]);
    
    logger.info('Messages retrieved successfully', { count: messages.length, total });
    res.status(200).json({
      status: 'success',
      data: messages,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    logger.error('Error getting messages', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to get messages' });
  }
};

// Delete a message (Admin)
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.message.delete({
      where: { id: parseInt(id) },
    });
    logger.info('Message deleted successfully', { messageId: id });
    res.status(200).json({ status: 'success', message: 'Message deleted successfully' });
  } catch (error) {
    logger.error('Error deleting message', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to delete message' });
  }
};

// Toggle message read status (Admin)
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;
    
    const message = await prisma.message.update({
      where: { id: parseInt(id) },
      data: { isRead: isRead !== undefined ? isRead : true },
    });
    logger.info(`Message marked as ${isRead ? 'read' : 'unread'}`, { messageId: message.id });
    res.status(200).json({ status: 'success', message: `Message marked as ${isRead ? 'read' : 'unread'}`, data: message });
  } catch (error) {
    logger.error('Error updating message', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to update message' });
  }
};

// Batch mark as read (Admin)
export const batchMarkAsRead = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body; // Expecting array of numbers
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No IDs provided' });
    }

    await prisma.message.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true },
    });

    logger.info('Messages marked as read', { ids, count: ids.length });
    res.status(200).json({ status: 'success', message: 'Messages marked as read' });
  } catch (error) {
    logger.error('Error batch updating messages', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to update messages' });
  }
};

// Batch delete messages (Admin)
export const batchDeleteMessages = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No IDs provided' });
    }

    await prisma.message.deleteMany({
      where: { id: { in: ids } },
    });

    logger.info('Messages deleted successfully', { ids, count: ids.length });
    res.status(200).json({ status: 'success', message: 'Messages deleted successfully' });
  } catch (error) {
    logger.error('Error batch deleting messages', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ status: 'error', message: 'Failed to delete messages' });
  }
};
