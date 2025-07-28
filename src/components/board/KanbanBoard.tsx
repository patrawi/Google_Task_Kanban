import React, { useState, useEffect, useCallback } from "react";
import { Task, TaskList, CreateTaskData } from "@/types";
import { LoginScreen } from "../auth/LoginScreen";
import { RefreshCw, LogOut } from "lucide-react";
import { TaskModal } from "../modals/TaskModal";
import { Column } from "./Column";
import { Toast } from "../ui/Toast";
import { useOAuth } from "../../hooks/useOAuth";
const KanbanBoard: React.FC = () => {
  const { isAuthenticated, user, isLoading, apiService, signIn, signOut } =
    useOAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskListId, setNewTaskListId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Load task lists and tasks when authenticated
  useEffect(() => {
    if (isAuthenticated && apiService) {
      loadData();
    }
  }, [isAuthenticated, apiService]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info"): void => {
      setToast({ message, type });
    },
    [],
  );

  const hideToast = useCallback((): void => {
    setToast(null);
  }, []);

  const loadData = useCallback(async (): Promise<void> => {
    if (!apiService) return;

    setIsLoadingData(true);
    try {
      const lists = await apiService.getTaskLists();
      setTaskLists(lists);

      // Load tasks for all lists
      const allTasks: Task[] = [];
      for (const list of lists) {
        const listTasks = await apiService.getTasks(list.id);
        const tasksWithListId = listTasks.map((task) => ({
          ...task,
          taskListId: list.id,
        }));
        allTasks.push(...tasksWithListId);
      }
      setTasks(allTasks);
    } catch (error) {
      showToast("Error loading tasks", "error");
      console.error("Error loading data:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, [apiService, showToast]);

  const handleAddTask = useCallback((listId: string): void => {
    setNewTaskListId(listId);
    setEditingTask(null);
    setModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task): void => {
    setEditingTask(task);
    setNewTaskListId(null);
    setModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(
    async (taskData: CreateTaskData): Promise<void> => {
      if (!apiService) return;

      try {
        if (editingTask) {
          // Update existing task
          const updatedTask = await apiService.updateTask(
            editingTask.taskListId,
            editingTask.id,
            taskData,
          );

          // Update local state immediately
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === editingTask.id
                ? { ...updatedTask, taskListId: editingTask.taskListId }
                : task,
            ),
          );
          showToast("Task updated successfully", "success");
        } else if (newTaskListId) {
          // Create new task
          const newTask = await apiService.createTask(newTaskListId, taskData);

          // Add to local state immediately
          setTasks((prevTasks) => [
            ...prevTasks,
            { ...newTask, taskListId: newTaskListId },
          ]);
          showToast("Task created successfully", "success");
        }

        setModalOpen(false);
        setEditingTask(null);
        setNewTaskListId(null);
      } catch (error) {
        showToast("Error saving task", "error");
        console.error("Error saving task:", error);
      }
    },
    [apiService, editingTask, newTaskListId, showToast],
  );

  const handleDeleteTask = useCallback(
    async (task: Task): Promise<void> => {
      if (!apiService) return;

      // Optimistic update - remove from UI immediately
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));
      showToast("Task deleted", "success");

      try {
        await apiService.deleteTask(task.taskListId, task.id);
      } catch (error) {
        // Revert optimistic update on error
        setTasks((prevTasks) => [...prevTasks, task]);
        showToast("Error deleting task", "error");
        console.error("Error deleting task:", error);
      }
    },
    [apiService, showToast],
  );

  const handleMoveTask = useCallback(
    async (
      taskId: string,
      fromListId: string,
      toListId: string,
      taskData: CreateTaskData,
    ): Promise<void> => {
      if (!apiService || fromListId === toListId) return;

      // Optimistic update - move task in UI immediately
      const taskToMove = tasks.find((t) => t.id === taskId);
      if (!taskToMove) return;

      setTasks((prevTasks) => {
        const filteredTasks = prevTasks.filter((t) => t.id !== taskId);
        // Create new task object with updated list ID
        const movedTask = { ...taskToMove, taskListId: toListId };
        return [...filteredTasks, movedTask];
      });

      showToast("Task moved successfully", "success");

      try {
        await apiService.moveTask(taskId, fromListId, toListId, taskData);
      } catch (error) {
        // Revert optimistic update on error
        setTasks((prevTasks) => {
          const filteredTasks = prevTasks.filter((t) => t.id !== taskId);
          return [...filteredTasks, taskToMove]; // Restore original task
        });
        showToast("Error moving task", "error");
        console.error("Error moving task:", error);
      }
    },
    [apiService, tasks, showToast],
  );
  const getTasksForList = useCallback(
    (listId: string): Task[] => {
      return tasks.filter((task) => task.taskListId === listId);
    },
    [tasks],
  );
  const handleReorderTask = useCallback(
    async (taskId: string, listId: string, newIndex: number): Promise<void> => {
      if (!apiService) return;

      // Find the task that should be before this one in the new position
      const sortedTasks = getTasksForList(listId);
      let previousTaskId: string | undefined;

      if (newIndex > 0 && sortedTasks[newIndex - 1]) {
        previousTaskId = sortedTasks[newIndex - 1].id;
      }

      // Optimistic update - reorder in UI immediately
      const currentTasks = [...tasks];
      const taskIndex = currentTasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        const [movedTask] = currentTasks.splice(taskIndex, 1);

        // Find the correct insertion point in the global tasks array
        const listTasks = currentTasks.filter((t) => t.taskListId === listId);
        const insertIndex = Math.min(newIndex, listTasks.length);

        // Insert at the correct position
        let globalInsertIndex = currentTasks.findIndex(
          (t) => t.taskListId === listId,
        );
        if (globalInsertIndex === -1) {
          globalInsertIndex = currentTasks.length;
        } else {
          globalInsertIndex += insertIndex;
        }

        currentTasks.splice(globalInsertIndex, 0, movedTask);
        setTasks(currentTasks);
      }

      showToast("Task priority updated", "success");

      try {
        await apiService.reorderTask(listId, taskId, previousTaskId);
      } catch (error) {
        showToast("Error reordering task", "error");
        console.error("Error reordering task:", error);
        // Reload data only on error to revert optimistic update
        loadData();
      }
    },
    [apiService, tasks, getTasksForList, showToast, loadData],
  );

  const handleToggleComplete = useCallback(
    async (task: Task): Promise<void> => {
      if (!apiService) return;

      const newStatus: "needsAction" | "completed" =
        task.status === "completed" ? "needsAction" : "completed";

      // Optimistic update - change status in UI immediately
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, status: newStatus } : t,
        ),
      );

      showToast(
        `Task marked as ${newStatus === "completed" ? "complete" : "incomplete"}`,
        "success",
      );

      try {
        await apiService.updateTask(task.taskListId, task.id, {
          title: task.title,
          notes: task.notes,
          due: task.due,
          status: newStatus,
        });
      } catch (error) {
        // Revert optimistic update on error
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === task.id
              ? { ...t, status: task.status } // Revert to original status
              : t,
          ),
        );
        showToast("Error updating task status", "error");
        console.error("Error updating task status:", error);
      }
    },
    [apiService, showToast],
  );

  const handleCloseModal = useCallback((): void => {
    setModalOpen(false);
    setEditingTask(null);
    setNewTaskListId(null);
  }, []);

  if (!isAuthenticated) {
    return <LoginScreen onSignIn={signIn} isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Task Board
              </h1>
              <p className="text-gray-600">
                Organize your Google Tasks with drag and drop
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                disabled={isLoadingData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-400 transition-colors"
                title="Sync with Google Tasks"
              >
                <RefreshCw
                  size={16}
                  className={isLoadingData ? "animate-spin" : ""}
                />
                <span>Sync</span>
              </button>
              <div className="flex items-center space-x-3">
                {user && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm text-gray-700">{user.name}</span>
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingData && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-gray-600">
              <RefreshCw size={20} className="animate-spin" />
              <span>Loading your tasks...</span>
            </div>
          </div>
        )}

        {/* Task Lists */}
        {!isLoadingData && (
          <div className="flex space-x-6 overflow-x-auto pb-6">
            {taskLists.map((list) => (
              <Column
                key={list.id}
                list={list}
                tasks={getTasksForList(list.id)}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
                onReorderTask={handleReorderTask}
                onToggleComplete={handleToggleComplete}
              />
            ))}
            {taskLists.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>
                  No task lists found. Create task lists in Google Tasks to get
                  started.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={modalOpen}
        task={editingTask}
        onSave={handleSaveTask}
        onClose={handleCloseModal}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
};

export default KanbanBoard;
