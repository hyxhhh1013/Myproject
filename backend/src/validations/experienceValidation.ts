import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  InputMode,
  RequestBody,
  VARCHAR_MAX,
  badRequest,
  compact,
  highlightListSchema,
  metricListSchema,
  readBool,
  readDate,
  readInt,
  readJson,
  readRequiredText,
  readText,
  stringListSchema,
} from './contentFieldHelpers';

/**
 * Every scalar/text/JSON column of Experience that the admin can send (images are handled by the
 * controller: uploads + `existingImages`).
 * create: full payload with defaults; update: only the fields present (absent = unchanged,
 * '' = null).
 */
export function parseExperienceInput(body: RequestBody, mode: InputMode) {
  const data = {
    company: readRequiredText(body, 'company', mode, { max: VARCHAR_MAX }),
    companyEn: readText(body, 'companyEn', mode),
    position: readRequiredText(body, 'position', mode, { max: VARCHAR_MAX }),
    positionEn: readText(body, 'positionEn', mode),
    startDate: readDate(body, 'startDate', mode, { nullable: false }),
    // null = ongoing ("至今" / "PRESENT")
    endDate: readDate(body, 'endDate', mode, { nullable: true }),
    description: readText(body, 'description', mode),
    descriptionEn: readText(body, 'descriptionEn', mode),
    tags: readJson(body, 'tags', stringListSchema, mode),
    linkUrl: readText(body, 'linkUrl', mode),
    linkLabel: readText(body, 'linkLabel', mode, { max: VARCHAR_MAX }),
    highlights: readJson(body, 'highlights', highlightListSchema, mode),
    metrics: readJson(body, 'metrics', metricListSchema, mode),
    isVisible: readBool(body, 'isVisible', mode, true),
    orderIndex: readInt(body, 'orderIndex', mode, 0),
  };

  if (mode === 'create') {
    if (!data.startDate) throw badRequest('startDate is required');
    return {
      ...data,
      userId: readInt(body, 'userId', 'create', 1) || 1,
    } as Omit<Prisma.ExperienceUncheckedCreateInput, 'images'>;
  }
  return compact(data) as Prisma.ExperienceUncheckedUpdateInput;
}

// 工作经历ID验证模式
export const experienceIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Experience ID must be a number'),
});

export type ExperienceInput = ReturnType<typeof parseExperienceInput>;
