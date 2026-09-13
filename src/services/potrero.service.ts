import { Prisma } from '@prisma/client';
import { PotreroRepository } from '../repositories/potrero.repository';
import { ServiceError } from './loteAnimal.service';

export interface CrearPotreroInput {
  nombre?: string;
  capacidad_animales?: number;
  estado?: string;
}

export class PotreroService {
  private repository = new PotreroRepository();

  listAll() {
    return this.repository.findAll();
  }

  getById(id: number) {
    return this.repository.findById(id);
  }

  async create(input: CrearPotreroInput) {
    if (!input.nombre) {
      throw new ServiceError('nombre es obligatorio', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.repository.create({
        nombre: input.nombre,
        capacidad_animales: input.capacidad_animales,
        estado: input.estado,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: number, input: CrearPotreroInput) {
    const existente = await this.repository.findById(id);
    if (!existente) {
      throw new ServiceError('Potrero no encontrado', 404, 'NOT_FOUND');
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
      throw new ServiceError('Potrero no encontrado', 404, 'NOT_FOUND');
    }

    try {
      await this.repository.delete(id);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async getAnimales(id: number) {
    const existente = await this.repository.findById(id);
    if (!existente) {
      throw new ServiceError('Potrero no encontrado', 404, 'NOT_FOUND');
    }
    return this.repository.findAnimalesDelPotrero(id);
  }

  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return new ServiceError('Hay lotes asociados a este potrero', 409, 'HAS_DEPENDENTS');
      }
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}