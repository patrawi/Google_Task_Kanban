import type { TaskStatus } from "@/types/task";

export const TASK_STATUS: Record<string, TaskStatus> = {
  NEEDS_ACTION: "needsAction",
  COMPLETED: "completed",
} as const;

export const COLUMN_COLORS: Record<string, string> = {
  list1: "border-t-blue-500",
  list2: "border-t-yellow-500",
  list3: "border-t-purple-500",
  list4: "border-t-green-500",
} as const;

export const DATE_FORMATS = {
  DISPLAY: "MMM dd",
  ISO: "yyyy-MM-dd",
} as const;
