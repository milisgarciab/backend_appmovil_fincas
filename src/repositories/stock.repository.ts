import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

// Stock de productos de finca (Huevos en unidades, Leche en litros).
//
// `aplicarMovimientoStock` es el ÚNICO punto que cambia el stock: actualiza
// `stock_actual` y registra el movimiento juntos. Recibe el cliente de una
// transacción para que Producción y Ventas (etapas 7 y 8) puedan llamarla
// dentro de SU propia transacción: o se guarda todo, o nada.

export const PRODUCTOS_STOCK = {
  Huevos: { unidad: 'unidades' },
  Leche: { unidad: 'litros' },
} as const;

export type ProductoStock = keyof typeof PRODUCTOS_STOCK;
export type TipoMovimientoStock = 'Entrada' | 'Salida' | 'Ajuste';
export type OrigenMovimientoStock = 'ProduccionHuevos' | 'ProduccionLeche' | 'Venta' | 'Manual';

// Reconoce "Huevos" / "Leche" sin distinguir mayúsculas ni espacios sobrantes.
export function normalizarProducto(texto: unknown): ProductoStock | null {
  if (typeof texto !== 'string') return null;
  const t = texto.trim().toLowerCase();
  if (t === 'huevos') return 'Huevos';
  if (t === 'leche') return 'Leche';
  return null;
}

export interface MovimientoStockData {
  producto: ProductoStock;
  tipo: TipoMovimientoStock;
  // Entrada/Salida: mayor a 0. Ajuste: positivo o negativo (distinto de 0).
  cantidad: number;
  origen: OrigenMovimientoStock;
  origen_id?: number | null;
  motivo?: string;
  usuario_id?: number;
}

export async function aplicarMovimientoStock(tx: Prisma.TransactionClient, data: MovimientoStockData) {
  if (data.producto === 'Huevos' && !Number.isInteger(data.cantidad)) {
    throw new Error('CANTIDAD_NO_ENTERA');
  }
  const cantidad = Number(data.cantidad.toFixed(2));
  const delta = data.tipo === 'Salida' ? -cantidad : cantidad;

  const producto = await tx.productos_finca.upsert({
    where: { nombre: data.producto },
    update: {},
    create: { nombre: data.producto, unidad: PRODUCTOS_STOCK[data.producto].unidad },
  });

  if (delta < 0) {
    // Descuento atómico: solo se aplica si alcanza el stock. Así dos
    // movimientos simultáneos no pueden dejarlo en negativo.
    const r = await tx.productos_finca.updateMany({
      where: { id: producto.id, stock_actual: { gte: -delta } },
      data: { stock_actual: { increment: delta } },
    });
    if (r.count === 0) {
      throw new Error('STOCK_INSUFICIENTE');
    }
  } else {
    await tx.productos_finca.update({
      where: { id: producto.id },
      data: { stock_actual: { increment: delta } },
    });
  }

  return tx.movimientos_stock.create({
    data: {
      producto_id: producto.id,
      tipo: data.tipo,
      cantidad,
      origen: data.origen,
      origen_id: data.origen_id ?? null,
      motivo: data.motivo,
      usuario_id: data.usuario_id,
    },
    include: {
      productos_finca: true,
      usuarios: { select: { nombre_usuario: true } },
    },
  });
}

export interface MovimientosStockFiltros {
  producto?: ProductoStock;
  origen?: string;
  limite?: number;
}

export class StockRepository {
  // Garantiza que existan las dos filas de producto (stock 0 la primera vez).
  async listarStock() {
    for (const nombre of Object.keys(PRODUCTOS_STOCK) as ProductoStock[]) {
      await prisma.productos_finca.upsert({
        where: { nombre },
        update: {},
        create: { nombre, unidad: PRODUCTOS_STOCK[nombre].unidad },
      });
    }
    return prisma.productos_finca.findMany({ orderBy: { nombre: 'asc' } });
  }

  listarMovimientos(filtros: MovimientosStockFiltros) {
    return prisma.movimientos_stock.findMany({
      where: {
        origen: filtros.origen,
        productos_finca: filtros.producto ? { nombre: filtros.producto } : undefined,
      },
      include: {
        productos_finca: true,
        usuarios: { select: { nombre_usuario: true } },
      },
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      take: filtros.limite ?? 200,
    });
  }

  registrarMovimiento(data: MovimientoStockData) {
    return prisma.$transaction((tx) => aplicarMovimientoStock(tx, data));
  }
}
