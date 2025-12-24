-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "technologies" TEXT NOT NULL,
    "image_url" TEXT,
    "images" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "github_url" TEXT,
    "demo_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_project" ("created_at", "demo_url", "description", "end_date", "github_url", "id", "image_url", "start_date", "technologies", "title", "updated_at", "user_id") SELECT "created_at", "demo_url", "description", "end_date", "github_url", "id", "image_url", "start_date", "technologies", "title", "updated_at", "user_id" FROM "project";
DROP TABLE "project";
ALTER TABLE "new_project" RENAME TO "project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
