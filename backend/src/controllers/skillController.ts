import { Request, Response } from 'express';
import { prisma } from '../index';
import cache from '../utils/cache';
import { asyncHandler } from '../middleware/asyncHandler';

const SKILL_CACHE_KEY = 'skills_list';
const CLEAR_SKILL_CACHE = () => cache.del(SKILL_CACHE_KEY);

export const getAllSkills = asyncHandler(async (req: Request, res: Response) => {
  const cachedData = cache.get(SKILL_CACHE_KEY);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  const skills = await prisma.skill.findMany({
    include: { user: { select: { id: true, name: true } } },
    orderBy: { orderIndex: 'asc' },
  });

  cache.set(SKILL_CACHE_KEY, skills);
  res.status(200).json(skills);
});

export const getSkillById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const skill = await prisma.skill.findUnique({
    where: { id: parseInt(id) },
    include: { user: true },
  });

  if (!skill) {
    return res.status(404).json({ status: 'error', message: 'Skill not found' });
  }

  res.status(200).json(skill);
});

export const createSkill = asyncHandler(async (req: Request, res: Response) => {
  const { userId, name, level, category, isVisible, orderIndex } = req.body;

  const skill = await prisma.skill.create({
    data: {
      userId: userId || 1,
      name,
      level,
      category,
      isVisible: isVisible !== undefined ? isVisible : true,
      orderIndex: orderIndex || 0,
    },
  });

  CLEAR_SKILL_CACHE();
  res.status(201).json({ status: 'success', message: 'Skill created successfully', data: skill });
});

export const updateSkill = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, level, category, isVisible, orderIndex } = req.body;

  const dataToUpdate: any = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (level !== undefined) dataToUpdate.level = level;
  if (category !== undefined) dataToUpdate.category = category;
  if (isVisible !== undefined) dataToUpdate.isVisible = isVisible;
  if (orderIndex !== undefined) dataToUpdate.orderIndex = orderIndex;

  const skill = await prisma.skill.update({
    where: { id: parseInt(id) },
    data: dataToUpdate,
  });

  CLEAR_SKILL_CACHE();
  res.status(200).json({ status: 'success', message: 'Skill updated successfully', data: skill });
});

export const deleteSkill = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.skill.delete({ where: { id: parseInt(id) } });

  CLEAR_SKILL_CACHE();
  res.status(200).json({ status: 'success', message: 'Skill deleted successfully' });
});
