import { Router } from 'express';
import { NacimientoController } from '../controllers/nacimiento.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new NacimientoController();

router.use(authenticate);

/**
 * @openapi
 * /nacimientos:
 *   get:
 *     summary: Lista los animales nacidos en la finca (origen=Nacido, con fecha_nacimiento), con sus progenitores
 *     tags: [Reproduccion]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de nacimientos }
 */
router.get('/', controller.list);

/**
 * @openapi
 * /nacimientos/{id}/descendencia:
 *   get:
 *     summary: Lista las crías de un animal (donde es madre o padre)
 *     tags: [Reproduccion]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lista de crías }
 *       404: { description: Animal no encontrado }
 */
router.get('/:id/descendencia', controller.getDescendencia);

export default router;