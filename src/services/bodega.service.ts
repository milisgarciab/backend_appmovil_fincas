import { Prisma } from '@prisma/client';
import { BodegaRepository, BodegaFiltros } from '../repositories/bodega.repository';

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

const UNIDADES_VALIDAS = ['ml', 'Ltr', 'g', 'Kg', 'Dosis', 'Unidad', 'Bulto', 'Arroba'];

export interface CrearBodegaInput {
  categoria_id?: number;
  nombre?: string;
  unidad_medida?: string;
}

export interface ActualizarBodegaInput {
  categoria_id?: number;
  nombre?: string;
  unidad_medida?: string;
}

export class BodegaService {
  private repository = new BodegaRepository();

  listAll(filtros: BodegaFiltros) {
    return this.repository.findAll(filtros);
  }

  async getById(id: number) {
    const insumo = await this.repository.findById(id);
    if (!insumo) {
      throw new ServiceError('Insumo no encontrado', 404, 'NOT_FOUND');
    }
    return insumo;
  }

  async create(input: CrearBodegaInput) {
    if (!input.categoria_id || !input.nombre || !input.unidad_medida) {
      throw new ServiceError('categoria_id, nombre y unidad_medida son obligatorios', 400, 'VALIDATION_ERROR');
    }
    if (!UNIDADES_VALIDAS.includes(input.unidad_medida)) {
      throw new ServiceError(
        `unidad_medida debe ser una de: ${UNIDADES_VALIDAS.join(', ')}`,
        400,
        'VALIDATION_ERROR',
      );
    }

    try {
      return await this.repository.create({
        categoria_id: input.categoria_id,
        nombre: input.nombre,
        unidad_medida: input.unidad_medida,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: number, input: ActualizarBodegaInput) {
    await this.getById(id);
    if (input.unidad_medida && !UNIDADES_VALIDAS.includes(input.unidad_medida)) {
      throw new ServiceError(
        `unidad_medida debe ser una de: ${UNIDADES_VALIDAS.join(', ')}`,
        400,
        'VALIDATION_ERROR',
      );
    }

    try {
      return await this.repository.update(id, input);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async delete(id: number) {
    await this.getById(id);
    // Aviso: borrar el insumo borra en cascada todos sus lotes (lotes_inventario).
    await this.repository.delete(id);
  }

  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return new ServiceError('categoria_id no existe', 400, 'INVALID_REFERENCE');
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}