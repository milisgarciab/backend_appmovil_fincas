import { Router } from 'express';
import { PotreroController } from '../controllers/potrero.controller';
import { authenticate } from '../middlewares/authenticate';
import { uploadImagen } from '../middlewares/upload.middleware';
 
const router = Router();
const controller = new PotreroController();
 
router.use(authenticate);
 
/**
 * @openapi
 * /ubicaciones-potreros:
 *   get:
 *     summary: Lista todos los potreros (catálogo), con sus encargados
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de potreros
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.get('/', controller.list);
 
/**
 * @openapi
 * /ubicaciones-potreros/{id}:
 *   get:
 *     summary: Obtiene un potrero por id, con sus encargados
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Potrero encontrado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Potrero no encontrado
 */
router.get('/:id', controller.getById);
 
/**
 * @openapi
 * /ubicaciones-potreros:
 *   post:
 *     summary: Crea un potrero
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string }
 *               capacidad_animales: { type: integer }
 *               estado: { type: string }
 *               tamano_hectareas: { type: number }
 *               fecha_creacion: { type: string, format: date }
 *               descripcion: { type: string }
 *     responses:
 *       201:
 *         description: Potrero creado
 *       400:
 *         description: nombre es obligatorio
 *       401:
 *         description: Token de acceso requerido o inválido
 */
router.post('/', controller.create);
 
/**
 * @openapi
 * /ubicaciones-potreros/{id}:
 *   put:
 *     summary: Actualiza un potrero
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               capacidad_animales: { type: integer }
 *               estado: { type: string }
 *               tamano_hectareas: { type: number }
 *               fecha_creacion: { type: string, format: date }
 *               descripcion: { type: string }
 *     responses:
 *       200:
 *         description: Potrero actualizado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Potrero no encontrado
 */
router.put('/:id', controller.update);
 
/**
 * @openapi
 * /ubicaciones-potreros/{id}:
 *   delete:
 *     summary: Elimina un potrero
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Potrero eliminado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Potrero no encontrado
 *       409:
 *         description: No se puede eliminar, hay animales asignados
 */
router.delete('/:id', controller.delete);
 
/**
 * @openapi
 * /ubicaciones-potreros/{id}/animales:
 *   get:
 *     summary: Lista los animales asignados directamente a un potrero
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Animales del potrero
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Potrero no encontrado
 */
router.get('/:id/animales', controller.getAnimales);
 
/**
 * @openapi
 * /ubicaciones-potreros/{id}/encargados:
 *   post:
 *     summary: Agrega un encargado al potrero (puede tener varios)
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario_id]
 *             properties:
 *               usuario_id: { type: integer }
 *     responses:
 *       201:
 *         description: Potrero actualizado con el nuevo encargado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Potrero no encontrado
 *       409:
 *         description: El usuario ya es encargado de este potrero, o no existe
 */
router.post('/:id/encargados', controller.agregarEncargado);
 
/**
 * @openapi
 * /ubicaciones-potreros/{id}/encargados/{usuarioId}:
 *   delete:
 *     summary: Quita un encargado del potrero
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Potrero actualizado sin ese encargado
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Potrero no encontrado, o el usuario no era encargado
 */
router.delete('/:id/encargados/:usuarioId', controller.quitarEncargado);
 
/**
 * @openapi
 * /ubicaciones-potreros/{id}/foto:
 *   post:
 *     summary: Sube (o reemplaza) la foto del potrero, vía Cloudinary
 *     tags: [Potreros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Potrero actualizado con la nueva foto_url
 *       400:
 *         description: Falta el archivo de la foto
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Potrero no encontrado
 *       502:
 *         description: Falló la subida a Cloudinary
 */
router.post('/:id/foto', uploadImagen.single('foto'), controller.subirFoto);
 
export default router;
 