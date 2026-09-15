import { PrecioMercadoRepository } from '../repositories/precioMercado.repository';

export class ServiceError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

export interface CrearPrecioMercadoInput {
  producto?: string;
  precio?: number;
  fecha?: string;
}

export type ActualizarPrecioMercadoInput = Partial<CrearPrecioMercadoInput>;

export class PrecioMercadoService {
  private repository = new PrecioMercadoRepository();

  listAll() {
    return this.repository.findAll();
  }

  async getById(id: number) {
    const precio = await this.repository.findById(id);
    if (!precio) {
      throw new ServiceError('Precio de mercado no encontrado', 404, 'NOT_FOUND');
    }
    return precio;
  }

  async create(input: CrearPrecioMercadoInput) {
    if (!input.producto || input.precio === undefined || !input.fecha) {
      throw new ServiceError('producto, precio y fecha son obligatorios', 400, 'VALIDATION_ERROR');
    }
    if (input.precio <= 0) {
      throw new ServiceError('precio debe ser mayor a 0', 400, 'VALIDATION_ERROR');
    }
    return this.repository.create({
      producto: input.producto,
      precio: input.precio,
      fecha: new Date(input.fecha),
    });
  }

  async update(id: number, input: ActualizarPrecioMercadoInput) {
    await this.getById(id);
    return this.repository.update(id, {
      producto: input.producto,
      precio: input.precio,
      fecha: input.fecha ? new Date(input.fecha) : undefined,
    });
  }

  async delete(id: number) {
    await this.getById(id);
    await this.repository.delete(id);
  }
}