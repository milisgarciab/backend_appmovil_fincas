import { Router } from 'express';
import { IndicadoresProduccionController } from '../controllers/indicadoresProduccion.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new IndicadoresProduccionController();

router.use(authenticate);

/**
 * @openapi
 * /produccion/indicadores:
 *   get:
 *     summary: Indicadores básicos de producción (leche y huevos), calculados en vivo. Sin fechas, calcula sobre todo el histórico
 *     tags: [Produccion]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: fecha_fin
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Indicadores calculados }
 */
router.get('/indicadores', controller.obtener);

export default router;