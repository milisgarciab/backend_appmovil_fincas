import { prisma } from '../config/prisma';
 
export interface RangoFechas {
  fechaInicio?: Date;
  fechaFin?: Date;
}
 
export class IndicadoresProduccionRepository {
  aggregateLeche({ fechaInicio, fechaFin }: RangoFechas) {
    return prisma.produccion_leche.aggregate({
      _sum: { litros: true },
      _avg: { litros: true },
      _count: { id: true },
      where: {
        registrado_en: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        // Un registro borrado no debe contar en los indicadores
        // (2026-10-01) — evita comparaciones "vs ayer" infladas o falsas.
        eliminado_en: null,
      },
    });
  }
 
  aggregateHuevos({ fechaInicio, fechaFin }: RangoFechas) {
    return prisma.produccion_huevos.aggregate({
      // `cantidad_rotos` se suma aparte (2026-11-23) para el desglose por
      // rango: producidos, rotos y aprovechables. Cambio aditivo.
      _sum: { cantidad: true, cantidad_rotos: true },
      _avg: { cantidad: true },
      _count: { id: true },
      where: {
        registrado_en: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        eliminado_en: null,
      },
    });
  }
 
  countAnimalesConProduccionLeche({ fechaInicio, fechaFin }: RangoFechas) {
    // No cuenta los registros hechos "por lote" (animal_id nulo) — ver
    // decisiones-diseno-vs-backend-produccion.md, sección "Modalidad de registro".
    return prisma.produccion_leche.findMany({
      where: {
        registrado_en: { gte: fechaInicio, lte: fechaFin },
        animal_id: { not: null },
        eliminado_en: null,
      },
      select: { animal_id: true },
      distinct: ['animal_id'],
    });
  }
}
 