import { prisma } from '@config/prisma';

// Capa de acceso a datos: aquí solo se habla con Prisma/la base de datos, nada de lógica de negocio.
export class HealthRepository {
  async checkDatabaseConnection(): Promise<boolean> {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  }
}
