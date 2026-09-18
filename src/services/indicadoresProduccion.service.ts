import { IndicadoresProduccionRepository } from '../repositories/indicadoresProduccion.repository';

export interface IndicadoresInput {
  fecha_inicio?: string;
  fecha_fin?: string;
}

export class IndicadoresProduccionService {
  private repository = new IndicadoresProduccionRepository();

  async obtener(input: IndicadoresInput) {
    const fechaInicio = input.fecha_inicio ? new Date(input.fecha_inicio) : undefined;
    const fechaFin = input.fecha_fin ? new Date(input.fecha_fin) : undefined;

    const [leche, huevos, animalesConLeche] = await Promise.all([
      this.repository.aggregateLeche({ fechaInicio, fechaFin }),
      this.repository.aggregateHuevos({ fechaInicio, fechaFin }),
      this.repository.countAnimalesConProduccionLeche({ fechaInicio, fechaFin }),
    ]);

    return {
      periodo: {
        fecha_inicio: input.fecha_inicio ?? null,
        fecha_fin: input.fecha_fin ?? null,
      },
      leche: {
        total_litros: Number(leche._sum.litros ?? 0),
        promedio_litros_por_registro: Number(leche._avg.litros ?? 0),
        cantidad_registros: leche._count.id,
        animales_productivos: animalesConLeche.length,
      },
      huevos: {
        total_unidades: huevos._sum.cantidad ?? 0,
        promedio_unidades_por_registro: Number(huevos._avg.cantidad ?? 0),
        cantidad_registros: huevos._count.id,
      },
    };
  }
}