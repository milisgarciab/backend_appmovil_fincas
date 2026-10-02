import { prisma } from '../config/prisma';
 
export interface ProduccionHuevosFiltros {
  lote_id?: number;
  animal_id?: number;
  // Ver comentario en produccionLeche.repository.ts.
  incluir_eliminados?: boolean;
}
 
const INCLUDE_CON_AUDITORIA = {
  lotes_animales: true,
  animales: true,
  creado_por: { select: { id: true, nombre_usuario: true } },
  eliminado_por: { select: { id: true, nombre_usuario: true } },
};
 
export class ProduccionHuevosRepository {
  findAll(filtros: ProduccionHuevosFiltros) {
    return prisma.produccion_huevos.findMany({
      where: {
        lote_id: filtros.lote_id,
        animal_id: filtros.animal_id,
        ...(filtros.incluir_eliminados ? {} : { eliminado_en: null }),
      },
      include: INCLUDE_CON_AUDITORIA,
      orderBy: { registrado_en: 'desc' },
    });
  }
 
  findById(id: number) {
    return prisma.produccion_huevos.findUnique({
      where: { id },
      include: INCLUDE_CON_AUDITORIA,
    });
  }
 
  create(data: {
    lote_id?: number;
    animal_id?: number;
    cantidad: number;
    cantidad_rotos?: number;
    jornada?: string;
    observaciones?: string;
    registrado_en?: Date;
    creado_por_id?: number;
  }) {
    return prisma.produccion_huevos.create({ data, include: INCLUDE_CON_AUDITORIA });
  }
 
  update(
    id: number,
    data: {
      cantidad?: number;
      cantidad_rotos?: number;
      jornada?: string;
      observaciones?: string;
      registrado_en?: Date;
    },
  ) {
    return prisma.produccion_huevos.update({ where: { id }, data, include: INCLUDE_CON_AUDITORIA });
  }
 
  // Borrado lógico — ver comentario en produccionLeche.repository.ts.
  softDelete(id: number, eliminadoPorId: number) {
    return prisma.produccion_huevos.update({
      where: { id },
      data: { eliminado_en: new Date(), eliminado_por_id: eliminadoPorId },
      include: INCLUDE_CON_AUDITORIA,
    });
  }
 
  async resumenHoy() {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 1);
    const where = { registrado_en: { gte: inicio, lt: fin }, eliminado_en: null };
 
    const [totales, registros] = await Promise.all([
      prisma.produccion_huevos.aggregate({
        _sum: { cantidad: true, cantidad_rotos: true },
        where,
      }),
      prisma.produccion_huevos.findMany({
        where,
        include: INCLUDE_CON_AUDITORIA,
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
 