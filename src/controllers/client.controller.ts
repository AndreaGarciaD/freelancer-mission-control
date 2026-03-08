import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import * as ClientService from '../services/client.service';

export const createClient = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
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
        next(error);
    }
};

export const getClients = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
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
        next(error);
    }
};

export const getClientById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
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
        next(error);
    }
};

export const updateClient = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
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
        next(error);
    }
};

export const deleteClient = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
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

        res.status(204).send();
    } catch (error){
        next(error);
    }
};