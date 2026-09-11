import { prisma } from '../config/prisma';

export interface EventoSanitarioFiltros {
  animal_id?: number;
  tipo_evento?: string;
}

export class EventoSanitarioRepository {
  findAll(filtros: EventoSanitarioFiltros) {
    return prisma.eventos_sanitarios.findMany({
      where: {
        animal_id: filtros.animal_id,
        tipo_evento: filtros.tipo_evento,
      },
      include: { animales: true },
      orderBy: { fecha_evento: 'desc' },
    });
  }

  findById(id: number) {
    return prisma.eventos_sanitarios.findUnique({
      where: { id },
      include: { animales: true },
    });
  }

  create(data: {
    animal_id: number;
    tipo_evento: string;
    dosis_aplicada?: number;
    descripcion_tratamiento?: string;
    fecha_evento?: Date;
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
    },
  ) {
    return prisma.eventos_sanitarios.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.eventos_sanitarios.delete({ where: { id } });
  }
}
