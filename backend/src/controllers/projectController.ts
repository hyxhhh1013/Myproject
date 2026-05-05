import { Request, Response } from 'express';
import { prisma } from '../index';

// Get all projects
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get projects' });
  }
};

// Get project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
      },
    });

    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get project' });
  }
};

// Create project
export const createProject = async (req: Request, res: Response) => {
  try {
    const { userId, title, description, startDate, endDate, technologies, githubUrl, demoUrl } = req.body;

    const project = await prisma.project.create({
      data: {
        userId,
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        technologies,
        githubUrl,
        demoUrl,
      },
    });

    res.status(201).json({ status: 'success', message: 'Project created successfully', data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create project' });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, technologies, githubUrl, demoUrl } = req.body;

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        technologies,
        githubUrl,
        demoUrl,
      },
    });

    res.status(200).json({ status: 'success', message: 'Project updated successfully', data: project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update project' });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ status: 'success', message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete project' });
  }
};