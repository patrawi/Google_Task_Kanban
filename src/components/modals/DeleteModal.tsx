import React from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { Task } from "@/types";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  task: Task | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  task,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !task) return null;

  const handleConfirm = (): void => {
    onConfirm();
  };

  const handleCancel = (): void => {
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/50  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-3">
            Are you sure you want to delete this task? This action cannot be
            undone.
          </p>

          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="flex items-start space-x-2">
              <Trash2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {task.title}
                </h4>
                {task.notes && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {task.notes}
                  </p>
                )}
                {task.due && (
                  <p className="text-xs text-gray-500 mt-1">
                    Due:{" "}
                    {new Date(task.due).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Delete Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};
