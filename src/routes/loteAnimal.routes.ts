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
 *             required: [nombre, especie_id]
 *             properties:
 *               nombre: { type: string }
 *               especie_id: { type: integer }
 *               fecha_creacion: { type: string, format: date }
 *               capacidad_estimada: { type: integer }
 *               descripcion: { type: string }
 *               encargado_id: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Lote creado
 *       400:
 *         description: nombre o especie_id faltante
 *       401:
 *         description: Token de acceso requerido o inválido
 *       409:
 *         description: especie_id o encargado_id no existen
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
 *               especie_id: { type: integer }
 *               fecha_creacion: { type: string, format: date }
 *               capacidad_estimada: { type: integer }
 *               descripcion: { type: string }
 *               encargado_id: { type: integer, nullable: true }
 *     responses:
 *       200:
 *         description: Lote actualizado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Lote no encontrado
 *       409:
 *         description: especie_id o encargado_id no existen
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
 
/**
 * @openapi
 * /lotes-animales/{id}/encargado:
 *   patch:
 *     summary: Asigna o quita el encargado de un lote (un único usuario)
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
 *               encargado_id: { type: integer, nullable: true }
 *     responses:
 *       200:
 *         description: Lote actualizado con su nuevo encargado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Lote no encontrado
 *       409:
 *         description: encargado_id no existe
 */
router.patch('/:id/encargado', controller.asignarEncargado);
 
export default router;
 