import { prisma } from '../config/prisma';

export interface BodegaFiltros {
  categoria_id?: number;
}

export class BodegaRepository {
  findAll(filtros: BodegaFiltros) {
    return prisma.bodega.findMany({
      where: { categoria_id: filtros.categoria_id },
      include: { categorias_bodega: true },
      orderBy: { nombre: 'asc' },
    });
  }

  findById(id: number) {
    return prisma.bodega.findUnique({
      where: { id },
      include: { categorias_bodega: true },
    });
  }

  create(data: { categoria_id: number; nombre: string; unidad_medida: string }) {
    return prisma.bodega.create({ data });
  }

  update(id: number, data: { categoria_id?: number; nombre?: string; unidad_medida?: string }) {
    return prisma.bodega.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.bodega.delete({ where: { id } });
  }
}
