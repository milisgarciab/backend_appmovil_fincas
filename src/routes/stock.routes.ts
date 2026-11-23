import { Router } from 'express';
import { StockController } from '../controllers/stock.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new StockController();

router.use(authenticate);

/**
 * @openapi
 * /stock:
 *   get:
 *     summary: Stock actual de los productos de finca (Huevos en unidades, Leche en litros)
 *     tags: [Stock]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de productos con su stock_actual }
 */
router.get('/', controller.listarStock);

/**
 * @openapi
 * /stock/movimientos:
 *   get:
 *     summary: Historial de movimientos de stock (más recientes primero)
 *     tags: [Stock]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: producto
 *         schema: { type: string, enum: [Huevos, Leche] }
 *       - in: query
 *         name: origen
 *         schema: { type: string, enum: [ProduccionHuevos, ProduccionLeche, Venta, Manual] }
 *       - in: query
 *         name: limite
 *         schema: { type: integer, minimum: 1, maximum: 1000, default: 200 }
 *     responses:
 *       200: { description: Lista de movimientos }
 *       400: { description: Filtro inválido }
 */
router.get('/movimientos', controller.listarMovimientos);

/**
 * @openapi
 * /stock/ajuste:
 *   post:
 *     summary: Ajuste manual de stock (por ejemplo, para cargar el stock inicial)
 *     tags: [Stock]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [producto, cantidad, motivo]
 *             properties:
 *               producto: { type: string, enum: [Huevos, Leche] }
 *               cantidad: { type: number, description: 'Positiva o negativa, distinta de 0. Huevos: entero.' }
 *               motivo: { type: string, maxLength: 255 }
 *     responses:
 *       201: { description: Movimiento registrado }
 *       400: { description: Datos inválidos o el stock quedaría negativo }
 */
router.post('/ajuste', controller.ajustar);

export default router;
