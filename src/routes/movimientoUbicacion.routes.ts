import { Router } from 'express';
import { MovimientoUbicacionController } from '../controllers/movimientoUbicacion.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new MovimientoUbicacionController();

router.use(authenticate);

/**
 * @openapi
 * /animales/{id}/movimientos:
 *   get:
 *     summary: Historial de traslados de ubicación (potreros) de un animal
 *     tags: [Potreros]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Historial de movimientos }
 *       404: { description: Animal no encontrado }
 */
router.get('/:id/movimientos', controller.getHistorial);

/**
 * @openapi
 * /animales/{id}/trasladar:
 *   post:
 *     summary: Traslada un animal a otro potrero y deja registro del movimiento
 *     tags: [Potreros]
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
 *             required: [potrero_destino_id]
 *             properties:
 *               potrero_destino_id: { type: integer }
 *     responses:
 *       201: { description: Traslado registrado }
 *       400: { description: potrero_destino_id es obligatorio }
 *       404: { description: Animal o potrero no encontrado }
 */
router.post('/:id/trasladar', controller.trasladar);

export default router;