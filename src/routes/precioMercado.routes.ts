import { Router } from 'express';
import { PrecioMercadoController } from '../controllers/precioMercado.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new PrecioMercadoController();
router.use(authenticate);

/**
 * @openapi
 * /market-prices:
 *   get:
 *     summary: Lista el historial de precios de mercado
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Historial de precios }
 *   put:
 *     summary: Registra un nuevo precio para un producto (Leche o Huevos)
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [producto, precio]
 *             properties:
 *               producto: { type: string, example: Leche }
 *               precio: { type: number }
 *     responses:
 *       201: { description: Precio registrado }
 *       400: { description: Datos inválidos }
 */
router.get('/', controller.getAll);
router.put('/', controller.setPrecio);

export default router;