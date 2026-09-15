import { BalanceRepository } from '../repositories/balance.repository';
import { VentaRepository } from '../repositories/venta.repository';
import { GastoRepository } from '../repositories/gasto.repository';

export class ServiceError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

export interface GenerarBalanceInput {
  periodo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export class BalanceService {
  private repository = new BalanceRepository();
  private ventaRepository = new VentaRepository();
  private gastoRepository = new GastoRepository();

  listAll() {
    return this.repository.findAll();
  }

  async getById(id: number) {
    const balance = await this.repository.findById(id);
    if (!balance) {
      throw new ServiceError('Balance no encontrado', 404, 'NOT_FOUND');
    }
    return balance;
  }

  async generar(input: GenerarBalanceInput) {
    if (!input.periodo || !input.fecha_inicio || !input.fecha_fin) {
      throw new ServiceError('periodo, fecha_inicio y fecha_fin son obligatorios', 400, 'VALIDATION_ERROR');
    }

    const fechaInicio = new Date(input.fecha_inicio);
    const fechaFin = new Date(input.fecha_fin);

    const [ventasAgg, gastosAgg] = await Promise.all([
      this.ventaRepository.sumByRango(fechaInicio, fechaFin),
      this.gastoRepository.sumByRango(fechaInicio, fechaFin),
    ]);

    const totalVentas = Number(ventasAgg._sum.total ?? 0);
    const totalGastos = Number(gastosAgg._sum.monto ?? 0);
    const balanceNeto = Number((totalVentas - totalGastos).toFixed(2));

    return this.repository.create({
      periodo: new Date(input.periodo),
      total_ventas: totalVentas,
      total_gastos: totalGastos,
      balance_neto: balanceNeto,
    });
  }

  async resumenRapido(rango: 'hoy' | 'semana' | 'mes' = 'hoy') {
    const { fechaInicio, fechaFin } = this.calcularRango(rango);

    const [ventasAgg, gastosAgg] = await Promise.all([
      this.ventaRepository.sumByRango(fechaInicio, fechaFin),
      this.gastoRepository.sumByRango(fechaInicio, fechaFin),
    ]);

    const totalIngresos = Number(ventasAgg._sum.total ?? 0);
    const totalGastos = Number(gastosAgg._sum.monto ?? 0);

    return {
      rango,
      totalIngresos,
      totalGastos,
      balance: Number((totalIngresos - totalGastos).toFixed(2)),
    };
  }

  private calcularRango(rango: 'hoy' | 'semana' | 'mes'): { fechaInicio: Date; fechaFin: Date } {
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setHours(0, 0, 0, 0);

    if (rango === 'semana') {
      fechaInicio.setDate(fechaInicio.getDate() - fechaInicio.getDay());
    } else if (rango === 'mes') {
      fechaInicio.setDate(1);
    }

    return { fechaInicio, fechaFin };
  }
}