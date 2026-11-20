/**
 * One-off, idempotent: copy the CURRENT homepage content (scripts/homepage_content.data.ts) into
 * the DB so the homepage can render DB rows without changing what visitors see.
 *
 *   npm run sync-homepage              # DRY RUN: print every planned create / update / hide
 *   npm run sync-homepage -- --apply   # write everything inside one transaction
 *
 * Never deletes anything: rows that match no homepage entry are only hidden (isVisible=false).
 * Running it again after --apply prints "no changes". See scripts/README-sync.md for prod steps.
 */
import dotenv from 'dotenv';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  HOMEPAGE_EXPERIENCES,
  HOMEPAGE_GITHUB,
  HOMEPAGE_PROJECTS,
  HOMEPAGE_SKILLS,
  HomepageProject,
} from './homepage_content.data';

dotenv.config(); // never overrides a DATABASE_URL passed inline

const APPLY = process.argv.includes('--apply');
const OWNER_ID = 1;
const CAPABILITY = 'capability';

/**
 * Projects.tsx today: `images = dbImages.length > 0 ? dbImages : default` for EVERY card, the
 * flagship included (only the flagship's demo link ignores the DB). Set to false to force the
 * flagship's default cover instead.
 */
const FLAGSHIP_KEEPS_DB_IMAGES = true;

type Db = PrismaClient | Prisma.TransactionClient;
type Model = 'project' | 'experience' | 'skill' | 'socialMedia';
type Values = Record<string, unknown>;
type Change = { from: unknown; to: unknown };

type Op =
  | { kind: 'create'; model: Model; label: string; data: Values }
  | { kind: 'update'; model: Model; id: number; label: string; changes: Record<string, Change> }
  | { kind: 'hide'; model: Model; id: number; label: string };

// ---- helpers -----------------------------------------------------------------------------------

const same = (a: unknown, b: unknown) => {
  if (a instanceof Date || b instanceof Date) {
    const ta = a instanceof Date ? a.getTime() : a;
    const tb = b instanceof Date ? b.getTime() : b;
    return ta === tb;
  }
  return (a ?? null) === (b ?? null);
};

const diff = (current: Values, desired: Values): Record<string, Change> => {
  const changes: Record<string, Change> = {};
  for (const [key, to] of Object.entries(desired)) {
    if (!same(current[key], to)) changes[key] = { from: current[key] ?? null, to };
  }
  return changes;
};

const json = (value: unknown) => (value == null ? null : JSON.stringify(value));

const utcMonth = (year: string, month: string) => new Date(Date.UTC(Number(year), Number(month) - 1, 1));

/** '2026.06 — 至今' -> [2026-06-01, null]; '2025.07 — 2025.08' -> [2025-07-01, 2025-08-01] */
const parseDateLabel = (label: string): [Date, Date | null] => {
  const m = label.match(/^(\d{4})\.(\d{1,2})\s*[—–-]+\s*(?:(至今)|(\d{4})\.(\d{1,2}))$/);
  if (!m) throw new Error(`Cannot parse date label "${label}"`);
  return [utcMonth(m[1], m[2]), m[3] ? null : utcMonth(m[4], m[5])];
};

/** The image list the homepage resolves from a DB row today (Projects.tsx merge). */
const dbImagesOf = (row: { images: string | null; imageUrl: string | null }): string[] => {
  if (typeof row.images === 'string' && row.images.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(row.images);
      return Array.isArray(parsed) ? parsed.filter((img) => typeof img === 'string' && img) : [];
    } catch {
      return [];
    }
  }
  return row.imageUrl ? [row.imageUrl] : [];
};

const projectImages = (def: HomepageProject, row?: { images: string | null; imageUrl: string | null }) => {
  if (!row || (def.flagship && !FLAGSHIP_KEEPS_DB_IMAGES)) return def.images;
  const fromDb = dbImagesOf(row);
  return fromDb.length > 0 ? fromDb : def.images;
};

// ---- plan --------------------------------------------------------------------------------------

async function planProjects(db: Db): Promise<Op[]> {
  const ops: Op[] = [];
  const rows = await db.project.findMany({ orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }] });
  const claimed = new Set<number>();

  HOMEPAGE_PROJECTS.forEach((def, index) => {
    const row = rows.find(
      (r) => !claimed.has(r.id) && def.match.some((kw) => r.title.toLowerCase().includes(kw.toLowerCase())),
    );
    if (row) claimed.add(row.id);

    const images = projectImages(def, row);
    const desired: Values = {
      title: def.title,
      titleEn: def.titleEn,
      badge: def.badge,
      badgeEn: def.badgeEn,
      description: def.description,
      descriptionEn: def.descriptionEn,
      technologies: json(def.technologies),
      responsibilities: def.responsibilities.join('\n'),
      responsibilitiesEn: def.responsibilitiesEn.join('\n'),
      challengesProblem: def.challengesProblem,
      challengesProblemEn: def.challengesProblemEn,
      challengesSolution: def.challengesSolution,
      challengesSolutionEn: def.challengesSolutionEn,
      metrics: json(def.metrics),
      githubUrl: row?.githubUrl || def.githubUrl || null,
      demoUrl: def.flagship ? def.demoUrl : row?.demoUrl || def.demoUrl || null,
      images: json(images),
      imageUrl: images[0] ?? null,
      orderIndex: index,
      isVisible: true,
    };

    if (!row) {
      ops.push({
        kind: 'create',
        model: 'project',
        label: `${def.key} "${def.title}"`,
        data: { ...desired, userId: OWNER_ID, startDate: new Date(`${def.createStartDate}T00:00:00.000Z`) },
      });
      return;
    }
    const changes = diff(row, desired);
    if (Object.keys(changes).length > 0) {
      ops.push({ kind: 'update', model: 'project', id: row.id, label: `"${row.title}" -> ${def.key}`, changes });
    }
  });

  for (const row of rows) {
    if (!claimed.has(row.id) && row.isVisible) {
      ops.push({ kind: 'hide', model: 'project', id: row.id, label: `"${row.title}" (no homepage match)` });
    }
  }
  return ops;
}

async function planExperience(db: Db): Promise<Op[]> {
  const ops: Op[] = [];
  const rows = await db.experience.findMany({ orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }] });
  const claimed = new Set<number>();

  HOMEPAGE_EXPERIENCES.forEach((def, index) => {
    // Experience.tsx's rule: either company contains the other's first 4 characters.
    const row = rows.find(
      (r) =>
        !claimed.has(r.id) &&
        !!r.company &&
        (r.company.includes(def.company.slice(0, 4)) || def.company.includes(r.company.slice(0, 4))),
    );
    if (row) claimed.add(row.id);

    const [startDate, endDate] = parseDateLabel(def.dateLabel);
    const desired: Values = {
      position: def.position,
      positionEn: def.positionEn,
      company: def.company,
      companyEn: def.companyEn,
      startDate,
      endDate,
      description: def.description,
      descriptionEn: def.descriptionEn,
      tags: json(def.tags),
      linkUrl: def.linkUrl,
      linkLabel: def.linkLabel,
      highlights: json(def.highlights),
      metrics: json(def.metrics),
      orderIndex: index,
      isVisible: true,
    };

    if (!row) {
      ops.push({
        kind: 'create',
        model: 'experience',
        label: `"${def.company}"`,
        data: { ...desired, userId: OWNER_ID, images: '[]' },
      });
      return;
    }
    // images are kept as they are in the DB.
    const changes = diff(row, desired);
    if (Object.keys(changes).length > 0) {
      ops.push({ kind: 'update', model: 'experience', id: row.id, label: `"${row.company}" -> "${def.company}"`, changes });
    }
  });

  for (const row of rows) {
    if (!claimed.has(row.id) && row.isVisible) {
      ops.push({ kind: 'hide', model: 'experience', id: row.id, label: `"${row.company}" (no homepage match)` });
    }
  }
  return ops;
}

async function planSkills(db: Db): Promise<Op[]> {
  const ops: Op[] = [];
  const rows = await db.skill.findMany({ orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }] });
  const claimed = new Set<number>();

  HOMEPAGE_SKILLS.forEach((def, index) => {
    const row = rows.find((r) => !claimed.has(r.id) && r.category === CAPABILITY && r.name === def.name);
    if (row) claimed.add(row.id);

    const desired: Values = {
      name: def.name,
      nameEn: def.nameEn,
      shortLabel: def.shortLabel,
      badge: def.badge,
      badgeEn: def.badgeEn,
      metrics: json(def.metrics),
      stack: json(def.stack),
      linkedProjects: json(def.linkedProjects),
      highlight: def.highlight,
      highlightEn: def.highlightEn,
      category: CAPABILITY,
      orderIndex: index,
      isVisible: true,
    };

    if (!row) {
      ops.push({ kind: 'create', model: 'skill', label: `"${def.name}"`, data: { ...desired, userId: OWNER_ID, level: 1 } });
      return;
    }
    const changes = diff(row, desired);
    if (Object.keys(changes).length > 0) {
      ops.push({ kind: 'update', model: 'skill', id: row.id, label: `"${row.name}"`, changes });
    }
  });

  for (const row of rows) {
    if (row.category !== CAPABILITY && row.isVisible) {
      ops.push({ kind: 'hide', model: 'skill', id: row.id, label: `"${row.name}" [${row.category}] (legacy skill)` });
    }
  }
  return ops;
}

async function planContacts(db: Db): Promise<Op[]> {
  const socials = await db.socialMedia.findMany({ where: { userId: OWNER_ID }, orderBy: { id: 'asc' } });
  const github = socials.find((s) => /github/i.test(s.platform));
  if (!github) {
    return [{ kind: 'create', model: 'socialMedia', label: `user ${OWNER_ID} ${HOMEPAGE_GITHUB.platform}`, data: { ...HOMEPAGE_GITHUB, userId: OWNER_ID } }];
  }
  const changes = diff(github, { ...HOMEPAGE_GITHUB });
  return Object.keys(changes).length > 0
    ? [{ kind: 'update', model: 'socialMedia', id: github.id, label: `user ${OWNER_ID} ${github.platform}`, changes }]
    : [];
}

async function buildPlan(db: Db): Promise<Op[]> {
  const owner = await db.user.findUnique({ where: { id: OWNER_ID }, select: { id: true } });
  if (!owner) throw new Error(`User ${OWNER_ID} does not exist; refusing to sync.`);
  return [
    ...(await planProjects(db)),
    ...(await planExperience(db)),
    ...(await planSkills(db)),
    ...(await planContacts(db)),
  ];
}

// ---- execute -----------------------------------------------------------------------------------

async function write(db: Db, model: Model, id: number | null, data: Values) {
  switch (model) {
    case 'project':
      return id === null
        ? db.project.create({ data: data as Prisma.ProjectUncheckedCreateInput })
        : db.project.update({ where: { id }, data: data as Prisma.ProjectUncheckedUpdateInput });
    case 'experience':
      return id === null
        ? db.experience.create({ data: data as Prisma.ExperienceUncheckedCreateInput })
        : db.experience.update({ where: { id }, data: data as Prisma.ExperienceUncheckedUpdateInput });
    case 'skill':
      return id === null
        ? db.skill.create({ data: data as Prisma.SkillUncheckedCreateInput })
        : db.skill.update({ where: { id }, data: data as Prisma.SkillUncheckedUpdateInput });
    case 'socialMedia':
      return id === null
        ? db.socialMedia.create({ data: data as Prisma.SocialMediaUncheckedCreateInput })
        : db.socialMedia.update({ where: { id }, data: data as Prisma.SocialMediaUncheckedUpdateInput });
  }
}

async function execute(db: Db, op: Op) {
  if (op.kind === 'create') return write(db, op.model, null, op.data);
  if (op.kind === 'hide') return write(db, op.model, op.id, { isVisible: false });
  const data = Object.fromEntries(Object.entries(op.changes).map(([key, change]) => [key, change.to]));
  return write(db, op.model, op.id, data);
}

// ---- output ------------------------------------------------------------------------------------

const show = (value: unknown) => {
  if (value === null || value === undefined) return 'null';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value !== 'string') return String(value);
  const flat = value.replace(/\s*\n\s*/g, ' ⏎ ');
  return JSON.stringify(flat.length > 70 ? `${flat.slice(0, 67)}...` : flat);
};

function printPlan(ops: Op[]) {
  if (ops.length === 0) {
    console.log('no changes — the DB already matches the homepage content.');
    return;
  }
  for (const op of ops) {
    if (op.kind === 'create') {
      console.log(`+ CREATE ${op.model} ${op.label}`);
      for (const [key, value] of Object.entries(op.data)) console.log(`      ${key}: ${show(value)}`);
    } else if (op.kind === 'hide') {
      console.log(`- HIDE   ${op.model} #${op.id} ${op.label}: isVisible true -> false`);
    } else {
      console.log(`~ UPDATE ${op.model} #${op.id} ${op.label}`);
      for (const [key, change] of Object.entries(op.changes)) {
        console.log(`      ${key}: ${show(change.from)} -> ${show(change.to)}`);
      }
    }
  }
  const count = (kind: Op['kind']) => ops.filter((op) => op.kind === kind).length;
  console.log(`\n${ops.length} change(s): ${count('create')} create, ${count('update')} update, ${count('hide')} hide.`);
}

const describeTarget = () => {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error('DATABASE_URL is not set.');
  try {
    const url = new URL(raw);
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}${url.pathname}`;
  } catch {
    return '(unparseable DATABASE_URL)';
  }
};

async function main() {
  console.log(`Target DB: ${describeTarget()}`);
  console.log(APPLY ? 'Mode: APPLY (one transaction)\n' : 'Mode: DRY RUN — nothing is written; pass --apply to write\n');

  const prisma = new PrismaClient();
  try {
    if (!APPLY) {
      printPlan(await buildPlan(prisma));
      return;
    }

    const applied = await prisma.$transaction(
      async (tx) => {
        const ops = await buildPlan(tx);
        printPlan(ops);
        for (const op of ops) await execute(tx, op);
        return ops.length;
      },
      { maxWait: 10_000, timeout: 120_000 },
    );
    if (applied === 0) return;

    console.log(`\nCommitted ${applied} change(s). Re-checking…`);
    const remaining = await buildPlan(prisma);
    if (remaining.length > 0) {
      printPlan(remaining);
      throw new Error('Second pass still plans changes — please report this.');
    }
    console.log('Second pass: no changes. Restart the backend (or wait ~1h) so its in-memory list caches refresh.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(`\nFAILED${APPLY ? ' (transaction rolled back, nothing written)' : ''}:`, error instanceof Error ? error.message : error);
  process.exit(1);
});
