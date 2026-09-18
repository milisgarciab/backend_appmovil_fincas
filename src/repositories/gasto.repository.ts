import { prisma } from '../config/prisma';

export class GastoRepository {
  findAll() {
    return prisma.gastos.findMany({ orderBy: { fecha: 'desc' } });
  }

  findById(id: number) {
    return prisma.gastos.findUnique({ where: { id } });
  }

  create(data: { categoria: string; descripcion?: string; monto: number; fecha: Date }) {
    return prisma.gastos.create({ data });
  }

  update(id: number, data: Partial<{ categoria: string; descripcion: string; monto: number; fecha: Date }>) {
    return prisma.gastos.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.gastos.delete({ where: { id } });
  }

  sumByRango(fechaInicio: Date, fechaFin: Date) {
    return prisma.gastos.aggregate({
      _sum: { monto: true },
      where: { fecha: { gte: fechaInicio, lte: fechaFin } },
    });
  }
}