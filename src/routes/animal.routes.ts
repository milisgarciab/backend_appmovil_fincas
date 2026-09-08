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
 *     summary: Lista animales, con filtros opcionales
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
 *       - in: query
 *         name: genero
 *         schema: { type: string }
 *         description: "Valores esperados: Macho / Hembra (no validado estrictamente aún)"
 *     responses:
 *       200:
 *         description: Lista de animales, incluyendo especie, raza y lote relacionados
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
 * /animales:
 *   post:
 *     summary: Crea un animal
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, genero, especie_id]
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