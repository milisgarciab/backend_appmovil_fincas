import { Prisma } from '@prisma/client';
import { BodegaRepository, BodegaFiltros } from '../repositories/bodega.repository';
import { MovimientoInventarioRepository } from '../repositories/movimientoInventario.repository';

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
const MOTIVOS_VALIDOS = ['Compra', 'Consumo', 'Merma'];

export interface CrearBodegaInput {
  categoria_id?: number;
  nombre?: string;
  unidad_medida?: string;
  stock_inicial?: number;
  stock_minimo?: number;
}

export interface ActualizarBodegaInput {
  categoria_id?: number;
  nombre?: string;
  unidad_medida?: string;
  stock_minimo?: number;
}

export interface MovimientoInput {
  tipo?: 'Entrada' | 'Salida';
  cantidad?: number;
  motivo?: string;
  fecha?: string;
}

export class BodegaService {
  private repository = new BodegaRepository();
  private movimientoInventarioRepository = new MovimientoInventarioRepository();

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
    if ((input.stock_inicial ?? 0) < 0 || (input.stock_minimo ?? 0) < 0) {
      throw new ServiceError('stock_inicial y stock_minimo no pueden ser negativos', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.repository.create({
        categoria_id: input.categoria_id,
        nombre: input.nombre,
        unidad_medida: input.unidad_medida,
        stock_actual: input.stock_inicial ?? 0,
        stock_minimo: input.stock_minimo ?? 0,
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
    await this.repository.delete(id);
  }

  // HU-17: registra entrada o salida de stock, y deja rastro en movimientos_inventario.
  // Todo ocurre en una sola transacción atómica (ver MovimientoInventarioRepository).
  async registrarMovimiento(id: number, input: MovimientoInput) {
    await this.getById(id);

    if (!input.tipo || !['Entrada', 'Salida'].includes(input.tipo)) {
      throw new ServiceError('tipo debe ser "Entrada" o "Salida"', 400, 'VALIDATION_ERROR');
    }
    if (!input.cantidad || input.cantidad <= 0) {
      throw new ServiceError('cantidad debe ser mayor a 0', 400, 'VALIDATION_ERROR');
    }
    if (!input.motivo || !MOTIVOS_VALIDOS.includes(input.motivo)) {
      throw new ServiceError(`motivo debe ser una de: ${MOTIVOS_VALIDOS.join(', ')}`, 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.movimientoInventarioRepository.registrarMovimiento({
        insumo_id: id,
        tipo: input.tipo,
        cantidad: input.cantidad,
        motivo: input.motivo,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'STOCK_INSUFICIENTE') {
        throw new ServiceError('El stock actual es insuficiente para esta salida', 400, 'STOCK_INSUFICIENTE');
      }
      throw this.mapPrismaError(error);
    }
  }

  // HU-18: insumos cuyo stock actual llegó o bajó del mínimo configurado.
  async alertasStockBajo() {
    const todos = await this.repository.findAll({});
    return todos.filter((insumo) => Number(insumo.stock_actual) <= Number(insumo.stock_minimo));
  }

  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return new ServiceError('categoria_id no existe', 400, 'INVALID_REFERENCE');
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
