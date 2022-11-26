-- DropForeignKey
ALTER TABLE "Label" DROP CONSTRAINT "Label_todoGroupId_fkey";

-- AlterTable
ALTER TABLE "Label" ALTER COLUMN "todoGroupId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_todoGroupId_fkey" FOREIGN KEY ("todoGroupId") REFERENCES "TodoGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
