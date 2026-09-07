import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
// Próximas rutas se importan y montan aquí a medida que se definan las entidades:
// import animalRoutes from './animal.routes';

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
// router.use(animalRoutes);

export default router;
