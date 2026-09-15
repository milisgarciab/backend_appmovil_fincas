import { Router } from 'express';
import { RegistroPesoController } from '../controllers/registroPeso.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new RegistroPesoController();

router.use(authenticate);

/**
 * @openapi
 * /registros-peso:
 *   get:
 *     summary: Lista los registros de peso, con filtro opcional por animal
 *     tags: [Salud animal]
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
 * /registros-peso/{id}:
 *   get:
 *     summary: Obtiene un registro de peso por id
 *     tags: [Salud animal]
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
 * /registros-peso:
 *   post:
 *     summary: Registra el peso de un animal
 *     tags: [Salud animal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [animal_id, peso_kg]
 *             properties:
 *               animal_id: { type: string }
 *               peso_kg: { type: number }
 *               registrado_en: { type: string, format: date-time, description: "Opcional, por defecto la fecha/hora actual" }
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
 * /registros-peso/{id}:
 *   put:
 *     summary: Actualiza un registro de peso
 *     tags: [Salud animal]
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
 *               peso_kg: { type: number }
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
 * /registros-peso/{id}:
 *   delete:
 *     summary: Elimina un registro de peso
 *     tags: [Salud animal]
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
