import { Prisma } from '@prisma/client';
import { CategoriaBodegaRepository } from '../repositories/categoriaBodega.repository';

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

export class CategoriaBodegaService {
  private repository = new CategoriaBodegaRepository();

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
      throw new ServiceError('Categoría no encontrada', 404, 'NOT_FOUND');
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
      throw new ServiceError('Categoría no encontrada', 404, 'NOT_FOUND');
    }

    // Aviso: borrar la categoría borra en cascada todos sus insumos (bodega) y los lotes de esos
    // insumos (onDelete: Cascade definido en el schema).
    await this.repository.delete(id);
  }

  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ServiceError('Ya existe una categoría con ese nombre', 409, 'DUPLICATE_NOMBRE');
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
