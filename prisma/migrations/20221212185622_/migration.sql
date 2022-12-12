/*
  Warnings:

  - A unique constraint covering the columns `[prevTodoId]` on the table `Todo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "prevTodoId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Todo_prevTodoId_key" ON "Todo"("prevTodoId");

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_prevTodoId_fkey" FOREIGN KEY ("prevTodoId") REFERENCES "Todo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
