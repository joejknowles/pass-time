-- CreateEnum
CREATE TYPE "TimeWindow" AS ENUM ('DAILY', 'WEEKLY');

-- CreateTable
CREATE TABLE "BalanceTarget" (
    "id" SERIAL NOT NULL,
    "timeWindow" "TimeWindow" NOT NULL,
    "taskId" INTEGER NOT NULL,
    "targetAmount" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "BalanceTarget_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BalanceTarget" ADD CONSTRAINT "BalanceTarget_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceTarget" ADD CONSTRAINT "BalanceTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
