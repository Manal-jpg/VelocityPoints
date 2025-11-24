/*
  Warnings:

  - You are about to drop the column `published` on the `Promotion` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Promotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "minSpending" REAL,
    "rate" REAL,
    "points" INTEGER
);
INSERT INTO "new_Promotion" ("description", "endTime", "id", "minSpending", "name", "points", "rate", "startTime", "type") SELECT "description", "endTime", "id", "minSpending", "name", "points", "rate", "startTime", "type" FROM "Promotion";
DROP TABLE "Promotion";
ALTER TABLE "new_Promotion" RENAME TO "Promotion";
CREATE INDEX "Promotion_name_idx" ON "Promotion"("name");
CREATE INDEX "Promotion_type_idx" ON "Promotion"("type");
CREATE INDEX "Promotion_startTime_idx" ON "Promotion"("startTime");
CREATE INDEX "Promotion_endTime_idx" ON "Promotion"("endTime");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
