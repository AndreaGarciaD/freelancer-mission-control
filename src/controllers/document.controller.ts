import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import * as DocumentService from '../services/document.service';
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

export const createDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const projectId = parseIntParam(req.params.projectId, 'projectId');
        const { title, url, type } = req.body;

        if (!title || !url) {
            res.status(400).json({ message: 'Title and URL are required' });
            return;
        }

        const document = await DocumentService.createDocument(userId, projectId, {
            title,
            url,
            type,
        });

        res.status(201).json(document);
    } catch (error) {
        next(error);
    }
};

export const getDocuments = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const projectId = parseIntParam(req.params.projectId, 'projectId');

        const documents = await DocumentService.getDocuments(userId, projectId);
        res.status(200).json(documents);
    } catch (error) {
        next(error);
    }
};

export const getDocumentById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const projectId = parseIntParam(req.params.projectId, 'projectId');
        const documentId = parseIntParam(req.params.id, 'id');

        const document = await DocumentService.getDocumentById(
            userId,
            projectId,
            documentId
        );

        if (!document) {
            res.status(404).json({ message: 'Document not found' });
            return;
        }

        res.status(200).json(document);
    } catch (error) {
        next(error);
    }
};

export const updateDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const projectId = parseIntParam(req.params.projectId, 'projectId');
        const documentId = parseIntParam(req.params.id, 'id');
        const { title, url, type } = req.body;

        const updated = await DocumentService.updateDocument(
            userId,
            projectId,
            documentId,
            { title, url, type }
        );

        if (!updated) {
            res.status(404).json({ message: 'Document not found' });
            return;
        }

        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

export const deleteDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const projectId = parseIntParam(req.params.projectId, 'projectId');
        const documentId = parseIntParam(req.params.id, 'id');

        const deleted = await DocumentService.deleteDocument(
            userId,
            projectId,
            documentId
        );

        if (!deleted) {
            res.status(404).json({ message: 'Document not found' });
            return;
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};