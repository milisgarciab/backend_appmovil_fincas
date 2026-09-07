import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario (queda con rol_id=3, Empleado, por defecto)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_usuario, correo_electronico, contrasena]
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *               correo_electronico:
 *                 type: string
 *               contrasena:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Datos faltantes o mal formados
 *       409:
 *         description: El correo ya está registrado
 */
router.post('/auth/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica a un usuario y devuelve accessToken/refreshToken
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo_electronico, contrasena]
 *             properties:
 *               correo_electronico:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/auth/login', authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renueva el accessToken a partir de un refreshToken vigente
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nuevo accessToken emitido
 *       401:
 *         description: Refresh token inválido o expirado
 */
router.post('/auth/refresh', authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cierra sesión (sin estado en servidor; el cliente descarta sus tokens)
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: Sesión cerrada
 */
router.post('/auth/logout', authController.logout);

export default router;
