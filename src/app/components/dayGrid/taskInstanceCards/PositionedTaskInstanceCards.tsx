import React from "react";
import TaskInstanceCard from "./TaskInstanceCard";
import type {
  TaskInstance,
  OpenDetailsPanelEntity,
  MovingTaskInfo,
} from "../types";
import { TaskInstanceMovement } from "../useTaskInstanceMovement";

interface PositionedTaskInstanceCardsProps {
  taskInstances: TaskInstance[] | undefined;
  openDetailsPanelEntity: OpenDetailsPanelEntity | null;
  movingTaskInfo: MovingTaskInfo | null;
  startMovingTaskInstance: (
    taskInstance: TaskInstance,
    moveType: string
  ) => void;
  setOpenDetailsPanelEntity: (
    newOpenEntity: OpenDetailsPanelEntity | null
  ) => void;
  hourBlockHeight: number;
  taskInstanceMovement: TaskInstanceMovement;
}

const PositionedTaskInstanceCards: React.FC<
  PositionedTaskInstanceCardsProps
> = ({
  taskInstances,
  openDetailsPanelEntity,
  movingTaskInfo,
  startMovingTaskInstance,
  setOpenDetailsPanelEntity,
  hourBlockHeight,
  taskInstanceMovement,
}) => {
  return (
    <>
      {taskInstances?.map((taskInstance, index) => {
        const isMoving = movingTaskInfo?.taskInstance?.id === taskInstance.id;
        const effectiveDuration = isMoving
          ? movingTaskInfo?.taskInstance?.duration
          : taskInstance.duration;
        const effectiveStart = isMoving
          ? movingTaskInfo?.taskInstance?.start
          : taskInstance.start;

        const isCurrentlyOpen =
          openDetailsPanelEntity?.type === "TaskInstance" &&
          openDetailsPanelEntity.id === taskInstance.id;
        return (
          <TaskInstanceCard
            key={index}
            taskInstance={taskInstance}
            effectiveStart={effectiveStart}
            effectiveDuration={effectiveDuration}
            movingTaskInfo={movingTaskInfo}
            startMovingTaskInstance={startMovingTaskInstance}
            isThisTaskDetailsOpen={isCurrentlyOpen}
            taskInstanceMovement={taskInstanceMovement}
            handleClick={() => {
              if (
                movingTaskInfo?.hasChanged ||
                taskInstanceMovement.taskInstanceInTouchEditMode
              ) {
                return;
              }
              if (isCurrentlyOpen) {
                setOpenDetailsPanelEntity(null);
              } else {
                setOpenDetailsPanelEntity({
                  id: taskInstance.id,
                  type: "TaskInstance",
                });
              }
            }}
            hourBlockHeight={hourBlockHeight}
          />
        );
      })}
    </>
  );
};

export default PositionedTaskInstanceCards;
