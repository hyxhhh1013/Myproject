import { Request, Response } from 'express';
import { prisma } from '../index';

// Get all skills
export const getAllSkills = async (req: Request, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json(skills);
  } catch (error) {
    console.error('Error getting skills:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get skills' });
  }
};

// Get skill by ID
export const getSkillById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const skill = await prisma.skill.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
      },
    });

    if (!skill) {
      return res.status(404).json({ status: 'error', message: 'Skill not found' });
    }

    res.status(200).json(skill);
  } catch (error) {
    console.error('Error getting skill:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get skill' });
  }
};

// Create skill
export const createSkill = async (req: Request, res: Response) => {
  try {
    const { userId, name, level, category } = req.body;

    const skill = await prisma.skill.create({
      data: {
        userId,
        name,
        level,
        category,
      },
    });

    res.status(201).json({ status: 'success', message: 'Skill created successfully', data: skill });
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create skill' });
  }
};

// Update skill
export const updateSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, level, category } = req.body;

    const skill = await prisma.skill.update({
      where: { id: parseInt(id) },
      data: {
        name,
        level,
        category,
      },
    });

    res.status(200).json({ status: 'success', message: 'Skill updated successfully', data: skill });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update skill' });
  }
};

// Delete skill
export const deleteSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.skill.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ status: 'success', message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete skill' });
  }
};