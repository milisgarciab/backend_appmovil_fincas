import { Router } from 'express';
import { LoteAnimalController } from '../controllers/loteAnimal.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new LoteAnimalController();

router.use(authenticate);

/**
 * @openapi
 * /lotes-animales:
 *   get:
 *     summary: Lista todos los lotes de animales (catálogo)
 *     tags: [Lotes de animales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de lotes
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.get('/', controller.list);

/**
 * @openapi
 * /lotes-animales/{id}:
 *   get:
 *     summary: Obtiene un lote de animales por id
 *     tags: [Lotes de animales]
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
 *         description: Lote encontrado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Lote no encontrado
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /lotes-animales:
 *   post:
 *     summary: Crea un lote de animales
 *     tags: [Lotes de animales]
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
 *               potrero_id: { type: string }
 *     responses:
 *       201:
 *         description: Lote creado
 *       400:
 *         description: nombre es obligatorio
 *       401:
 *         description: Token de acceso requerido o inválido
 *       409:
 *         description: potrero_id no existe
 */
router.post('/', controller.create);

/**
 * @openapi
 * /lotes-animales/{id}:
 *   put:
 *     summary: Actualiza un lote de animales
 *     tags: [Lotes de animales]
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
 *               potrero_id: { type: string }
 *     responses:
 *       200:
 *         description: Lote actualizado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Lote no encontrado
 *       409:
 *         description: potrero_id no existe
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /lotes-animales/{id}:
 *   delete:
 *     summary: Elimina un lote de animales
 *     tags: [Lotes de animales]
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
 *         description: Lote eliminado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Lote no encontrado
 *       409:
 *         description: No se puede eliminar, hay animales asociados
 */
router.delete('/:id', controller.delete);

export default router;
