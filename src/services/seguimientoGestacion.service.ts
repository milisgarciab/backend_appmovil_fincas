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
// 'Fallida' agregado 2026-10-20: cierre directo desde "Pendiente" cuando la
// IA/monta no resultó en preñez (no requiere pasar por "Gestante" primero,
// ni fecha_real_parto). Ver cerrar() mas abajo.
const RESULTADOS_VALIDOS = ['Parida', 'Abortada', 'Fallida'];
 
// Dias de gestacion por especie. Si la especie del animal no esta en este mapa,
// fecha_estimada_parto debe venir manual en el input (decision de negocio confirmada).
// Alcance confirmado del modulo Reproduccion: solo bovinos y porcinos (no ovinos
// ni aves) -- por eso el mapa no crece mas alla de estas dos especies.
//
// IMPORTANTE (2026-10-15): las claves deben coincidir con el nombre REAL de la
// especie en el catalogo (`especies.nombre`), en minusculas -- no con el nombre
// "de libro" del animal. Confirmado contra la BD real: la especie se llama
// "Bovino" (no "vaca") y "Cerdo" (esta si coincidia).
const DIAS_GESTACION_POR_ESPECIE: Record<string, number> = {
  bovino: 283,
  cerdo: 114,
};
 
export interface CrearSeguimientoInput {
  animal_id?: number;
  macho_id?: number;
  tipo?: string;
  fecha_inseminacion?: string;
  fecha_estimada_parto?: string;
  notas?: string;
}
 
export interface ActualizarSeguimientoInput {
  macho_id?: number;
  tipo?: string;
  fecha_inseminacion?: string;
  fecha_estimada_parto?: string;
  notas?: string;
}
 
export interface CerrarSeguimientoInput {
  resultado?: string;
  fecha_real_parto?: string;
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
      throw new ServiceError('Registro de reproduccion no encontrado', 404, 'NOT_FOUND');
    }
    return registro;
  }
 
  // Nota: no se valida que el animal sea Hembra (decision confirmada) -- cualquier animal_id
  // existente es aceptado.
  //
  // Auditoria (2026-10-15): el registro siempre nace en estado "Pendiente" --
  // pasar a "Gestante" (confirmada) requiere un paso explicito via confirmar().
  // `creadoPorId` viene siempre del token de sesion (nunca del body).
  async create(input: CrearSeguimientoInput, creadoPorId: number) {
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
 
    try {
      return await this.repository.create({
        animal_id: input.animal_id,
        macho_id: input.macho_id,
        tipo: input.tipo,
        fecha_inseminacion: new Date(input.fecha_inseminacion),
        fecha_estimada_parto: fechaEstimadaParto,
        notas: input.notas,
        creado_por_id: creadoPorId,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }
 
  // Edicion de campos que no forman parte del flujo de estados (ese pasa por
  // confirmar()/cerrar()). Un registro ya cerrado (Parida/Abortada/Fallida) o
  // ya eliminado (borrado logico) queda inmutable para estos campos.
  // 2026-10-20: ahora recibe `usuarioId` para dejar constancia de quien edito
  // por ultima vez (editado_por_id/editado_en).
  async update(id: number, input: ActualizarSeguimientoInput, usuarioId: number) {
    const registroActual = await this.getById(id);
    this.rechazarSiEliminado(registroActual);
    if (this.estaCerrado(registroActual.estado)) {
      throw new ServiceError('El registro ya esta cerrado y no se puede editar', 400, 'REGISTRO_CERRADO');
    }
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
      return await this.repository.update(id, usuarioId, {
        macho_id: input.macho_id,
        tipo: input.tipo,
        fecha_inseminacion: input.fecha_inseminacion ? new Date(input.fecha_inseminacion) : undefined,
        fecha_estimada_parto: input.fecha_estimada_parto
          ? new Date(input.fecha_estimada_parto)
          : undefined,
        notas: input.notas,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }
 
  // Paso 2 del flujo (HU auditoria): confirma una gestacion "Pendiente" -> "Gestante".
  // Puede hacerlo cualquier usuario autenticado, no solo quien la creo.
  //
  // 2026-10-19: `notas` es opcional -- "Registrar Seguimiento" (frontend) la
  // exige en su formulario como observacion obligatoria del paso, pero el
  // backend la deja opcional para no romper otros llamadores existentes.
  async confirmar(id: number, usuarioId: number, notas?: string) {
    const registro = await this.getById(id);
    this.rechazarSiEliminado(registro);
    if (registro.estado !== 'Pendiente') {
      throw new ServiceError(
        'Solo se puede confirmar un seguimiento en estado Pendiente',
        400,
        'ESTADO_INVALIDO',
      );
    }
    const actualizado = await this.repository.confirmar(id, usuarioId, notas);
    await this.animalService.update(registro.animal_id, { estado: 'En gestación' });
    return actualizado;
  }
 
  // Paso 3 del flujo: cierra un seguimiento "Pendiente" o "Gestante" con su
  // resultado final (Parida/Abortada/Fallida). HU-15: al cerrar, el animal
  // deja de estar "En gestación".
  //
  // 2026-10-20: 'Fallida' es el unico resultado que se puede aplicar tanto
  // desde "Gestante" como DIRECTO desde "Pendiente" (la IA/monta no resulto
  // en preñez, nunca se llego a confirmar) -- por eso este metodo ya
  // aceptaba cerrar() desde Pendiente (solo validaba `!estaCerrado`), nada
  // mas habia que sumar 'Fallida' a RESULTADOS_VALIDOS.
  async cerrar(id: number, usuarioId: number, input: CerrarSeguimientoInput) {
    const registro = await this.getById(id);
    this.rechazarSiEliminado(registro);
    if (this.estaCerrado(registro.estado)) {
      throw new ServiceError('El registro ya fue cerrado', 400, 'YA_CERRADO');
    }
    if (!input.resultado || !RESULTADOS_VALIDOS.includes(input.resultado)) {
      throw new ServiceError(`resultado debe ser uno de: ${RESULTADOS_VALIDOS.join(', ')}`, 400, 'VALIDATION_ERROR');
    }
    if (input.resultado === 'Parida' && !input.fecha_real_parto) {
      throw new ServiceError('fecha_real_parto es obligatoria cuando resultado es Parida', 400, 'VALIDATION_ERROR');
    }
    if (input.fecha_real_parto) {
      this.validarFechaNoFutura(input.fecha_real_parto);
      // 2026-10-20, a pedido explicito: no tiene sentido que un animal
      // paresca o aborte ANTES de haber sido inseminado/montado -- el
      // frontend ya lo valida (selector de fecha + chequeo en _guardar()),
      // esto es el respaldo del lado del servidor.
      if (new Date(input.fecha_real_parto).getTime() < registro.fecha_inseminacion.getTime()) {
        throw new ServiceError(
          'fecha_real_parto no puede ser anterior a fecha_inseminacion',
          400,
          'VALIDATION_ERROR',
        );
      }
    }
 
    const actualizado = await this.repository.cerrar(id, usuarioId, {
      resultado: input.resultado,
      fecha_real_parto: input.fecha_real_parto ? new Date(input.fecha_real_parto) : undefined,
      notas: input.notas,
    });
    await this.animalService.update(registro.animal_id, { estado: 'Activo' });
    return actualizado;
  }
 
  // 2026-10-20: borrado logico (mismo patron que produccion_huevos/leche) --
  // ya NO elimina la fila fisicamente, solo marca eliminado_por_id/eliminado_en
  // para que el registro siga apareciendo en el Historial con su leyenda.
  async delete(id: number, usuarioId: number) {
    const registro = await this.getById(id);
    this.rechazarSiEliminado(registro);
    await this.repository.eliminar(id, usuarioId);
  }
 
  private estaCerrado(estado: string | null): boolean {
    return estado === 'Parida' || estado === 'Abortada' || estado === 'Fallida';
  }
 
  private rechazarSiEliminado(registro: { eliminado_en: Date | null }) {
    if (registro.eliminado_en) {
      throw new ServiceError('El registro ya fue eliminado', 400, 'YA_ELIMINADO');
    }
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
        `No hay dias de gestacion configurados para la especie "${animal.especies.nombre}". fecha_estimada_parto es obligatoria en este caso.`,
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
      throw new ServiceError('La fecha no puede ser futura', 400, 'VALIDATION_ERROR');
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
 