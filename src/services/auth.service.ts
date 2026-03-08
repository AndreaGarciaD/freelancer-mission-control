import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/connections';
import { config } from '../config/env';
import { RegisterInput, LoginInput, JwtPayload, User } from '../types';
import { AppError } from '../utils/AppError';

const SALT_ROUNDS = 10;

export const registerUser = async (input: RegisterInput): Promise<void> => {
    const { name, email, password } = input;

    const [rows] = await pool.execute<any[]>(
        'SELECT id FROM users WHERE email = ?',
        [email]
    )

    if (rows.length > 0) {
        throw new AppError('Email already in use', 409);
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    await pool.execute(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [name, email, password_hash]
    );
};


export const loginUser = async (
    input: LoginInput
): Promise<{ token: string; user: Omit<User, 'password_hash'> }> => {
    const { email, password } = input;

    const [rows] = await pool.execute<any[]>(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );

    if (rows.length === 0) {
        throw new AppError('Invalid email or password', 401);
    }

    const user: User = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
        throw new AppError('Invalid email or password', 401);
    }


    //building the payload for the JWT token
    const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
    };
    const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);

    const { password_hash, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
}
