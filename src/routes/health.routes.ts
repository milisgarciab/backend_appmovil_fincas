import { Router } from 'express';
import { HealthController } from '@controllers/health.controller';

const router = Router();
const healthController = new HealthController();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica que la API y la conexión a la base de datos estén funcionando
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API operativa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 database:
 *                   type: string
 *                   example: connected
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', healthController.getStatus);

export default router;
