import { Router } from 'express';
import { ProduccionLecheController } from '../controllers/produccionLeche.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new ProduccionLecheController();

router.use(authenticate);

/**
 * @openapi
 * /produccion-leche:
 *   get:
 *     summary: Lista los registros de producción de leche, con filtro opcional por animal
 *     tags: [Producción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: animal_id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de registros, incluyendo el animal relacionado
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.get('/', controller.list);

/**
 * @openapi
 * /produccion-leche/{id}:
 *   get:
 *     summary: Obtiene un registro de producción de leche
 *     tags: [Producción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Registro encontrado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Registro no encontrado
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /produccion-leche:
 *   post:
 *     summary: Registra una ordeña
 *     tags: [Producción]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [animal_id, litros]
 *             properties:
 *               animal_id: { type: string }
 *               litros: { type: number }
 *               jornada: { type: string, enum: ["Mañana", "Tarde"] }
 *               registrado_en: { type: string, format: date-time, description: "Opcional, para cargar datos de días anteriores. Si se omite, usa la fecha/hora actual." }
 *     responses:
 *       201:
 *         description: Registro creado
 *       400:
 *         description: Datos faltantes o inválidos
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.post('/', controller.create);

/**
 * @openapi
 * /produccion-leche/{id}:
 *   put:
 *     summary: Actualiza un registro de producción de leche
 *     tags: [Producción]
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
 *               litros: { type: number }
 *               jornada: { type: string, enum: ["Mañana", "Tarde"] }
 *               registrado_en: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Registro actualizado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Registro no encontrado
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /produccion-leche/{id}:
 *   delete:
 *     summary: Elimina un registro de producción de leche
 *     tags: [Producción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Registro eliminado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Registro no encontrado
 */
router.delete('/:id', controller.delete);

export default router;
