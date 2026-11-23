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

  // `usuarioId` viene del token: solo se usa para atribuir el movimiento de stock.
  async update(id: number, input: ActualizarProduccionHuevosInput, usuarioId: number) {
    const actual = await this.getById(id);
    // Un registro eliminado ya no se puede editar (su stock ya se revirtió).
    if (actual.eliminado_en) {
      throw new ServiceError('No se puede editar un registro eliminado', 400, 'REGISTRO_ELIMINADO');
    }
    // Los rotos nunca pueden superar la cantidad FINAL (la enviada o, si no
    // se envió, la guardada), aunque solo se edite uno de los dos campos.
    const cantidadFinal = input.cantidad ?? actual.cantidad;
    const rotosFinal = input.cantidad_rotos ?? actual.cantidad_rotos ?? 0;
    if (rotosFinal > cantidadFinal) {
      throw new ServiceError('cantidad_rotos no puede ser mayor que cantidad', 400, 'VALIDATION_ERROR');
    }
    if (input.jornada && !JORNADAS_VALIDAS.includes(input.jornada)) {
      throw new ServiceError('jornada debe ser "Mañana" o "Tarde"', 400, 'VALIDATION_ERROR');
    }
    this.validar(input);

    try {
      return await this.repository.update(id, {
        usuario_id: usuarioId,
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
    try {
      await this.repository.softDelete(id, usuarioId);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Error && error.message === 'STOCK_INSUFICIENTE') {
      return new ServiceError(
        'No se puede aplicar el cambio: el stock quedaría negativo (parte de esta producción ya se vendió)',
        400,
        'STOCK_INSUFICIENTE',
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return new ServiceError('lote_id o animal_id no existe', 400, 'INVALID_REFERENCE');
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
