import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Auth]
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Auth]
 */
router.post("/reset-password", authController.resetPassword);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 */
router.post("/logout", authController.logout);

export default router;