import { Router } from 'express';
import { UsuarioController } from '@controllers/usuario.controller';
import { authenticate } from '@middlewares/authenticate';
import { requireAdmin } from '@middlewares/requireAdmin';

const router = Router();
const controller = new UsuarioController();

router.use(authenticate);

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