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
  lote_id?: number;
  litros?: number;
  jornada?: string;
  observaciones?: string;
  registrado_en?: string;
}
 
export interface ActualizarProduccionLecheInput {
  litros?: number;
  jornada?: string;
  observaciones?: string;
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
 
  private validar(input: { litros?: number; observaciones?: string; registrado_en?: string }) {
    if (input.litros !== undefined && input.litros < 0) {
      throw new ServiceError('litros debe ser >= 0', 400, 'VALIDATION_ERROR');
    }
    if (input.observaciones !== undefined && input.observaciones.length > 255) {
      throw new ServiceError('observaciones no puede superar 255 caracteres', 400, 'VALIDATION_ERROR');
    }
    if (input.registrado_en) {
      const fecha = new Date(input.registrado_en);
      if (fecha.getTime() > Date.now()) {
        throw new ServiceError('registrado_en no puede ser una fecha futura', 400, 'VALIDATION_ERROR');
      }
    }
  }
 
  // `usuarioId` se toma SIEMPRE del token (nunca del body que manda el
  // cliente) — así "quién lo registró" no se puede falsear (2026-10-01).
  async create(input: CrearProduccionLecheInput, usuarioId: number) {
    if (input.litros === undefined) {
      throw new ServiceError('litros es obligatorio', 400, 'VALIDATION_ERROR');
    }
    if (!input.animal_id && !input.lote_id) {
      throw new ServiceError('debe indicar animal_id o lote_id', 400, 'VALIDATION_ERROR');
    }
    if (input.animal_id && input.lote_id) {
      throw new ServiceError('no se puede indicar animal_id y lote_id al mismo tiempo', 400, 'VALIDATION_ERROR');
    }
    if (input.jornada && !JORNADAS_VALIDAS.includes(input.jornada)) {
      throw new ServiceError('jornada debe ser "Mañana" o "Tarde"', 400, 'VALIDATION_ERROR');
    }
    this.validar(input);
 
    try {
      return await this.repository.create({
        animal_id: input.animal_id,
        lote_id: input.lote_id,
        litros: input.litros,
        jornada: input.jornada,
        observaciones: input.observaciones,
        registrado_en: input.registrado_en ? new Date(input.registrado_en) : undefined,
        creado_por_id: usuarioId,
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
    this.validar(input);
    try {
      return await this.repository.update(id, {
        litros: input.litros,
        jornada: input.jornada,
        observaciones: input.observaciones,
        registrado_en: input.registrado_en ? new Date(input.registrado_en) : undefined,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }
 
  // Borrado lógico — ver comentario en el repositorio. `usuarioId` también
  // viene siempre del token.
  async delete(id: number, usuarioId: number) {
    const registro = await this.getById(id);
    if (registro.eliminado_en) {
      throw new ServiceError('El registro ya fue eliminado', 400, 'ALREADY_DELETED');
    }
    await this.repository.softDelete(id, usuarioId);
  }
 
  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return new ServiceError('animal_id o lote_id no existe', 400, 'INVALID_REFERENCE');
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
 