import { Router } from 'express';
import { LoteInventarioController } from '../controllers/loteInventario.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new LoteInventarioController();

router.use(authenticate);

/**
 * @openapi
 * /lotes-inventario:
 *   get:
 *     summary: Lista los lotes de inventario, con filtros opcionales
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: insumo_id
 *         schema: { type: string }
 *       - in: query
 *         name: vence_en_dias
 *         schema: { type: string }
 *         description: "Filtra lotes cuya fecha_vencimiento está a N días o menos (ej. 30 para el KPI de inventario crítico)"
 *     responses:
 *       200:
 *         description: Lista de lotes, ordenados por vencimiento más próximo primero
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.get('/', controller.list);

/**
 * @openapi
 * /lotes-inventario/{id}:
 *   get:
 *     summary: Obtiene un lote de inventario por id
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lote encontrado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Lote no encontrado
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /lotes-inventario:
 *   post:
 *     summary: Registra un lote de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [insumo_id, fecha_vencimiento, cantidad_disponible, costo_unitario]
 *             properties:
 *               insumo_id: { type: string }
 *               numero_lote: { type: string }
 *               fecha_vencimiento: { type: string, format: date }
 *               cantidad_disponible: { type: number }
 *               costo_unitario: { type: number }
 *     responses:
 *       201:
 *         description: Lote creado
 *       400:
 *         description: Datos faltantes o insumo_id no existe
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.post('/', controller.create);

/**
 * @openapi
 * /lotes-inventario/{id}:
 *   put:
 *     summary: Actualiza un lote de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero_lote: { type: string }
 *               fecha_vencimiento: { type: string, format: date }
 *               cantidad_disponible: { type: number }
 *               costo_unitario: { type: number }
 *     responses:
 *       200:
 *         description: Lote actualizado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Lote no encontrado
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /lotes-inventario/{id}:
 *   delete:
 *     summary: Elimina un lote de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Lote eliminado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Lote no encontrado
 */
router.delete('/:id', controller.delete);

export default router;
