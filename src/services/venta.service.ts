import { VentaRepository } from '../repositories/venta.repository';

export class ServiceError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

const ESTADOS_PAGO_VALIDOS = ['Pagado', 'Pendiente'];

export interface CrearVentaInput {
  producto?: string;
  cantidad?: number;
  precio_unitario?: number;
  comprador?: string;
  fecha?: string;
  estado_pago?: string;
  fecha_pago?: string | null;
  fecha_limite_pago?: string | null;
}

export type ActualizarVentaInput = Partial<CrearVentaInput>;

export class VentaService {
  private repository = new VentaRepository();

  listAll() {
    return this.repository.findAll();
  }

  async getById(id: number) {
    const venta = await this.repository.findById(id);
    if (!venta) {
      throw new ServiceError('Venta no encontrada', 404, 'NOT_FOUND');
    }
    return venta;
  }

  private validarEstadoPago(estado: string | undefined) {
    if (estado !== undefined && !ESTADOS_PAGO_VALIDOS.includes(estado)) {
      throw new ServiceError(`estado_pago debe ser uno de: ${ESTADOS_PAGO_VALIDOS.join(', ')}`, 400, 'VALIDATION_ERROR');
    }
  }

  private parseFecha(valor: string, campo: string) {
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      throw new ServiceError(`${campo} no es una fecha válida`, 400, 'VALIDATION_ERROR');
    }
    return fecha;
  }

  async create(input: CrearVentaInput) {
    if (!input.producto || !input.cantidad || !input.precio_unitario || !input.fecha) {
      throw new ServiceError('producto, cantidad, precio_unitario y fecha son obligatorios', 400, 'VALIDATION_ERROR');
    }
    if (input.cantidad <= 0 || input.precio_unitario <= 0) {
      throw new ServiceError('cantidad y precio_unitario deben ser mayores a 0', 400, 'VALIDATION_ERROR');
    }
    this.validarEstadoPago(input.estado_pago);
    const total = Number((input.cantidad * input.precio_unitario).toFixed(2));
    const fecha = new Date(input.fecha);
    const estadoPago = input.estado_pago ?? 'Pagado';

    let fechaPago: Date | null = null;
    let fechaLimitePago: Date | null = null;
    if (estadoPago === 'Pagado') {
      fechaPago = input.fecha_pago ? this.parseFecha(input.fecha_pago, 'fecha_pago') : fecha;
    } else {
      if (input.fecha_pago) {
        throw new ServiceError('Una venta Pendiente no puede tener fecha_pago', 400, 'VALIDATION_ERROR');
      }
      if (input.fecha_limite_pago) {
        fechaLimitePago = this.parseFecha(input.fecha_limite_pago, 'fecha_limite_pago');
        if (fechaLimitePago < fecha) {
          throw new ServiceError('fecha_limite_pago no puede ser anterior a la fecha de la venta', 400, 'VALIDATION_ERROR');
        }
      }
    }

    return this.repository.create({
      producto: input.producto,
      cantidad: input.cantidad,
      precio_unitario: input.precio_unitario,
      total,
      comprador: input.comprador,
      fecha,
      estado_pago: estadoPago,
      fecha_pago: fechaPago,
      fecha_limite_pago: fechaLimitePago,
    });
  }

  async update(id: number, input: ActualizarVentaInput) {
    const actual = await this.getById(id);
    const cantidad = input.cantidad ?? Number(actual.cantidad);
    const precioUnitario = input.precio_unitario ?? Number(actual.precio_unitario);
    const total = Number((cantidad * precioUnitario).toFixed(2));

    this.validarEstadoPago(input.estado_pago);
    const estadoActual = actual.estado_pago;
    const estadoFinal = input.estado_pago ?? estadoActual;
    let fechaPago: Date | null | undefined = undefined;
    let fechaLimitePago: Date | null | undefined = undefined;

    if (estadoFinal === 'Pagado') {
      if (estadoActual !== 'Pagado') {
        // Pendiente -> Pagado: se registra el pago y se descarta la fecha límite
        fechaPago = input.fecha_pago ? this.parseFecha(input.fecha_pago, 'fecha_pago') : new Date();
        fechaLimitePago = null;
      } else if (input.fecha_pago) {
        fechaPago = this.parseFecha(input.fecha_pago, 'fecha_pago');
      }
    } else {
      if (input.fecha_pago) {
        throw new ServiceError('Una venta Pendiente no puede tener fecha_pago', 400, 'VALIDATION_ERROR');
      }
      if (estadoActual === 'Pagado') {
        // Pagado -> Pendiente: se anula la fecha de pago
        fechaPago = null;
      }
      if (input.fecha_limite_pago === null) {
        fechaLimitePago = null;
      } else if (input.fecha_limite_pago) {
        fechaLimitePago = this.parseFecha(input.fecha_limite_pago, 'fecha_limite_pago');
        const fechaVenta = input.fecha ? new Date(input.fecha) : actual.fecha;
        if (fechaLimitePago < fechaVenta) {
          throw new ServiceError('fecha_limite_pago no puede ser anterior a la fecha de la venta', 400, 'VALIDATION_ERROR');
        }
      }
    }

    return this.repository.update(id, {
      producto: input.producto,
      cantidad: input.cantidad,
      precio_unitario: input.precio_unitario,
      total,
      comprador: input.comprador,
      fecha: input.fecha ? new Date(input.fecha) : undefined,
      estado_pago: input.estado_pago,
      fecha_pago: fechaPago,
      fecha_limite_pago: fechaLimitePago,
    });
  }

  async delete(id: number) {
    await this.getById(id);
    await this.repository.delete(id);
  }
}