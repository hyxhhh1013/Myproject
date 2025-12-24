import { Request, Response } from 'express';
import { prisma } from '../index';

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

    res.status(201).json({ status: 'success', message: 'Message sent successfully', data: message });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send message' });
  }
};

// Get all messages (Admin)
export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
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
    res.status(200).json({ status: 'success', message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete message' });
  }
};

// Mark message as read (Admin)
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const message = await prisma.message.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });
    res.status(200).json({ status: 'success', message: 'Message marked as read', data: message });
  } catch (error) {
    console.error('Error updating message:', error);
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

    res.status(200).json({ status: 'success', message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error batch updating messages:', error);
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

    res.status(200).json({ status: 'success', message: 'Messages deleted successfully' });
  } catch (error) {
    console.error('Error batch deleting messages:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete messages' });
  }
};
