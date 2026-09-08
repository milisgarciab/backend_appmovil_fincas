// loteAnimal.service.ts
import { Prisma } from '@prisma/client';
import { LoteAnimalRepository } from '../repositories/loteAnimal.repository';

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

export class LoteAnimalService {
  private repository = new LoteAnimalRepository();

  listAll() {
    return this.repository.findAll();
  }

  getById(id: number) {
    return this.repository.findById(id);
  }

  async create(input: { nombre?: string; potrero_id?: number }) {
    if (!input.nombre) {
      throw new ServiceError('nombre es obligatorio', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.repository.create({ nombre: input.nombre, potrero_id: input.potrero_id });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: number, input: { nombre?: string; potrero_id?: number }) {
    const existente = await this.repository.findById(id);
    if (!existente) {
      throw new ServiceError('Lote no encontrado', 404, 'NOT_FOUND');
    }

    try {
      return await this.repository.update(id, input);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async delete(id: number) {
    const existente = await this.repository.findById(id);
    if (!existente) {
      throw new ServiceError('Lote no encontrado', 404, 'NOT_FOUND');
    }

    try {
      await this.repository.delete(id);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return new ServiceError(
          'No se puede completar: potrero_id no existe, o hay animales asociados a este lote',
          409,
          'INVALID_OR_HAS_DEPENDENTS',
        );
      }
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
