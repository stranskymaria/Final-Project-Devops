import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/services/db';

describe('Health Endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    it('should return health status with 200 status code', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect(200);

        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('service', 'Notes API');
        expect(response.body).toHaveProperty('version');
        expect(response.body).toHaveProperty('database');
        expect(response.body.database).toHaveProperty('status');
        expect(response.body.database).toHaveProperty('responseTime');
    });

    it('should have healthy status when database is available', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect(200);

        expect(response.body.status).toBe('healthy');
        expect(response.body.database.status).toBe('healthy');
        expect(typeof response.body.database.responseTime).toBe('number');
        expect(response.body.database.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return proper timestamp format', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect(200);

        const timestamp = new Date(response.body.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.getTime()).not.toBeNaN();
    });
});
