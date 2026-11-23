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

// Lo que ya llevó a stock un registro de producción o una venta: Entradas y
// Ajustes suman, Salidas restan. `rastreado` es falso si nunca generó
// movimientos (registros anteriores a la activación del stock): esos NO se
// compensan al editarlos o eliminarlos.
export async function netoPorOrigen(
  tx: Prisma.TransactionClient,
  origen: OrigenMovimientoStock,
  origenId: number,
) {
  const movimientos = await tx.movimientos_stock.findMany({
    where: { origen, origen_id: origenId },
    select: { tipo: true, cantidad: true },
  });
  let neto = 0;
  for (const m of movimientos) {
    neto += m.tipo === 'Salida' ? -Number(m.cantidad) : Number(m.cantidad);
  }
  return { rastreado: movimientos.length > 0, neto: Number(neto.toFixed(2)) };
}

// Entrada de un registro de producción recién creado (huevos aprovechables o
// litros). Se crea siempre, aunque sea 0, para marcar el registro como
// "rastreado" y poder compensarlo después.
export function registrarEntradaProduccion(
  tx: Prisma.TransactionClient,
  d: {
    producto: ProductoStock;
    origen: OrigenMovimientoStock;
    origen_id: number;
    cantidad: number;
    usuario_id?: number | null;
  },
) {
  return aplicarMovimientoStock(tx, {
    producto: d.producto,
    tipo: 'Entrada',
    cantidad: d.cantidad,
    origen: d.origen,
    origen_id: d.origen_id,
    motivo: 'Producción registrada',
    usuario_id: d.usuario_id ?? undefined,
  });
}

// Deja lo que un registro lleva a stock en `aprovechable` (0 al eliminarlo):
// crea un Ajuste por la diferencia. Si el registro es anterior a la
// activación (sin movimientos) no hace nada. Si la diferencia es negativa y
// ya no alcanza el stock (parte se vendió), lanza STOCK_INSUFICIENTE.
export async function compensarProduccion(
  tx: Prisma.TransactionClient,
  d: {
    producto: ProductoStock;
    origen: OrigenMovimientoStock;
    origen_id: number;
    aprovechable: number;
    usuario_id?: number | null;
    motivo: string;
  },
) {
  const { rastreado, neto } = await netoPorOrigen(tx, d.origen, d.origen_id);
  if (!rastreado) return;
  const delta = Number((d.aprovechable - neto).toFixed(2));
  if (delta === 0) return;
  await aplicarMovimientoStock(tx, {
    producto: d.producto,
    tipo: 'Ajuste',
    cantidad: delta,
    origen: d.origen,
    origen_id: d.origen_id,
    motivo: d.motivo,
    usuario_id: d.usuario_id ?? undefined,
  });
}

// Deja el stock de una venta como debe estar según su producto y cantidad
// FINALES (`producto` null = ya no descuenta stock, por ejemplo al eliminarla).
// Crea un Ajuste por cada diferencia; primero las devoluciones y al final los
// descuentos. Si la venta es anterior a la activación del stock (sin
// movimientos), no hace nada.
export async function sincronizarVenta(
  tx: Prisma.TransactionClient,
  d: {
    venta_id: number;
    producto: ProductoStock | null;
    cantidad: number;
    usuario_id?: number | null;
    motivo: string;
  },
) {
  const movimientos = await tx.movimientos_stock.findMany({
    where: { origen: 'Venta', origen_id: d.venta_id },
    select: { tipo: true, cantidad: true, productos_finca: { select: { nombre: true } } },
  });
  if (movimientos.length === 0) return;

  const neto: Record<string, number> = {};
  for (const m of movimientos) {
    const nombre = m.productos_finca.nombre;
    neto[nombre] = (neto[nombre] ?? 0) + (m.tipo === 'Salida' ? -Number(m.cantidad) : Number(m.cantidad));
  }

  const productos = new Set<string>(Object.keys(neto));
  if (d.producto) productos.add(d.producto);

  const ajustes = Array.from(productos)
    .map((nombre) => {
      const deseado = nombre === d.producto ? -d.cantidad : 0;
      return { producto: nombre as ProductoStock, delta: Number((deseado - (neto[nombre] ?? 0)).toFixed(2)) };
    })
    .filter((a) => a.delta !== 0)
    .sort((a, b) => b.delta - a.delta);

  for (const a of ajustes) {
    await aplicarMovimientoStock(tx, {
      producto: a.producto,
      tipo: 'Ajuste',
      cantidad: a.delta,
      origen: 'Venta',
      origen_id: d.venta_id,
      motivo: d.motivo,
      usuario_id: d.usuario_id ?? undefined,
    });
  }
}

export interface MovimientosStockFiltros {
  producto?: ProductoStock;
  origen?: string;
  limite?: number;
}

export class StockRepository {
  // Stock disponible de un producto (0 si todavía no existe su fila).
  async disponible(producto: ProductoStock) {
    const fila = await prisma.productos_finca.findUnique({ where: { nombre: producto } });
    return { stock: fila ? Number(fila.stock_actual) : 0, unidad: PRODUCTOS_STOCK[producto].unidad };
  }

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
