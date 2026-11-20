import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../index';
import cache from '../utils/cache';
import { asyncHandler } from '../middleware/asyncHandler';
import { parseSkillInput } from '../validations/skillValidation';

const SKILL_CACHE_KEY = 'skills_list';
const CLEAR_SKILL_CACHE = () => cache.del(SKILL_CACHE_KEY);

// Never ship the owner's password hash (getSkillById used `user: true`).
const PUBLIC_USER_SELECT = { select: { id: true, name: true } } as const;

// JSON columns (metrics, stack, linkedProjects) are returned as stored: a JSON string or null.
export const getAllSkills = asyncHandler(async (req: Request, res: Response) => {
  const cachedData = cache.get(SKILL_CACHE_KEY);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  const skills = await prisma.skill.findMany({
    include: { user: PUBLIC_USER_SELECT },
    orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
  });

  cache.set(SKILL_CACHE_KEY, skills);
  res.status(200).json(skills);
});

export const getSkillById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const skill = await prisma.skill.findUnique({
    where: { id: parseInt(id) },
    include: { user: PUBLIC_USER_SELECT },
  });

  if (!skill) {
    return res.status(404).json({ status: 'error', message: 'Skill not found' });
  }

  res.status(200).json(skill);
});

export const createSkill = asyncHandler(async (req: Request, res: Response) => {
  const data = parseSkillInput(req.body ?? {}, 'create') as Prisma.SkillUncheckedCreateInput;
  const skill = await prisma.skill.create({ data });

  CLEAR_SKILL_CACHE();
  res.status(201).json({ status: 'success', message: 'Skill created successfully', data: skill });
});

export const updateSkill = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Partial update: absent = unchanged, '' = null (see contentFieldHelpers).
  const dataToUpdate = parseSkillInput(req.body ?? {}, 'update') as Prisma.SkillUncheckedUpdateInput;

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
