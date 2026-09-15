import { Prisma } from '@prisma/client';
import {
  ProduccionLecheRepository,
  ProduccionLecheFiltros,
} from '../repositories/produccionLeche.repository';

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

const JORNADAS_VALIDAS = ['Mañana', 'Tarde'];

export interface CrearProduccionLecheInput {
  animal_id?: number;
  litros?: number;
  jornada?: string;
  registrado_en?: string;
}

export interface ActualizarProduccionLecheInput {
  litros?: number;
  jornada?: string;
  registrado_en?: string;
}

export class ProduccionLecheService {
  private repository = new ProduccionLecheRepository();

  listAll(filtros: ProduccionLecheFiltros) {
    return this.repository.findAll(filtros);
  }

  async getById(id: number) {
    const registro = await this.repository.findById(id);
    if (!registro) {
      throw new ServiceError('Registro de producción de leche no encontrado', 404, 'NOT_FOUND');
    }
    return registro;
  }

  async create(input: CrearProduccionLecheInput) {
    if (!input.animal_id || input.litros === undefined) {
      throw new ServiceError('animal_id y litros son obligatorios', 400, 'VALIDATION_ERROR');
    }
    if (input.jornada && !JORNADAS_VALIDAS.includes(input.jornada)) {
      throw new ServiceError('jornada debe ser "Mañana" o "Tarde"', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.repository.create({
        animal_id: input.animal_id,
        litros: input.litros,
        jornada: input.jornada,
        registrado_en: input.registrado_en ? new Date(input.registrado_en) : undefined,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: number, input: ActualizarProduccionLecheInput) {
    await this.getById(id);
    if (input.jornada && !JORNADAS_VALIDAS.includes(input.jornada)) {
      throw new ServiceError('jornada debe ser "Mañana" o "Tarde"', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.repository.update(id, {
        litros: input.litros,
        jornada: input.jornada,
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
