import { Router } from 'express';
import healthRoutes from './health.routes';
// Próximas rutas se importan y montan aquí a medida que se definan las entidades:
// import authRoutes from './auth.routes';
// import animalRoutes from './animal.routes';

const router = Router();

router.use(healthRoutes);
// router.use(authRoutes);
// router.use(animalRoutes);

export default router;
