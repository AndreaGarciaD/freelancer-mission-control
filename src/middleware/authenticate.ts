import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JwtPayload } from '../types';

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

const authenticate = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Authorization header missing or malformed' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default authenticate;