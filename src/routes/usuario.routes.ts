import { Router } from 'express';
import { UsuarioController } from '@controllers/usuario.controller';
import { authenticate } from '@middlewares/authenticate';
import { requireAdmin } from '@middlewares/requireAdmin';

const router = Router();
const controller = new UsuarioController();

router.use(authenticate);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos los usuarios (solo Administrador)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de usuarios }
 *       403: { description: Requiere rol de Administrador }
 */
router.get('/', requireAdmin, controller.list);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Consulta un usuario por id (solo Administrador)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Usuario encontrado }
 *       403: { description: Requiere rol de Administrador }
 *       404: { description: Usuario no encontrado }
 */
router.get('/:id', requireAdmin, controller.getById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un usuario con el rol que se indique (solo Administrador)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_usuario, correo_electronico, contrasena, rol_id]
 *             properties:
 *               nombre_usuario: { type: string }
 *               correo_electronico: { type: string }
 *               contrasena: { type: string }
 *               telefono: { type: string }
 *               rol_id: { type: integer, enum: [1, 2, 3], description: '1=Administrador, 2=Encargado, 3=Empleado' }
 *     responses:
 *       201: { description: Usuario creado }
 *       400: { description: Datos inválidos }
 *       403: { description: Requiere rol de Administrador }
 *       409: { description: El correo ya está registrado }
 */
router.post('/', requireAdmin, controller.crear);

/**
 * @swagger
 * /users/{id}/rol:
 *   patch:
 *     summary: Asigna un rol distinto a un usuario (solo Administrador)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rol_id]
 *             properties:
 *               rol_id: { type: integer, enum: [1, 2, 3] }
 *     responses:
 *       200: { description: Rol actualizado }
 *       400: { description: rol_id inválido }
 *       403: { description: Requiere rol de Administrador }
 *       404: { description: Usuario no encontrado }
 */
router.patch('/:id/rol', requireAdmin, controller.asignarRol);

/**
 * @swagger
 * /users/{id}/profile:
 *   put:
 *     summary: Actualiza nombre y/o contraseña (propio usuario, o cualquiera si eres Administrador) - HU-04
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario: { type: string }
 *               contrasena: { type: string }
 *     responses:
 *       200: { description: Perfil actualizado }
 *       400: { description: Datos inválidos }
 *       403: { description: No autorizado para editar este perfil }
 *       404: { description: Usuario no encontrado }
 */
router.put('/:id/profile', controller.actualizarPerfil);

/**
 * @swagger
 * /users/{id}/reset-password:
 *   patch:
 *     summary: Restablece manualmente la contraseña de un usuario (solo Administrador) - HU-03
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nueva_contrasena]
 *             properties:
 *               nueva_contrasena: { type: string }
 *     responses:
 *       200: { description: Contraseña restablecida }
 *       400: { description: Datos inválidos }
 *       403: { description: Requiere rol de Administrador }
 *       404: { description: Usuario no encontrado }
 */
router.patch('/:id/reset-password', requireAdmin, controller.resetearContrasena);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Activa o desactiva un usuario (solo Administrador) - HU-05
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado: { type: string, enum: [Activo, Inactivo] }
 *     responses:
 *       200: { description: Estado actualizado }
 *       400: { description: estado inválido }
 *       403: { description: Requiere rol de Administrador }
 *       404: { description: Usuario no encontrado }
 */
router.patch('/:id/status', requireAdmin, controller.cambiarEstado);

export default router;