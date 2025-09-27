import { MovingTaskInfo } from "./types";
import { DraggedTask } from "../tasksList/types";

export const isToday = (date: Date): boolean => {
  return date.toDateString() === new Date().toDateString();
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

export const getTimeFromCursor = (
  clientY: number,
  taskDuration: number,
  daytimeHours: number[]
) => {
  const container = document.getElementById("day-grid-container");
  if (!container) return { startHour: 0, startMinute: 0 };

  const rect = container.getBoundingClientRect();
  const offsetsByDuration = {
    15: 2,
    30: 10,
  };
  const THRESHOLD_OFFSET =
    offsetsByDuration[taskDuration as keyof typeof offsetsByDuration] || 15;
  const y = clientY - rect.top - THRESHOLD_OFFSET;
  const totalMinutes = (y / rect.height) * (daytimeHours.length * 60);
  const startHour = Math.floor(totalMinutes / 60) + daytimeHours[0];

  const startMinute = Math.floor(Math.floor(totalMinutes % 60) / 15) * 15;

  return { startHour, startMinute };
};

export const getCursor = (
  movingTaskInfo: MovingTaskInfo | null,
  draggedTask: DraggedTask | null
): string => {
  const isGrabbing = movingTaskInfo?.moveType === "both" || !!draggedTask;
  if (isGrabbing) {
    return "grabbing";
  }
  const isResizing = movingTaskInfo && movingTaskInfo.moveType !== "both";
  if (isResizing) {
    return "ns-resize";
  }
  return "";
};
