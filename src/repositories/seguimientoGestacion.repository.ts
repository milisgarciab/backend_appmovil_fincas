import { prisma } from '../config/prisma';

export interface SeguimientoGestacionFiltros {
  animal_id?: number;
  estado?: string;
}

export class SeguimientoGestacionRepository {
  findAll(filtros: SeguimientoGestacionFiltros) {
    return prisma.seguimiento_gestacion.findMany({
      where: {
        animal_id: filtros.animal_id,
        estado: filtros.estado,
      },
      include: { animales: true },
      orderBy: { fecha_inseminacion: 'desc' },
    });
  }

  findById(id: number) {
    return prisma.seguimiento_gestacion.findUnique({
      where: { id },
      include: { animales: true },
    });
  }

  create(data: {
    animal_id: number;
    fecha_inseminacion: Date;
    fecha_estimada_parto: Date;
    estado?: string;
    notas?: string;
  }) {
    return prisma.seguimiento_gestacion.create({ data });
  }

  update(
    id: number,
    data: {
      fecha_inseminacion?: Date;
      fecha_estimada_parto?: Date;
      fecha_real_parto?: Date;
      estado?: string;
      notas?: string;
    },
  ) {
    return prisma.seguimiento_gestacion.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.seguimiento_gestacion.delete({ where: { id } });
  }
}
