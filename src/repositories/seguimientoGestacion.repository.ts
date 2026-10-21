import { prisma } from '../config/prisma';
 
export interface SeguimientoGestacionFiltros {
  animal_id?: number;
  estado?: string;
  // 2026-10-20: por defecto la lista NUNCA incluye registros con borrado
  // logico (eliminado_en != null) -- solo la pantalla de Historial pasa
  // `incluirEliminados: true` para poder mostrarlos con su leyenda.
  incluirEliminados?: boolean;
}
 
// Incluye el animal, el macho y los 5 usuarios de auditoria (creado/confirmado/
// cerrado/editado/eliminado por) -- solo id y nombre_usuario, mismo patron de
// `select` ya usado en produccion para no traer la contrasena ni otros campos
// sensibles.
// 2026-10-21: animales/macho ahora anidan tambien `especies` -- la pantalla
// de detalle necesita mostrar la especie del animal involucrado (sin raza,
// a pedido explicito), y el nombre de la especie solo viene si se anida esa
// relacion (antes `animales: true` traia el id de especie pero no su nombre).
const INCLUDE_AUDITORIA = {
  animales: { include: { especies: true } },
  macho: { include: { especies: true } },
  creado_por: { select: { id: true, nombre_usuario: true } },
  confirmado_por: { select: { id: true, nombre_usuario: true } },
  cerrado_por: { select: { id: true, nombre_usuario: true } },
  editado_por: { select: { id: true, nombre_usuario: true } },
  eliminado_por: { select: { id: true, nombre_usuario: true } },
} as const;
 
export class SeguimientoGestacionRepository {
  findAll(filtros: SeguimientoGestacionFiltros) {
    return prisma.seguimiento_gestacion.findMany({
      where: {
        animal_id: filtros.animal_id,
        estado: filtros.estado,
        // `undefined` le dice a Prisma "no filtres por este campo" -- asi
        // Historial (incluirEliminados=true) trae TODO, y el resto de
        // pantallas (incluirEliminados=false/undefined) solo ven lo activo.
        eliminado_en: filtros.incluirEliminados ? undefined : null,
      },
      include: INCLUDE_AUDITORIA,
      orderBy: { fecha_inseminacion: 'desc' },
    });
  }
 
  // Sin filtro de eliminado_en a proposito: una busqueda por id puntual debe
  // poder traer un registro eliminado logicamente (lo necesita la pantalla de
  // detalle del Historial). El servicio es quien decide si bloquear acciones
  // sobre un registro ya eliminado.
  findById(id: number) {
    return prisma.seguimiento_gestacion.findUnique({
      where: { id },
      include: INCLUDE_AUDITORIA,
    });
  }
 
  create(data: {
    animal_id: number;
    macho_id?: number;
    tipo?: string;
    fecha_inseminacion: Date;
    fecha_estimada_parto: Date;
    notas?: string;
    creado_por_id: number;
  }) {
    return prisma.seguimiento_gestacion.create({
      data: { ...data, estado: 'Pendiente' },
      include: INCLUDE_AUDITORIA,
    });
  }
 
  // Edicion de campos que no son del flujo de estados (ese pasa por
  // confirmar()/cerrar()). 2026-10-20: ahora tambien deja constancia de quien
  // edito por ultima vez y cuando (editado_por_id/editado_en) -- no es un
  // historial de cada cambio, solo la ultima edicion.
  update(
    id: number,
    usuarioId: number,
    data: {
      macho_id?: number;
      tipo?: string;
      fecha_inseminacion?: Date;
      fecha_estimada_parto?: Date;
      notas?: string;
    },
  ) {
    return prisma.seguimiento_gestacion.update({
      where: { id },
      data: {
        ...data,
        editado_por_id: usuarioId,
        editado_en: new Date(),
      },
      include: INCLUDE_AUDITORIA,
    });
  }
 
  // 2026-10-19: `notas` ahora es opcional en este paso -- "Registrar
  // Seguimiento" (frontend) exige una observacion obligatoria al confirmar,
  // pero el backend la deja opcional para no romper nada que ya llame a este
  // endpoint sin ese campo. Si se manda, SOBREESCRIBE el campo `notas`
  // general del registro (no hay una columna separada para esto).
  confirmar(id: number, usuarioId: number, notas?: string) {
    return prisma.seguimiento_gestacion.update({
      where: { id },
      data: {
        estado: 'Gestante',
        confirmado_por_id: usuarioId,
        confirmado_en: new Date(),
        ...(notas !== undefined ? { notas } : {}),
      },
      include: INCLUDE_AUDITORIA,
    });
  }
 
  cerrar(
    id: number,
    usuarioId: number,
    data: { resultado: string; fecha_real_parto?: Date; notas?: string },
  ) {
    return prisma.seguimiento_gestacion.update({
      where: { id },
      data: {
        estado: data.resultado,
        fecha_real_parto: data.fecha_real_parto,
        notas: data.notas,
        cerrado_por_id: usuarioId,
        cerrado_en: new Date(),
      },
      include: INCLUDE_AUDITORIA,
    });
  }
 
  // 2026-10-20: ya NO borra fisicamente -- borrado logico (mismo patron que
  // produccion_huevos/produccion_leche) para que el registro pueda seguir
  // apareciendo en el Historial con la leyenda "Registro eliminado".
  eliminar(id: number, usuarioId: number) {
    return prisma.seguimiento_gestacion.update({
      where: { id },
      data: {
        eliminado_por_id: usuarioId,
        eliminado_en: new Date(),
      },
      include: INCLUDE_AUDITORIA,
    });
  }
}
 