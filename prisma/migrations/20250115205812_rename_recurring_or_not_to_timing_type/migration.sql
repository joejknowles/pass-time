-- CreateEnum
CREATE TYPE "SuggestionTimingType" AS ENUM ('RECURRING', 'DUE_DATE', 'SOON');

-- CreateEnum
CREATE TYPE "DueDateType" AS ENUM ('ON_DATE_ONLY', 'BEFORE_OR_ON');

-- DropIndex
DROP INDEX "TaskSuggestionConfig_oneOffDateType_oneOffDate_idx";

-- DropIndex
DROP INDEX "TaskSuggestionConfig_oneOffDate_idx";

-- DropIndex
DROP INDEX "TaskSuggestionConfig_recurringOrOnce_idx";

-- Rename columns and update enums while keeping data
ALTER TABLE "TaskSuggestionConfig" 
RENAME COLUMN "oneOffDate" TO "dueDate";

ALTER TABLE "TaskSuggestionConfig" 
RENAME COLUMN "oneOffDateType" TO "dueDateType";

ALTER TABLE "TaskSuggestionConfig"
ALTER COLUMN "dueDateType" TYPE text USING "dueDateType"::text;

ALTER TABLE "TaskSuggestionConfig"
ALTER COLUMN "dueDateType" TYPE "DueDateType" USING "dueDateType"::"DueDateType";

ALTER TABLE "TaskSuggestionConfig" 
RENAME COLUMN "recurringOrOnce" TO "suggestionTimingType";

-- Convert the column to type text before the update statement
ALTER TABLE "TaskSuggestionConfig" 
ALTER COLUMN "suggestionTimingType" TYPE text USING "suggestionTimingType"::text;

-- Update the enum values in the renamed column
UPDATE "TaskSuggestionConfig" SET "suggestionTimingType" = 'DUE_DATE' WHERE "suggestionTimingType" = 'ONE_OFF';

ALTER TABLE "TaskSuggestionConfig" 
ALTER COLUMN "suggestionTimingType" TYPE "SuggestionTimingType" USING "suggestionTimingType"::text::"SuggestionTimingType";

-- Drop old enums
DROP TYPE "OneOffDateType";
DROP TYPE "RecurringOrOnce";

-- Create new indexes
CREATE INDEX "TaskSuggestionConfig_suggestionTimingType_idx" ON "TaskSuggestionConfig"("suggestionTimingType");
CREATE INDEX "TaskSuggestionConfig_dueDateType_dueDate_idx" ON "TaskSuggestionConfig"("dueDateType", "dueDate");
CREATE INDEX "TaskSuggestionConfig_dueDate_idx" ON "TaskSuggestionConfig"("dueDate");
