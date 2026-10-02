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
 
// Mismas jornadas válidas que produccionLeche.service.ts (JORNADAS_VALIDAS).
// Se duplica aquí en vez de exportarla desde leche para no tocar ese archivo
// otra vez y mantener el cambio acotado a huevos.
const JORNADAS_VALIDAS = ['Mañana', 'Tarde'];
 
export interface CrearProduccionHuevosInput {
  lote_id?: number;
  animal_id?: number;
  cantidad?: number;
  cantidad_rotos?: number;
  jornada?: string;
  observaciones?: string;
  registrado_en?: string;
}
 
export interface ActualizarProduccionHuevosInput {
  cantidad?: number;
  cantidad_rotos?: number;
  jornada?: string;
  observaciones?: string;
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
 
  private validar(input: {
    cantidad?: number;
    cantidad_rotos?: number;
    observaciones?: string;
    registrado_en?: string;
  }) {
    if (input.cantidad !== undefined && input.cantidad < 0) {
      throw new ServiceError('cantidad debe ser >= 0', 400, 'VALIDATION_ERROR');
    }
    if (input.cantidad_rotos !== undefined && input.cantidad_rotos < 0) {
      throw new ServiceError('cantidad_rotos debe ser >= 0', 400, 'VALIDATION_ERROR');
    }
    if (
      input.cantidad !== undefined &&
      input.cantidad_rotos !== undefined &&
      input.cantidad_rotos > input.cantidad
    ) {
      throw new ServiceError('cantidad_rotos no puede ser mayor que cantidad', 400, 'VALIDATION_ERROR');
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
 
  // `usuarioId` siempre viene del token — ver comentario en
  // produccionLeche.service.ts.
  async create(input: CrearProduccionHuevosInput, usuarioId: number) {
    if (input.cantidad === undefined) {
      throw new ServiceError('cantidad es obligatoria', 400, 'VALIDATION_ERROR');
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
        lote_id: input.lote_id,
        animal_id: input.animal_id,
        cantidad: input.cantidad,
        cantidad_rotos: input.cantidad_rotos,
        jornada: input.jornada,
        observaciones: input.observaciones,
        registrado_en: input.registrado_en ? new Date(input.registrado_en) : undefined,
        creado_por_id: usuarioId,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }
 
  async update(id: number, input: ActualizarProduccionHuevosInput) {
    await this.getById(id);
    if (input.jornada && !JORNADAS_VALIDAS.includes(input.jornada)) {
      throw new ServiceError('jornada debe ser "Mañana" o "Tarde"', 400, 'VALIDATION_ERROR');
    }
    this.validar(input);
 
    try {
      return await this.repository.update(id, {
        cantidad: input.cantidad,
        cantidad_rotos: input.cantidad_rotos,
        jornada: input.jornada,
        observaciones: input.observaciones,
        registrado_en: input.registrado_en ? new Date(input.registrado_en) : undefined,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }
 
  // Borrado lógico — ver comentario en produccionLeche.service.ts.
  async delete(id: number, usuarioId: number) {
    const registro = await this.getById(id);
    if (registro.eliminado_en) {
      throw new ServiceError('El registro ya fue eliminado', 400, 'ALREADY_DELETED');
    }
    await this.repository.softDelete(id, usuarioId);
  }
 
  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return new ServiceError('lote_id o animal_id no existe', 400, 'INVALID_REFERENCE');
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
 