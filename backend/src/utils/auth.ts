import jwt from 'jsonwebtoken';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const verifyToken = async (token: string): Promise<User | null> => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as User;
        return decoded;
    } catch (error) {
        console.error('[Auth] Token verification failed:', error);
        return null;
    }
};