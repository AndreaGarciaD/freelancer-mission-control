export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

export interface Client {
    id: number;
    user_id: number;
    name: string;
    email?: string;
    company?: string;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Project {
    id: number;
    user_id: number;
    client_id?: number;
    title: string;
    description?: string;
    status: 'active' | 'completed' | 'on_hold' | 'cancelled';
    deadline?: Date;
    rate?: number;
    created_at: Date;
    updated_at: Date;
}

//Auth types
export interface RegisterInput {
    name: string,
    email: string,
    password: string,
}

export interface LoginInput {
    email: string,
    password: string,
}

export interface JwtPayload {
    userId: number;
    email: string;
}

export interface AuthenticatedRequest extends Express.Request {
    user?: JwtPayload;
}

