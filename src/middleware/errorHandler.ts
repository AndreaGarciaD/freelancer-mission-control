import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error(`[${req.method} ${req.path}]`, err);

    //handle known application errors with specific status codes and messages
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
        return;
    }

    //for unknown errors, return a generic message without exposing details
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
}

export default errorHandler;