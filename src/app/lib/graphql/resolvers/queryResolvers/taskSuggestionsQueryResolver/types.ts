import { BalanceTarget, Task } from "@prisma/client";

export interface TaskGroup {
  name: string;
  tasks: Task[];
  type: string;
  data?: BalanceTarget;
}
