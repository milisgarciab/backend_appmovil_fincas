import { AlimentacionRepository } from '../repositories/alimentacion.repository';

export class ServiceError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

export interface CrearAlimentacionInput {
  animal_id?: number;
  tipo_alimento?: string;
  cantidad?: number;
  unidad?: string;
  fecha?: string;
}

export type ActualizarAlimentacionInput = Partial<Omit<CrearAlimentacionInput, 'animal_id'>>;

export class AlimentacionService {
  private repository = new AlimentacionRepository();

  listAll(animalId?: number) {
    return this.repository.findAll({ animal_id: animalId });
  }

  async getById(id: number) {
    const registro = await this.repository.findById(id);
    if (!registro) {
      throw new ServiceError('Registro de alimentación no encontrado', 404, 'NOT_FOUND');
    }
    return registro;
  }

  async create(input: CrearAlimentacionInput) {
    if (!input.animal_id || !input.tipo_alimento || input.cantidad === undefined || !input.unidad) {
      throw new ServiceError(
        'animal_id, tipo_alimento, cantidad y unidad son obligatorios',
        400,
        'VALIDATION_ERROR',
      );
    }
    if (input.cantidad <= 0) {
      throw new ServiceError('cantidad debe ser mayor a 0', 400, 'VALIDATION_ERROR');
    }

    const animal = await this.repository.animalExiste(input.animal_id);
    if (!animal) {
      throw new ServiceError('El animal indicado no existe', 404, 'ANIMAL_NOT_FOUND');
    }

    return this.repository.create({
      animal_id: input.animal_id,
      tipo_alimento: input.tipo_alimento,
      cantidad: input.cantidad,
      unidad: input.unidad,
      fecha: input.fecha ? new Date(input.fecha) : undefined,
    });
  }

  async update(id: number, input: ActualizarAlimentacionInput) {
    await this.getById(id);
    return this.repository.update(id, {
      tipo_alimento: input.tipo_alimento,
      cantidad: input.cantidad,
      unidad: input.unidad,
      fecha: input.fecha ? new Date(input.fecha) : undefined,
    });
  }

  async delete(id: number) {
    await this.getById(id);
    await this.repository.delete(id);
  }
}