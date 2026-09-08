import { Prisma } from '@prisma/client';
import {
  SeguimientoGestacionRepository,
  SeguimientoGestacionFiltros,
} from '../repositories/seguimientoGestacion.repository';

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

export interface CrearSeguimientoInput {
  animal_id?: number;
  fecha_inseminacion?: string;
  fecha_estimada_parto?: string;
  estado?: string;
  notas?: string;
}

export interface ActualizarSeguimientoInput {
  fecha_inseminacion?: string;
  fecha_estimada_parto?: string;
  fecha_real_parto?: string;
  estado?: string;
  notas?: string;
}

export class SeguimientoGestacionService {
  private repository = new SeguimientoGestacionRepository();

  listAll(filtros: SeguimientoGestacionFiltros) {
    return this.repository.findAll(filtros);
  }

  async getById(id: number) {
    const registro = await this.repository.findById(id);
    if (!registro) {
      throw new ServiceError('Registro de reproducción no encontrado', 404, 'NOT_FOUND');
    }
    return registro;
  }

  // Nota: no se valida que el animal sea Hembra (decisión confirmada) — cualquier animal_id
  // existente es aceptado.
  async create(input: CrearSeguimientoInput) {
    if (!input.animal_id || !input.fecha_inseminacion || !input.fecha_estimada_parto) {
      throw new ServiceError(
        'animal_id, fecha_inseminacion y fecha_estimada_parto son obligatorios',
        400,
        'VALIDATION_ERROR',
      );
    }

    try {
      return await this.repository.create({
        animal_id: input.animal_id,
        fecha_inseminacion: new Date(input.fecha_inseminacion),
        fecha_estimada_parto: new Date(input.fecha_estimada_parto),
        estado: input.estado ?? 'Gestante',
        notas: input.notas,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: number, input: ActualizarSeguimientoInput) {
    await this.getById(id);

    try {
      return await this.repository.update(id, {
        fecha_inseminacion: input.fecha_inseminacion ? new Date(input.fecha_inseminacion) : undefined,
        fecha_estimada_parto: input.fecha_estimada_parto
          ? new Date(input.fecha_estimada_parto)
          : undefined,
        fecha_real_parto: input.fecha_real_parto ? new Date(input.fecha_real_parto) : undefined,
        estado: input.estado,
        notas: input.notas,
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return new ServiceError('animal_id no existe', 400, 'INVALID_REFERENCE');
      }
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
