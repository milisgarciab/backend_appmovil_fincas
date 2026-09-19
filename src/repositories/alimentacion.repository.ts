import { prisma } from '../config/prisma';

export interface AlimentacionFiltros {
  animal_id?: number;
}

export class AlimentacionRepository {
  findAll(filtros: AlimentacionFiltros) {
    return prisma.alimentacion.findMany({
      where: { animal_id: filtros.animal_id },
      orderBy: { fecha: 'desc' },
    });
  }

  findById(id: number) {
    return prisma.alimentacion.findUnique({ where: { id } });
  }

  create(data: { animal_id: number; tipo_alimento: string; cantidad: number; unidad: string; fecha?: Date }) {
    return prisma.alimentacion.create({ data });
  }

  update(
    id: number,
    data: Partial<{ tipo_alimento: string; cantidad: number; unidad: string; fecha: Date }>,
  ) {
    return prisma.alimentacion.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.alimentacion.delete({ where: { id } });
  }

  animalExiste(animalId: number) {
    return prisma.animales.findUnique({ where: { id: animalId } });
  }
}