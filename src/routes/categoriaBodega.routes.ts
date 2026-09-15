import { Router } from 'express';
import { CategoriaBodegaController } from '../controllers/categoriaBodega.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new CategoriaBodegaController();

router.use(authenticate);

/**
 * @openapi
 * /categorias-bodega:
 *   get:
 *     summary: Lista todas las categorías de bodega
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.get('/', controller.list);

/**
 * @openapi
 * /categorias-bodega/{id}:
 *   get:
 *     summary: Obtiene una categoría de bodega por id
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
 *         description: Categoría encontrada
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /categorias-bodega:
 *   post:
 *     summary: Crea una categoría de bodega
 *     tags: [Inventario]
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
 *         description: Categoría creada
 *       400:
 *         description: nombre es obligatorio
 *       401:
 *         description: Token de acceso requerido o inválido
 *       409:
 *         description: Ya existe una categoría con ese nombre
 */
router.post('/', controller.create);

/**
 * @openapi
 * /categorias-bodega/{id}:
 *   put:
 *     summary: Actualiza una categoría de bodega
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
 *               nombre: { type: string }
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Categoría no encontrada
 *       409:
 *         description: Ya existe una categoría con ese nombre
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /categorias-bodega/{id}:
 *   delete:
 *     summary: Elimina una categoría de bodega (borra en cascada sus insumos y lotes)
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
 *         description: Categoría eliminada
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Categoría no encontrada
 */
router.delete('/:id', controller.delete);

export default router;
