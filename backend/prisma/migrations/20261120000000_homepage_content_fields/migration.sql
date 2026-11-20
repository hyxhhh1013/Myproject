-- Homepage content fields (2026-11): nullable columns only, no data changes.
--
-- !! Do NOT apply this with `prisma migrate deploy` / `migrate dev` / `migrate reset`.
-- The migration history in this folder is PostgreSQL (migration_lock.toml = postgresql) while the
-- datasource is MySQL, so every `prisma migrate` command fails with P3019, and the production
-- schema was built with `prisma db push` (it has tables that no migration creates). `migrate dev`
-- would offer to RESET (wipe) the database to "fix" the drift.
--
-- Apply exactly this file instead (see backend/scripts/README-sync.md):
--   npx prisma db execute --file prisma/migrations/20261120000000_homepage_content_fields/migration.sql --schema prisma/schema.prisma
-- Each ALTER TABLE is atomic; re-running fails with "Duplicate column name" and changes nothing.
-- Generated with `prisma migrate diff` (old-shape DB -> current schema.prisma), MySQL 8.

-- AlterTable
ALTER TABLE `experience` ADD COLUMN `company_en` TEXT NULL,
    ADD COLUMN `description_en` TEXT NULL,
    ADD COLUMN `highlights` TEXT NULL,
    ADD COLUMN `link_label` VARCHAR(191) NULL,
    ADD COLUMN `link_url` TEXT NULL,
    ADD COLUMN `metrics` TEXT NULL,
    ADD COLUMN `position_en` TEXT NULL,
    ADD COLUMN `tags` TEXT NULL;

-- AlterTable
ALTER TABLE `project` ADD COLUMN `badge` TEXT NULL,
    ADD COLUMN `badge_en` TEXT NULL,
    ADD COLUMN `challenges_problem_en` TEXT NULL,
    ADD COLUMN `challenges_solution_en` TEXT NULL,
    ADD COLUMN `description_en` TEXT NULL,
    ADD COLUMN `metrics` TEXT NULL,
    ADD COLUMN `responsibilities_en` TEXT NULL,
    ADD COLUMN `title_en` TEXT NULL;

-- AlterTable
ALTER TABLE `skill` ADD COLUMN `badge` VARCHAR(191) NULL,
    ADD COLUMN `badge_en` VARCHAR(191) NULL,
    ADD COLUMN `highlight` TEXT NULL,
    ADD COLUMN `highlight_en` TEXT NULL,
    ADD COLUMN `linked_projects` TEXT NULL,
    ADD COLUMN `metrics` TEXT NULL,
    ADD COLUMN `name_en` VARCHAR(191) NULL,
    ADD COLUMN `short_label` VARCHAR(191) NULL,
    ADD COLUMN `stack` TEXT NULL;
