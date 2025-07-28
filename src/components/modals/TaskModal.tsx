import { Task, CreateTaskData } from "@/types";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export interface TaskModalProps {
  isOpen: boolean;
  task?: Task | null;
  onSave: (taskData: CreateTaskData) => void;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  task,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [due, setDue] = useState<string>("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setNotes(task.notes || "");
      setDue(task.due ? task.due.split("T")[0] : "");
    } else {
      setTitle("");
      setNotes("");
      setDue("");
    }
  }, [task]);

  if (!isOpen) return null;

  const handleSubmit = (): void => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      notes: notes.trim(),
      due: due || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {task ? "Edit Task" : "Add New Task"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add notes or description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {task ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
