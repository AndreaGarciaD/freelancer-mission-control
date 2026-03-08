import pool from '../db/connections';
import { Client, ClientInput, ClientQuery } from '../types';

export const createClient = async (
    userId: number,
    input: ClientInput
): Promise<Client> => {
    const { name, email, company, notes } = input;

    const [result] = await pool.execute<any>(
        'INSERT INTO clients (user_id, name, email, company, notes) VALUES (?, ?, ?, ?, ?)',
        [userId, name, email ?? null, company ?? null, notes ?? null]
    );

    const insertId = result.insertId;
    return getClientById(userId, insertId) as Promise<Client>;
}

export const getClients = async (
    userId: number,
    query: ClientQuery
): Promise<{ data: Client[]; total: number; page: number; totalPages: number }> => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const search = query.search ?? '';

    //build search condition if search term exists
    const searchCondition = search
        ? 'AND (name LIKE ? OR company LIKE ? OR email LIKE ?)'
        : '';

    const searchValues = search
        ? [`%${search}%`, `%${search}%`, `%${search}%`]
        : [];

    //get total count first for pagination
    const [countRows] = await pool.execute<any[]>(
        `SELECT COUNT(*) as total FROM clients
     WHERE user_id = ? ${searchCondition}`,
        [Number(userId), ...searchValues]
    );

    const total = countRows[0].total;

    const [rows] = await pool.query<any[]>(
        `SELECT * FROM clients
     WHERE user_id = ? ${searchCondition}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
        [Number(userId), ...searchValues, Number(limit), Number(offset)]
    );

    return {
        data: rows,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

export const getClientById = async (
    userId: number,
    clientId: number
): Promise<Client | null> => {
    const [rows] = await pool.execute<any[]>(
        'SELECT * FROM clients WHERE user_id = ? AND id = ?',
        [userId, clientId]
    );

    return rows[0] ?? null;
};

export const updateClient = async (
    userId: number,
    clientId: number,
    input: Partial<ClientInput>
): Promise<Client | null> => {
    // First verify ownership
    const existing = await getClientById(userId, clientId);
    if (!existing) return null;

    const { name, email, company, notes } = input;

    await pool.execute({
        sql: `UPDATE clients
       SET name = ?, email = ?, company = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
        values: [
            name ?? existing.name,
            email ?? existing.email,
            company ?? existing.company,
            notes ?? existing.notes,
            clientId,
            userId,
        ],
    });

    return getClientById(userId, clientId);
};

export const deleteClient = async (
    userId: number,
    clientId: number
): Promise<boolean> => {
    const [result] = await pool.execute<any>(
        'DELETE FROM clients WHERE id = ? AND user_id = ?',
        [clientId, userId]
    );

    return result.affectedRows > 0;
};