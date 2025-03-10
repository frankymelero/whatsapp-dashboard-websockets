import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
    API_URL: process.env.API_URL || 'http://localhost:3000/api/v1',
    EMAIL: process.env.EMAIL || '',
    PASSWORD: process.env.PASSWORD || '',
};