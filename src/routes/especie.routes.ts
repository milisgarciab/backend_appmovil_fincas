import { Router } from 'express';
import { EspecieController } from '../controllers/especie.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new EspecieController();

router.use(authenticate);

/**
 * @openapi
 * /especies:
 *   get:
 *     summary: Lista todas las especies (catálogo)
 *     tags: [Especies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de especies
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.get('/', controller.list);

/**
 * @openapi
 * /especies/{id}:
 *   get:
 *     summary: Obtiene una especie por id
 *     tags: [Especies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Especie encontrada
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Especie no encontrada
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /especies:
 *   post:
 *     summary: Crea una especie
 *     tags: [Especies]
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
 *     responses:
 *       201:
 *         description: Especie creada
 *       400:
 *         description: nombre es obligatorio
 *       401:
 *         description: Token de acceso requerido o inválido
 *       409:
 *         description: Ya existe una especie con ese nombre
 */
router.post('/', controller.create);

/**
 * @openapi
 * /especies/{id}:
 *   put:
 *     summary: Actualiza una especie
 *     tags: [Especies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *     responses:
 *       200:
 *         description: Especie actualizada
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Especie no encontrada
 *       409:
 *         description: Ya existe una especie con ese nombre
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /especies/{id}:
 *   delete:
 *     summary: Elimina una especie
 *     tags: [Especies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Especie eliminada
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Especie no encontrada
 *       409:
 *         description: No se puede eliminar, hay razas asociadas
 */
router.delete('/:id', controller.delete);

export default router;
