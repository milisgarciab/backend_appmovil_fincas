import { Router } from 'express';
import { AnimalController } from '../controllers/animal.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new AnimalController();

router.use(authenticate);

/**
 * @openapi
 * /animales:
 *   get:
 *     summary: Lista animales, paginado, con filtros opcionales y búsqueda
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: especie_id
 *         schema: { type: string }
 *       - in: query
 *         name: raza_id
 *         schema: { type: string }
 *       - in: query
 *         name: lote_id
 *         schema: { type: string }
 *       - in: query
 *         name: estado
 *         schema: { type: string }
 *         description: 'Por defecto solo devuelve estado="Activo". Envía estado=Todos para ver todos los estados, u otro valor puntual (ej. Vendido, Muerto) para filtrar por ese.'
 *       - in: query
 *         name: genero
 *         schema: { type: string }
 *         description: "Valores esperados: Macho / Hembra (no validado estrictamente aún)"
 *       - in: query
 *         name: buscar
 *         schema: { type: string }
 *         description: "Busca coincidencias parciales (sin distinguir mayúsculas) en nombre o codigo"
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *         description: "Máximo 100"
 *     responses:
 *       200:
 *         description: "Objeto { data: Animal[], paginacion: { pagina, limite, total, totalPaginas } }"
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.get('/', controller.list);

/**
 * @openapi
 * /animales/{id}:
 *   get:
 *     summary: Obtiene el detalle de un animal (con especie, raza y lote)
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Animal encontrado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Animal no encontrado
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /animales/{id}/historial:
 *   get:
 *     summary: Historial unificado del animal (eventos sanitarios, producción de leche, registros de peso, seguimiento de gestación)
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: "Objeto { animal, historial: { eventosSanitarios, produccionLeche, registrosPeso, seguimientoGestacion, lineaDeTiempo } }"
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Animal no encontrado
 */
router.get('/:id/historial', controller.getHistorial);

/**
 * @openapi
 * /animales:
 *   post:
 *     summary: Crea un animal (el codigo se autogenera, no se envía)
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [genero, especie_id, raza_id]
 *             properties:
 *               nombre: { type: string }
 *               genero: { type: string, description: "Macho / Hembra (texto libre por ahora)" }
 *               estado: { type: string }
 *               fecha_nacimiento: { type: string, format: date }
 *               especie_id: { type: string }
 *               raza_id: { type: string }
 *               lote_id: { type: string }
 *               madre_id: { type: string }
 *               padre_id: { type: string }
 *     responses:
 *       201:
 *         description: Animal creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.post('/', controller.create);

/**
 * @openapi
 * /animales/{id}:
 *   put:
 *     summary: Actualiza un animal
 *     tags: [Animales]
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
 *               nombre: { type: string }
 *               genero: { type: string }
 *               estado: { type: string }
 *               fecha_nacimiento: { type: string, format: date }
 *               especie_id: { type: string }
 *               raza_id: { type: string }
 *               lote_id: { type: string }
 *               madre_id: { type: string }
 *               padre_id: { type: string }
 *     responses:
 *       200:
 *         description: Animal actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /animales/{id}:
 *   delete:
 *     summary: Elimina un animal (DELETE real en base de datos, sin soft delete)
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Animal eliminado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Animal no encontrado
 */
router.delete('/:id', controller.delete);

export default router;