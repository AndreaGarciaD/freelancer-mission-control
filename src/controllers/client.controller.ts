import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import * as ClientService from '../services/client.service';

export const createClient = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { name, email, company, notes } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Client name is required' });
            return;
        }

        const client = await ClientService.createClient(userId, {
            name,
            email,
            company,
            notes,
        });

        res.status(201).json(client);
    } catch (error) {
        console.error('[createClient]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getClients = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user!.userId;

        const query = {
            search: req.query.search as string | undefined,
            page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        };

        const result = await ClientService.getClients(userId, query);
        res.status(200).json(result);
    } catch (error) {
        console.error('[getClients]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getClientById = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const clientId = parseInt(idParam, 10);

        const client = await ClientService.getClientById(userId, clientId);

        if (!client) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }

        res.status(200).json(client);
    } catch (error) {
        console.error('[getClientById]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateClient = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const clientId = parseInt(idParam, 10);
        const { name, email, company, notes } = req.body;

        const updated = await ClientService.updateClient(userId, clientId, {
            name,
            email,
            company,
            notes,
        });

        if (!updated) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }

        res.status(200).json(updated);
    } catch (error){
        console.error('[updateClient]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteClient = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const clientId = parseInt(idParam, 10);

        const deleted = await ClientService.deleteClient(userId, clientId);

        if (!deleted) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }

        res.status(204).send(); // 204 = success with no content to return
    } catch (error){
        console.error('[deleteClient]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};