import { Router } from 'express';
<<<<<<< HEAD
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
// Próximas rutas se importan y montan aquí a medida que se definan las entidades:
// import animalRoutes from './animal.routes';

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
// router.use(animalRoutes);
=======
import especieRoutes from './especie.routes';
import razaRoutes from './raza.routes';
import loteAnimalRoutes from './loteAnimal.routes';
import animalRoutes from './animal.routes';
// import authRoutes from './auth.routes'; // la que ya tengas de Auth

const router = Router();

// router.use('/auth', authRoutes); // deja esta si ya la tenías
router.use('/especies', especieRoutes);
router.use('/razas', razaRoutes);
router.use('/lotes-animales', loteAnimalRoutes);
router.use('/animales', animalRoutes);
>>>>>>> 0704a20c08e8902d6a064f5778b6e6cc5f4a0123

export default router;