import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@config/swagger';
import { errorHandler, notFoundHandler } from '@middlewares/errorHandler';
import routes from '@routes/index';

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

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
