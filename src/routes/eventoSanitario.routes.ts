import { Router } from 'express';
import { EventoSanitarioController } from '../controllers/eventoSanitario.controller';
import { authenticate } from '../middlewares/authenticate';
 
const router = Router();
const controller = new EventoSanitarioController();
 
router.use(authenticate);
 
/**
 * @openapi
 * /eventos-sanitarios:
 *   get:
 *     summary: Lista los eventos sanitarios, con filtros opcionales
 *     tags: [Salud animal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: animal_id
 *         schema: { type: string }
 *       - in: query
 *         name: tipo_evento
 *         schema: { type: string, enum: ["Vacunación", "Desparasitación", "Tratamiento Médico", "Cirugía", "Chequeo General"] }
 *       - in: query
 *         name: incluir_eliminados
 *         schema: { type: boolean, default: false }
 *         description: Si es "true", incluye también los eventos eliminados (borrado lógico) en la respuesta
 *     responses:
 *       200:
 *         description: Lista de eventos (sin los eliminados por defecto), incluyendo el animal relacionado, quién lo creó/eliminó (creado_por/eliminado_por) y su historial de registro (eventos_sanitarios_historial, orden ascendente por fecha)
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.get('/', controller.list);
 
/**
 * @openapi
 * /eventos-sanitarios/{id}:
 *   get:
 *     summary: Obtiene un evento sanitario por id
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
 *         description: Evento encontrado, incluye animales e historial (eventos_sanitarios_historial) con quién hizo cada acción (Creado/Editado/Resuelto) y cuándo
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Evento no encontrado
 */
router.get('/:id', controller.getById);
 
/**
 * @openapi
 * /eventos-sanitarios:
 *   post:
 *     summary: Registra un evento sanitario. Crea automáticamente una entrada "Creado" en el historial (eventos_sanitarios_historial) con el usuario autenticado.
 *     tags: [Salud animal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [animal_id, tipo_evento]
 *             properties:
 *               animal_id: { type: string }
 *               tipo_evento: { type: string, enum: ["Vacunación", "Desparasitación", "Tratamiento Médico", "Cirugía", "Chequeo General"] }
 *               dosis_aplicada: { type: number }
 *               descripcion_tratamiento: { type: string }
 *               fecha_evento: { type: string, format: date, description: "Opcional, por defecto la fecha actual" }
 *               via_administracion: { type: string, description: "Opcional, ej. Subcutánea, Intramuscular, Oral" }
 *               unidad_dosis: { type: string, description: "Opcional, ej. ml, mg" }
 *               profesional_responsable: { type: string, description: "Opcional, nombre del veterinario o responsable" }
 *               medicamento: { type: string, description: "Opcional, nombre del medicamento/biológico (texto libre, no se enlaza a Bodega)" }
 *               fecha_proximo_refuerzo: { type: string, format: date, description: "Opcional, fecha estimada del próximo refuerzo/dosis" }
 *     responses:
 *       201:
 *         description: Evento creado
 *       400:
 *         description: Datos faltantes o inválidos
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.post('/', controller.create);
 
/**
 * @openapi
 * /eventos-sanitarios/{id}:
 *   put:
 *     summary: Actualiza un evento sanitario. Agrega una entrada "Editado" al historial. Se rechaza (400, EVENTO_RESUELTO) si el evento ya está en estado Resuelto, o (400, EVENTO_ELIMINADO) si ya fue eliminado.
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
 *               tipo_evento: { type: string, enum: ["Vacunación", "Desparasitación", "Tratamiento Médico", "Cirugía", "Chequeo General"] }
 *               dosis_aplicada: { type: number }
 *               descripcion_tratamiento: { type: string }
 *               fecha_evento: { type: string, format: date }
 *               via_administracion: { type: string }
 *               unidad_dosis: { type: string }
 *               profesional_responsable: { type: string }
 *               medicamento: { type: string }
 *               fecha_proximo_refuerzo: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Evento actualizado
 *       400:
 *         description: Datos inválidos, el evento ya está Resuelto (código EVENTO_RESUELTO), o el evento ya fue eliminado (código EVENTO_ELIMINADO)
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Evento no encontrado
 */
router.put('/:id', controller.update);
 
/**
 * @openapi
 * /eventos-sanitarios/{id}/estado:
 *   patch:
 *     summary: Cambia el estado de seguimiento de un incidente de salud (Abierto, En tratamiento, Resuelto). Una vez en Resuelto, el estado queda bloqueado (400, EVENTO_RESUELTO) y el cambio a Resuelto agrega una entrada "Resuelto" al historial. No se puede pasar a Resuelto si el evento tiene un refuerzo pendiente (fecha_proximo_refuerzo definida) -- 400, REFUERZO_PENDIENTE. Se rechaza (400, EVENTO_ELIMINADO) si el evento ya fue eliminado.
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
 *             required: [estado]
 *             properties:
 *               estado: { type: string, enum: ["Abierto", "En tratamiento", "Resuelto"] }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: estado inválido, el evento ya está Resuelto (código EVENTO_RESUELTO), se intentó pasar a Resuelto con un refuerzo pendiente (código REFUERZO_PENDIENTE), o el evento ya fue eliminado (código EVENTO_ELIMINADO)
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Evento no encontrado
 */
router.patch('/:id/estado', controller.cambiarEstado);
 
/**
 * @openapi
 * /eventos-sanitarios/{id}:
 *   delete:
 *     summary: Elimina (borrado lógico) un evento sanitario. El registro NUNCA se borra físicamente -- se marca eliminado_en/eliminado_por_id (usuario autenticado) y se agrega una entrada "Eliminado" al historial, para poder seguir mostrándolo en "Eventos de salud registrados" con ?incluir_eliminados=true.
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
 *         description: Evento eliminado (lógicamente)
 *       400:
 *         description: El evento ya estaba eliminado (código ALREADY_DELETED)
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Evento no encontrado
 */
router.delete('/:id', controller.delete);
 
export default router;
 