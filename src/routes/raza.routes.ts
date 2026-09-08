import { Router } from 'express';
import { RazaController } from '../controllers/raza.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new RazaController();

router.use(authenticate);

/**
 * @openapi
 * /razas:
 *   get:
 *     summary: Lista todas las razas (catálogo)
 *     tags: [Razas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: especie_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra las razas por especie
 *     responses:
 *       200:
 *         description: Lista de razas
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.get('/', controller.list);

/**
 * @openapi
 * /razas/{id}:
 *   get:
 *     summary: Obtiene una raza por id
 *     tags: [Razas]
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
 *         description: Raza encontrada
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Raza no encontrada
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /razas:
 *   post:
 *     summary: Crea una raza
 *     tags: [Razas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, especie_id]
 *             properties:
 *               nombre: { type: string }
 *               especie_id: { type: string }
 *     responses:
 *       201:
 *         description: Raza creada
 *       400:
 *         description: nombre y especie_id son obligatorios
 *       401:
 *         description: Token de acceso requerido o inválido
 *       409:
 *         description: Ya existe esa raza, o especie_id no existe
 */
router.post('/', controller.create);

/**
 * @openapi
 * /razas/{id}:
 *   put:
 *     summary: Actualiza una raza
 *     tags: [Razas]
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
 *               especie_id: { type: string }
 *     responses:
 *       200:
 *         description: Raza actualizada
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Raza no encontrada
 *       409:
 *         description: Ya existe esa raza, o especie_id no existe
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /razas/{id}:
 *   delete:
 *     summary: Elimina una raza
 *     tags: [Razas]
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
 *         description: Raza eliminada
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Raza no encontrada
 *       409:
 *         description: No se puede eliminar, hay animales asociados
 */
router.delete('/:id', controller.delete);

export default router;
