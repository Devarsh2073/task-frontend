import axios, { AxiosError } from 'axios';
import { Role, Status, Task, User } from '../types';

const API_BASE_URL = 'http://157.245.237.73:8085/api';

export type LoginCredentials = {
  email:    string;
  password: string;
};

export type RegisterCredentials = {
  name:                  string;
  email:                 string;
  password:              string;
  password_confirmation: string;
};

export type UpdateProfilePayload = {
    name: string;
    email: string;
};

export type ChangePasswordPayload = {
    current_password:      string;
    password:              string;
    password_confirmation: string;
};

export interface TaskFilters {
    search?: string;
    tags?: string;
    due_from?: string;
    due_to?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    per_page?: number;
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

apiClient.interceptors.request.use((config) => {
  const xsrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (xsrfToken) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }

  return config;
});


apiClient.interceptors.response.use(
  (response) => response, 
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (window.location.hash !== '#/login') {
        window.location.hash = '/login';
      }
      return Promise.reject(new Error('Your session has expired. Please log in again.'));
    }

    const data = error.response?.data as { message?: string, errors?: any };
    const errorMessage = data?.message || error.message || 'An unknown API error occurred.';
    console.error('API Error:', errorMessage, data?.errors || '');
    return Promise.reject(new Error(errorMessage));
  }
);

interface ApiUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions?: string[];
}

const transformApiUserToUser = (apiUser: ApiUser): User => {
  return {
    ...apiUser,
    role: (apiUser.roles?.[0] as Role) || Role.USER,
  };
};

interface AuthResponse {
  user: User;
}

export const apiLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await apiClient.get('/sanctum/csrf-cookie');
    const response = await apiClient.post<ApiUser>('/auth/login', credentials);
    const apiUser = response.data;
    return {
        user: transformApiUserToUser(apiUser),
    };
};

export const apiRegister = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    await apiClient.get('/sanctum/csrf-cookie');
    const response = await apiClient.post<ApiUser>('/auth/register', credentials);
    const apiUser = response.data;
    return {
        user: transformApiUserToUser(apiUser),
    };
};

export const apiFetchUser = async (): Promise<User> => {
  const response = await apiClient.get<ApiUser>('/auth/profile');
  return transformApiUserToUser(response.data);
};

export const apiLogout = async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return response.data;
};

interface ApiTag {
  id: number;
  name: string;
}

interface ApiTask {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date?: string | null;
  tags?: ApiTag[];
  user_id: number;
  created_at: string;
  user?: { id: number; name: string };
}

interface PaginatedTasksResponse {
    data: ApiTask[];
}

const statusMap: { [key in Status]: string } = {
  [Status.TO_DO]: 'pending',
  [Status.IN_PROGRESS]: 'in-progress',
  [Status.COMPLETED]: 'completed',
};

const reverseStatusMap: { [key: string]: Status } = {
  'pending': Status.TO_DO,
  'in-progress': Status.IN_PROGRESS,
  'completed': Status.COMPLETED,
};

const transformApiTaskToTask = (apiTask: ApiTask): Task => {
  return {
    ...apiTask,
    status: reverseStatusMap[apiTask.status.toLowerCase()] || Status.TO_DO,
    tags: (apiTask.tags || []).map(tag => tag.name).join(', '),
    user: apiTask.user,
  };
};

const transformTaskToApiPayload = (taskData: Partial<Omit<Task, 'id' | 'created_at'>>) => {
    const payload: any = { ...taskData };

    if (payload.status) {
        payload.status = statusMap[payload.status as Status] || 'pending';
    }

    if (typeof payload.tags === 'string') {
        payload.tags = payload.tags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (payload.tags === null) {
        payload.tags = [];
    } else {
        delete payload.tags;
    }

    delete payload.user;

    return payload;
};

const buildTaskQueryString = (filters: TaskFilters & { status?: Status | 'All' }): string => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'status') {
            params.append(key, String(value));
        }
    });

    if (filters.status && filters.status !== 'All') {
        params.append('status', statusMap[filters.status]);
    }
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
};


export const apiFetchTask = async (taskId: number): Promise<Task> => {
  const response = await apiClient.get<ApiTask>(`/tasks/${taskId}`);
  return transformApiTaskToTask(response.data);
};

export const apiFetchUserTasks = async (filters: TaskFilters & { status?: Status | 'All' } = {}): Promise<Task[]> => {
  const queryString = buildTaskQueryString(filters);
  const response = await apiClient.get<PaginatedTasksResponse>(`/tasks${queryString}`);
  return response.data.data.map(transformApiTaskToTask);
};

export const apiFetchAllTasks = async (filters: TaskFilters & { status?: Status | 'All' } = {}): Promise<Task[]> => {
  const queryString = buildTaskQueryString(filters);
  const response = await apiClient.get<PaginatedTasksResponse>(`/tasks${queryString}`);
  return response.data.data.map(transformApiTaskToTask);
};

export const apiCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'user'>): Promise<Task> => {
    const payload = transformTaskToApiPayload(taskData);
    const response = await apiClient.post<ApiTask>('/tasks', payload);
    return transformApiTaskToTask(response.data);
};

export const apiUpdateTask = async (taskId: number, taskData: Partial<Omit<Task, 'id' | 'created_at' | 'user'>>): Promise<Task> => {
    const payload = transformTaskToApiPayload(taskData);
    const response = await apiClient.put<ApiTask>(`/tasks/${taskId}`, payload);
    return transformApiTaskToTask(response.data);
};

export const apiDeleteTask = async (taskId: number): Promise<void> => {
    await apiClient.delete<void>(`/tasks/${taskId}`);
};

export const apiFetchAllUsers = async (): Promise<User[]> => {
    const response = await apiClient.get<ApiUser[]>('/users');
    return response.data.map(transformApiUserToUser);
};

export const apiUpdateProfile = async (userData: UpdateProfilePayload): Promise<User> => {
    const response = await apiClient.put<ApiUser>('/user/profile', userData);
    return transformApiUserToUser(response.data);
};

export const apiChangePassword = async (passwordData: ChangePasswordPayload): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/user/password', passwordData);
    return response.data;
};
