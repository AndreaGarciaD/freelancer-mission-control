import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import * as ProjectService from '../services/project.service';

export const createProject = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { client_id, title, description, status, deadline, rate } = req.body;

        if (!title) {
            res.status(400).json({ message: 'Project title is required' });
            return;
        }

        const project = await ProjectService.createProject(userId, {
            client_id,
            title,
            description,
            status,
            deadline,
            rate,
        });

        res.status(201).json(project);
    } catch (error: any) {
        console.error('[createProject]', error);
        if (error.message === 'Client not found') {
            res.status(404).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProjects = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user!.userId;

        const query = {
            status: req.query.status as any,
            client_id: req.query.client_id
                ? parseInt(req.query.client_id as string, 10)
                : undefined,
            page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        };

        const result = await ProjectService.getProjects(userId, query);
        res.status(200).json(result);
    } catch (error) {
        console.error('[getProjects]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProjectById = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const projectId = parseInt(idParam, 10);

        const project = await ProjectService.getProjectById(userId, projectId);

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        res.status(200).json(project);
    } catch (error) {
        console.error('[getProjectById]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProject = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const projectId = parseInt(idParam, 10);
        const { client_id, title, description, status, deadline, rate } = req.body;

        const updated = await ProjectService.updateProject(userId, projectId, {
            client_id,
            title,
            description,
            status,
            deadline,
            rate,
        });

        if (!updated) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        res.status(200).json(updated);
    } catch (error: any) {
        console.error('[updateProject]', error);
        if (error.message === 'Client not found') {
            res.status(404).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteProject = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const projectId = parseInt(idParam, 10);

        const deleted = await ProjectService.deleteProject(userId, projectId);

        if (!deleted) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error('[deleteProject]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};