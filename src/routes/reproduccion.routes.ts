import { Router } from 'express';
import { SeguimientoGestacionController } from '../controllers/seguimientoGestacion.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new SeguimientoGestacionController();

router.use(authenticate);

/**
 * @openapi
 * /reproduccion:
 *   get:
 *     summary: Lista los seguimientos de gestación, con filtros opcionales
 *     tags: [Reproducción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: animal_id
 *         schema: { type: string }
 *       - in: query
 *         name: estado
 *         schema: { type: string }
 *         description: "Ej: Gestante, Parida, Abortada (texto libre)"
 *     responses:
 *       200:
 *         description: Lista de seguimientos, incluyendo el animal relacionado
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.get('/', controller.list);

/**
 * @openapi
 * /reproduccion/{id}:
 *   get:
 *     summary: Obtiene el detalle de un seguimiento de gestación
 *     tags: [Reproducción]
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
 * /reproduccion:
 *   post:
 *     summary: Registra el inicio de una gestación
 *     tags: [Reproducción]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [animal_id, fecha_inseminacion, fecha_estimada_parto]
 *             properties:
 *               animal_id: { type: string }
 *               fecha_inseminacion: { type: string, format: date }
 *               fecha_estimada_parto: { type: string, format: date, description: "Se ingresa manualmente, no se calcula" }
 *               estado: { type: string, description: 'Por defecto "Gestante"' }
 *               notas: { type: string }
 *     responses:
 *       201:
 *         description: Registro creado
 *       400:
 *         description: Datos faltantes o animal_id no existe
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.post('/', controller.create);

/**
 * @openapi
 * /reproduccion/{id}:
 *   put:
 *     summary: Actualiza un seguimiento de gestación (ej. registrar fecha_real_parto y cambiar estado)
 *     tags: [Reproducción]
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
 *               fecha_inseminacion: { type: string, format: date }
 *               fecha_estimada_parto: { type: string, format: date }
 *               fecha_real_parto: { type: string, format: date }
 *               estado: { type: string }
 *               notas: { type: string }
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
 * /reproduccion/{id}:
 *   delete:
 *     summary: Elimina un registro de seguimiento de gestación
 *     tags: [Reproducción]
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
