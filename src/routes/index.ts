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
import categoriaBodegaRoutes from './categoriaBodega.routes';
import bodegaRoutes from './bodega.routes';
import loteInventarioRoutes from './loteInventario.routes';
import eventoSanitarioRoutes from './eventoSanitario.routes';
import registroPesoRoutes from './registroPeso.routes';

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
router.use('/categorias-bodega', categoriaBodegaRoutes);
router.use('/bodega', bodegaRoutes);
router.use('/lotes-inventario', loteInventarioRoutes);
router.use('/eventos-sanitarios', eventoSanitarioRoutes);
router.use('/registros-peso', registroPesoRoutes);

export default router;