import { NacimientoRepository } from '../repositories/nacimiento.repository';

export class ServiceError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

export class NacimientoService {
  private repository = new NacimientoRepository();

  listAll() {
    return this.repository.findAll();
  }

  async getDescendencia(animalId: number) {
    const animal = await this.repository.animalExiste(animalId);
    if (!animal) {
      throw new ServiceError('Animal no encontrado', 404, 'NOT_FOUND');
    }
    return this.repository.findDescendencia(animalId);
  }
}