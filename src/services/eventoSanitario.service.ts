import { Prisma } from '@prisma/client';
import {
  EventoSanitarioRepository,
  EventoSanitarioFiltros,
} from '../repositories/eventoSanitario.repository';

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

const TIPOS_EVENTO_VALIDOS = [
  'Vacunación',
  'Desparasitación',
  'Tratamiento Médico',
  'Cirugía',
  'Chequeo General',
];

export interface CrearEventoSanitarioInput {
  animal_id?: number;
  tipo_evento?: string;
  dosis_aplicada?: number;
  descripcion_tratamiento?: string;
  fecha_evento?: string;
}

export interface ActualizarEventoSanitarioInput {
  tipo_evento?: string;
  dosis_aplicada?: number;
  descripcion_tratamiento?: string;
  fecha_evento?: string;
}

export class EventoSanitarioService {
  private repository = new EventoSanitarioRepository();

  listAll(filtros: EventoSanitarioFiltros) {
    return this.repository.findAll(filtros);
  }

  async getById(id: number) {
    const evento = await this.repository.findById(id);
    if (!evento) {
      throw new ServiceError('Evento sanitario no encontrado', 404, 'NOT_FOUND');
    }
    return evento;
  }

  async create(input: CrearEventoSanitarioInput) {
    if (!input.animal_id || !input.tipo_evento) {
      throw new ServiceError('animal_id y tipo_evento son obligatorios', 400, 'VALIDATION_ERROR');
    }
    if (!TIPOS_EVENTO_VALIDOS.includes(input.tipo_evento)) {
      throw new ServiceError(
        `tipo_evento debe ser uno de: ${TIPOS_EVENTO_VALIDOS.join(', ')}`,
        400,
        'VALIDATION_ERROR',
      );
    }

    try {
      return await this.repository.create({
        animal_id: input.animal_id,
        tipo_evento: input.tipo_evento,
        dosis_aplicada: input.dosis_aplicada,
        descripcion_tratamiento: input.descripcion_tratamiento,
        fecha_evento: input.fecha_evento ? new Date(input.fecha_evento) : undefined,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: number, input: ActualizarEventoSanitarioInput) {
    await this.getById(id);
    if (input.tipo_evento && !TIPOS_EVENTO_VALIDOS.includes(input.tipo_evento)) {
      throw new ServiceError(
        `tipo_evento debe ser uno de: ${TIPOS_EVENTO_VALIDOS.join(', ')}`,
        400,
        'VALIDATION_ERROR',
      );
    }

    try {
      return await this.repository.update(id, {
        tipo_evento: input.tipo_evento,
        dosis_aplicada: input.dosis_aplicada,
        descripcion_tratamiento: input.descripcion_tratamiento,
        fecha_evento: input.fecha_evento ? new Date(input.fecha_evento) : undefined,
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
