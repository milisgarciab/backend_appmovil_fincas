import { Router } from 'express';
import { BodegaController } from '../controllers/bodega.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new BodegaController();

router.use(authenticate);

/**
 * @openapi
 * /bodega:
 *   get:
 *     summary: Lista los insumos de bodega, con filtro opcional por categoría
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria_id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de insumos, incluyendo su categoría
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.get('/', controller.list);

/**
 * @openapi
 * /bodega/alertas/stock-bajo:
 *   get:
 *     summary: Lista insumos con stock actual igual o menor al mínimo (HU-18)
 *     tags: [Inventario]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de insumos con stock bajo }
 *       401: { description: Token de acceso requerido o inválido }
 */
router.get('/alertas/stock-bajo', controller.alertasStockBajo);

/**
 * @openapi
 * /bodega/{id}:
 *   get:
 *     summary: Obtiene un insumo de bodega por id
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
 *         description: Insumo encontrado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Insumo no encontrado
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /bodega:
 *   post:
 *     summary: Crea un insumo de bodega
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoria_id, nombre, unidad_medida]
 *             properties:
 *               categoria_id: { type: string }
 *               nombre: { type: string }
 *               unidad_medida: { type: string, description: "Ej: kg, litros, unidades" }
 *     responses:
 *       201:
 *         description: Insumo creado
 *       400:
 *         description: Datos faltantes o categoria_id no existe
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.post('/', controller.create);

/**
 * @openapi
 * /bodega/{id}:
 *   put:
 *     summary: Actualiza un insumo de bodega
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
 *               categoria_id: { type: string }
 *               nombre: { type: string }
 *               unidad_medida: { type: string }
 *     responses:
 *       200:
 *         description: Insumo actualizado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Insumo no encontrado
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /bodega/{id}:
 *   delete:
 *     summary: Elimina un insumo de bodega (borra en cascada sus lotes)
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
 *         description: Insumo eliminado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Insumo no encontrado
 */
router.delete('/:id', controller.delete);

/**
 * @openapi
 * /bodega/{id}/movimientos:
 *   post:
 *     summary: Registra una entrada o salida de stock para un insumo (HU-17)
 *     tags: [Inventario]
 *     security: [{ bearerAuth: [] }]
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
 *             required: [tipo, cantidad, motivo]
 *             properties:
 *               tipo: { type: string, enum: [Entrada, Salida] }
 *               cantidad: { type: number }
 *               motivo: { type: string, enum: [Compra, Consumo, Merma] }
 *               fecha: { type: string, format: date }
 *     responses:
 *       200: { description: Insumo con el stock actualizado }
 *       400: { description: Datos inválidos o stock insuficiente para la salida }
 *       404: { description: Insumo no encontrado }
 */
router.post('/:id/movimientos', controller.registrarMovimiento);

export default router;