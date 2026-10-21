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
 *     summary: Lista los seguimientos de gestacion, con filtros opcionales
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
 *         description: "Pendiente, Gestante, Parida, Abortada o Fallida"
 *       - in: query
 *         name: incluirEliminados
 *         schema: { type: boolean }
 *         description: "'true' incluye tambien los registros con borrado logico (exclusivo de la pantalla de Historial). Por defecto (ausente o 'false') NUNCA se incluyen."
 *     responses:
 *       200:
 *         description: Lista de seguimientos, incluyendo el animal, el macho y los usuarios de auditoria relacionados
 *       401:
 *         description: Token de acceso requerido o invalido
 */
router.get('/', controller.list);
 
/**
 * @openapi
 * /reproduccion/{id}:
 *   get:
 *     summary: Obtiene el detalle de un seguimiento de gestacion (incluye registros con borrado logico, para la pantalla de Historial)
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
 *         description: Token de acceso requerido o invalido
 *       404:
 *         description: Registro no encontrado
 */
router.get('/:id', controller.getById);
 
/**
 * @openapi
 * /reproduccion:
 *   post:
 *     summary: Registra el inicio de una gestacion (paso 1 -- queda en estado Pendiente)
 *     tags: [Reproducción]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [animal_id, fecha_inseminacion]
 *             properties:
 *               animal_id: { type: string }
 *               macho_id: { type: string }
 *               tipo: { type: string, description: '"Monta natural" o "IA"' }
 *               fecha_inseminacion: { type: string, format: date }
 *               fecha_estimada_parto: { type: string, format: date, description: "Obligatoria solo si la especie del animal no es vaca ni cerdo (el backend la calcula solo para esas dos)" }
 *               notas: { type: string }
 *     responses:
 *       201:
 *         description: Registro creado en estado Pendiente, con creado_por tomado del token
 *       400:
 *         description: Datos faltantes o animal_id/macho_id no existe
 *       401:
 *         description: Token de acceso requerido o invalido
 */
router.post('/', controller.create);
 
/**
 * @openapi
 * /reproduccion/{id}:
 *   put:
 *     summary: Edita los campos de un seguimiento que no son del flujo de estados (no cierra ni confirma). Deja constancia de quien edito por ultima vez (editado_por/editado_en).
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
 *               macho_id: { type: string }
 *               tipo: { type: string }
 *               fecha_inseminacion: { type: string, format: date }
 *               fecha_estimada_parto: { type: string, format: date }
 *               notas: { type: string }
 *     responses:
 *       200:
 *         description: Registro actualizado
 *       400:
 *         description: El registro ya esta cerrado (Parida/Abortada/Fallida), ya fue eliminado, o datos invalidos
 *       401:
 *         description: Token de acceso requerido o invalido
 *       404:
 *         description: Registro no encontrado
 */
router.put('/:id', controller.update);
 
/**
 * @openapi
 * /reproduccion/{id}/confirmar:
 *   patch:
 *     summary: "Paso 2 del flujo: confirma la gestacion (Pendiente -> Gestante). Cualquier usuario autenticado puede hacerlo."
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
 *         description: Registro confirmado, con confirmado_por y confirmado_en tomados del token/fecha actual
 *       400:
 *         description: El registro no esta en estado Pendiente, o ya fue eliminado
 *       401:
 *         description: Token de acceso requerido o invalido
 *       404:
 *         description: Registro no encontrado
 */
router.patch('/:id/confirmar', controller.confirmar);
 
/**
 * @openapi
 * /reproduccion/{id}/cerrar:
 *   patch:
 *     summary: "Paso 3 del flujo: cierra el seguimiento con su resultado final (Parida, Abortada o Fallida). 'Fallida' es el unico resultado que tambien se puede aplicar directo desde 'Pendiente' (sin pasar por 'Gestante'), cuando la IA/monta no resulto en preñez."
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
 *             required: [resultado]
 *             properties:
 *               resultado: { type: string, description: '"Parida", "Abortada" o "Fallida"' }
 *               fecha_real_parto: { type: string, format: date, description: "Obligatoria si resultado es Parida" }
 *               notas: { type: string }
 *     responses:
 *       200:
 *         description: Registro cerrado, con cerrado_por y cerrado_en tomados del token/fecha actual
 *       400:
 *         description: El registro ya estaba cerrado, ya fue eliminado, o datos invalidos
 *       401:
 *         description: Token de acceso requerido o invalido
 *       404:
 *         description: Registro no encontrado
 */
router.patch('/:id/cerrar', controller.cerrar);
 
/**
 * @openapi
 * /reproduccion/{id}:
 *   delete:
 *     summary: "Elimina (borrado logico) un registro de seguimiento de gestacion. NO se borra fisicamente de la base de datos -- queda marcado con eliminado_por/eliminado_en y sigue visible en la pantalla de Historial (con incluirEliminados=true)."
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
 *         description: Registro eliminado (logicamente)
 *       400:
 *         description: El registro ya habia sido eliminado
 *       401:
 *         description: Token de acceso requerido o invalido
 *       404:
 *         description: Registro no encontrado
 */
router.delete('/:id', controller.delete);
 
export default router;
 