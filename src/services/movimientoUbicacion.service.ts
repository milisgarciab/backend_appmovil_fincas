import { MovimientoUbicacionRepository } from '../repositories/movimientoUbicacion.repository';

export class ServiceError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

export class MovimientoUbicacionService {
  private repository = new MovimientoUbicacionRepository();

  async getHistorial(animalId: number) {
    const animal = await this.repository.animalExiste(animalId);
    if (!animal) {
      throw new ServiceError('Animal no encontrado', 404, 'NOT_FOUND');
    }
    return this.repository.findByAnimal(animalId);
  }

  async trasladar(animalId: number, potreroDestinoId?: number) {
    if (!potreroDestinoId) {
      throw new ServiceError('potrero_destino_id es obligatorio', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.repository.trasladar(animalId, potreroDestinoId);
    } catch (error) {
      if (error instanceof Error && error.message === 'ANIMAL_NOT_FOUND') {
        throw new ServiceError('Animal no encontrado', 404, 'NOT_FOUND');
      }
      if (error instanceof Error && error.message === 'POTRERO_NOT_FOUND') {
        throw new ServiceError('El potrero destino no existe', 404, 'POTRERO_NOT_FOUND');
      }
      throw error;
    }
  }
}