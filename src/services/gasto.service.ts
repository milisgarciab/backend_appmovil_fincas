import { GastoRepository } from '../repositories/gasto.repository';

export class ServiceError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

export interface CrearGastoInput {
  categoria?: string;
  descripcion?: string;
  monto?: number;
  fecha?: string;
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

  async create(input: CrearGastoInput) {
    if (!input.categoria || input.monto === undefined || !input.fecha) {
      throw new ServiceError('categoria, monto y fecha son obligatorios', 400, 'VALIDATION_ERROR');
    }
    if (input.monto <= 0) {
      throw new ServiceError('monto debe ser mayor a 0', 400, 'VALIDATION_ERROR');
    }
    return this.repository.create({
      categoria: input.categoria,
      descripcion: input.descripcion,
      monto: input.monto,
      fecha: new Date(input.fecha),
    });
  }

  async update(id: number, input: ActualizarGastoInput) {
    await this.getById(id);
    return this.repository.update(id, {
      categoria: input.categoria,
      descripcion: input.descripcion,
      monto: input.monto,
      fecha: input.fecha ? new Date(input.fecha) : undefined,
    });
  }

  async delete(id: number) {
    await this.getById(id);
    await this.repository.delete(id);
  }
}