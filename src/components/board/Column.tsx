import { Task, TaskList } from "@/types";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import React, { useState } from "react";
import { CreateTaskData } from "@/types";
interface ColumnProps {
  list: TaskList;
  tasks: Task[];
  onAddTask: (listId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onMoveTask: (
    taskId: string,
    fromListId: string,
    toListId: string,
    taskData: CreateTaskData,
  ) => void;
  onReorderTask: (taskId: string, listId: string, newIndex: number) => void;
  onToggleComplete: (task: Task) => void;
}

export const Column: React.FC<ColumnProps> = ({
  list,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onReorderTask,
  onToggleComplete,
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [dragOverIndex, setDragOverIndex] = useState<number>(-1);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(true);

    // Calculate drop position based on mouse position
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const taskHeight = 120; // Approximate task card height
    const newIndex = Math.floor(y / taskHeight);
    setDragOverIndex(Math.min(newIndex, tasks.length));
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    // Only reset if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDragOverIndex(-1);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
    setDragOverIndex(-1);

    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const { taskId, taskListId, sourceIndex, taskData } = data;

      if (taskListId === list.id) {
        // Reordering within the same list
        const newIndex = Math.min(
          dragOverIndex >= 0 ? dragOverIndex : tasks.length,
          tasks.length,
        );
        if (sourceIndex !== newIndex && sourceIndex !== newIndex - 1) {
          onReorderTask(taskId, list.id, newIndex);
        }
      } else {
        // Moving between different lists
        onMoveTask(taskId, taskListId, list.id, taskData);
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  // Helper function to get drop indicator position
  const getDropIndicatorStyle = (index: number): React.CSSProperties => {
    if (dragOverIndex === index && isDragOver) {
      return {
        height: "2px",
        backgroundColor: "#3b82f6",
        margin: "4px 0",
        borderRadius: "1px",
      };
    }
    return { display: "none" };
  };

  return (
    <div className="flex-1 min-w-80">
      <div className="bg-gray-50 rounded-lg border-t-4 border-t-blue-500 h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 flex items-center">
              {list.title}
              <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                {tasks.length}
              </span>
            </h2>
            <button
              onClick={() => onAddTask(list.id)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Priority Legend */}
          <div className="text-xs text-gray-500 flex items-center space-x-2">
            <span>💡 Tip: Drag tasks to reorder priority</span>
          </div>
        </div>

        <div
          className={`p-4 min-h-96 transition-colors ${
            isDragOver ? "bg-blue-50" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-3 relative">
            {/* Drop indicator at the top */}
            <div style={getDropIndicatorStyle(0)}></div>

            {tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <TaskCard
                  task={task}
                  index={index}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onMove={onMoveTask}
                  onReorder={onReorderTask}
                  onToggleComplete={onToggleComplete}
                />
                {/* Drop indicator after each task */}
                <div style={getDropIndicatorStyle(index + 1)}></div>
              </React.Fragment>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No tasks yet</p>
                <button
                  onClick={() => onAddTask(list.id)}
                  className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
                >
                  Add a task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
