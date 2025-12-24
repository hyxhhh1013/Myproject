import { Request, Response } from 'express';
import { prisma } from '../index';

// Get all experience records
export const getAllExperience = async (req: Request, res: Response) => {
  try {
    const experience = await prisma.experience.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json(experience);
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

    res.status(200).json(experience);
  } catch (error) {
    console.error('Error getting experience record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get experience record' });
  }
};

// Create experience record
export const createExperience = async (req: Request, res: Response) => {
  try {
    const { userId, company, position, startDate, endDate, description } = req.body;

    const experience = await prisma.experience.create({
      data: {
        userId,
        company,
        position,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
      },
    });

    res.status(201).json({ status: 'success', message: 'Experience record created successfully', data: experience });
  } catch (error) {
    console.error('Error creating experience record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create experience record' });
  }
};

// Update experience record
export const updateExperience = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { company, position, startDate, endDate, description } = req.body;

    const experience = await prisma.experience.update({
      where: { id: parseInt(id) },
      data: {
        company,
        position,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
      },
    });

    res.status(200).json({ status: 'success', message: 'Experience record updated successfully', data: experience });
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