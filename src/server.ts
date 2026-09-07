import 'dotenv/config';
import { createApp } from './app';
import { env } from '@config/env';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Fincas y Patitas API (móvil) corriendo en http://localhost:${env.port}`);
  console.log(`Documentación Swagger en http://localhost:${env.port}/docs`);
});
