import { PrecioMercadoRepository } from '../repositories/precioMercado.repository';

export class PrecioMercadoService {
  private repository = new PrecioMercadoRepository();

  getAll() {
    return this.repository.findAll();
  }

  setPrecio(data: { producto: string; precio: number }) {
    if (data.precio <= 0) {
      throw { status: 400, code: 'INVALID_PRECIO', message: 'El precio debe ser mayor a 0' };
    }
    return this.repository.create({ ...data, fecha: new Date() });
  }

  getLatest(producto: string) {
    return this.repository.findLatestByProducto(producto);
  }
}