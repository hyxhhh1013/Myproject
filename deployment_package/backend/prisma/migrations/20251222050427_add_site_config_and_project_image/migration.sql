-- AlterTable
ALTER TABLE "project" ADD COLUMN "image_url" TEXT;

-- CreateTable
CREATE TABLE "site_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "site_title" TEXT NOT NULL DEFAULT 'My Portfolio',
    "seo_keywords" TEXT,
    "seo_description" TEXT,
    "icp_code" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
