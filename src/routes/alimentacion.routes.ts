import { Router } from 'express';
import { AlimentacionController } from '../controllers/alimentacion.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new AlimentacionController();

router.use(authenticate);

/**
 * @openapi
 * /alimentacion:
 *   get:
 *     summary: Lista los registros de alimentación (historial). Filtra por animal_id si se envía
 *     tags: [Alimentacion]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: animal_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de registros de alimentación }
 */
router.get('/', controller.list);

/**
 * @openapi
 * /alimentacion/{id}:
 *   get:
 *     summary: Obtiene un registro de alimentación por id
 *     tags: [Alimentacion]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Registro encontrado }
 *       404: { description: Registro no encontrado }
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /alimentacion:
 *   post:
 *     summary: Registra una alimentación para un animal
 *     tags: [Alimentacion]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [animal_id, tipo_alimento, cantidad, unidad]
 *             properties:
 *               animal_id: { type: integer }
 *               tipo_alimento: { type: string }
 *               cantidad: { type: number }
 *               unidad: { type: string }
 *               fecha: { type: string, format: date, description: 'Por defecto la fecha actual' }
 *     responses:
 *       201: { description: Registro creado }
 *       400: { description: Datos inválidos }
 *       404: { description: El animal indicado no existe }
 */
router.post('/', controller.create);

/**
 * @openapi
 * /alimentacion/{id}:
 *   put:
 *     summary: Actualiza un registro de alimentación
 *     tags: [Alimentacion]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Registro actualizado }
 *       404: { description: Registro no encontrado }
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /alimentacion/{id}:
 *   delete:
 *     summary: Elimina un registro de alimentación
 *     tags: [Alimentacion]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Registro eliminado }
 *       404: { description: Registro no encontrado }
 */
router.delete('/:id', controller.delete);

export default router;