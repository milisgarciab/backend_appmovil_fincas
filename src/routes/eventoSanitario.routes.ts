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
 *         schema: { type: string, enum: ["Vacunación", "Desparasitación", "Tratamiento Médico", "Cirugía", "Chequeo General", "Enfermedad", "Accidente", "Lesión"] }
 *     responses:
 *       200:
 *         description: Lista de eventos, incluyendo el animal relacionado
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
 *         description: Evento encontrado
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
 *     summary: Registra un evento sanitario
 *     description: >
 *       Si tipo_evento es "Vacunación", tipo_vacuna y responsable son obligatorios.
 *       Si tipo_evento es "Enfermedad", "Accidente" o "Lesión", diagnostico y estado son obligatorios.
 *       Si estado es "fallecido", el animal se marca automáticamente como "Muerto" con causa_inactivacion "muerte".
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
 *               tipo_evento: { type: string, enum: ["Vacunación", "Desparasitación", "Tratamiento Médico", "Cirugía", "Chequeo General", "Enfermedad", "Accidente", "Lesión"] }
 *               dosis_aplicada: { type: number }
 *               descripcion_tratamiento: { type: string }
 *               fecha_evento: { type: string, format: date, description: "Opcional, por defecto la fecha actual. No puede ser una fecha futura." }
 *               tipo_vacuna: { type: string, description: "Obligatorio si tipo_evento es Vacunación. Ej. Fiebre Aftosa, Brucelosis, Newcastle." }
 *               responsable: { type: string, description: "Obligatorio si tipo_evento es Vacunación." }
 *               diagnostico: { type: string, description: "Obligatorio si tipo_evento es Enfermedad, Accidente o Lesión." }
 *               estado: { type: string, enum: ["en tratamiento", "recuperado", "fallecido"], description: "Obligatorio si tipo_evento es Enfermedad, Accidente o Lesión." }
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
 *     summary: Actualiza un evento sanitario
 *     description: >
 *       Las mismas reglas condicionales del POST aplican aquí. Si el estado cambia a "fallecido",
 *       el animal se marca automáticamente como "Muerto" con causa_inactivacion "muerte".
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
 *               tipo_evento: { type: string, enum: ["Vacunación", "Desparasitación", "Tratamiento Médico", "Cirugía", "Chequeo General", "Enfermedad", "Accidente", "Lesión"] }
 *               dosis_aplicada: { type: number }
 *               descripcion_tratamiento: { type: string }
 *               fecha_evento: { type: string, format: date, description: "No puede ser una fecha futura." }
 *               tipo_vacuna: { type: string }
 *               responsable: { type: string }
 *               diagnostico: { type: string }
 *               estado: { type: string, enum: ["en tratamiento", "recuperado", "fallecido"] }
 *     responses:
 *       200:
 *         description: Evento actualizado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Evento no encontrado
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /eventos-sanitarios/{id}:
 *   delete:
 *     summary: Elimina un evento sanitario
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
 *         description: Evento eliminado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Evento no encontrado
 */
router.delete('/:id', controller.delete);

export default router;