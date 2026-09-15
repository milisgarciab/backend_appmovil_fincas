/*
  Warnings:

  - A unique constraint covering the columns `[reset_token]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expira" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_reset_token_key" ON "usuarios"("reset_token");
