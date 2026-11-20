import { GastoRepository } from '../repositories/gasto.repository';

export class ServiceError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

// Medio de pago del gasto (2026-11-19). Opcional; por ahora solo estos dos.
const METODOS_PAGO_VALIDOS = ['Efectivo', 'Transferencia'];

export interface CrearGastoInput {
  categoria?: string;
  descripcion?: string;
  monto?: number;
  fecha?: string;
  metodo_pago?: string | null;
}

export type ActualizarGastoInput = Partial<CrearGastoInput>;

export class GastoService {
  private repository = new GastoRepository();

  listAll() {
    return this.repository.findAll();
  }

  async getById(id: number) {
    const gasto = await this.repository.findById(id);
    if (!gasto) {
      throw new ServiceError('Gasto no encontrado', 404, 'NOT_FOUND');
    }
    return gasto;
  }

  // `metodo_pago` ausente (undefined) = sin cambio; null = sin medio de pago.
  private validarMetodoPago(metodoPago?: string | null) {
    if (metodoPago !== undefined && metodoPago !== null && !METODOS_PAGO_VALIDOS.includes(metodoPago)) {
      throw new ServiceError(
        `metodo_pago debe ser uno de: ${METODOS_PAGO_VALIDOS.join(', ')}`,
        400,
        'VALIDATION_ERROR',
      );
    }
  }

  async create(input: CrearGastoInput) {
    if (!input.categoria || input.monto === undefined || !input.fecha) {
      throw new ServiceError('categoria, monto y fecha son obligatorios', 400, 'VALIDATION_ERROR');
    }
    if (input.monto <= 0) {
      throw new ServiceError('monto debe ser mayor a 0', 400, 'VALIDATION_ERROR');
    }
    this.validarMetodoPago(input.metodo_pago);
    return this.repository.create({
      categoria: input.categoria,
      descripcion: input.descripcion,
      monto: input.monto,
      fecha: new Date(input.fecha),
      metodo_pago: input.metodo_pago,
    });
  }

  async update(id: number, input: ActualizarGastoInput) {
    await this.getById(id);
    this.validarMetodoPago(input.metodo_pago);
    return this.repository.update(id, {
      categoria: input.categoria,
      descripcion: input.descripcion,
      monto: input.monto,
      fecha: input.fecha ? new Date(input.fecha) : undefined,
      metodo_pago: input.metodo_pago,
    });
  }

  async delete(id: number) {
    await this.getById(id);
    await this.repository.delete(id);
  }
}