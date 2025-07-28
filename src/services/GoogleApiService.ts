import { OAuthService } from "../services/OAuthService";
import {
  User,
  Task,
  TaskList,
  GoogleTasksListResponse,
  GoogleTasksResponse,
  CreateTaskData,
  UpdateTaskData,
} from "@/types";
export class GoogleApiService {
  private oauthService: OAuthService;

  constructor() {
    this.oauthService = OAuthService.getInstance();
  }

  // Make authenticated API request
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.oauthService.getValidToken();

    const response = await fetch(
      `https://tasks.googleapis.com/tasks/v1${endpoint}`,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    if (options.method === "DELETE") {
      return undefined as T;
    }

    return response.json();
  }

  // Get user profile
  async getUserProfile(): Promise<User> {
    const token = await this.oauthService.getValidToken();

    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.statusText}`);
    }

    const profile = await response.json();
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      imageUrl: profile.picture,
    };
  }

  // Get task lists
  async getTaskLists(): Promise<TaskList[]> {
    const response =
      await this.apiRequest<GoogleTasksListResponse>("/users/@me/lists");
    return response.items || [];
  }

  // Get tasks for a specific list
  async getTasks(taskListId: string): Promise<Task[]> {
    const response = await this.apiRequest<GoogleTasksResponse>(
      `/lists/${taskListId}/tasks?showCompleted=true&showDeleted=false`,
    );
    return response.items || [];
  }

  // Create a new task
  async createTask(taskListId: string, task: CreateTaskData): Promise<Task> {
    const taskData = {
      title: task.title,
      notes: task.notes,
      due: task.due ? new Date(task.due).toISOString() : undefined,
    };

    return this.apiRequest<Task>(`/lists/${taskListId}/tasks`, {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  }

  // Update an existing task
  async updateTask(
    taskListId: string,
    taskId: string,
    task: UpdateTaskData,
  ): Promise<Task> {
    const taskData = {
      id: taskId,
      title: task.title,
      notes: task.notes,
      due: task.due ? new Date(task.due).toISOString() : undefined,
      status: task.status,
    };

    return this.apiRequest<Task>(`/lists/${taskListId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  }

  // Delete a task
  async deleteTask(taskListId: string, taskId: string): Promise<void> {
    await this.apiRequest(`/lists/${taskListId}/tasks/${taskId}`, {
      method: "DELETE",
    });
  }

  // Move a task between lists (delete and recreate)
  async moveTask(
    taskId: string,
    fromListId: string,
    toListId: string,
    taskData: CreateTaskData,
  ): Promise<Task> {
    // Delete from source list
    await this.deleteTask(fromListId, taskId);
    // Create in destination list
    return this.createTask(toListId, taskData);
  }

  // Move a task within the same list (reorder for priority)
  async reorderTask(
    taskListId: string,
    taskId: string,
    previousTaskId?: string,
  ): Promise<Task> {
    return this.apiRequest<Task>(`/lists/${taskListId}/tasks/${taskId}/move`, {
      method: "POST",
      body: JSON.stringify({
        previous: previousTaskId,
      }),
    });
  }
}
