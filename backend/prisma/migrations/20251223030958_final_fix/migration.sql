-- AlterTable
ALTER TABLE "music" ADD COLUMN "description" TEXT;
ALTER TABLE "music" ADD COLUMN "playlist_id" TEXT;
ALTER TABLE "music" ADD COLUMN "playlist_type" TEXT;

-- CreateTable
CREATE TABLE "travel_city" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "visited_at" DATETIME,
    "description" TEXT,
    "photos" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "wantCount" INTEGER NOT NULL DEFAULT 0,
    "beenCount" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "director" TEXT,
    "year" INTEGER,
    "poster_url" TEXT,
    "poster" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "review" TEXT,
    "watched_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_movie" ("created_at", "director", "id", "poster_url", "rating", "review", "title", "updated_at", "watched_at", "year") SELECT "created_at", "director", "id", "poster_url", "rating", "review", "title", "updated_at", "watched_at", "year" FROM "movie";
DROP TABLE "movie";
ALTER TABLE "new_movie" RENAME TO "movie";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
