import { prisma } from '../config/prisma';

export interface MovimientoFiltros {
  insumo_id?: number;
  tipo?: string;
}

export class MovimientoInventarioRepository {
  findAll(filtros: MovimientoFiltros) {
    return prisma.movimientos_inventario.findMany({
      where: { insumo_id: filtros.insumo_id, tipo: filtros.tipo },
      include: { bodega: true },
      orderBy: { fecha: 'desc' },
    });
  }

  findInsumo(insumoId: number) {
    return prisma.bodega.findUnique({ where: { id: insumoId } });
  }

  async registrarMovimiento(data: { insumo_id: number; tipo: string; cantidad: number; motivo?: string }) {
    return prisma.$transaction(async (tx) => {
      const insumo = await tx.bodega.findUnique({ where: { id: data.insumo_id } });
      if (!insumo) {
        throw new Error('INSUMO_NOT_FOUND');
      }

      const stockActual = Number(insumo.stock_actual);
      let nuevoStock: number;

      if (data.tipo === 'Entrada') {
        nuevoStock = stockActual + data.cantidad;
      } else if (data.tipo === 'Salida') {
        nuevoStock = stockActual - data.cantidad;
        if (nuevoStock < 0) {
          throw new Error('STOCK_INSUFICIENTE');
        }
      } else {
        // Ajuste: la cantidad puede ser positiva o negativa, se suma directo
        nuevoStock = stockActual + data.cantidad;
        if (nuevoStock < 0) {
          throw new Error('STOCK_INSUFICIENTE');
        }
      }

      await tx.bodega.update({ where: { id: data.insumo_id }, data: { stock_actual: nuevoStock } });

      return tx.movimientos_inventario.create({
        data: {
          insumo_id: data.insumo_id,
          tipo: data.tipo,
          cantidad: data.cantidad,
          motivo: data.motivo,
        },
      });
    });
  }
}