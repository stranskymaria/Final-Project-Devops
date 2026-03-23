import { Request, Response } from 'express';
import pool from '../services/db';

export const getHealthStatus = async (req: Request, res: Response) => {
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        service: 'Notes API',
        version: '1.0.0',
        database: {
            status: 'unknown',
            responseTime: 0
        }
    };

    try {
        // Test database connectivity
        const startTime = Date.now();
        await pool.execute('SELECT 1');
        const endTime = Date.now();
        
        healthStatus.database.status = 'healthy';
        healthStatus.database.responseTime = endTime - startTime;
        
        res.status(200).json(healthStatus);
    } catch (error) {
        healthStatus.status = 'unhealthy';
        healthStatus.database.status = 'unhealthy';
        
        res.status(503).json(healthStatus);
    }
};