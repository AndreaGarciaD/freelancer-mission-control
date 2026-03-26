import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import * as PhaseService from '../services/phase.service';
import { AppError } from '../utils/AppError';

const parseIntParam = (
    value: string | string[] | undefined,
    paramName: string
): number => {
    const raw = Array.isArray(value) ? value[0] : value;
    const parsed = raw ? parseInt(raw, 10) : NaN;

    if (!raw || Number.isNaN(parsed)) {
        throw new AppError(`Invalid ${paramName}`, 400);
    }

    return parsed;
};

export const createPhase = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const projectId = parseIntParam(req.params.projectId, 'projectId');
        const { title, description, status, order_index, due_date } = req.body;

        if (!title) {
            res.status(400).json({ message: 'Phase title is required' });
            return;
        }

        const phase = await PhaseService.createPhase(userId, projectId, {
            title,
            description,
            status,
            order_index,
            due_date,
        });

        res.status(201).json(phase);
    } catch (error) {
        next(error);
    }
};

export const getPhases = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const projectId = parseIntParam(req.params.projectId, 'projectId');

        const phases = await PhaseService.getPhases(userId, projectId);
        res.status(200).json(phases);
    } catch (error) {
        next(error);
    }
};

export const getPhaseById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const projectId = parseIntParam(req.params.projectId, 'projectId');
        const phaseId = parseIntParam(req.params.id, 'id');

        const phase = await PhaseService.getPhaseById(userId, projectId, phaseId);

        if (!phase) {
            res.status(404).json({ message: 'Phase not found' });
            return;
        }

        res.status(200).json(phase);
    } catch (error) {
        next(error);
    }
};

export const updatePhase = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const projectId = parseIntParam(req.params.projectId, 'projectId');
        const phaseId = parseIntParam(req.params.id, 'id');
        const { title, description, status, order_index, due_date } = req.body;

        const updated = await PhaseService.updatePhase(userId, projectId, phaseId, {
            title,
            description,
            status,
            order_index,
            due_date,
        });

        if (!updated) {
            res.status(404).json({ message: 'Phase not found' });
            return;
        }

        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

export const deletePhase = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const projectId = parseIntParam(req.params.projectId, 'projectId');
        const phaseId = parseIntParam(req.params.id, 'id');

        const deleted = await PhaseService.deletePhase(userId, projectId, phaseId);

        if (!deleted) {
            res.status(404).json({ message: 'Phase not found' });
            return;
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const reorderPhases = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const projectId = parseIntParam(req.params.projectId, 'projectId');
        const { orderedIds } = req.body;

        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            res.status(400).json({ message: 'orderedIds must be a non-empty array' });
            return;
        }

        const phases = await PhaseService.reorderPhases(userId, projectId, orderedIds);
        res.status(200).json(phases);
    } catch (error) {
        next(error);
    }
};