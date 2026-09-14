import { Router } from 'express';
import { VentaController } from '../controllers/venta.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new VentaController();
router.use(authenticate);

/**
 * @openapi
 * /ventas:
 *   get:
 *     summary: Lista todas las ventas
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de ventas }
 *   post:
 *     summary: Registra una nueva venta (el total se calcula automáticamente)
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [producto, cantidad, precio_unitario, fecha]
 *             properties:
 *               producto: { type: string }
 *               cantidad: { type: number }
 *               precio_unitario: { type: number }
 *               comprador: { type: string }
 *               fecha: { type: string, format: date }
 *     responses:
 *       201: { description: Venta creada }
 *       400: { description: Datos inválidos }
 */
router.get('/', controller.getAll);
router.post('/', controller.create);

/**
 * @openapi
 * /ventas/{id}:
 *   get:
 *     summary: Consulta una venta por id
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Venta encontrada }
 *       404: { description: Venta no encontrada }
 */
router.get('/:id', controller.getById);

export default router;