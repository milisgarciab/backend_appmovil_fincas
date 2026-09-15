// especie.service.ts
import { Prisma } from '@prisma/client';
import { EspecieRepository } from '../repositories/especie.repository';

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

export class EspecieService {
  private repository = new EspecieRepository();

  listAll() {
    return this.repository.findAll();
  }

  getById(id: number) {
    return this.repository.findById(id);
  }

  async create(input: { nombre?: string }) {
    if (!input.nombre) {
      throw new ServiceError('nombre es obligatorio', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.repository.create({ nombre: input.nombre });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: number, input: { nombre?: string }) {
    const existente = await this.repository.findById(id);
    if (!existente) {
      throw new ServiceError('Especie no encontrada', 404, 'NOT_FOUND');
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
      throw new ServiceError('Especie no encontrada', 404, 'NOT_FOUND');
    }

    try {
      await this.repository.delete(id);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ServiceError('Ya existe una especie con ese nombre', 409, 'DUPLICATE_NOMBRE');
      }
      if (error.code === 'P2003') {
        return new ServiceError(
          'No se puede eliminar: hay razas asociadas a esta especie',
          409,
          'HAS_DEPENDENTS',
        );
      }
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
