import { Prisma } from '@prisma/client';
import {
  EventoSanitarioRepository,
  EventoSanitarioFiltros,
} from '../repositories/eventoSanitario.repository';
import { AnimalService } from './animal.service';

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
  'Enfermedad',
  'Accidente',
  'Lesión',
];

const ESTADOS_VALIDOS = ['en tratamiento', 'recuperado', 'fallecido'];
const TIPOS_EVENTO_SALUD = ['Enfermedad', 'Accidente', 'Lesión'];

export interface CrearEventoSanitarioInput {
  animal_id?: number;
  tipo_evento?: string;
  dosis_aplicada?: number;
  descripcion_tratamiento?: string;
  fecha_evento?: string;
  tipo_vacuna?: string;
  responsable?: string;
  diagnostico?: string;
  estado?: string;
}

export interface ActualizarEventoSanitarioInput {
  tipo_evento?: string;
  dosis_aplicada?: number;
  descripcion_tratamiento?: string;
  fecha_evento?: string;
  tipo_vacuna?: string;
  responsable?: string;
  diagnostico?: string;
  estado?: string;
}

export class EventoSanitarioService {
  private repository = new EventoSanitarioRepository();
  private animalService = new AnimalService();

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
    this.validarTipoEvento(input.tipo_evento);
    this.validarFechaNoFutura(input.fecha_evento);
    this.validarCamposCondicionales(input.tipo_evento, input);

    let evento;
    try {
      evento = await this.repository.create({
        animal_id: input.animal_id,
        tipo_evento: input.tipo_evento,
        dosis_aplicada: input.dosis_aplicada,
        descripcion_tratamiento: input.descripcion_tratamiento,
        fecha_evento: input.fecha_evento ? new Date(input.fecha_evento) : undefined,
        tipo_vacuna: input.tipo_vacuna,
        responsable: input.responsable,
        diagnostico: input.diagnostico,
        estado: input.estado,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }

    if (input.estado === 'fallecido') {
      await this.marcarAnimalFallecido(input.animal_id);
    }

    return evento;
  }

  async update(id: number, input: ActualizarEventoSanitarioInput) {
    const eventoActual = await this.getById(id);
    const tipoEvento = input.tipo_evento ?? eventoActual.tipo_evento;

    if (input.tipo_evento) {
      this.validarTipoEvento(input.tipo_evento);
    }
    if (input.fecha_evento) {
      this.validarFechaNoFutura(input.fecha_evento);
    }
    this.validarCamposCondicionales(tipoEvento, { ...eventoActual, ...input });

    let evento;
    try {
      evento = await this.repository.update(id, {
        tipo_evento: input.tipo_evento,
        dosis_aplicada: input.dosis_aplicada,
        descripcion_tratamiento: input.descripcion_tratamiento,
        fecha_evento: input.fecha_evento ? new Date(input.fecha_evento) : undefined,
        tipo_vacuna: input.tipo_vacuna,
        responsable: input.responsable,
        diagnostico: input.diagnostico,
        estado: input.estado,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }

    if (input.estado === 'fallecido' && eventoActual.estado !== 'fallecido') {
      await this.marcarAnimalFallecido(eventoActual.animal_id);
    }

    return evento;
  }

  async delete(id: number) {
    await this.getById(id);
    await this.repository.delete(id);
  }

  private async marcarAnimalFallecido(animal_id: number) {
    await this.animalService.update(animal_id, {
      estado: 'Muerto',
      causa_inactivacion: 'muerte',
    });
  }

  private validarTipoEvento(tipo_evento: string) {
    if (!TIPOS_EVENTO_VALIDOS.includes(tipo_evento)) {
      throw new ServiceError(
        `tipo_evento debe ser uno de: ${TIPOS_EVENTO_VALIDOS.join(', ')}`,
        400,
        'VALIDATION_ERROR',
      );
    }
  }

  private validarFechaNoFutura(fecha_evento?: string) {
    if (!fecha_evento) return;
    const fecha = new Date(fecha_evento);
    if (fecha.getTime() > Date.now()) {
      throw new ServiceError('fecha_evento no puede ser una fecha futura', 400, 'VALIDATION_ERROR');
    }
  }

  private validarCamposCondicionales(
    tipo_evento: string,
    input: {
      tipo_vacuna?: string | null;
      responsable?: string | null;
      diagnostico?: string | null;
      estado?: string | null;
    },
  ) {
    if (tipo_evento === 'Vacunación') {
      if (!input.tipo_vacuna) {
        throw new ServiceError('tipo_vacuna es obligatorio cuando tipo_evento es Vacunación', 400, 'VALIDATION_ERROR');
      }
      if (!input.responsable) {
        throw new ServiceError('responsable es obligatorio cuando tipo_evento es Vacunación', 400, 'VALIDATION_ERROR');
      }
    }

    if (TIPOS_EVENTO_SALUD.includes(tipo_evento)) {
      if (!input.diagnostico) {
        throw new ServiceError(`diagnostico es obligatorio cuando tipo_evento es ${tipo_evento}`, 400, 'VALIDATION_ERROR');
      }
      if (!input.estado || !ESTADOS_VALIDOS.includes(input.estado)) {
        throw new ServiceError(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`, 400, 'VALIDATION_ERROR');
      }
    }
  }

  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return new ServiceError('animal_id no existe', 400, 'INVALID_REFERENCE');
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}