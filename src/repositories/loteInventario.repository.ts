import { prisma } from '../config/prisma';

export interface LoteInventarioFiltros {
  insumo_id?: number;
  proximosAVencer?: number; // días
}

export class LoteInventarioRepository {
  findAll(filtros: LoteInventarioFiltros) {
    const where: {
      insumo_id?: number;
      fecha_vencimiento?: { lte: Date };
    } = {
      insumo_id: filtros.insumo_id,
    };

    if (filtros.proximosAVencer !== undefined) {
      const limite = new Date();
      limite.setDate(limite.getDate() + filtros.proximosAVencer);
      where.fecha_vencimiento = { lte: limite };
    }

    return prisma.lotes_inventario.findMany({
      where,
      include: { bodega: true },
      orderBy: { fecha_vencimiento: 'asc' },
    });
  }

  findById(id: number) {
    return prisma.lotes_inventario.findUnique({
      where: { id },
      include: { bodega: true },
    });
  }

  create(data: {
    insumo_id: number;
    numero_lote?: string;
    fecha_vencimiento: Date;
    cantidad_disponible: number;
    costo_unitario: number;
  }) {
    return prisma.lotes_inventario.create({ data });
  }

  update(
    id: number,
    data: {
      numero_lote?: string;
      fecha_vencimiento?: Date;
      cantidad_disponible?: number;
      costo_unitario?: number;
    },
  ) {
    return prisma.lotes_inventario.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.lotes_inventario.delete({ where: { id } });
  }
}
