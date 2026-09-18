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
      },
    });
  }

  aggregateHuevos({ fechaInicio, fechaFin }: RangoFechas) {
    return prisma.produccion_huevos.aggregate({
      _sum: { cantidad: true },
      _avg: { cantidad: true },
      _count: { id: true },
      where: {
        registrado_en: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
    });
  }

  countAnimalesConProduccionLeche({ fechaInicio, fechaFin }: RangoFechas) {
    return prisma.produccion_leche.findMany({
      where: { registrado_en: { gte: fechaInicio, lte: fechaFin } },
      select: { animal_id: true },
      distinct: ['animal_id'],
    });
  }
}