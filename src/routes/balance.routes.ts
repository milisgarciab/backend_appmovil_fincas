import { Router } from 'express';
import { BalanceController } from '../controllers/balance.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new BalanceController();

router.use(authenticate);

/**
 * @openapi
 * /balance:
 *   get:
 *     summary: Lista los balances ya generados
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de balances }
 */
router.get('/', controller.list);

/**
 * @openapi
 * /balance/{id}:
 *   get:
 *     summary: Obtiene un balance por id
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Balance encontrado }
 *       404: { description: Balance no encontrado }
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /balance/generar:
 *   post:
 *     summary: Calcula y guarda un balance (suma las ventas Pagado por fecha_pago y los gastos por fecha dentro del rango; guarda fecha_inicio y fecha_fin)
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [periodo, fecha_inicio, fecha_fin]
 *             properties:
 *               periodo: { type: string, format: date, description: 'Fecha representativa del período, ej. primer día del mes' }
 *               fecha_inicio: { type: string, format: date }
 *               fecha_fin: { type: string, format: date }
 *     responses:
 *       201: { description: Balance generado y guardado }
 *       400: { description: Datos inválidos (campos faltantes, fechas no válidas o fecha_fin anterior a fecha_inicio) }
 */
router.post('/generar', controller.generar);

export default router;