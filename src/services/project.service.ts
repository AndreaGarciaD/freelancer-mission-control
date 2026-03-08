import pool from '../db/connections';
import { Project, ProjectInput, ProjectQuery } from '../types';

export const createProject = async (
    userId: number,
    input: ProjectInput
): Promise<Project> => {
    const { client_id, title, description, status, deadline, rate } = input;

    if (client_id) {
        const [rows] = await pool.execute<any[]>(
            'SELECT id FROM clients WHERE id = ? AND user_id = ?',
            [client_id, userId]
        );
        if (rows.length === 0) {
            throw new Error('Client not found');
        }
    }

    const [result] = await pool.execute<any>(
        `INSERT INTO projects 
        (user_id, client_id, title, description, status, deadline, rate)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            userId,
            client_id ?? null,
            title,
            description ?? null,
            status ?? 'active',
            deadline ?? null,
            rate ?? null,
        ]
    );

    return getProjectById(userId, result.insertId) as Promise<Project>;
};

export const getProjects = async (
    userId: number,
    query: ProjectQuery
): Promise<{ data: Project[]; total: number; page: number; totalPages: number }> => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    //building filters dynamically
    const conditions: string[] = ['p.user_id = ?'];
    const values: any[] = [userId];

    if (query.status) {
        conditions.push('p.status = ?');
        values.push(query.status);
    }

    if (query.client_id) {
        conditions.push('p.client_id = ?');
        values.push(query.client_id);
    }

    const whereClause = conditions.join(' AND ');

    const [countRows] = await pool.execute<any[]>(
        `SELECT COUNT(*) as total FROM projects p WHERE ${whereClause}`,
        values
    );

    const total = countRows[0].total;

    const [rows] = await pool.query<any[]>(
        `SELECT p.*, c.name as client_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?`,
        [...values, Number(limit), Number(offset)]
    );

    return {
        data: rows,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

export const getProjectById = async (
    userId: number,
    projectId: number
): Promise<Project | null> => {
    const [rows] = await pool.execute<any[]>(
        `SELECT p.*, c.name as client_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.id = ? AND p.user_id = ?`,
        [projectId, userId]
    );

    return rows[0] ?? null;
};

export const updateProject = async (
    userId: number,
    projectId: number,
    input: Partial<ProjectInput>
): Promise<Project | null> => {
    const existing = await getProjectById(userId, projectId);
    if (!existing) return null;

    //verifiying client ownership if client_id is being updated
    if (input.client_id && input.client_id !== existing.client_id) {
        const [rows] = await pool.execute<any[]>(
            'SELECT id FROM clients WHERE id = ? AND user_id = ?',
            [input.client_id, userId]
        );
        if (rows.length === 0) {
            throw new Error('Client not found');
        }
    }

    const { client_id, title, description, status, deadline, rate } = input;

    await pool.execute({
        sql: `UPDATE projects
        SET client_id = ?, title = ?, description = ?,
        status = ?, deadline = ?, rate = ?
        WHERE id = ? AND user_id = ?`,
        values: [
            client_id ?? existing.client_id,
            title ?? existing.title,
            description ?? existing.description,
            status ?? existing.status,
            deadline ?? existing.deadline,
            rate ?? existing.rate,
            projectId,
            userId,
        ],
    });

    return getProjectById(userId, projectId);
};

export const deleteProject = async (
    userId: number,
    projectId: number
): Promise<boolean> => {
    const [result] = await pool.execute<any>(
        'DELETE FROM projects WHERE id = ? AND user_id = ?',
        [projectId, userId]
    );

    return result.affectedRows > 0;
};