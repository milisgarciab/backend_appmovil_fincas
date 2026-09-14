import { GastoRepository } from '../repositories/gasto.repository';

export class GastoService {
  private repository = new GastoRepository();

  getAll() {
    return this.repository.findAll();
  }

  getById(id: number) {
    return this.repository.findById(id);
  }

  create(data: { categoria: string; descripcion?: string; monto: number; fecha: string }) {
    if (data.monto <= 0) {
      throw { status: 400, code: 'INVALID_MONTO', message: 'El monto debe ser mayor a 0' };
    }
    return this.repository.create({ ...data, fecha: new Date(data.fecha) });
  }
}