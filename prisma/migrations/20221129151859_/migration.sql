/*
  Warnings:

  - The primary key for the `LabelsOnTodos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[todoId,labelId]` on the table `LabelsOnTodos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Label" DROP CONSTRAINT "Label_todoGroupId_fkey";

-- DropForeignKey
ALTER TABLE "LabelsOnTodos" DROP CONSTRAINT "LabelsOnTodos_labelId_fkey";

-- DropForeignKey
ALTER TABLE "LabelsOnTodos" DROP CONSTRAINT "LabelsOnTodos_todoId_fkey";

-- AlterTable
ALTER TABLE "LabelsOnTodos" DROP CONSTRAINT "LabelsOnTodos_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "LabelsOnTodos_todoId_labelId_key" ON "LabelsOnTodos"("todoId", "labelId");

-- AddForeignKey
ALTER TABLE "LabelsOnTodos" ADD CONSTRAINT "LabelsOnTodos_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelsOnTodos" ADD CONSTRAINT "LabelsOnTodos_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_todoGroupId_fkey" FOREIGN KEY ("todoGroupId") REFERENCES "TodoGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
