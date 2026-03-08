import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ message: 'Name, email and password are required' });
            return;
        }

        await AuthService.registerUser({ name, email, password });

        res.status(201).json({ message: 'Account registered successfully' });
    } catch (error: any) {
        if (error.message === 'Email already in use') {
            res.status(409).json({ message: error.message });
            return
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        const result = await AuthService.loginUser({ email, password });

        res.status(200).json(result);
    } catch (error: any) {
        if (error.message === 'Invalid email or password') {
            res.status(401).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
