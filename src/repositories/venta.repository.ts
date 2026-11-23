import { prisma } from '../config/prisma';
import { ProductoStock, aplicarMovimientoStock, sincronizarVenta } from './stock.repository';

export class VentaRepository {
  findAll() {
    return prisma.ventas.findMany({ orderBy: { fecha: 'desc' } });
  }

  findById(id: number) {
    return prisma.ventas.findUnique({ where: { id } });
  }

  create(data: {
    producto: string;
    cantidad: number;
    precio_unitario: number;
    total: number;
    comprador?: string;
    fecha: Date;
    estado_pago: string;
    fecha_pago: Date | null;
    fecha_limite_pago: Date | null;
  }, productoStock: ProductoStock | null, usuarioId?: number) {
    // La venta y su salida de stock se guardan juntas o ninguna. Solo
    // Huevos y Leche descuentan stock (también las ventas Pendientes).
    return prisma.$transaction(
      async (tx) => {
        const venta = await tx.ventas.create({ data });
        if (productoStock) {
          await aplicarMovimientoStock(tx, {
            producto: productoStock,
            tipo: 'Salida',
            cantidad: data.cantidad,
            origen: 'Venta',
            origen_id: venta.id,
            motivo: 'Venta registrada',
            usuario_id: usuarioId,
          });
        }
        return venta;
      },
      { timeout: 15000 },
    );
  }

  update(
    id: number,
    data: Partial<{
      producto: string;
      cantidad: number;
      precio_unitario: number;
      total: number;
      comprador: string;
      fecha: Date;
      estado_pago: string;
      fecha_pago: Date | null;
      fecha_limite_pago: Date | null;
    }>,
    efectoStock: { producto: ProductoStock | null; cantidad: number },
    usuarioId?: number,
  ) {
    return prisma.$transaction(
      async (tx) => {
        const venta = await tx.ventas.update({ where: { id }, data });
        await sincronizarVenta(tx, {
          venta_id: id,
          producto: efectoStock.producto,
          cantidad: efectoStock.cantidad,
          usuario_id: usuarioId,
          motivo: 'Edición de la venta',
        });
        return venta;
      },
      { timeout: 15000 },
    );
  }

  // Al eliminar una venta se devuelven al stock las unidades que había descontado.
  delete(id: number, usuarioId?: number) {
    return prisma.$transaction(
      async (tx) => {
        await sincronizarVenta(tx, {
          venta_id: id,
          producto: null,
          cantidad: 0,
          usuario_id: usuarioId,
          motivo: 'Venta eliminada',
        });
        return tx.ventas.delete({ where: { id } });
      },
      { timeout: 15000 },
    );
  }

  sumByRango(fechaInicio: Date, fechaFin: Date) {
    return prisma.ventas.aggregate({
      _sum: { total: true },
      where: { estado_pago: 'Pagado', fecha_pago: { gte: fechaInicio, lte: fechaFin } },
    });
  }
}