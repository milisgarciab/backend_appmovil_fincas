import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@config/swagger';
import { errorHandler, notFoundHandler } from '@middlewares/errorHandler';
import routes from '@routes/index';
import { auditLog } from '@middlewares/auditLog';
 
export function createApp() {
  const app = express();
 
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));
 
  // Documentación interactiva: http://localhost:PORT/docs
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // JSON crudo del contrato OpenAPI: http://localhost:PORT/docs.json
  app.get('/docs.json', (_req, res) => res.json(swaggerSpec));
 
  // 2026-10-21 (bug real encontrado probando Fertilidad en Flutter Web /
  // Chrome): Express agrega un ETag automático a cada res.json(), pero no
  // manda Cache-Control -- eso deja que el navegador decida si cachea la
  // respuesta de un GET. En Chrome, varias pantallas que hacen su propia
  // petición a /api/reproduccion en momentos distintos terminaban viendo
  // una respuesta "congelada" (de antes de cerrar un seguimiento), mientras
  // otra pantalla cargada más recientemente sí veía los datos frescos --
  // parecía que un registro "desaparecía" solo en ciertas pantallas.
  // Esta cabecera le prohíbe a CUALQUIER cliente (navegador o no) guardar
  // en caché las respuestas de la API -- todas las pantallas, ahora y en el
  // futuro, siempre reciben el dato más reciente de la base de datos.
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
 
  app.use(auditLog);
  app.use('/api', routes);
 
  app.use(notFoundHandler);
  app.use(errorHandler);
 
  return app;
}
 