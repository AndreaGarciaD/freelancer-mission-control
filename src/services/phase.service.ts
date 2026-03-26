import pool from '../db/connections';
import { Phase, PhaseInput } from '../types';
import { AppError } from '../utils/AppError';

const verifyProjectOwnership = async (
    projectId: number,
    userId: number
): Promise<void> => {
    const [rows] = await pool.execute<any[]>(
        'SELECT id FROM projects WHERE id = ? AND user_id = ?',
        [projectId, userId]
    );
    if (rows.length === 0) throw new AppError('Project not found', 404);
};

export const createPhase = async (
    userId: number,
    projectId: number,
    input: PhaseInput
): Promise<Phase> => {
    await verifyProjectOwnership(projectId, userId);

    const { title, description, status, order_index, due_date } = input;

    const [lastPhase] = await pool.execute<any[]>(
        'SELECT MAX(order_index) as max_order FROM phases WHERE project_id = ?',
        [projectId]
    );
    const nextOrder = order_index ?? (lastPhase[0].max_order ?? -1) + 1;

    const [result] = await pool.execute<any>(
        `INSERT INTO phases (project_id, title, description, status, order_index, due_date)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            projectId,
            title,
            description ?? null,
            status ?? 'pending',
            nextOrder,
            due_date ?? null,
        ]
    );

    return getPhaseById(userId, projectId, result.insertId) as Promise<Phase>;
};

export const getPhases = async (
    userId: number,
    projectId: number
): Promise<Phase[]> => {
    await verifyProjectOwnership(projectId, userId);

    const [rows] = await pool.execute<any[]>(
        `SELECT * FROM phases
        WHERE project_id = ?
        ORDER BY order_index ASC`,
        [projectId]
    );

    return rows;
};

export const getPhaseById = async (
    userId: number,
    projectId: number,
    phaseId: number
): Promise<Phase | null> => {
    await verifyProjectOwnership(projectId, userId);

    const [rows] = await pool.execute<any[]>(
        'SELECT * FROM phases WHERE id = ? AND project_id = ?',
        [phaseId, projectId]
    );

    return rows[0] ?? null;
};

export const updatePhase = async (
    userId: number,
    projectId: number,
    phaseId: number,
    input: Partial<PhaseInput>
): Promise<Phase | null> => {
    await verifyProjectOwnership(projectId, userId);

    const existing = await getPhaseById(userId, projectId, phaseId);
    if (!existing) return null;

    const { title, description, status, order_index, due_date } = input;

    await pool.execute({
        sql: `UPDATE phases
        SET title = ?, description = ?, status = ?, order_index = ?, due_date = ?
        WHERE id = ? AND project_id = ?`,
        values: [
            title ?? existing.title,
            description ?? existing.description,
            status ?? existing.status,
            order_index ?? existing.order_index,
            due_date ?? existing.due_date,
            phaseId,
            projectId,
        ],
    });

    return getPhaseById(userId, projectId, phaseId);
};

export const deletePhase = async (
    userId: number,
    projectId: number,
    phaseId: number
): Promise<boolean> => {
    await verifyProjectOwnership(projectId, userId);

    const [result] = await pool.execute<any>(
        'DELETE FROM phases WHERE id = ? AND project_id = ?',
        [phaseId, projectId]
    );

    return result.affectedRows > 0;
};

export const reorderPhases = async (
    userId: number,
    projectId: number,
    orderedIds: number[]
): Promise<Phase[]> => {
    await verifyProjectOwnership(projectId, userId);

    for (let i = 0; i < orderedIds.length; i++) {
        await pool.execute({
            sql: 'UPDATE phases SET order_index = ? WHERE id = ? AND project_id = ?',
            values: [i, orderedIds[i], projectId],
        });
    }

    return getPhases(userId, projectId);
};