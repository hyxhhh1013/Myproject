-- AlterTable
ALTER TABLE "project" ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "project_is_featured_idx" ON "project"("is_featured");
