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

  create(data: { lote_id?: number; cantidad: number; registrado_en?: Date }) {
    return prisma.produccion_huevos.create({ data });
  }

  update(id: number, data: { cantidad?: number; registrado_en?: Date }) {
    return prisma.produccion_huevos.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.produccion_huevos.delete({ where: { id } });
  }
}
