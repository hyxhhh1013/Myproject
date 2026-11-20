import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  InputMode,
  RequestBody,
  VARCHAR_MAX,
  compact,
  linkedProjectListSchema,
  metricListSchema,
  readBool,
  readInt,
  readJson,
  readRequiredText,
  readText,
  stringListSchema,
} from './contentFieldHelpers';

/** Homepage capability cards are the rows with this category; legacy rows keep a percentage `level`. */
export const CAPABILITY_CATEGORY = 'capability';

/**
 * Every column of Skill that the admin can send, from JSON or FormData.
 * create: full payload with defaults; update: only the fields present (absent = unchanged,
 * '' = null).
 */
export function parseSkillInput(body: RequestBody, mode: InputMode) {
  const data = {
    name: readRequiredText(body, 'name', mode, { max: VARCHAR_MAX }),
    nameEn: readText(body, 'nameEn', mode, { max: VARCHAR_MAX }),
    shortLabel: readText(body, 'shortLabel', mode, { max: VARCHAR_MAX }),
    // Legacy rows store 0–100 here, so no 1–5 range check.
    level: readInt(body, 'level', mode, 1),
    category: readRequiredText(body, 'category', mode, { max: VARCHAR_MAX }),
    badge: readText(body, 'badge', mode, { max: VARCHAR_MAX }),
    badgeEn: readText(body, 'badgeEn', mode, { max: VARCHAR_MAX }),
    metrics: readJson(body, 'metrics', metricListSchema, mode),
    stack: readJson(body, 'stack', stringListSchema, mode),
    linkedProjects: readJson(body, 'linkedProjects', linkedProjectListSchema, mode),
    highlight: readText(body, 'highlight', mode),
    highlightEn: readText(body, 'highlightEn', mode),
    isVisible: readBool(body, 'isVisible', mode, true),
    orderIndex: readInt(body, 'orderIndex', mode, 0),
  };

  if (mode === 'create') {
    return {
      ...data,
      userId: readInt(body, 'userId', 'create', 1) || 1,
    } as Prisma.SkillUncheckedCreateInput;
  }
  return compact(data) as Prisma.SkillUncheckedUpdateInput;
}

// 技能ID验证模式
export const skillIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Skill ID must be a number'),
});

export type SkillInput = ReturnType<typeof parseSkillInput>;
