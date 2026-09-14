import { VentaRepository } from '../repositories/venta.repository';

export class VentaService {
  private repository = new VentaRepository();

  getAll() {
    return this.repository.findAll();
  }

  getById(id: number) {
    return this.repository.findById(id);
  }

  create(data: {
    producto: string;
    cantidad: number;
    precio_unitario: number;
    comprador?: string;
    fecha: string;
  }) {
    if (data.cantidad <= 0 || data.precio_unitario <= 0) {
      throw { status: 400, code: 'INVALID_DATA', message: 'Cantidad y precio deben ser mayores a 0' };
    }
    const total = data.cantidad * data.precio_unitario;
    return this.repository.create({ ...data, total, fecha: new Date(data.fecha) });
  }
}