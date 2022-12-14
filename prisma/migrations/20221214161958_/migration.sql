-- AlterTable
ALTER TABLE "TodoGroupShare" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "TodoGroupShare_pkey" PRIMARY KEY ("id");
