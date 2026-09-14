import { prisma } from '../config/prisma';

export class VentaRepository {
  async findAll() {
    return prisma.ventas.findMany({ orderBy: { fecha: 'desc' } });
  }

  async findById(id: number) {
    return prisma.ventas.findUnique({ where: { id } });
  }

  async create(data: {
    producto: string;
    cantidad: number;
    precio_unitario: number;
    total: number;
    comprador?: string;
    fecha: Date;
  }) {
    return prisma.ventas.create({ data });
  }

  async sumByRango(desde?: Date, hasta?: Date) {
    const result = await prisma.ventas.aggregate({
      _sum: { total: true },
      where: {
        fecha: {
          ...(desde ? { gte: desde } : {}),
          ...(hasta ? { lte: hasta } : {}),
        },
      },
    });
    return result._sum.total ?? 0;
  }
}