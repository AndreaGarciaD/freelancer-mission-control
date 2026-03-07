import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (key: string): string => {
    const value = process.env[key];
    if(!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
};

//app crashes with a clear message if any environment variable is not set

export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    db: {
        host: requireEnv('DB_HOST'),
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: requireEnv('DB_USER'),
        password: requireEnv('DB_PASSWORD'),
        database: requireEnv('DB_NAME'),
    },

    jwt: {
        secret: requireEnv('JWT_SECRET'),
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
}