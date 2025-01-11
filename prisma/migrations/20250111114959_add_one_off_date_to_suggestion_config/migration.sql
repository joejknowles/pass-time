-- CreateEnum
CREATE TYPE "OneOffDateType" AS ENUM ('ON_DATE_ONLY', 'BEFORE_OR_ON');

-- AlterTable
ALTER TABLE "TaskSuggestionConfig" ADD COLUMN     "oneOffDate" TEXT,
ADD COLUMN     "oneOffDateType" "OneOffDateType";
