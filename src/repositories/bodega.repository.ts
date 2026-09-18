import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export interface BodegaFiltros {
  categoria_id?: number;
  stock_bajo?: boolean;
}

export class BodegaRepository {
  async findAll(filtros: BodegaFiltros) {
    const insumos = await prisma.bodega.findMany({
      where: { categoria_id: filtros.categoria_id },
      include: { categorias_bodega: true },
      orderBy: { nombre: 'asc' },
    });

    const conIndicador = insumos.map((i) => ({
      ...i,
      stock_bajo: Number(i.stock_actual) <= Number(i.stock_minimo),
    }));

    if (filtros.stock_bajo) {
      return conIndicador.filter((i) => i.stock_bajo);
    }
    return conIndicador;
  }

  findById(id: number) {
    return prisma.bodega.findUnique({
      where: { id },
      include: { categorias_bodega: true },
    });
  }

  create(data: { categoria_id: number; nombre: string; unidad_medida: string; stock_actual?: number; stock_minimo?: number }) {
    return prisma.bodega.create({ data });
  }

  update(id: number, data: { categoria_id?: number; nombre?: string; unidad_medida?: string; stock_minimo?: number }) {
    return prisma.bodega.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.bodega.delete({ where: { id } });
  }

  // HU-17: mueve stock de forma atómica, validando que no quede negativo (a nivel de base de datos).
  async registrarMovimiento(id: number, cantidadConSigno: number) {
    return prisma.bodega.update({
      where: { id, stock_actual: { gte: cantidadConSigno < 0 ? -cantidadConSigno : 0 } },
      data: { stock_actual: { increment: cantidadConSigno } },
    });
  }
}