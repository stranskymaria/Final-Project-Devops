import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import pool from '../services/db';

const appVersionPath = path.resolve(process.cwd(), '../app-version.json');
const appVersion = JSON.parse(fs.readFileSync(appVersionPath, 'utf-8')).version;
const buildSha = process.env.APP_BUILD_SHA?.trim() || null;
const displayVersion = buildSha ? `${appVersion}+${buildSha}` : appVersion;

export const getHealthStatus = async (req: Request, res: Response) => {
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        service: 'Notes API',
        version: displayVersion,
        buildSha,
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
