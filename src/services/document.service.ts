import pool from '../db/connections';
import { Document, DocumentInput } from '../types';
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

const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const createDocument = async (
    userId: number,
    projectId: number,
    input: DocumentInput
): Promise<Document> => {
    await verifyProjectOwnership(projectId, userId);

    const { title, url, type } = input;

    if (!isValidUrl(url)) throw new AppError('Invalid URL format', 400);

    const [result] = await pool.execute<any>(
        `INSERT INTO documents (project_id, title, url, type)
        VALUES (?, ?, ?, ?)`,
        [projectId, title, url, type ?? 'other']
    );

    return getDocumentById(userId, projectId, result.insertId) as Promise<Document>;
};

export const getDocuments = async (
    userId: number,
    projectId: number
): Promise<Document[]> => {
    await verifyProjectOwnership(projectId, userId);

    const [rows] = await pool.execute<any[]>(
        `SELECT * FROM documents
        WHERE project_id = ?
        ORDER BY created_at DESC`,
        [projectId]
    );

    return rows;
};

export const getDocumentById = async (
    userId: number,
    projectId: number,
    documentId: number
): Promise<Document | null> => {
    await verifyProjectOwnership(projectId, userId);

    const [rows] = await pool.execute<any[]>(
        'SELECT * FROM documents WHERE id = ? AND project_id = ?',
        [documentId, projectId]
    );

    return rows[0] ?? null;
};

export const updateDocument = async (
    userId: number,
    projectId: number,
    documentId: number,
    input: Partial<DocumentInput>
): Promise<Document | null> => {
    await verifyProjectOwnership(projectId, userId);

    const existing = await getDocumentById(userId, projectId, documentId);
    if (!existing) return null;

    const { title, url, type } = input;

    if (url && !isValidUrl(url)) throw new AppError('Invalid URL format', 400);

    await pool.execute(
        `UPDATE documents
     SET title = ?, url = ?, type = ?
     WHERE id = ? AND project_id = ?`,
        [
            title ?? existing.title,
            url ?? existing.url,
            type ?? existing.type,
            documentId,
            projectId,
        ]
    );

    return getDocumentById(userId, projectId, documentId);
};

export const deleteDocument = async (
    userId: number,
    projectId: number,
    documentId: number
): Promise<boolean> => {
    await verifyProjectOwnership(projectId, userId);

    const [result] = await pool.execute<any>(
        'DELETE FROM documents WHERE id = ? AND project_id = ?',
        [documentId, projectId]
    );

    return result.affectedRows > 0;
};