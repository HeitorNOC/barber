/*
  Warnings:

  - You are about to drop the column `token` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "emailVerified" DATETIME,
    "uf" TEXT,
    "phone" TEXT,
    "cpf" TEXT
);
INSERT INTO "new_users" ("avatar_url", "cpf", "created_at", "email", "emailVerified", "hashedPassword", "id", "name", "phone", "uf") SELECT "avatar_url", "cpf", "created_at", "email", "emailVerified", "hashedPassword", "id", "name", "phone", "uf" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
