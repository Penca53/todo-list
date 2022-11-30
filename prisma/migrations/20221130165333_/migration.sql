-- CreateTable
CREATE TABLE "TodoGroupShare" (
    "todoGroupId" INTEGER NOT NULL,
    "sharedToId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "TodoGroupShare_todoGroupId_sharedToId_key" ON "TodoGroupShare"("todoGroupId", "sharedToId");

-- AddForeignKey
ALTER TABLE "TodoGroupShare" ADD CONSTRAINT "TodoGroupShare_todoGroupId_fkey" FOREIGN KEY ("todoGroupId") REFERENCES "TodoGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoGroupShare" ADD CONSTRAINT "TodoGroupShare_sharedToId_fkey" FOREIGN KEY ("sharedToId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
