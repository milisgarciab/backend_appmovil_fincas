import { Prisma } from '@prisma/client';
import {
  SeguimientoGestacionRepository,
  SeguimientoGestacionFiltros,
} from '../repositories/seguimientoGestacion.repository';
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

const TIPOS_VALIDOS = ['Monta natural', 'IA'];

// Días de gestación por especie. Si la especie del animal no está en este mapa,
// fecha_estimada_parto debe venir manual en el input (decisión de negocio confirmada).
const DIAS_GESTACION_POR_ESPECIE: Record<string, number> = {
  vaca: 283,
  cerdo: 114,
};

export interface CrearSeguimientoInput {
  animal_id?: number;
  macho_id?: number;
  tipo?: string;
  fecha_inseminacion?: string;
  fecha_estimada_parto?: string;
  estado?: string;
  notas?: string;
}

export interface ActualizarSeguimientoInput {
  macho_id?: number;
  tipo?: string;
  fecha_inseminacion?: string;
  fecha_estimada_parto?: string;
  fecha_real_parto?: string;
  estado?: string;
  notas?: string;
}

export class SeguimientoGestacionService {
  private repository = new SeguimientoGestacionRepository();
  private animalService = new AnimalService();

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
    if (!input.animal_id || !input.fecha_inseminacion) {
      throw new ServiceError('animal_id y fecha_inseminacion son obligatorios', 400, 'VALIDATION_ERROR');
    }
    this.validarFechaNoFutura(input.fecha_inseminacion);
    if (input.tipo) {
      this.validarTipo(input.tipo);
    }

    const animal = await this.animalService.getById(input.animal_id);
    if (!animal) {
      throw new ServiceError('animal_id no existe', 400, 'INVALID_REFERENCE');
    }

    if (input.macho_id) {
      const macho = await this.animalService.getById(input.macho_id);
      if (!macho) {
        throw new ServiceError('macho_id no existe', 400, 'INVALID_REFERENCE');
      }
    }

    const fechaEstimadaParto = this.resolverFechaEstimadaParto(
      animal,
      input.fecha_inseminacion,
      input.fecha_estimada_parto,
    );

    let registro;
    try {
      registro = await this.repository.create({
        animal_id: input.animal_id,
        macho_id: input.macho_id,
        tipo: input.tipo,
        fecha_inseminacion: new Date(input.fecha_inseminacion),
        fecha_estimada_parto: fechaEstimadaParto,
        estado: input.estado ?? 'Gestante',
        notas: input.notas,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }

    await this.animalService.update(input.animal_id, { estado: 'En gestación' });

    return registro;
  }

  async update(id: number, input: ActualizarSeguimientoInput) {
    await this.getById(id);
    if (input.fecha_inseminacion) {
      this.validarFechaNoFutura(input.fecha_inseminacion);
    }
    if (input.tipo) {
      this.validarTipo(input.tipo);
    }
    if (input.macho_id) {
      const macho = await this.animalService.getById(input.macho_id);
      if (!macho) {
        throw new ServiceError('macho_id no existe', 400, 'INVALID_REFERENCE');
      }
    }

    try {
      return await this.repository.update(id, {
        macho_id: input.macho_id,
        tipo: input.tipo,
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

  private resolverFechaEstimadaParto(
    animal: { especies: { nombre: string } },
    fecha_inseminacion: string,
    fecha_estimada_parto_manual?: string,
  ): Date {
    const nombreEspecie = animal.especies.nombre.trim().toLowerCase();
    const dias = DIAS_GESTACION_POR_ESPECIE[nombreEspecie];

    if (dias) {
      const fecha = new Date(fecha_inseminacion);
      fecha.setDate(fecha.getDate() + dias);
      return fecha;
    }

    if (!fecha_estimada_parto_manual) {
      throw new ServiceError(
        `No hay días de gestación configurados para la especie "${animal.especies.nombre}". fecha_estimada_parto es obligatoria en este caso.`,
        400,
        'VALIDATION_ERROR',
      );
    }
    return new Date(fecha_estimada_parto_manual);
  }

  private validarTipo(tipo: string) {
    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new ServiceError(`tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`, 400, 'VALIDATION_ERROR');
    }
  }

  private validarFechaNoFutura(fecha: string) {
    if (new Date(fecha).getTime() > Date.now()) {
      throw new ServiceError('fecha_inseminacion no puede ser una fecha futura', 400, 'VALIDATION_ERROR');
    }
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