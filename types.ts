export enum Role {
    USER = 'user',
    ADMIN = 'admin',
}

export enum Status {
    TO_DO = 'To Do',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    roles: string[];
    permissions?: string[];
    created_at?: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: Status;
    due_date?: string | null;
    tags?: string | null;
    user_id: number;
    created_at: string;
    user?: Partial<User>;
}