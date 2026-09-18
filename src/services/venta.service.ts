import { VentaRepository } from '../repositories/venta.repository';

export class ServiceError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

export interface CrearVentaInput {
  producto?: string;
  cantidad?: number;
  precio_unitario?: number;
  comprador?: string;
  fecha?: string;
}

export type ActualizarVentaInput = Partial<CrearVentaInput>;

export class VentaService {
  private repository = new VentaRepository();

  listAll() {
    return this.repository.findAll();
  }

  async getById(id: number) {
    const venta = await this.repository.findById(id);
    if (!venta) {
      throw new ServiceError('Venta no encontrada', 404, 'NOT_FOUND');
    }
    return venta;
  }

  async create(input: CrearVentaInput) {
    if (!input.producto || !input.cantidad || !input.precio_unitario || !input.fecha) {
      throw new ServiceError('producto, cantidad, precio_unitario y fecha son obligatorios', 400, 'VALIDATION_ERROR');
    }
    if (input.cantidad <= 0 || input.precio_unitario <= 0) {
      throw new ServiceError('cantidad y precio_unitario deben ser mayores a 0', 400, 'VALIDATION_ERROR');
    }
    const total = Number((input.cantidad * input.precio_unitario).toFixed(2));
    return this.repository.create({
      producto: input.producto,
      cantidad: input.cantidad,
      precio_unitario: input.precio_unitario,
      total,
      comprador: input.comprador,
      fecha: new Date(input.fecha),
    });
  }

  async update(id: number, input: ActualizarVentaInput) {
    const actual = await this.getById(id);
    const cantidad = input.cantidad ?? Number(actual.cantidad);
    const precioUnitario = input.precio_unitario ?? Number(actual.precio_unitario);
    const total = Number((cantidad * precioUnitario).toFixed(2));
    return this.repository.update(id, {
      producto: input.producto,
      cantidad: input.cantidad,
      precio_unitario: input.precio_unitario,
      total,
      comprador: input.comprador,
      fecha: input.fecha ? new Date(input.fecha) : undefined,
    });
  }

  async delete(id: number) {
    await this.getById(id);
    await this.repository.delete(id);
  }
}