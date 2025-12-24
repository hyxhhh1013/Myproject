/*
  Warnings:

  - You are about to drop the `travel_city` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `isVisible` on the `movie` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `movie` table. All the data in the column will be lost.
  - You are about to drop the column `orderIndex` on the `movie` table. All the data in the column will be lost.
  - You are about to drop the column `poster` on the `movie` table. All the data in the column will be lost.
  - You are about to alter the column `year` on the `movie` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to drop the column `description` on the `music` table. All the data in the column will be lost.
  - You are about to drop the column `isVisible` on the `music` table. All the data in the column will be lost.
  - You are about to drop the column `orderIndex` on the `music` table. All the data in the column will be lost.
  - You are about to drop the column `playlistId` on the `music` table. All the data in the column will be lost.
  - You are about to drop the column `playlistType` on the `music` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "travel_city";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "travel_footprint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "location" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "visited_at" DATETIME,
    "description" TEXT,
    "photos" TEXT,
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
    "rating" REAL,
    "review" TEXT,
    "watched_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_movie" ("created_at", "id", "rating", "title", "updated_at", "year") SELECT "created_at", "id", "rating", "title", "updated_at", "year" FROM "movie";
DROP TABLE "movie";
ALTER TABLE "new_movie" RENAME TO "movie";
CREATE TABLE "new_music" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "cover_url" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'netease',
    "url" TEXT,
    "lyrics" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_music" ("created_at", "id", "title", "updated_at") SELECT "created_at", "id", "title", "updated_at" FROM "music";
DROP TABLE "music";
ALTER TABLE "new_music" RENAME TO "music";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
