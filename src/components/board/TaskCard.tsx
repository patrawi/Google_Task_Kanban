import { Calendar, MoreVertical, Trash2, Edit3 } from "lucide-react";
import { Task, CreateTaskData } from "@/types";
import { useState } from "react";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (
    taskId: string,
    fromListId: string,
    toListId: string,
    taskData: CreateTaskData,
  ) => void;
  onReorder: (taskId: string, listId: string, newIndex: number) => void;
  onToggleComplete: (task: Task) => void;
}
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onEdit,
  onDelete,
  onMove,
  onReorder,
  onToggleComplete,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const formatDate = (dateString?: string): string | null => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue =
    task.due && new Date(task.due) < new Date() && task.status !== "completed";
  const isCompleted = task.status === "completed";

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>): void => {
    setIsDragging(true);
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        taskId: task.id,
        taskListId: task.taskListId,
        sourceIndex: index,
        taskData: {
          title: task.title,
          notes: task.notes,
          due: task.due,
        },
      }),
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (): void => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-move transition-all duration-200 hover:shadow-md ${
        isDragging ? "opacity-50 rotate-1 scale-105" : ""
      } ${isCompleted ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {/* Priority indicator */}
          <div className="w-1 h-4 bg-blue-400 rounded-full opacity-60"></div>
          <h3
            className={`font-medium text-gray-900 text-sm leading-tight ${
              isCompleted ? "line-through" : ""
            }`}
          >
            {task.title}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onToggleComplete(task)}
            className={`w-4 h-4 rounded border-2 transition-colors ${
              isCompleted
                ? "bg-green-500 border-green-500"
                : "border-gray-300 hover:border-green-400"
            }`}
          >
            {isCompleted && (
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {task.notes && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2 ml-3">
          {task.notes}
        </p>
      )}

      <div className="flex items-center justify-between ml-3">
        {task.due && (
          <div
            className={`flex items-center space-x-1 text-xs ${
              isOverdue ? "text-red-500" : "text-gray-500"
            }`}
          >
            <Calendar size={12} />
            <span>{formatDate(task.due)}</span>
          </div>
        )}

        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(task)}
            className="text-gray-400 hover:text-blue-500 p-1 rounded"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="text-gray-400 hover:text-red-500 p-1 rounded"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
