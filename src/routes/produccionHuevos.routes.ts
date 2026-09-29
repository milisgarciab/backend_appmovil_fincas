import { Router } from 'express';
import { ProduccionHuevosController } from '../controllers/produccionHuevos.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new ProduccionHuevosController();

router.use(authenticate);

/**
 * @openapi
 * /produccion-huevos:
 *   get:
 *     summary: Lista los registros de producción de huevos, con filtro opcional por lote
 *     tags: [Producción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lote_id
 *         schema: { type: string }
 *       - in: query
 *         name: animal_id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de registros, incluyendo el lote o el animal relacionado
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.get('/', controller.list);

/**
 * @openapi
 * /produccion-huevos/{id}:
 *   get:
 *     summary: Obtiene un registro de producción de huevos
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
 * /produccion-huevos:
 *   post:
 *     summary: Registra una recolección de huevos
 *     tags: [Producción]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cantidad]
 *             description: "lote_id y animal_id son ambos opcionales, pero no se pueden indicar los dos al mismo tiempo."
 *             properties:
 *               lote_id: { type: string, description: "Opcional — registro por lote (ej. galpón)" }
 *               animal_id: { type: string, description: "Opcional — registro por animal individual" }
 *               cantidad: { type: integer }
 *               cantidad_rotos: { type: integer, description: "Opcional, no puede superar cantidad" }
 *               observaciones: { type: string, maxLength: 255 }
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
 * /produccion-huevos/{id}:
 *   put:
 *     summary: Actualiza un registro de producción de huevos
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
 *               cantidad: { type: integer }
 *               cantidad_rotos: { type: integer }
 *               observaciones: { type: string, maxLength: 255 }
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
 * /produccion-huevos/{id}:
 *   delete:
 *     summary: Elimina un registro de producción de huevos
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
