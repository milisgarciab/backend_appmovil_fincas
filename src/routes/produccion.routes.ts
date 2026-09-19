import { Router } from 'express';
import { ProduccionController } from '@controllers/produccion.controller';
import { authenticate } from '@middlewares/authenticate';

const router = Router();
const controller = new ProduccionController();
router.use(authenticate);

/**
 * @swagger
 * /production/summary/today:
 *   get:
 *     summary: Resumen de producción del día (litros de leche, huevos buenos/rotos, registros) - HU-26
 *     tags: [Producción]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Resumen del día }
 */
router.get('/summary/today', controller.resumenHoy);

export default router;