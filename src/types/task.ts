export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  due?: string;
  updated?: string;
  completed?: string;
  deleted?: boolean;
  hidden?: boolean;
  position?: string;
  parent?: string;
  links?: TaskLink[];
  taskListId: string;
}

export interface TaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export interface TaskLink {
  type: string;
  description?: string;
  link?: string;
}

export type TaskStatus = "needsAction" | "completed";

export interface CreateTaskData {
  title: string;
  notes?: string;
  due?: string | null;
}

export interface UpdateTaskData extends CreateTaskData {
  status?: TaskStatus;
}
