import { Router } from 'express';
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

export default router;