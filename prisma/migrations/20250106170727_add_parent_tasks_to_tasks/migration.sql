-- CreateTable
CREATE TABLE "_ParentChildTasks" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ParentChildTasks_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ParentChildTasks_B_index" ON "_ParentChildTasks"("B");

-- AddForeignKey
ALTER TABLE "_ParentChildTasks" ADD CONSTRAINT "_ParentChildTasks_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentChildTasks" ADD CONSTRAINT "_ParentChildTasks_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
