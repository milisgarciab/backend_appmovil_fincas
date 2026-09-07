import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition: swaggerJSDoc.SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Fincas y Patitas API - Móvil',
    version: '0.1.0',
    description:
      'API REST del backend móvil de Fincas y Patitas (Trimestre 5, ADSO - SENA-CEET). ' +
      'Gestión de animales, reproducción, producción, inventario y salud animal.',
  },
  servers: [
    {
      url: '/api',
      description: 'Servidor local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  // Lee las anotaciones @swagger de las rutas y controladores
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
