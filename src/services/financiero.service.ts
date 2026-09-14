import { GastoRepository } from '../repositories/gasto.repository';
import { VentaRepository } from '../repositories/venta.repository';
import { PrecioMercadoRepository } from '../repositories/precioMercado.repository';
import { FinancieroRepository } from '../repositories/financiero.repository';

export class FinancieroService {
  private gastos = new GastoRepository();
  private ventas = new VentaRepository();
  private precios = new PrecioMercadoRepository();
  private financiero = new FinancieroRepository();

  async getResumen(desde?: string, hasta?: string) {
    const fechaDesde = desde ? new Date(desde) : undefined;
    const fechaHasta = hasta ? new Date(hasta) : undefined;

    const [totalIngresos, totalGastos] = await Promise.all([
      this.ventas.sumByRango(fechaDesde, fechaHasta),
      this.gastos.sumByRango(fechaDesde, fechaHasta),
    ]);

    return {
      totalIngresos: Number(totalIngresos),
      totalGastos: Number(totalGastos),
      balance: Number(totalIngresos) - Number(totalGastos),
    };
  }

  async getValorProduccionHoy() {
    const [precioLeche, precioHuevos, produccion] = await Promise.all([
      this.precios.findLatestByProducto('Leche'),
      this.precios.findLatestByProducto('Huevos'),
      this.financiero.produccionHoy(),
    ]);

    const valorLeche = Number(precioLeche?.precio ?? 0) * Number(produccion.litrosLeche);
    const valorHuevos = Number(precioHuevos?.precio ?? 0) * Number(produccion.cantidadHuevos);

    return {
      litrosLeche: Number(produccion.litrosLeche),
      cantidadHuevos: Number(produccion.cantidadHuevos),
      precioLeche: Number(precioLeche?.precio ?? 0),
      precioHuevos: Number(precioHuevos?.precio ?? 0),
      valorEstimadoHoy: valorLeche + valorHuevos,
    };
  }
}