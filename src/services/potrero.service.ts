import { Prisma } from '@prisma/client';
import { PotreroRepository } from '../repositories/potrero.repository';

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

export interface CrearPotreroInput {
  nombre?: string;
  capacidad_animales?: number;
  estado?: string;
}

export type ActualizarPotreroInput = Partial<CrearPotreroInput>;

export class PotreroService {
  private repository = new PotreroRepository();

  listAll() {
    return this.repository.findAll();
  }

  async getById(id: number) {
    const potrero = await this.repository.findById(id);
    if (!potrero) {
      throw new ServiceError('Potrero no encontrado', 404, 'NOT_FOUND');
    }
    return potrero;
  }

  async create(input: CrearPotreroInput) {
    if (!input.nombre) {
      throw new ServiceError('nombre es obligatorio', 400, 'VALIDATION_ERROR');
    }

    return this.repository.create({
      nombre: input.nombre,
      capacidad_animales: input.capacidad_animales,
      estado: input.estado,
    });
  }

  async update(id: number, input: ActualizarPotreroInput) {
    await this.getById(id);
    return this.repository.update(id, input);
  }

  async delete(id: number) {
    await this.getById(id);
    try {
      await this.repository.delete(id);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

   async getAnimalesDelPotrero(id: number) {
    const potrero = await this.getById(id);
    const animales = await this.repository.findAnimalesDelPotrero(id);
    return {
      potrero: { id: potrero.id, nombre: potrero.nombre, estado: potrero.estado },
      conteo: animales.length,
      animales,
      mensaje: animales.length === 0 ? 'Sin animales asignados' : null,
    };
  }

  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return new ServiceError(
        'No se puede eliminar: hay animales o lotes asignados a este potrero',
        409,
        'HAS_DEPENDENTS',
      );
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}