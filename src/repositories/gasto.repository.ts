import { prisma } from '../config/prisma';

export class GastoRepository {
  async findAll() {
    return prisma.gastos.findMany({ orderBy: { fecha: 'desc' } });
  }

  async findById(id: number) {
    return prisma.gastos.findUnique({ where: { id } });
  }

  async create(data: { categoria: string; descripcion?: string; monto: number; fecha: Date }) {
    return prisma.gastos.create({ data });
  }

  async sumByRango(desde?: Date, hasta?: Date) {
    const result = await prisma.gastos.aggregate({
      _sum: { monto: true },
      where: {
        fecha: {
          ...(desde ? { gte: desde } : {}),
          ...(hasta ? { lte: hasta } : {}),
        },
      },
    });
    return result._sum.monto ?? 0;
  }
}