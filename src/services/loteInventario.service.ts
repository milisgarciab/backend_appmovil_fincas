import { Prisma } from '@prisma/client';
import { LoteInventarioRepository, LoteInventarioFiltros } from '../repositories/loteInventario.repository';

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

export interface CrearLoteInventarioInput {
  insumo_id?: number;
  numero_lote?: string;
  fecha_vencimiento?: string;
  cantidad_disponible?: number;
  costo_unitario?: number;
}

export interface ActualizarLoteInventarioInput {
  numero_lote?: string;
  fecha_vencimiento?: string;
  cantidad_disponible?: number;
  costo_unitario?: number;
}

export class LoteInventarioService {
  private repository = new LoteInventarioRepository();

  listAll(filtros: LoteInventarioFiltros) {
    return this.repository.findAll(filtros);
  }

  async getById(id: number) {
    const lote = await this.repository.findById(id);
    if (!lote) {
      throw new ServiceError('Lote de inventario no encontrado', 404, 'NOT_FOUND');
    }
    return lote;
  }

  async create(input: CrearLoteInventarioInput) {
    if (
      !input.insumo_id ||
      !input.fecha_vencimiento ||
      input.cantidad_disponible === undefined ||
      input.costo_unitario === undefined
    ) {
      throw new ServiceError(
        'insumo_id, fecha_vencimiento, cantidad_disponible y costo_unitario son obligatorios',
        400,
        'VALIDATION_ERROR',
      );
    }

    try {
      return await this.repository.create({
        insumo_id: input.insumo_id,
        numero_lote: input.numero_lote,
        fecha_vencimiento: new Date(input.fecha_vencimiento),
        cantidad_disponible: input.cantidad_disponible,
        costo_unitario: input.costo_unitario,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: number, input: ActualizarLoteInventarioInput) {
    await this.getById(id);

    try {
      return await this.repository.update(id, {
        numero_lote: input.numero_lote,
        fecha_vencimiento: input.fecha_vencimiento ? new Date(input.fecha_vencimiento) : undefined,
        cantidad_disponible: input.cantidad_disponible,
        costo_unitario: input.costo_unitario,
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
      return new ServiceError('insumo_id no existe', 400, 'INVALID_REFERENCE');
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
