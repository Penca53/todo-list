-- DropForeignKey
ALTER TABLE "Todo" DROP CONSTRAINT "Todo_todoGroupId_fkey";

-- DropForeignKey
ALTER TABLE "TodoGroup" DROP CONSTRAINT "TodoGroup_parentGroupId_fkey";

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_todoGroupId_fkey" FOREIGN KEY ("todoGroupId") REFERENCES "TodoGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoGroup" ADD CONSTRAINT "TodoGroup_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "TodoGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
