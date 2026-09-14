import { Router } from 'express';
import { FinancieroController } from '../controllers/financiero.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new FinancieroController();
router.use(authenticate);

/**
 * @openapi
 * /financial/summary:
 *   get:
 *     summary: Balance en vivo (Ingresos - Gastos), opcionalmente filtrado por fecha
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: hasta
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: "{ totalIngresos, totalGastos, balance }" }
 */
router.get('/summary', controller.getResumen);

/**
 * @openapi
 * /production-value:
 *   get:
 *     summary: Valor estimado de la producción de hoy, según precios de mercado configurados
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "{ litrosLeche, cantidadHuevos, precioLeche, precioHuevos, valorEstimadoHoy }" }
 */
router.get('/production-value', controller.getValorProduccion);

export default router;