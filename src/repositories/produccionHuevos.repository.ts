import { prisma } from '../config/prisma';

export interface ProduccionHuevosFiltros {
  lote_id?: number;
}

export class ProduccionHuevosRepository {
  findAll(filtros: ProduccionHuevosFiltros) {
    return prisma.produccion_huevos.findMany({
      where: { lote_id: filtros.lote_id },
      include: { lotes_animales: true },
      orderBy: { registrado_en: 'desc' },
    });
  }

  findById(id: number) {
    return prisma.produccion_huevos.findUnique({
      where: { id },
      include: { lotes_animales: true },
    });
  }

  create(data: { lote_id?: number; cantidad: number; cantidad_rotos?: number; registrado_en?: Date }) {
    return prisma.produccion_huevos.create({ data });
  }

  update(id: number, data: { cantidad?: number; cantidad_rotos?: number; registrado_en?: Date }) {
    return prisma.produccion_huevos.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.produccion_huevos.delete({ where: { id } });
  }
  async resumenHoy() {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 1);
    const where = { registrado_en: { gte: inicio, lt: fin } };

    const [totales, registros] = await Promise.all([
      prisma.produccion_huevos.aggregate({
        _sum: { cantidad: true, cantidad_rotos: true },
        where,
      }),
      prisma.produccion_huevos.findMany({
        where,
        include: { lotes_animales: true },
        orderBy: { registrado_en: 'desc' },
      }),
    ]);

    const totalCantidad = Number(totales._sum.cantidad ?? 0);
    const totalRotos = Number(totales._sum.cantidad_rotos ?? 0);

    return {
      totalBuenos: totalCantidad - totalRotos,
      totalRotos,
      registros,
    };
  }
}
