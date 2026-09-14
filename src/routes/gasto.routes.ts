import { Router } from 'express';
import { GastoController } from '../controllers/gasto.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new GastoController();
router.use(authenticate);

/**
 * @openapi
 * /gastos:
 *   get:
 *     summary: Lista todos los gastos
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de gastos }
 *   post:
 *     summary: Registra un nuevo gasto
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoria, monto, fecha]
 *             properties:
 *               categoria: { type: string }
 *               descripcion: { type: string }
 *               monto: { type: number }
 *               fecha: { type: string, format: date }
 *     responses:
 *       201: { description: Gasto creado }
 *       400: { description: Datos inválidos }
 */
router.get('/', controller.getAll);
router.post('/', controller.create);

/**
 * @openapi
 * /gastos/{id}:
 *   get:
 *     summary: Consulta un gasto por id
 *     tags: [Financiera]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Gasto encontrado }
 *       404: { description: Gasto no encontrado }
 */
router.get('/:id', controller.getById);

export default router;