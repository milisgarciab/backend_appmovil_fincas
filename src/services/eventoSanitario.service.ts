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
 
const ESTADOS_VALIDOS = ['Abierto', 'En tratamiento', 'Resuelto'];
 
export interface CrearEventoSanitarioInput {
  animal_id?: number;
  tipo_evento?: string;
  dosis_aplicada?: number;
  descripcion_tratamiento?: string;
  fecha_evento?: string;
  via_administracion?: string;
  unidad_dosis?: string;
  profesional_responsable?: string;
  medicamento?: string;
  fecha_proximo_refuerzo?: string;
}
 
export interface ActualizarEventoSanitarioInput {
  tipo_evento?: string;
  dosis_aplicada?: number;
  descripcion_tratamiento?: string;
  fecha_evento?: string;
  via_administracion?: string;
  unidad_dosis?: string;
  profesional_responsable?: string;
  medicamento?: string;
  // 2026-10-31 (bug reportado por Dany): admite `null` explícito además de
  // `string`/`undefined` -- el frontend manda `null` cuando el usuario
  // elige "No" en "¿Próximo refuerzo?" para borrar la fecha programada,
  // distinto de no mandar el campo (que significa "no tocar").
  fecha_proximo_refuerzo?: string | null;
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
 
  async create(input: CrearEventoSanitarioInput, usuarioId?: number) {
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
      const evento = await this.repository.create({
        animal_id: input.animal_id,
        tipo_evento: input.tipo_evento,
        dosis_aplicada: input.dosis_aplicada,
        descripcion_tratamiento: input.descripcion_tratamiento,
        fecha_evento: input.fecha_evento ? new Date(input.fecha_evento) : undefined,
        via_administracion: input.via_administracion,
        unidad_dosis: input.unidad_dosis,
        profesional_responsable: input.profesional_responsable,
        medicamento: input.medicamento,
        fecha_proximo_refuerzo: input.fecha_proximo_refuerzo
          ? new Date(input.fecha_proximo_refuerzo)
          : undefined,
        // 2026-11-01: quien crea el evento -- mismo patrón de Producción.
        creado_por_id: usuarioId,
      });
      await this.repository.crearHistorial(evento.id, 'Creado', usuarioId);
      return this.getById(evento.id);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }
 
  async update(id: number, input: ActualizarEventoSanitarioInput, usuarioId?: number) {
    const actual = await this.getById(id);
    // 2026-11-01: un evento eliminado (borrado lógico) queda congelado --
    // no tiene sentido editar algo que ya no aparece en el listado normal.
    if (actual.eliminado_en) {
      throw new ServiceError(
        'Este evento fue eliminado y no se puede editar',
        400,
        'EVENTO_ELIMINADO',
      );
    }
    // 2026-10-31, a pedido de Dany: un evento Resuelto queda bloqueado --
    // ni los campos ni el estado se pueden volver a tocar desde ahí.
    if (actual.estado === 'Resuelto') {
      throw new ServiceError(
        'Este evento ya está Resuelto y no se puede editar',
        400,
        'EVENTO_RESUELTO',
      );
    }
    if (input.tipo_evento && !TIPOS_EVENTO_VALIDOS.includes(input.tipo_evento)) {
      throw new ServiceError(
        `tipo_evento debe ser uno de: ${TIPOS_EVENTO_VALIDOS.join(', ')}`,
        400,
        'VALIDATION_ERROR',
      );
    }
 
    try {
      await this.repository.update(id, {
        tipo_evento: input.tipo_evento,
        dosis_aplicada: input.dosis_aplicada,
        descripcion_tratamiento: input.descripcion_tratamiento,
        fecha_evento: input.fecha_evento ? new Date(input.fecha_evento) : undefined,
        via_administracion: input.via_administracion,
        unidad_dosis: input.unidad_dosis,
        profesional_responsable: input.profesional_responsable,
        medicamento: input.medicamento,
        // 2026-10-31 (bug reportado por Dany): `null` explícito (el usuario
        // puso "No" en refuerzo) borra el campo de verdad; `undefined`
        // (el campo no vino en el body) lo deja intacto.
        fecha_proximo_refuerzo:
          input.fecha_proximo_refuerzo === null
            ? null
            : input.fecha_proximo_refuerzo
              ? new Date(input.fecha_proximo_refuerzo)
              : undefined,
      });
      await this.repository.crearHistorial(id, 'Editado', usuarioId);
      return this.getById(id);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }
 
  async cambiarEstado(id: number, estado?: string, usuarioId?: number) {
    const actual = await this.getById(id);
    if (actual.eliminado_en) {
      throw new ServiceError(
        'Este evento fue eliminado y no se puede cambiar de estado',
        400,
        'EVENTO_ELIMINADO',
      );
    }
    if (actual.estado === 'Resuelto') {
      throw new ServiceError(
        'Este evento ya está Resuelto y no se puede volver a cambiar de estado',
        400,
        'EVENTO_RESUELTO',
      );
    }
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      throw new ServiceError(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`, 400, 'VALIDATION_ERROR');
    }
    // 2026-10-31, a pedido de Dany: no se puede marcar un evento como
    // Resuelto mientras tenga un refuerzo pendiente programado
    // (fecha_proximo_refuerzo definida) -- primero hay que aplicarlo o
    // quitarlo (editar el evento y poner "No" en Próximo refuerzo).
    if (estado === 'Resuelto' && actual.fecha_proximo_refuerzo) {
      throw new ServiceError(
        'No se puede marcar como Resuelto mientras haya un refuerzo pendiente. Aplica o quita el próximo refuerzo primero.',
        400,
        'REFUERZO_PENDIENTE',
      );
    }
    await this.repository.updateEstado(id, estado);
    if (estado === 'Resuelto') {
      await this.repository.crearHistorial(id, 'Resuelto', usuarioId);
    }
    return this.getById(id);
  }
 
  // 2026-11-01, a pedido de Dany ("el mismo estilo de Historial... que
  // muestra si algunos fueron eliminados, como el de producción y
  // reproducción"): ya no es un borrado físico -- se marca
  // eliminado_en/eliminado_por_id (ver repository.eliminarLogico) y se
  // agrega una fila "Eliminado" al Flujo de registro, igual que
  // Creado/Editado/Resuelto. Eliminar un evento ya eliminado se rechaza.
  async delete(id: number, usuarioId?: number) {
    const actual = await this.getById(id);
    if (actual.eliminado_en) {
      throw new ServiceError('Este evento ya fue eliminado', 400, 'ALREADY_DELETED');
    }
    await this.repository.eliminarLogico(id, usuarioId);
    await this.repository.crearHistorial(id, 'Eliminado', usuarioId);
  }
 
  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return new ServiceError('animal_id no existe', 400, 'INVALID_REFERENCE');
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
 