import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import especieRoutes from './especie.routes';
import razaRoutes from './raza.routes';
import loteAnimalRoutes from './loteAnimal.routes';
import animalRoutes from './animal.routes';
import reproduccionRoutes from './reproduccion.routes';
import produccionLecheRoutes from './produccionLeche.routes';
import produccionHuevosRoutes from './produccionHuevos.routes';

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use('/especies', especieRoutes);
router.use('/razas', razaRoutes);
router.use('/lotes-animales', loteAnimalRoutes);
router.use('/animales', animalRoutes);
router.use('/reproduccion', reproduccionRoutes);
router.use('/produccion-leche', produccionLecheRoutes);
router.use('/produccion-huevos', produccionHuevosRoutes);

export default router;