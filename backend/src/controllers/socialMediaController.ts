import { Request, Response } from 'express';
import { prisma } from '../index';

// Get all social media records
export const getAllSocialMedia = async (req: Request, res: Response) => {
  try {
    const socialMedia = await prisma.socialMedia.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json(socialMedia);
  } catch (error) {
    console.error('Error getting social media records:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get social media records' });
  }
};

// Get social media by ID
export const getSocialMediaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const socialMedia = await prisma.socialMedia.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
      },
    });

    if (!socialMedia) {
      return res.status(404).json({ status: 'error', message: 'Social media record not found' });
    }

    res.status(200).json(socialMedia);
  } catch (error) {
    console.error('Error getting social media record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get social media record' });
  }
};

// Create social media record
export const createSocialMedia = async (req: Request, res: Response) => {
  try {
    const { userId, platform, url } = req.body;

    const socialMedia = await prisma.socialMedia.create({
      data: {
        userId,
        platform,
        url,
      },
    });

    res.status(201).json({ status: 'success', message: 'Social media record created successfully', data: socialMedia });
  } catch (error) {
    console.error('Error creating social media record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create social media record' });
  }
};

// Update social media record
export const updateSocialMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { platform, url } = req.body;

    const socialMedia = await prisma.socialMedia.update({
      where: { id: parseInt(id) },
      data: {
        platform,
        url,
      },
    });

    res.status(200).json({ status: 'success', message: 'Social media record updated successfully', data: socialMedia });
  } catch (error) {
    console.error('Error updating social media record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update social media record' });
  }
};

// Delete social media record
export const deleteSocialMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.socialMedia.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ status: 'success', message: 'Social media record deleted successfully' });
  } catch (error) {
    console.error('Error deleting social media record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete social media record' });
  }
};