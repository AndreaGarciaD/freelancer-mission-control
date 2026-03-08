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
    priority: 'low' | 'medium' | 'high';
    deadline?: Date;
    rate?: number;
    budget?: number;
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

//Client types
export interface ClientInput {
    name: string;
    email?: string;
    company?: string;
    notes?: string;
}

export interface ClientQuery {
    search?: string;
    page?: number;
    limit?: number;
}

//Project types
export interface ProjectInput {
    client_id?: number;
    title: string;
    description?: string;
    status?: 'active' | 'completed' | 'on_hold' | 'cancelled';
    priority?: 'low' | 'medium' | 'high';
    deadline?: string;
    rate?: number;
    budget?: number;
}

export interface ProjectQuery {
    status?: 'active' | 'completed' | 'on_hold' | 'cancelled';
    priority?: 'low' | 'medium' | 'high';
    client_id?: number;
    page?: number;
    limit?: number;
}
