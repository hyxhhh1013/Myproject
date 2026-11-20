import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  InputMode,
  RequestBody,
  VARCHAR_MAX,
  badRequest,
  compact,
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
 * `technologies` (JSON string[], NOT NULL): a real array, a JSON array string, or a comma list
 * ("React, Vite"). Empty -> '[]'. The old update path split JSON strings on commas.
 */
export function readTechnologies(body: RequestBody, mode: InputMode): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(body, 'technologies') || body.technologies === undefined) {
    return mode === 'create' ? '[]' : undefined;
  }
  let raw = body.technologies;
  if (raw === null || (typeof raw === 'string' && raw.trim() === '')) return '[]';
  if (typeof raw === 'string') {
    const text = raw.trim();
    if (text.startsWith('[')) {
      try {
        raw = JSON.parse(text);
      } catch {
        throw badRequest('technologies must be valid JSON or a comma-separated list');
      }
    } else {
      raw = text.split(',');
    }
  }
  const result = stringListSchema.safeParse(raw);
  if (!result.success) throw badRequest('technologies must be an array of strings');
  return JSON.stringify(result.data);
}

/**
 * Every scalar/text/JSON column of Project that the admin can send (images are handled by the
 * controller because they come from uploads + `existingImages`).
 * create: returns the full create payload with defaults; update: only the fields present.
 */
export function parseProjectInput(body: RequestBody, mode: InputMode) {
  const data = {
    title: readRequiredText(body, 'title', mode, { max: VARCHAR_MAX }),
    titleEn: readText(body, 'titleEn', mode),
    badge: readText(body, 'badge', mode),
    badgeEn: readText(body, 'badgeEn', mode),
    description: readRequiredText(body, 'description', mode),
    descriptionEn: readText(body, 'descriptionEn', mode),
    intro: readText(body, 'intro', mode),
    startDate: readDate(body, 'startDate', mode, { nullable: false }),
    endDate: readDate(body, 'endDate', mode, { nullable: true }),
    technologies: readTechnologies(body, mode),
    // One item per line; an array is joined with '\n'.
    responsibilities: readText(body, 'responsibilities', mode, { lines: true }),
    responsibilitiesEn: readText(body, 'responsibilitiesEn', mode, { lines: true }),
    challengesProblem: readText(body, 'challengesProblem', mode),
    challengesProblemEn: readText(body, 'challengesProblemEn', mode),
    challengesSolution: readText(body, 'challengesSolution', mode),
    challengesSolutionEn: readText(body, 'challengesSolutionEn', mode),
    // URLs may be long data: URLs (demo uploads), so no length cap beyond the column.
    githubUrl: readText(body, 'githubUrl', mode, { max: Number.MAX_SAFE_INTEGER }),
    demoUrl: readText(body, 'demoUrl', mode, { max: Number.MAX_SAFE_INTEGER }),
    metrics: readJson(body, 'metrics', metricListSchema, mode),
    orderIndex: readInt(body, 'orderIndex', mode, 0),
    isVisible: readBool(body, 'isVisible', mode, true),
    isFeatured: readBool(body, 'isFeatured', mode, false),
  };

  if (mode === 'create') {
    return {
      ...data,
      userId: readInt(body, 'userId', 'create', 1) || 1,
      startDate: data.startDate ?? new Date(),
    } as Omit<Prisma.ProjectUncheckedCreateInput, 'images' | 'imageUrl'>;
  }
  return compact(data) as Prisma.ProjectUncheckedUpdateInput;
}

// 项目ID验证模式
export const projectIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Project ID must be a number'),
});

export type ProjectInput = ReturnType<typeof parseProjectInput>;
