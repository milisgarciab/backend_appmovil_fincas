// loteAnimal.service.ts
import { Prisma } from '@prisma/client';
import { LoteAnimalRepository, CrearLoteData, ActualizarLoteData } from '../repositories/loteAnimal.repository';
 
export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}
 
export interface CrearLoteInput {
  nombre?: string;
  especie_id?: number;
  fecha_creacion?: string;
  capacidad_estimada?: number;
  descripcion?: string;
  encargado_id?: number;
}
 
export type ActualizarLoteInput = Partial<CrearLoteInput>;
 
export class LoteAnimalService {
  private repository = new LoteAnimalRepository();
 
  listAll() {
    return this.repository.findAll();
  }
 
  getById(id: number) {
    return this.repository.findById(id);
  }
 
  async create(input: CrearLoteInput) {
    if (!input.nombre) {
      throw new ServiceError('nombre es obligatorio', 400, 'VALIDATION_ERROR');
    }
    if (!input.especie_id) {
      throw new ServiceError('especie_id es obligatorio', 400, 'VALIDATION_ERROR');
    }
 
    const data: CrearLoteData = {
      nombre: input.nombre,
      especie_id: input.especie_id,
      fecha_creacion: input.fecha_creacion ? new Date(input.fecha_creacion) : undefined,
      capacidad_estimada: input.capacidad_estimada,
      descripcion: input.descripcion,
      encargado_id: input.encargado_id,
    };
 
    try {
      return await this.repository.create(data);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }
 
  async update(id: number, input: ActualizarLoteInput) {
    const existente = await this.repository.findById(id);
    if (!existente) {
      throw new ServiceError('Lote no encontrado', 404, 'NOT_FOUND');
    }
 
    const data: ActualizarLoteData = {
      nombre: input.nombre,
      especie_id: input.especie_id,
      fecha_creacion: input.fecha_creacion ? new Date(input.fecha_creacion) : undefined,
      capacidad_estimada: input.capacidad_estimada,
      descripcion: input.descripcion,
      encargado_id: input.encargado_id,
    };
 
    try {
      return await this.repository.update(id, data);
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
 
  async asignarEncargado(id: number, encargadoId: number | null) {
    const existente = await this.repository.findById(id);
    if (!existente) {
      throw new ServiceError('Lote no encontrado', 404, 'NOT_FOUND');
    }
 
    try {
      return await this.repository.asignarEncargado(id, encargadoId);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }
 
  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return new ServiceError(
          'No se puede completar: especie_id/encargado_id no existen, o hay animales asociados a este lote',
          409,
          'INVALID_OR_HAS_DEPENDENTS',
        );
      }
      if (error.code === 'P2025') {
        return new ServiceError('Lote no encontrado', 404, 'NOT_FOUND');
      }
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
 