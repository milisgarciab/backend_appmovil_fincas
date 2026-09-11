import { Prisma } from '@prisma/client';
import { RegistroPesoRepository, RegistroPesoFiltros } from '../repositories/registroPeso.repository';

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

export interface CrearRegistroPesoInput {
  animal_id?: number;
  peso_kg?: number;
  registrado_en?: string;
}

export interface ActualizarRegistroPesoInput {
  peso_kg?: number;
  registrado_en?: string;
}

export class RegistroPesoService {
  private repository = new RegistroPesoRepository();

  listAll(filtros: RegistroPesoFiltros) {
    return this.repository.findAll(filtros);
  }

  async getById(id: number) {
    const registro = await this.repository.findById(id);
    if (!registro) {
      throw new ServiceError('Registro de peso no encontrado', 404, 'NOT_FOUND');
    }
    return registro;
  }

  async create(input: CrearRegistroPesoInput) {
    if (!input.animal_id || input.peso_kg === undefined) {
      throw new ServiceError('animal_id y peso_kg son obligatorios', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.repository.create({
        animal_id: input.animal_id,
        peso_kg: input.peso_kg,
        registrado_en: input.registrado_en ? new Date(input.registrado_en) : undefined,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: number, input: ActualizarRegistroPesoInput) {
    await this.getById(id);

    try {
      return await this.repository.update(id, {
        peso_kg: input.peso_kg,
        registrado_en: input.registrado_en ? new Date(input.registrado_en) : undefined,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async delete(id: number) {
    await this.getById(id);
    await this.repository.delete(id);
  }

  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return new ServiceError('animal_id no existe', 400, 'INVALID_REFERENCE');
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
