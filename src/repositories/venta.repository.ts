import { prisma } from '../config/prisma';

export class VentaRepository {
  findAll() {
    return prisma.ventas.findMany({ orderBy: { fecha: 'desc' } });
  }

  findById(id: number) {
    return prisma.ventas.findUnique({ where: { id } });
  }

  create(data: {
    producto: string;
    cantidad: number;
    precio_unitario: number;
    total: number;
    comprador?: string;
    fecha: Date;
  }) {
    return prisma.ventas.create({ data });
  }

  update(
    id: number,
    data: Partial<{
      producto: string;
      cantidad: number;
      precio_unitario: number;
      total: number;
      comprador: string;
      fecha: Date;
    }>,
  ) {
    return prisma.ventas.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.ventas.delete({ where: { id } });
  }

  sumByRango(fechaInicio: Date, fechaFin: Date) {
    return prisma.ventas.aggregate({
      _sum: { total: true },
      where: { fecha: { gte: fechaInicio, lte: fechaFin } },
    });
  }
}