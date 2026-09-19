import { Router } from 'express';
import { MovimientoInventarioController } from '../controllers/movimientoInventario.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new MovimientoInventarioController();

router.use(authenticate);

/**
 * @openapi
 * /movimientos-inventario:
 *   get:
 *     summary: Historial de movimientos de inventario (entradas, salidas, ajustes). Filtra por insumo_id o tipo
 *     tags: [Inventario]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: insumo_id
 *         schema: { type: integer }
 *       - in: query
 *         name: tipo
 *         schema: { type: string, enum: [Entrada, Salida, Ajuste] }
 *     responses:
 *       200: { description: Lista de movimientos }
 */
router.get('/', controller.list);

/**
 * @openapi
 * /movimientos-inventario:
 *   post:
 *     summary: Registra un movimiento de inventario (entrada, salida o ajuste) y actualiza el stock_actual del insumo
 *     tags: [Inventario]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [insumo_id, tipo, cantidad]
 *             properties:
 *               insumo_id: { type: integer }
 *               tipo: { type: string, enum: [Entrada, Salida, Ajuste] }
 *               cantidad: { type: number, description: 'Para Ajuste puede ser negativa; para Entrada/Salida debe ser mayor a 0' }
 *               motivo: { type: string }
 *     responses:
 *       201: { description: Movimiento registrado }
 *       400: { description: Datos inválidos o stock insuficiente }
 *       404: { description: El insumo indicado no existe }
 */
router.post('/', controller.registrar);

export default router;