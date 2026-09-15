import { Prisma } from '@prisma/client';
import {
  ProduccionHuevosRepository,
  ProduccionHuevosFiltros,
} from '../repositories/produccionHuevos.repository';

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

export interface CrearProduccionHuevosInput {
  lote_id?: number;
  cantidad?: number;
  registrado_en?: string;
}

export interface ActualizarProduccionHuevosInput {
  cantidad?: number;
  registrado_en?: string;
}

export class ProduccionHuevosService {
  private repository = new ProduccionHuevosRepository();

  listAll(filtros: ProduccionHuevosFiltros) {
    return this.repository.findAll(filtros);
  }

  async getById(id: number) {
    const registro = await this.repository.findById(id);
    if (!registro) {
      throw new ServiceError('Registro de producción de huevos no encontrado', 404, 'NOT_FOUND');
    }
    return registro;
  }

  async create(input: CrearProduccionHuevosInput) {
    if (input.cantidad === undefined) {
      throw new ServiceError('cantidad es obligatoria', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.repository.create({
        lote_id: input.lote_id,
        cantidad: input.cantidad,
        registrado_en: input.registrado_en ? new Date(input.registrado_en) : undefined,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: number, input: ActualizarProduccionHuevosInput) {
    await this.getById(id);

    try {
      return await this.repository.update(id, {
        cantidad: input.cantidad,
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
      return new ServiceError('lote_id no existe', 400, 'INVALID_REFERENCE');
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
