import {
  StockRepository,
  normalizarProducto,
  OrigenMovimientoStock,
} from '../repositories/stock.repository';

export class ServiceError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

const ORIGENES_VALIDOS: OrigenMovimientoStock[] = ['ProduccionHuevos', 'ProduccionLeche', 'Venta', 'Manual'];

export interface AjusteStockInput {
  producto?: string;
  cantidad?: number;
  motivo?: string;
}

export class StockService {
  private repository = new StockRepository();

  listarStock() {
    return this.repository.listarStock();
  }

  listarMovimientos(query: { producto?: string; origen?: string; limite?: string }) {
    let producto;
    if (query.producto) {
      producto = normalizarProducto(query.producto) ?? undefined;
      if (!producto) {
        throw new ServiceError('producto debe ser Huevos o Leche', 400, 'VALIDATION_ERROR');
      }
    }
    if (query.origen && !ORIGENES_VALIDOS.includes(query.origen as OrigenMovimientoStock)) {
      throw new ServiceError(`origen debe ser uno de: ${ORIGENES_VALIDOS.join(', ')}`, 400, 'VALIDATION_ERROR');
    }
    const limite = query.limite ? Number(query.limite) : undefined;
    if (limite !== undefined && (!Number.isInteger(limite) || limite < 1 || limite > 1000)) {
      throw new ServiceError('limite debe ser un entero entre 1 y 1000', 400, 'VALIDATION_ERROR');
    }
    return this.repository.listarMovimientos({ producto, origen: query.origen, limite });
  }

  // Ajuste manual (por ejemplo, para cargar el stock inicial). La cantidad
  // puede ser negativa; el motivo es obligatorio.
  async ajustar(input: AjusteStockInput, usuarioId: number) {
    const producto = normalizarProducto(input.producto);
    if (!producto) {
      throw new ServiceError('producto debe ser Huevos o Leche', 400, 'VALIDATION_ERROR');
    }
    if (typeof input.cantidad !== 'number' || !Number.isFinite(input.cantidad) || input.cantidad === 0) {
      throw new ServiceError('cantidad debe ser un número distinto de 0', 400, 'VALIDATION_ERROR');
    }
    if (producto === 'Huevos' && !Number.isInteger(input.cantidad)) {
      throw new ServiceError('La cantidad de huevos debe ser un número entero', 400, 'VALIDATION_ERROR');
    }
    const motivo = typeof input.motivo === 'string' ? input.motivo.trim() : '';
    if (!motivo) {
      throw new ServiceError('motivo es obligatorio', 400, 'VALIDATION_ERROR');
    }
    if (motivo.length > 255) {
      throw new ServiceError('motivo no puede superar 255 caracteres', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.repository.registrarMovimiento({
        producto,
        tipo: 'Ajuste',
        cantidad: input.cantidad,
        origen: 'Manual',
        motivo,
        usuario_id: usuarioId,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'STOCK_INSUFICIENTE') {
        throw new ServiceError('Stock insuficiente: el ajuste dejaría el stock en negativo', 400, 'STOCK_INSUFICIENTE');
      }
      if (error instanceof Error && error.message === 'CANTIDAD_NO_ENTERA') {
        throw new ServiceError('La cantidad de huevos debe ser un número entero', 400, 'VALIDATION_ERROR');
      }
      throw error;
    }
  }
}
