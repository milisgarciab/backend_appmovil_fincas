import { MovimientoInventarioRepository } from '../repositories/movimientoInventario.repository';

export class ServiceError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

const TIPOS_VALIDOS = ['Entrada', 'Salida', 'Ajuste'];

export interface RegistrarMovimientoInput {
  insumo_id?: number;
  tipo?: string;
  cantidad?: number;
  motivo?: string;
}

export class MovimientoInventarioService {
  private repository = new MovimientoInventarioRepository();

  listAll(insumoId?: number, tipo?: string) {
    return this.repository.findAll({ insumo_id: insumoId, tipo });
  }

  async registrar(input: RegistrarMovimientoInput) {
    if (!input.insumo_id || !input.tipo || input.cantidad === undefined) {
      throw new ServiceError('insumo_id, tipo y cantidad son obligatorios', 400, 'VALIDATION_ERROR');
    }
    if (!TIPOS_VALIDOS.includes(input.tipo)) {
      throw new ServiceError(`tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`, 400, 'VALIDATION_ERROR');
    }
    if (input.tipo !== 'Ajuste' && input.cantidad <= 0) {
      throw new ServiceError('cantidad debe ser mayor a 0', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.repository.registrarMovimiento({
        insumo_id: input.insumo_id,
        tipo: input.tipo,
        cantidad: input.cantidad,
        motivo: input.motivo,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'INSUMO_NOT_FOUND') {
        throw new ServiceError('El insumo indicado no existe', 404, 'INSUMO_NOT_FOUND');
      }
      if (error instanceof Error && error.message === 'STOCK_INSUFICIENTE') {
        throw new ServiceError('Stock insuficiente para este movimiento', 400, 'STOCK_INSUFICIENTE');
      }
      throw error;
    }
  }
}