import { Prisma } from '@prisma/client';
import { RazaRepository } from '../repositories/raza.repository';

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

export class RazaService {
  private repository = new RazaRepository();

  listAll(especieId?: number) {
    return this.repository.findAll(especieId);
  }

  getById(id: number) {
    return this.repository.findById(id);
  }

  async create(input: { nombre?: string; especie_id?: number }) {
    if (!input.nombre || !input.especie_id) {
      throw new ServiceError('nombre y especie_id son obligatorios', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.repository.create({ nombre: input.nombre, especie_id: input.especie_id });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: number, input: { nombre?: string; especie_id?: number }) {
    const existente = await this.repository.findById(id);
    if (!existente) {
      throw new ServiceError('Raza no encontrada', 404, 'NOT_FOUND');
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
      throw new ServiceError('Raza no encontrada', 404, 'NOT_FOUND');
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
        return new ServiceError('Ya existe esa raza', 409, 'DUPLICATE_NOMBRE');
      }
      if (error.code === 'P2003') {
        return new ServiceError(
          'No se puede completar: especie_id no existe, o hay animales asociados a esta raza',
          409,
          'INVALID_OR_HAS_DEPENDENTS',
        );
      }
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
