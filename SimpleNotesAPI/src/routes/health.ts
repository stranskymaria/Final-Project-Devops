import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get the health status of the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-09-29T10:30:00.000Z
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                   description: Server uptime in seconds
 *                 service:
 *                   type: string
 *                   example: Notes API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     responseTime:
 *                       type: number
 *                       example: 25
 *                       description: Database response time in milliseconds
 *       503:
 *         description: API is unhealthy (database connection failed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 service:
 *                   type: string
 *                 version:
 *                   type: string
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: unhealthy
 *                     responseTime:
 *                       type: number
 */
router.get('/health', getHealthStatus);

export default router;