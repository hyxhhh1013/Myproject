import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';

/**
 * Shared request-body readers for the homepage content models (project / experience / skill).
 *
 * Admin forms send FormData (every value is a string) or JSON (real arrays / booleans / numbers),
 * so each reader accepts both. Semantics, per mode:
 *   - create: field absent -> column default (null for nullable columns)
 *   - update: field absent -> undefined (Prisma leaves the column unchanged)
 *   - empty string (or null) on a nullable column -> null (clears it)
 * JSON columns are TEXT holding a JSON string; input may be a JSON string or a real array, and is
 * stored re-serialised (normalised). Invalid JSON or a wrong shape -> 400.
 */

export type InputMode = 'create' | 'update';
export type RequestBody = Record<string, unknown>;

/** VARCHAR(191) columns (Prisma `String` without `@db.Text` on MySQL). */
export const VARCHAR_MAX = 191;
/** TEXT columns hold 65,535 bytes; keep well under that for multi-byte text. */
export const TEXT_MAX = 20000;

export const badRequest = (message: string) => new AppError(message, 400);

const present = (body: RequestBody, key: string) =>
  Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined;

const isBlank = (raw: unknown) => raw === null || (typeof raw === 'string' && raw.trim() === '');

/** Nullable text column. `lines: true` also accepts an array and joins it one item per line. */
export function readText(
  body: RequestBody,
  key: string,
  mode: InputMode,
  opts: { max?: number; lines?: boolean } = {},
): string | null | undefined {
  if (!present(body, key)) return mode === 'create' ? null : undefined;
  const raw = body[key];
  if (isBlank(raw)) return null;

  let value: string;
  if (Array.isArray(raw) && opts.lines) {
    value = raw.map((item) => String(item ?? '').trim()).filter(Boolean).join('\n');
    if (!value) return null;
  } else if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    value = String(raw);
  } else {
    throw badRequest(`${key} must be a string`);
  }

  const max = opts.max ?? TEXT_MAX;
  if (value.length > max) throw badRequest(`${key} must be at most ${max} characters long`);
  return value;
}

/** Non-null text column: required on create, may be omitted on update, never empty. */
export function readRequiredText(
  body: RequestBody,
  key: string,
  mode: InputMode,
  opts: { max?: number } = {},
): string | undefined {
  if (!present(body, key)) {
    if (mode === 'create') throw badRequest(`${key} is required`);
    return undefined;
  }
  const raw = body[key];
  if (typeof raw !== 'string' && typeof raw !== 'number') throw badRequest(`${key} must be a string`);
  const value = String(raw);
  if (value.trim() === '') throw badRequest(`${key} cannot be empty`);
  const max = opts.max ?? TEXT_MAX;
  if (value.length > max) throw badRequest(`${key} must be at most ${max} characters long`);
  return value;
}

/** JSON column: JSON string or real value, validated against `schema`, stored re-serialised. */
export function readJson<T>(
  body: RequestBody,
  key: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  mode: InputMode,
): string | null | undefined {
  if (!present(body, key)) return mode === 'create' ? null : undefined;
  let raw = body[key];
  if (isBlank(raw)) return null;

  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      throw badRequest(`${key} must be valid JSON`);
    }
    if (raw === null) return null;
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue.path.length > 0 ? `${key}[${issue.path.join('][')}]` : key;
    throw badRequest(`${where}: ${issue.message}`);
  }
  return JSON.stringify(result.data);
}

/** Integer column. Empty value on update is ignored (the old code turned it into NaN). */
export function readInt(
  body: RequestBody,
  key: string,
  mode: InputMode,
  fallback?: number,
): number | undefined {
  if (!present(body, key) || isBlank(body[key])) return mode === 'create' ? fallback : undefined;
  const raw = body[key];
  const value =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'string' && /^-?\d+$/.test(raw.trim())
        ? parseInt(raw.trim(), 10)
        : NaN;
  if (!Number.isInteger(value)) throw badRequest(`${key} must be an integer`);
  return value;
}

/** Boolean column: true/false, 'true'/'false', '1'/'0', 'on'/'off'. */
export function readBool(
  body: RequestBody,
  key: string,
  mode: InputMode,
  fallback?: boolean,
): boolean | undefined {
  if (!present(body, key) || isBlank(body[key])) return mode === 'create' ? fallback : undefined;
  const raw = body[key];
  if (raw === true || raw === 1 || raw === 'true' || raw === '1' || raw === 'on') return true;
  if (raw === false || raw === 0 || raw === 'false' || raw === '0' || raw === 'off') return false;
  throw badRequest(`${key} must be a boolean`);
}

/**
 * Date column. Nullable dates: '' / null / 'null' clear it. Required dates: an empty value is
 * ignored on update (old behaviour) and left to the caller's default on create.
 */
export function readDate(
  body: RequestBody,
  key: string,
  mode: InputMode,
  opts: { nullable: boolean },
): Date | null | undefined {
  if (!present(body, key)) return mode === 'create' && opts.nullable ? null : undefined;
  const raw = body[key];
  if (isBlank(raw) || raw === 'null') {
    if (opts.nullable) return null;
    return undefined;
  }
  if (typeof raw !== 'string' && typeof raw !== 'number' && !(raw instanceof Date)) {
    throw badRequest(`${key} must be a valid date`);
  }
  const value = new Date(raw);
  if (Number.isNaN(value.getTime())) throw badRequest(`${key} must be a valid date`);
  return value;
}

/** A JSON string[] column (images, existingImages, …): JSON string or real array; invalid -> 400. */
export function parseStringArray(raw: unknown, key: string): string[] {
  if (raw === undefined || isBlank(raw)) return [];
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      throw badRequest(`${key} must be valid JSON`);
    }
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw badRequest(`${key} must be an array of strings`);
  }
  return value;
}

/** Drop keys whose value is undefined, so Prisma never sees them. */
export function compact<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as Partial<T>;
}

// ---- JSON shapes (contract: content-contract.md) -------------------------------------------

const scalar = z.union([z.string(), z.number()]).transform((value) => String(value));

/** string[]: numbers are stringified, items trimmed, empty items dropped. */
export const stringListSchema = z
  .array(z.union([z.string(), z.number()]), { invalid_type_error: 'must be an array of strings' })
  .transform((items) => items.map((item) => String(item).trim()).filter(Boolean));

/** [{ value, label, labelEn }] — stat strips. Extra keys are kept. */
export const metricListSchema = z.array(
  z
    .object({ value: scalar.optional(), label: scalar.optional(), labelEn: scalar.optional() })
    .passthrough(),
  { invalid_type_error: 'must be an array of { value, label, labelEn }' },
);

/** [{ code, title, titleEn, desc, descEn }] — featured residency modules. */
export const highlightListSchema = z.array(
  z
    .object({
      code: scalar.optional(),
      title: scalar.optional(),
      titleEn: scalar.optional(),
      desc: scalar.optional(),
      descEn: scalar.optional(),
    })
    .passthrough(),
  { invalid_type_error: 'must be an array of { code, title, titleEn, desc, descEn }' },
);

/** [{ zh, en }] — skill → project links. */
export const linkedProjectListSchema = z.array(
  z.object({ zh: scalar.optional(), en: scalar.optional() }).passthrough(),
  { invalid_type_error: 'must be an array of { zh, en }' },
);
