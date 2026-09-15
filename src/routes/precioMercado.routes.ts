import { Router } from 'express';
import { PrecioMercadoController } from '../controllers/precioMercado.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new PrecioMercadoController();

router.use(authenticate);

/**
 * @openapi
 * /precios-mercado:
 *   get:
 *     summary: Lista todos los precios de mercado registrados
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de precios }
 */
router.get('/', controller.list);

/**
 * @openapi
 * /precios-mercado/valor-produccion-hoy:
 *   get:
 *     summary: Valor estimado de la producción de hoy (leche + huevos a precio de mercado) - HU-34
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Valor estimado de producción de hoy }
 */
router.get('/valor-produccion-hoy', controller.getValorProduccion);

/**
 * @openapi
 * /precios-mercado/{id}:
 *   get:
 *     summary: Obtiene un precio de mercado por id
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Precio encontrado }
 *       404: { description: Precio no encontrado }
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /precios-mercado:
 *   post:
 *     summary: Registra manualmente un precio de mercado
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [producto, precio, fecha]
 *             properties:
 *               producto: { type: string }
 *               precio: { type: number }
 *               fecha: { type: string, format: date }
 *     responses:
 *       201: { description: Precio creado }
 *       400: { description: Datos inválidos }
 */
router.post('/', controller.create);

/**
 * @openapi
 * /precios-mercado/{id}:
 *   put:
 *     summary: Actualiza un precio de mercado
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Precio actualizado }
 *       404: { description: Precio no encontrado }
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /precios-mercado/{id}:
 *   delete:
 *     summary: Elimina un precio de mercado
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Precio eliminado }
 *       404: { description: Precio no encontrado }
 */
router.delete('/:id', controller.delete);

export default router;