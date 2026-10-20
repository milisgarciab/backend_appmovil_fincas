import { prisma } from '../config/prisma';
 
export interface SeguimientoGestacionFiltros {
  animal_id?: number;
  estado?: string;
}
 
// Incluye el animal, el macho y los 3 usuarios de auditoria (creado/confirmado/
// cerrado por) -- solo id y nombre_usuario, mismo patron de `select` ya usado
// en produccion para no traer la contrasena ni otros campos sensibles.
const INCLUDE_AUDITORIA = {
  animales: true,
  macho: true,
  creado_por: { select: { id: true, nombre_usuario: true } },
  confirmado_por: { select: { id: true, nombre_usuario: true } },
  cerrado_por: { select: { id: true, nombre_usuario: true } },
} as const;
 
export class SeguimientoGestacionRepository {
  findAll(filtros: SeguimientoGestacionFiltros) {
    return prisma.seguimiento_gestacion.findMany({
      where: {
        animal_id: filtros.animal_id,
        estado: filtros.estado,
      },
      include: INCLUDE_AUDITORIA,
      orderBy: { fecha_inseminacion: 'desc' },
    });
  }
 
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
  // confirmar()/cerrar()).
  update(
    id: number,
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
      data,
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
 
  delete(id: number) {
    return prisma.seguimiento_gestacion.delete({ where: { id } });
  }
}
 