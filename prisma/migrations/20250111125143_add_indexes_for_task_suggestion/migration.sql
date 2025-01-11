-- CreateIndex
CREATE INDEX "Task_isSuggestingEnabled_idx" ON "Task"("isSuggestingEnabled");

-- CreateIndex
CREATE INDEX "TaskSuggestionConfig_userId_taskId_idx" ON "TaskSuggestionConfig"("userId", "taskId");

-- CreateIndex
CREATE INDEX "TaskSuggestionConfig_recurringOrOnce_idx" ON "TaskSuggestionConfig"("recurringOrOnce");

-- CreateIndex
CREATE INDEX "TaskSuggestionConfig_oneOffDateType_oneOffDate_idx" ON "TaskSuggestionConfig"("oneOffDateType", "oneOffDate");

-- CreateIndex
CREATE INDEX "TaskSuggestionConfig_oneOffDate_idx" ON "TaskSuggestionConfig"("oneOffDate");
