import { prisma } from '../config/prisma';
 
export interface EventoSanitarioFiltros {
  animal_id?: number;
  tipo_evento?: string;
  // 2026-11-01 (historial de Salud, mismo patron de Produccion): por
  // defecto los eliminados (borrado logico) quedan fuera del listado. Con
  // `true` se incluyen tambien -- usado por "Eventos de salud registrados"
  // cuando Dany activa el filtro "Eliminados".
  incluir_eliminados?: boolean;
}
 
// Mismo `select` seguro ya usado en Producción (creado_por/eliminado_por):
// solo id + nombre_usuario, nunca el objeto `usuarios` completo (que trae
// correo/contraseña hasheada/etc).
const SELECT_USUARIO_BASICO = { id: true, nombre_usuario: true };
 
export class EventoSanitarioRepository {
  findAll(filtros: EventoSanitarioFiltros) {
    return prisma.eventos_sanitarios.findMany({
      where: {
        animal_id: filtros.animal_id,
        tipo_evento: filtros.tipo_evento,
        // 2026-11-01: `undefined` no filtra nada (Prisma lo ignora) -- con
        // eso se incluyen los eliminados cuando se pide explicitamente.
        eliminado_en: filtros.incluir_eliminados ? undefined : null,
      },
      include: {
        animales: true,
        creado_por: { select: SELECT_USUARIO_BASICO },
        eliminado_por: { select: SELECT_USUARIO_BASICO },
        eventos_sanitarios_historial: {
          orderBy: { fecha: 'asc' },
          include: { usuarios: { select: SELECT_USUARIO_BASICO } },
        },
      },
      orderBy: { fecha_evento: 'desc' },
    });
  }
 
  findById(id: number) {
    return prisma.eventos_sanitarios.findUnique({
      where: { id },
      include: {
        animales: true,
        creado_por: { select: SELECT_USUARIO_BASICO },
        eliminado_por: { select: SELECT_USUARIO_BASICO },
        eventos_sanitarios_historial: {
          orderBy: { fecha: 'asc' },
          include: { usuarios: { select: SELECT_USUARIO_BASICO } },
        },
      },
    });
  }
 
  create(data: {
    animal_id: number;
    tipo_evento: string;
    dosis_aplicada?: number;
    descripcion_tratamiento?: string;
    fecha_evento?: Date;
    via_administracion?: string;
    unidad_dosis?: string;
    profesional_responsable?: string;
    medicamento?: string;
    fecha_proximo_refuerzo?: Date;
    // 2026-11-01: quien crea el evento -- mismo patron de Produccion.
    creado_por_id?: number;
  }) {
    return prisma.eventos_sanitarios.create({ data });
  }
 
  update(
    id: number,
    data: {
      tipo_evento?: string;
      dosis_aplicada?: number;
      descripcion_tratamiento?: string;
      fecha_evento?: Date;
      via_administracion?: string;
      unidad_dosis?: string;
      profesional_responsable?: string;
      medicamento?: string;
      // 2026-10-31 (bug reportado por Dany): admite `null` explícito, no
      // solo `undefined` -- `undefined` en Prisma significa "no tocar este
      // campo", mientras que `null` sí lo limpia de verdad en la base de
      // datos. Antes solo aceptaba `Date | undefined`, así que no había
      // forma de pedirle al backend "borra el refuerzo programado".
      fecha_proximo_refuerzo?: Date | null;
    },
  ) {
    return prisma.eventos_sanitarios.update({ where: { id }, data });
  }
 
  updateEstado(id: number, estado: string) {
    return prisma.eventos_sanitarios.update({ where: { id }, data: { estado } });
  }
 
  // 2026-11-01, a pedido de Dany ("el mismo estilo de Historial... que
  // muestra si algunos fueron eliminados, como el de producción y
  // reproducción"): el evento ya NUNCA se borra físicamente -- se marca
  // `eliminado_en`/`eliminado_por_id`, mismo patrón que
  // produccion_leche/produccion_huevos/seguimiento_gestacion. Así queda
  // disponible para mostrarse (tachado) en "Eventos de salud registrados"
  // cuando se activa el filtro "Eliminados".
  eliminarLogico(id: number, eliminadoPorId?: number) {
    return prisma.eventos_sanitarios.update({
      where: { id },
      data: { eliminado_en: new Date(), eliminado_por_id: eliminadoPorId },
    });
  }
 
  // Flujo de registro (HU pedida por Dany, 2026-10-31): cada Creación,
  // Edición, Resolución o Eliminación queda como una fila nueva -- a
  // diferencia del patrón "último editor" ya usado en Producción, acá SÍ
  // hace falta un historial de longitud variable (puede haber varias
  // ediciones).
  crearHistorial(
    eventoSanitarioId: number,
    accion: 'Creado' | 'Editado' | 'Resuelto' | 'Eliminado',
    usuarioId?: number,
  ) {
    return prisma.eventos_sanitarios_historial.create({
      data: {
        evento_sanitario_id: eventoSanitarioId,
        accion,
        usuario_id: usuarioId,
      },
    });
  }
}
 