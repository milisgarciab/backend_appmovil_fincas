import { Router } from 'express';
import { AuditoriaController } from '../controllers/auditoria.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();
const controller = new AuditoriaController();

router.use(authenticate);

/**
 * @openapi
 * /auditoria:
 *   get:
 *     summary: Consulta el registro de auditoría (últimas 200 acciones de escritura), solo Administrador
 *     tags: [Auditoria]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         schema: { type: integer }
 *       - in: query
 *         name: metodo
 *         schema: { type: string, enum: [POST, PUT, PATCH, DELETE] }
 *     responses:
 *       200: { description: Lista de registros de auditoría }
 *       403: { description: Requiere rol de Administrador }
 */
router.get('/', requireAdmin, controller.list);

export default router;