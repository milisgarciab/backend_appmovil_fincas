import { Router } from 'express';
import { PotreroController } from '../controllers/potrero.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new PotreroController();

router.use(authenticate);

/**
 * @openapi
 * /ubicaciones-potreros:
 *   get:
 *     summary: Lista todos los potreros
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Lista de potreros }
 *       401: { description: Token de acceso requerido o inválido }
 */
router.get('/', controller.list);

/**
 * @openapi
 * /ubicaciones-potreros/{id}:
 *   get:
 *     summary: Obtiene un potrero por id
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Potrero encontrado }
 *       401: { description: Token de acceso requerido o inválido }
 *       404: { description: Potrero no encontrado }
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /ubicaciones-potreros/{id}/animales:
 *   get:
 *     summary: Lista los animales cuyo lote pertenece a este potrero
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Animales del potrero }
 *       401: { description: Token de acceso requerido o inválido }
 *       404: { description: Potrero no encontrado }
 */
router.get('/:id/animales', controller.getAnimales);

/**
 * @openapi
 * /ubicaciones-potreros:
 *   post:
 *     summary: Crea un potrero
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string }
 *               capacidad_animales: { type: integer }
 *               estado: { type: string, description: "Default: Disponible" }
 *     responses:
 *       201: { description: Potrero creado }
 *       400: { description: nombre es obligatorio }
 *       401: { description: Token de acceso requerido o inválido }
 */
router.post('/', controller.create);

/**
 * @openapi
 * /ubicaciones-potreros/{id}:
 *   put:
 *     summary: Actualiza un potrero
 *     tags: [Potreros]
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
 *               nombre: { type: string }
 *               capacidad_animales: { type: integer }
 *               estado: { type: string }
 *     responses:
 *       200: { description: Potrero actualizado }
 *       401: { description: Token de acceso requerido o inválido }
 *       404: { description: Potrero no encontrado }
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /ubicaciones-potreros/{id}:
 *   delete:
 *     summary: Elimina un potrero
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Potrero eliminado }
 *       401: { description: Token de acceso requerido o inválido }
 *       404: { description: Potrero no encontrado }
 *       409: { description: Hay lotes asociados a este potrero }
 */
router.delete('/:id', controller.delete);

export default router;