-- CreateEnum
CREATE TYPE "RecurringOrOnce" AS ENUM ('RECURRING', 'ONE_OFF');

-- CreateEnum
CREATE TYPE "RecurringType" AS ENUM ('DAYS_SINCE_LAST_OCCURRENCE', 'SPECIFIC_DAYS');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "isSuggestingEnabled" BOOLEAN DEFAULT true;

-- CreateTable
CREATE TABLE "TaskSuggestionConfig" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "recurringOrOnce" "RecurringOrOnce",
    "recurringType" "RecurringType",
    "daysSinceLastOccurrence" INTEGER,
    "specificDays" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskSuggestionConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskSuggestionConfig" ADD CONSTRAINT "TaskSuggestionConfig_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSuggestionConfig" ADD CONSTRAINT "TaskSuggestionConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
