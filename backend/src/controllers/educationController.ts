import { Request, Response } from 'express';
import { prisma } from '../index';

// Get all education records
export const getAllEducation = async (req: Request, res: Response) => {
  try {
    const education = await prisma.education.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json(education);
  } catch (error) {
    console.error('Error getting education records:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get education records' });
  }
};

// Get education by ID
export const getEducationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const education = await prisma.education.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
      },
    });

    if (!education) {
      return res.status(404).json({ status: 'error', message: 'Education record not found' });
    }

    res.status(200).json(education);
  } catch (error) {
    console.error('Error getting education record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get education record' });
  }
};

// Create education record
export const createEducation = async (req: Request, res: Response) => {
  try {
    const { userId, school, degree, major, startDate, endDate, description } = req.body;

    const education = await prisma.education.create({
      data: {
        userId,
        school,
        degree,
        major,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
      },
    });

    res.status(201).json({ status: 'success', message: 'Education record created successfully', data: education });
  } catch (error) {
    console.error('Error creating education record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create education record' });
  }
};

// Update education record
export const updateEducation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { school, degree, major, startDate, endDate, description } = req.body;

    const education = await prisma.education.update({
      where: { id: parseInt(id) },
      data: {
        school,
        degree,
        major,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
      },
    });

    res.status(200).json({ status: 'success', message: 'Education record updated successfully', data: education });
  } catch (error) {
    console.error('Error updating education record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update education record' });
  }
};

// Delete education record
export const deleteEducation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.education.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ status: 'success', message: 'Education record deleted successfully' });
  } catch (error) {
    console.error('Error deleting education record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete education record' });
  }
};