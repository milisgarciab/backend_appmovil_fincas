import { Router } from 'express';
import { PaddockController } from '@controllers/paddock.controller';
import { authenticate } from '@middlewares/authenticate';

const router = Router();
const controller = new PaddockController();
router.use(authenticate);

/**
 * @swagger
 * /paddocks/{id}/animals:
 *   get:
 *     summary: Lista los animales asignados directamente a un potrero, con su conteo - HU-29
 *     tags: [Potreros]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: "{ potrero, conteo, animales, mensaje }" }
 *       404: { description: Potrero no encontrado }
 */
router.get('/:id/animals', controller.getAnimales);

export default router;