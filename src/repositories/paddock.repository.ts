import { prisma } from '@config/prisma';

export class PaddockRepository {
  async findPotreroConAnimales(id: number) {
    return prisma.ubicaciones_potreros.findUnique({
      where: { id },
      include: {
        animales_directo: {
          select: { id: true, codigo: true, nombre: true, genero: true, estado: true },
        },
      },
    });
  }
}